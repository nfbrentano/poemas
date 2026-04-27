import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import { initRouter } from './router.js';
import { updateActiveNavLink, getRandomPoem } from './utils/navigation.js';
import { favorites } from './utils/favorites.js';

// Setup Base Layout
document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <a href="${import.meta.env.BASE_URL}" class="logo" data-link>Natanael Brentano</a>
      
      <div id="header-search-container" class="header-search-container" style="display: none;">
        <input type="search" id="header-search-input" placeholder="Buscar poema..." aria-label="Buscar poema">
      </div>

      <div style="display: flex; align-items: center;">
        <button id="search-toggle-btn" class="search-toggle-btn" aria-label="Abrir busca" style="display: none;">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>

        <nav class="main-nav">
          <ul>
            <li><a href="${import.meta.env.BASE_URL}" data-link>Poemas</a></li>
            <li id="nav-favorites" style="display: none;"><a href="${import.meta.env.BASE_URL}favoritos" data-link>Salvos</a></li>
            <li><a href="${import.meta.env.BASE_URL}sobre" data-link>Sobre</a></li>
          </ul>
        </nav>
        
        <button id="random-poem-btn" class="random-poem-btn" aria-label="Poema aleatório" title="Ver um poema aleatório">
          ⚄ <span class="btn-text">Aleatório</span>
        </button>

        <button id="menu-toggle" class="menu-toggle" aria-label="Menu" title="Abrir menu">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" class="line-1"></line>
            <line x1="3" y1="6" x2="21" y2="6" class="line-2"></line>
            <line x1="3" y1="18" x2="21" y2="18" class="line-3"></line>
          </svg>
        </button>
        <button id="mode-toggle" class="theme-toggle" aria-label="Alternar modo de visualização" title="Alternar entre modo escuro, claro e alto contraste">
          <span class="icon-moon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
          <span class="icon-sun"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></span>
          <span class="icon-contrast" style="display:none;"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a6,6,0,0,0,0,12V6Z"></path></svg></span>
        </button>
      </div>
    </div>
  </header>

  <div id="search-overlay" class="search-overlay">
    <button id="search-close-btn" class="search-close-btn" aria-label="Fechar busca">✕</button>
    <div class="search-overlay-content">
      <input type="search" id="mobile-search-input" placeholder="Buscar poema..." aria-label="Buscar poema mobile">
      <p class="search-overlay-help">Digite para filtrar os poemas</p>
    </div>
  </div>

  <main id="main-content" class="site-content container"></main>
  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
    </div>
  </footer>
`;

// Unified Mode Logic (Dark -> Light -> High Contrast)
const modeToggle = document.getElementById('mode-toggle');
let currentMode = localStorage.getItem('site-mode') || 'dark'; // dark, light, contrast

const applyMode = (mode) => {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-high-contrast');
  
  const moon = modeToggle.querySelector('.icon-moon');
  const sun = modeToggle.querySelector('.icon-sun');
  const contrast = modeToggle.querySelector('.icon-contrast');
  
  [moon, sun, contrast].forEach(el => el.style.display = 'none');

  if (mode === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    sun.style.display = 'block';
    modeToggle.setAttribute('aria-label', 'Mudar para modo de alto contraste');
  } else if (mode === 'contrast') {
    document.documentElement.setAttribute('data-high-contrast', 'true');
    contrast.style.display = 'block';
    modeToggle.setAttribute('aria-label', 'Mudar para modo escuro');
  } else {
    // dark is default
    moon.style.display = 'block';
    modeToggle.setAttribute('aria-label', 'Mudar para modo claro');
  }
  
  localStorage.setItem('site-mode', mode);
};

applyMode(currentMode);
modeToggle.addEventListener('click', () => {
  if (currentMode === 'dark') currentMode = 'light';
  else if (currentMode === 'light') currentMode = 'contrast';
  else currentMode = 'dark';
  
  applyMode(currentMode);
});

// Search Overlay Logic
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchOverlay = document.getElementById('search-overlay');
const searchCloseBtn = document.getElementById('search-close-btn');
const mobileSearchInput = document.getElementById('mobile-search-input');

const openSearch = () => {
  searchOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => mobileSearchInput.focus(), 100);
};

const closeSearch = () => {
  searchOverlay.classList.remove('active');
  document.body.style.overflow = '';
};

searchToggleBtn?.addEventListener('click', openSearch);
searchCloseBtn?.addEventListener('click', closeSearch);

// Close on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSearch();
  }
});

// Hamburger Menu Logic
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.querySelector('.site-header .main-nav');

menuToggle?.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', !isExpanded);
  mainNav?.classList.toggle('active');
  menuToggle.classList.toggle('active');
});

// Random Poem logic
const randomPoemBtn = document.getElementById('random-poem-btn');
randomPoemBtn?.addEventListener('click', () => {
  getRandomPoem();
});

// Favorites Nav Visibility logic
const updateFavoritesNav = async () => {
  const count = await favorites.count();
  const navFav = document.getElementById('nav-favorites');
  if (navFav) {
    navFav.style.display = count > 0 ? 'block' : 'none';
  }
};

updateFavoritesNav();
window.addEventListener('favorites-updated', updateFavoritesNav);

// Close menu on link click
mainNav?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    mainNav.classList.remove('active');
    menuToggle?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }
});

// Load reading font size preference
const savedReadingFont = localStorage.getItem('reading-font-size') || 'font-reading-md';
document.documentElement.classList.add(savedReadingFont);

// Add scroll listener for header
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (header) {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Initialize Router
initRouter();
updateActiveNavLink();
updateFavoritesNav();

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
