/**
 * Utilitário central de observabilidade de erros (Front-end e Back-end Scripts).
 * Captura, sanitiza, aplica rate-limit/desduplicação e persiste erros na coleção `error_logs` do Firestore.
 */

export const ERROR_SOURCES = ['frontend', 'backend:functions', 'backend:scripts'];
export const ERROR_CATEGORIES = [
  'runtime',
  'promise',
  'router',
  'chunk',
  'firestore',
  'network',
  'smtp',
  'script',
  'sw'
];
export const ERROR_SEVERITIES = ['error', 'warning', 'critical'];

export const MAX_ERRORS_PER_SESSION = 10;

export const FIELD_LIMITS = {
  message: 1000,
  stack: 4000,
  route_or_task: 300,
  fingerprint: 128,
  context: 2000,
  user_agent: 300,
  created_at: 40
};

const BOT_UA_REGEX = /bot|crawler|spider|Googlebot|bingbot|facebookexternalhit|HeadlessChrome|Lighthouse/i;
const NETWORK_ERR_REGEX = /failed to fetch|networkerror|network request failed|load failed|offline|unavailable|err_internet_disconnected|importing a module script failed|error loading dynamically imported module/i;

const seenFingerprints = new Set();
let sessionErrorCount = 0;
let isReporting = false;

/**
 * Reinicia o estado de sessão do reporter (útil para testes automatizados).
 */
export function resetErrorReporterState() {
  seenFingerprints.clear();
  sessionErrorCount = 0;
  isReporting = false;
}

/**
 * Retorna estatísticas atuais da sessão de captura.
 */
export function getErrorReporterStats() {
  return {
    sessionErrorCount,
    uniqueFingerprintsCount: seenFingerprints.size
  };
}

/**
 * Remove dados pessoais sensíveis (e-mails, tokens, senhas, chaves) de uma string (RNF04 / CA16).
 * @param {unknown} input
 * @returns {string}
 */
export function sanitizeSensitiveText(input) {
  if (input === null || input === undefined) return '';
  const text = typeof input === 'string' ? input : String(input);
  if (!text) return '';

  return text
    // 1. Mascarar cabeçalhos Bearer primeiro (ex.: Authorization: Bearer <token>)
    .replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    // 2. Mascarar parâmetros de URL ou pares chave=valor / chave: valor sensíveis
    .replace(
      /\b(token|access_token|refresh_token|id_token|password|pass|passwd|secret|api_key|apikey|authorization|auth|credentials)\b(\s*[=:]\s*['"]?)(?!Bearer\b)([^'"&\s,}\]]+)/gi,
      '$1$2[REDACTED]'
    )
    // 3. Mascarar endereços de e-mail
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
}

/**
 * Trunca uma string com segurança para respeitar os limites do Firestore (RNF05 / CA05).
 * @param {unknown} value
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateField(value, maxLength) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : String(value);
  if (str.length <= maxLength) return str;
  if (maxLength <= 3) return str.slice(0, maxLength);
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Calcula um hash FNV-1a determinístico para agrupamento (`fingerprint`) de erros similares.
 * @param {Object} params
 * @param {string} params.source
 * @param {string} params.category
 * @param {string} params.message
 * @param {string} params.route_or_task
 * @returns {string}
 */
export function computeErrorFingerprint({ source = 'frontend', category = 'runtime', message = '', route_or_task = '/' } = {}) {
  const normalizedMessage = String(message || '')
    .replace(/\b\d+\b/g, '#')
    .trim()
    .slice(0, 200);
  const rawKey = `${source}|${category}|${route_or_task}|${normalizedMessage}`;

  let hash = 0x811c9dc5;
  for (let i = 0; i < rawKey.length; i++) {
    hash ^= rawKey.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const hex = hash.toString(16).padStart(8, '0');
  const cleanRoute = String(route_or_task || '/')
    .replace(/[^a-zA-Z0-9/_:-]/g, '')
    .slice(0, 48) || '/';

  return truncateField(`${source}:${category}:${cleanRoute}:${hex}`, FIELD_LIMITS.fingerprint);
}

/**
 * Verifica se o User-Agent pertence a um bot ou crawler conhecido (RF05 / CA07).
 * @param {string} [ua='']
 * @returns {boolean}
 */
export function isBotUserAgent(ua = '') {
  if (!ua || typeof ua !== 'string') return false;
  return BOT_UA_REGEX.test(ua);
}

/**
 * Verifica se o erro ocorreu apenas por falta de conexão com a internet no cliente (RF05 / CA07).
 * @param {unknown} error
 * @param {Object} [options]
 * @param {boolean} [options.isOnline]
 * @param {string} [options.category]
 * @returns {boolean}
 */
export function isExpectedOfflineError(error, { isOnline, category } = {}) {
  const onlineState = typeof isOnline === 'boolean'
    ? isOnline
    : (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true);

  if (onlineState !== false) return false;

  if (category === 'network' || category === 'chunk' || category === 'firestore') {
    return true;
  }

  const msg = String(error?.message || error || '');
  return NETWORK_ERR_REGEX.test(msg) || onlineState === false;
}

/**
 * Serializa e sanitiza o objeto de contexto adicional garantindo o tamanho máximo.
 * @param {unknown} context
 * @returns {string}
 */
export function serializeErrorContext(context) {
  if (!context) return '{}';
  try {
    const rawJson = typeof context === 'string' ? context : JSON.stringify(context);
    const sanitized = sanitizeSensitiveText(rawJson);
    return truncateField(sanitized, FIELD_LIMITS.context);
  } catch {
    return '{}';
  }
}

/**
 * Constrói o documento padronizado e validado para a coleção `error_logs` (RF04, CA05, CA16).
 * @param {unknown} error
 * @param {Object} [options]
 * @returns {Object}
 */
export function buildErrorLogPayload(error, options = {}) {
  const rawSource = options.source || 'frontend';
  const source = ERROR_SOURCES.includes(rawSource) ? rawSource : 'frontend';

  const rawCategory = options.category || 'runtime';
  const category = ERROR_CATEGORIES.includes(rawCategory) ? rawCategory : 'runtime';

  const rawSeverity = options.severity || 'error';
  const severity = ERROR_SEVERITIES.includes(rawSeverity) ? rawSeverity : 'error';

  let rawMessage = '';
  let rawStack = '';

  if (error instanceof Error) {
    rawMessage = error.message || error.name || 'Error';
    rawStack = error.stack || '';
  } else if (error && typeof error === 'object') {
    rawMessage = error.message || error.reason || JSON.stringify(error);
    rawStack = error.stack || '';
  } else {
    rawMessage = String(error || 'Unknown error');
  }

  const sanitizedMessage = sanitizeSensitiveText(rawMessage).trim() || 'Unknown error';
  const message = truncateField(sanitizedMessage, FIELD_LIMITS.message);

  const sanitizedStack = sanitizeSensitiveText(rawStack);
  const stack = truncateField(sanitizedStack, FIELD_LIMITS.stack);

  let defaultRoute = '/';
  if (typeof window !== 'undefined' && window.location) {
    defaultRoute = (window.location.pathname || '/') + (window.location.search || '');
  }

  const rawRouteOrTask = options.route_or_task || options.route || options.task || defaultRoute || '/';
  const sanitizedRoute = sanitizeSensitiveText(rawRouteOrTask).trim() || '/';
  const route_or_task = truncateField(sanitizedRoute, FIELD_LIMITS.route_or_task);

  const defaultUa = typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '';
  const rawUa = options.user_agent !== undefined ? options.user_agent : defaultUa;
  const user_agent = truncateField(sanitizeSensitiveText(rawUa), FIELD_LIMITS.user_agent);

  const context = serializeErrorContext(options.context);

  const fingerprint = options.fingerprint
    ? truncateField(sanitizeSensitiveText(options.fingerprint), FIELD_LIMITS.fingerprint)
    : computeErrorFingerprint({ source, category, message, route_or_task });

  const nowDate = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  const isoDate = !isNaN(nowDate.getTime()) ? nowDate.toISOString() : new Date().toISOString();
  const created_at = truncateField(isoDate, FIELD_LIMITS.created_at);

  return {
    source,
    category,
    severity,
    message,
    stack,
    route_or_task,
    fingerprint,
    context,
    user_agent,
    status: 'open',
    created_at
  };
}

/**
 * Registra um erro de forma assíncrona e fail-safe na coleção `error_logs` do Firestore.
 * Nunca lança exceção nem entra em recursão caso a gravação falhe (RNF02 / CA15).
 *
 * @param {unknown} error
 * @param {Object} [options]
 * @returns {Promise<{ sent: boolean, reason?: string, payload?: Object }>}
 */
export async function reportError(error, options = {}) {
  if (isReporting) {
    return { sent: false, reason: 'reentrant' };
  }

  isReporting = true;
  try {
    const source = options.source || 'frontend';
    const category = options.category || 'runtime';

    const ua = options.user_agent !== undefined
      ? options.user_agent
      : (typeof navigator !== 'undefined' ? navigator.userAgent || '' : '');

    if (source === 'frontend' && isBotUserAgent(ua)) {
      return { sent: false, reason: 'bot' };
    }

    if (source === 'frontend' && isExpectedOfflineError(error, { isOnline: options.isOnline, category })) {
      return { sent: false, reason: 'offline' };
    }

    const payload = buildErrorLogPayload(error, { ...options, source, category, user_agent: ua });

    if (source === 'frontend' && options.skipSessionLimits !== true) {
      if (seenFingerprints.has(payload.fingerprint)) {
        return { sent: false, reason: 'duplicate', payload };
      }
      if (sessionErrorCount >= MAX_ERRORS_PER_SESSION) {
        return { sent: false, reason: 'rate_limit', payload };
      }
      seenFingerprints.add(payload.fingerprint);
      sessionErrorCount += 1;
    }

    let addDocFn = options.addDocFn;
    let collectionFn = options.collectionFn;
    let dbInstance = options.dbInstance;

    if (!addDocFn || !collectionFn) {
      const firestoreModule = await import('firebase/firestore');
      addDocFn = addDocFn || firestoreModule.addDoc;
      collectionFn = collectionFn || firestoreModule.collection;
    }

    if (!dbInstance) {
      const firebaseModule = await import('./firebase.js');
      dbInstance = firebaseModule.db;
    }

    if (!dbInstance || !addDocFn || !collectionFn) {
      return { sent: false, reason: 'no_db', payload };
    }

    await addDocFn(collectionFn(dbInstance, 'error_logs'), payload);
    return { sent: true, payload };
  } catch {
    // RNF02 & CA15: Absorve silenciosamente qualquer falha de rede/permissão sem recursão
    return { sent: false, reason: 'write_failed' };
  } finally {
    isReporting = false;
  }
}

/**
 * Inicializa os listeners globais de erros não tratados (`error` e `unhandledrejection`) no navegador (RF01 / CA01).
 *
 * @param {Window} [targetWindow=window]
 * @param {Object} [options]
 * @param {Function} [options.reportFn=reportError]
 */
export function initGlobalErrorTracking(
  targetWindow = typeof window !== 'undefined' ? window : null,
  options = {}
) {
  if (!targetWindow || typeof targetWindow.addEventListener !== 'function') return;

  const reportFn = options.reportFn || reportError;

  if (targetWindow.__errorObservabilityOnError) {
    targetWindow.removeEventListener('error', targetWindow.__errorObservabilityOnError);
  }
  if (targetWindow.__errorObservabilityOnRejection) {
    targetWindow.removeEventListener('unhandledrejection', targetWindow.__errorObservabilityOnRejection);
  }

  targetWindow.__errorObservabilityOnError = (event) => {
    try {
      const errObj = event?.error || new Error(event?.message || 'Uncaught window error');
      const context = {};
      if (event?.filename) context.filename = event.filename;
      if (typeof event?.lineno === 'number') context.lineno = event.lineno;
      if (typeof event?.colno === 'number') context.colno = event.colno;

      reportFn(errObj, {
        source: 'frontend',
        category: 'runtime',
        severity: 'error',
        context
      });
    } catch {
      // fail-safe
    }
  };

  targetWindow.__errorObservabilityOnRejection = (event) => {
    try {
      const reason = event?.reason;
      const errObj = reason instanceof Error
        ? reason
        : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason || 'Unhandled Promise rejection'));

      reportFn(errObj, {
        source: 'frontend',
        category: 'promise',
        severity: 'error',
        context: { type: 'unhandledrejection' }
      });
    } catch {
      // fail-safe
    }
  };

  targetWindow.addEventListener('error', targetWindow.__errorObservabilityOnError);
  targetWindow.addEventListener('unhandledrejection', targetWindow.__errorObservabilityOnRejection);
}
