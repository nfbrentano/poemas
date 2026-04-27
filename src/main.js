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
      
      <div style="display: flex; align-items: center; gap: var(--space-sm);">
        <div id="header-search-container" class="header-search-container"></div>

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

        <button id="mode-toggle" class="theme-toggle" aria-label="Alternar modo de visualização" title="Alternar entre modo escuro, claro e alto contraste">
          <span class="icon-moon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
          <span class="icon-sun"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></span>
          <span class="icon-contrast" style="display:none;"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a6,6,0,0,0,0,12V6Z"></path></svg></span>
        </button>
      </div>
    </div>
  </header>

  <main id="main-content" class="site-content container"></main>
  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
    </div>
  </footer>
`;

// Dinamicamente cria os botões do cabeçalho
const headerSearchContainer = document.querySelector('#header-search-container');
if (headerSearchContainer) {
  // Cria botão de busca para mobile
  const searchToggleBtn = document.createElement('button');
  searchToggleBtn.id = 'search-toggle-btn';
  searchToggleBtn.className = 'header-search-toggle';
  searchToggleBtn.setAttribute('aria-label', 'Abrir busca');
  searchToggleBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  headerSearchContainer.appendChild(searchToggleBtn);
  
  // Cria hambúrguer menu
  const menuToggleBtn = document.createElement('button');
  menuToggleBtn.id = 'menu-toggle';
  menuToggleBtn.className = 'menu-toggle';
  menuToggleBtn.setAttribute('aria-label', 'Menu');
  menuToggleBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12" class="line-1"></line><line x1="3" y1="6" x2="21" y2="6" class="line-2"></line><line x1="3" y1="18" x2="21" y2="18" class="line-3"></line></svg>';
  headerSearchContainer.appendChild(menuToggleBtn);
  
  // Lógica do overlay de busca
  let searchOverlay = null;
  
  const createSearchOverlay = () => {
    if (searchOverlay) return searchOverlay;
    
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.className = 'search-overlay';
    searchOverlay.innerHTML = `
      <div class="search-overlay-content">
        <button class="search-overlay-close" id="search-close-btn" aria-label="Fechar busca">&times;</button>
        <input type="search" id="overlay-search-input" placeholder="Buscar poema..." aria-label="Buscar poema">
        <p class="search-overlay-help">Digite para filtrar os poemas</p>
      </div>
    `;
    document.body.appendChild(searchOverlay);
    return searchOverlay;
  };
  
  const openSearchOverlay = () => {
    const overlay = createSearchOverlay();
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const input = overlay.querySelector('#overlay-search-input');
      if (input) input.focus();
    }, 100);
  };
  
  const closeSearchOverlay = () => {
    if (searchOverlay) {
      searchOverlay.classList.remove('active');
      searchOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
  
  searchToggleBtn.addEventListener('click', openSearchOverlay);
  
  document.addEventListener('click', (e) => {
    if (searchOverlay && 
        searchOverlay.classList.contains('active') &&
        e.target === searchOverlay) {
      closeSearchOverlay();
    }
    if (e.target.id === 'search-close-btn') {
        closeSearchOverlay();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
      closeSearchOverlay();
    }
  });
  
  // Lógica do hambúrguer menu
  const mainNav = document.querySelector('.main-nav');
  if (mainNav && menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
      menuToggleBtn.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
      menuToggleBtn.classList.toggle('active');
    });
    
    // Fecha menu ao clicar em um link
    mainNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.hasAttribute('data-link')) {
        mainNav.classList.remove('active');
        menuToggleBtn.classList.remove('active');
        menuToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // CSS para o overlay
  const style = document.createElement('style');
  style.textContent = `
    .search-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(5px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .search-overlay.active {
      opacity: 1;
    }
    .search-overlay-content {
      position: relative;
      width: 90%;
      max-width: 600px;
      background: var(--bg-primary);
      border-radius: 8px;
      padding: var(--space-xl);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }
    .search-overlay.active .search-overlay-content {
      transform: translateY(0);
    }
    .search-overlay-close {
      position: absolute;
      top: var(--space-md);
      right: var(--space-md);
      background: none;
      border: none;
      font-size: 2rem;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s;
    }
    .search-overlay-close:hover {
      color: var(--accent-subtle);
    }
    #overlay-search-input {
      width: 100%;
      padding: var(--space-lg);
      font-size: 1.5rem;
      border: none;
      border-bottom: 2px solid var(--border-strong);
      background: transparent;
      color: var(--text-primary);
      font-family: var(--font-main);
    }
    #overlay-search-input:focus {
      outline: none;
      border-color: var(--accent-subtle);
    }
    .search-overlay-help {
      margin-top: var(--space-md);
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
    }
    .menu-toggle.active .line-1 {
      transform: translateY(6px) rotate(45deg);
      transform-origin: center;
    }
    .menu-toggle.active .line-2 {
      opacity: 0;
    }
    .menu-toggle.active .line-3 {
      transform: translateY(-6px) rotate(-45deg);
      transform-origin: center;
    }
  `;
  document.head.appendChild(style);
}


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
