import { supabase } from '../utils/supabase.js';

export default {
  meta: {
    title: 'Poema'
  },
  async render(container, params) {
    const slug = params.slug;
    
    container.innerHTML = '<div class="loading fade-in" style="text-align:center; padding: 4rem;">Carregando...</div>';
    
    // Fetch poem
    const { data: poem, error } = await supabase
      .from('poems')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
      
    if (error || !poem) {
      container.innerHTML = `
        <div class="error" style="text-align:center; padding: 4rem;">
          <h2 style="margin-bottom: 1rem;">Poema não encontrado</h2>
          <p><a href="/" data-link style="color: var(--accent-color);">Voltar ao início</a></p>
        </div>
      `;
      return;
    }
    
    // Update Document Title
    document.title = `${poem.title} - Natanael Brentano`;
    
    // Check if user is logged in (to show admin buttons)
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = !!session;
    
    // Render
    container.innerHTML = `
      <article class="single-poem fade-in" style="max-width: 650px; margin: 0 auto; padding-bottom: 4rem;">
        <header style="margin-bottom: 3rem; text-align: center;">
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--accent-color);">${poem.title}</h1>
          <div class="poem-meta" style="justify-content: center;">
            <span>${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
            ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags.join(', ')}</span>` : ''}
          </div>
        </header>
        
        <div class="poem-content" style="font-family: var(--font-serif-text); font-size: 1.25rem; line-height: 1.8; color: var(--text-primary); white-space: pre-wrap; margin-bottom: 4rem;">${poem.content}</div>
        
        <div class="poem-actions" style="display: flex; gap: 1rem; justify-content: center; border-top: 1px solid var(--border-color); padding-top: 2rem;">
          ${isAdmin ? `
            <a href="/admin?view=editor&id=${poem.id}" class="btn-secondary" style="font-size: 0.85rem;" data-link>Editar Poema</a>
            <button id="export-ig-btn" class="btn-secondary" style="font-size: 0.85rem;">Exportar p/ Instagram</button>
          ` : ''}
          <a href="/" data-link class="btn-secondary" style="font-size: 0.85rem;">Voltar aos poemas</a>
        </div>
      </article>
      
      <!-- Hidden layout for Instagram Export -->
      <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>
    `;
    
    if (isAdmin) {
      const exportBtn = document.getElementById('export-ig-btn');
      exportBtn.addEventListener('click', async () => {
        exportBtn.innerText = 'Gerando...';
        exportBtn.disabled = true;
        
        try {
          const { generateSocialCard } = await import('../utils/social-export.js');
          await generateSocialCard(poem, document.getElementById('social-card-container'));
        } catch (e) {
          console.error(e);
          alert('Erro ao gerar imagem.');
        } finally {
          exportBtn.innerText = 'Exportar p/ Instagram';
          exportBtn.disabled = false;
        }
      });
    }
  }
};
