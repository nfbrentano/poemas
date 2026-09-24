import { updateActiveNavLink, getRandomPoem } from './utils/navigation.js';
import { setNotFoundSEO, updateSEO } from './utils/seo.js';
import { setStructuredData, SITE_URL } from './utils/structured-data.js';
import legacyRedirects from '../scripts/legacy-redirects.json';

export const routes = {
  '/': () => import('./pages/home.js').then(m => m.default),
  '/poema/:slug': () => import('./pages/poem.js').then(m => m.default),
  '/admin': () => import('./pages/admin.js').then(m => m.default),
  '/login': () => import('./pages/login.js').then(m => m.default),
  '/sobre': () => import('./pages/about.js').then(m => m.default),
  '/colecoes': () => import('./pages/collections.js').then(m => m.default),
  '/colecao/:slug': () => import('./pages/collection.js').then(m => m.default),
  '/sentimentos': () => import('./pages/sentiments.js').then(m => m.default),
  '/sentimento/:slug': () => import('./pages/sentiment.js').then(m => m.default),
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

  // Check legacy redirects (e.g. /?p=277, /2021/02/18/277, etc.)
  const fullPathWithQuery = path + window.location.search;
  const legacyTarget = legacyRedirects[fullPathWithQuery] || legacyRedirects[window.location.search] || legacyRedirects[path];
  if (legacyTarget && legacyTarget !== path && legacyTarget !== fullPathWithQuery) {
    navigateTo(legacyTarget);
    return;
  }

  // RF09 & CT04: Redirecionar /tag/<slug> e /?tag=<slug> para /sentimento/<slug>/
  if (path.startsWith('/tag/')) {
    const tagSlug = path.replace(/^\/tag\/?/, '').replace(/\/$/, '');
    if (tagSlug) {
      navigateTo(`/sentimento/${tagSlug}/`);
      return;
    }
  }

  const searchTag = new URLSearchParams(window.location.search).get('tag');
  if (searchTag && path === '/') {
    navigateTo(`/sentimento/${searchTag}/`);
    return;
  }

  if (path === '/info') {
    navigateTo('/sobre');
    return;
  }

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
    
    const mobileBrand = document.getElementById('mobile-brand');
    if (mobileBrand) {
      if (path === '/') {
        mobileBrand.style.display = 'none';
      } else {
        mobileBrand.style.display = 'block';
      }
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
              try {
                params[paramName] = decodeURIComponent(pathParts[i]);
              } catch (_) {
                params[paramName] = pathParts[i];
              }
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
        try { sessionStorage.removeItem('chunk_retry'); } catch (_) {}
        
        // Update active nav state
        updateActiveNavLink();
        
        // Update meta tags if component provides them
        if (component.meta && component.meta.title) {
          const currentTitle = document.title;
          const metaTitle = component.meta.title;
          if (!currentTitle.includes(metaTitle)) {
             document.title = metaTitle.includes('Natanael Brentano')
               ? metaTitle
               : `${metaTitle} — Natanael Brentano`;
          }
        }

        if (component.meta && component.meta.robots) {
          let robotsTag = document.querySelector('meta[name="robots"]');
          if (!robotsTag) {
            robotsTag = document.createElement('meta');
            robotsTag.setAttribute('name', 'robots');
            document.head.appendChild(robotsTag);
          }
          robotsTag.setAttribute('content', component.meta.robots);
          if (component.meta.robots.includes('noindex')) {
            setStructuredData([]);
          }
        } else {
          document.querySelector('meta[name="robots"]')?.remove();
        }

        // RF07: Garantir que nenhuma rota SPA herde dados de <head> da rota anterior
        const currentCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
        const expectedCanonicalPath = path.endsWith('/') ? path : `${path}/`;
        if (!currentCanonical.endsWith(expectedCanonicalPath)) {
          const metaTitle = component.meta?.title;
          const defaultPageTitle = metaTitle
            ? (metaTitle.includes('Natanael Brentano') ? metaTitle : `${metaTitle} — Natanael Brentano`)
            : 'Poemas Brasileiros — Natanael Brentano';

          updateSEO({
            title: defaultPageTitle,
            description: component.meta?.description || '',
            url: `${SITE_URL}${expectedCanonicalPath}`,
            robots: component.meta?.robots || undefined,
            structuredData: []
          });
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
        
        const errStr = String(e?.message || e || '');
        const isChunkError = 
          errStr.includes('Failed to fetch dynamically imported module') || 
          errStr.includes('Importing a module script failed') ||
          errStr.includes('error loading dynamically imported module') ||
          errStr.includes('failed to load module script') ||
          e?.name === 'ChunkLoadError';

        if (isChunkError) {
          let hasRetried = false;
          try {
            hasRetried = sessionStorage.getItem('chunk_retry') === 'true';
            if (!hasRetried) sessionStorage.setItem('chunk_retry', 'true');
          } catch (_) {}

          if (!hasRetried) {
            const clearAndReload = async () => {
              try {
                if ('caches' in window) {
                  const names = await caches.keys();
                  await Promise.all(names.map(n => caches.delete(n)));
                }
                if ('serviceWorker' in navigator) {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const reg of registrations) {
                    await reg.update().catch(() => {});
                  }
                }
              } catch (_) {}
              window.location.reload();
            };
            clearAndReload();
            return;
          }
        }

        const errorText = String(e.stack || e.message || e);
        const safeErrorText = errorText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        view.innerHTML = `
          <div style="padding: 2rem; text-align: center; max-width: 600px; margin: 3rem auto;">
            <h2>Erro ao carregar a página.</h2>
            <p style="color: var(--text-muted); margin: 1rem 0;">Uma nova versão do site pode ter sido publicada.</p>
            <button id="chunk-reload-btn" class="btn-primary" style="margin-bottom: 1.5rem; cursor: pointer;">Recarregar página</button>
            <pre style="color: red; text-align: left; padding: 1rem; background: #222; overflow-x: auto; font-size: 12px; border-radius: 4px;">${safeErrorText}</pre>
          </div>
        `;
        const reloadBtn = document.getElementById('chunk-reload-btn');
        if (reloadBtn) {
          reloadBtn.addEventListener('click', async () => {
            try {
              sessionStorage.removeItem('chunk_retry');
              if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(n => caches.delete(n)));
              }
              if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                  await reg.unregister().catch(() => {});
                }
              }
            } catch (_) {}
            window.location.reload();
          });
        }
      }
    } else {
      currentViewComponent = null;
      setNotFoundSEO();
      view.innerHTML = `
        <div class="not-found-page fade-in">
          <p class="not-found-label">404</p>
          <h2 class="not-found-title">Página não encontrada</h2>
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
  window.removeEventListener('popstate', window.__routerPopstateHandler);
  window.__routerPopstateHandler = router;
  window.addEventListener('popstate', window.__routerPopstateHandler);

  if (!window.__vitePreloadErrorHandler) {
    window.__vitePreloadErrorHandler = (event) => {
      event.preventDefault();
      let hasRetried = false;
      try {
        hasRetried = sessionStorage.getItem('chunk_retry') === 'true';
        if (!hasRetried) sessionStorage.setItem('chunk_retry', 'true');
      } catch (_) {}

      if (!hasRetried) {
        const clearAndReload = async () => {
          try {
            if ('caches' in window) {
              const names = await caches.keys();
              await Promise.all(names.map(n => caches.delete(n)));
            }
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const reg of registrations) {
                await reg.update().catch(() => {});
              }
            }
          } catch (_) {}
          window.location.reload();
        };
        clearAndReload();
      }
    };
    window.addEventListener('vite:preloadError', window.__vitePreloadErrorHandler);
  }
  
  document.body.removeEventListener('click', window.__routerClickHandler);
  window.__routerClickHandler = (e) => {
    const link = e.target.closest('[data-link]');
    
    if (!link) return;

    // Allow opening in new tab with modifiers or middle click
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    // Allow native behavior for target="_blank"
    if (link.target === '_blank') {
      return;
    }

    // Allow native behavior for external links
    if (link.origin && link.origin !== window.location.origin) {
      return;
    }

    e.preventDefault();
    navigateTo(link.getAttribute('href') || link.href);
  };
  document.body.addEventListener('click', window.__routerClickHandler);

  // Handle redirect from 404.html (sessionStorage or ?redirect= fallback)
  let redirect = null;
  try {
    redirect = sessionStorage.getItem('redirect');
    if (redirect) sessionStorage.removeItem('redirect');
  } catch (_) {}

  if (!redirect) {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    if (redirectParam) {
      redirect = decodeURIComponent(redirectParam);
    }
  }

  if (redirect) {
    window.history.replaceState(null, null, redirect);
  }
  
  router();
}

