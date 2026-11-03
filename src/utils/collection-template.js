import { escapeHtml, stripHtml } from './html.js';
import { renderBreadcrumbsHtml, SITE_URL } from './structured-data.js';

/**
 * Extracts a short single-line excerpt for a poem in collection/sentiment listings.
 * @param {object} poem
 * @param {number} [limit=140]
 * @returns {string}
 */
export function getPoemRowExcerpt(poem, limit = 140) {
  if (!poem) return '';
  const raw = (poem.excerpt && poem.excerpt.trim())
    ? poem.excerpt.trim()
    : stripHtml(poem.content || '');
  const clean = raw.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= limit) return clean;
  return clean.slice(0, limit - 3).trimEnd() + '...';
}

/**
 * Renders the HTML markup for a collection detail page.
 * Reusable across client-side router and build-time prerender.
 */
export function renderCollectionMarkup({
  col,
  poemsList = [],
  baseUrl = '/'
} = {}) {
  const canonicalColUrl = `${SITE_URL}/colecao/${col.slug}/`;
  const breadcrumbItems = [
    { name: 'Início', url: baseUrl },
    { name: 'Coleções', url: `${baseUrl}colecoes/` },
    { name: col.name, url: canonicalColUrl }
  ];

  const descTrimmed = (col.description || '').trim();
  const descHtml = descTrimmed
    ? `<p class="collection-desc-large" style="margin-top: 1rem;">${escapeHtml(descTrimmed)}</p>`
    : '';

  return `
      <section class="collection-detail fade-in">
        <header class="collection-header">
          ${renderBreadcrumbsHtml(breadcrumbItems)}
          <a href="${baseUrl}colecoes/" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${escapeHtml(col.name)}</h1>
          <p class="collection-meta" style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
            ${poemsList.length} poema${poemsList.length !== 1 ? 's' : ''}
          </p>
          ${descHtml}
        </header>

        <div class="poems-list">
          ${poemsList.length > 0 ? poemsList.map(poem => {
            const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
            const excerpt = getPoemRowExcerpt(poem, 140);
            return `
            <article class="poem-row">
              <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" class="poem-row-link" data-link>
                <div class="poem-row-main" style="flex: 1; min-width: 0;">
                  <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
                  ${excerpt ? `<p class="poem-row-excerpt" style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0; line-height: 1.5;">${escapeHtml(excerpt)}</p>` : ''}
                </div>
                ${year ? `<span class="poem-row-year">${year}</span>` : ''}
              </a>
            </article>
          `;
          }).join('') : '<p class="empty-state-desc">Nenhum poema publicado nesta coleção ainda.</p>'}
        </div>
      </section>
  `;
}
