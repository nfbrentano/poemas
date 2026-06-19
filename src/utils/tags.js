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
