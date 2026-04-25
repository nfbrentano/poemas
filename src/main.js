import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import { initRouter } from './router.js';
import { updateActiveNavLink } from './utils/navigation.js';

// Setup Base Layout
document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <a href="${import.meta.env.BASE_URL}" class="logo" data-link>Natanael Brentano</a>
      <div style="display: flex; align-items: center;">
        <nav class="main-nav">
          <ul>
            <li><a href="${import.meta.env.BASE_URL}" data-link>Poemas</a></li>
          </ul>
        </nav>
        <button id="contrast-toggle" class="theme-toggle" aria-label="Ativar alto contraste" title="Alternar alto contraste">
          <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a6,6,0,0,0,0,12V6Z"></path></svg>
        </button>
        <button id="theme-toggle" class="theme-toggle">
          <span class="icon-moon">
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </span>
          <span class="icon-sun">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </span>
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

// Theme & Contrast Logic
const themeToggle = document.getElementById('theme-toggle');
const contrastToggle = document.getElementById('contrast-toggle');
const currentTheme = localStorage.getItem('theme') || 'dark';
const currentContrast = localStorage.getItem('high-contrast') === 'true';

const updateThemeAria = (theme) => {
  const label = theme === 'light' ? 'Alternar para modo escuro' : 'Alternar para modo claro';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
};

if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}
if (currentContrast) {
  document.documentElement.setAttribute('data-high-contrast', 'true');
  contrastToggle.setAttribute('aria-label', 'Desativar alto contraste');
}
updateThemeAria(currentTheme);

themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeAria(theme);
});

contrastToggle.addEventListener('click', () => {
  const isHigh = document.documentElement.getAttribute('data-high-contrast') === 'true';
  const newHigh = !isHigh;
  document.documentElement.setAttribute('data-high-contrast', newHigh);
  localStorage.setItem('high-contrast', newHigh);
  contrastToggle.setAttribute('aria-label', newHigh ? 'Desativar alto contraste' : 'Ativar alto contraste');
});

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

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
