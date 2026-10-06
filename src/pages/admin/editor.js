import { listDocs, insertDocs, updateDocById, uploadFile, getPublicFileUrl, callFunction } from './data.js';
import { navigateTo } from '../../router.js';
import { escapeHtml, stripHtml, sanitizeUrl } from '../../utils/html.js';
import { debounce } from './debounce.js';

export async function renderEditor(container, id) {
    let poem = { title: '', slug: '', content: '', excerpt: '', tags: [], status: 'draft', audio_url: '' };
    
    if (id) {
      container.innerHTML = '<div class="loading">Carregando poema...</div>';
      const { data } = await listDocs('poems', { where: [['id', '==', id]], single: true });
      if (data) {
        poem = data;
        // Clean imported HTML tags so the editor is always pure natural text
        poem.content = stripHtml(poem.content);
      }
    }
    
    container.innerHTML = `
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
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${escapeHtml(poem.content)}</textarea>
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
              ${poem.status === 'scheduled' ? `<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(poem.scheduled_at).toLocaleString('pt-BR')}.</p>` : ''}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
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
              <div id="preview-content" class="poem-content">${escapeHtml(poem.content || '')}</div>
            </article>
          </div>
        </div>
      </form>
    `;
    
    // Auto-generate slug from title if empty
    const titleInput = document.getElementById('poem-title');
    const slugInput = document.getElementById('poem-slug');
    
    titleInput.addEventListener('input', () => {
      // Sync preview title
      document.getElementById('preview-title').textContent = titleInput.value || 'Título da Obra';

      if (!id || slugInput.value === '') { // Auto-fill for new poems or if slug is empty
        let slug = titleInput.value.toLowerCase().trim()
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
    });

    // Preview Sync Logic
    const contentInput = document.getElementById('poem-content-input');
    const previewContent = document.getElementById('preview-content');
    const tagsInput = document.getElementById('poem-tags');
    const statusSelect = document.getElementById('poem-status');
    const schedulingFields = document.getElementById('scheduling-fields');

    const updatePreview = () => {
      previewContent.textContent = contentInput.value;
    };

    contentInput.addEventListener('input', debounce(updatePreview, 250));

    tagsInput.addEventListener('input', debounce(() => {
      const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
      const container = document.getElementById('preview-tags-container');
      if (container) {
        container.replaceChildren();
        if (tags.length > 0) {
          const bulletSpan = document.createElement('span');
          bulletSpan.textContent = '•';
          const textSpan = document.createElement('span');
          textSpan.textContent = `Sentimentos: ${tags.join(', ')}`;
          container.append(bulletSpan, ' ', textSpan);
        }
      }
    }, 250));

    statusSelect.addEventListener('change', () => {
      schedulingFields.style.display = statusSelect.value === 'scheduled' ? 'block' : 'none';
    });

    // Audio upload & management handlers
    const audioFileInput = document.getElementById('poem-audio-file');
    const audioUrlInput = document.getElementById('poem-audio-url');
    const audioStatus = document.getElementById('audio-upload-status');
    const audioPreviewContainer = document.getElementById('audio-preview-container');
    const audioPreviewPlayer = document.getElementById('audio-preview-player');
    const audioFileName = document.getElementById('audio-file-name');
    const removeAudioBtn = document.getElementById('remove-audio-btn');

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

        const mimeMap = {
          '.m4a': 'audio/mp4',
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.aac': 'audio/aac',
          '.ogg': 'audio/ogg'
        };
        const detectedContentType = mimeMap[ext] || file.type || 'audio/mpeg';

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
          setTimeout(() => {
            if (audioStatus) audioStatus.textContent = '';
          }, 2500);
        }
      });
    }

    const getFormData = () => {
      const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
      const scheduledAtInput = document.getElementById('scheduled-at');
      
      return {
        title: document.getElementById('poem-title').value,
        slug: document.getElementById('poem-slug').value,
        content: document.getElementById('poem-content-input').value,
        excerpt: document.getElementById('poem-excerpt').value,
        tags,
        audio_url: audioUrlInput ? (audioUrlInput.value.trim() || null) : null,
        status: document.getElementById('poem-status').value,
        scheduled_at: scheduledAtInput.value ? new Date(scheduledAtInput.value).toISOString() : null
      };
    };
    
    document.getElementById('editor-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('save-btn');
      btn.innerText = 'Salvando...';
      btn.disabled = true;
      
      const payload = getFormData();
      
      if (payload.status === 'scheduled' && !payload.scheduled_at) {
        alert('Por favor, defina uma data para o agendamento.');
        btn.innerText = 'Gravar Alterações';
        btn.disabled = false;
        return;
      }

      if (payload.status === 'published' && poem.status !== 'published') {
        payload.published_at = new Date().toISOString();
      }
      
      let error = null;
      if (id) {
        payload.updated_at = new Date().toISOString();
        const res = await updateDocById('poems', id, payload);
        error = res.error;
      } else {
        payload.created_at = new Date().toISOString();
        payload.updated_at = payload.published_at || payload.created_at;
        const res = await insertDocs('poems', [payload]);
        error = res.error;
      }
      
      if (error) {
        console.error(error);
        alert('Erro ao salvar: ' + error.message);
        btn.innerText = 'Gravar Alterações';
        btn.disabled = false;
        return;
      }
      
      navigateTo('/admin');
    });
    
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      let confirmState = false;
      
      publishBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Enforce form validation before proceeding
        const form = document.getElementById('editor-form');
        if (!form.reportValidity()) return;
        
        if (!confirmState) {
          publishBtn.innerText = 'Tem certeza? Clique para confirmar.';
          publishBtn.style.background = 'var(--error)';
          confirmState = true;
          
          // Reset confirm state after 4 seconds
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
        
        const payload = getFormData();
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
        
        // Trigger Cloud Function Newsletter
        if (poemId) {
          try {
            publishBtn.innerText = 'Enviando newsletter...';
            
            const { data, error: fnError } = await callFunction('sendNewsletter', { poemId });

            if (fnError) throw fnError;

            alert(`Obra publicada e newsletter enviada com sucesso para ${data.count} assinantes!`);
          } catch(err) {
            console.error('Newsletter erro:', err);
            let detailedMsg = '';
            if (err.context && typeof err.context.json === 'function') {
              try {
                const errBody = await err.context.json();
                detailedMsg = errBody.error || errBody.message || '';
              } catch (e) {}
            }
            alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${detailedMsg || err.message || 'Erro na Edge Function'}`);
          }
        }
        
        navigateTo('/admin');
      });
    }
}
