export const SITE_URL = 'https://nfgbrentano.art.br/';

/**
 * Checks whether a path has a file extension (e.g. .xml, .png, .jpg, .html, .json, .txt).
 * @param {string} path
 * @returns {boolean}
 */
export function hasFileExtension(path) {
  if (!path) return false;
  const clean = path.split('?')[0].split('#')[0];
  return /\.[a-z0-9]+$/i.test(clean);
}

/**
 * Ensures a URL or path has a trailing slash for page routes.
 * Preserves query strings and hashes if present, while ensuring the pathname part has a trailing slash.
 * Does not add a trailing slash to assets or files with extensions.
 *
 * @param {string} url
 * @returns {string}
 */
export function ensureTrailingSlash(url) {
  if (!url) return '';
  const [withoutHash, hash] = url.split('#');
  const [base, query] = withoutHash.split('?');

  let cleanBase = base;
  if (!hasFileExtension(cleanBase) && !cleanBase.endsWith('/')) {
    cleanBase += '/';
  }

  let result = cleanBase;
  if (query !== undefined) {
    result += `?${query}`;
  }
  if (hash !== undefined) {
    result += `#${hash}`;
  }
  return result;
}

/**
 * Builds an absolute canonical URL with a trailing slash for page routes (RF01).
 *
 * @param {string} path Path or relative/absolute URL
 * @param {string} baseUrl Optional base URL (defaults to SITE_URL)
 * @returns {string} Absolute URL ending with '/' for pages
 */
export function buildUrl(path = '', baseUrl = SITE_URL) {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (!path || path === '/' || path === cleanBase) {
    return cleanBase;
  }

  // If already absolute URL
  if (/^https?:\/\//i.test(path)) {
    return ensureTrailingSlash(path);
  }

  const baseWithoutTrailingSlash = cleanBase.slice(0, -1);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return ensureTrailingSlash(`${baseWithoutTrailingSlash}${cleanPath}`);
}

/**
 * Builds a relative URL with a trailing slash for page routes.
 * Suitable for client-side <a href="..."> links.
 *
 * @param {string} path
 * @param {string} baseUrl Defaults to '/'
 * @returns {string} Relative URL with trailing slash
 */
export function buildRelativeUrl(path = '', baseUrl = '/') {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (!path || path === '/' || path === cleanBase) {
    return cleanBase;
  }
  const cleanPath = path.replace(/^\/+/, '');
  return ensureTrailingSlash(`${cleanBase}${cleanPath}`);
}

/**
 * Normalizes a URL for use as canonical and og:url:
 * Removes query strings and hashes, and guarantees trailing slash (RF05).
 *
 * @param {string} urlOrPath
 * @param {string} baseUrl Defaults to SITE_URL
 * @returns {string} Clean absolute canonical URL
 */
export function cleanCanonicalUrl(urlOrPath = '', baseUrl = SITE_URL) {
  if (!urlOrPath) {
    return buildUrl('', baseUrl);
  }
  const withoutHash = urlOrPath.split('#')[0];
  const clean = withoutHash.split('?')[0];
  return buildUrl(clean, baseUrl);
}
