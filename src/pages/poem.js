import { db } from '../utils/firebase.js';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';
import { loadReactions, toggleReaction, EMOJIS } from '../utils/reactions.js';
import { escapeHtml, stripHtml, sanitizeUrl } from '../utils/html.js';
import { toast } from '../components/toast.js';
import { formatPoemForAnimation } from '../utils/text-format.js';
import { AudioPlayer } from '../components/audio-player.js';
import { ImmersiveReader } from '../components/immersive-reader.js';
import { PoemComments } from '../components/poem-comments.js';
import { formatTag } from '../utils/tags.js';

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
    
    ImmersiveReader.cleanup();
    AudioPlayer.cleanup();
    document.body.classList.remove('poem-page-active');

    handleScroll = null;
    handleTouchStart = null;
    handleTouchEnd = null;
    handleKeydown = null;
    isExportingQuote = false;
    quoteText = '';
  },
  async render(container, params) {
    document.body.classList.add('poem-page-active');
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
    
    // Fetch poem with navigation data
    console.log('[Poem] Fetching slug:', slug);
    let poem = null;
    let error = null;
    
    try {
      const q = query(collection(db, 'poems'), where('slug', '==', slug), where('status', '==', 'published'), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
         const doc = snapshot.docs[0];
         poem = { id: doc.id, ...doc.data() };
         
         // Fetch previous (older) poem
         try {
           const prevQ = query(collection(db, 'poems'), where('status', '==', 'published'), where('published_at', '<', poem.published_at), orderBy('published_at', 'desc'), limit(1));
           const prevSnap = await getDocs(prevQ);
           if (!prevSnap.empty) {
               const prevDoc = prevSnap.docs[0].data();
               poem.prev_slug = prevDoc.slug;
               poem.prev_title = prevDoc.title;
           }
         } catch (e) { console.warn('Error fetching prev poem:', e); }

         // Fetch next (newer) poem
         try {
           const nextQ = query(collection(db, 'poems'), where('status', '==', 'published'), where('published_at', '>', poem.published_at), orderBy('published_at', 'asc'), limit(1));
           const nextSnap = await getDocs(nextQ);
           if (!nextSnap.empty) {
               const nextDoc = nextSnap.docs[0].data();
               poem.next_slug = nextDoc.slug;
               poem.next_title = nextDoc.title;
           }
         } catch (e) { console.warn('Error fetching next poem:', e); }
      }
    } catch(err) {
      error = err;
      console.error('[Poem] Error:', error);
    }
      
    if (error || !poem) {
      console.warn('[Poem] Poem not found or error occurred');
      document.title = 'Obra não encontrada — Natanael Brentano';
      container.innerHTML = `
        <div class="not-found-page fade-in">
          <p class="not-found-label">404</p>
          <h2 class="not-found-title">Obra não encontrada</h2>
          <p class="not-found-desc">O poema que você procura pode ter mudado de endereço ou ainda não foi publicado.</p>
          <a href="${import.meta.env.BASE_URL}" data-link class="not-found-link">← Voltar ao sumário</a>
        </div>
      `;
      return;
    }

    // Fallback not needed for Firestore since we fetched everything

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
    
    // Check if user is logged in (to show admin buttons - handled async below)
    let isAdmin = false;
    
    const formattedContent = formatPoemForAnimation(poem.content);
    const safeAudioUrl = poem.audio_url ? sanitizeUrl(poem.audio_url) : '';

    let collectionsHtml = '';
    if (poem.collection_slugs && poem.collection_slugs.length > 0) {
      try {
        const qCols = query(collection(db, 'collections'), where('slug', 'in', poem.collection_slugs));
        const colsSnap = await getDocs(qCols);
        const collectionsData = [];
        colsSnap.forEach(d => collectionsData.push(d.data()));
        if (collectionsData.length > 0) {
          collectionsHtml = collectionsData.map(c => `
            <a href="${import.meta.env.BASE_URL}colecao/${c.slug}" class="btn-secondary" style="font-size: 0.85rem; padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;" data-link>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
               ${escapeHtml(c.name)}
            </a>
          `).join(' ');
        }
      } catch(e) { console.warn(e); }
    }

    let tagsHtml = '';
    if (poem.tags && poem.tags.length > 0) {
      tagsHtml = poem.tags.map(t => {
        const formatted = formatTag(t);
        return `<a href="${import.meta.env.BASE_URL}?tags=${encodeURIComponent(t)}" class="tag-chip" data-link>#${escapeHtml(formatted)}</a>`;
      }).join(' ');
    }

    const taxonomyHtml = (collectionsHtml || tagsHtml) ? `
      <div class="poem-taxonomy" style="margin-top: var(--space-2xl); text-align: center; display: flex; flex-direction: column; gap: var(--space-md); align-items: center;">
        ${collectionsHtml ? `<div class="poem-collections" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-sm);">${collectionsHtml}</div>` : ''}
        ${tagsHtml ? `<div class="poem-tags" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xs);">${tagsHtml}</div>` : ''}
      </div>
    ` : '';

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
            
            <div class="reading-settings-trigger-container">
              <button id="mobile-reading-settings-btn" class="btn-reading-settings" aria-label="Ajustes de leitura">Aa</button>
            </div>
            
            <!-- Bottom sheet para configurações de leitura -->
            <div id="poem-settings-overlay" class="bottom-sheet-overlay"></div>
            <div id="poem-settings-panel" class="poem-settings-panel bottom-sheet">
              <div class="bottom-sheet-handle"></div>
              <div class="bottom-sheet-content">
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
                <div class="immersive-controls" style="margin-top: var(--space-sm);">
                  <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva" style="width: 100%;">
                    ⬜ Leitura Imersiva
                  </button>
                </div>
              </div>
            </div>
          </header>

          ${safeAudioUrl ? `
            <section class="poem-narration-player" aria-label="Player de áudio da poesia: Ouvir narração do autor" role="region">
              <audio id="narration-audio" preload="metadata" playsinline webkit-playsinline src="${safeAudioUrl}">
                <source src="${safeAudioUrl}" type="${poem.audio_url.toLowerCase().includes('.m4a') ? 'audio/mp4' : poem.audio_url.toLowerCase().includes('.wav') ? 'audio/wav' : 'audio/mpeg'}">
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

          ${taxonomyHtml}

          <div id="related-poems-section" style="display: none; margin-top: var(--space-2xl); margin-bottom: var(--space-2xl);">
            <p class="share-label" style="text-align: center; margin-bottom: var(--space-md);">Você também pode gostar</p>
            <div id="related-poems-list" style="display: flex; flex-direction: column; gap: var(--space-sm);"></div>
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

          <div class="share-section">
            <p class="share-label">Compartilhar obra</p>
            
            <div id="share-fallback" class="share-fallback" style="display: none;">
              <div class="share-grid">
                <button class="btn-secondary share-btn-mono" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
                <button class="btn-secondary share-btn-mono" aria-label="Compartilhar no X (Twitter)" data-platform="twitter">
                  <svg width="20" height="20" viewBox="0 0 19 19" fill="currentColor"><path fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/></svg>
                  X
                </button>
                <button class="btn-secondary share-btn-mono" aria-label="Compartilhar no Facebook" data-platform="facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
                <button id="copy-link-btn" class="btn-secondary share-btn-mono" aria-label="Copiar link da obra">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copiar
                </button>
              </div>
              <button id="share-card-btn-desktop" class="btn-secondary share-btn-mono share-btn-full" aria-label="Gerar card para compartilhar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Gerar Card
              </button>
            </div>

            <div id="share-native" class="share-native" style="display: none;">
              <button id="web-share-btn" class="btn-primary share-btn-primary" aria-label="Compartilhar obra">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Compartilhar
              </button>
              <button id="share-card-btn-mobile" class="btn-secondary share-btn-mono" aria-label="Gerar card para Stories">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Gerar Card
              </button>
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
              <div class="comment-form-group" style="display: none;" aria-hidden="true">
                <input type="text" id="comment-website" name="website" tabindex="-1" autocomplete="off">
              </div>
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
            <div id="poem-admin-actions" style="display: contents;"></div>
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
        <button id="mobile-share-selection-btn" class="mobile-share-selection-btn" aria-label="Compartilhar trecho selecionado">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          Compartilhar trecho
        </button>



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
              <button class="preview-ratio-btn" data-ratio="10x15" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Foto (10x15)</button>
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
        rootMargin: '0px',
        threshold: 0
      };

      const stanzaObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const windowHeight = window.innerHeight;
      container.querySelectorAll('.stagger-reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight) {
          el.classList.add('revealed');
        } else {
          el.classList.add('js-reveal-ready');
          stanzaObserver.observe(el);
        }
      });
    };

    setupStanzaAnimation();
    
    // Toggle Logic for Settings and Comments
    const toggleSettingsBtn = document.getElementById('mobile-reading-settings-btn');
    const settingsPanel = document.getElementById('poem-settings-panel');
    const settingsOverlay = document.getElementById('poem-settings-overlay');
    
    const closeSettings = () => {
      settingsPanel?.classList.remove('active');
      settingsOverlay?.classList.remove('active');
      toggleSettingsBtn?.focus();
    };

    toggleSettingsBtn?.addEventListener('click', () => {
      settingsPanel.classList.toggle('active');
      settingsOverlay.classList.toggle('active');
    });

    settingsOverlay?.addEventListener('click', closeSettings);

    let sheetTouchStartY = 0;
    settingsPanel?.addEventListener('touchstart', (e) => {
      sheetTouchStartY = e.touches[0].clientY;
    }, {passive: true});
    settingsPanel?.addEventListener('touchend', (e) => {
      const deltaY = e.changedTouches[0].clientY - sheetTouchStartY;
      if (deltaY > 50) { // swipe down
        closeSettings();
      }
    }, {passive: true});

    const toggleCommentBtn = document.getElementById('toggle-comment-btn');
    const commentForm = document.getElementById('comment-form');
    toggleCommentBtn?.addEventListener('click', () => {
      commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
      toggleCommentBtn.style.display = 'none';
    });
    
    // Sharing Logic
    const shareUrl = window.location.href;
    const shareText = `Leia "${poem.title}", um poema de Natanael Brentano:`;

    document.querySelectorAll('[data-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        let url = '';
        if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    const shareNativeContainer = document.getElementById('share-native');
    const shareFallbackContainer = document.getElementById('share-fallback');
    
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      shareNativeContainer.style.display = 'flex';
      document.getElementById('web-share-btn')?.addEventListener('click', async () => {
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
      shareFallbackContainer.style.display = 'flex';
      document.getElementById('copy-link-btn')?.addEventListener('click', () => {
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
    PoemComments.init(container, poem.id);

    // Immersive Mode Logic
    ImmersiveReader.init(container);

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

    // Audio Player Logic
    AudioPlayer.init(container, import.meta.env.BASE_URL);

    // Highlight Tooltip & Gestures Logic
    const poemText = document.getElementById('poem-text');
    let lastTap = 0;

    poemText?.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300 && now - lastTap > 0) {
        // Find reaction button (heart)
        const reactionBtn = document.querySelector('.reaction-btn[data-emoji="❤️"]');
        if (reactionBtn && !reactionBtn.classList.contains('active')) {
           reactionBtn.click();
        }
        showHeartAnimation(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        );
      }
      lastTap = now;
    }, { passive: true });

    function showHeartAnimation(x, y) {
      const heart = document.createElement('span');
      heart.textContent = '♥';
      heart.style.cssText = `
        position:fixed; left:${x}px; top:${y}px;
        font-size:3rem; color:var(--accent-subtle);
        pointer-events:none; z-index:9999;
        animation: heartFloat 0.8s ease forwards;
        transform: translate(-50%,-50%);
        text-shadow: 0 0 10px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 800);
    }

    const tooltip = document.getElementById('highlight-tooltip');
    let selectedText = '';

    const mobileShareSelectionBtn = document.getElementById('mobile-share-selection-btn');
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        tooltip.classList.remove('visible');
        if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
        return;
      }
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.add('visible');
        } else {
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top + window.scrollY}px`;
          tooltip.classList.add('visible');
        }
      } else {
        tooltip.classList.remove('visible');
        if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
      }
    };

    poemText?.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection.isCollapsed) {
        tooltip.classList.remove('visible');
        if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
      }
    });

    mobileShareSelectionBtn?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: poem.title,
            text: `"${selectedText}" — Natanael Brentano`,
            url: window.location.href
          });
        } catch (err) {}
      } else {
        const textToShare = `"${selectedText}" — Natanael Brentano\n${window.location.href}`;
        navigator.clipboard.writeText(textToShare).then(() => {
          toast.show('Trecho copiado!', 'success');
        });
      }
      window.getSelection().removeAllRanges();
      mobileShareSelectionBtn.classList.remove('visible');
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

    const showCardPreview = () => {
      window.getSelection().removeAllRanges();
      tooltip.classList.remove('visible');
      if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
      isExportingQuote = true;
      quoteText = selectedText || stripHtml(poem.content).substring(0, 150) + '...';
      const previewModal = document.getElementById('card-preview-modal');
      if (previewModal) {
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    };
    document.getElementById('highlight-card-btn')?.addEventListener('click', showCardPreview);

    // Atalhos de teclado
    handleKeydown = (e) => {
      // Ignorar se estiver digitando num input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch(e.key) {
        case 'Escape':
          if (document.getElementById('poem-settings-panel')?.classList.contains('active')) {
            closeSettings();
          } else if (typeof isImmersive !== 'undefined' && isImmersive) {
            exitImmersive();
          }
          break;
        case 'ArrowRight':
          if (nextSlug) navigateTo(`/poema/${nextSlug}`);
          break;
        case 'ArrowLeft':
          if (prevSlug) navigateTo(`/poema/${prevSlug}`);
          break;
        case 'i':
        case 'I':
          if (document.documentElement.classList.contains('immersive-mode')) {
            document.getElementById('immersive-exit-btn')?.click();
          } else {
            document.getElementById('immersive-btn')?.click();
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
    const shareCardBtnMobile = document.getElementById('share-card-btn-mobile');
    const shareCardBtnDesktop = document.getElementById('share-card-btn-desktop');
    const previewModal = document.getElementById('card-preview-modal');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const themeBtns = container.querySelectorAll('.preview-theme-btn');
    const ratioBtns = container.querySelectorAll('.preview-ratio-btn');
    let selectedExportTheme = 'dark';
    let selectedExportRatio = 'feed';

    const openExportModal = () => {
      if (previewModal) {
        isExportingQuote = false;
        quoteText = '';
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    };
    shareCardBtnMobile?.addEventListener('click', openExportModal);
    shareCardBtnDesktop?.addEventListener('click', openExportModal);

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

    // Setup Admin async if logged in
    const setupAdmin = async () => {
      if (localStorage.getItem('has_admin_session') !== '1') return;

      try {
        const { getFirebaseAuth } = await import('../utils/firebase.js');
        const auth = await getFirebaseAuth();
        const initUI = () => {
          if (!auth.currentUser) {
            localStorage.removeItem('has_admin_session');
            return;
          }
          isAdmin = true;
          const adminSlot = document.getElementById('poem-admin-actions');
          if (adminSlot) {
            adminSlot.innerHTML = `
              <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `;
            const resendBtn = document.getElementById('resend-email-btn');
            if (resendBtn) {
              resendBtn.addEventListener('click', async () => {
                if (!confirm('Deseja realmente reenviar o email desta obra para todos os assinantes?')) return;
                resendBtn.innerText = 'Enviando...';
                resendBtn.disabled = true;
                try {
                  const { getFirebaseFunctions } = await import('../utils/firebase.js');
                  const { httpsCallable } = await import('firebase/functions');
                  const functions = await getFirebaseFunctions();
                  const callable = httpsCallable(functions, 'sendNewsletter');
                  const result = await callable({ poemId: poem.id });
                  alert(`Email reenviado com sucesso para ${result.data?.count || 0} assinantes!`);
                } catch(err) {
                  console.error('Newsletter erro:', err);
                  alert(`Houve um erro ao reenviar a newsletter: ${err.message || 'Erro'}`);
                } finally {
                  resendBtn.innerText = 'Reenviar Email';
                  resendBtn.disabled = false;
                }
              });
            }
          }
        };

        if (auth.currentUser) {
          initUI();
        } else {
          auth.authStateReady().then(() => initUI()).catch(() => {});
        }
      } catch (_) {}
    };
    setupAdmin();

    // Fetch related poems asynchronously
    if (poem.tags && poem.tags.length > 0) {
      setTimeout(async () => {
        try {
          const searchTags = poem.tags.slice(0, 10);
          const relatedQ = query(
            collection(db, 'poems'), 
            where('status', '==', 'published'),
            where('tags', 'array-contains-any', searchTags),
            limit(20)
          );
          const relatedSnap = await getDocs(relatedQ);
          let relatedDocs = [];
          relatedSnap.forEach(d => {
            if (d.id !== poem.id) {
              relatedDocs.push({ id: d.id, ...d.data() });
            }
          });

          if (relatedDocs.length > 0) {
            relatedDocs.forEach(d => {
              d._commonTags = (d.tags || []).filter(t => poem.tags.includes(t)).length;
              d._sameCollection = 0;
              if (poem.collection_slugs && d.collection_slugs) {
                d._sameCollection = d.collection_slugs.some(c => poem.collection_slugs.includes(c)) ? 1 : 0;
              }
            });

            relatedDocs.sort((a, b) => {
              if (b._commonTags !== a._commonTags) return b._commonTags - a._commonTags;
              if (b._sameCollection !== a._sameCollection) return b._sameCollection - a._sameCollection;
              return b.published_at.localeCompare(a.published_at);
            });

            const top3 = relatedDocs.slice(0, 3);
            if (top3.length > 0) {
              const relatedList = document.getElementById('related-poems-list');
              if (relatedList) {
                relatedList.innerHTML = top3.map(r => `
                  <a href="${import.meta.env.BASE_URL}poema/${r.slug}" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
                    <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${escapeHtml(r.title)}</h3>
                    ${r.excerpt ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${escapeHtml(stripHtml(r.excerpt).substring(0, 100))}...</p>` : ''}
                  </a>
                `).join('');
                document.getElementById('related-poems-section').style.display = 'block';
              }
            }
          }
        } catch (e) { console.warn('Error fetching related poems:', e); }
      }, 100);
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
