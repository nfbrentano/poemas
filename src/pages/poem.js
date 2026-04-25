import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';

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
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;
      return;
    }
    
    // Update SEO dynamically
    const poemUrl = window.location.href;
    const cleanExcerpt = (poem.excerpt || poem.content).replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';
    
    updateSEO({
      title: poem.title,
      description: cleanExcerpt,
      url: poemUrl
    });
    
    // Check if user is logged in (to show admin buttons)
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = !!session;
    
    // Render
    container.innerHTML = `
      <article class="single-poem fade-in" style="max-width: var(--container-poetry); margin: 0 auto; padding-bottom: var(--space-4xl);">
        <header style="margin-bottom: var(--space-3xl); text-align: center; padding-top: var(--space-xl);">
          <h1 style="font-size: 3.5rem; margin-bottom: var(--space-md); color: var(--text-primary); font-weight: 400; letter-spacing: -0.5px;">${poem.title}</h1>
          <div class="poem-meta" style="display: flex; justify-content: center; gap: var(--space-sm); font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px;">
            <span>${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
            ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags.join(', ')}</span>` : ''}
          </div>
        </header>
        
        <div class="poem-content" style="font-size: 1.25rem; line-height: 2; color: var(--text-primary); white-space: pre-wrap; margin-bottom: var(--space-4xl); font-weight: 400; max-width: 600px; margin-left: auto; margin-right: auto;">${poem.content}</div>
        
        <div class="poem-actions" style="display: flex; gap: var(--space-md); justify-content: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-2xl); font-family: var(--font-ui);">
          ${isAdmin ? `
            <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast);" data-link>Editar Obra</a>
            <button id="export-ig-btn" class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast);">Gerar Card Instagram</button>
          ` : ''}
          <a href="/" data-link class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">← Voltar ao sumário</a>
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
