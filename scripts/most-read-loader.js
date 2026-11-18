import { computeMostReadPoems, filterPublishedMostRead, MOST_READ_DAYS, MOST_READ_LIMIT } from '../src/utils/most-read.js';
import { installFirebaseNodeReferer, patchFirebaseAuthReferer } from './build-data-cache.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Loads the top most-read published poems for build-time generation (prerender and llms.txt).
 * Hybrid strategy (D01):
 * 1. When admin credentials are present, signs in and reads `page_views` directly.
 * 2. Otherwise (or on failure), falls back to the public aggregated `site_settings/most_read` document.
 * 3. On any failure, logs a warning and returns `[]` without breaking the build (RNF04, CA09).
 *
 * @param {object} [options]
 * @returns {Promise<Array<{ position: number, id: string, slug: string, title: string, published_at: string|null }>>}
 */
export async function loadMostReadForBuild({
  db,
  auth = null,
  poems = [],
  adminEmail = process.env.FIREBASE_ADMIN_EMAIL,
  adminPassword = process.env.FIREBASE_ADMIN_PASSWORD,
  days = MOST_READ_DAYS,
  limit = MOST_READ_LIMIT,
  now = new Date(),
  warn = console.warn,
  signInFn = null,
  collectionFn = null,
  queryFn = null,
  whereFn = null,
  orderByFn = null,
  limitFn = null,
  getDocsFn = null,
  docFn = null,
  getDocFn = null
} = {}) {
  if (!db || !Array.isArray(poems) || poems.length === 0) {
    return [];
  }

  let cFn = collectionFn;
  let qFn = queryFn;
  let wFn = whereFn;
  let oFn = orderByFn;
  let lFn = limitFn;
  let gDocs = getDocsFn;
  let dFn = docFn;
  let gDoc = getDocFn;

  if (!cFn || !qFn || !wFn || !oFn || !lFn || !gDocs || !dFn || !gDoc) {
    const firestore = await import('firebase/firestore');
    cFn = cFn || firestore.collection;
    qFn = qFn || firestore.query;
    wFn = wFn || firestore.where;
    oFn = oFn || firestore.orderBy;
    lFn = lFn || firestore.limit;
    gDocs = gDocs || firestore.getDocs;
    dFn = dFn || firestore.doc;
    gDoc = gDoc || firestore.getDoc;
  }

  const nowDate = now instanceof Date ? now : new Date(now);
  const nowMs = Number.isNaN(nowDate.getTime()) ? Date.now() : nowDate.getTime();

  let directSucceeded = false;
  let mostRead = [];

  if (adminEmail && adminPassword && (auth || signInFn)) {
    try {
      installFirebaseNodeReferer();
      if (auth) {
        patchFirebaseAuthReferer(auth);
      }
      let sIn = signInFn;
      if (!sIn) {
        const firebaseAuth = await import('firebase/auth');
        sIn = firebaseAuth.signInWithEmailAndPassword;
      }

      if (!auth?.currentUser) {
        await sIn(auth, adminEmail, adminPassword);
      }

      const sinceIso = new Date(nowMs - Math.max(0, days) * DAY_MS).toISOString();
      const qRecent = qFn(
        cFn(db, 'page_views'),
        wFn('created_at', '>=', sinceIso),
        oFn('created_at', 'desc'),
        lFn(5000)
      );
      const snapRecent = await gDocs(qRecent);
      const viewsRecent = (snapRecent?.docs || []).map(d => d.data());

      mostRead = computeMostReadPoems({
        poems,
        pageViews: viewsRecent,
        days,
        limit,
        now: nowMs
      });

      if (mostRead.length < limit) {
        const qOlder = qFn(
          cFn(db, 'page_views'),
          wFn('created_at', '<', sinceIso),
          oFn('created_at', 'desc'),
          lFn(10000)
        );
        const snapOlder = await gDocs(qOlder);
        const viewsOlder = (snapOlder?.docs || []).map(d => d.data());

        mostRead = computeMostReadPoems({
          poems,
          pageViews: [...viewsRecent, ...viewsOlder],
          days,
          limit,
          now: nowMs
        });
      }

      directSucceeded = true;
    } catch (err) {
      warn('[Most Read] Aviso: falha ao ler page_views autenticado; tentando fallback em site_settings/most_read:', err?.message || err);
    }
  }

  if (!directSucceeded) {
    try {
      const settingsRef = dFn(db, 'site_settings', 'most_read');
      const settingsSnap = await gDoc(settingsRef);
      const exists = settingsSnap && (typeof settingsSnap.exists === 'function' ? settingsSnap.exists() : Boolean(settingsSnap.data?.()));
      if (exists) {
        const data = settingsSnap.data() || {};
        const rawPoems = Array.isArray(data.poems) ? data.poems : [];
        mostRead = filterPublishedMostRead(rawPoems, poems, limit);
      }
    } catch (err) {
      warn('[Most Read] Aviso: falha ao ler dados de poemas mais lidos:', err?.message || err);
      return [];
    }
  }

  return mostRead;
}
