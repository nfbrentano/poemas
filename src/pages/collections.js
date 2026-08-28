import { db } from '../utils/firebase.js';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { filterChips } from '../components/filter-chips.js';
import { updateSEO } from '../utils/seo.js';
import { normalizeTag } from '../utils/tags.js';
import { escapeHtml, sanitizeUrl } from '../utils/html.js';

export const collections = {
  meta: {
    title: 'Coleções e Sentimentos — Natanael Brentano'
  },
  async render(container, params = {}) {
    try {
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
        let cols = [];
        let error = null;
        try {
          const q = query(collection(db, 'collections'), orderBy('created_at', 'desc'));
          const snapshot = await getDocs(q);
          
          const cpSnapshot = await getDocs(collection(db, 'collection_poems'));
          const cpData = [];
          cpSnapshot.forEach(d => cpData.push(d.data()));

          snapshot.forEach(doc => {
            const colData = doc.data();
            const count = cpData.filter(cp => cp.collection_id === doc.id).length;
            cols.push({ id: doc.id, ...colData, collection_poems: [{ count }] });
          });
        } catch (err) {
          error = err;
        }

        if (grid) {
          if (error) {
            console.error('Supabase error fetching collections:', error);
          }
          if (!cols || cols.length === 0) {
            grid.innerHTML = '<p class="empty-msg">Nenhuma coleção encontrada.</p>';
          } else {
            grid.innerHTML = cols.map(col => {
              const safeImg = sanitizeUrl(col.image_url);
              return `
              <a href="${BASE_URL}colecao/${escapeHtml(col.slug)}" class="collection-card" data-link>
                ${safeImg ? `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(col.name)}" class="collection-img" loading="lazy" decoding="async">` : '<div class="collection-img-placeholder"></div>'}
                <div class="collection-info">
                  <h2 class="collection-name">${escapeHtml(col.name)}</h2>
                  <span class="collection-count">${col.collection_poems?.[0]?.count || 0} poemas</span>
                </div>
              </a>
            `;
            }).join('');
          }
        }
      };

      let allPoems = [];

      // Fetch and Filter Poems
      const fetchPoems = async () => {
        let data = [];
        let error = null;
        try {
          const q = query(collection(db, 'poems'), where('status', '==', 'published'), orderBy('published_at', 'desc'));
          const snapshot = await getDocs(q);
          
          const colsSnapshot = await getDocs(collection(db, 'collections'));
          const colsMap = {};
          colsSnapshot.forEach(d => { colsMap[d.id] = d.data(); });
          
          const cpSnapshot = await getDocs(collection(db, 'collection_poems'));
          const cpData = [];
          cpSnapshot.forEach(d => cpData.push(d.data()));
          
          snapshot.forEach(doc => {
            const poemData = doc.data();
            const poemRelations = cpData
               .filter(cp => cp.poem_id === doc.id)
               .map(cp => ({
                 collection_id: cp.collection_id,
                 collections: colsMap[cp.collection_id] ? { slug: colsMap[cp.collection_id].slug } : null
               }));
            data.push({ id: doc.id, ...poemData, collection_poems: poemRelations });
          });
        } catch (err) {
          error = err;
        }
        allPoems = data || [];
        
        let filtered = allPoems;

        if (activeTags.length > 0) {
          const normalizedActiveTags = activeTags.map(at => decodeURIComponent(at).trim().toLowerCase());
          
          filtered = filtered.filter(p => 
            p.tags && p.tags.some(t => {
              const normalizedTag = normalizeTag(t).toLowerCase();
              return normalizedActiveTags.includes(normalizedTag);
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
                  <a href="${BASE_URL}poema/${escapeHtml(poem.slug)}" data-link class="poem-row-link">
                    <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
                    <span class="poem-row-year">${year}</span>
                  </a>
                </article>
              `;
            }).join('');
          }
        }
      };

      await Promise.all([fetchCollections(), fetchPoems()]);
      filterChips.init(container, activeTags, allPoems).catch(e => console.error('FilterChips init error:', e));
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
