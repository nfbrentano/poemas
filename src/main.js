import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import { initRouter } from './router.js';
import { header } from './components/header.js';

// Setup Base Layout
document.querySelector('#app').innerHTML = `
  ${header.render()}
  <main id="main-content" class="site-content container"></main>
  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
    </div>
  </footer>
`;

// Initialize Components
header.init();

// Initialize Router
initRouter();

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
