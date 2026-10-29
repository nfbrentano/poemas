import { db } from './firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos

let cachedPoems = null;
let cacheTimestamp = 0;
let inflightPromise = null;
let cacheEnabled = !(typeof process !== 'undefined' && process.env?.VITEST);

/**
 * Permite habilitar ou desabilitar explicitamente o cache em memória (útil em testes unitários).
 * @param {boolean} enabled
 */
export function setPoemsCacheEnabled(enabled) {
  cacheEnabled = Boolean(enabled);
}

/**
 * Limpa o cache de poemas publicados em memória e qualquer requisição em andamento.
 */
export function invalidatePoemsCache() {
  cachedPoems = null;
  cacheTimestamp = 0;
  inflightPromise = null;
}

/**
 * Retorna a lista de poemas publicados ordenada por published_at decrescente,
 * reutilizando o cache da sessão e deduplicando chamadas concorrentes.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<Array<object>>}
 */
export async function getPublishedPoems({ forceRefresh = false } = {}) {
  const now = Date.now();

  if (cacheEnabled && !forceRefresh && cachedPoems && (now - cacheTimestamp < DEFAULT_TTL_MS)) {
    return cachedPoems.map(p => ({ ...p }));
  }

  if (cacheEnabled && !forceRefresh && inflightPromise) {
    const list = await inflightPromise;
    return list.map(p => ({ ...p }));
  }

  const fetchTask = (async () => {
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    const poems = [];

    if (snapshot && Array.isArray(snapshot.docs)) {
      snapshot.docs.forEach(doc => {
        poems.push({ id: doc.id, ...doc.data() });
      });
    } else if (snapshot && typeof snapshot.forEach === 'function') {
      snapshot.forEach(doc => {
        poems.push({ id: doc.id, ...doc.data() });
      });
    }

    poems.sort((a, b) => {
      const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    if (cacheEnabled) {
      cachedPoems = poems;
      cacheTimestamp = Date.now();
    }

    return poems;
  })();

  if (cacheEnabled && !forceRefresh) {
    inflightPromise = fetchTask;
    try {
      const list = await fetchTask;
      return list.map(p => ({ ...p }));
    } finally {
      if (inflightPromise === fetchTask) {
        inflightPromise = null;
      }
    }
  }

  const list = await fetchTask;
  return list.map(p => ({ ...p }));
}
