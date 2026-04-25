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
          <p><a href="${import.meta.env.BASE_URL}" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
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
      <article class="single-poem fade-in">
        <header>
          <h1>${poem.title}</h1>
          <div class="poem-meta">
            <span>${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
            ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags.join(', ')}</span>` : ''}
          </div>
        </header>
        
        <div class="poem-content">${poem.content}</div>
        
        <div class="poem-actions">
          ${isAdmin ? `
            <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px;" data-link>Editar Obra</a>
            <button id="export-ig-btn" class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px;">Gerar Card Instagram</button>
          ` : ''}
          <a href="${import.meta.env.BASE_URL}" data-link class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary);">← Voltar ao sumário</a>
        </div>
      </article>
      
      <!-- Newsletter Section -->
      <section class="newsletter-section fade-in" style="margin-top: var(--space-4xl); padding: var(--space-2xl) var(--space-lg); background-color: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 2px; text-align: center; max-width: var(--container-poetry); margin-left: auto; margin-right: auto;">
        <h3 style="margin-bottom: var(--space-sm); font-family: var(--font-display); font-size: 2rem; color: var(--accent-subtle); font-weight: 400;">O Eco das Palavras</h3>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg); font-size: 0.95rem; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.6;">
          Receba ocasionalmente novos poemas e devaneios direto na sua caixa de entrada. Sem spam, apenas poesia.
        </p>
        <form id="subscribe-form" style="display: flex; gap: var(--space-sm); max-width: 380px; margin: 0 auto;">
          <input type="email" id="subscriber-email" placeholder="Endereço de e-mail" required style="flex: 1; font-size: 0.9rem; padding: 0.75rem 1rem; border: 1px solid var(--border-strong); background: transparent; color: var(--text-primary);">
          <button type="submit" style="background: var(--text-primary); color: var(--bg-primary); padding: 0.75rem 1.5rem; font-weight: 500; font-size: 0.9rem; border-radius: 2px;">Assinar</button>
        </form>
        <div id="subscribe-message" style="margin-top: var(--space-sm); font-size: 0.85rem; font-family: var(--font-ui);"></div>
      </section>
      
      <!-- Hidden layout for Instagram Export -->
      <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>
    `;
    
    // Setup Newsletter form logic
    const subForm = document.getElementById('subscribe-form');
    if (subForm) {
      subForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('subscriber-email').value;
        const msgEl = document.getElementById('subscribe-message');
        
        msgEl.innerHTML = 'Enviando...';
        msgEl.style.color = 'var(--text-secondary)';
        
        const { error } = await supabase.from('subscribers').insert([{ email }]);
        
        if (error) {
          if (error.code === '23505') { // unique violation
            msgEl.innerHTML = 'Este e-mail já está inscrito.';
          } else {
            msgEl.innerHTML = 'Erro ao inscrever. Tente novamente.';
            msgEl.style.color = 'var(--error)';
          }
        } else {
          msgEl.innerHTML = 'Obrigado por assinar.';
          msgEl.style.color = 'var(--success)';
          subForm.reset();
        }
      });
    }

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
