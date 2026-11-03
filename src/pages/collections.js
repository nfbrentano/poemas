import { db } from '../utils/firebase.js';
import { collection, query, getDocs } from 'firebase/firestore';
import { updateSEO } from '../utils/seo.js';
import { collectionsListSchema, breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { normalizeTag } from '../utils/tags.js';
import { escapeHtml, sanitizeUrl } from '../utils/html.js';
import { getPublishedPoems } from '../utils/poems-store.js';
import { getPoemRowExcerpt } from '../utils/collection-template.js';
import { renderCollectionsPageMarkup } from '../utils/collections-template.js';
import { enrichCollectionsWithCurated, mergeRelationsWithCurated } from '../data/collections.js';

export const collections = {
  meta: {
    title: 'Coleções — Natanael Fernando Gatti Brentano'
  },
  async render(container, params = {}) {
    try {
      const activeTags = params.tags ? params.tags.split(',') : [];
      const activeCols = params.cols ? params.cols.split(',') : [];
      const isFiltering = activeTags.length > 0 || activeCols.length > 0;
      const isPrerendered = container.getAttribute('data-prerendered') === '/colecoes' && !isFiltering;

      const canonicalCollectionsUrl = `${SITE_URL}/colecoes/`;
      const breadcrumbItems = [
        { name: 'Início', url: `${SITE_URL}/` },
        { name: 'Coleções', url: canonicalCollectionsUrl }
      ];

      if (!isPrerendered) {
        updateSEO({
          title: 'Coleções — Natanael Fernando Gatti Brentano',
          description: 'Explore poemas organizados por séries temáticas e agrupamentos poéticos.',
          url: canonicalCollectionsUrl,
          type: 'website',
          structuredData: [
            collectionsListSchema([]),
            breadcrumbSchema(breadcrumbItems)
          ]
        });

        // Skeleton inicial elegante
        container.innerHTML = `
          <section class="collections-page fade-in">
            <header class="page-header" style="text-align: center; margin-bottom: var(--space-xl);">
              ${renderBreadcrumbsHtml(breadcrumbItems)}
              <h1 class="page-title">Coleções</h1>
              <p class="page-subtitle">Séries temáticas e agrupamentos poéticos</p>
            </header>

            <div id="collections-section" class="discovery-section">
              <h2 class="section-title" style="margin-bottom: var(--space-md);">Séries em Destaque</h2>
              <div id="collections-grid" class="collections-grid">
                <div class="skeleton-row" style="height: 220px; border-radius: 6px;"></div>
                <div class="skeleton-row" style="height: 220px; border-radius: 6px;"></div>
                <div class="skeleton-row" style="height: 220px; border-radius: 6px;"></div>
              </div>
            </div>

            <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-3xl);">
              <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-md);">Obras do Acervo</h2>
              <div id="filtered-poems-list" class="list-container">
                <div class="skeleton-row" style="height: 60px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
                <div class="skeleton-row" style="height: 60px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
                <div class="skeleton-row" style="height: 60px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
              </div>
            </div>
          </section>
        `;
      } else {
        container.removeAttribute('data-prerendered');
      }

      const grid = container.querySelector('#collections-grid');
      const poemsList = container.querySelector('#filtered-poems-list');
      const BASE_URL = import.meta.env.BASE_URL;

      let cols = [];
      let allPoems = [];

      try {
        const [snapshot, cpSnapshot, publishedPoems] = await Promise.all([
          getDocs(query(collection(db, 'collections'))),
          getDocs(collection(db, 'collection_poems')),
          getPublishedPoems()
        ]);

        allPoems = publishedPoems || [];
        const publishedIdSet = new Set(allPoems.map(p => p.id));
        const rawCols = snapshot.docs ? snapshot.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        const baseCols = enrichCollectionsWithCurated(rawCols);

        const rawCp = cpSnapshot.docs ? cpSnapshot.docs.map(d => d.data()) : [];
        const mergedCp = mergeRelationsWithCurated(rawCp, allPoems, baseCols);

        baseCols.forEach(colData => {
          // Contagem precisa de poemas publicados únicos
          const associatedPoemIds = new Set(
            mergedCp
              .filter(cp => cp.collection_id === colData.id && publishedIdSet.has(cp.poem_id))
              .map(cp => cp.poem_id)
          );
          allPoems.forEach(p => {
            if (Array.isArray(p.collection_slugs) && p.collection_slugs.includes(colData.slug)) {
              associatedPoemIds.add(p.id);
            }
          });

          const count = associatedPoemIds.size;
          cols.push({
            ...colData,
            poemCount: count,
            collection_poems: [{ count }]
          });
        });

        // Ordenar coleções por quantidade de poemas (maior primeiro) e desempate por nome
        cols.sort((a, b) => b.poemCount - a.poemCount || (a.name || '').localeCompare(b.name || ''));

        if (cols.length > 0) {
          updateSEO({
            title: 'Coleções — Natanael Fernando Gatti Brentano',
            description: 'Explore poemas organizados por séries temáticas e agrupamentos poéticos.',
            url: canonicalCollectionsUrl,
            type: 'website',
            structuredData: [
              collectionsListSchema(cols),
              breadcrumbSchema(breadcrumbItems)
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching collections data:', err);
        if (isPrerendered) return;
      }

      // Renderiza grid de coleções
      if (grid && cols.length > 0) {
        grid.innerHTML = cols.map((col, index) => {
          const safeImg = sanitizeUrl(col.image_url);
          const imgAttr = index === 0
            ? 'fetchpriority="high" width="360" height="160" decoding="async"'
            : 'loading="lazy" decoding="async" width="360" height="160"';
          const count = col.poemCount || 0;
          const desc = (col.description || '').trim();

          return `
            <a href="${BASE_URL}colecao/${escapeHtml(col.slug)}/" class="collection-card" data-link>
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
        }).join('');

        grid.querySelectorAll('.collection-img').forEach(img => {
          img.addEventListener('error', () => {
            if (img.isConnected) {
              const cover = document.createElement('div');
              cover.className = 'collection-card-cover';
              cover.innerHTML = `
                <span class="collection-card-icon" aria-hidden="true">❦</span>
                <span class="collection-card-category">Coleção Temática</span>
              `;
              img.replaceWith(cover);
            }
          }, { once: true });
        });
      }

      // Renderiza lista de poemas (com filtros se houver)
      if (poemsList) {
        let filtered = allPoems;

        if (activeTags.length > 0) {
          const normalizedActiveTags = activeTags.map(at => decodeURIComponent(at).trim().toLowerCase());
          filtered = filtered.filter(p =>
            Array.isArray(p.tags) && p.tags.some(t => {
              const normalizedTag = normalizeTag(t).toLowerCase();
              return normalizedActiveTags.includes(normalizedTag);
            })
          );
        }

        if (activeCols.length > 0) {
          filtered = filtered.filter(p =>
            Array.isArray(p.collection_slugs) && p.collection_slugs.some(cs => activeCols.includes(cs))
          );
        }

        if (filtered.length === 0) {
          poemsList.innerHTML = '<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>';
        } else {
          poemsList.innerHTML = filtered.map(poem => {
            const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
            const excerpt = getPoemRowExcerpt(poem, 140);
            return `
              <article class="poem-row fade-in">
                <a href="${BASE_URL}poema/${escapeHtml(poem.slug)}/" data-link class="poem-row-link">
                  <div class="poem-row-main" style="flex: 1; min-width: 0;">
                    <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
                    ${excerpt ? `<p class="poem-row-excerpt" style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0; line-height: 1.5;">${escapeHtml(excerpt)}</p>` : ''}
                  </div>
                  ${year ? `<span class="poem-row-year">${year}</span>` : ''}
                </a>
              </article>
            `;
          }).join('');
        }
      }
    } catch (err) {
      console.error('Collections render error:', err);
      container.innerHTML = `
        <div style="padding: 2rem; color: #ff5555; background: #222; border-radius: 8px; margin: 2rem;">
          <h3>Erro interno em collections.js</h3>
          <pre style="font-size: 12px; overflow-x: auto; margin-top: 1rem;">${err.stack || err.message}</pre>
        </div>
      `;
    }
  }
};

export default collections;
