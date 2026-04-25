import { updateActiveNavLink } from './utils/navigation.js';

export const routes = {
  '/': () => import('./pages/home.js').then(m => m.default),
  '/poema/:slug': () => import('./pages/poem.js').then(m => m.default),
  '/admin': () => import('./pages/admin.js').then(m => m.default),
  '/login': () => import('./pages/login.js').then(m => m.default)
};

export async function router() {
  const basePath = import.meta.env.BASE_URL; // e.g. "/" or "/poemas/"
  let path = window.location.pathname;
  
  // Normalize paths for matching
  const cleanBasePath = basePath.replace(/\/$/, ''); // Remove trailing slash if exists
  
  if (path.startsWith(cleanBasePath + '/')) {
    path = path.slice(cleanBasePath.length) || '/';
  } else if (path === cleanBasePath) {
    path = '/';
  }
  
  // Ensure path starts with / and remove duplicate slashes
  path = '/' + path.replace(/\/+/g, '/').replace(/^\//, '');
  
  const view = document.getElementById('main-content');
  
  // Clear current view
  view.innerHTML = '<div class="loading">Carregando...</div>';
  
  // Find matching route
  let match = null;
  let params = {};
  
  for (const [routePattern, componentFn] of Object.entries(routes)) {
    if (routePattern === path) {
      match = componentFn;
      break;
    }
    
    // Check for params like :slug
    if (routePattern.includes(':')) {
      const patternParts = routePattern.split('/');
      const pathParts = path.split('/');
      
      if (patternParts.length === pathParts.length) {
        let isMatch = true;
        for (let i = 0; i < patternParts.length; i++) {
          if (patternParts[i].startsWith(':')) {
            const paramName = patternParts[i].substring(1);
            params[paramName] = pathParts[i];
          } else if (patternParts[i] !== pathParts[i]) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          match = componentFn;
          break;
        }
      }
    }
  }
  
  if (match) {
    try {
      const component = await match();
      await component.render(view, params);
      
      // Update active nav state
      updateActiveNavLink();
      
      // Update meta tags if component provides them AND hasn't already updated title (like poem.js does via updateSEO)
      if (component.meta && component.meta.title) {
        const currentTitle = document.title;
        if (currentTitle.includes('Natanael Brentano') && !currentTitle.includes(' — ')) {
           document.title = `${component.meta.title} — Natanael Brentano`;
        } else if (!currentTitle.includes('Natanael Brentano')) {
           document.title = `${component.meta.title} — Natanael Brentano`;
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
      view.innerHTML = '<h2>Erro ao carregar a página.</h2>';
    }
  } else {
    view.innerHTML = '<h2>Página não encontrada (404)</h2><p><a href="/" data-link>Voltar para o início</a></p>';
  }
}

export function navigateTo(url) {
  const basePath = import.meta.env.BASE_URL;
  let finalUrl = url;
  
  if (url.startsWith('/') && basePath !== '/') {
    // Prevent double slashes if basePath ends with /
    const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    finalUrl = cleanBase + url;
  }
  
  history.pushState(null, null, finalUrl);
  router();
}

export function initRouter() {
  window.addEventListener('popstate', router);
  
  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  
  router();
}
