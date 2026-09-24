import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import { initRouter } from './router.js';
import { header } from './components/header.js';
import { backToTop } from './components/back-to-top.js';
import { getRandomPoem } from './utils/navigation.js';

// Initialize Microsoft Clarity deferred after load/LCP
const initClarity = () => {
  const run = () => {
    import('@microsoft/clarity')
      .then(m => {
        const Clarity = m.default || m;
        Clarity.init('y5mmw0thvu');
      })
      .catch(err => console.debug?.('[clarity]', err));
  };

  const schedule = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 1500);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
    setTimeout(run, 3000);
  }
};
initClarity();

// Setup Initial Page Classes
if (window.location.pathname.includes('/poema/')) {
  document.body.classList.add('is-poem-page');
}

// Setup Base Layout (only if not already present from pre-rendering)
const appEl = document.querySelector('#app');
const existingMain = document.getElementById('main-content');
if (!existingMain && appEl) {
  appEl.innerHTML = `
  ${header.render()}
  <div id="mobile-brand" class="mobile-brand"><a href="${import.meta.env.BASE_URL}" data-link>Natanael Brentano</a></div>
  <main id="main-content" class="site-content container"></main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-info">
        &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
      </div>
      <div class="footer-social">
        <a href="${import.meta.env.BASE_URL}sentimentos" data-link class="footer-social-link">
          <span>Sentimentos</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" aria-label="Instagram @nfgbrentano" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          <span>@nfgbrentano</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="${import.meta.env.BASE_URL}feed.xml" target="_blank" aria-label="RSS Feed" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
          <span>RSS Feed</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="mailto:nfgbrentano@gmail.com" aria-label="Contato via e-mail" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <span>Contato</span>
        </a>
      </div>
    </div>
  </footer>
  <nav class="bottom-nav" aria-label="Navegação móvel principal">
    <a href="${import.meta.env.BASE_URL}" class="bottom-nav-item" data-link>
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      <span>Poemas</span>
    </a>
    <a href="${import.meta.env.BASE_URL}colecoes" class="bottom-nav-item" data-link>
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      <span>Coleções</span>
    </a>
    <button class="bottom-nav-item bottom-nav-search" id="bottom-search-btn" type="button" aria-label="Buscar poemas">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <span>Buscar</span>
    </button>
    <a href="${import.meta.env.BASE_URL}sobre" class="bottom-nav-item" data-link>
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <span>Sobre</span>
    </a>
    <button class="bottom-nav-item" id="bottom-settings-btn" type="button" aria-label="Ajustes">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      <span>Ajustes</span>
    </button>
  </nav>

  <div class="bottom-sheet-overlay" id="global-settings-overlay"></div>
  <div class="poem-settings-panel bottom-sheet" id="global-settings-sheet">
    <div class="bottom-sheet-handle"></div>
    <div class="settings-sheet-content" style="width: 100%;">
      <h3 style="margin-top: 0; margin-bottom: var(--space-md); font-family: var(--font-display); font-size: 1.2rem; text-align: center;">Ajustes</h3>
      
      <div style="margin-bottom: var(--space-lg);">
        <span id="current-theme-label" style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Tema: Automático</span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
          <button class="btn-theme-select btn-secondary" data-theme="light">Claro</button>
          <button class="btn-theme-select btn-secondary" data-theme="sepia">Sépia</button>
          <button class="btn-theme-select btn-secondary" data-theme="dark">Escuro</button>
          <button class="btn-theme-select btn-secondary" data-theme="contrast">Alto Contraste</button>
        </div>
      </div>

      <div>
        <button id="mobile-random-poem-btn" class="btn-secondary" style="width: 100%; justify-content: center; display: flex; gap: 8px;">
          ⚄ Poema Aleatório
        </button>
      </div>
    </div>
  </div>
`;
}

// Initialize Components
header.init();
backToTop.init();

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

document.getElementById('mobile-random-poem-btn')?.addEventListener('click', () => {
  closeSettings();
  getRandomPoem();
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
      .catch(err => console.log('SW registration failed:', err));
  });
}
