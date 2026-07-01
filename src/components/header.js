import { searchOverlay } from './search-overlay.js';
import { themeToggle } from './theme-toggle.js';
import { getRandomPoem } from '../utils/navigation.js';
import { favorites } from '../utils/favorites.js';

export const header = {
  render() {
    return `
      <header class="site-header">
        <div class="header-container">
          <a href="${import.meta.env.BASE_URL}" class="logo" data-link>Natanael Brentano</a>
          
          <div id="header-controls" style="display: flex; align-items: center; gap: var(--space-md);">
            <button id="search-toggle-btn" class="header-search-toggle" aria-label="Abrir busca">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>

            <div id="nav-overlay" class="nav-overlay"></div>
            <nav class="main-nav">
              <div class="nav-drawer-header">
                <span class="logo">Natanael Brentano</span>
                <button id="nav-close-btn" class="nav-close-btn" aria-label="Fechar menu">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <ul>
                <li><a href="${import.meta.env.BASE_URL}" data-link>Poemas</a></li>
                <li><a href="${import.meta.env.BASE_URL}colecoes" data-link>Coleções</a></li>
                <li><a href="${import.meta.env.BASE_URL}explore" data-link>Explorar</a></li>
                <li id="nav-favorites" style="display: none;"><a href="${import.meta.env.BASE_URL}favoritos" data-link>Biblioteca</a></li>
                <li><a href="${import.meta.env.BASE_URL}sobre" data-link>Sobre</a></li>
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
  },

  init() {
    searchOverlay.init();
    themeToggle.init();

    document.getElementById('search-toggle-btn').addEventListener('click', () => searchOverlay.open());
    document.getElementById('random-poem-btn').addEventListener('click', () => getRandomPoem());

    // Hamburger Menu
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navOverlay = document.getElementById('nav-overlay');
    const navCloseBtn = document.getElementById('nav-close-btn');
    
    const closeMenu = () => {
      mainNav.classList.remove('active');
      menuToggle.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.body.classList.remove('nav-open');
    };

    if (menuToggle && mainNav) {
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      
      const trapFocus = (e) => {
        if (e.key !== 'Tab' || !mainNav.classList.contains('active')) return;
        
        const focusableContent = mainNav.querySelectorAll(focusableElements);
        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      };

      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
        
        if (!isExpanded) {
          document.body.classList.add('nav-open');
          setTimeout(() => {
            const firstLink = mainNav.querySelector('a');
            if (firstLink) firstLink.focus();
          }, 100);
          document.addEventListener('keydown', trapFocus);
        } else {
          document.body.classList.remove('nav-open');
          document.removeEventListener('keydown', trapFocus);
        }
      });
      
      if (navCloseBtn) navCloseBtn.addEventListener('click', closeMenu);
      if (navOverlay) navOverlay.addEventListener('click', closeMenu);
      
      mainNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.hasAttribute('data-link')) {
          closeMenu();
          document.removeEventListener('keydown', trapFocus);
        }
      });

      // ESC to close menu
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
          closeMenu();
          menuToggle.focus();
          document.removeEventListener('keydown', trapFocus);
        }
      });
    }


    // Header scroll effect
    window.addEventListener('scroll', () => {
      const headerEl = document.querySelector('.site-header');
      if (headerEl) {
        headerEl.classList.toggle('scrolled', window.scrollY > 10);
      }
    });

    this.updateFavorites();
    window.addEventListener('favorites-updated', () => this.updateFavorites());
  },


  async updateFavorites() {
    const count = await favorites.count();
    const navFav = document.getElementById('nav-favorites');
    if (navFav) {
      navFav.style.display = count > 0 ? 'block' : 'none';
    }
  }
};
