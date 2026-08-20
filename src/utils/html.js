/**
 * Escapes special HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Safely strips HTML tags from a string, preserving line breaks.
 * Uses DOMParser when available to parse HTML and extract text content safely,
 * preventing incomplete multi-character sanitization vulnerabilities.
 * @param {string} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (typeof html !== 'string' || !html) return '';
  if (typeof DOMParser !== 'undefined') {
    const formatted = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p\s*>/gi, '\n\n')
      .replace(/<\/div\s*>/gi, '\n');
    const doc = new DOMParser().parseFromString(formatted, 'text/html');
    doc.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
    return (doc.body.textContent || '').trim();
  }
  let result = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<\/div\s*>/gi, '\n');
  let prev;
  do {
    prev = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== prev);
  return result.trim();
}

