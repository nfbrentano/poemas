export function updateSEO({ title, description, url, imageUrl }) {
  const defaultTitle = 'Natanael Brentano - Poesias';
  const defaultDesc = 'Site autoral de poesia contemporânea por Natanael Brentano.';
  
  // Set document title
  document.title = title ? `${title} - Natanael Brentano` : defaultTitle;
  
  // Helper to safely update meta tags
  const setMeta = (selector, attribute, value) => {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      const isProperty = selector.includes('property');
      tag.setAttribute(isProperty ? 'property' : 'name', selector.match(/["'](.*?)["']/)[1]);
      document.head.appendChild(tag);
    }
    tag.setAttribute(attribute, value);
  };

  setMeta('meta[name="description"]', 'content', description || defaultDesc);
  
  // Open Graph
  setMeta('meta[property="og:title"]', 'content', title || defaultTitle);
  setMeta('meta[property="og:description"]', 'content', description || defaultDesc);
  setMeta('meta[property="og:url"]', 'content', url || window.location.href);
  setMeta('meta[property="og:type"]', 'content', 'website');
  
  if (imageUrl) {
    setMeta('meta[property="og:image"]', 'content', imageUrl);
  }
}
