import { getDocById, insertDocs, updateDocById, uploadFile, getPublicFileUrl, callFunction, listDocs } from './data.js';
import { navigateTo } from '../../router.js';
import { escapeHtml, stripHtml, sanitizeUrl, unwrapSafeHTML } from '../../utils/html.js';
import { debounce } from './debounce.js';
import {
  calculatePoemMetrics,
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraftDifference,
  checkSlugConflict,
  syncPoemCollections
} from './editor-helpers.js';

export async function renderEditor(container, id) {
  let poem = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: [],
    status: 'draft',
    audio_url: '',
    dedication: '',
    author_note: '',
    written_at: '',
    written_location: '',
    collection_slugs: [],
    notify_newsletter_on_publish: false,
    notify_push_on_publish: false
  };

  let allCollections = [];
  let linkedCollectionIds = [];

  if (id) {
    container.innerHTML = '<div class="loading">Carregando poema...</div>';
    const [{ data: poemData }, { data: allColsData }, { data: poemRelationsData }] = await Promise.all([
      getDocById('poems', id),
      listDocs('collections'),
      listDocs('collection_poems', { where: [['poem_id', '==', id]] })
    ]);

    if (poemData) {
      poem = { ...poem, ...poemData };
      poem.content = stripHtml(poem.content);
    }
    allCollections = allColsData || [];
    linkedCollectionIds = (poemRelationsData || []).map(r => r.collection_id).filter(Boolean);
  } else {
    const { data: allColsData } = await listDocs('collections');
    allCollections = allColsData || [];
  }

  const collectionsHtml = allCollections.length > 0 ? allCollections.map(c => {
    const isChecked = linkedCollectionIds.includes(c.id) ||
      (Array.isArray(poem.collection_slugs) && poem.collection_slugs.includes(c.slug));
    return `
      <label class="poem-collection-checkbox-label">
        <input type="checkbox" name="poem_collection" class="poem-collection-checkbox" value="${escapeHtml(c.id)}" data-slug="${escapeHtml(c.slug)}" ${isChecked ? 'checked' : ''}>
        <span>${escapeHtml(c.name)}</span>
      </label>
    `;
  }).join('') : '<span style="font-size: 0.82rem; color: var(--text-muted);">Nenhuma coleção cadastrada no momento.</span>';

  const initialMetrics = calculatePoemMetrics(poem.content);

  container.innerHTML = unwrapSafeHTML(`
    <aside id="draft-recovery-banner" class="draft-recovery-banner" style="display: none;" role="status">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
        <div style="display: flex; align-items: center; gap: var(--space-xs);">
          <span aria-hidden="true" style="color: var(--accent-subtle);">💾</span>
          <span id="draft-banner-text" style="font-size: 0.88rem; color: var(--text-primary); font-family: var(--font-ui);"></span>
        </div>
        <div style="display: flex; gap: var(--space-xs);">
          <button type="button" id="restore-draft-btn" class="btn-primary" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; border: none; cursor: pointer;">
            Restaurar rascunho local
          </button>
          <button type="button" id="discard-draft-btn" class="btn-secondary" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; border: 1px solid var(--border-strong); border-radius: 2px; cursor: pointer; color: var(--text-secondary);">
            Descartar
          </button>
        </div>
      </div>
    </aside>

    <form id="editor-form" style="font-family: var(--font-ui);">
      <div class="editor-layout">
        <div class="editor-pane">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
              <input type="text" id="poem-title" value="${escapeHtml(poem.title)}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
              <input type="text" id="poem-slug" value="${escapeHtml(poem.slug)}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              <p id="slug-error" class="field-error" style="display: none; color: var(--error); font-size: 0.8rem; margin-top: 4px;"></p>
            </div>
          </div>
          
          <div style="margin-top: var(--space-md);">
            <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
            <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${escapeHtml(poem.content)}</textarea>
            
            <div id="poem-metrics-bar" class="poem-metrics-bar" aria-live="polite">
              <span id="poem-metrics-stanzas-verses">${initialMetrics.summary}</span>
              <span>•</span>
              <span id="poem-metrics-words">${initialMetrics.words} ${initialMetrics.words === 1 ? 'palavra' : 'palavras'}</span>
              <span>•</span>
              <span id="poem-metrics-reading-time">${initialMetrics.readingLabel}</span>
            </div>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
            <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${escapeHtml(poem.excerpt || '')}</textarea>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
              <input type="text" id="poem-tags" value="${escapeHtml(poem.tags ? poem.tags.join(', ') : '')}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
              <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                <option value="draft" ${poem.status === 'draft' ? 'selected' : ''}>Rascunho</option>
                <option value="scheduled" ${poem.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                <option value="published" ${poem.status === 'published' ? 'selected' : ''}>Publicado</option>
              </select>
            </div>
          </div>

          <!-- Coleções Integradas (RF04, CA05) -->
          <div class="editor-collections-card">
            <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
              Coleções da Obra (Opcional)
            </label>
            <div id="editor-collections-container" style="display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-top: var(--space-2xs);">
              ${collectionsHtml}
            </div>
            <p class="field-help">
              Selecione em quais coleções este poema deve ser incluído. A ordenação é mantida automaticamente ao final.
            </p>
          </div>

          <!-- Contexto da Obra (RF01, CA01) -->
          <details id="admin-context-card" style="margin-top: var(--space-md); border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-sm) var(--space-md); background: var(--bg-primary);" ${poem.dedication || poem.author_note || poem.written_at || poem.written_location ? 'open' : ''}>
            <summary style="cursor: pointer; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-secondary); font-weight: 500; user-select: none;">
              Contexto da Obra, Dedicatória e Criação (Opcional)
            </summary>
            <div style="margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-md);">
              <div>
                <label for="poem-dedication" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Dedicatória / Epígrafe (Máx. 160 caracteres)</label>
                <input type="text" id="poem-dedication" maxlength="160" value="${escapeHtml(poem.dedication || '')}" placeholder="Ex: Para Maria, com afeto" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary); font-style: italic;">
              </div>

              <div>
                <label for="poem-author-note" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Nota do Autor / Bastidores da Criação (Máx. 2000 caracteres)</label>
                <textarea id="poem-author-note" maxlength="2000" placeholder="História, sentimentos ou contexto de escrita..." style="width: 100%; min-height: 90px; font-family: var(--font-body); font-size: 0.95rem; line-height: 1.5; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${escapeHtml(poem.author_note || '')}</textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
                <div>
                  <label for="poem-written-at" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Escrita</label>
                  <input type="text" id="poem-written-at" maxlength="30" value="${escapeHtml(poem.written_at || '')}" placeholder="Ex: 2018-04-10 ou Outono de 2018" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <p class="field-help" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Data da composição original (distinta da publicação).</p>
                </div>
                <div>
                  <label for="poem-written-location" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Local de Escrita</label>
                  <input type="text" id="poem-written-location" maxlength="100" value="${escapeHtml(poem.written_location || '')}" placeholder="Ex: Porto Alegre, RS" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <p class="field-help" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Cidade ou local onde os versos nasceram.</p>
                </div>
              </div>
            </div>
          </details>

          <!-- Audio Upload Section -->
          <div class="admin-audio-card">
            <div class="admin-audio-header">
              <label style="display: flex; align-items: center; gap: 6px; margin: 0; color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
                <span>📎</span> Áudio da Narração (Opcional)
              </label>
              <span id="audio-upload-status" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
            </div>
            
            <input type="hidden" id="poem-audio-url" value="${escapeHtml(poem.audio_url || '')}">
            
            <div style="display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; margin-top: var(--space-2xs);">
              <label class="btn-secondary" style="cursor: pointer; padding: 0.5rem 1rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-strong); border-radius: 2px;">
                <span>📁 Escolher Arquivo</span>
                <input type="file" id="poem-audio-file" accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,audio/aac" style="display: none;">
              </label>
              <button type="button" id="remove-audio-btn" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem; color: var(--error); border-color: var(--error); display: ${poem.audio_url ? 'inline-block' : 'none'};">
                Remover Áudio
              </button>
            </div>
            
            <p class="field-help" style="font-size: 0.78rem; color: var(--text-muted); margin-top: var(--space-2xs);">
              Formatos aceitos: MP3, WAV, M4A — Máx 10MB.
            </p>

            <div id="audio-preview-container" class="admin-audio-preview" style="display: ${poem.audio_url ? 'flex' : 'none'};">
              <div style="display: flex; align-items: center; gap: var(--space-xs); flex: 1; min-width: 200px;">
                <span style="font-size: 0.85rem; color: var(--accent-subtle);">▶</span>
                <audio id="audio-preview-player" controls src="${sanitizeUrl(poem.audio_url || '')}" style="height: 32px; width: 100%; max-width: 400px;"></audio>
              </div>
              <span id="audio-file-name" style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all;">
                ${poem.audio_url ? 'Áudio vinculado' : ''}
              </span>
            </div>
          </div>

          <div id="scheduling-fields" style="margin-top: var(--space-md); ${poem.status === 'scheduled' ? '' : 'display: none;'}">
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
            <input type="datetime-local" id="scheduled-at" value="${poem.scheduled_at ? new Date(poem.scheduled_at).toISOString().slice(0, 16) : ''}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
            <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
            <label style="display: flex; align-items: center; gap: var(--space-2xs); margin-top: var(--space-sm); font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="notify-newsletter-on-publish" ${poem.notify_newsletter_on_publish ? 'checked' : ''}>
              Enviar newsletter automaticamente ao publicar
            </label>
            <label style="display: flex; align-items: center; gap: var(--space-2xs); margin-top: var(--space-xs); font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="notify-push-on-publish" ${poem.notify_push_on_publish ? 'checked' : ''}>
              Enviar notificação Web Push aos leitores ao publicar
            </label>
            ${poem.status === 'scheduled' ? `<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(poem.scheduled_at).toLocaleString('pt-BR')}.</p>` : ''}
          </div>
          
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg); flex-wrap: wrap;">
            <span id="autosave-status" style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-ui); margin-right: auto;"></span>
            <a href="${import.meta.env.BASE_URL}admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
            <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
            ${poem.status === 'draft' ? `<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>` : ''}
          </div>
        </div>

        <div class="preview-pane">
          <div class="preview-header">
            <span class="preview-label">Preview em tempo real</span>
          </div>
          <article class="preview-poem">
            <h1 id="preview-title">${escapeHtml(poem.title || 'Título da Obra')}</h1>
            <div class="poem-meta preview-meta">
              <span id="preview-date">${poem.published_at ? new Date(poem.published_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</span>
              <span id="preview-tags-container">${poem.tags && poem.tags.length > 0 ? `<span>•</span> <span>Sentimentos: ${escapeHtml(poem.tags.join(', '))}</span>` : ''}</span>
            </div>
            <div id="preview-dedication" class="poem-dedication" style="${poem.dedication ? '' : 'display: none;'}">
              <em>${escapeHtml(poem.dedication || '')}</em>
            </div>
            <div id="preview-content" class="poem-content">${escapeHtml(poem.content || '')}</div>
            <details id="preview-author-note" class="poem-author-note" style="${poem.author_note || poem.written_location || poem.written_at ? '' : 'display: none;'}">
              <summary class="poem-author-note-summary">
                <span class="author-note-icon" aria-hidden="true">✍️</span>
                <span>Sobre este poema / Nota do autor</span>
              </summary>
              <div class="poem-author-note-body">
                <div id="preview-author-note-text" class="poem-author-note-text">${escapeHtml(poem.author_note || '')}</div>
                <p id="preview-written-meta" class="poem-written-meta" style="${poem.written_location || poem.written_at ? '' : 'display: none;'}"></p>
              </div>
            </details>
          </article>
        </div>
      </div>
    </form>
  `);

  const titleInput = document.getElementById('poem-title');
  const slugInput = document.getElementById('poem-slug');
  const slugError = document.getElementById('slug-error');
  const contentInput = document.getElementById('poem-content-input');
  const excerptInput = document.getElementById('poem-excerpt');
  const tagsInput = document.getElementById('poem-tags');
  const statusSelect = document.getElementById('poem-status');
  const scheduledAtInput = document.getElementById('scheduled-at');
  const notifyNewsletterInput = document.getElementById('notify-newsletter-on-publish');
  const notifyPushInput = document.getElementById('notify-push-on-publish');
  const dedicationInput = document.getElementById('poem-dedication');
  const authorNoteInput = document.getElementById('poem-author-note');
  const writtenAtInput = document.getElementById('poem-written-at');
  const writtenLocationInput = document.getElementById('poem-written-location');
  const audioFileInput = document.getElementById('poem-audio-file');
  const audioUrlInput = document.getElementById('poem-audio-url');
  const audioStatus = document.getElementById('audio-upload-status');
  const audioPreviewContainer = document.getElementById('audio-preview-container');
  const audioPreviewPlayer = document.getElementById('audio-preview-player');
  const audioFileName = document.getElementById('audio-file-name');
  const removeAudioBtn = document.getElementById('remove-audio-btn');

  const autosaveStatus = document.getElementById('autosave-status');
  const draftRecoveryBanner = document.getElementById('draft-recovery-banner');
  const draftBannerText = document.getElementById('draft-banner-text');
  const restoreDraftBtn = document.getElementById('restore-draft-btn');
  const discardDraftBtn = document.getElementById('discard-draft-btn');

  const previewTitle = document.getElementById('preview-title');
  const previewContent = document.getElementById('preview-content');
  const previewTagsContainer = document.getElementById('preview-tags-container');
  const previewDedication = document.getElementById('preview-dedication');
  const previewAuthorNote = document.getElementById('preview-author-note');
  const previewAuthorNoteText = document.getElementById('preview-author-note-text');
  const previewWrittenMeta = document.getElementById('preview-written-meta');
  const schedulingFields = document.getElementById('scheduling-fields');

  const metricsStanzasVerses = document.getElementById('poem-metrics-stanzas-verses');
  const metricsWords = document.getElementById('poem-metrics-words');
  const metricsReadingTime = document.getElementById('poem-metrics-reading-time');

  let hasUnsavedChanges = false;

  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Helper para ler coleções selecionadas
  const getSelectedCollections = () => {
    const checkedBoxes = container.querySelectorAll('.poem-collection-checkbox:checked');
    const ids = [];
    const slugs = [];
    checkedBoxes.forEach(cb => {
      ids.push(cb.value);
      if (cb.dataset.slug) slugs.push(cb.dataset.slug);
    });
    return { ids, slugs };
  };

  const getFormData = () => {
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
    const { ids: collection_ids, slugs: collection_slugs } = getSelectedCollections();

    return {
      title: titleInput.value,
      slug: slugInput.value,
      content: contentInput.value,
      excerpt: excerptInput.value,
      tags,
      collection_ids,
      collection_slugs,
      audio_url: audioUrlInput ? (audioUrlInput.value.trim() || null) : null,
      status: statusSelect.value,
      scheduled_at: scheduledAtInput && scheduledAtInput.value ? new Date(scheduledAtInput.value).toISOString() : null,
      notify_newsletter_on_publish: notifyNewsletterInput ? notifyNewsletterInput.checked : false,
      notify_push_on_publish: notifyPushInput ? notifyPushInput.checked : false,
      dedication: dedicationInput ? (dedicationInput.value.trim() || null) : null,
      author_note: authorNoteInput ? (authorNoteInput.value.trim() || null) : null,
      written_at: writtenAtInput ? (writtenAtInput.value.trim() || null) : null,
      written_location: writtenLocationInput ? (writtenLocationInput.value.trim() || null) : null
    };
  };

  // Atualização das métricas em tempo real (RF05, CA06)
  const updateMetrics = () => {
    const metrics = calculatePoemMetrics(contentInput.value);
    if (metricsStanzasVerses) metricsStanzasVerses.textContent = metrics.summary;
    if (metricsWords) metricsWords.textContent = `${metrics.words} ${metrics.words === 1 ? 'palavra' : 'palavras'}`;
    if (metricsReadingTime) metricsReadingTime.textContent = metrics.readingLabel;
  };

  // Preview Sync Logic
  const updatePreview = () => {
    if (previewContent) previewContent.textContent = contentInput.value;
    updateMetrics();
  };

  const updateTagsPreview = () => {
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
    if (previewTagsContainer) {
      previewTagsContainer.replaceChildren();
      if (tags.length > 0) {
        const bulletSpan = document.createElement('span');
        bulletSpan.textContent = '•';
        const textSpan = document.createElement('span');
        textSpan.textContent = `Sentimentos: ${tags.join(', ')}`;
        previewTagsContainer.append(bulletSpan, ' ', textSpan);
      }
    }
  };

  const updateContextPreview = () => {
    const ded = dedicationInput ? dedicationInput.value.trim() : '';
    if (previewDedication) {
      if (ded) {
        previewDedication.style.display = 'block';
        previewDedication.innerHTML = `<em>${escapeHtml(ded)}</em>`;
      } else {
        previewDedication.style.display = 'none';
        previewDedication.replaceChildren();
      }
    }

    const note = authorNoteInput ? authorNoteInput.value.trim() : '';
    const wLoc = writtenLocationInput ? writtenLocationInput.value.trim() : '';
    const wAt = writtenAtInput ? writtenAtInput.value.trim() : '';

    if (previewAuthorNote) {
      if (note || wLoc || wAt) {
        previewAuthorNote.style.display = 'block';
        if (previewAuthorNoteText) previewAuthorNoteText.textContent = note;
        if (previewWrittenMeta) {
          const parts = [];
          if (wLoc) parts.push(wLoc);
          if (wAt) parts.push(wAt);
          if (parts.length > 0) {
            previewWrittenMeta.style.display = 'block';
            previewWrittenMeta.textContent = `Escrito em ${parts.join(', ')}.`;
          } else {
            previewWrittenMeta.style.display = 'none';
            previewWrittenMeta.textContent = '';
          }
        }
      } else {
        previewAuthorNote.style.display = 'none';
      }
    }
  };

  // Validação de Slug em tempo real (RF06, RNF03, CA07)
  const validateSlug = async () => {
    const currentSlug = slugInput.value.trim();
    if (!currentSlug) {
      if (slugError) {
        slugError.textContent = '';
        slugError.style.display = 'none';
      }
      return true;
    }

    const { hasConflict, conflictingPoem } = await checkSlugConflict(currentSlug, id);
    if (hasConflict) {
      if (slugError) {
        slugError.textContent = `Este link (slug) já está em uso pelo poema "${conflictingPoem?.title || 'Sem título'}". Escolha um slug diferente.`;
        slugError.style.display = 'block';
      }
      return false;
    }

    if (slugError) {
      slugError.textContent = '';
      slugError.style.display = 'none';
    }
    return true;
  };

  // Mecanismo de Autosave Local com Debounce (RF01, CA01)
  const triggerAutosave = debounce(() => {
    const data = getFormData();
    saveDraft(id, data);
    hasUnsavedChanges = true;
    if (autosaveStatus) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      autosaveStatus.textContent = `Salvo localmente às ${timeStr}`;
    }
  }, 800);

  // Registro de eventos para inputs
  const onFieldChange = () => {
    hasUnsavedChanges = true;
    triggerAutosave();
  };

  titleInput.addEventListener('input', () => {
    if (previewTitle) previewTitle.textContent = titleInput.value || 'Título da Obra';

    if (!id || slugInput.value === '') {
      const slug = titleInput.value.toLowerCase().trim()
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      slugInput.value = slug;
    }
    onFieldChange();
  });

  slugInput.addEventListener('input', onFieldChange);
  slugInput.addEventListener('blur', validateSlug);

  contentInput.addEventListener('input', () => {
    onFieldChange();
  });
  contentInput.addEventListener('input', debounce(updatePreview, 200));

  excerptInput.addEventListener('input', onFieldChange);

  tagsInput.addEventListener('input', onFieldChange);
  tagsInput.addEventListener('input', debounce(updateTagsPreview, 250));

  statusSelect.addEventListener('change', () => {
    schedulingFields.style.display = statusSelect.value === 'scheduled' ? 'block' : 'none';
    onFieldChange();
  });

  if (scheduledAtInput) scheduledAtInput.addEventListener('change', onFieldChange);
  if (notifyNewsletterInput) notifyNewsletterInput.addEventListener('change', onFieldChange);
  if (notifyPushInput) notifyPushInput.addEventListener('change', onFieldChange);

  if (dedicationInput) {
    dedicationInput.addEventListener('input', onFieldChange);
    dedicationInput.addEventListener('input', debounce(updateContextPreview, 250));
  }
  if (authorNoteInput) {
    authorNoteInput.addEventListener('input', onFieldChange);
    authorNoteInput.addEventListener('input', debounce(updateContextPreview, 250));
  }
  if (writtenAtInput) {
    writtenAtInput.addEventListener('input', onFieldChange);
    writtenAtInput.addEventListener('input', debounce(updateContextPreview, 250));
  }
  if (writtenLocationInput) {
    writtenLocationInput.addEventListener('input', onFieldChange);
    writtenLocationInput.addEventListener('input', debounce(updateContextPreview, 250));
  }

  container.querySelectorAll('.poem-collection-checkbox').forEach(cb => {
    cb.addEventListener('change', onFieldChange);
  });

  // Verificação e Restauração de Rascunho Local ao Abrir o Editor (RF02, CA02, CA03)
  const existingDraft = loadDraft(id);
  if (existingDraft && hasDraftDifference(poem, existingDraft)) {
    if (draftRecoveryBanner && draftBannerText) {
      const savedDate = existingDraft.savedAt ? new Date(existingDraft.savedAt) : new Date();
      const formattedDate = savedDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      draftBannerText.replaceChildren();
      const labelSpan = document.createElement('span');
      labelSpan.textContent = 'Rascunho local não salvo detectado (salvo em ';
      const timeStrong = document.createElement('strong');
      timeStrong.textContent = formattedDate;
      const endSpan = document.createElement('span');
      endSpan.textContent = '). Deseja restaurá-lo?';
      draftBannerText.append(labelSpan, timeStrong, endSpan);
      draftRecoveryBanner.style.display = 'block';

      if (restoreDraftBtn) {
        restoreDraftBtn.addEventListener('click', () => {
          if (existingDraft.title !== undefined) titleInput.value = existingDraft.title;
          if (existingDraft.slug !== undefined) slugInput.value = existingDraft.slug;
          if (existingDraft.content !== undefined) contentInput.value = existingDraft.content;
          if (existingDraft.excerpt !== undefined) excerptInput.value = existingDraft.excerpt;
          if (existingDraft.tags !== undefined) {
            tagsInput.value = Array.isArray(existingDraft.tags) ? existingDraft.tags.join(', ') : existingDraft.tags;
          }
          if (existingDraft.status !== undefined) {
            statusSelect.value = existingDraft.status;
            schedulingFields.style.display = statusSelect.value === 'scheduled' ? 'block' : 'none';
          }
          if (existingDraft.scheduled_at && scheduledAtInput) {
            scheduledAtInput.value = existingDraft.scheduled_at.slice(0, 16);
          }
          if (notifyNewsletterInput && existingDraft.notify_newsletter_on_publish !== undefined) {
            notifyNewsletterInput.checked = Boolean(existingDraft.notify_newsletter_on_publish);
          }
          if (notifyPushInput && existingDraft.notify_push_on_publish !== undefined) {
            notifyPushInput.checked = Boolean(existingDraft.notify_push_on_publish);
          }
          if (dedicationInput && existingDraft.dedication !== undefined) {
            dedicationInput.value = existingDraft.dedication || '';
          }
          if (authorNoteInput && existingDraft.author_note !== undefined) {
            authorNoteInput.value = existingDraft.author_note || '';
          }
          if (writtenAtInput && existingDraft.written_at !== undefined) {
            writtenAtInput.value = existingDraft.written_at || '';
          }
          if (writtenLocationInput && existingDraft.written_location !== undefined) {
            writtenLocationInput.value = existingDraft.written_location || '';
          }

          // Restaura coleções selecionadas
          if (Array.isArray(existingDraft.collection_ids)) {
            container.querySelectorAll('.poem-collection-checkbox').forEach(cb => {
              cb.checked = existingDraft.collection_ids.includes(cb.value);
            });
          }

          if (previewTitle) previewTitle.textContent = titleInput.value || 'Título da Obra';
          updatePreview();
          updateTagsPreview();
          updateContextPreview();
          updateMetrics();

          draftRecoveryBanner.style.display = 'none';
          hasUnsavedChanges = true;
          if (autosaveStatus) autosaveStatus.textContent = 'Rascunho local restaurado.';
        });
      }

      if (discardDraftBtn) {
        discardDraftBtn.addEventListener('click', () => {
          clearDraft(id);
          draftRecoveryBanner.style.display = 'none';
          if (autosaveStatus) autosaveStatus.textContent = 'Rascunho local descartado.';
        });
      }
    }
  }

  // Audio Upload Logic
  if (audioFileInput) {
    audioFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validExts = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExts.includes(ext) && !file.type.startsWith('audio/')) {
        alert('Formato de áudio inválido. Por favor selecione um arquivo .mp3, .wav, .m4a ou .aac.');
        audioFileInput.value = '';
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('O arquivo de áudio excede o tamanho máximo de 10MB.');
        audioFileInput.value = '';
        return;
      }

      audioStatus.textContent = 'Enviando áudio...';
      audioStatus.style.color = 'var(--accent-subtle)';
      audioFileInput.disabled = true;

      try {
        const fileName = `narration_${Date.now()}${ext}`;
        let upRes = await uploadFile('audios', fileName, file);
        let bucketName = 'audios';
        if (upRes.error) {
          console.warn('Bucket audios retornou erro, tentando fallback para avatars:', upRes.error);
          upRes = await uploadFile('avatars', fileName, file);
          bucketName = 'avatars';
        }

        if (upRes.error) throw upRes.error;

        const publicUrl = getPublicFileUrl(bucketName, fileName);
        audioUrlInput.value = publicUrl;
        audioPreviewPlayer.src = sanitizeUrl(publicUrl);
        audioPreviewPlayer.load();
        audioFileName.textContent = file.name;
        audioPreviewContainer.style.display = 'flex';
        removeAudioBtn.style.display = 'inline-block';

        audioStatus.textContent = 'Áudio carregado!';
        audioStatus.style.color = 'var(--success)';
        onFieldChange();
      } catch (err) {
        console.error('Erro no upload de áudio:', err);
        audioStatus.textContent = 'Erro no envio';
        audioStatus.style.color = 'var(--error)';
        alert('Erro ao enviar áudio: ' + (err.message || 'Falha de conexão'));
      } finally {
        audioFileInput.disabled = false;
        audioFileInput.value = '';
        setTimeout(() => {
          if (audioStatus) audioStatus.textContent = '';
        }, 3500);
      }
    });
  }

  if (removeAudioBtn) {
    removeAudioBtn.addEventListener('click', () => {
      if (confirm('Deseja realmente remover o áudio desta poesia?')) {
        audioUrlInput.value = '';
        audioPreviewPlayer.pause();
        audioPreviewPlayer.removeAttribute('src');
        audioPreviewPlayer.load();
        audioPreviewContainer.style.display = 'none';
        removeAudioBtn.style.display = 'none';
        audioFileName.textContent = '';
        audioStatus.textContent = 'Áudio removido.';
        audioStatus.style.color = 'var(--text-muted)';
        onFieldChange();
        setTimeout(() => {
          if (audioStatus) audioStatus.textContent = '';
        }, 2500);
      }
    });
  }

  // Submissão do Formulário (Salvar Alterações)
  document.getElementById('editor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    btn.innerText = 'Salvando...';
    btn.disabled = true;

    // Validação de conflito de slug (RF06, CA07)
    const isSlugOk = await validateSlug();
    if (!isSlugOk) {
      alert('O slug informado já está em uso por outro poema. Por favor, escolha um slug único.');
      btn.innerText = 'Gravar Alterações';
      btn.disabled = false;
      slugInput.focus();
      return;
    }

    const { ids: selectedCollectionIds, slugs: selectedCollectionSlugs } = getSelectedCollections();
    const payload = getFormData();
    payload.collection_slugs = selectedCollectionSlugs;
    delete payload.collection_ids;

    if (payload.status === 'scheduled' && !payload.scheduled_at) {
      alert('Por favor, defina uma data para o agendamento.');
      btn.innerText = 'Gravar Alterações';
      btn.disabled = false;
      return;
    }

    if (payload.status === 'published' && poem.status !== 'published') {
      payload.published_at = new Date().toISOString();
    }

    let poemId = id;
    let error = null;

    if (id) {
      payload.updated_at = new Date().toISOString();
      const res = await updateDocById('poems', id, payload);
      error = res.error;
    } else {
      payload.created_at = new Date().toISOString();
      payload.updated_at = payload.published_at || payload.created_at;
      const res = await insertDocs('poems', payload);
      error = res.error;
      if (res.data) poemId = res.data.id;
    }

    if (error) {
      console.error(error);
      alert('Erro ao salvar: ' + error.message);
      btn.innerText = 'Gravar Alterações';
      btn.disabled = false;
      return;
    }

    // Sincroniza vínculos de coleções (RF04, CA05)
    if (poemId) {
      await syncPoemCollections(poemId, selectedCollectionIds);
    }

    // Limpa rascunho local após sucesso no Firestore (RF03, CA04)
    clearDraft(id);
    hasUnsavedChanges = false;
    window.removeEventListener('beforeunload', handleBeforeUnload);

    navigateTo('/admin');
  });

  // Publicar Agora
  const publishBtn = document.getElementById('publish-btn');
  if (publishBtn) {
    let confirmState = false;

    publishBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const form = document.getElementById('editor-form');
      if (!form.reportValidity()) return;

      const isSlugOk = await validateSlug();
      if (!isSlugOk) {
        alert('O slug informado já está em uso por outro poema. Por favor, escolha um slug único.');
        slugInput.focus();
        return;
      }

      if (!confirmState) {
        publishBtn.innerText = 'Tem certeza? Clique para confirmar.';
        publishBtn.style.background = 'var(--error)';
        confirmState = true;

        setTimeout(() => {
          if (publishBtn && !publishBtn.disabled) {
            publishBtn.innerText = 'Publicar e Notificar Assinantes';
            publishBtn.style.background = 'var(--success)';
            confirmState = false;
          }
        }, 4000);
        return;
      }

      publishBtn.innerText = 'Publicando...';
      publishBtn.disabled = true;

      const { ids: selectedCollectionIds, slugs: selectedCollectionSlugs } = getSelectedCollections();
      const payload = getFormData();
      payload.collection_slugs = selectedCollectionSlugs;
      delete payload.collection_ids;

      payload.status = 'published';
      payload.published_at = new Date().toISOString();
      payload.updated_at = payload.published_at;

      let poemId = id;
      let error = null;

      if (id) {
        const res = await updateDocById('poems', id, payload);
        error = res.error;
      } else {
        payload.created_at = new Date().toISOString();
        const res = await insertDocs('poems', payload);
        error = res.error;
        if (res.data) poemId = res.data.id;
      }

      if (error) {
        console.error(error);
        alert('Erro ao publicar: ' + error.message);
        publishBtn.innerText = 'Publicar e Notificar Assinantes';
        publishBtn.disabled = false;
        return;
      }

      // Sincroniza vínculos de coleções (RF04, CA05)
      if (poemId) {
        await syncPoemCollections(poemId, selectedCollectionIds);
      }

      // Limpa rascunho local após sucesso no Firestore (RF03, CA04)
      clearDraft(id);
      hasUnsavedChanges = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Trigger Cloud Function Newsletter
      if (poemId) {
        try {
          publishBtn.innerText = 'Enviando newsletter...';
          const { data, error: fnError } = await callFunction('sendNewsletter', { poemId });
          if (fnError) throw fnError;
          alert(`Obra publicada e newsletter enviada com sucesso para ${data.count} assinantes!`);
        } catch (err) {
          console.error('Newsletter erro:', err);
          let detailedMsg = '';
          if (err.context && typeof err.context.json === 'function') {
            try {
              const errBody = await err.context.json();
              detailedMsg = errBody.error || errBody.message || '';
            } catch (_) {}
          }
          alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${detailedMsg || err.message || 'Erro na Edge Function'}`);
        }
      }

      navigateTo('/admin');
    });
  }
}
