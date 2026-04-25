import { supabase } from '../utils/supabase.js';

export default {
  meta: {
    title: 'Natanael Brentano - Poemas'
  },
  async render(container) {
    container.innerHTML = '<div class="loading fade-in" style="text-align:center; padding: 4rem;">Carregando poemas...</div>';
    
    // Fetch published poems
    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, title, slug, excerpt, tags, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
      
    if (error) {
      console.error(error);
      container.innerHTML = '<div class="error" style="text-align:center; color: var(--error-color);">Erro ao carregar os poemas. Tente novamente mais tarde.</div>';
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
    
    // Generate HTML for poems
    const poemsHtml = poems.map(poem => `
      <article class="poem-card fade-in">
        <a href="/poema/${poem.slug}" data-link class="poem-card-link">
          <h2 class="poem-title">${poem.title}</h2>
          <p class="poem-excerpt">${poem.excerpt || '...'}</p>
          <div class="poem-meta">
            <span class="poem-date">${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
            ${poem.tags && poem.tags.length > 0 ? `<span class="poem-tags">${poem.tags.join(', ')}</span>` : ''}
          </div>
        </a>
      </article>
    `).join('');
    
    container.innerHTML = `
      <div class="home-layout">
        <section class="hero-section fade-in" style="margin-bottom: 4rem; text-align: center;">
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Poemas</h1>
          <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
            Bem-vindo ao meu espaço autoral. Uma coleção de pensamentos, silêncios e palavras.
          </p>
        </section>
        <div class="poems-grid" style="display: grid; gap: 2rem; max-width: 700px; margin: 0 auto;">
          ${poemsHtml}
        </div>
        
        <section class="newsletter-section fade-in" style="margin-top: 6rem; padding-top: 4rem; border-top: 1px solid var(--border-color); text-align: center;">
          <h3 style="margin-bottom: 1rem; font-family: var(--font-serif-title); font-size: 1.5rem;">Acompanhe as publicações</h3>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Deixe seu e-mail para receber novos poemas diretamente na sua caixa de entrada.</p>
          <form id="subscribe-form" style="display: flex; gap: 1rem; max-width: 400px; margin: 0 auto;">
            <input type="email" id="subscriber-email" placeholder="Seu melhor e-mail" required style="flex: 1;">
            <button type="submit" style="background: var(--text-primary); color: var(--bg-color); padding: 0.5rem 1.5rem; border-radius: 4px; font-weight: 500;">Assinar</button>
          </form>
          <div id="subscribe-message" style="margin-top: 1rem; font-size: 0.9rem;"></div>
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
            msgEl.style.color = 'var(--error-color)';
          }
        } else {
          msgEl.innerHTML = 'Obrigado por assinar.';
          msgEl.style.color = 'var(--success-color)';
          subForm.reset();
        }
      });
    }
  }
};
