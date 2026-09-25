import { db } from '../utils/firebase.js';
import { collection as firestoreCollection, query, where, getDocs, documentId } from 'firebase/firestore';
import { updateSEO, setNotFoundSEO } from '../utils/seo.js';
import { collectionSchema, breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { escapeHtml } from '../utils/html.js';
import { renderCollectionMarkup } from '../utils/collection-template.js';

export const collection = {
  meta: {
    title: 'Coleção'
  },
  async render(container, params) {
    const slug = typeof params === 'object' ? params.slug : params;
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

    let col = null;
    let error = null;
    let poemsList = [];

    try {
      const q = query(firestoreCollection(db, 'collections'), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const colDoc = snapshot.docs[0];
        col = { id: colDoc.id, ...colDoc.data() };
        
        // Manual join for poems
        const cpQ = query(firestoreCollection(db, 'collection_poems'), where('collection_id', '==', col.id));
        const cpSnap = await getDocs(cpQ);
        
        const cpMap = {};
        cpSnap.forEach(d => {
          const data = d.data();
          cpMap[data.poem_id] = typeof data.order === 'number' ? data.order : 0;
        });
        const poemIds = Object.keys(cpMap);
        
        if (poemIds.length > 0) {
           const batches = [];
           for (let i = 0; i < poemIds.length; i += 30) {
             batches.push(poemIds.slice(i, i + 30));
           }
           
           for (const batch of batches) {
             const allPoemsQ = query(
               firestoreCollection(db, 'poems'),
               where(documentId(), 'in', batch),
               where('status', '==', 'published')
             );
             const allPoemsSnap = await getDocs(allPoemsQ);
             allPoemsSnap.forEach(p => {
               poemsList.push({ id: p.id, ...p.data(), _order: cpMap[p.id] });
             });
           }
           
           // Critério de ordenação: usa 'order' se existir, senão por 'published_at' do mais antigo para o mais recente
           poemsList.sort((a, b) => {
             if (a._order !== undefined && b._order !== undefined && a._order !== b._order) {
               return a._order - b._order;
             }
             return new Date(a.published_at) - new Date(b.published_at);
           });
        }
      } else {
        error = new Error('Not found');
      }
    } catch(e) {
      error = e;
    }

    if (error || !col) {
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
    document.title = `${finalTitle} — Natanael Brentano`;

    const isPrerendered = container.getAttribute('data-prerendered') === `/colecao/${col.slug}`;
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
