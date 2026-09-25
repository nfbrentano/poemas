import { setStructuredData, poemSchema, pageGraphSchema } from './structured-data.js';
import { cleanCanonicalUrl } from './url.js';

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
  const brandSuffix = 'Natanael Brentano';
  const defaultTitle = `Poemas Brasileiros — ${brandSuffix}`;
  const defaultDesc = 'Poemas e poesia brasileira contemporânea de Natanael Brentano. Uma coleção de versos originais em português sobre amor, tempo, efêmero e o cotidiano.';
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
  const rawUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonicalUrl = cleanCanonicalUrl(rawUrl);
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
  setMeta('meta[property="og:site_name"]', 'content', 'Poemas — Natanael Brentano');
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
  } else {
    document.querySelector('meta[property="article:published_time"]')?.remove();
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
  }
}


