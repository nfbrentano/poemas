import { escapeHtml, stripHtml, sanitizeUrl } from './html.js';

export const SITE_URL = 'https://nfgbrentano.art.br';
export const AUTHOR_ID = 'https://nfgbrentano.art.br/sobre/#autor';
export const WEBSITE_ID = 'https://nfgbrentano.art.br/#website';

/**
 * Escapes characters such as '<' to prevent breaking HTML <script> tags.
 * RF09 & CT03: Returns JSON string with '<' replaced by '\\u003c'.
 */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Helper to ensure canonical URLs end with a trailing slash.
 */
export function ensureTrailingSlash(url) {
  if (!url) return SITE_URL + '/';
  if (url.includes('?')) {
    const [path, query] = url.split('?');
    return (path.endsWith('/') ? path : `${path}/`) + (query ? `?${query}` : '');
  }
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * RF02: Schema for the author (Person entity).
 */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": AUTHOR_ID,
    "name": "Natanael Brentano",
    "alternateName": "Natanael Fernando Gatti Brentano",
    "url": `${SITE_URL}/sobre/`,
    "image": `${SITE_URL}/og-cover.jpg`,
    "description": "Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.",
    "jobTitle": "Poeta",
    "knowsAbout": [
      "Poesia",
      "Literatura Brasileira",
      "Poesia Contemporânea"
    ],
    "sameAs": [
      "https://instagram.com/nfgbrentano"
    ]
  };
}

/**
 * RF02: ProfilePage schema for /sobre/ whose mainEntity is the Person.
 */
export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/sobre/`,
    "url": `${SITE_URL}/sobre/`,
    "name": "Sobre Natanael Brentano",
    "inLanguage": "pt-BR",
    "mainEntity": personSchema()
  };
}

/**
 * FAQPage schema for questions and answers.
 * @param {Array<{ question: string, answer: string }>} items
 */
export function faqPageSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/sobre/#faq`,
    "mainEntity": (items || []).map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

/**
 * RF03: WebSite schema for the homepage.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "url": `${SITE_URL}/`,
    "name": "Poemas — Natanael Brentano",
    "inLanguage": "pt-BR",
    "description": "Coleção de poemas originais em português por Natanael Fernando Gatti Brentano. Temas de amor, natureza e reflexões cotidianas.",
    "publisher": {
      "@id": AUTHOR_ID
    },
    "author": {
      "@id": AUTHOR_ID
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * RF04: Schema for a poem (CreativeWork & Poem).
 */
export function poemSchema(poem, collections = []) {
  if (!poem) return null;

  const poemSlug = poem.slug || '';
  const poemUrl = ensureTrailingSlash(`${SITE_URL}/poema/${poemSlug}`);
  const publishedDate = poem.published_at ? new Date(poem.published_at).toISOString() : new Date().toISOString();
  const modifiedDate = poem.updated_at ? new Date(poem.updated_at).toISOString() : publishedDate;
  
  const excerpt = poem.excerpt || stripHtml(poem.content || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const plainText = stripHtml(poem.content || '').trim();

  const websiteRef = { "@id": WEBSITE_ID };
  const collectionRefs = (Array.isArray(collections) ? collections : []).map(col => {
    const slug = typeof col === 'string' ? col : col.slug;
    const name = typeof col === 'string' ? col : col.name;
    return {
      "@type": "CollectionPage",
      "name": name || slug,
      "url": ensureTrailingSlash(`${SITE_URL}/colecao/${slug}`)
    };
  });

  const isPartOf = collectionRefs.length > 0
    ? [websiteRef, ...collectionRefs]
    : websiteRef;

  const keywords = Array.isArray(poem.tags) ? poem.tags : [];
  const imageUrl = poem.image || `https://poemas-natanael.web.app/og-image?slug=${poemSlug}`;

  return {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "Poem"],
    "@id": `${poemUrl}#poema`,
    "headline": poem.title || '',
    "name": poem.title || '',
    "abstract": excerpt,
    "text": plainText,
    "genre": "Poetry",
    "inLanguage": "pt-BR",
    "keywords": keywords,
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "author": {
      "@id": AUTHOR_ID
    },
    "isPartOf": isPartOf,
    "mainEntityOfPage": poemUrl,
    "image": imageUrl,
    "url": poemUrl
  };
}

/**
 * RF05: Schema for a single collection page.
 */
export function collectionSchema(col, poems = []) {
  if (!col) return null;

  const colSlug = col.slug || '';
  const colUrl = ensureTrailingSlash(`${SITE_URL}/colecao/${colSlug}`);
  const poemsList = Array.isArray(poems) ? poems : [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": colUrl,
    "url": colUrl,
    "name": col.name || '',
    "description": col.description || `Coleção de poemas: ${col.name || ''}`,
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@id": WEBSITE_ID
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": poemsList.length,
      "itemListElement": poemsList.map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": p.title || '',
        "url": ensureTrailingSlash(`${SITE_URL}/poema/${p.slug}`)
      }))
    }
  };
}

/**
 * RF06: Schema for the collections catalog page (/colecoes/).
 */
export function collectionsListSchema(collections = []) {
  const colUrl = `${SITE_URL}/colecoes/`;
  const colsList = Array.isArray(collections) ? collections : [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": colUrl,
    "url": colUrl,
    "name": "Coleções e Sentimentos — Natanael Brentano",
    "description": "Explore as coleções e séries temáticas de poemas de Natanael Brentano.",
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@id": WEBSITE_ID
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": colsList.length,
      "itemListElement": colsList.map((col, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": col.name || '',
        "url": ensureTrailingSlash(`${SITE_URL}/colecao/${col.slug}`)
      }))
    }
  };
}

/**
 * Schema for a sentiment page (/sentimento/<slug>/).
 * @param {string} sentimentName
 * @param {string} slug
 * @param {object[]} poems
 * @param {string} description
 */
export function sentimentSchema(sentimentName, slug, poems = [], description = '') {
  const sentUrl = ensureTrailingSlash(`${SITE_URL}/sentimento/${slug}`);
  const poemsList = Array.isArray(poems) ? poems : [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": sentUrl,
    "url": sentUrl,
    "name": `Poemas sobre ${sentimentName}`,
    "description": description || `Poemas sobre ${sentimentName.toLowerCase()} de Natanael Brentano.`,
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@id": WEBSITE_ID
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": poemsList.length,
      "itemListElement": poemsList.map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": p.title || '',
        "url": ensureTrailingSlash(`${SITE_URL}/poema/${p.slug}`)
      }))
    }
  };
}

/**
 * Schema for the sentiments catalog page (/sentimentos/).
 * @param {Array<{ name: string, slug: string }>} sentiments
 */
export function sentimentsListSchema(sentiments = []) {
  const sentUrl = `${SITE_URL}/sentimentos/`;
  const list = Array.isArray(sentiments) ? sentiments : [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": sentUrl,
    "url": sentUrl,
    "name": "Poemas por Sentimento — Natanael Brentano",
    "description": "Explore os poemas de Natanael Brentano organizados por sentimentos e temas.",
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@id": WEBSITE_ID
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": list.length,
      "itemListElement": list.map((s, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": s.name || s.slug,
        "url": ensureTrailingSlash(`${SITE_URL}/sentimento/${s.slug}`)
      }))
    }
  };
}

/**
 * RF07: Schema for breadcrumbs (BreadcrumbList).
 * @param {Array<{name: string, url: string}>} items
 */
export function breadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": (items || []).map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": ensureTrailingSlash(item.url)
    }))
  };
}

/**
 * RF08 & CA04: Replaces (does not accumulate) JSON-LD script blocks in the document head during SPA navigation.
 */
export function setStructuredData(schemas = []) {
  if (typeof document === 'undefined') return;

  // Remove existing JSON-LD scripts
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  const list = Array.isArray(schemas) ? schemas.filter(Boolean) : [schemas].filter(Boolean);
  list.forEach(schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = serializeJsonLd(schema);
    document.head.appendChild(script);
  });
}

/**
 * RF07: Renders visible HTML breadcrumbs with <nav aria-label="breadcrumb">.
 * @param {Array<{name: string, url: string}>} items
 */
export function renderBreadcrumbsHtml(items = []) {
  if (!items || items.length === 0) return '';
  const lastIndex = items.length - 1;

  const listItems = items.map((item, idx) => {
    const isLast = idx === lastIndex;
    const name = escapeHtml(item.name || '');

    // For links, convert absolute site URL to relative path if matching site origin
    let href = item.url;
    try {
      if (href.startsWith(SITE_URL)) {
        href = href.slice(SITE_URL.length) || '/';
      }
    } catch (_) {}

    if (isLast) {
      return `<li class="breadcrumb-item breadcrumb-current" aria-current="page"><span>${name}</span></li>`;
    }
    const safeHref = sanitizeUrl(href) || '/';
    return `<li class="breadcrumb-item"><a href="${safeHref}" class="breadcrumb-link" data-link>${name}</a></li><li class="breadcrumb-separator" aria-hidden="true">›</li>`;
  }).join('');

  return `<nav aria-label="breadcrumb" class="breadcrumb-nav"><ol class="breadcrumb-list">${listItems}</ol></nav>`;
}
