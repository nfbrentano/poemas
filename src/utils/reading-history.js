/**
 * Gerenciador de histórico de leitura local ("Continuar Lendo") (RF03, RNF01, CA04, CA05, CA06, CA07).
 * Opera 100% no cliente via localStorage, com tolerância total a falhas de cota/navegação anônima.
 */

export const READING_HISTORY_KEY = 'poemas_reading_history_v1';
export const MAX_HISTORY_ITEMS = 8;

/**
 * Obtém o histórico de poemas lidos ordenado do mais recente para o mais antigo.
 *
 * @returns {Array<{ slug: string, title: string, readAt: string }>}
 */
export function getReadingHistory() {
  try {
    const raw = localStorage.getItem(READING_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && typeof item === 'object' && typeof item.slug === 'string');
  } catch (err) {
    console.warn('[ReadingHistory] Falha ao ler histórico do localStorage:', err);
    return [];
  }
}

/**
 * Registra a leitura de um poema no histórico local (RF03, CA04, CA05, CA07).
 * Deduplica registros anteriores do mesmo slug e limita a no máximo 8 itens mais recentes.
 *
 * @param {object} params
 * @param {string} params.slug
 * @param {string} params.title
 * @returns {Array<{ slug: string, title: string, readAt: string }>}
 */
export function recordReading({ slug, title }) {
  if (!slug || typeof slug !== 'string') return getReadingHistory();

  try {
    const cleanSlug = slug.trim();
    if (!cleanSlug) return getReadingHistory();

    const existing = getReadingHistory();
    const filtered = existing.filter(item => item.slug !== cleanSlug);

    const newItem = {
      slug: cleanSlug,
      title: title && typeof title === 'string' ? title.trim() : 'Sem título',
      readAt: new Date().toISOString()
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[ReadingHistory] Falha ao salvar leitura no localStorage:', err);
    return getReadingHistory();
  }
}

/**
 * Remove um poema específico do histórico de leitura.
 *
 * @param {string} slug
 * @returns {Array<{ slug: string, title: string, readAt: string }>}
 */
export function removeReadingItem(slug) {
  if (!slug) return getReadingHistory();

  try {
    const cleanSlug = slug.trim();
    const existing = getReadingHistory();
    const updated = existing.filter(item => item.slug !== cleanSlug);
    localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[ReadingHistory] Falha ao remover item do histórico:', err);
    return getReadingHistory();
  }
}

/**
 * Limpa todo o histórico de leitura do localStorage (RF04, CA06).
 *
 * @returns {boolean}
 */
export function clearReadingHistory() {
  try {
    localStorage.removeItem(READING_HISTORY_KEY);
    return true;
  } catch (err) {
    console.warn('[ReadingHistory] Falha ao limpar histórico do localStorage:', err);
    return false;
  }
}
