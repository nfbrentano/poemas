import { updateActiveNavLink, getRandomPoem } from './utils/navigation.js';

export const routes = {
  '/': () => import('./pages/home.js').then(m => m.default),
  '/poema/:slug': () => import('./pages/poem.js').then(m => m.default),
  '/admin': () => import('./pages/admin.js').then(m => m.default),
  '/login': () => import('./pages/login.js').then(m => m.default),
  '/sobre': () => import('./pages/about.js').then(m => m.default),
  '/colecoes': () => import('./pages/collections.js').then(m => m.default),
  '/colecao/:slug': () => import('./pages/collection.js').then(m => m.default),
  '/unsubscribe': () => import('./pages/unsubscribe.js').then(m => m.default),
  '/cancelar-inscricao': () => import('./pages/unsubscribe.js').then(m => m.default)
};

let currentViewComponent = null;

export async function router() {
  const basePath = import.meta.env.BASE_URL; // e.g. "/" or "/poemas/"
  let path = window.location.pathname;
  
  // Normalize paths for matching
  const cleanBasePath = basePath.replace(/\/$/, ''); // Remove trailing slash if exists
  
  if (cleanBasePath && (path.startsWith(cleanBasePath + '/') || path === cleanBasePath)) {
    path = path.slice(cleanBasePath.length) || '/';
  }
  
  // Ensure path starts with / and remove duplicate and trailing slashes (except root)
  path = '/' + path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

  if (path === '/explore') {
    navigateTo('/colecoes');
    return;
  }
  
  if (path === '/aleatorio') {
    getRandomPoem();
    return;
  }
  
  const view = document.getElementById('main-content');
  
  const updateView = async () => {
    // Scroll to top on navigation
    window.scrollTo(0, 0);

    // Cleanup previous component if it exists
    if (currentViewComponent && typeof currentViewComponent.cleanup === 'function') {
      currentViewComponent.cleanup();
    }

    // Manage header search visibility
    const overlaySearchInput = document.getElementById('overlay-search-input');
    if (path !== '/') {
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
      const cleanPattern = '/' + routePattern.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

      if (cleanPattern === path) {
        match = componentFn;
        break;
      }
      
      // Check for params like :slug
      if (cleanPattern.includes(':')) {
        const patternParts = cleanPattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        if (patternParts.length === pathParts.length) {
          let isMatch = true;
          for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
              const paramName = patternParts[i].substring(1);
              params[paramName] = decodeURIComponent(pathParts[i]);
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
        
        const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
        const combinedParams = { ...params, ...searchParams };
        
        await component.render(view, combinedParams);
        
        // Update active nav state
        updateActiveNavLink();
        
        // Update meta tags if component provides them
        if (component.meta && component.meta.title) {
          const currentTitle = document.title;
          if (!currentTitle.includes(component.meta.title)) {
             document.title = `${component.meta.title} — Natanael Brentano`;
          }
        }

        // Anunciar para tecnologias assistivas (leitores de tela)
        const pageTitle = component.meta?.title || 'Página';
        const announcer = document.getElementById('route-announcer');
        if (announcer) {
          announcer.textContent = '';
          setTimeout(() => {
            announcer.textContent = `Navegando para: ${pageTitle}`;
          }, 50);
        }

        // Rastrear visita
        if (path !== '/admin' && path !== '/login' && !path.includes('/poema/')) {
          const runTracking = () => {
            import('./utils/analytics.js')
              .then(m => m.trackPageView(path))
              .catch(err => console.debug?.('[analytics]', err));
          };
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(runTracking);
          } else {
            setTimeout(runTracking, 200);
          }
        }
      } catch (e) {
        console.error('[Router Error]', e);
        
        if (e.message?.includes('Failed to fetch dynamically imported module') || 
            e.name === 'ChunkLoadError' ||
            e.message?.includes('error loading dynamically imported module')) {
          window.location.reload();
          return;
        }

        const errorText = String(e.stack || e.message || e);
        const safeErrorText = errorText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        view.innerHTML = `<h2>Erro ao carregar a página.</h2><pre style="color: red; text-align: left; padding: 1rem; background: #222; overflow-x: auto; font-size: 12px;">${safeErrorText}</pre>`;
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
  };

  if (document.startViewTransition) {
    try {
      const transition = document.startViewTransition(() => updateView());
      if (transition) {
        if (transition.finished) transition.finished.catch(() => {});
        if (transition.ready) transition.ready.catch(() => {});
        if (transition.updateCallbackDone) transition.updateCallbackDone.catch(() => {});
      }
    } catch {
      updateView();
    }
  } else {
    updateView();
  }
}

export function navigateTo(url) {
  const basePath = import.meta.env.BASE_URL;
  let finalUrl = url;
  
  if (url.startsWith('/') && basePath !== '/') {
    const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    // Only prepend if not already present (checking for trailing slash, query string, or exact match)
    const alreadyHasBase = url === cleanBase || url.startsWith(cleanBase + '/') || url.startsWith(cleanBase + '?');
    if (!alreadyHasBase) {
      finalUrl = cleanBase + url;
    }
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
