import { db } from './firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos
const DB_NAME = 'poemas_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'acervo';
const POEMS_RECORD_KEY = 'published_poems';
const LOCAL_STORAGE_KEY = 'poemas_offline_acervo_v1';

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
 * Abre o IndexedDB de forma resiliente para armazenamento offline.
 * @returns {Promise<IDBDatabase|null>}
 */
function openIndexedDb() {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const idb = event.target.result;
        if (!idb.objectStoreNames.contains(STORE_NAME)) {
          idb.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Salva a lista de poemas no IndexedDB (se disponível).
 * @param {Array<object>} poems
 * @returns {Promise<boolean>}
 */
async function saveToIndexedDb(poems) {
  const idb = await openIndexedDb();
  if (!idb) return false;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(poems, POEMS_RECORD_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Lê os poemas persistidos do IndexedDB.
 * @returns {Promise<Array<object>|null>}
 */
async function readFromIndexedDb() {
  const idb = await openIndexedDb();
  if (!idb) return null;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(POEMS_RECORD_KEY);
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Salva no localStorage como camada síncrona / fallback de contingência.
 * @param {Array<object>} poems
 * @returns {boolean}
 */
function saveToLocalStorage(poems) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(poems));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lê poemas do localStorage.
 * @returns {Array<object>|null}
 */
function readFromLocalStorage() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Persiste o acervo localmente garantindo conformidade com RNF01 (≤ 5MB),
 * RNF03/CA09 (apenas status 'published') e RNF04/CA10 (falha local não quebra a app).
 * @param {Array<object>} poems
 * @returns {Promise<boolean>}
 */
export async function savePersistentPoems(poems) {
  if (!Array.isArray(poems)) return false;
  // RNF03 & CA09: Rascunhos e agendados NUNCA são armazenados localmente
  const publishedOnly = poems
    .filter(p => p && p.status !== 'draft' && p.status !== 'scheduled')
    .map(p => ({ ...p, status: p.status || 'published' }));
  try {
    saveToLocalStorage(publishedOnly);
    await saveToIndexedDb(publishedOnly);
    return true;
  } catch {
    // RNF04 & CA10: Falha no storage local não impede o uso online
    return false;
  }
}

/**
 * Recupera o acervo salvo localmente para leitura offline.
 * Tenta IndexedDB primeiro, depois localStorage.
 * @returns {Promise<Array<object>|null>}
 */
export async function getPersistentPoems() {
  try {
    const fromIdb = await readFromIndexedDb();
    if (fromIdb && fromIdb.length > 0) {
      return fromIdb;
    }
    const fromLs = readFromLocalStorage();
    if (fromLs && fromLs.length > 0) {
      return fromLs;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Limpa o armazenamento persistente (útil em testes e resets).
 */
export async function clearPersistentPoems() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  }
  const idb = await openIndexedDb();
  if (idb) {
    try {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(POEMS_RECORD_KEY);
    } catch {}
  }
}

/**
 * Busca um poema específico no acervo por slug (usando cache/storage local).
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getPoemBySlug(slug) {
  if (!slug) return null;
  try {
    const poems = await getPublishedPoems();
    return poems.find(p => p.slug === slug) || null;
  } catch {
    const fallback = await getPersistentPoems();
    return fallback ? (fallback.find(p => p.slug === slug) || null) : null;
  }
}

/**
 * Retorna a lista de poemas publicados ordenada por published_at decrescente,
 * reutilizando o cache da sessão e persistindo no storage local para leitura offline.
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

  // Se explicitamente offline, recorre imediatamente ao storage local
  if (typeof navigator !== 'undefined' && navigator.onLine === false && !forceRefresh) {
    const local = await getPersistentPoems();
    if (local && local.length > 0) {
      if (cacheEnabled) {
        cachedPoems = local;
        cacheTimestamp = now;
      }
      return local.map(p => ({ ...p }));
    }
  }

  const fetchTask = (async () => {
    let poems = [];
    let fetchError = null;

    try {
      const q = query(
        collection(db, 'poems'),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);

      if (snapshot && Array.isArray(snapshot.docs)) {
        snapshot.docs.forEach(doc => {
          poems.push({ id: doc.id, ...doc.data() });
        });
      } else if (snapshot && typeof snapshot.forEach === 'function') {
        snapshot.forEach(doc => {
          poems.push({ id: doc.id, ...doc.data() });
        });
      }

      // RNF03: Garantir apenas poemas publicados (não rascunhos nem agendados)
      poems = poems.filter(p => p && p.status !== 'draft' && p.status !== 'scheduled');

      poems.sort((a, b) => {
        const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
    } catch (err) {
      fetchError = err;
    }

    // Se houve erro de rede ou se a consulta retornou vazia com erro, usa o storage local (CA01, CA02, CA10)
    if (fetchError || poems.length === 0) {
      const persistent = await getPersistentPoems();
      if (persistent && persistent.length > 0) {
        if (cacheEnabled) {
          cachedPoems = persistent;
          cacheTimestamp = Date.now();
        }
        return persistent;
      }
      if (fetchError) throw fetchError;
    }

    if (cacheEnabled) {
      cachedPoems = poems;
      cacheTimestamp = Date.now();
    }

    // RNF02: Persiste em background assíncrono para não travar o LCP da Home
    if (poems.length > 0) {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          savePersistentPoems(poems).catch(() => {});
        });
      } else {
        setTimeout(() => {
          savePersistentPoems(poems).catch(() => {});
        }, 50);
      }
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
