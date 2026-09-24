import { setStructuredData, poemSchema } from './structured-data.js';

export function setNotFoundSEO() {
  document.title = 'Página não encontrada — Natanael Brentano';

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
}

export function updateSEO({ title, description, url, imageUrl, type = 'website', publishedTime, tags, robots, structuredData }) {
  const defaultTitle = 'Poemas Brasileiros - Natanael Brentano';
  const defaultDesc = 'Coleção de poemas originais em português por Natanael Fernando Gatti Brentano. Temas de amor, natureza e reflexões cotidianas.';
  const defaultImage = `${window.location.origin}${import.meta.env.BASE_URL}og-default.png`;
  
  // Set document title
  const finalTitle = title ? `${title} — Natanael Brentano` : defaultTitle;
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

  const finalDesc = (description || defaultDesc).slice(0, 160);
  const finalUrl = url || window.location.href;
  const finalImage = imageUrl || defaultImage;

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', finalUrl);

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
  setMeta('meta[property="og:site_name"]', 'content', 'Poemas — Natanael Brentano');
  setMeta('meta[property="og:title"]', 'content', finalTitle);
  setMeta('meta[property="og:description"]', 'content', finalDesc);
  setMeta('meta[property="og:url"]', 'content', finalUrl);
  setMeta('meta[property="og:type"]', 'content', type);
  setMeta('meta[property="og:image"]', 'content', finalImage);
  setMeta('meta[property="og:image:width"]', 'content', '1200');
  setMeta('meta[property="og:image:height"]', 'content', '630');

  // Twitter
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', finalTitle);
  setMeta('meta[name="twitter:description"]', 'content', finalDesc);
  setMeta('meta[name="twitter:image"]', 'content', finalImage);

  // JSON-LD Structured Data (RF08)
  if (structuredData !== undefined) {
    setStructuredData(structuredData);
  } else if (type === 'article') {
    // Fallback for article if structuredData was not explicitly provided
    const fallbackPoem = {
      title,
      published_at: publishedTime,
      excerpt: finalDesc,
      image: finalImage,
      tags
    };
    setStructuredData([poemSchema(fallbackPoem)]);
  } else {
    // Default clean-up
    setStructuredData([]);
  }

  if (type === 'article') {
    // Article Specific Meta
    if (publishedTime) {
      setMeta('meta[property="article:published_time"]', 'content', new Date(publishedTime).toISOString());
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
    const firebaseUrl = import.meta.env.VITE_FIREBASE_OG_URL;
    if (firebaseUrl && url && url.includes('/poema/')) {
      const slug = url.split('/').filter(Boolean).pop();
      const dynamicOgUrl = `${firebaseUrl}?slug=${slug}`;
      setMeta('meta[property="og:image"]', 'content', dynamicOgUrl);
      setMeta('meta[name="twitter:image"]', 'content', dynamicOgUrl);
    }
  } else {
    document.querySelector('meta[property="article:published_time"]')?.remove();
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
  }
}


