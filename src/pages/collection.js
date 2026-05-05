import { supabase } from '../utils/supabase.js';

export const collection = {
  async render(container, slug) {
    container.innerHTML = '<div class="loading">Carregando coleção...</div>';

    const { data: col, error } = await supabase
      .from('collections')
      .select('*, collection_poems(poems(*))')
      .eq('slug', slug)
      .single();

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
