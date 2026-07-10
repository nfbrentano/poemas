import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';
import { loadReactions, toggleReaction, EMOJIS } from '../utils/reactions.js';
import { favorites, history } from '../utils/favorites.js';
import { escapeHtml } from '../utils/html.js';
import { toast } from '../components/toast.js';
import { notes } from '../utils/notes.js';

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
let isExportingQuote = false;
let quoteText = '';

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
    isExportingQuote = false;
    quoteText = '';
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
    console.log('[Poem] Fetching slug:', slug);
    const { data: poems, error } = await supabase
      .rpc('get_poem_with_navigation', { target_slug: slug });
      
    if (error) {
      console.error('[Poem] RPC Error:', error);
    }
      
    const poem = poems && Array.isArray(poems) && poems.length > 0 ? poems[0] : null;
      
    if (error || !poem) {
      console.warn('[Poem] Poem not found or error occurred');
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

    // Adicionar ao histórico de leitura
    try {
      history.add(poem);
      window.dispatchEvent(new CustomEvent('history-updated'));
    } catch (err) {
      console.error('Erro ao salvar no histórico:', err);
    }

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
    
    const fallbackImageUrl = `${window.location.origin}${import.meta.env.BASE_URL}og-cover.jpg`;
    updateSEO({
      title: poem.title,
      description: cleanExcerpt,
      url: poemUrl,
      imageUrl: fallbackImageUrl,
      type: 'article',
      publishedTime: poem.published_at,
      tags: poem.tags
    });
    
    // Check if user is logged in (to show admin buttons)
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = !!session;
     // Formatar poema para animação de linhas (staggered reveal)
    const formatPoemForAnimation = (content) => {
      if (!content) return '';
      // Divide por quebras de linha duplas (estrofes)
      const stanzas = content.split(/\n\s*\n/).filter(s => s.trim());
      let lineIndex = 0;
      return stanzas.map(stanza => {
        const lines = stanza.split('\n');
        const linesHtml = lines.map(line => {
          lineIndex++;
          return `<span class="line-reveal" style="transition-delay: ${lineIndex * 0.05}s">${line}</span>`;
        }).join('');
        return `<div class="stanza stagger-reveal">${linesHtml}</div>`;
      }).join('');
    };
    
    const formattedContent = formatPoemForAnimation(poem.content);

    // Render
    container.innerHTML = `
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${poem.title}</h1>
            <div class="poem-meta">
              <span>${new Date(poem.published_at).toLocaleDateString('pt-BR')}</span>
              <span>•</span>
              <span class="reading-time">${readingLabel}</span>
            </div>
          </header>

          
          
          <div id="poem-text" class="poem-content">${formattedContent}</div>

          <div class="read-next-section">
            ${nextSlug ? `
              <p class="read-next-label">Próxima Obra</p>
              <a href="${import.meta.env.BASE_URL}poema/${nextSlug}" class="read-next-card" data-link>
                <h2 class="read-next-title">${nextTitle}</h2>
                <span class="read-next-btn">Ler Agora →</span>
              </a>
            ` : `
              <p class="read-next-label">Fim da Jornada</p>
              <a href="${import.meta.env.BASE_URL}" class="read-next-card" data-link>
                <h2 class="read-next-title">Voltar ao Início</h2>
                <p class="read-next-excerpt">Há sempre algo novo no silêncio da página inicial.</p>
              </a>
            `}
          </div>

          <div class="share-section">
            <p class="share-label">Compartilhar obra</p>
            <div class="share-buttons">
              <button class="share-btn whatsapp" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp">WhatsApp</button>
              <button class="share-btn twitter" aria-label="Compartilhar no X (Twitter)" data-platform="twitter">𝕏 (Twitter)</button>
              <button class="share-btn facebook" aria-label="Compartilhar no Facebook" data-platform="facebook">Facebook</button>
              <button id="web-share-btn" class="share-btn generic" aria-label="Mais opções de compartilhamento">Compartilhar...</button>
            </div>
            <div class="instagram-cta" style="margin-top: var(--space-md); text-align: center; font-size: 0.85rem; color: var(--text-secondary); font-family: var(--font-ui); letter-spacing: 0.5px;">
              Gostou do poema? Acompanhe também no Instagram: <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" class="instagram-link" style="color: var(--accent-subtle, var(--text-primary)); text-decoration: none; border-bottom: 1px solid currentColor; font-weight: 500; transition: opacity 0.2s;">@nfgbrentano</a>
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

          <div class="comments-section">
            <p class="comments-label">Notas de quem passou por aqui</p>
            <div id="comments-list" class="comments-list">
              <p class="comments-empty">Silêncio... nenhum comentário ainda.</p>
            </div>
            
            <form id="comment-form" class="comment-form">
              <p class="comment-form-title">Deixe sua nota</p>
              <div class="comment-form-group">
                <input type="text" id="comment-author" placeholder="Seu nome" required maxlength="50">
              </div>
              <div class="comment-form-group">
                <textarea id="comment-content" placeholder="Sua percepção sobre esta obra..." required maxlength="500"></textarea>
              </div>
              <button type="submit" id="submit-comment-btn" class="btn-primary">Enviar Nota</button>
              <p id="comment-msg" class="comment-msg"></p>
            </form>
          </div>

          <!-- Painel de Notas Pessoais -->
          <div id="notes-panel" class="notes-panel" style="display: none;">
            <p style="font-family: var(--font-ui); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-xs); color: var(--text-secondary);">Minha percepção íntima (salva offline)</p>
            <textarea id="note-textarea" placeholder="Escreva suas impressões mais íntimas sobre este poema..." style="width: 100%; min-height: 120px; background: transparent; border: none; resize: vertical; outline: none; font-family: var(--font-poem); line-height: 1.6; color: var(--text-primary); margin-bottom: var(--space-xs);"></textarea>
            <div style="display: flex; gap: var(--space-xs); justify-content: flex-end;">
              <button id="delete-note-btn" class="btn-secondary" style="font-size: 0.75rem; color: var(--error);">Excluir</button>
              <button id="save-note-btn" class="btn-primary" style="font-size: 0.75rem;">Salvar Nota</button>
            </div>
          </div>

          <div class="poem-actions">
            <div class="ambient-audio-controls">
              <button class="ambient-btn" data-sound="silence" title="Silêncio">Mudo</button>
              <button class="ambient-btn" data-sound="rain" title="Som de Chuva">Chuva</button>
              <button class="ambient-btn" data-sound="fire" title="Som de Lareira">Lareira</button>
            </div>
            <div class="font-controls">
              <button class="font-btn family-btn" data-family="serif" title="Fonte Clássica">Serif</button>
              <button class="font-btn family-btn" data-family="sans" title="Fonte Moderna">Sans</button>
              <button class="font-btn family-btn" data-family="hand" title="Fonte Manuscrita">Manuscrita</button>
              <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
              <button class="font-btn align-btn" data-align="left" title="Alinhar à Esquerda">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align: middle;"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
              </button>
              <button class="font-btn align-btn" data-align="center" title="Centralizar">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align: middle;"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="12" x2="7" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
              </button>
              <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
              <button class="font-btn height-btn" data-height="normal" title="Espaçamento Normal">≡</button>
              <button class="font-btn height-btn" data-height="relaxed" title="Espaçamento Maior">↕</button>
              <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
              <button class="font-btn size-btn" data-size="sm" title="Diminuir fonte">A-</button>
              <button class="font-btn size-btn" data-size="md" title="Fonte padrão">A</button>
              <button class="font-btn size-btn" data-size="lg" title="Aumentar fonte">A+</button>
            </div>
            <button id="fav-btn" class="btn-secondary" aria-label="Salvar poema">
              <span class="fav-icon">♡</span> <span class="fav-text">Salvar</span>
            </button>
            
            <button id="note-btn" class="btn-secondary" aria-label="Anotações pessoais">
              <span class="note-icon">✏</span> <span class="note-text">Anotar</span>
            </button>
            
            <button id="share-card-btn" class="btn-secondary" aria-label="Gerar card para compartilhar">
              🖼 Compartilhar Card
            </button>
            
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${isAdmin ? `
              <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
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

        <audio id="ambient-audio" loop></audio>
        <div id="highlight-tooltip" class="highlight-tooltip">
          <button id="highlight-copy-btn" class="highlight-btn">Copiar</button>
          <button id="highlight-share-btn" class="highlight-btn">Compartilhar</button>
          <button id="highlight-card-btn" class="highlight-btn">Gerar Card</button>
        </div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${!prevSlug ? 'display:none;' : ''}" aria-label="Poema anterior" title="${prevTitle || ''}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${prevTitle || ''}</span>
          </button>
          
          <div class="nav-center">
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano <span class="footer-separator">•</span> <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" class="footer-social-link" style="letter-spacing: 0.5px; text-transform: none; display: inline-flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> @nfgbrentano</a>
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${!nextSlug ? 'display:none;' : ''}" aria-label="Próximo poema" title="${nextTitle || ''}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${nextTitle || ''}</span>
          </button>
        </div>

        <!-- Painel de Controle da Leitura Imersiva -->
        <div id="immersive-control-panel" class="immersive-control-panel">
          <div class="immersive-panel-row">
            <label for="immersive-size-slider">Tamanho do texto</label>
            <div class="slider-wrapper">
              <input type="range" id="immersive-size-slider" min="16" max="32" value="20" step="1">
              <span id="immersive-size-value" class="immersive-panel-value">20px</span>
            </div>
          </div>
          <div class="immersive-panel-row">
            <label for="immersive-height-slider">Espaçamento</label>
            <div class="slider-wrapper">
              <input type="range" id="immersive-height-slider" min="15" max="30" value="22" step="1">
              <span id="immersive-height-value" class="immersive-panel-value">2.2</span>
            </div>
          </div>
          <button id="immersive-exit-btn" class="btn-secondary" style="width: 100%; margin-top: var(--space-xs);">✕ Sair da Leitura</button>
        </div>

        <!-- Modal de Preview do Card -->
        <div id="card-preview-modal" class="card-preview-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 3000; background: rgba(0,0,0,0.85); align-items: center; justify-content: center; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
          <div class="card-preview-content" style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: var(--space-lg); max-width: 420px; width: 90%; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5); font-family: var(--font-ui);">
            <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-sm); color: var(--text-primary);">Exportar Card</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--space-md);">Escolha um estilo visual para o card antes do download.</p>
            
            <div class="theme-selector" style="display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-lg);">
              <button class="preview-theme-btn active" data-theme="dark" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: #050505; color: #e2e2e2; cursor: pointer; font-size: 0.8rem;">Escuro</button>
              <button class="preview-theme-btn" data-theme="light" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #fdfdfd; color: #1a1a1a; cursor: pointer; font-size: 0.8rem;">Claro</button>
              <button class="preview-theme-btn" data-theme="sepia" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #eae0c7; color: #433422; cursor: pointer; font-size: 0.8rem;">Sépia</button>
            </div>

            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: var(--space-md) 0 var(--space-xs) 0;">Formato do Card:</p>
            <div class="ratio-selector" style="display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-lg);">
              <button class="preview-ratio-btn active" data-ratio="feed" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); cursor: pointer; font-size: 0.8rem;">Feed (4:5)</button>
              <button class="preview-ratio-btn" data-ratio="stories" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer; font-size: 0.8rem;">Stories (9:16)</button>
            </div>

            <div style="display: flex; gap: var(--space-xs); justify-content: center;">
              <button id="close-preview-btn" class="btn-secondary" style="padding: var(--space-xs) var(--space-md); font-size: 0.85rem;">Cancelar</button>
              <button id="download-card-btn" class="btn-primary" style="padding: var(--space-xs) var(--space-md); font-size: 0.85rem;">Baixar Imagem</button>
            </div>
          </div>
        </div>
      </div>
      <div id="immersive-hint" class="immersive-hint">Deslize para navegar →</div>
    `;

    // Setup Intersection Observer para animação das estrofes
    const setupStanzaAnimation = () => {
      // Respeitar preferência de movimento reduzido
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        container.querySelectorAll('.stagger-reveal').forEach(el => el.classList.add('revealed'));
        return;
      }

      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
      };

      const stanzaObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      container.querySelectorAll('.stagger-reveal').forEach(el => stanzaObserver.observe(el));
    };

    setupStanzaAnimation();
    
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
          toast.show('Link copiado para a área de transferência!', 'success');
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
        
        // Add micro-interaction animation class
        btn.classList.add('reacted');
        setTimeout(() => {
          // keep 'reacted' if selected, but re-trigger animation by toggling it?
          // Actually, we can just remove it and re-add if needed, but CSS handles it via state.
          // Let's force a reflow to re-trigger animation if already active
          btn.style.animation = 'none';
          btn.offsetHeight; /* trigger reflow */
          btn.style.animation = null; 
        }, 10);
        
        btn.disabled = false;
      });
    });

    // Comments Logic
    const loadComments = async () => {
      const { data: comments, error } = await supabase
        .from('poem_comments')
        .select('author_name, content, created_at')
        .eq('poem_id', poem.id)
        .eq('approved', true)
        .order('created_at', { ascending: true });
      
      const listEl = document.getElementById('comments-list');
      if (error || !comments || comments.length === 0) {
        listEl.innerHTML = '<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>';
        return;
      }

      listEl.innerHTML = comments.map(c => `
        <div class="comment-item fade-in">
          <div class="comment-meta">
            <span class="comment-author">${escapeHtml(c.author_name)}</span>
            <span class="comment-date">${new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.content)}</div>
        </div>
      `).join('');
    };
    loadComments();

    const commentForm = document.getElementById('comment-form');
    commentForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = document.getElementById('comment-author').value;
      const content = document.getElementById('comment-content').value;
      const btn = document.getElementById('submit-comment-btn');
      const msg = document.getElementById('comment-msg');

      btn.disabled = true;
      btn.innerText = 'Enviando...';

      const { error } = await supabase
        .from('poem_comments')
        .insert([{ poem_id: poem.id, author_name: author, content: content }]);

      if (error) {
        toast.show('Erro ao enviar comentário.', 'error');
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
      } else {
        toast.show('Sua nota foi enviada e aguarda moderação.', 'success');
        commentForm.reset();
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
        // Não carregamos o comentário novo pois ele precisa de aprovação
      }
    });

    // Favorites Logic
    const favBtn = document.getElementById('fav-btn');
    const updateFavUI = async () => {
      const isFav = await favorites.has(poem.slug);
      if (favBtn) {
        favBtn.querySelector('.fav-icon').textContent = isFav ? '♥' : '♡';
        favBtn.querySelector('.fav-text').textContent = isFav ? 'Salvo' : 'Salvar';
        favBtn.classList.toggle('active', isFav);
      }
    };
    updateFavUI();

    favBtn?.addEventListener('click', async () => {
      const isFav = await favorites.has(poem.slug);
      if (isFav) {
        await favorites.remove(poem.slug);
        toast.show('Obra removida dos itens salvos.', 'info');
      } else {
        await favorites.save(poem);
        toast.show('Obra salva com sucesso.', 'heart');
        
        // Proactively fetch for Service Worker caching
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          fetch(`${import.meta.env.BASE_URL}poema/${poem.slug}`).catch(() => {});
        }
      }
      updateFavUI();
      
      // Add animation
      favBtn.classList.remove('animate-fav');
      void favBtn.offsetWidth; // trigger reflow
      favBtn.classList.add('animate-fav');
      setTimeout(() => favBtn.classList.remove('animate-fav'), 800);

      // Notify main.js to update header if needed
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    });

    // Immersive Mode Logic
    const immersiveBtn = document.getElementById('immersive-btn');
    const immersiveExitBtn = document.getElementById('immersive-exit-btn');
    const sizeSlider = document.getElementById('immersive-size-slider');
    const sizeValue = document.getElementById('immersive-size-value');
    const heightSlider = document.getElementById('immersive-height-slider');
    const heightValue = document.getElementById('immersive-height-value');
    const poemTextEl = document.getElementById('poem-text');
    let isImmersive = false;

    // Load initial values from localStorage or default
    const savedImmersiveSize = localStorage.getItem('immersive-reading-font-size') || '20';
    const savedImmersiveHeight = localStorage.getItem('immersive-reading-line-height') || '22';

    // Apply values to css custom properties on the poem text element
    if (poemTextEl) {
      poemTextEl.style.setProperty('--immersive-font-size', `${savedImmersiveSize}px`);
      poemTextEl.style.setProperty('--immersive-line-height', `${parseFloat(savedImmersiveHeight) / 10}`);
    }

    if (sizeSlider && sizeValue) {
      sizeSlider.value = savedImmersiveSize;
      sizeValue.textContent = `${savedImmersiveSize}px`;
      sizeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        sizeValue.textContent = `${val}px`;
        poemTextEl?.style.setProperty('--immersive-font-size', `${val}px`);
        localStorage.setItem('immersive-reading-font-size', val);
      });
    }

    if (heightSlider && heightValue) {
      heightSlider.value = savedImmersiveHeight;
      heightValue.textContent = `${(parseFloat(savedImmersiveHeight) / 10).toFixed(1)}`;
      heightSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const lh = (parseFloat(val) / 10).toFixed(1);
        heightValue.textContent = lh;
        poemTextEl?.style.setProperty('--immersive-line-height', lh);
        localStorage.setItem('immersive-reading-line-height', val);
      });
    }

    const enterImmersive = () => {
      isImmersive = true;
      document.documentElement.classList.add('immersive-mode');
      
      // Show gesture hint on first time
      const hintShown = localStorage.getItem('immersive-hint-shown');
      if (!hintShown) {
        const hint = document.getElementById('immersive-hint');
        if (hint) {
          hint.classList.add('visible');
          setTimeout(() => {
            hint.classList.remove('visible');
            localStorage.setItem('immersive-hint-shown', 'true');
          }, 3000);
        }
      }
    };

    const exitImmersive = () => {
      isImmersive = false;
      document.documentElement.classList.remove('immersive-mode');
    };

    immersiveBtn?.addEventListener('click', enterImmersive);
    immersiveExitBtn?.addEventListener('click', exitImmersive);

    // Personal Notes Logic
    const noteBtn = document.getElementById('note-btn');
    const notesPanel = document.getElementById('notes-panel');
    const noteTextarea = document.getElementById('note-textarea');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');

    const updateNotesUI = async () => {
      try {
        const savedNote = await notes.get(slug);
        if (noteTextarea) noteTextarea.value = savedNote || '';
        
        const hasContent = !!savedNote;
        if (notesPanel) notesPanel.classList.toggle('has-content', hasContent);
        if (noteBtn) noteBtn.classList.toggle('active', hasContent);
      } catch (err) {
        console.error('Erro ao ler notas:', err);
      }
    };
    updateNotesUI();

    noteBtn?.addEventListener('click', () => {
      if (notesPanel) {
        const isHidden = notesPanel.style.display === 'none';
        notesPanel.style.display = isHidden ? 'block' : 'none';
        if (isHidden && noteTextarea) {
          noteTextarea.focus();
        }
      }
    });

    saveNoteBtn?.addEventListener('click', async () => {
      const val = noteTextarea.value.trim();
      if (!val) {
        toast.show('Escreva algo para salvar ou use Excluir.', 'info');
        return;
      }
      try {
        await notes.save(slug, val);
        toast.show('Sua percepção foi salva offline.', 'success');
        updateNotesUI();
      } catch (err) {
        toast.show('Erro ao salvar nota.', 'error');
      }
    });

    deleteNoteBtn?.addEventListener('click', async () => {
      if (!confirm('Deseja excluir sua anotação pessoal?')) return;
      try {
        await notes.delete(slug);
        if (noteTextarea) noteTextarea.value = '';
        toast.show('Anotação excluída.', 'info');
        updateNotesUI();
        if (notesPanel) notesPanel.style.display = 'none';
      } catch (err) {
        toast.show('Erro ao excluir nota.', 'error');
      }
    });

    // Typography Controls Logic
    const sizeBtns = container.querySelectorAll('.size-btn');
    const familyBtns = container.querySelectorAll('.family-btn');
    const heightBtns = container.querySelectorAll('.height-btn');
    const alignBtns = container.querySelectorAll('.align-btn');

    const updateActiveBtns = (btns, val) => {
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.size === val || btn.dataset.family === val || btn.dataset.height === val || btn.dataset.align === val));
    };

    // Load preferences
    const currentFontSize = localStorage.getItem('reading-font-size') || 'md';
    const currentFontFamily = localStorage.getItem('reading-font-family') || 'serif';
    const currentLineHeight = localStorage.getItem('reading-line-height') || 'normal';
    const currentAlignment = localStorage.getItem('reading-alignment') || 'center';

    // Apply initial classes
    document.documentElement.classList.remove('font-reading-sm', 'font-reading-md', 'font-reading-lg');
    document.documentElement.classList.add(`font-reading-${currentFontSize}`);
    document.documentElement.classList.remove('font-family-serif', 'font-family-sans', 'font-family-hand');
    document.documentElement.classList.add(`font-family-${currentFontFamily}`);
    document.documentElement.classList.remove('line-height-normal', 'line-height-relaxed');
    document.documentElement.classList.add(`line-height-${currentLineHeight}`);
    document.documentElement.classList.remove('align-reading-left', 'align-reading-center');
    document.documentElement.classList.add(`align-reading-${currentAlignment}`);
    
    updateActiveBtns(sizeBtns, currentFontSize);
    updateActiveBtns(familyBtns, currentFontFamily);
    updateActiveBtns(heightBtns, currentLineHeight);
    updateActiveBtns(alignBtns, currentAlignment);

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        document.documentElement.classList.remove('font-reading-sm', 'font-reading-md', 'font-reading-lg');
        document.documentElement.classList.add(`font-reading-${size}`);
        localStorage.setItem('reading-font-size', size);
        updateActiveBtns(sizeBtns, size);
      });
    });

    familyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const family = btn.dataset.family;
        document.documentElement.classList.remove('font-family-serif', 'font-family-sans', 'font-family-hand');
        document.documentElement.classList.add(`font-family-${family}`);
        localStorage.setItem('reading-font-family', family);
        updateActiveBtns(familyBtns, family);
      });
    });

    heightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const height = btn.dataset.height;
        document.documentElement.classList.remove('line-height-normal', 'line-height-relaxed');
        document.documentElement.classList.add(`line-height-${height}`);
        localStorage.setItem('reading-line-height', height);
        updateActiveBtns(heightBtns, height);
      });
    });

    alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.dataset.align;
        document.documentElement.classList.remove('align-reading-left', 'align-reading-center');
        document.documentElement.classList.add(`align-reading-${align}`);
        localStorage.setItem('reading-alignment', align);
        updateActiveBtns(alignBtns, align);
      });
    });

    // Ambient Audio Logic
    const ambientBtns = container.querySelectorAll('.ambient-btn');
    const ambientAudio = document.getElementById('ambient-audio');
    
    const sounds = {
      rain: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=heavy-rain-nature-sounds-8186.mp3', // Example rain sound
      fire: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_27d8ce6605.mp3?filename=fireplace-sound-21271.mp3' // Example fire sound
    };

    ambientBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sound = btn.dataset.sound;
        ambientBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (sound === 'silence') {
          ambientAudio.pause();
        } else {
          ambientAudio.src = sounds[sound];
          ambientAudio.volume = 0.5;
          ambientAudio.play().catch(e => console.error('Audio play failed:', e));
        }
      });
    });
    // Set initial active state for audio
    container.querySelector('.ambient-btn[data-sound="silence"]').classList.add('active');

    // Highlight Tooltip Logic
    const poemText = document.getElementById('poem-text');
    const tooltip = document.getElementById('highlight-tooltip');
    let selectedText = '';

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        tooltip.classList.remove('visible');
        return;
      }
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top + window.scrollY}px`;
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
    };

    poemText?.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection.isCollapsed) {
        tooltip.classList.remove('visible');
      }
    });

    document.getElementById('highlight-copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(selectedText).then(() => {
        toast.show('Trecho copiado para a área de transferência!', 'success');
        window.getSelection().removeAllRanges();
        tooltip.classList.remove('visible');
      });
    });

    document.getElementById('highlight-share-btn')?.addEventListener('click', () => {
      const textToShare = `"${selectedText}" — Natanael Brentano\n${window.location.href}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      window.getSelection().removeAllRanges();
      tooltip.classList.remove('visible');
    });

    document.getElementById('highlight-card-btn')?.addEventListener('click', () => {
      window.getSelection().removeAllRanges();
      tooltip.classList.remove('visible');
      isExportingQuote = true;
      quoteText = selectedText;
      const previewModal = document.getElementById('card-preview-modal');
      if (previewModal) {
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    });

    // Atalhos de teclado
    handleKeydown = (e) => {
      // Ignorar se estiver digitando num input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch(e.key) {
        case 'Escape':
          if (isImmersive) exitImmersive();
          break;
        case 'ArrowRight':
          if (nextSlug) navigateTo(`/poema/${nextSlug}`);
          break;
        case 'ArrowLeft':
          if (prevSlug) navigateTo(`/poema/${prevSlug}`);
          break;
        case 'f':
        case 'F':
          favBtn?.click();
          break;
        case 'i':
        case 'I':
          if (isImmersive) {
            exitImmersive();
          } else {
            enterImmersive();
          }
          break;
      }
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
    let touchStartY = 0;
    handleTouchStart = e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    handleTouchEnd = e => {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 2) { // Threshold for horizontal swipe
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

    // Card Export Preview Modal Logic
    const shareCardBtn = document.getElementById('share-card-btn');
    const previewModal = document.getElementById('card-preview-modal');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const themeBtns = container.querySelectorAll('.preview-theme-btn');
    const ratioBtns = container.querySelectorAll('.preview-ratio-btn');
    let selectedExportTheme = 'dark';
    let selectedExportRatio = 'feed';

    shareCardBtn?.addEventListener('click', () => {
      if (previewModal) {
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    });

    closePreviewBtn?.addEventListener('click', () => {
      if (previewModal) {
        previewModal.style.display = 'none';
        previewModal.classList.remove('active');
      }
    });

    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedExportTheme = btn.dataset.theme;
      });
    });

    ratioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        ratioBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--border-subtle)';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--border-strong)';
        selectedExportRatio = btn.dataset.ratio;
      });
    });

    downloadCardBtn?.addEventListener('click', async () => {
      downloadCardBtn.innerText = 'Gerando...';
      downloadCardBtn.disabled = true;
      try {
        const { generateSocialCard } = await import('../utils/social-export.js');
        const textToExport = isExportingQuote ? quoteText : null;
        await generateSocialCard(poem, document.getElementById('social-card-container'), selectedExportTheme, textToExport, selectedExportRatio);
        toast.show('Card gerado com sucesso!', 'success');
      } catch (err) {
        console.error(err);
        toast.show('Erro ao gerar card.', 'error');
      } finally {
        downloadCardBtn.innerText = 'Baixar Imagem';
        downloadCardBtn.disabled = false;
        isExportingQuote = false;
        quoteText = '';
        if (previewModal) {
          previewModal.style.display = 'none';
          previewModal.classList.remove('active');
        }
      }
    });

    if (isAdmin) {
      const resendBtn = document.getElementById('resend-email-btn');
      if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
          if (!confirm('Deseja realmente reenviar o email desta obra para todos os assinantes?')) return;
          resendBtn.innerText = 'Enviando...';
          resendBtn.disabled = true;
          try {
            const { data, error } = await supabase.functions.invoke('send-newsletter', {
              body: { poemId: poem.id }
            });
            if (error) throw error;
            alert(`Email reenviado com sucesso para ${data?.count || 0} assinantes!`);
          } catch(err) {
            console.error('Newsletter erro:', err);
            let detailedMsg = '';
            if (err.context && typeof err.context.json === 'function') {
              try {
                const errBody = await err.context.json();
                detailedMsg = errBody.error || errBody.message || '';
              } catch (e) {}
            }
            alert(`Houve um erro ao reenviar a newsletter:\n${detailedMsg || err.message || 'Erro na Edge Function'}`);
          } finally {
            resendBtn.innerText = 'Reenviar Email';
            resendBtn.disabled = false;
          }
        });
      }
    }

    // Prefetch adjacent routes
    const prefetchRoutes = () => {
      const BASE_URL = import.meta.env.BASE_URL;
      const slugsToPrefetch = [prevSlug, nextSlug].filter(Boolean);
      
      slugsToPrefetch.forEach(s => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `${window.location.origin}${BASE_URL}poema/${s}`;
        document.head.appendChild(link);
      });
    };
    setTimeout(prefetchRoutes, 2000);
  }
};
