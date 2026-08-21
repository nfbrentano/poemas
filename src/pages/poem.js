import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';
import { loadReactions, toggleReaction, EMOJIS } from '../utils/reactions.js';
import { escapeHtml, stripHtml, sanitizeUrl } from '../utils/html.js';
import { toast } from '../components/toast.js';

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
    
    const ambientAudio = document.getElementById('ambient-audio');
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio.removeAttribute('src');
      ambientAudio.load();
    }

    const narrationAudio = document.getElementById('narration-audio');
    if (narrationAudio) {
      narrationAudio.pause();
      narrationAudio.removeAttribute('src');
      narrationAudio.load();
    }

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

    // Fallback for audio_url if RPC does not return it in unmigrated environment
    if (poem && poem.audio_url === undefined) {
      try {
        const { data: audioData } = await supabase.from('poems').select('audio_url').eq('id', poem.id).single();
        if (audioData && audioData.audio_url) {
          poem.audio_url = audioData.audio_url;
        }
      } catch (e) {
        console.warn('Fallback query for audio_url failed:', e);
      }
    }

    const prevSlug = poem.prev_slug;
    const nextSlug = poem.next_slug;
    const prevTitle = poem.prev_title;
    const nextTitle = poem.next_title;

    // Tempo Estimado de Leitura
    const plainText = stripHtml(poem.content || '').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(' ').filter(w => w.length > 0).length;
    const readingMinutes = Math.ceil(wordCount / 200);
    const readingLabel = readingMinutes <= 1 ? '1 min de leitura' : `${readingMinutes} min de leitura`;

    // Rastrear visualização do poema
    trackPageView('/poema/' + poem.slug, poem.id);
    
    // Update SEO dynamically
    const poemUrl = window.location.href;
    const cleanExcerpt = stripHtml(poem.excerpt || poem.content || '')
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

          ${poem.audio_url ? `
            <section class="poem-narration-player" aria-label="Player de áudio da poesia: Ouvir narração do autor" role="region">
              <audio id="narration-audio" preload="metadata" playsinline webkit-playsinline src="${sanitizeUrl(poem.audio_url)}">
                <source src="${sanitizeUrl(poem.audio_url)}" type="${poem.audio_url.toLowerCase().includes('.m4a') ? 'audio/mp4' : poem.audio_url.toLowerCase().includes('.wav') ? 'audio/wav' : 'audio/mpeg'}">
              </audio>
              <div class="narration-header">
                <div class="narration-badge">
                  <span class="narration-badge-dot"></span>
                  <span>Ouvir narração do autor</span>
                </div>
                <div class="narration-actions">
                  <button id="narration-speed-btn" class="narration-speed-btn" aria-label="Velocidade de reprodução" title="Velocidade de reprodução">1x</button>
                  <div class="narration-volume-container">
                    <button id="narration-mute-btn" class="narration-volume-btn" aria-label="Mutar áudio" title="Mutar / Ativar som">
                      <svg id="narration-vol-icon-on" viewBox="0 0 24 24" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      <svg id="narration-vol-icon-off" style="display:none;" viewBox="0 0 24 24" width="16" height="16"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    </button>
                    <input type="range" id="narration-vol-slider" class="narration-volume-slider" min="0" max="1" step="0.05" value="1" aria-label="Controle de volume da narração">
                  </div>
                </div>
              </div>

              <div class="narration-controls">
                <button id="narration-play-btn" class="narration-play-btn" aria-label="Reproduzir narração">
                  <svg id="narration-play-icon" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" fill="currentColor"/></svg>
                  <svg id="narration-pause-icon" style="display: none;" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/></svg>
                </button>

                <div class="narration-timeline">
                  <span id="narration-current-time" class="narration-time">00:00</span>
                  <div class="narration-slider-container">
                    <input type="range" id="narration-progress" class="narration-slider" min="0" max="100" value="0" step="0.1" aria-label="Progresso da narração">
                  </div>
                  <span id="narration-duration" class="narration-time">--:--</span>
                </div>
              </div>
            </section>
          ` : ''}

          <div id="poem-text" class="poem-content">${formattedContent}</div>



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

          <div class="comments-section">
            <p class="comments-label">Notas de quem passou por aqui</p>
            <div id="comments-list" class="comments-list">
              <p class="comments-empty">Silêncio... nenhum comentário ainda.</p>
            </div>
            
            <button id="toggle-comment-btn" class="btn-secondary" style="margin-top: var(--space-sm); width: 100%;">+ Deixar uma nota</button>
            <form id="comment-form" class="comment-form" style="display: none; margin-top: var(--space-md);">
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

          <div class="poem-actions">
            <button id="toggle-settings-btn" class="btn-secondary mobile-only" aria-label="Configurações de leitura" style="display: none;">⚙️ Layout</button>
            <div id="poem-settings-panel" class="poem-settings-panel">
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
            </div>
            
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
              <button class="preview-theme-btn active" data-theme="dark" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: #050505; color: #e2e2e2; cursor: pointer;">Escuro</button>
              <button class="preview-theme-btn" data-theme="light" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #fdfdfd; color: #1a1a1a; cursor: pointer;">Claro</button>
              <button class="preview-theme-btn" data-theme="sepia" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #eae0c7; color: #433422; cursor: pointer;">Sépia</button>
            </div>

            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: var(--space-md) 0 var(--space-xs) 0;">Formato do Card:</p>
            <div class="ratio-selector" style="display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-lg); flex-wrap: wrap;">
              <button class="preview-ratio-btn active" data-ratio="feed" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Feed (4:5)</button>
              <button class="preview-ratio-btn" data-ratio="15x21" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Foto (15x21)</button>
              <button class="preview-ratio-btn" data-ratio="stories" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Stories (9:16)</button>
            </div>

            <div style="display: flex; gap: var(--space-xs); justify-content: center;">
              <button id="close-preview-btn" class="btn-secondary" style="padding: var(--space-xs) var(--space-md);">Cancelar</button>
              <button id="download-card-btn" class="btn-primary" style="padding: var(--space-xs) var(--space-md);">Baixar Imagem</button>
            </div>
          </div>
        </div>
      </div>
      <div id="immersive-hint" class="immersive-hint">Deslize para navegar →</div>
    `;

    // Setup Intersection Observer para animação das estrofes
    const setupStanzaAnimation = () => {
      // Respeitar preferência de movimento reduzido
      const prefersReducedMotion = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
      if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
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
    
    // Toggle Logic for Settings and Comments
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const settingsPanel = document.getElementById('poem-settings-panel');
    toggleSettingsBtn?.addEventListener('click', () => {
      settingsPanel.classList.toggle('active');
    });

    const toggleCommentBtn = document.getElementById('toggle-comment-btn');
    const commentForm = document.getElementById('comment-form');
    toggleCommentBtn?.addEventListener('click', () => {
      commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
      toggleCommentBtn.style.display = 'none';
    });
    
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
      rain: `${import.meta.env.BASE_URL}sounds/rain.mp3`,
      fire: `${import.meta.env.BASE_URL}sounds/fire.mp3`
    };

    ambientBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sound = btn.dataset.sound;
        const isCurrentlyActive = btn.classList.contains('active');

        // If clicking already active sound (rain/fire), switch back to silence
        if (isCurrentlyActive && sound !== 'silence') {
          ambientBtns.forEach(b => b.classList.remove('active'));
          const silenceBtn = container.querySelector('.ambient-btn[data-sound="silence"]');
          if (silenceBtn) silenceBtn.classList.add('active');
          if (ambientAudio) {
            ambientAudio.pause();
            ambientAudio.currentTime = 0;
          }
          return;
        }

        ambientBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (!ambientAudio) return;

        if (sound === 'silence') {
          ambientAudio.pause();
          ambientAudio.currentTime = 0;
        } else if (sounds[sound]) {
          const soundSrc = sounds[sound];
          if (!ambientAudio.src.endsWith(soundSrc)) {
            ambientAudio.src = soundSrc;
          }
          ambientAudio.volume = 0.5;
          ambientAudio.play().catch(e => console.error('Audio play failed:', e));
        }
      });
    });
    // Set initial active state for audio
    const initialSilenceBtn = container.querySelector('.ambient-btn[data-sound="silence"]');
    if (initialSilenceBtn) initialSilenceBtn.classList.add('active');

    // Narration Audio Player Logic
    const narrationAudio = document.getElementById('narration-audio');
    const narrationPlayBtn = document.getElementById('narration-play-btn');
    const narrationPlayIcon = document.getElementById('narration-play-icon');
    const narrationPauseIcon = document.getElementById('narration-pause-icon');
    const narrationCurrentTime = document.getElementById('narration-current-time');
    const narrationDuration = document.getElementById('narration-duration');
    const narrationProgress = document.getElementById('narration-progress');
    const narrationSpeedBtn = document.getElementById('narration-speed-btn');
    const narrationMuteBtn = document.getElementById('narration-mute-btn');
    const narrationVolIconOn = document.getElementById('narration-vol-icon-on');
    const narrationVolIconOff = document.getElementById('narration-vol-icon-off');
    const narrationVolSlider = document.getElementById('narration-vol-slider');

    if (narrationAudio && narrationPlayBtn) {
      const formatTime = (secs) => {
        if (!secs || isNaN(secs) || !isFinite(secs)) return '00:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      };

      const updateProgressVisual = (pct) => {
        if (narrationProgress) {
          const clamped = Math.max(0, Math.min(100, pct));
          narrationProgress.value = clamped;
          narrationProgress.style.background = `linear-gradient(to right, var(--accent-subtle) ${clamped}%, var(--border-strong) ${clamped}%)`;
        }
      };

      const updatePlayState = (isPlaying) => {
        if (isPlaying) {
          if (narrationPlayIcon) narrationPlayIcon.style.display = 'none';
          if (narrationPauseIcon) narrationPauseIcon.style.display = 'block';
          narrationPlayBtn.setAttribute('aria-label', 'Pausar narração');
        } else {
          if (narrationPlayIcon) narrationPlayIcon.style.display = 'block';
          if (narrationPauseIcon) narrationPauseIcon.style.display = 'none';
          narrationPlayBtn.setAttribute('aria-label', 'Reproduzir narração');
        }
      };

      narrationPlayBtn.addEventListener('click', async () => {
        try {
          if (narrationAudio.paused) {
            await narrationAudio.play();
          } else {
            narrationAudio.pause();
          }
        } catch (e) {
          console.error('Erro ao reproduzir narração:', e);
          updatePlayState(false);
          toast.show('Não foi possível iniciar o áudio.', 'error');
        }
      });

      narrationAudio.addEventListener('play', () => updatePlayState(true));
      narrationAudio.addEventListener('pause', () => updatePlayState(false));

      narrationAudio.addEventListener('timeupdate', () => {
        if (narrationCurrentTime) {
          narrationCurrentTime.textContent = formatTime(narrationAudio.currentTime);
        }
        if (narrationAudio.duration && isFinite(narrationAudio.duration)) {
          const pct = (narrationAudio.currentTime / narrationAudio.duration) * 100;
          updateProgressVisual(pct);
        }
      });

      const updateDuration = () => {
        if (narrationDuration && narrationAudio.duration && isFinite(narrationAudio.duration)) {
          narrationDuration.textContent = formatTime(narrationAudio.duration);
        }
      };

      narrationAudio.addEventListener('loadedmetadata', updateDuration);
      narrationAudio.addEventListener('durationchange', updateDuration);

      narrationAudio.addEventListener('ended', () => {
        updatePlayState(false);
        updateProgressVisual(0);
        if (narrationCurrentTime) narrationCurrentTime.textContent = '00:00';
      });

      narrationAudio.addEventListener('error', (e) => {
        console.error('Erro no áudio de narração:', e, narrationAudio.error);
        if (narrationDuration) narrationDuration.textContent = 'Erro';
        updatePlayState(false);
      });

      if (narrationProgress) {
        narrationProgress.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (narrationAudio.duration && isFinite(narrationAudio.duration)) {
            const targetTime = (val / 100) * narrationAudio.duration;
            if (narrationCurrentTime) narrationCurrentTime.textContent = formatTime(targetTime);
          }
          narrationProgress.style.background = `linear-gradient(to right, var(--accent-subtle) ${val}%, var(--border-strong) ${val}%)`;
        });

        narrationProgress.addEventListener('change', (e) => {
          const val = parseFloat(e.target.value);
          if (narrationAudio.duration && isFinite(narrationAudio.duration)) {
            narrationAudio.currentTime = (val / 100) * narrationAudio.duration;
          }
        });
      }

      // Speed control
      const speeds = [1, 1.25, 1.5];
      let speedIdx = 0;
      if (narrationSpeedBtn) {
        narrationSpeedBtn.addEventListener('click', () => {
          speedIdx = (speedIdx + 1) % speeds.length;
          const newSpeed = speeds[speedIdx];
          narrationAudio.playbackRate = newSpeed;
          narrationSpeedBtn.textContent = `${newSpeed}x`;
        });
      }

      // Volume & Mute control
      const updateVolumeIcon = () => {
        const isMuted = narrationAudio.muted || narrationAudio.volume === 0;
        if (narrationVolIconOn && narrationVolIconOff) {
          narrationVolIconOn.style.display = isMuted ? 'none' : 'block';
          narrationVolIconOff.style.display = isMuted ? 'block' : 'none';
        }
      };

      if (narrationMuteBtn) {
        narrationMuteBtn.addEventListener('click', () => {
          narrationAudio.muted = !narrationAudio.muted;
          updateVolumeIcon();
        });
      }

      if (narrationVolSlider) {
        narrationVolSlider.addEventListener('input', (e) => {
          const vol = parseFloat(e.target.value);
          narrationAudio.volume = vol;
          narrationAudio.muted = vol === 0;
          updateVolumeIcon();
        });
      }
    }

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
    let touchStartTime = 0;
    handleTouchStart = e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };
    handleTouchEnd = e => {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const elapsedTime = Date.now() - touchStartTime;
      
      // Maximum 500ms duration, min 100px distance, much wider than tall (ratio > 3) to prevent accidental swipes while scrolling
      if (elapsedTime <= 500 && Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY) * 3) {
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
