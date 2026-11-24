import { computeMostReadPoems, MOST_READ_DAYS, MOST_READ_LIMIT } from '../../utils/most-read.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Computes the top most-read published poems and updates the public aggregated
 * `site_settings/most_read` document (without view counts) when executed by an authenticated admin.
 * Acts as the fallback source for builds when CI admin credentials are absent (D01).
 *
 * @param {object} [options]
 * @returns {Promise<{ synced: boolean, poems: Array<object> }>}
 */
export async function syncMostReadSetting({
  dbInstance = null,
  poems = null,
  recentViews = null,
  days = MOST_READ_DAYS,
  limit = MOST_READ_LIMIT,
  now = new Date(),
  collectionFn = null,
  queryFn = null,
  whereFn = null,
  orderByFn = null,
  limitFn = null,
  getDocsFn = null,
  docFn = null,
  setDocFn = null
} = {}) {
  try {
    let db = dbInstance;
    if (!db) {
      const fb = await import('../../utils/firebase.js');
      db = fb.db;
    }
    if (!db) return { synced: false, poems: [] };

    let cFn = collectionFn;
    let qFn = queryFn;
    let wFn = whereFn;
    let oFn = orderByFn;
    let lFn = limitFn;
    let gDocs = getDocsFn;
    let dFn = docFn;
    let sDoc = setDocFn;

    if (!cFn || !qFn || !wFn || !oFn || !lFn || !gDocs || !dFn || !sDoc) {
      const firestore = await import('firebase/firestore');
      cFn = cFn || firestore.collection;
      qFn = qFn || firestore.query;
      wFn = wFn || firestore.where;
      oFn = oFn || firestore.orderBy;
      lFn = lFn || firestore.limit;
      gDocs = gDocs || firestore.getDocs;
      dFn = dFn || firestore.doc;
      sDoc = sDoc || firestore.setDoc;
    }

    const nowDate = now instanceof Date ? now : new Date(now);
    const nowMs = Number.isNaN(nowDate.getTime()) ? Date.now() : nowDate.getTime();
    const validNow = new Date(nowMs);

    let publishedPoems = Array.isArray(poems)
      ? poems.filter(p => p && p.status === 'published')
      : [];

    if (publishedPoems.length === 0) {
      const poemsSnap = await gDocs(qFn(cFn(db, 'poems'), wFn('status', '==', 'published')));
      publishedPoems = (poemsSnap?.docs || []).map(d => ({ id: d.id, ...d.data() }));
    }

    if (publishedPoems.length === 0) {
      return { synced: false, poems: [] };
    }

    const sinceIso = new Date(nowMs - Math.max(0, days) * DAY_MS).toISOString();
    let viewsToProcess = Array.isArray(recentViews) ? recentViews : null;
    if (!viewsToProcess) {
      const snapRecent = await gDocs(
        qFn(cFn(db, 'page_views'), wFn('created_at', '>=', sinceIso), oFn('created_at', 'desc'), lFn(5000))
      );
      viewsToProcess = (snapRecent?.docs || []).map(d => d.data());
    }

    let mostRead = computeMostReadPoems({
      poems: publishedPoems,
      pageViews: viewsToProcess,
      days,
      limit,
      now: nowMs
    });

    if (mostRead.length < limit) {
      const snapOlder = await gDocs(
        qFn(cFn(db, 'page_views'), wFn('created_at', '<', sinceIso), oFn('created_at', 'desc'), lFn(2500))
      );
      const viewsOlder = (snapOlder?.docs || []).map(d => d.data());
      mostRead = computeMostReadPoems({
        poems: publishedPoems,
        pageViews: [...viewsToProcess, ...viewsOlder],
        days,
        limit,
        now: nowMs
      });
    }

    const payload = {
      poems: mostRead.map(({ id, slug, title, published_at }) => ({
        id,
        slug,
        title,
        published_at: published_at || null
      })),
      updated_at: validNow.toISOString()
    };

    await sDoc(dFn(db, 'site_settings', 'most_read'), payload);
    return { synced: true, poems: mostRead };
  } catch (_err) {
    return { synced: false, poems: [] };
  }
}
