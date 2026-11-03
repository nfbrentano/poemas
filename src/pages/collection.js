import { db } from '../utils/firebase.js';
import { collection as firestoreCollection, query, where, getDocs } from 'firebase/firestore';
import { updateSEO, setNotFoundSEO } from '../utils/seo.js';
import { collectionSchema, breadcrumbSchema, SITE_URL } from '../utils/structured-data.js';
import { renderCollectionMarkup } from '../utils/collection-template.js';
import { getPublishedPoems } from '../utils/poems-store.js';

export const collection = {
  meta: {
    title: 'Coleção'
  },
  async render(container, params) {
    const slug = typeof params === 'object' ? params.slug : params;
    const isPrerendered = container.getAttribute('data-prerendered') === `/colecao/${slug}`;

    if (!isPrerendered) {
      container.innerHTML = `
        <section class="collection-detail fade-in">
          <header class="collection-header">
            <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 80%; height: 20px;"></div>
          </header>
          <div class="poems-list">
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
          </div>
        </section>
      `;
    }

    let col = null;
    let error = null;
    let poemsList = [];

    try {
      const q = query(firestoreCollection(db, 'collections'), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const colDoc = snapshot.docs[0];
        col = { id: colDoc.id, ...colDoc.data() };
        
        // Busca relações e poemas publicados simultaneamente
        const cpQ = query(firestoreCollection(db, 'collection_poems'), where('collection_id', '==', col.id));
        const [cpSnap, allPublished] = await Promise.all([
          getDocs(cpQ),
          getPublishedPoems()
        ]);
        
        const cpMap = {};
        cpSnap.forEach(d => {
          const data = d.data();
          if (data && data.poem_id) {
            cpMap[data.poem_id] = typeof data.order === 'number' ? data.order : 0;
          }
        });
        
        // Filtra poemas vinculados à coleção por relação ou por collection_slugs
        poemsList = allPublished
          .filter(p => cpMap[p.id] !== undefined || (Array.isArray(p.collection_slugs) && p.collection_slugs.includes(col.slug)))
          .map(p => ({ ...p, _order: cpMap[p.id] }));

        // Ordenação poética: respeita 'order' se definido, senão ordenação cronológica
        poemsList.sort((a, b) => {
          if (a._order !== undefined && b._order !== undefined && a._order !== b._order) {
            return a._order - b._order;
          }
          return new Date(a.published_at) - new Date(b.published_at);
        });
      } else {
        error = new Error('Not found');
      }
    } catch(e) {
      error = e;
    }

    if (error || !col) {
      if (isPrerendered) {
        container.removeAttribute('data-prerendered');
        return;
      }
      setNotFoundSEO();
      container.innerHTML = `
        <div class="not-found-page fade-in">
          <p class="not-found-label">404</p>
          <h2 class="not-found-title">Página não encontrada</h2>
          <p class="not-found-desc">A coleção que você procura não existe ou foi removida.</p>
          <a href="${import.meta.env.BASE_URL}colecoes/" data-link class="not-found-link">← Voltar para coleções</a>
        </div>
      `;
      return;
    }
    
    // Atualizar SEO e título da página (RF01)
    const finalTitle = col.name;
    const finalDesc = col.description || 'Coleção de poemas.';
    const canonicalColUrl = `${SITE_URL}/colecao/${col.slug}/`;
    const breadcrumbItems = [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: 'Coleções', url: `${SITE_URL}/colecoes/` },
      { name: col.name, url: canonicalColUrl }
    ];

    updateSEO({
      title: finalTitle,
      description: finalDesc,
      url: canonicalColUrl,
      type: 'website',
      structuredData: [
        collectionSchema(col, poemsList),
        breadcrumbSchema(breadcrumbItems)
      ]
    });
    
    collection.meta.title = finalTitle;
    document.title = `${finalTitle} — Natanael Fernando Gatti Brentano`;

    if (isPrerendered) {
      container.removeAttribute('data-prerendered');
    } else {
      container.innerHTML = renderCollectionMarkup({
        col,
        poemsList,
        baseUrl: import.meta.env.BASE_URL
      });
    }
  }
};

export default collection;
