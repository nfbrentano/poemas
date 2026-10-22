import { setStructuredData, poemSchema, pageGraphSchema } from './structured-data.js';
import { SITE_URL, cleanCanonicalUrl } from './url.js';
import { sanitizeUrl } from './html.js';

export function setNotFoundSEO() {
  document.title = 'Página não encontrada — Natanael Fernando Gatti Brentano';

  let robotsTag = document.querySelector('meta[name="robots"]');
  if (!robotsTag) {
    robotsTag = document.createElement('meta');
    robotsTag.setAttribute('name', 'robots');
    document.head.appendChild(robotsTag);
  }
  robotsTag.setAttribute('content', 'noindex');

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.remove();
  }

  // Remove any structured data on 404 pages
  setStructuredData([]);

  // Remove article and citation tags
  document.querySelector('meta[property="article:published_time"]')?.remove();
  document.querySelector('meta[property="article:modified_time"]')?.remove();
  document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
  document.querySelector('meta[name="citation_title"]')?.remove();
  document.querySelector('meta[name="citation_author"]')?.remove();
  document.querySelector('meta[name="citation_language"]')?.remove();
  document.querySelector('meta[name="citation_fulltext_html_url"]')?.remove();
  document.querySelector('meta[name="citation_publication_date"]')?.remove();
  document.querySelector('meta[name="citation_online_date"]')?.remove();
}

export function updateSEO({ title, description, url, imageUrl, type = 'website', publishedTime, modifiedTime, tags, robots, structuredData, poemTitle }) {
  const brandSuffix = 'Natanael Fernando Gatti Brentano';
  const defaultTitle = `Poemas Brasileiros — ${brandSuffix}`;
  const defaultDesc = 'Poemas e poesia contemporânea de Natanael Fernando Gatti Brentano. Uma coleção de versos originais em português sobre amor, tempo, efêmero e o cotidiano.';
  const defaultImage = `${window.location.origin}${import.meta.env.BASE_URL}og-default.jpg`;
  
  // Set document title without duplicating brand suffix
  let finalTitle = defaultTitle;
  if (title) {
    finalTitle = title.includes(brandSuffix) ? title : `${title} — ${brandSuffix}`;
  }
  document.title = finalTitle;
  
  // Helper to safely update meta tags
  const setMeta = (selector, attribute, value) => {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      const isProperty = selector.includes('property') || selector.includes('itemprop');
      const attrName = isProperty ? 'property' : 'name';
      
      const match = selector.match(/["'](.*?)["']/);
      if (match) {
        tag.setAttribute(attrName, match[1]);
        document.head.appendChild(tag);
      }
    }
    if (tag) {
      if (value) {
        tag.setAttribute(attribute, value);
      } else {
        tag.remove();
      }
    }
  };

  const finalDesc = String(description || defaultDesc).replace(/\s+/g, ' ').trim().slice(0, 160);
  
  // Extrair pathname e garantir origem SITE_URL (RF05, CA07)
  let pathname = '/';
  if (url) {
    try {
      pathname = new URL(url, SITE_URL).pathname;
    } catch (_) {
      pathname = String(url).split(/[?#]/)[0];
    }
  } else if (typeof window !== 'undefined' && window.location) {
    try {
      pathname = new URL(window.location.href).pathname;
    } catch (_) {
      pathname = window.location.pathname || '/';
    }
  }
  const rawCanonical = cleanCanonicalUrl(pathname, SITE_URL);
  const canonicalUrl = sanitizeUrl(rawCanonical) || SITE_URL;
  const finalImage = imageUrl || defaultImage;

  // Canonical URL (RF05)
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);

  // Meta Robots
  if (robots) {
    setMeta('meta[name="robots"]', 'content', robots);
  } else {
    document.querySelector('meta[name="robots"]')?.remove();
  }

  // Dynamic Meta Description
  setMeta('meta[name="description"]', 'content', finalDesc);
  
  // Open Graph
  setMeta('meta[property="og:locale"]', 'content', 'pt_BR');
  setMeta('meta[property="og:site_name"]', 'content', 'Poemas — Natanael Fernando Gatti Brentano');
  setMeta('meta[property="og:title"]', 'content', finalTitle);
  setMeta('meta[property="og:description"]', 'content', finalDesc);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[property="og:type"]', 'content', type);
  setMeta('meta[property="og:image"]', 'content', finalImage);
  setMeta('meta[property="og:image:width"]', 'content', '1200');
  setMeta('meta[property="og:image:height"]', 'content', '630');
  setMeta('meta[property="og:image:type"]', 'content', /\.png(?:[?#]|$)/i.test(finalImage) ? 'image/png' : 'image/jpeg');

  // Twitter
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', finalTitle);
  setMeta('meta[name="twitter:description"]', 'content', finalDesc);
  setMeta('meta[name="twitter:image"]', 'content', finalImage);

  // JSON-LD Structured Data (RF01, RF06, RF07)
  if (structuredData !== undefined && structuredData !== null && structuredData !== false) {
    if (Array.isArray(structuredData) && structuredData.length === 0) {
      setStructuredData([]);
    } else {
      setStructuredData([pageGraphSchema(structuredData)]);
    }
  } else if (type === 'article') {
    // Fallback for article if structuredData was not explicitly provided
    const fallbackPoem = {
      title,
      published_at: publishedTime,
      excerpt: finalDesc,
      image: finalImage,
      tags
    };
    setStructuredData([pageGraphSchema([poemSchema(fallbackPoem)])]);
  } else {
    // Default clean-up
    setStructuredData([]);
  }

  if (type === 'article') {
    // Article Specific Meta
    if (publishedTime) {
      setMeta('meta[property="article:published_time"]', 'content', new Date(publishedTime).toISOString());
    }
    if (modifiedTime) {
      setMeta('meta[property="article:modified_time"]', 'content', new Date(modifiedTime).toISOString());
    } else {
      document.querySelector('meta[property="article:modified_time"]')?.remove();
    }
    if (tags && Array.isArray(tags)) {
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      tags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', tag);
        document.head.appendChild(meta);
      });
    }

    // Dynamic OG Image for Articles
    if (url && url.includes('/poema/')) {
      const slug = url.split('/').filter(Boolean).pop();
      const dynamicOgUrl = `${window.location.origin}/og/poema/${slug}.png`;
      setMeta('meta[property="og:image"]', 'content', dynamicOgUrl);
      setMeta('meta[property="og:image:type"]', 'content', 'image/png');
      setMeta('meta[name="twitter:image"]', 'content', dynamicOgUrl);
    }

    // Academic / GEO Citation Meta Tags (Google Scholar, Perplexity, ChatGPT Search)
    const rawPoemTitle = poemTitle || title?.replace(/\s*—\s*Natanael Fernando Gatti Brentano.*$/, '') || title;
    if (rawPoemTitle) {
      setMeta('meta[name="citation_title"]', 'content', rawPoemTitle.trim());
      setMeta('meta[name="citation_author"]', 'content', 'Brentano, Natanael Fernando Gatti');
      setMeta('meta[name="citation_language"]', 'content', 'pt');
      setMeta('meta[name="citation_fulltext_html_url"]', 'content', canonicalUrl);
      if (publishedTime) {
        const pubDateYmd = new Date(publishedTime).toISOString().slice(0, 10).replace(/-/g, '/');
        setMeta('meta[name="citation_publication_date"]', 'content', pubDateYmd);
      }
      if (modifiedTime) {
        const modDateYmd = new Date(modifiedTime).toISOString().slice(0, 10).replace(/-/g, '/');
        setMeta('meta[name="citation_online_date"]', 'content', modDateYmd);
      } else {
        document.querySelector('meta[name="citation_online_date"]')?.remove();
      }
    }
  } else {
    document.querySelector('meta[property="article:published_time"]')?.remove();
    document.querySelector('meta[property="article:modified_time"]')?.remove();
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    document.querySelector('meta[name="citation_title"]')?.remove();
    document.querySelector('meta[name="citation_author"]')?.remove();
    document.querySelector('meta[name="citation_language"]')?.remove();
    document.querySelector('meta[name="citation_fulltext_html_url"]')?.remove();
    document.querySelector('meta[name="citation_publication_date"]')?.remove();
    document.querySelector('meta[name="citation_online_date"]')?.remove();
  }
}


