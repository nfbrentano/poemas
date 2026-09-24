/**
 * Normalizes a tag by removing common sentiment prefixes.
 * @param {string} tag
 * @returns {string}
 */
export function normalizeTag(tag) {
  if (typeof tag !== 'string') return '';
  return tag.trim().replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i, '').trim();
}

/**
 * Normalizes and formats a tag to Sentence Case (e.g., "Amor").
 * @param {string} tag
 * @returns {string}
 */
export function formatTag(tag) {
  const normalized = normalizeTag(tag);
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

/**
 * Converts a tag into a URL-friendly slug.
 * Removes common sentiment prefixes, accents, trims, lowercases, and replaces non-alphanumeric with hyphens.
 * @param {string} tag
 * @returns {string}
 */
export function slugifyTag(tag) {
  const norm = normalizeTag(tag);
  if (!norm) return '';
  return norm
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const tagToSlug = slugifyTag;

