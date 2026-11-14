/**
 * Shell base compartilhado entre execução no cliente (src/main.js) e pré-renderização estática (scripts/prerender.js).
 * Garante paridade editorial, navegação e ajustes (RF02, CA02).
 */

export function renderHeaderHtml(baseUrl = '/') {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `
  <header class="site-header">
    <div class="header-container">
      <a href="${base}" class="logo" data-link>Natanael Fernando Gatti Brentano</a>
      
      <div id="header-controls" style="display: flex; align-items: center; gap: var(--space-md);">
        <button id="search-toggle-btn" class="header-search-toggle" aria-label="Buscar poemas" title="Buscar poemas (Pressione /)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>

        <div id="nav-overlay" class="nav-overlay"></div>
        <nav class="main-nav">
          <div class="nav-drawer-header">
            <span class="logo">Natanael Fernando Gatti Brentano</span>
            <button id="nav-close-btn" class="nav-close-btn" aria-label="Fechar menu">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <ul>
            <li><a href="${base}" data-link>Poemas</a></li>
            <li><a href="${base}colecoes/" data-link>Coleções</a></li>
            <li><a href="${base}sentimentos/" data-link>Sentimentos</a></li>
            <li><a href="${base}arquivo/" data-link>Arquivo</a></li>
            <li><a href="${base}favoritos/" data-link>Favoritos</a></li>
            <li><a href="${base}sobre/" data-link>Sobre</a></li>
          </ul>
        </nav>
        
        <button id="random-poem-btn" class="random-poem-btn" aria-label="Poema aleatório" title="Ver um poema aleatório">
          ⚄ <span class="btn-text">Aleatório</span>
        </button>

        <button id="mode-toggle" class="theme-toggle" aria-label="Alternar modo de visualização">
          <span class="icon-moon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
          <span class="icon-sun"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></span>
          <span class="icon-sepia" style="display:none;"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></span>
          <span class="icon-contrast" style="display:none;"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a6,6,0,0,0,0,12V6Z"></path></svg></span>
        </button>

        <button id="menu-toggle" class="menu-toggle" aria-label="Menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12" class="line-1"></line><line x1="3" y1="6" x2="21" y2="6" class="line-2"></line><line x1="3" y1="18" x2="21" y2="18" class="line-3"></line></svg>
        </button>
      </div>
    </div>
  </header>
  `;
}

export function renderOfflineIndicatorHtml() {
  return `
  <div id="offline-indicator" class="offline-indicator" role="status" aria-live="polite" hidden>
    <span class="offline-indicator-icon" aria-hidden="true">📡</span>
    <span class="offline-indicator-text">Você está navegando em modo offline. O acervo local continua disponível para leitura.</span>
  </div>
  `;
}

export function renderSiteFooter({ baseUrl = '/', currentYear = new Date().getFullYear() } = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-info">
        &copy; ${currentYear} Natanael Fernando Gatti Brentano. Todos os direitos reservados.
      </div>
      <div class="footer-social">
        <a href="${base}sentimentos/" data-link class="footer-social-link">
          <span>Sentimentos</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="${base}arquivo/" data-link class="footer-social-link">
          <span>Arquivo</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" aria-label="Instagram @nfgbrentano" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          <span>@nfgbrentano</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="${base}feed.xml" target="_blank" aria-label="RSS Feed" class="footer-social-link">
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
  `;
}

export function renderBottomNav({ baseUrl = '/' } = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `
  <nav class="bottom-nav" aria-label="Navegação principal">
    <div class="bottom-nav-inner">
      <a href="${base}" class="bottom-nav-item" data-link>
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>Poemas</span>
      </a>
      <a href="${base}colecoes/" class="bottom-nav-item" data-link>
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Coleções</span>
      </a>
      <button class="bottom-nav-item bottom-nav-search" id="bottom-search-btn" type="button" aria-label="Buscar poemas">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>Buscar</span>
      </button>
      <a href="${base}sobre/" class="bottom-nav-item" data-link>
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>Sobre</span>
      </a>
      <button class="bottom-nav-item" id="bottom-settings-btn" type="button" aria-label="Ajustes">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        <span>Ajustes</span>
      </button>
    </div>
  </nav>
  `;
}

export function renderGlobalSettingsSheet({ baseUrl = '/' } = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `
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

      <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
        <a href="${base}arquivo/" class="btn-secondary" style="width: 100%; justify-content: center; display: flex; gap: 8px; text-decoration: none; align-items: center;" data-link>
          📅 Linha do Tempo e Arquivo
        </a>
        <a href="${base}favoritos/" class="btn-secondary" style="width: 100%; justify-content: center; display: flex; gap: 8px; text-decoration: none; align-items: center;" data-link>
          🔖 Poemas Favoritos
        </a>
        <button id="mobile-random-poem-btn" class="btn-secondary" style="width: 100%; justify-content: center; display: flex; gap: 8px;">
          ⚄ Poema Aleatório
        </button>
      </div>
    </div>
  </div>
  `;
}

export function renderBaseShell({
  headerHtml,
  offlineIndicatorHtml,
  mainContentHtml = '',
  mainAttrs = '',
  baseUrl = '/',
  currentYear = new Date().getFullYear()
} = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const hHtml = headerHtml !== undefined ? headerHtml : renderHeaderHtml(base);
  const oHtml = offlineIndicatorHtml !== undefined ? offlineIndicatorHtml : renderOfflineIndicatorHtml();
  return `
  ${hHtml}
  ${oHtml}
  <div id="mobile-brand" class="mobile-brand"><a href="${base}" data-link>Natanael Fernando Gatti Brentano</a></div>
  <main id="main-content" class="site-content container"${mainAttrs ? ` ${mainAttrs}` : ''}>
    ${mainContentHtml}
  </main>
  ${renderSiteFooter({ baseUrl: base, currentYear })}
  ${renderBottomNav({ baseUrl: base })}
  ${renderGlobalSettingsSheet({ baseUrl: base })}
  `;
}
