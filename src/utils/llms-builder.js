import { stripHtml } from './html.js';
import { SITE_URL, ensureTrailingSlash } from './url.js';
import { formatDateToYMD } from './sitemap-builder.js';
import { tagToSlug, formatTag } from './tags.js';
import { getSentimentName, getSentimentIntro } from '../data/sentiments.js';

export { SITE_URL };

export const ATTRIBUTION_NOTICE = '© Natanael Brentano. Citações permitidas com crédito e link para a URL do poema.';

/**
 * Decodes common HTML entities to plain text characters.
 * @param {string} text
 * @returns {string}
 */
export function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, '/');
}

/**
 * Formats poem content into standard Markdown:
 * - Preserves verses with two trailing spaces for hard line breaks in Markdown.
 * - Separates stanzas with a blank line.
 * - Strips all HTML tags and decodes HTML entities.
 *
 * @param {string} content
 * @returns {string}
 */
export function formatPoemForMarkdown(content) {
  if (!content || typeof content !== 'string') return '';

  // Use stripHtml to safely remove tags while converting <br> to \n and </p> to \n\n
  const rawText = stripHtml(content);
  const decoded = decodeHtmlEntities(rawText);

  // Divide into stanzas by double line breaks
  const rawStanzas = decoded.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);

  const formattedStanzas = rawStanzas.map(stanza => {
    const lines = stanza.split('\n').map(l => l.trim()).filter(Boolean);
    // Add two trailing spaces to each verse except the last one in the stanza
    return lines.map((line, idx) => (idx < lines.length - 1 ? `${line}  ` : line)).join('\n');
  });

  return formattedStanzas.join('\n\n');
}

/**
 * Extracts a clean excerpt or first line from a poem for indexing.
 * @param {object} poem
 * @param {number} maxLength
 * @returns {string}
 */
export function extractPoemDescription(poem, maxLength = 160) {
  if (!poem) return '';

  if (poem.excerpt && typeof poem.excerpt === 'string' && poem.excerpt.trim()) {
    const clean = decodeHtmlEntities(stripHtml(poem.excerpt)).replace(/\s+/g, ' ').trim();
    if (clean) {
      return clean.length > maxLength ? `${clean.slice(0, maxLength - 3)}...` : clean;
    }
  }

  if (poem.content && typeof poem.content === 'string') {
    const cleanText = decodeHtmlEntities(stripHtml(poem.content));
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0] || '';
    if (firstLine) {
      return firstLine.length > maxLength ? `${firstLine.slice(0, maxLength - 3)}...` : firstLine;
    }
  }

  return 'Poema contemporâneo em língua portuguesa.';
}

/**
 * Resolves collection titles for a poem.
 * @param {object} poem
 * @param {Array} collections
 * @param {Array} collectionPoems
 * @returns {string[]}
 */
export function getPoemCollectionNames(poem, collections = [], collectionPoems = []) {
  if (!poem) return [];

  const collectionsMap = new Map();
  collections.forEach(c => {
    if (c && c.id) collectionsMap.set(c.id, c.title || c.name || c.slug);
  });

  const names = new Set();

  // 1. Through collection_poems relation
  if (Array.isArray(collectionPoems) && collectionPoems.length > 0) {
    collectionPoems
      .filter(cp => cp && cp.poem_id === poem.id)
      .forEach(cp => {
        const colTitle = collectionsMap.get(cp.collection_id);
        if (colTitle) names.add(colTitle);
      });
  }

  // 2. Direct collection_id on poem
  if (poem.collection_id && collectionsMap.has(poem.collection_id)) {
    names.add(collectionsMap.get(poem.collection_id));
  }

  // 3. Embedded collections property
  if (Array.isArray(poem.collections)) {
    poem.collections.forEach(c => {
      if (typeof c === 'string') names.add(c);
      else if (c && (c.title || c.name)) names.add(c.title || c.name);
    });
  }

  return Array.from(names);
}

/**
 * Extracts and formats sentiment names from a poem's tags.
 * @param {object} poem
 * @returns {string[]}
 */
export function getPoemSentiments(poem) {
  if (!poem || !Array.isArray(poem.tags)) return [];
  const sentiments = new Set();
  poem.tags.forEach(tag => {
    const slug = tagToSlug(tag);
    if (slug) {
      sentiments.add(getSentimentName(slug, tag));
    }
  });
  return Array.from(sentiments);
}

/**
 * Sorts poems descending by published_at (or created_at).
 * @param {Array} poems
 * @returns {Array}
 */
export function sortPoemsByDateDesc(poems) {
  return [...poems].sort((a, b) => {
    const getTime = p => {
      if (!p) return 0;
      if (p.published_at?.toDate && typeof p.published_at.toDate === 'function') {
        return p.published_at.toDate().getTime();
      }
      const val = p.published_at || p.created_at || 0;
      const t = new Date(val).getTime();
      return isNaN(t) ? 0 : t;
    };
    return getTime(b) - getTime(a);
  });
}

/**
 * Builds the llms.txt index file according to llmstxt.org specification.
 *
 * @param {object} options
 * @param {string} [options.baseUrl]
 * @param {Array} [options.poems]
 * @param {Array} [options.collections]
 * @param {Array} [options.collectionPoems]
 * @param {number} [options.minPoemsPerSentiment]
 * @returns {string}
 */
export function buildLlmsTxt({
  baseUrl = SITE_URL,
  poems = [],
  collections = [],
  collectionPoems = [],
  minPoemsPerSentiment = 3
} = {}) {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // RF05: Filter only published poems
  const publishedPoems = poems.filter(p => p && p.status === 'published' && p.slug);
  const sortedPoems = sortPoemsByDateDesc(publishedPoems);

  const sections = [];

  // Header and blockquote summary (RF02, RF04)
  sections.push('# Poemas — Natanael Brentano\n');
  sections.push(
    `> Poesia brasileira contemporânea em língua portuguesa por Natanael Fernando Gatti Brentano. Acervo com ${publishedPoems.length} poemas publicados sobre amor, tempo, efêmero e o cotidiano.\n` +
    `> ${ATTRIBUTION_NOTICE}\n`
  );

  // Author short paragraph with link to /sobre/ (RF02, RNF02)
  sections.push(
    `Natanael Fernando Gatti Brentano é um poeta brasileiro contemporâneo que escreve sobre o que sobra do dia, capturando a efemeridade do instante e a profundidade das coisas simples. Conheça a trajetória e a proposta poética na [página sobre o autor](${cleanBase}sobre/).\n`
  );

  // Collections section (RF02)
  const validCollections = collections.filter(c => c && c.slug);
  if (validCollections.length > 0) {
    const colLines = ['## Coleções\n'];
    validCollections.forEach(col => {
      const title = col.title || col.name || col.slug;
      const url = `${cleanBase}colecao/${col.slug}/`;
      const desc = decodeHtmlEntities(stripHtml(col.description || 'Série temática de poemas.')).replace(/\s+/g, ' ').trim();
      colLines.push(`- [${title}](${url}): ${desc}`);
    });
    sections.push(colLines.join('\n') + '\n');
  } else {
    sections.push(
      `## Coleções\n\n- [Coleções](${cleanBase}colecoes/): Séries temáticas e livros catalogados de Natanael Brentano.\n`
    );
  }

  // Sentiments section (RF02: omit if none exist or none meet threshold)
  const sentimentMap = new Map();
  publishedPoems.forEach(poem => {
    const tags = Array.isArray(poem.tags) ? poem.tags : [];
    tags.forEach(tag => {
      const slug = tagToSlug(tag);
      if (!slug) return;
      if (!sentimentMap.has(slug)) {
        sentimentMap.set(slug, { slug, count: 0 });
      }
      sentimentMap.get(slug).count++;
    });
  });

  const qualifyingSentiments = Array.from(sentimentMap.values())
    .filter(s => s.count >= minPoemsPerSentiment)
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));

  if (qualifyingSentiments.length > 0) {
    const sentLines = ['## Sentimentos\n'];
    sentLines.push(`- [Todos os Sentimentos](${cleanBase}sentimentos/): Índice de poemas organizados por sentimentos e temas.`);
    qualifyingSentiments.forEach(s => {
      const name = getSentimentName(s.slug);
      const url = `${cleanBase}sentimento/${s.slug}/`;
      const intro = getSentimentIntro(name, s.slug);
      sentLines.push(`- [${name}](${url}): ${intro}`);
    });
    sections.push(sentLines.join('\n') + '\n');
  }

  // Poems section (RF02: newest first)
  const poemLines = ['## Poemas\n'];
  if (sortedPoems.length > 0) {
    sortedPoems.forEach(poem => {
      const url = `${cleanBase}poema/${poem.slug}/`;
      const desc = extractPoemDescription(poem, 120);
      poemLines.push(`- [${poem.title}](${url}): ${desc}`);
    });
  } else {
    poemLines.push(`- [Poemas](${cleanBase}): Nenhum poema publicado no momento.`);
  }
  sections.push(poemLines.join('\n') + '\n');

  // Optional section (RF02)
  const optionalLines = [
    '## Optional\n',
    `- [Acervo Completo (Markdown)](${cleanBase}llms-full.txt): Texto integral de todos os poemas publicados com metadados para LLMs.`,
    `- [Feed RSS](${cleanBase}feed.xml): Feed de atualizações com os últimos poemas publicados.`,
    `- [Mapa do Site (Sitemap)](${cleanBase}sitemap.xml): Índice de sitemaps XML para indexação e rastreamento.`
  ];
  sections.push(optionalLines.join('\n'));

  return sections.join('\n').trim() + '\n';
}

/**
 * Builds the llms-full.txt complete poems catalog in Markdown format.
 *
 * @param {object} options
 * @param {string} [options.baseUrl]
 * @param {Array} [options.poems]
 * @param {Array} [options.collections]
 * @param {Array} [options.collectionPoems]
 * @returns {string}
 */
export function buildLlmsFullTxt({
  baseUrl = SITE_URL,
  poems = [],
  collections = [],
  collectionPoems = []
} = {}) {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // RF05: Filter only published poems
  const publishedPoems = poems.filter(p => p && p.status === 'published' && p.slug);
  const sortedPoems = sortPoemsByDateDesc(publishedPoems);

  const parts = [];

  // Header and attribution (RF04)
  parts.push('# Poemas — Natanael Brentano (Acervo Completo)\n');
  parts.push(
    `> Poesia brasileira contemporânea em língua portuguesa por Natanael Fernando Gatti Brentano. Acervo completo com ${publishedPoems.length} poemas publicados.\n` +
    `> ${ATTRIBUTION_NOTICE}\n`
  );

  // Each poem entry (RF03)
  if (sortedPoems.length > 0) {
    const poemEntries = sortedPoems.map(poem => {
      const canonicalUrl = `${cleanBase}poema/${poem.slug}/`;
      const publishedDate = formatDateToYMD(poem.published_at || poem.created_at) || 'N/D';

      const colNames = getPoemCollectionNames(poem, collections, collectionPoems);
      const colString = colNames.length > 0 ? colNames.join(', ') : 'Nenhuma';

      const sentNames = getPoemSentiments(poem);
      const sentString = sentNames.length > 0 ? sentNames.join(', ') : 'Nenhum';

      const poemText = formatPoemForMarkdown(poem.content);

      return (
        `## ${poem.title}\n\n` +
        `URL: ${canonicalUrl} | Publicado em: ${publishedDate} | Coleções: ${colString} | Sentimentos: ${sentString}\n\n` +
        `${poemText}`
      );
    });

    parts.push(poemEntries.join('\n\n---\n\n'));
  }

  return parts.join('\n').trim() + '\n';
}

/**
 * Builds both llms.txt and llms-full.txt files.
 * @param {object} options
 * @returns {{ 'llms.txt': string, 'llms-full.txt': string }}
 */
export function buildAllLlmsFiles(options = {}) {
  return {
    'llms.txt': buildLlmsTxt(options),
    'llms-full.txt': buildLlmsFullTxt(options)
  };
}
