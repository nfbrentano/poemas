import { updateActiveNavLink } from './utils/navigation.js';
import { trackPageView } from './utils/analytics.js';


export const routes = {
  '/': () => import('./pages/home.js').then(m => m.default),
  '/poema/:slug': () => import('./pages/poem.js').then(m => m.default),
  '/admin': () => import('./pages/admin.js').then(m => m.default),
  '/login': () => import('./pages/login.js').then(m => m.default),
  '/sobre': () => import('./pages/about.js').then(m => m.default),
  '/favoritos': () => import('./pages/favorites.js').then(m => m.default)
};

let currentViewComponent = null;

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
  
  // Cleanup previous component if it exists
  if (currentViewComponent && typeof currentViewComponent.cleanup === 'function') {
    currentViewComponent.cleanup();
  }

  // Clear current view with a minimal skeleton or loading class
  view.innerHTML = '<div class="loading-container fade-in">Carregando...</div>';
  
  // Manage header search visibility
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const overlaySearchInput = document.getElementById('overlay-search-input');
  
  if (path === '/') {
    if (searchToggleBtn) searchToggleBtn.style.display = 'block';
  } else {
    if (searchToggleBtn) searchToggleBtn.style.display = 'none';
    if (overlaySearchInput) overlaySearchInput.value = ''; // Reset on page change
  }

  // Manage body classes for specific layouts
  document.body.classList.remove('is-poem-page');
  if (path.includes('/poema/')) {
    document.body.classList.add('is-poem-page');
  }
  
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
      currentViewComponent = component;
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

      // Rastrear visita (não rastrear /admin e /login, e poem.js já rastreia poemas)
      if (path !== '/admin' && path !== '/login' && !path.includes('/poema/')) {
        trackPageView(path);
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
      
      // Detect failed dynamic imports (usually due to a new deployment with different hashes)
      if (e.message?.includes('Failed to fetch dynamically imported module') || 
          e.name === 'ChunkLoadError' ||
          e.message?.includes('error loading dynamically imported module')) {
        window.location.reload();
        return;
      }

      view.innerHTML = '<h2>Erro ao carregar a página.</h2>';
    }
  } else {
    currentViewComponent = null;
    view.innerHTML = `
      <div class="not-found-page fade-in">
        <p class="not-found-label">404</p>
        <h2 class="not-found-title">Página não encontrada.</h2>
        <p class="not-found-desc">O poema que você procura pode ter mudado de endereço — ou nunca existiu.</p>
        <a href="${import.meta.env.BASE_URL}" data-link class="not-found-link">← Voltar para o início</a>
      </div>
    `;
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

  // Handle redirect from 404.html (GitHub Pages SPA fallback)
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    window.history.replaceState(null, null, redirect);
  }
  
  router();
}
