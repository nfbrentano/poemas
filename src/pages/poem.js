import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';

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


export default {
  meta: {
    title: 'Poema'
  },
  async render(container, params) {
    const slug = params.slug;
    
    const skeletonHtml = `
      <div class="poem-container fade-in">
        <article class="single-poem">
          <header>
            <div class="skeleton skeleton-title" style="margin: 0 auto 1.5rem auto; width: 60%; height: 3.5rem;"></div>
            <div class="poem-meta" style="justify-content: center;">
              <div class="skeleton" style="width: 80px; height: 1rem;"></div>
              <div class="skeleton" style="width: 100px; height: 1rem;"></div>
            </div>
          </header>
          
          <div class="poem-content" style="display: flex; flex-direction: column; align-items: center; gap: 0.8rem; margin-top: 4rem;">
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
            <div class="skeleton skeleton-text" style="width: 35%;"></div>
            <div class="skeleton skeleton-text" style="width: 45%;"></div>
            <div class="skeleton skeleton-text" style="width: 30%;"></div>
            <div class="skeleton skeleton-text" style="width: 0; height: 1rem; margin: 1rem 0;"></div>
            <div class="skeleton skeleton-text" style="width: 38%;"></div>
            <div class="skeleton skeleton-text" style="width: 42%;"></div>
            <div class="skeleton skeleton-text" style="width: 33%;"></div>
          </div>
          
          <div class="share-section" style="margin-top: 4rem;">
            <div class="skeleton" style="width: 120px; height: 0.8rem; margin-bottom: 1rem;"></div>
            <div class="share-buttons">
              <div class="skeleton" style="width: 80px; height: 2.2rem; border-radius: 4px;"></div>
              <div class="skeleton" style="width: 80px; height: 2.2rem; border-radius: 4px;"></div>
              <div class="skeleton" style="width: 80px; height: 2.2rem; border-radius: 4px;"></div>
              <div class="skeleton" style="width: 120px; height: 2.2rem; border-radius: 4px;"></div>
            </div>
          </div>

          <div class="poem-actions" style="margin-top: 2rem; border-top: 1px solid var(--border-subtle); padding-top: 2rem; justify-content: center;">
            <div class="skeleton" style="width: 140px; height: 3rem; border-radius: 4px;"></div>
            <div class="skeleton" style="width: 140px; height: 3rem; border-radius: 4px;"></div>
          </div>
        </article>
      </div>
    `;

    container.innerHTML = skeletonHtml;
    
    // Fetch poem
    const { data: poem, error } = await supabase
      .from('poems')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
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

    // Fetch navigation data
    const [prevRes, nextRes, countRes, newerCountRes] = await Promise.all([
      supabase.from('poems').select('slug, title').eq('status', 'published').lt('published_at', poem.published_at).order('published_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('poems').select('slug, title').eq('status', 'published').gt('published_at', poem.published_at).order('published_at', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('poems').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('poems').select('id', { count: 'exact', head: true }).eq('status', 'published').gt('published_at', poem.published_at)
    ]);

    const prevSlug = prevRes.data?.slug || null;
    const nextSlug = nextRes.data?.slug || null;
    const totalCount = countRes.count || 0;
    const currentIndex = (newerCountRes.count || 0) + 1;

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
      <div class="poem-container">
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
          
          <div class="share-section">
            <p class="share-label">Compartilhar obra</p>
            <div class="share-buttons">
              <button class="share-btn whatsapp" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp">WhatsApp</button>
              <button class="share-btn twitter" aria-label="Compartilhar no X (Twitter)" data-platform="twitter">𝕏 (Twitter)</button>
              <button class="share-btn facebook" aria-label="Compartilhar no Facebook" data-platform="facebook">Facebook</button>
              <button id="web-share-btn" class="share-btn generic" aria-label="Mais opções de compartilhamento">Compartilhar...</button>
            </div>
          </div>

          <div class="poem-actions">
            <button id="copy-poem-btn" class="btn-secondary" aria-label="Copiar texto do poema">Copiar Poema</button>
            
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
          <button id="prev-btn" class="nav-btn" style="${!prevSlug ? 'display:none;' : ''}" aria-label="Poema anterior">
            ← Anterior
          </button>
          
          <div class="nav-center">
            <div id="progress" class="nav-progress">
              Poema ${currentIndex} de ${totalCount}
            </div>
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${!nextSlug ? 'display:none;' : ''}" aria-label="Próximo poema">
            Próximo →
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

    // Scroll logic (Progress bar + Instagram-style nav)
    const scrollBar = document.getElementById('scroll-bar');
    const poemContainer = document.querySelector('.poem-container');
    const poemNav = document.querySelector('.poem-nav');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    let showedNext = false, showedPrev = false;

    const handleScroll = throttle(() => {
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
      if (scrollTop > 50) {
        poemNav.classList.add('visible');
      } else {
        poemNav.classList.remove('visible');
      }

      // Next (95% scroll)
      if (scrollTop + clientHeight > scrollHeight * 0.90 && nextSlug && !showedNext) {
        showedNext = true;
        if (nextBtn) nextBtn.style.transform = 'scale(1.05)';
        setTimeout(() => { if(nextBtn) nextBtn.style.transform = 'scale(1)'; }, 200)
      }
      
      // Prev (5% scroll)
      if (scrollTop < scrollHeight * 0.05 && prevSlug && !showedPrev) {
        showedPrev = true;
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Touch swipe mobile
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, {passive: true});
    document.addEventListener('touchend', e => {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(deltaX) > 80) { // Threshold for swipe
        if (deltaX > 0 && nextSlug) navigateTo(`/poema/${nextSlug}`);
        else if (deltaX < 0 && prevSlug) navigateTo(`/poema/${prevSlug}`);
      }
    }, {passive: true});

    // Click handlers
    nextBtn?.addEventListener('click', () => {
      if (nextSlug) navigateTo(`/poema/${nextSlug}`);
    });
    prevBtn?.addEventListener('click', () => {
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
