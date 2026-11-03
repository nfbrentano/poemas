import { escapeHtml, sanitizeUrl } from './html.js';
import { renderBreadcrumbsHtml, SITE_URL } from './structured-data.js';
import { getPoemRowExcerpt } from './collection-template.js';

/**
 * Renders the HTML markup for the /colecoes/ (Explorar) hub page.
 * Used both at build-time in scripts/prerender.js and client-side in src/pages/collections.js.
 */
export function renderCollectionsPageMarkup({
  collections = [],
  poems = [],
  sentiments = [],
  baseUrl = '/'
} = {}) {
  const canonicalCollectionsUrl = `${SITE_URL}/colecoes/`;
  const breadcrumbItems = [
    { name: 'Início', url: `${SITE_URL}/` },
    { name: 'Coleções', url: canonicalCollectionsUrl }
  ];

  const validCols = collections.filter(c => c && c.slug);
  const colsHtml = validCols.length > 0 ? validCols.map((col, index) => {
    const safeImg = sanitizeUrl(col.image_url);
    const imgAttr = index === 0
      ? 'fetchpriority="high" width="360" height="180" decoding="async"'
      : 'loading="lazy" decoding="async" width="360" height="180"';
    const count = col.poemCount ?? col.collection_poems?.[0]?.count ?? 0;
    return `
      <a href="${baseUrl}colecao/${escapeHtml(col.slug)}/" class="collection-card" data-link>
        ${safeImg ? `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(col.name)}" class="collection-img" ${imgAttr}>` : '<div class="collection-img-placeholder"></div>'}
        <div class="collection-info">
          <h2 class="collection-name">${escapeHtml(col.name)}</h2>
          <span class="collection-count">${count} poema${count !== 1 ? 's' : ''}</span>
        </div>
      </a>
    `;
  }).join('') : '<p class="empty-msg">Nenhuma coleção encontrada.</p>';

  const sentimentsLinksHtml = sentiments.length > 0 ? `
    <div class="sentiments-index-links" style="margin-top: var(--space-md);">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: 0.5rem;">
        <span class="filter-label" style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Páginas de Sentimentos:</span>
        <a href="${baseUrl}sentimentos/" data-link style="font-size: 0.85rem; color: var(--accent-subtle); text-decoration: underline;">Ver todos os sentimentos (${sentiments.length}) →</a>
      </div>
      <div class="filter-chips" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${sentiments.map(s => `
          <a href="${baseUrl}sentimento/${escapeHtml(s.slug)}/" class="filter-chip" data-link>
            ${escapeHtml(s.name)} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em;">(${s.count ?? s.poems?.length ?? 0})</span>
          </a>
        `).join('')}
      </div>
    </div>
  ` : `
    <div style="margin-top: var(--space-sm);">
      <a href="${baseUrl}sentimentos/" data-link style="font-size: 0.9rem; color: var(--accent-subtle); text-decoration: underline;">Explorar poemas por sentimento →</a>
    </div>
  `;

  const poemsHtml = poems.length > 0 ? poems.map(poem => {
    const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
    const excerpt = getPoemRowExcerpt(poem, 140);
    return `
      <article class="poem-row fade-in">
        <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" data-link class="poem-row-link">
          <div class="poem-row-main" style="flex: 1; min-width: 0;">
            <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
            ${excerpt ? `<p class="poem-row-excerpt" style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0; line-height: 1.5;">${escapeHtml(excerpt)}</p>` : ''}
          </div>
          ${year ? `<span class="poem-row-year">${year}</span>` : ''}
        </a>
      </article>
    `;
  }).join('') : '<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema publicado no momento.</p>';

  return `
    <section class="collections-page fade-in">
      <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
        ${renderBreadcrumbsHtml(breadcrumbItems)}
        <h1 class="page-title">Explorar</h1>
        <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
      </header>

      <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
        <div class="filter-section fade-in">
          <div class="filter-group">
            <span class="filter-label">Sentimentos:</span>
            <div class="filter-chips" id="tag-filters">
              <div id="dynamic-tags" class="filter-chips-scroll">
                <button class="filter-chip active" data-type="tag" data-value="all">Todos</button>
              </div>
            </div>
          </div>
        </div>
        ${sentimentsLinksHtml}
      </div>

      <div id="collections-section" class="discovery-section">
        <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
        <div id="collections-grid" class="collections-grid">
          ${colsHtml}
        </div>
      </div>

      <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
        <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">Obras Recentes</h2>
        <div id="filtered-poems-list" class="list-container">
          ${poemsHtml}
        </div>
      </div>
    </section>
  `;
}
