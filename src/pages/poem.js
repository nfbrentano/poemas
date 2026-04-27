import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';
import { loadReactions, toggleReaction, EMOJIS } from '../utils/reactions.js';

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}


// Module-level variables to store removable handlers
let handleScroll = null;
let handleTouchStart = null;
let handleTouchEnd = null;
let handleKeydown = null;

export default {
  meta: {
    title: 'Poema'
  },
  cleanup() {
    if (handleScroll) window.removeEventListener('scroll', handleScroll);
    if (handleTouchStart) document.removeEventListener('touchstart', handleTouchStart);
    if (handleTouchEnd) document.removeEventListener('touchend', handleTouchEnd);
    if (handleKeydown) document.removeEventListener('keydown', handleKeydown);
    document.documentElement.classList.remove('immersive-mode');
    
    handleScroll = null;
    handleTouchStart = null;
    handleTouchEnd = null;
    handleKeydown = null;
  },
  async render(container, params) {
    const slug = params.slug;
    
    const skeletonHtml = `
      <div class="poem-container fade-in">
        <article class="single-poem">
          <header>
            <div class="skeleton skeleton-title-large" style="width: 70%;"></div>
            <div class="skeleton-row" style="width: 40%; margin: 0 auto;"></div>
          </header>
          
          <div class="poem-content">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row" style="width: 85%;"></div>
            <div class="skeleton skeleton-row" style="width: 90%;"></div>
            <div class="skeleton skeleton-row" style="width: 75%;"></div>
            <div class="skeleton-row" style="height: 2rem; border: none;"></div>
            <div class="skeleton skeleton-row" style="width: 80%;"></div>
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row" style="width: 70%;"></div>
          </div>
          
          <div class="poem-actions">
            <div class="skeleton" style="width: 140px; height: 3rem;"></div>
          </div>
        </article>
      </div>
    `;

    container.innerHTML = skeletonHtml;
    
    // Fetch poem with navigation data in a single RPC
    const { data: poem, error } = await supabase
      .rpc('get_poem_with_navigation', { target_slug: slug })
      .single();
      
    if (error || !poem) {
      container.innerHTML = `
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="${import.meta.env.BASE_URL}" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;
      return;
    }

    const prevSlug = poem.prev_slug;
    const nextSlug = poem.next_slug;
    const prevTitle = poem.prev_title;
    const nextTitle = poem.next_title;

    // Tempo Estimado de Leitura
    const plainText = (poem.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(' ').filter(w => w.length > 0).length;
    const readingMinutes = Math.ceil(wordCount / 200);
    const readingLabel = readingMinutes <= 1 ? '1 min de leitura' : `${readingMinutes} min de leitura`;

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
      url: poemUrl,
      type: 'article',
      publishedTime: poem.published_at,
      tags: poem.tags
    });
    
    // Check if user is logged in (to show admin buttons)
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = !!session;
    
    // Render
    container.innerHTML = `
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${poem.title}</h1>
            <div class="poem-meta">
              <span>${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
              ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags.join(', ')}</span>` : ''}
              <span>- </span>
              <span class="reading-time">${readingLabel}</span>
            </div>
          </header>
          
          <div id="poem-text" class="poem-content">${poem.content}</div>

          <div class="share-section">
            <p class="share-label">Compartilhar obra</p>
            <div class="share-buttons">
              <button class="share-btn whatsapp" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp">WhatsApp</button>
              <button class="share-btn twitter" aria-label="Compartilhar no X (Twitter)" data-platform="twitter">𝕏 (Twitter)</button>
              <button class="share-btn facebook" aria-label="Compartilhar no Facebook" data-platform="facebook">Facebook</button>
              <button id="web-share-btn" class="share-btn generic" aria-label="Mais opções de compartilhamento">Compartilhar...</button>
            </div>
          </div>

          <div class="reactions-section">
            <p class="reactions-label">O que este poema desperta?</p>
            <div class="reactions-bar" id="reactions-bar">
              ${EMOJIS.map(e => `
                <button class="reaction-btn" data-emoji="${e}" aria-label="Reagir com ${e}">
                  <span class="reaction-emoji">${e}</span>
                  <span class="reaction-count" data-count="${e}">…</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="poem-actions">
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${isAdmin ? `
              <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="export-ig-btn" class="btn-secondary">Gerar Card Instagram</button>
            ` : ''}
          </div>
        </article>

        
        <!-- Newsletter Section -->
        ${newsletter.render()}

        <div style="text-align: center; margin-top: var(--space-3xl); margin-bottom: var(--space-xl);">
          <a href="${import.meta.env.BASE_URL}" data-link class="back-link">
            ← Voltar para o início
          </a>
        </div>
        
        <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${!prevSlug ? 'display:none;' : ''}" aria-label="Poema anterior" title="${prevTitle || ''}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${prevTitle || ''}</span>
          </button>
          
          <div class="nav-center">
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${!nextSlug ? 'display:none;' : ''}" aria-label="Próximo poema" title="${nextTitle || ''}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${nextTitle || ''}</span>
          </button>
        </div>
      </div>
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
          // Share failed
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




    // Reactions Logic
    const { counts, userReactions } = await loadReactions(poem.id);

    const updateReactionUI = (counts, userReactions) => {
      EMOJIS.forEach(emoji => {
        const btn = container.querySelector(`.reaction-btn[data-emoji="${emoji}"]`);
        const countEl = container.querySelector(`.reaction-count[data-count="${emoji}"]`);
        if (btn) btn.classList.toggle('reacted', userReactions.has(emoji));
        if (countEl) countEl.textContent = counts[emoji] || 0;
      });
    };
    updateReactionUI(counts, userReactions);

    container.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const emoji = btn.dataset.emoji;
        btn.disabled = true;
        const action = await toggleReaction(poem.id, emoji);
        const { counts: newCounts, userReactions: newUR } = await loadReactions(poem.id);
        updateReactionUI(newCounts, newUR);
        btn.disabled = false;
      });
    });

    // Immersive Mode Logic
    const immersiveBtn = document.getElementById('immersive-btn');
    let isImmersive = false;

    const enterImmersive = () => {
      isImmersive = true;
      document.documentElement.classList.add('immersive-mode');
      immersiveBtn.innerHTML = '✕ Sair da Leitura';
      immersiveBtn.setAttribute('aria-label', 'Sair do modo leitura imersiva');
    };

    const exitImmersive = () => {
      isImmersive = false;
      document.documentElement.classList.remove('immersive-mode');
      immersiveBtn.innerHTML = '⬜ Leitura Imersiva';
      immersiveBtn.setAttribute('aria-label', 'Modo leitura imersiva');
    };

    immersiveBtn?.addEventListener('click', () => {
      if (isImmersive) exitImmersive(); else enterImmersive();
    });

    // Esc para sair
    handleKeydown = (e) => {
      if (e.key === 'Escape' && isImmersive) exitImmersive();
    };
    document.addEventListener('keydown', handleKeydown);

    // Scroll logic (Progress bar + Instagram-style nav)
    const scrollBar = document.getElementById('scroll-bar');
    const poemNav = document.querySelector('.poem-nav');
    const nextBtn = document.getElementById('next-btn');
    let showedNext = false;

    handleScroll = throttle(() => {
      // Progress bar
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (scrollBar) scrollBar.style.width = scrolled + "%";

      // Sequential Nav Logic
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Show Nav Container if any scroll happened
      if (poemNav) {
        if (scrollTop > 50) {
          poemNav.classList.add('visible');
        } else {
          poemNav.classList.remove('visible');
        }
      }

      // Next (95% scroll)
      if (scrollTop + clientHeight > scrollHeight * 0.90 && nextSlug && !showedNext) {
        showedNext = true;
        if (nextBtn) nextBtn.style.transform = 'scale(1.05)';
        setTimeout(() => { if(nextBtn) nextBtn.style.transform = 'scale(1)'; }, 200)
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Touch swipe mobile
    let touchStartX = 0;
    handleTouchStart = e => touchStartX = e.touches[0].clientX;
    handleTouchEnd = e => {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(deltaX) > 80) { // Threshold for swipe
        if (deltaX > 0 && nextSlug) navigateTo(`/poema/${nextSlug}`);
        else if (deltaX < 0 && prevSlug) navigateTo(`/poema/${prevSlug}`);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, {passive: true});
    document.addEventListener('touchend', handleTouchEnd, {passive: true});

    // Click handlers
    nextBtn?.addEventListener('click', () => {
      if (nextSlug) navigateTo(`/poema/${nextSlug}`);
    });
    document.getElementById('prev-btn')?.addEventListener('click', () => {
      if (prevSlug) navigateTo(`/poema/${prevSlug}`);
    });
    
    // Newsletter form logic
    newsletter.init();

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
