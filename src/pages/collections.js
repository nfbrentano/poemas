import { supabase } from '../utils/supabase.js';
import { filterChips } from '../components/filter-chips.js';
import { updateSEO } from '../utils/seo.js';

export const collections = {
  meta: {
    title: 'Coleções e Sentimentos — Natanael Brentano'
  },
  async render(container, params = {}) {
    const activeTags = params.tags ? params.tags.split(',') : [];
    const activeCols = params.cols ? params.cols.split(',') : [];
    const isFiltering = activeTags.length > 0 || activeCols.length > 0;

    updateSEO({
      title: 'Coleções e Sentimentos — Natanael Brentano',
      description: 'Explore poemas organizados por séries temáticas e sentimentos.',
      type: 'website'
    });

    container.innerHTML = `
      <section class="collections-page fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
          <h1 class="page-title">Explorar</h1>
          <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
        </header>

        <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
          ${filterChips.render(activeTags)}
        </div>

        <div id="collections-section" class="discovery-section" style="${isFiltering ? 'display: none;' : ''}">
          <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
          <div id="collections-grid" class="collections-grid">
            <div class="loading">Carregando coleções...</div>
          </div>
        </div>

        <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
          <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">
            ${isFiltering ? 'Poemas Encontrados' : 'Obras Recentes'}
          </h2>
          <div id="filtered-poems-list" class="list-container">
            <div class="loading">Carregando poemas...</div>
          </div>
        </div>
      </section>
    `;

    const grid = container.querySelector('#collections-grid');
    const poemsList = container.querySelector('#filtered-poems-list');
    const BASE_URL = import.meta.env.BASE_URL;

    // Fetch Collections
    const fetchCollections = async () => {
      const { data: cols } = await supabase
        .from('collections')
        .select('*, collection_poems(count)')
        .order('created_at', { ascending: false });

      if (grid) {
        if (!cols || cols.length === 0) {
          grid.innerHTML = '<p class="empty-msg">Nenhuma coleção encontrada.</p>';
        } else {
          grid.innerHTML = cols.map(col => `
            <a href="${BASE_URL}colecao/${col.slug}" class="collection-card" data-link>
              ${col.image_url ? `<img src="${col.image_url}" alt="${col.name}" class="collection-img">` : '<div class="collection-img-placeholder"></div>'}
              <div class="collection-info">
                <h2 class="collection-name">${col.name}</h2>
                <span class="collection-count">${col.collection_poems?.[0]?.count || 0} poemas</span>
              </div>
            </a>
          `).join('');
        }
      }
    };

    // Fetch and Filter Poems
    const fetchPoems = async () => {
      let query = supabase
        .from('poems')
        .select('id, title, slug, published_at, tags, collection_poems(collection_id, collections(slug))')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      const { data: allPoems } = await query;
      
      let filtered = allPoems || [];

      if (activeTags.length > 0) {
        filtered = filtered.filter(p => 
          p.tags && p.tags.some(t => {
            const normalized = t.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i, '').trim().toLowerCase();
            return activeTags.some(at => at.toLowerCase() === normalized);
          })
        );
      }

      if (activeCols.length > 0) {
        filtered = filtered.filter(p => 
          p.collection_poems && p.collection_poems.some(cp => cp.collections && activeCols.includes(cp.collections.slug))
        );
      }

      if (poemsList) {
        if (filtered.length === 0) {
          poemsList.innerHTML = '<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>';
        } else {
          poemsList.innerHTML = filtered.map(poem => {
            const year = new Date(poem.published_at).getFullYear();
            return `
              <article class="poem-row fade-in">
                <a href="${BASE_URL}poema/${poem.slug}" data-link class="poem-row-link">
                  <h3 class="poem-row-title">${poem.title}</h3>
                  <span class="poem-row-year">${year}</span>
                </a>
              </article>
            `;
          }).join('');
        }
      }
    };

    await Promise.all([fetchCollections(), fetchPoems()]);
    filterChips.init(container, activeTags);
  }
};

export default collections;
