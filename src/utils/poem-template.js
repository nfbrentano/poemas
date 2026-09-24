import { escapeHtml, stripHtml, sanitizeUrl } from './html.js';
import { formatPoemForAnimation } from './text-format.js';
import { formatTag } from './tags.js';
import { newsletter } from '../components/newsletter.js';
import { renderBreadcrumbsHtml } from './structured-data.js';

export const EMOJIS = ['🕯️', '💧', '🌿', '🌙', '✨', '❤️'];

/**
 * Renders the poem container markup.
 * Can be used both in client-side router and server/build-time prerender.
 */
export function renderPoemMarkup({
  poem,
  prevSlug = '',
  nextSlug = '',
  prevTitle = '',
  nextTitle = '',
  collectionsData = [],
  relatedPoems = [],
  baseUrl = '/'
}) {
  const plainText = stripHtml(poem.content || '').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(' ').filter(w => w.length > 0).length;
  const readingMinutes = Math.ceil(wordCount / 200);
  const readingLabel = readingMinutes <= 1 ? '1 min de leitura' : `${readingMinutes} min de leitura`;

  const formattedContent = formatPoemForAnimation(poem.content);
  const safeAudioUrl = poem.audio_url ? sanitizeUrl(poem.audio_url) : '';

  let collectionsHtml = '';
  if (collectionsData && collectionsData.length > 0) {
    collectionsHtml = collectionsData.map(c => `
      <a href="${baseUrl}colecao/${escapeHtml(c.slug)}" class="btn-secondary" style="font-size: 0.85rem; padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;" data-link>
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
         ${escapeHtml(c.name)}
      </a>
    `).join(' ');
  }

  let tagsHtml = '';
  if (poem.tags && poem.tags.length > 0) {
    tagsHtml = poem.tags.map(t => {
      const formatted = formatTag(t);
      return `<a href="${baseUrl}?tags=${encodeURIComponent(t)}" class="tag-chip" data-link>#${escapeHtml(formatted)}</a>`;
    }).join(' ');
  }

  const taxonomyHtml = (collectionsHtml || tagsHtml) ? `
    <div class="poem-taxonomy" style="margin-top: var(--space-2xl); text-align: center; display: flex; flex-direction: column; gap: var(--space-md); align-items: center;">
      ${collectionsHtml ? `<div class="poem-collections" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-sm);">${collectionsHtml}</div>` : ''}
      ${tagsHtml ? `<div class="poem-tags" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xs);">${tagsHtml}</div>` : ''}
    </div>
  ` : '';

  const relatedHtml = (relatedPoems && relatedPoems.length > 0) ? relatedPoems.map(r => `
    <a href="${baseUrl}poema/${escapeHtml(r.slug)}" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${escapeHtml(r.title)}</h3>
      ${r.excerpt ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${escapeHtml(stripHtml(r.excerpt).substring(0, 100))}...</p>` : ''}
    </a>
  `).join('') : '';

  const primaryCollection = collectionsData && collectionsData.length > 0 ? collectionsData[0] : null;
  const breadcrumbItems = primaryCollection ? [
    { name: 'Início', url: baseUrl },
    { name: primaryCollection.name, url: `${baseUrl}colecao/${primaryCollection.slug}/` },
    { name: poem.title, url: `${baseUrl}poema/${poem.slug}/` }
  ] : [
    { name: 'Início', url: baseUrl },
    { name: poem.title, url: `${baseUrl}poema/${poem.slug}/` }
  ];
  const breadcrumbsHtml = renderBreadcrumbsHtml(breadcrumbItems);

  return `
    <div class="poem-container">
      <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
      
      <article class="single-poem fade-in">
        ${breadcrumbsHtml}
        <header>
          <h1>${escapeHtml(poem.title)}</h1>
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

        <div id="related-poems-section" style="${relatedHtml ? '' : 'display: none; '}margin-top: var(--space-2xl); margin-bottom: var(--space-2xl);">
          <p class="share-label" style="text-align: center; margin-bottom: var(--space-md);">Você também pode gostar</p>
          <div id="related-poems-list" style="display: flex; flex-direction: column; gap: var(--space-sm);">
            ${relatedHtml}
          </div>
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
}
