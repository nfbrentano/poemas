import { db } from '../utils/firebase.js';
import { collection as firestoreCollection, query, where, getDocs } from 'firebase/firestore';

export const collection = {
  async render(container, params) {
    const slug = typeof params === 'object' ? params.slug : params;
    container.innerHTML = '<div class="loading">Carregando coleção...</div>';

    let col = null;
    let error = null;
    try {
      const q = query(firestoreCollection(db, 'collections'), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const colDoc = snapshot.docs[0];
        col = { id: colDoc.id, ...colDoc.data(), collection_poems: [] };
        
        // Manual join for poems
        const cpQ = query(firestoreCollection(db, 'collection_poems'), where('collection_id', '==', col.id));
        const cpSnap = await getDocs(cpQ);
        const poemIds = cpSnap.docs.map(d => d.data().poem_id);
        
        if (poemIds.length > 0) {
           const allPoemsQ = query(firestoreCollection(db, 'poems'));
           const allPoemsSnap = await getDocs(allPoemsQ);
           const poemsList = [];
           allPoemsSnap.forEach(p => {
             if (poemIds.includes(p.id)) {
               poemsList.push({ id: p.id, ...p.data() });
             }
           });
           col.collection_poems = poemsList.map(p => ({ poems: p }));
        }
      } else {
        error = new Error('Not found');
      }
    } catch(e) {
      error = e;
    }

    if (error || !col) {
      container.innerHTML = '<div class="error">Coleção não encontrada.</div>';
      return;
    }

    const poems = col.collection_poems.map(cp => cp.poems).filter(p => p.status === 'published');

    container.innerHTML = `
      <section class="collection-detail fade-in">
        <header class="collection-header">
          <a href="${import.meta.env.BASE_URL}colecoes" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${col.name}</h1>
          <p class="collection-desc-large">${col.description || ''}</p>
        </header>

        <div class="poems-list">
          ${poems.length > 0 ? poems.map(poem => `
            <article class="poem-row">
              <a href="${import.meta.env.BASE_URL}poema/${poem.slug}" class="poem-row-link" data-link>
                <h3 class="poem-row-title">${poem.title}</h3>
                <span class="poem-row-year">${new Date(poem.published_at).getFullYear()}</span>
              </a>
            </article>
          `).join('') : '<p>Nenhum poema nesta coleção ainda.</p>'}
        </div>
      </section>
    `;
  }
};

export default collection;
