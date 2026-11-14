import { themeToggle } from './theme-toggle.js';
import { getRandomPoem } from '../utils/navigation.js';
import { renderHeaderHtml } from '../utils/shell-template.js';

export const header = {
  render() {
    return renderHeaderHtml(import.meta.env.BASE_URL);
  },

  init() {
    themeToggle.init();

    const openSearch = async () => {
      const { searchOverlay } = await import('./search-overlay.js');
      searchOverlay.open();
    };

    document.getElementById('search-toggle-btn')?.addEventListener('click', openSearch);
    document.getElementById('bottom-search-btn')?.addEventListener('click', openSearch);
    document.getElementById('random-poem-btn')?.addEventListener('click', (e) => getRandomPoem(e));

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        openSearch();
      }
    });
  }
};
