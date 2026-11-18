import fs from 'fs';
import path from 'path';

export const DEFAULT_SITE_REFERER = 'https://nfgbrentano.art.br/';
export const DEFAULT_CACHE_PATH = path.resolve(process.cwd(), 'node_modules', '.cache', 'poemas-build-data.json');
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

const FIREBASE_HOST_SUFFIXES = [
  '.googleapis.com',
  'googleapis.com',
  '.firebaseio.com',
  '.cloudfunctions.net',
  '.run.app'
];

/**
 * Lê dinamicamente a configuração do Firebase a partir do ambiente em tempo de execução.
 * Evita capturar valores obsoletos no carregamento do módulo (ex.: quando testes limpam env vars).
 *
 * @param {Record<string, string|undefined>} [env=process.env]
 * @returns {object}
 */
export function getFirebaseConfig(env = process.env) {
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };
}

/**
 * Normaliza a URL usada no cabeçalho `Referer` com barra final.
 *
 * @param {string} [referer]
 * @returns {string}
 */
export function normalizeRefererUrl(referer) {
  const raw = typeof referer === 'string' && referer.trim() ? referer.trim() : DEFAULT_SITE_REFERER;
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function isFirebaseOrGoogleUrl(input) {
  let rawUrl = '';
  if (typeof input === 'string') {
    rawUrl = input;
  } else if (input && typeof input.url === 'string') {
    rawUrl = input.url;
  } else if (input instanceof URL) {
    rawUrl = input.href;
  }
  if (!rawUrl) return false;

  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    return FIREBASE_HOST_SUFFIXES.some(suffix => (
      suffix.startsWith('.') ? hostname.endsWith(suffix) : hostname === suffix
    ));
  } catch {
    return false;
  }
}

function hasHeaderCaseInsensitive(headers, name) {
  if (!headers) return false;
  const target = name.toLowerCase();
  if (typeof headers.has === 'function') {
    return headers.has(target) || headers.has(name);
  }
  if (Array.isArray(headers)) {
    return headers.some(([k]) => String(k).toLowerCase() === target);
  }
  if (typeof headers === 'object') {
    return Object.keys(headers).some(k => k.toLowerCase() === target);
  }
  return false;
}

function withRefererHeader(headers, referer) {
  if (!headers) {
    return { Referer: referer };
  }
  if (hasHeaderCaseInsensitive(headers, 'referer')) {
    return headers;
  }
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const cloned = new Headers(headers);
    cloned.set('Referer', referer);
    return cloned;
  }
  if (Array.isArray(headers)) {
    return [...headers, ['Referer', referer]];
  }
  return { ...headers, Referer: referer };
}

/**
 * Garante o envio de `Referer` em requisições Node `fetch` para APIs Google/Firebase.
 * Necessário quando a API key pública possui restrição de HTTP Referer.
 *
 * @param {string} [referer]
 */
export function installFirebaseNodeReferer(referer = process.env.SITE_URL || DEFAULT_SITE_REFERER) {
  const normalized = normalizeRefererUrl(referer);
  globalThis.__firebaseNodeReferer = normalized;

  if (typeof globalThis.fetch !== 'function') {
    return;
  }
  if (globalThis.fetch.__isFirebaseRefererWrapped) {
    return;
  }

  const baseFetch = globalThis.fetch;
  globalThis.__originalFirebaseNodeFetch = baseFetch;

  const wrappedFetch = async (input, init) => {
    const activeReferer = globalThis.__firebaseNodeReferer || DEFAULT_SITE_REFERER;
    if (!isFirebaseOrGoogleUrl(input)) {
      return baseFetch(input, init);
    }

    const requestHasReferer = typeof Request !== 'undefined' &&
      input instanceof Request &&
      hasHeaderCaseInsensitive(input.headers, 'referer');

    if (requestHasReferer) {
      return baseFetch(input, init);
    }

    const nextInit = init ? { ...init } : {};
    nextInit.headers = withRefererHeader(init?.headers, activeReferer);
    return baseFetch(input, nextInit);
  };

  wrappedFetch.__isFirebaseRefererWrapped = true;
  globalThis.fetch = wrappedFetch;
}

/**
 * Injeta o cabeçalho `Referer` também via `_getAdditionalHeaders` da instância Firebase Auth.
 *
 * @param {object} auth
 * @param {string} [referer]
 * @returns {object}
 */
export function patchFirebaseAuthReferer(auth, referer = process.env.SITE_URL || DEFAULT_SITE_REFERER) {
  const normalized = normalizeRefererUrl(referer);
  if (!auth || typeof auth._getAdditionalHeaders !== 'function') {
    return auth;
  }

  if (!auth.__refererPatched) {
    const originalGetHeaders = auth._getAdditionalHeaders.bind(auth);
    auth._getAdditionalHeaders = async () => {
      const headers = (await originalGetHeaders()) || {};
      const activeReferer = auth.__customNodeReferer || normalized;
      if (!hasHeaderCaseInsensitive(headers, 'referer')) {
        headers.Referer = activeReferer;
      }
      return headers;
    };
    auth.__refererPatched = true;
  }

  auth.__customNodeReferer = normalized;
  return auth;
}

function isCacheEnabled(forceEnableInTest) {
  if (typeof process !== 'undefined' && process.env?.VITEST && !forceEnableInTest) {
    return false;
  }
  return true;
}

/**
 * Lê dados de build em cache se existentes, válidos e dentro do TTL.
 *
 * @param {object} [options]
 * @returns {object|null}
 */
export function readBuildDataCache({
  cachePath = DEFAULT_CACHE_PATH,
  ttlMs = DEFAULT_CACHE_TTL_MS,
  now = Date.now(),
  forceEnableInTest = false
} = {}) {
  if (!isCacheEnabled(forceEnableInTest)) {
    return null;
  }

  try {
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    const raw = fs.readFileSync(cachePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (typeof parsed.timestamp !== 'number' || (now - parsed.timestamp) > ttlMs) {
      return null;
    }
    if (!Array.isArray(parsed.poems) || parsed.poems.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Grava/mescla dados coletados do Firestore em cache temporário para reutilização entre scripts de build.
 *
 * @param {object} payload
 * @param {object} [options]
 * @returns {boolean}
 */
export function writeBuildDataCache(payload, {
  cachePath = DEFAULT_CACHE_PATH,
  ttlMs = DEFAULT_CACHE_TTL_MS,
  now = Date.now(),
  forceEnableInTest = false
} = {}) {
  if (!isCacheEnabled(forceEnableInTest) || !payload || typeof payload !== 'object') {
    return false;
  }

  try {
    const existing = readBuildDataCache({ cachePath, ttlMs, now, forceEnableInTest: true }) || {};
    const merged = {
      ...existing,
      ...payload,
      timestamp: now
    };
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(merged), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove o arquivo de cache temporário de build.
 *
 * @param {object} [options]
 */
export function clearBuildDataCache({ cachePath = DEFAULT_CACHE_PATH } = {}) {
  try {
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
  } catch {
    // ignore cleanup errors
  }
}
