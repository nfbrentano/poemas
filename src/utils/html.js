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

/**
 * Sanitizes a URL, allowing only safe protocols (http, https, safe data:image/, or relative paths).
 * Returns empty string if the URL is invalid or uses an unsafe protocol (e.g., javascript:).
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Block javascript:, vbscript:, and control characters
  if (/^(?:javascript|vbscript):/i.test(trimmed) || /[\u0000-\u001f\u007f-\u009f]/.test(trimmed)) {
    return '';
  }

  // Safe relative URL starting with single slash
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // Allow safe base64 data URIs for images
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[a-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return '';
  }

  return '';
}
