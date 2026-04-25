export const routes = {
  '/': () => import('./pages/home.js').then(m => m.default),
  '/poema/:slug': () => import('./pages/poem.js').then(m => m.default),
  '/admin': () => import('./pages/admin.js').then(m => m.default),
  '/login': () => import('./pages/login.js').then(m => m.default)
};

export async function router() {
  const path = window.location.pathname;
  const view = document.getElementById('router-view');
  
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
      
      // Update meta tags if component provides them
      if (component.meta) {
        if (component.meta.title) document.title = component.meta.title;
      }
    } catch (e) {
      console.error(e);
      view.innerHTML = '<h2>Erro ao carregar a página.</h2>';
    }
  } else {
    view.innerHTML = '<h2>Página não encontrada (404)</h2><p><a href="/" data-link>Voltar para o início</a></p>';
  }
}

export function navigateTo(url) {
  history.pushState(null, null, url);
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
