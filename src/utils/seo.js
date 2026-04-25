export function updateSEO({ title, description, url, imageUrl }) {
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
    if (tag) tag.setAttribute(attribute, value);
  };

  const finalDesc = (description || defaultDesc).slice(0, 160);
  const finalUrl = url || window.location.href;
  const finalImage = imageUrl || defaultImage;

  // Dynamic Meta Description
  setMeta('meta[name="description"]', 'content', finalDesc);
  
  // Open Graph
  setMeta('meta[property="og:title"]', 'content', finalTitle);
  setMeta('meta[property="og:description"]', 'content', finalDesc);
  setMeta('meta[property="og:url"]', 'content', finalUrl);
  setMeta('meta[property="og:type"]', 'content', 'website');
  setMeta('meta[property="og:image"]', 'content', finalImage);

  // Twitter
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', finalTitle);
  setMeta('meta[name="twitter:description"]', 'content', finalDesc);
  setMeta('meta[name="twitter:image"]', 'content', finalImage);
}
