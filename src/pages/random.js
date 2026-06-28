import { getRandomPoem } from '../utils/navigation.js';

export default {
  meta: {
    title: 'Poema Aleatório'
  },
  cleanup() {},
  async render(container) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50vh; text-align:center; font-family:var(--font-ui);">
        <div class="skeleton-pulse" style="font-size:1.5rem; font-family:var(--font-display); color:var(--text-secondary); margin-bottom:var(--space-md);">Sorteando um poema...</div>
        <p style="color:var(--text-muted); font-size:0.9rem;">Deixe o acaso guiar sua leitura.</p>
      </div>
    `;
    setTimeout(() => {
      getRandomPoem();
    }, 400);
  }
};
