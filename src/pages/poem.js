import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';


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

    // Rastrear visualização do poema
    trackPageView('/poema/' + poem.slug, poem.id);
    
    // Update SEO dynamically

    const poemUrl = window.location.href;
    const cleanExcerpt = (poem.excerpt || poem.content)
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) + '...';
    
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
      <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
      
      <article class="single-poem fade-in">
        <header>
          <h1>${poem.title}</h1>
          <div class="poem-meta">
            <span>${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
            ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags.join(', ')}</span>` : ''}
          </div>
        </header>
        
        <div id="poem-text" class="poem-content">${poem.content}</div>
        
        <div class="share-section" style="margin-top: var(--space-xl); padding-top: var(--space-md); border-top: 1px solid var(--border-subtle);">
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--space-xs); text-transform: uppercase; letter-spacing: 1px;">Compartilhar obra</p>
          <div class="share-buttons" style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
            <button class="share-btn whatsapp" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp" style="background: #25D366; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer;">WhatsApp</button>
            <button class="share-btn twitter" aria-label="Compartilhar no X (Twitter)" data-platform="twitter" style="background: #000000; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer;">𝕏 (Twitter)</button>
            <button class="share-btn facebook" aria-label="Compartilhar no Facebook" data-platform="facebook" style="background: #1877F2; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer;">Facebook</button>
            <button id="web-share-btn" aria-label="Mais opções de compartilhamento" style="background: var(--accent-subtle); color: var(--bg-primary); border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer;">Compartilhar...</button>
          </div>
        </div>

        <div class="poem-actions" style="margin-top: var(--space-lg);">
          <button id="copy-poem-btn" class="btn-secondary" aria-label="Copiar texto do poema" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; color: var(--text-secondary);">Copiar Poema</button>
          
          ${isAdmin ? `
            <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px;" data-link>Editar Obra</a>
            <button id="export-ig-btn" class="btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px;">Gerar Card Instagram</button>
          ` : ''}
        </div>
      </article>

      
      <!-- Newsletter Section -->
      <section class="newsletter-section fade-in" style="margin-top: var(--space-2xl); padding: var(--space-2xl) var(--space-lg); background-color: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 2px; text-align: center; max-width: var(--container-poetry); margin-left: auto; margin-right: auto;">
        <h3 style="margin-bottom: var(--space-sm); font-family: var(--font-display); font-size: 2rem; color: var(--accent-subtle); font-weight: 400;">O Eco das Palavras</h3>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg); font-size: 0.95rem; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.6;">
          Receba ocasionalmente novos poemas e devaneios direto na sua caixa de entrada. Sem spam, apenas poesia.
        </p>
        <form id="subscribe-form" style="display: flex; gap: var(--space-sm); max-width: 380px; margin: 0 auto;">
          <input type="email" id="subscriber-email" placeholder="Endereço de e-mail" required aria-label="Endereço de e-mail para newsletter" style="flex: 1; font-size: 0.9rem; padding: 0.75rem 1rem; border: 1px solid var(--border-strong); background: transparent; color: var(--text-primary);">
          <button type="submit" style="background: var(--text-primary); color: var(--bg-primary); padding: 0.75rem 1.5rem; font-weight: 500; font-size: 0.9rem; border-radius: 2px;">Assinar</button>
        </form>
        <div id="subscribe-message" style="margin-top: var(--space-sm); font-size: 0.85rem; font-family: var(--font-ui);"></div>
      </section>

      <div style="text-align: center; margin-top: var(--space-3xl); margin-bottom: var(--space-xl);">
        <a href="${import.meta.env.BASE_URL}" data-link style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; padding: 1rem; transition: color var(--transition-fast);">
          ← Voltar para o início
        </a>
      </div>
      
      <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>
    `;
    
    // Sharing Logic
    const shareUrl = window.location.href;
    const shareText = `Leia "${poem.title}", um poema de Natanael Brentano:`;

    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        let url = '';
        if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    const webShareBtn = document.getElementById('web-share-btn');
    if (navigator.share) {
      webShareBtn.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: poem.title,
            text: shareText,
            url: shareUrl
          });
        } catch (err) {
          console.log('Share failed:', err);
        }
      });
    } else {
      webShareBtn.innerText = 'Copiar Link';
      webShareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          webShareBtn.innerText = 'Copiado!';
          setTimeout(() => webShareBtn.innerText = 'Copiar Link', 2000);
        });
      });
    }


    // Copy Poem Logic
    const copyBtn = document.getElementById('copy-poem-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = document.getElementById('poem-text').innerText;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyBtn.innerText;
          copyBtn.innerText = 'Copiado!';
          copyBtn.style.color = 'var(--success)';
          copyBtn.style.borderColor = 'var(--success)';
          setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.color = 'var(--text-secondary)';
            copyBtn.style.borderColor = 'var(--border-strong)';
          }, 2000);
        });
      });
    }

    // Scroll Progress Logic
    const scrollBar = document.getElementById('scroll-bar');
    const updateScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (scrollBar) scrollBar.style.width = scrolled + "%";
    };
    window.addEventListener('scroll', updateScroll);
    
    // Newsletter form logic
    const subForm = document.getElementById('subscribe-form');
    if (subForm) {
      subForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('subscriber-email').value;
        const msgEl = document.getElementById('subscribe-message');
        msgEl.innerHTML = 'Enviando...';
        const { error } = await supabase.from('subscribers').insert([{ email }]);
        if (error) {
          msgEl.innerHTML = error.code === '23505' ? 'Este e-mail já está inscrito.' : 'Erro ao inscrever.';
          msgEl.style.color = 'var(--error)';
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
