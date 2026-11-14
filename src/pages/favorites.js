import { getPublishedPoems } from '../utils/poems-store.js';
import { getFavorites, removeFavorite } from '../utils/favorites.js';
import { getReadingHistory, clearReadingHistory } from '../utils/reading-history.js';
import { updateSEO } from '../utils/seo.js';
import { breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { stripHtml, escapeHtml, unwrapSafeHTML } from '../utils/html.js';
import { toast } from '../components/toast.js';

function formatRelativeTime(dateIso) {
  if (!dateIso) return '';
  const date = new Date(dateIso);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now - date) / 1000));
  if (diffSec < 60) return 'Agora mesmo';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

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
      const history = getReadingHistory();

      // Cruza favoritos com o cache de publicados (RF06, CA06)
      // Mantém a ordem exata dos favoritos (mais recente primeiro - RF03, CA04)
      const matchingItems = [];
      for (const fav of favs) {
        const poem = published.find(p => p.slug === fav.slug || (fav.id && p.id === fav.id));
        if (poem) {
          matchingItems.push({ poem, fav });
        }
      }

      // Cruza histórico de leitura com o acervo publicado (RF04, CA04)
      const matchingHistory = [];
      for (const item of history) {
        const poem = published.find(p => p.slug === item.slug);
        if (poem) {
          matchingHistory.push({ poem, history: item });
        }
      }

      const breadcrumbItems = [
        { name: 'Início', url: baseUrl },
        { name: 'Favoritos', url: `${baseUrl}favoritos/` }
      ];
      const breadcrumbsHtml = renderBreadcrumbsHtml(breadcrumbItems);

      // Bloco de Histórico de Leitura ("Lidos recentemente") (RF04, CA04, CA06)
      let historyHtml = '';
      if (matchingHistory.length > 0) {
        historyHtml = `
          <section class="reading-history-section" style="margin-top: var(--space-2xl); border-top: 1px solid var(--border-subtle); padding-top: var(--space-xl);" aria-label="Lidos recentemente">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-xs);">
              <div>
                <h2 style="font-family: var(--font-display); font-size: 1.35rem; color: var(--text-primary); margin: 0;">Lidos recentemente</h2>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Poemas que você visitou neste dispositivo.</p>
              </div>
              <button type="button" id="clear-reading-history-btn" class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; border-radius: 4px; cursor: pointer;">
                Limpar histórico
              </button>
            </div>
            <div class="reading-history-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-sm);">
              ${matchingHistory.map(({ poem, history: h }) => {
                const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
                return `
                  <article class="reading-history-item" data-slug="${escapeHtml(poem.slug)}" style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 6px; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
                    <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" class="reading-history-link" data-link style="text-decoration: none; color: inherit;">
                      <h3 style="font-family: var(--font-poem); font-size: 1.05rem; margin: 0 0 4px 0; color: var(--text-primary);">${escapeHtml(poem.title)}</h3>
                      <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(poem.excerpt || stripHtml(poem.content).slice(0, 100) + '...')}</p>
                    </a>
                    <div style="margin-top: var(--space-xs); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                      <span>${escapeHtml(formatRelativeTime(h.readAt))}${year ? ` • ${year}` : ''}</span>
                      <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" data-link style="color: var(--accent-subtle); text-decoration: none; font-weight: 500;">Continuar lendo →</a>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
        `;
      }

      // Estado Vazio de Favoritos (RF04, CA05)
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
            ${historyHtml}
          </div>
        `);
      } else {
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
            ${historyHtml}
          </div>
        `);
      }

      // Event listener para botões de remoção de favoritos
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

      // Event listener para botão de limpar histórico de leitura
      const clearHistoryBtn = container.querySelector('#clear-reading-history-btn');
      if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
          clearReadingHistory();
          toast.show('Histórico de leitura limpo.', 'info');
          renderContent();
        });
      }
    };

    renderContent();
  }
};

export default favorites;
