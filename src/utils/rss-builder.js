import { stripHtml } from './html.js';
import { formatTag } from './tags.js';
import { SITE_URL } from './url.js';

export { SITE_URL };

/**
 * Escapes characters that are special in XML text nodes or attribute values.
 * @param {string} unsafe
 * @returns {string}
 */
export function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Returns an excerpt for a poem, preferring poem.excerpt or deriving from clean content.
 * @param {object} poem
 * @param {number} limit
 * @returns {string}
 */
export function getExcerpt(poem, limit = 160) {
  if (poem.excerpt && poem.excerpt.trim()) {
    return poem.excerpt.trim();
  }
  const cleanContent = stripHtml(poem.content || '').replace(/\s+/g, ' ').trim();
  if (cleanContent.length <= limit) return cleanContent;
  return cleanContent.slice(0, limit - 3) + '...';
}

/**
 * Formats and sanitizes poem content as HTML suitable for RSS readers inside CDATA.
 * @param {string} content
 * @returns {string}
 */
export function formatPoemHtmlForRss(content) {
  if (!content) return '';
  let html = content.trim();
  // Strip dangerous elements if any
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');

  if (!/<p|br|div/i.test(html)) {
    // Plain text poem: convert double newlines to paragraphs and single newlines to br
    html = html
      .split(/\n\s*\n/)
      .map(stanza => `<p>${stanza.replace(/\n/g, '<br />')}</p>`)
      .join('\n');
  }
  return html;
}

/**
 * Wraps content in CDATA, safely escaping any embedded ']]>' sequences.
 * @param {string} str
 * @returns {string}
 */
export function wrapCdata(str) {
  return `<![CDATA[${(str || '').replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * Builds the complete RSS 2.0 feed document.
 * Includes namespaces: content, dc, atom.
 * Limits items to 50 most recent published poems.
 *
 * @param {object} options
 * @param {string} [options.baseUrl]
 * @param {object[]} [options.poems]
 * @param {Date} [options.buildDate]
 * @param {number} [options.limit] Default 50
 * @returns {string}
 */
export function buildRssFeed({
  baseUrl = SITE_URL,
  poems = [],
  buildDate = new Date(),
  limit = 50
} = {}) {
  // Ensure canonical baseUrl
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Filter only published poems and sort by published_at descending
  const publishedPoems = poems
    .filter(p => p.status === 'published' && p.slug)
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
    .slice(0, limit);

  const lastBuildDateStr = buildDate.toUTCString();

  const itemsXml = publishedPoems.map(poem => {
    const poemUrl = `${cleanBase}poema/${poem.slug}/`;
    const pubDate = new Date(poem.published_at || poem.created_at || buildDate).toUTCString();
    const categories = (Array.isArray(poem.tags) ? poem.tags : [])
      .map(t => formatTag(t))
      .filter(Boolean)
      .map(cat => `      <category>${escapeXml(cat)}</category>`)
      .join('\n');

    const contentHtml = formatPoemHtmlForRss(poem.content);

    return `    <item>
      <title>${escapeXml(poem.title || '')}</title>
      <link>${poemUrl}</link>
      <guid isPermaLink="true">${poemUrl}</guid>
      <description>${escapeXml(getExcerpt(poem))}</description>
      <content:encoded>${wrapCdata(contentHtml)}</content:encoded>
      <dc:creator>Natanael Fernando Gatti Brentano</dc:creator>
      <pubDate>${pubDate}</pubDate>
${categories ? `${categories}\n` : ''}    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Poemas Brasileiros — Natanael Brentano</title>
    <link>${cleanBase}</link>
    <description>Coleção de poemas originais em português por Natanael Fernando Gatti Brentano.</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuildDateStr}</lastBuildDate>
    <atom:link href="${cleanBase}feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${cleanBase}og-default.png</url>
      <title>Poemas Brasileiros — Natanael Brentano</title>
      <link>${cleanBase}</link>
    </image>
${itemsXml}
  </channel>
</rss>`;
}
