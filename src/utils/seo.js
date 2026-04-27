export function updateSEO({ title, description, url, imageUrl, type = 'website', publishedTime, tags }) {
  const defaultTitle = 'Poemas Brasileiros - Natanael Brentano';
  const defaultDesc = 'Coleção de poemas originais em português por Natanael Fernando Gatti Brentano. Temas de amor, natureza e reflexões cotidianas.';
  const defaultImage = 'https://nfbrentano.github.io/poemas/og-cover.jpg';
  
  // Set document title
  const finalTitle = title ? `${title} — Natanael Brentano` : defaultTitle;
  document.title = finalTitle;
  
  // Helper to safely update meta tags
  const setMeta = (selector, attribute, value) => {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      const isProperty = selector.includes('property');
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

  // Dynamic Meta Description
  setMeta('meta[name="description"]', 'content', finalDesc);
  
  // Open Graph
  setMeta('meta[property="og:title"]', 'content', finalTitle);
  setMeta('meta[property="og:description"]', 'content', finalDesc);
  setMeta('meta[property="og:url"]', 'content', finalUrl);
  setMeta('meta[property="og:type"]', 'content', type);
  setMeta('meta[property="og:image"]', 'content', finalImage);

  // Twitter
  setMeta('meta[name="twitter:card"]', 'content', 'summary');
  setMeta('meta[name="twitter:title"]', 'content', finalTitle);
  setMeta('meta[name="twitter:description"]', 'content', finalDesc);
  setMeta('meta[name="twitter:image"]', 'content', finalImage);

  // JSON-LD Structured Data
  let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
  if (type === 'article') {
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": finalDesc,
      "author": { "@type": "Person", "name": "Natanael Brentano" },
      "datePublished": publishedTime ? new Date(publishedTime).toISOString() : undefined,
      "url": finalUrl,
      "image": finalImage
    };
    jsonLdScript.textContent = JSON.stringify(structuredData);

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
  } else {
    // Clean up
    if (jsonLdScript) jsonLdScript.remove();
    document.querySelector('meta[property="article:published_time"]')?.remove();
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
  }
}

