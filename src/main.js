import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import { initRouter } from './router.js';

// Setup Base Layout
document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <a href="/" class="logo" data-link>Natanael Brentano</a>
      <nav class="main-nav">
        <ul>
          <li><a href="/" data-link>Poemas</a></li>
          <li><a href="/sobre" data-link>Sobre</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main id="router-view" class="site-content container"></main>
  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
    </div>
  </footer>
`;

// Add scroll listener for header
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Initialize Router
initRouter();
