import { getPublishedPoems } from '../utils/poems-store.js';
import { getFavorites, removeFavorite } from '../utils/favorites.js';
import { updateSEO } from '../utils/seo.js';
import { breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { stripHtml, escapeHtml, unwrapSafeHTML } from '../utils/html.js';
import { toast } from '../components/toast.js';

export const favorites = {
  meta: {
    title: 'Poemas Favoritos — Natanael Fernando Gatti Brentano',
    robots: 'noindex, nofollow'
  },

  async render(container) {
    const baseUrl = import.meta.env.BASE_URL;

    // Atualiza metadados com noindex, nofollow (RNF02, CA09)
    updateSEO({
      title: 'Poemas Favoritos — Natanael Fernando Gatti Brentano',
      description: 'Seus poemas favoritos salvos para reler e revisitar.',
      url: `${SITE_URL}/favoritos/`,
      type: 'website',
      robots: 'noindex, nofollow',
      structuredData: [
        breadcrumbSchema([
          { name: 'Início', url: `${SITE_URL}/` },
          { name: 'Favoritos', url: `${SITE_URL}/favoritos/` }
        ])
      ]
    });

    document.title = 'Poemas Favoritos — Natanael Fernando Gatti Brentano';

    // Esqueleto inicial
    container.innerHTML = unwrapSafeHTML(`
      <div class="favorites-page fade-in">
        <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: var(--space-md);"></div>
        <div class="skeleton" style="width: 220px; height: 32px; margin-bottom: var(--space-sm);"></div>
        <div class="skeleton" style="width: 320px; height: 18px; margin-bottom: var(--space-xl);"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
      </div>
    `);

    // Busca acervo publicado e lista de favoritos
    let published = [];
    try {
      published = await getPublishedPoems();
    } catch {
      published = [];
    }

    const renderContent = () => {
      const favs = getFavorites();
      
      // Cruza favoritos com o cache de publicados (RF06, CA06)
      // Mantém a ordem exata dos favoritos (mais recente primeiro - RF03, CA04)
      const matchingItems = [];
      for (const fav of favs) {
        const poem = published.find(p => p.slug === fav.slug || (fav.id && p.id === fav.id));
        if (poem) {
          matchingItems.push({ poem, fav });
        }
      }

      const breadcrumbItems = [
        { name: 'Início', url: baseUrl },
        { name: 'Favoritos', url: `${baseUrl}favoritos/` }
      ];
      const breadcrumbsHtml = renderBreadcrumbsHtml(breadcrumbItems);

      // Estado Vazio (RF04, CA05)
      if (matchingItems.length === 0) {
        container.innerHTML = unwrapSafeHTML(`
          <div class="favorites-page fade-in">
            ${breadcrumbsHtml}
            <header class="favorites-header">
              <h1 class="favorites-title">Poemas Favoritos</h1>
              <p class="favorites-subtitle">Seus poemas salvos para reler e revisitar.</p>
            </header>
            <div class="favorites-empty">
              <div class="empty-icon" aria-hidden="true">🔖</div>
              <h2 class="empty-title">Nenhum poema favoritado ainda</h2>
              <p class="empty-desc">
                Quando encontrar versos que tocam sua alma, clique no botão <strong>Favoritar</strong> ao final do poema para guardá-los aqui e reler quando desejar.
              </p>
              <a href="${baseUrl}" class="btn-primary" data-link>Explorar o acervo de poemas</a>
            </div>
          </div>
        `);
        return;
      }

      // Listagem de Favoritos (RF03, CA04)
      const countLabel = matchingItems.length === 1 ? '1 poema salvo' : `${matchingItems.length} poemas salvos`;

      container.innerHTML = unwrapSafeHTML(`
        <div class="favorites-page fade-in">
          ${breadcrumbsHtml}
          <header class="favorites-header">
            <h1 class="favorites-title">Poemas Favoritos</h1>
            <p class="favorites-subtitle">${countLabel} no seu navegador.</p>
          </header>
          <div class="favorites-list">
            ${matchingItems.map(({ poem }) => {
              const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
              const rawExcerpt = poem.excerpt || stripHtml(poem.content || '').replace(/\s+/g, ' ').trim().slice(0, 160) + '...';
              return `
                <article class="favorite-item" data-slug="${escapeHtml(poem.slug)}">
                  <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" class="favorite-item-link" data-link>
                    <h2 class="favorite-item-title">${escapeHtml(poem.title)}</h2>
                    <p class="favorite-item-excerpt">${escapeHtml(rawExcerpt)}</p>
                    <div class="favorite-item-meta">
                      ${year ? `<span>${year}</span>` : ''}
                    </div>
                  </a>
                  <button type="button" class="favorite-item-remove" data-slug="${escapeHtml(poem.slug)}" aria-label="Remover &quot;${escapeHtml(poem.title)}&quot; dos favoritos" title="Remover dos favoritos">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      `);

      // Event listener para botões de remoção
      container.querySelectorAll('.favorite-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const slug = btn.dataset.slug;
          if (slug) {
            removeFavorite(slug);
            toast.show('Poema removido dos favoritos.', 'info');
            renderContent();
          }
        });
      });
    };

    renderContent();
  }
};

export default favorites;
