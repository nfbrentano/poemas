import { JSDOM } from 'jsdom';
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

const ALLOWED_RSS_TAGS = new Set(['P', 'BR', 'EM', 'STRONG', 'I', 'B', 'SPAN']);
const DANGEROUS_RSS_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH']);

/**
 * Formats and sanitizes poem content as safe HTML suitable for RSS readers inside CDATA (RF02, CA03, CA04).
 * Enforces a strict tag whitelist (p, br, em, strong, i, b, span) and strips all attributes.
 * @param {string} content
 * @returns {string}
 */
export function formatPoemHtmlForRss(content) {
  if (!content || typeof content !== 'string') return '';
  let html = content.trim();
  if (!html) return '';

  if (!/<p|br|div/i.test(html)) {
    // Plain text poem: convert double newlines to paragraphs and single newlines to br
    html = html
      .split(/\n\s*\n/)
      .map(stanza => `<p>${stanza.replace(/\n/g, '<br />')}</p>`)
      .join('\n');
  }

  const dom = new JSDOM(html);
  const body = dom.window.document.body;

  function cleanNode(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) {
        const tagName = child.tagName.toUpperCase();
        if (DANGEROUS_RSS_TAGS.has(tagName)) {
          child.remove();
        } else if (ALLOWED_RSS_TAGS.has(tagName)) {
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
          cleanNode(child);
        } else {
          cleanNode(child);
          child.replaceWith(...Array.from(child.childNodes));
        }
      } else if (child.nodeType === 8) {
        child.remove();
      }
    }
  }

  cleanNode(body);
  return body.innerHTML.trim();
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
