import { normalizeTag, tagToSlug, slugifyTag } from './tags.js';

export { tagToSlug, slugifyTag };

export const SITE_URL = 'https://nfgbrentano.art.br/';

/**
 * Ensures a URL has a trailing slash (unless it has a file extension like .xml).
 * @param {string} url
 * @returns {string}
 */
export function ensureTrailingSlash(url) {
  if (!url) return '';
  const [base, query] = url.split('?');
  const hasExt = /\.[a-z0-9]+$/i.test(base);
  let cleanBase = base;
  if (!hasExt && !cleanBase.endsWith('/')) {
    cleanBase += '/';
  }
  return query ? `${cleanBase}?${query}` : cleanBase;
}

/**
 * Parses any date value (string, Date, Firestore Timestamp) to YYYY-MM-DD.
 * @param {*} val
 * @returns {string|null}
 */
export function formatDateToYMD(val) {
  if (!val) return null;
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    return val.toDate().toISOString().split('T')[0];
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

/**
 * Returns the effective lastmod date for a poem: updated_at ?? published_at ?? created_at
 * @param {object} poem
 * @returns {string} YYYY-MM-DD
 */
export function getPoemLastMod(poem) {
  if (!poem) return new Date().toISOString().split('T')[0];
  const dateVal = poem.updated_at || poem.published_at || poem.created_at;
  return formatDateToYMD(dateVal) || new Date().toISOString().split('T')[0];
}


/**
 * Finds the maximum YYYY-MM-DD date in an array of dates.
 * @param {string[]} dates
 * @returns {string|null}
 */
export function maxDate(dates) {
  const valid = dates.filter(Boolean);
  if (valid.length === 0) return null;
  return valid.reduce((max, curr) => (curr > max ? curr : max), valid[0]);
}

/**
 * Builds the URL XML snippet for a given loc and optional lastmod.
 * Note: changefreq and priority are deliberately omitted (RF03).
 */
export function renderUrlXml(loc, lastmod) {
  const cleanLoc = ensureTrailingSlash(loc);
  if (lastmod) {
    return `  <url>\n    <loc>${cleanLoc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  }
  return `  <url>\n    <loc>${cleanLoc}</loc>\n  </url>`;
}

/**
 * Wraps URLs in a standard <urlset> document.
 */
export function wrapUrlSet(urlsXml) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;
}

/**
 * Builds sitemap-poemas.xml content.
 * Only includes poems with status === 'published'.
 * @param {object[]} poems
 * @param {string} baseUrl
 * @returns {{ xml: string, lastmod: string|null, count: number }}
 */
export function buildPoemSitemap(poems = [], baseUrl = SITE_URL) {
  const publishedPoems = poems.filter(p => p.status === 'published' && p.slug);
  const items = publishedPoems.map(poem => {
    const loc = `${baseUrl}poema/${poem.slug}`;
    const lastmod = getPoemLastMod(poem);
    return { loc, lastmod };
  });

  const overallLastMod = maxDate(items.map(i => i.lastmod));
  const urlsXml = items.map(i => renderUrlXml(i.loc, i.lastmod)).join('\n');
  return {
    xml: wrapUrlSet(urlsXml),
    lastmod: overallLastMod,
    count: items.length
  };
}

/**
 * Builds sitemap-colecoes.xml content.
 * lastmod is the max lastmod among its published poems.
 * @param {object[]} collections
 * @param {object[]} collectionPoems Map relations { poem_id, collection_id }
 * @param {object[]} poems
 * @param {string} baseUrl
 * @returns {{ xml: string, lastmod: string|null, count: number }}
 */
export function buildCollectionSitemap(collections = [], collectionPoems = [], poems = [], baseUrl = SITE_URL) {
  const publishedPoemsMap = new Map();
  poems.filter(p => p.status === 'published').forEach(p => {
    publishedPoemsMap.set(p.id, p);
  });

  // Map collection_id -> array of published poems
  const colPoemsMap = new Map();
  collectionPoems.forEach(cp => {
    const poem = publishedPoemsMap.get(cp.poem_id);
    if (poem) {
      if (!colPoemsMap.has(cp.collection_id)) colPoemsMap.set(cp.collection_id, []);
      colPoemsMap.get(cp.collection_id).push(poem);
    }
  });

  const validCols = collections.filter(c => c && c.slug);
  const items = validCols.map(col => {
    const colPoems = colPoemsMap.get(col.id) || [];
    const poemDates = colPoems.map(p => getPoemLastMod(p));
    const lastmod = maxDate(poemDates) || formatDateToYMD(col.updated_at || col.created_at) || null;
    return {
      loc: `${baseUrl}colecao/${col.slug}`,
      lastmod
    };
  });

  const overallLastMod = maxDate(items.map(i => i.lastmod));
  const urlsXml = items.map(i => renderUrlXml(i.loc, i.lastmod)).join('\n');
  return {
    xml: wrapUrlSet(urlsXml),
    lastmod: overallLastMod,
    count: items.length
  };
}

/**
 * Builds sitemap-paginas.xml content.
 * Home: max lastmod of all published poems.
 * Static pages (sobre, colecoes): source file mtime or fallback.
 * @param {object} options
 * @param {string|null} options.homeLastMod
 * @param {Array<{ loc: string, lastmod?: string }>} options.staticPages
 * @param {string} baseUrl
 * @returns {{ xml: string, lastmod: string|null, count: number }}
 */
export function buildPagesSitemap({ homeLastMod = null, staticPages = [] } = {}, baseUrl = SITE_URL) {
  const items = [
    { loc: baseUrl, lastmod: homeLastMod },
    ...staticPages.map(sp => ({
      loc: sp.loc.startsWith('http') ? sp.loc : `${baseUrl}${sp.loc.replace(/^\//, '')}`,
      lastmod: sp.lastmod || null
    }))
  ];

  const overallLastMod = maxDate(items.map(i => i.lastmod));
  const urlsXml = items.map(i => renderUrlXml(i.loc, i.lastmod)).join('\n');
  return {
    xml: wrapUrlSet(urlsXml),
    lastmod: overallLastMod,
    count: items.length
  };
}

/**
 * Builds sitemap-sentimentos.xml content.
 * Groups published poems by sentiment slug.
 * lastmod is the max lastmod of poems with that sentiment.
 * @param {object[]} poems
 * @param {string} baseUrl
 * @param {number} minPoems Minimum poems to index a sentiment (RF07: default 3)
 * @returns {{ xml: string, lastmod: string|null, count: number }}
 */
export function buildSentimentsSitemap(poems = [], baseUrl = SITE_URL, minPoems = 3) {
  const publishedPoems = poems.filter(p => p.status === 'published');
  const sentimentMap = new Map();

  publishedPoems.forEach(poem => {
    const poemLastMod = getPoemLastMod(poem);
    const tags = Array.isArray(poem.tags) ? poem.tags : [];
    tags.forEach(tag => {
      const slug = tagToSlug(tag);
      if (!slug) return;
      if (!sentimentMap.has(slug)) {
        sentimentMap.set(slug, { slug, poems: [], dates: [] });
      }
      const entry = sentimentMap.get(slug);
      entry.poems.push(poem);
      entry.dates.push(poemLastMod);
    });
  });

  // Filter sentiments by minPoems threshold (or fallback if few)
  const qualifying = Array.from(sentimentMap.values())
    .filter(s => s.poems.length >= minPoems)
    .sort((a, b) => b.poems.length - a.poems.length || a.slug.localeCompare(b.slug));

  const items = [];
  if (qualifying.length > 0) {
    // /sentimentos/ hub page
    const allSentimentDates = qualifying.flatMap(q => q.dates);
    items.push({
      loc: `${baseUrl}sentimentos/`,
      lastmod: maxDate(allSentimentDates)
    });
  }

  qualifying.forEach(s => {
    items.push({
      loc: `${baseUrl}sentimento/${s.slug}/`,
      lastmod: maxDate(s.dates)
    });
  });

  const overallLastMod = maxDate(items.map(i => i.lastmod));
  const urlsXml = items.map(i => renderUrlXml(i.loc, i.lastmod)).join('\n');
  return {
    xml: wrapUrlSet(urlsXml),
    lastmod: overallLastMod,
    count: items.length
  };
}

/**
 * Builds the sitemapindex XML document.
 * @param {Array<{ loc: string, lastmod?: string|null }>} sitemaps
 * @param {string} baseUrl
 * @returns {string}
 */
export function buildSitemapIndex(sitemaps = [], baseUrl = SITE_URL) {
  const entries = sitemaps.map(s => {
    const loc = s.loc.startsWith('http') ? s.loc : `${baseUrl}${s.loc.replace(/^\//, '')}`;
    if (s.lastmod) {
      return `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`;
    }
    return `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}

/**
 * Generates all sitemaps and index.
 * Returns an object with { 'sitemap.xml': ..., 'sitemap-poemas.xml': ..., ... }
 */
export function generateAllSitemaps({
  baseUrl = SITE_URL,
  poems = [],
  collections = [],
  collectionPoems = [],
  staticPages = [],
  minPoemsPerSentiment = 3
} = {}) {
  const publishedPoems = poems.filter(p => p.status === 'published');
  const homeLastMod = maxDate(publishedPoems.map(p => getPoemLastMod(p)));

  const poemSitemap = buildPoemSitemap(poems, baseUrl);
  const colSitemap = buildCollectionSitemap(collections, collectionPoems, poems, baseUrl);
  const pagesSitemap = buildPagesSitemap({ homeLastMod, staticPages }, baseUrl);
  const sentSitemap = buildSentimentsSitemap(poems, baseUrl, minPoemsPerSentiment);

  const subSitemaps = [
    { loc: `${baseUrl}sitemap-paginas.xml`, lastmod: pagesSitemap.lastmod },
    { loc: `${baseUrl}sitemap-poemas.xml`, lastmod: poemSitemap.lastmod },
    { loc: `${baseUrl}sitemap-colecoes.xml`, lastmod: colSitemap.lastmod },
    { loc: `${baseUrl}sitemap-sentimentos.xml`, lastmod: sentSitemap.lastmod }
  ];

  const indexXml = buildSitemapIndex(subSitemaps, baseUrl);

  return {
    'sitemap.xml': indexXml,
    'sitemap-paginas.xml': pagesSitemap.xml,
    'sitemap-poemas.xml': poemSitemap.xml,
    'sitemap-colecoes.xml': colSitemap.xml,
    'sitemap-sentimentos.xml': sentSitemap.xml
  };
}
