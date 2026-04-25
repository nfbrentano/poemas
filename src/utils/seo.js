export function updateSEO({ title, description, url, imageUrl }) {
  const defaultTitle = 'Natanael Brentano - Poemas';
  const defaultDesc = 'Site autoral de poesia contemporânea por Natanael Brentano.';
  const defaultImage = 'https://nfbrentano.github.io/poemas/og-image.jpg'; // Path to a default cover image
  
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
      
      // Extract the name from selector like meta[name="description"]
      const match = selector.match(/["'](.*?)["']/);
      if (match) {
        tag.setAttribute(attrName, match[1]);
        document.head.appendChild(tag);
      }
    }
    if (tag) tag.setAttribute(attribute, value);
  };

  const finalDesc = description || defaultDesc;
  const finalUrl = url || window.location.href;
  const finalImage = imageUrl || defaultImage;

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
