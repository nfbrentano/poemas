import { escapeHtml } from './html.js';

export const MOST_READ_LIMIT = 5;
export const MOST_READ_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseTimeMs(value) {
  if (!value) return NaN;
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return d instanceof Date ? d.getTime() : NaN;
  }
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(ms) ? NaN : ms;
}

function getPublishedMs(poem) {
  const ms = parseTimeMs(poem?.published_at || poem?.created_at);
  return Number.isNaN(ms) ? 0 : ms;
}

function extractPoemSlugFromPage(page) {
  if (typeof page !== 'string') return '';
  const cleanPath = page.split(/[?#]/)[0].trim();
  if (!cleanPath.startsWith('/poema/')) return '';
  return cleanPath.replace(/^\/poema\//, '').replace(/\/+$/, '');
}

/**
 * Computes the top published poems ranked by views over the recent window,
 * falling back to all-time views to fill remaining slots (RF01-RF05).
 * Returns sanitized public items without view counts.
 *
 * @param {object} [options]
 * @param {Array<object>} [options.poems=[]]
 * @param {Array<object>} [options.pageViews=[]]
 * @param {number} [options.days=30]
 * @param {number} [options.limit=5]
 * @param {Date|string|number} [options.now=new Date()]
 * @returns {Array<{ position: number, id: string, slug: string, title: string, published_at: string|null }>}
 */
export function computeMostReadPoems({
  poems = [],
  pageViews = [],
  days = MOST_READ_DAYS,
  limit = MOST_READ_LIMIT,
  now = new Date()
} = {}) {
  if (!Array.isArray(poems) || poems.length === 0 || !Array.isArray(pageViews) || pageViews.length === 0 || limit <= 0) {
    return [];
  }

  const parsedNow = parseTimeMs(now);
  const nowMs = Number.isNaN(parsedNow) ? Date.now() : parsedNow;
  const cutoffMs = nowMs - Math.max(0, days) * DAY_MS;

  const publishedById = new Map();
  const publishedBySlug = new Map();
  const nonPublishedIds = new Set();
  const nonPublishedSlugs = new Set();

  for (const poem of poems) {
    if (!poem || typeof poem !== 'object') continue;
    const isPublished = poem.status === 'published' && typeof poem.slug === 'string' && poem.slug.trim() && typeof poem.title === 'string' && poem.title.trim();
    if (isPublished) {
      if (poem.id) publishedById.set(String(poem.id), poem);
      publishedBySlug.set(poem.slug.trim(), poem);
    } else {
      if (poem.id) nonPublishedIds.add(String(poem.id));
      if (typeof poem.slug === 'string' && poem.slug.trim()) nonPublishedSlugs.add(poem.slug.trim());
    }
  }

  if (publishedBySlug.size === 0) return [];

  const resolvePublishedPoem = (view) => {
    if (!view || typeof view !== 'object') return null;

    const hasPage = typeof view.page === 'string' && view.page.trim().length > 0;
    const pageSlug = hasPage ? extractPoemSlugFromPage(view.page) : '';

    if (hasPage && !pageSlug) {
      return null;
    }

    if (view.poem_id !== undefined && view.poem_id !== null && String(view.poem_id).trim() !== '') {
      const idStr = String(view.poem_id);
      if (nonPublishedIds.has(idStr)) return null;
      if (publishedById.has(idStr)) return publishedById.get(idStr);
    }

    if (pageSlug) {
      if (nonPublishedSlugs.has(pageSlug)) return null;
      if (publishedBySlug.has(pageSlug)) return publishedBySlug.get(pageSlug);
    }

    return null;
  };

  const recentCounts = new Map();
  const totalCounts = new Map();

  for (const view of pageViews) {
    const poem = resolvePublishedPoem(view);
    if (!poem) continue;

    totalCounts.set(poem, (totalCounts.get(poem) || 0) + 1);

    const viewMs = parseTimeMs(view.created_at);
    if (!Number.isNaN(viewMs) && viewMs >= cutoffMs) {
      recentCounts.set(poem, (recentCounts.get(poem) || 0) + 1);
    }
  }

  const compareByCounts = (countsMap) => (a, b) => {
    const countDiff = (countsMap.get(b) || 0) - (countsMap.get(a) || 0);
    if (countDiff !== 0) return countDiff;
    const publishedDiff = getPublishedMs(b) - getPublishedMs(a);
    if (publishedDiff !== 0) return publishedDiff;
    return String(a.slug).localeCompare(String(b.slug));
  };

  const recentRanked = Array.from(recentCounts.keys())
    .sort(compareByCounts(recentCounts))
    .slice(0, limit);

  let selected = recentRanked;

  if (selected.length < limit) {
    const selectedSet = new Set(selected);
    const fallbackRanked = Array.from(totalCounts.keys())
      .filter(poem => !selectedSet.has(poem))
      .sort(compareByCounts(totalCounts))
      .slice(0, limit - selected.length);
    selected = [...selected, ...fallbackRanked];
  }

  return selected.map((poem, index) => ({
    position: index + 1,
    id: poem.id ? String(poem.id) : poem.slug,
    slug: poem.slug,
    title: poem.title,
    published_at: poem.published_at || null
  }));
}

/**
 * Validates and normalizes pre-aggregated most-read entries against live published poems,
 * dropping unpublished or missing items and stripping non-public fields.
 *
 * @param {Array<object>} items
 * @param {Array<object>} poems
 * @param {number} [limit=5]
 * @param {{ allowMissingStatus?: boolean }} [options]
 * @returns {Array<{ position: number, id: string, slug: string, title: string, published_at: string|null }>}
 */
export function filterPublishedMostRead(items = [], poems = [], limit = MOST_READ_LIMIT, { allowMissingStatus = false } = {}) {
  if (!Array.isArray(items) || items.length === 0 || !Array.isArray(poems) || poems.length === 0 || limit <= 0) {
    return [];
  }

  const publishedById = new Map();
  const publishedBySlug = new Map();

  for (const poem of poems) {
    if (!poem || !poem.slug || !poem.title) continue;
    const isAllowed = poem.status === 'published' || (allowMissingStatus && poem.status === undefined);
    if (!isAllowed) continue;
    if (poem.id) publishedById.set(String(poem.id), poem);
    publishedBySlug.set(poem.slug, poem);
  }

  const seenSlugs = new Set();
  const result = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const matched = (item.id && publishedById.get(String(item.id))) || (item.slug && publishedBySlug.get(item.slug));
    if (!matched || seenSlugs.has(matched.slug)) continue;

    seenSlugs.add(matched.slug);
    result.push({
      position: result.length + 1,
      id: matched.id ? String(matched.id) : matched.slug,
      slug: matched.slug,
      title: matched.title,
      published_at: matched.published_at || null
    });

    if (result.length >= limit) break;
  }

  return result;
}

/**
 * Renders the "Mais lidos" home section HTML without exposing view counts (RF01, RF02, CA01, CA02, CA04).
 *
 * @param {Array<object>} mostReadPoems
 * @param {object} [options]
 * @param {string} [options.baseUrl='/']
 * @param {Set<string>|null} [options.favoriteSlugs=null]
 * @returns {string}
 */
export function renderMostReadMarkup(mostReadPoems = [], { baseUrl = '/', favoriteSlugs = null } = {}) {
  if (!Array.isArray(mostReadPoems) || mostReadPoems.length === 0) {
    return '';
  }

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const itemsHtml = mostReadPoems.map((poem, index) => {
    const position = index + 1;
    const slug = String(poem.slug || '').trim();
    const title = String(poem.title || '').trim();
    if (!slug || !title) return '';

    const isFav = favoriteSlugs instanceof Set && (favoriteSlugs.has(slug) || (poem.id && favoriteSlugs.has(String(poem.id))));
    const favBadge = isFav ? ' <span class="favorite-badge" aria-label="Poema favoritado" title="Poema favoritado">🔖</span>' : '';

    return `
      <li class="most-read-item">
        <a href="${base}poema/${escapeHtml(slug)}/" data-link class="most-read-link">
          <span class="most-read-rank" aria-hidden="true">${position}</span>
          <span class="most-read-title">${escapeHtml(title)}${favBadge}</span>
        </a>
      </li>`;
  }).filter(Boolean).join('');

  if (!itemsHtml) return '';

  return `
    <section class="most-read fade-in">
      <h2 class="most-read-heading">Mais lidos</h2>
      <ol class="most-read-list" role="list">${itemsHtml}
      </ol>
    </section>
  `;
}
