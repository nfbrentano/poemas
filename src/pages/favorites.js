import { favorites } from '../utils/favorites.js';
import { updateSEO } from '../utils/seo.js';

export default {
  meta: {
    title: 'Poemas Salvos'
  },
  cleanup() {
  },
  async render(container) {
    updateSEO({
      title: 'Poemas Salvos',
      description: 'Sua coleção pessoal de poemas favoritos.',
      type: 'website'
    });

    container.innerHTML = `
      <div class="favorites-page fade-in">
        <header class="page-header">
          <h1 class="page-title">Poemas Salvos</h1>
          <p class="page-subtitle">Sua biblioteca pessoal disponível offline.</p>
        </header>
        
        <div id="favorites-list" class="favorites-list">
          <div class="loading-container">Carregando seus favoritos...</div>
        </div>
      </div>
    `;

    const listContainer = document.getElementById('favorites-list');
    const BASE_URL = import.meta.env.BASE_URL;

    const renderList = async () => {
      const items = await favorites.list();
      
      if (items.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <p class="empty-state-label">♡</p>
            <h2 class="empty-state-title">Nenhum poema salvo ainda.</h2>
            <p class="empty-state-desc">Explore as obras e use o botão "Salvar" para guardá-las aqui.</p>
            <a href="${BASE_URL}" data-link class="btn-secondary" style="margin-top: var(--space-xl); display: inline-block;">Explorar Poemas</a>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = items.map(poem => {
        const year = new Date(poem.published_at).getFullYear();
        return `
          <article class="favorite-item">
            <div class="favorite-content">
              <a href="${BASE_URL}poema/${poem.slug}" data-link class="favorite-link">
                <h3 class="favorite-title">${poem.title}</h3>
                <p class="favorite-excerpt">${poem.excerpt || ''}</p>
                <span class="favorite-year">${year}</span>
              </a>
            </div>
            <button class="remove-fav-btn" data-slug="${poem.slug}" aria-label="Remover dos favoritos">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </article>
        `;
      }).join('');

      // Add remove listeners
      listContainer.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const slug = btn.dataset.slug;
          await favorites.remove(slug);
          renderList();
          // Notify main.js to update header if needed
          window.dispatchEvent(new CustomEvent('favorites-updated'));
        });
      });
    };

    renderList();
  }
};
