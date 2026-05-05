import { supabase } from '../utils/supabase.js';

export const collections = {
  async render(container) {
    container.innerHTML = `
      <section class="collections-page fade-in">
        <header class="page-header">
          <h1 class="page-title">Coleções</h1>
          <p class="page-subtitle">Séries temáticas e livros catalogados</p>
        </header>
        <div id="collections-grid" class="collections-grid">
          <div class="loading">Carregando coleções...</div>
        </div>
      </section>
    `;

    const grid = container.querySelector('#collections-grid');
    
    const { data: cols, error } = await supabase
      .from('collections')
      .select('*, collection_poems(count)')
      .order('created_at', { ascending: false });

    if (error || !cols || cols.length === 0) {
      grid.innerHTML = '<p class="empty-msg">Nenhuma coleção encontrada ainda.</p>';
      return;
    }

    grid.innerHTML = cols.map(col => `
      <a href="${import.meta.env.BASE_URL}colecao/${col.slug}" class="collection-card" data-link>
        ${col.image_url ? `<img src="${col.image_url}" alt="${col.name}" class="collection-img">` : '<div class="collection-img-placeholder"></div>'}
        <div class="collection-info">
          <h2 class="collection-name">${col.name}</h2>
          <p class="collection-desc">${col.description || ''}</p>
          <span class="collection-count">${col.collection_poems?.[0]?.count || 0} poemas</span>
        </div>
      </a>
    `).join('');
  }
};

export default collections;
