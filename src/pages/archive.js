import { updateSEO } from '../utils/seo.js';
import { archivePageSchema, breadcrumbSchema, SITE_URL } from '../utils/structured-data.js';
import { getPublishedPoems } from '../utils/poems-store.js';
import { renderArchiveMarkup, filterPublishedPoems } from '../utils/archive-builder.js';
import { unwrapSafeHTML } from '../utils/html.js';
import { trackPageView } from '../utils/analytics.js';

let currentSortOrder = 'desc';
let clickHandler = null;

export const archive = {
  meta: {
    title: 'Arquivo e Linha do Tempo Literária — Natanael Fernando Gatti Brentano'
  },

  async render(container, _params = {}) {
    const canonicalArchiveUrl = `${SITE_URL}/arquivo/`;
    const breadcrumbItems = [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: 'Arquivo e Linha do Tempo', url: canonicalArchiveUrl }
    ];

    const isPrerendered = container.getAttribute('data-prerendered') === '/arquivo';

    updateSEO({
      title: 'Arquivo e Linha do Tempo Literária — Natanael Fernando Gatti Brentano',
      description: 'Linha do tempo cronológica com marcos literários de todas as obras publicadas desde 2015 por Natanael Fernando Gatti Brentano.',
      url: canonicalArchiveUrl,
      type: 'website',
      structuredData: [
        archivePageSchema([]),
        breadcrumbSchema(breadcrumbItems)
      ]
    });

    trackPageView('/arquivo', 'Arquivo e Linha do Tempo Literária');

    let allPoems = [];

    if (!isPrerendered) {
      // Skeleton de carregamento
      container.innerHTML = unwrapSafeHTML(`
        <div class="archive-container container fade-in">
          <header class="archive-hero" style="text-align: center; margin-bottom: var(--space-xl);">
            <div class="skeleton-row" style="height: 36px; max-width: 320px; margin: 0 auto var(--space-xs); border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 20px; max-width: 500px; margin: 0 auto var(--space-lg); border-radius: 4px;"></div>
          </header>
          <div class="archive-milestones-section" style="margin-bottom: var(--space-2xl);">
            <div class="skeleton-row" style="height: 120px; border-radius: 8px;"></div>
          </div>
          <div class="archive-years-container">
            <div class="skeleton-row" style="height: 180px; margin-bottom: var(--space-lg); border-radius: 6px;"></div>
            <div class="skeleton-row" style="height: 180px; margin-bottom: var(--space-lg); border-radius: 6px;"></div>
          </div>
        </div>
      `);

      try {
        allPoems = await getPublishedPoems();
      } catch (err) {
        console.error('[Archive] Erro ao carregar poemas:', err);
        allPoems = [];
      }

      const publishedPoems = filterPublishedPoems(allPoems);

      // Atualiza Schema.org com a contagem real
      updateSEO({
        title: 'Arquivo e Linha do Tempo Literária — Natanael Fernando Gatti Brentano',
        description: 'Linha do tempo cronológica com marcos literários de todas as obras publicadas desde 2015 por Natanael Fernando Gatti Brentano.',
        url: canonicalArchiveUrl,
        type: 'website',
        structuredData: [
          archivePageSchema(publishedPoems),
          breadcrumbSchema(breadcrumbItems)
        ]
      });

      container.innerHTML = unwrapSafeHTML(renderArchiveMarkup({
        poems: publishedPoems,
        sortOrder: currentSortOrder,
        baseUrl: import.meta.env.BASE_URL
      }));
    } else {
      container.removeAttribute('data-prerendered');
      // Carrega poemas do store em background para suportar alternância dinâmica de ordenação
      getPublishedPoems().then(res => {
        allPoems = res;
      }).catch(() => {});
    }

    // Configuração dos eventos de alternância de ordenação e âncoras (RF02, CA03)
    this.cleanup();

    clickHandler = async (e) => {
      const sortBtn = e.target.closest('.btn-archive-sort');
      if (sortBtn) {
        e.preventDefault();
        const targetOrder = sortBtn.getAttribute('data-sort');
        if (targetOrder && targetOrder !== currentSortOrder) {
          currentSortOrder = targetOrder;

          if (!allPoems || allPoems.length === 0) {
            allPoems = await getPublishedPoems();
          }

          container.innerHTML = unwrapSafeHTML(renderArchiveMarkup({
            poems: allPoems,
            sortOrder: currentSortOrder,
            baseUrl: import.meta.env.BASE_URL
          }));
        }
      }
    };

    container.addEventListener('click', clickHandler);
  },

  cleanup() {
    if (clickHandler) {
      document.removeEventListener('click', clickHandler);
      clickHandler = null;
    }
  }
};

export default archive;
