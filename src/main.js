import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import { initRouter } from './router.js';
import { header } from './components/header.js';
import { backToTop } from './components/back-to-top.js';
import { offlineIndicator } from './components/offline-indicator.js';
import { getRandomPoem } from './utils/navigation.js';
import { unwrapSafeHTML } from './utils/html.js';
import { renderBaseShell } from './utils/shell-template.js';
import { initGlobalErrorTracking, reportError } from './utils/error-reporter.js';

// Inicializa observabilidade global de erros no front-end (RF01, CA01)
initGlobalErrorTracking();


// Setup Initial Page Classes
if (window.location.pathname.includes('/poema/')) {
  document.body.classList.add('is-poem-page');
}

// Setup Base Layout (only if not already present from pre-rendering)
const appEl = document.querySelector('#app');
const existingMain = document.getElementById('main-content');
if (!existingMain && appEl) {
  appEl.innerHTML = unwrapSafeHTML(renderBaseShell({
    headerHtml: header.render(),
    offlineIndicatorHtml: offlineIndicator.render(),
    baseUrl: import.meta.env.BASE_URL
  }));
}

// Initialize Components
header.init();
backToTop.init();
offlineIndicator.init();

// Pré-aquecimento das rotas de leitura em background ocioso (CA01, CA02, CA08)
if (typeof window !== 'undefined') {
  const warmUpRoutes = () => {
    import('./pages/poem.js').catch(() => {});
    import('./pages/collection.js').catch(() => {});
    import('./pages/sentiment.js').catch(() => {});
    import('./pages/favorites.js').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warmUpRoutes);
  } else {
    setTimeout(warmUpRoutes, 1500);
  }
}

// Global Settings logic
const settingsBtn = document.getElementById('bottom-settings-btn');
const settingsOverlay = document.getElementById('global-settings-overlay');
const settingsSheet = document.getElementById('global-settings-sheet');

const openSettings = () => {
  settingsOverlay?.classList.add('active');
  settingsSheet?.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeSettings = () => {
  settingsOverlay?.classList.remove('active');
  settingsSheet?.classList.remove('active');
  document.body.style.overflow = '';
};

settingsBtn?.addEventListener('click', openSettings);
settingsOverlay?.addEventListener('click', closeSettings);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && settingsSheet?.classList.contains('active')) {
    closeSettings();
  }
});

document.getElementById('mobile-random-poem-btn')?.addEventListener('click', () => {
  closeSettings();
  getRandomPoem();
});

settingsSheet?.querySelectorAll('a[data-link]').forEach(a => {
  a.addEventListener('click', closeSettings);
});

// Initialize Router
initRouter();

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => {
        // Automatically check for SW updates
        reg.update().catch(() => {});
      })
      .catch(err => {
        console.log('SW registration failed:', err);
        reportError(err, {
          category: 'sw',
          severity: 'warning',
          context: { phase: 'service_worker_register' }
        });
      });
  });
}
