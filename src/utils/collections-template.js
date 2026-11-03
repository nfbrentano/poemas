import { escapeHtml, sanitizeUrl } from './html.js';
import { renderBreadcrumbsHtml, SITE_URL } from './structured-data.js';
import { getPoemRowExcerpt } from './collection-template.js';

/**
 * Renders the HTML markup for the /colecoes/ hub page.
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
      ? 'fetchpriority="high" width="360" height="160" decoding="async"'
      : 'loading="lazy" decoding="async" width="360" height="160"';
    const count = col.poemCount ?? col.collection_poems?.[0]?.count ?? 0;
    const desc = (col.description || '').trim();

    return `
      <a href="${baseUrl}colecao/${escapeHtml(col.slug)}/" class="collection-card" data-link>
        ${safeImg ? `
          <img src="${escapeHtml(safeImg)}" alt="${escapeHtml(col.name)}" class="collection-img" ${imgAttr}>
        ` : `
          <div class="collection-card-cover">
            <span class="collection-card-icon" aria-hidden="true">❦</span>
            <span class="collection-card-category">Coleção Temática</span>
          </div>
        `}
        <div class="collection-info">
          <h2 class="collection-name">${escapeHtml(col.name)}</h2>
          <span class="collection-count">${count} poema${count !== 1 ? 's' : ''}</span>
          ${desc ? `<p class="collection-desc-preview">${escapeHtml(desc)}</p>` : ''}
        </div>
      </a>
    `;
  }).join('') : '<p class="empty-msg">Nenhuma coleção encontrada.</p>';

  const sentimentsHintHtml = sentiments.length > 0 ? `
    <div class="collections-subnav-hint" style="margin-top: var(--space-sm); font-size: 0.9rem; color: var(--text-secondary);">
      Explore também por sentimentos:
      ${sentiments.slice(0, 5).map(s => `
        <a href="${baseUrl}sentimento/${escapeHtml(s.slug)}/" data-link style="color: var(--accent-subtle); text-decoration: underline; margin: 0 4px;">${escapeHtml(s.name || s.slug)}</a>
      `).join('•')}
      • <a href="${baseUrl}sentimentos/" data-link style="color: var(--accent-subtle); text-decoration: underline;">Ver todos (${sentiments.length}) →</a>
    </div>
  ` : `
    <div class="collections-subnav-hint" style="margin-top: var(--space-sm); font-size: 0.9rem; color: var(--text-secondary);">
      Explore também os poemas organizados por <a href="${baseUrl}sentimentos/" data-link style="color: var(--accent-subtle); text-decoration: underline;">Sentimentos e Emoções →</a>
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
      <header class="page-header" style="text-align: center; margin-bottom: var(--space-xl);">
        ${renderBreadcrumbsHtml(breadcrumbItems)}
        <h1 class="page-title">Coleções</h1>
        <p class="page-subtitle">Séries temáticas e agrupamentos poéticos</p>
        ${sentimentsHintHtml}
      </header>

      <div id="collections-section" class="discovery-section">
        <h2 class="section-title" style="margin-bottom: var(--space-md);">Séries em Destaque</h2>
        <div id="collections-grid" class="collections-grid">
          ${colsHtml}
        </div>
      </div>

      <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-3xl);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-xs);">
          <h2 class="section-title" id="poems-list-title" style="margin: 0;">Obras do Acervo</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${poems.length} poemas catalogados</span>
        </div>
        <div id="filtered-poems-list" class="list-container">
          ${poemsHtml}
        </div>
      </div>
    </section>
  `;
}
