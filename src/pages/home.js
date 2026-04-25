import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';

export default {
  meta: {
    title: 'Natanael Brentano - Poemas'
  },
  async render(container) {
    updateSEO({
      title: 'A poética do silêncio',
      description: 'Obras contemporâneas de Natanael Brentano. Textos curtos sobre a imensidão do efêmero.'
    });
    
    container.innerHTML = '<div class="loading fade-in" style="text-align:center; padding: 4rem;">Carregando poemas...</div>';
    
    // Fetch published poems
    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, title, slug, excerpt, tags, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
      
    if (error) {
      console.error(error);
      container.innerHTML = '<div class="error" style="text-align:center; color: var(--error);">Erro ao carregar os poemas. Tente novamente mais tarde.</div>';
      return;
    }
    
    if (!poems || poems.length === 0) {
      container.innerHTML = `
        <div class="empty-state fade-in" style="text-align:center; padding: 4rem;">
          <h2 style="color: var(--text-secondary); margin-bottom: 1rem;">O silêncio ainda impera.</h2>
          <p>Nenhum poema publicado no momento.</p>
        </div>
      `;
      return;
    }
    
    // Generate HTML for poems (Editorial List)
    const poemsHtml = poems.map((poem, index) => {
      const year = new Date(poem.published_at).getFullYear();
      const dateStr = new Date(poem.published_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (index === 0) {
        // Featured Poem (The first one)
        return `
        <article class="poem-featured fade-in">
          <a href="${import.meta.env.BASE_URL}poema/${poem.slug}" data-link>
            <h2 class="featured-title">${poem.title}</h2>
            <div class="featured-excerpt">${poem.excerpt || ''}</div>
            <div class="featured-meta">
              <span>${dateStr}</span>
              ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags[0]}</span>` : ''}
            </div>
          </a>
          <div class="featured-separator"></div>
        </article>
        `;
      }
      
      return `
      <article class="poem-row fade-in" style="display: flex; justify-content: space-between; align-items: baseline; padding: var(--space-md) 0; border-bottom: 1px solid var(--border-subtle); transition: opacity var(--transition-fast);">
        <a href="${import.meta.env.BASE_URL}poema/${poem.slug}" data-link style="flex: 1; display: flex; justify-content: space-between; align-items: baseline;">
          <h2 style="font-size: 1.4rem; font-family: var(--font-display); letter-spacing: 0.5px;">${poem.title}</h2>
          <span style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted);">${year}</span>
        </a>
      </article>
    `}).join('');
    
    container.innerHTML = `
      <div class="home-layout" style="padding-bottom: var(--space-4xl);">
        
        <section class="hero-section fade-in" style="margin-bottom: var(--space-4xl); padding-top: var(--space-xl); text-align: center;">
          <h1 style="font-size: 4rem; margin-bottom: var(--space-md); color: var(--text-primary); font-weight: 300; letter-spacing: -1px;">
            A poética<br>do silêncio.
          </h1>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto; font-family: var(--font-ui); font-size: 1.1rem; line-height: 1.8;">
            Obras contemporâneas de Natanael Brentano. Textos curtos sobre a imensidão do efêmero.
          </p>
        </section>

        <section class="poems-list fade-in" style="max-width: var(--container-poetry); margin: 0 auto;">
          ${poemsHtml}
        </section>
        
        <section class="newsletter-section fade-in" style="margin-top: var(--space-4xl); padding: var(--space-2xl) var(--space-lg); background-color: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 2px; text-align: center; max-width: var(--container-poetry); margin-left: auto; margin-right: auto;">
          <h3 style="margin-bottom: var(--space-sm); font-family: var(--font-display); font-size: 2rem; color: var(--accent-subtle); font-weight: 400;">O Eco das Palavras</h3>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-lg); font-size: 0.95rem; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.6;">
            Receba ocasionalmente novos poemas e devaneios direto na sua caixa de entrada. Sem spam, apenas poesia.
          </p>
          <form id="subscribe-form" style="display: flex; gap: var(--space-sm); max-width: 380px; margin: 0 auto;">
            <input type="email" id="subscriber-email" placeholder="Endereço de e-mail" required style="flex: 1; font-size: 0.9rem; padding: 0.75rem 1rem; border: 1px solid var(--border-strong); background: transparent;">
            <button type="submit" style="background: var(--text-primary); color: var(--bg-primary); padding: 0.75rem 1.5rem; font-weight: 500; font-size: 0.9rem; border-radius: 2px;">Assinar</button>
          </form>
          <div id="subscribe-message" style="margin-top: var(--space-sm); font-size: 0.85rem; font-family: var(--font-ui);"></div>
        </section>
      </div>
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
  }
};
