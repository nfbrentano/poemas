import { supabase } from './compat-client.js';
import { escapeHtml, sanitizeUrl } from '../../utils/html.js';

export async function renderCollections(container) {
    const renderList = async () => {
      container.innerHTML = '<div class="loading">Carregando coleções...</div>';
      
      const { data: cols, error } = await supabase
        .from('collections')
        .select('*, collection_poems(count)');
        
      if (error) {
        container.innerHTML = `<div class="error">Erro ao carregar coleções: ${error.message}</div>`;
        return;
      }
      
      const colCards = cols.map(c => {
        const safeImg = sanitizeUrl(c.image_url);
        return `
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          ${safeImg ? `
            <div style="height: 120px; background-image: url('${escapeHtml(safeImg)}'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
          ` : `
            <div style="height: 120px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Sem Imagem</div>
          `}
          <div style="padding: var(--space-md); flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-xs);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; margin: 0; color: var(--text-primary);">${escapeHtml(c.name)}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.1rem 0.4rem; border-radius: 2px; font-family: var(--font-ui); font-weight: 500; white-space: nowrap;">
                  ${c.collection_poems?.[0]?.count || 0} obras
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 4px;">Slug: ${escapeHtml(c.slug)}</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-2xs); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${escapeHtml(c.description || 'Sem descrição.')}</p>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); font-family: var(--font-ui);">
              <button class="edit-col-btn" data-id="${c.id}" style="font-size: 0.85rem; color: var(--text-primary); transition: color var(--transition-fast); background: transparent; border: none; cursor: pointer;">Editar</button>
              <button class="delete-col-btn" data-id="${c.id}" style="font-size: 0.85rem; color: var(--error); opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer;">Excluir</button>
            </div>
          </div>
        `;
      }).join('');
      
      container.innerHTML = `
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Coleções</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Crie e gerencie agrupamentos temáticos de suas obras.</p>
            </div>
            <button id="new-col-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer;">+ Nova Coleção</button>
          </div>
          
          ${cols.length === 0 ? `
            <p style="color: var(--text-muted); text-align: center; padding: var(--space-xl) 0; border: 1px dashed var(--border-strong); border-radius: 4px;">Nenhuma coleção criada ainda. Comece criando uma clicando no botão acima!</p>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
              ${colCards}
            </div>
          `}
        </div>
      `;
      
      container.querySelector('#new-col-btn').addEventListener('click', () => renderForm());
      
      container.querySelectorAll('.edit-col-btn').forEach(btn => {
        btn.addEventListener('click', () => renderForm(btn.dataset.id));
      });
      
      container.querySelectorAll('.delete-col-btn').forEach(btn => {
        let confirmState = false;
        btn.addEventListener('click', async (e) => {
          if (!confirmState) {
            btn.innerText = 'Confirmar?';
            btn.style.color = '#fff';
            btn.style.backgroundColor = 'var(--error)';
            btn.style.padding = '0.2rem 0.5rem';
            btn.style.borderRadius = '2px';
            confirmState = true;
            setTimeout(() => {
              if (btn) {
                btn.innerText = 'Excluir';
                btn.style.color = 'var(--error)';
                btn.style.backgroundColor = 'transparent';
                btn.style.padding = '0';
                confirmState = false;
              }
            }, 3000);
            return;
          }
          
          btn.innerText = 'Excluindo...';
          btn.disabled = true;
          const { error: delErr } = await supabase.from('collections').delete().eq('id', btn.dataset.id);
          if (delErr) {
            alert('Erro ao excluir coleção: ' + delErr.message);
          }
          renderList();
        });
      });
    };
    
    const renderForm = async (colId = null) => {
      container.innerHTML = '<div class="loading">Carregando formulário...</div>';
      
      let col = { name: '', slug: '', description: '', image_url: '' };
      let associatedSet = new Set();
      
      try {
        const [poemsRes, colRes, assocRes] = await Promise.all([
          supabase.from('poems').select('id, title, status').order('title', { ascending: true }),
          colId ? supabase.from('collections').select('*').eq('id', colId).single() : Promise.resolve({ data: null }),
          colId ? supabase.from('collection_poems').select('poem_id').eq('collection_id', colId) : Promise.resolve({ data: [] })
        ]);
        
        if (poemsRes.error) throw poemsRes.error;
        if (colId && colRes.error) throw colRes.error;
        if (colId && assocRes.error) throw assocRes.error;
        
        const poems = poemsRes.data || [];
        if (colRes.data) col = colRes.data;
        if (assocRes.data) {
          assocRes.data.forEach(a => associatedSet.add(a.poem_id));
        }
        
        container.innerHTML = `
          <div style="font-family: var(--font-ui); max-width: 700px; margin: 0 auto; display: grid; gap: var(--space-md);">
            <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs); margin-bottom: var(--space-3xs);">
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">
                ${colId ? 'Editar Coleção' : 'Nova Coleção'}
              </h3>
            </div>
            
            <form id="col-form" style="display: grid; gap: var(--space-md);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Nome da Coleção</label>
                  <input type="text" id="col-name" value="${escapeHtml(col.name)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Link (Slug)</label>
                  <input type="text" id="col-slug" value="${escapeHtml(col.slug)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</label>
                <textarea id="col-description" style="width: 100%; min-height: 80px; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; resize: vertical;">${escapeHtml(col.description || '')}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-md); align-items: start; flex-wrap: wrap;">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">URL da Imagem de Capa</label>
                  <input type="text" id="col-img-url" value="${escapeHtml(col.image_url || '')}" placeholder="https://exemplo.com/imagem.jpg" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px;">
                  
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="btn-secondary" for="col-img-upload" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.8rem; display: inline-block;">
                      Fazer Upload
                    </label>
                    <input type="file" id="col-img-upload" accept="image/*" style="display: none;">
                    <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-ui);"></span>
                  </div>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Preview da Capa</label>
                  <div id="col-img-preview-container" style="width: 100%; height: 105px; border: 1px solid var(--border-strong); border-radius: 2px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; color: var(--text-muted); font-size: 0.8rem;">
                    ${sanitizeUrl(col.image_url) ? `
                      <img src="${escapeHtml(sanitizeUrl(col.image_url))}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">
                    ` : `
                      <span id="col-preview-placeholder">Nenhuma imagem</span>
                    `}
                  </div>
                </div>
              </div>
              
              <!-- Poem checklist -->
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Associar Poemas</label>
                
                <input type="text" id="checklist-search" placeholder="Filtrar poemas na lista..." style="width: 100%; padding: 0.4rem var(--space-sm); border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px; font-size: 0.85rem;">
                
                <div id="checklist-container" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-2xs); background: var(--bg-secondary); display: grid; gap: 4px;">
                  ${poems.map(p => {
                    const isChecked = associatedSet.has(p.id);
                    return `
                      <label class="checklist-item" data-title="${p.title.toLowerCase()}" style="display: flex; align-items: center; gap: var(--space-2xs); padding: var(--space-3xs) var(--space-2xs); cursor: pointer; border-radius: 2px; transition: background-color var(--transition-fast);">
                        <input type="checkbox" name="associated-poems" value="${p.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
                        <span style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(p.title)}</span>
                        <span style="font-size: 0.7rem; color: ${p.status === 'published' ? 'var(--success)' : 'var(--text-muted)'}; margin-left: auto; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${p.status === 'published' ? 'var(--success)' : 'var(--border-strong)'}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui);">
                          ${p.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
              
              <div style="display: flex; justify-content: flex-end; gap: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <button type="button" id="cancel-form-btn" style="padding: 0.6rem 1.5rem; color: var(--text-secondary); background: transparent; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem;">Cancelar</button>
                <button type="submit" id="save-col-btn" style="padding: 0.6rem 1.5rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; border: none; cursor: pointer; font-size: 0.85rem;">
                  ${colId ? 'Salvar Alterações' : 'Criar Coleção'}
                </button>
              </div>
            </form>
          </div>
        `;
        
        const nameInput = container.querySelector('#col-name');
        const slugInput = container.querySelector('#col-slug');
        nameInput.addEventListener('input', () => {
          if (!colId || slugInput.value === '') {
            slugInput.value = nameInput.value.toLowerCase().trim()
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
          }
        });
        
        const checkSearch = container.querySelector('#checklist-search');
        const checkItems = container.querySelectorAll('.checklist-item');
        checkSearch.addEventListener('input', () => {
          const query = checkSearch.value.toLowerCase().trim();
          checkItems.forEach(item => {
            if (item.dataset.title.includes(query)) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
        
        const imgUrlInput = container.querySelector('#col-img-url');
        const previewContainer = container.querySelector('#col-img-preview-container');

        const updateImgPreview = (url) => {
          previewContainer.replaceChildren();
          const safeUrl = sanitizeUrl(url);
          if (safeUrl) {
            const img = document.createElement('img');
            img.id = 'col-img-preview';
            img.setAttribute('src', encodeURI(safeUrl));
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            previewContainer.appendChild(img);
          } else {
            const placeholder = document.createElement('span');
            placeholder.id = 'col-preview-placeholder';
            placeholder.textContent = 'Nenhuma imagem';
            previewContainer.appendChild(placeholder);
          }
        };

        imgUrlInput.addEventListener('input', () => {
          updateImgPreview(imgUrlInput.value.trim());
        });
        
        const fileInput = container.querySelector('#col-img-upload');
        const statusSpan = container.querySelector('#upload-status');
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          statusSpan.textContent = 'Enviando...';
          statusSpan.style.color = 'var(--accent-subtle)';
          fileInput.disabled = true;
          
          try {
            const ext = file.name.split('.').pop().toLowerCase();
            const fileName = `col_cover_${Date.now()}.${ext}`;
            
            const { data, error: upErr } = await supabase.storage
              .from('avatars')
              .upload(fileName, file);
              
            if (upErr) throw upErr;
            
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
              
            const publicUrl = urlData.publicUrl;
            imgUrlInput.value = publicUrl;
            updateImgPreview(publicUrl);
            statusSpan.textContent = 'Sucesso!';
            statusSpan.style.color = 'var(--success)';
          } catch (err) {
            console.error('Erro no upload de capa:', err);
            statusSpan.textContent = 'Erro!';
            statusSpan.style.color = 'var(--error)';
          } finally {
            fileInput.disabled = false;
            setTimeout(() => {
              statusSpan.textContent = '';
            }, 3000);
          }
        });
        
        container.querySelector('#cancel-form-btn').addEventListener('click', () => renderList());
        
        container.querySelector('#col-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const saveBtn = container.querySelector('#save-col-btn');
          saveBtn.innerText = 'Salvando...';
          saveBtn.disabled = true;
          
          const payload = {
            name: nameInput.value.trim(),
            slug: slugInput.value.trim(),
            description: container.querySelector('#col-description').value.trim(),
            image_url: imgUrlInput.value.trim() || null
          };
          
          let colIdToUse = colId;
          let colError = null;
          
          if (colId) {
            const res = await supabase.from('collections').update(payload).eq('id', colId);
            colError = res.error;
          } else {
            payload.created_at = new Date().toISOString();
            const res = await supabase.from('collections').insert(payload);
            colError = res.error;
            if (res.data) colIdToUse = res.data.id;
          }
          
          if (colError) {
            alert('Erro ao salvar coleção: ' + colError.message);
            saveBtn.innerText = colId ? 'Salvar Alterações' : 'Criar Coleção';
            saveBtn.disabled = false;
            return;
          }
          
          const checkedCheckboxes = container.querySelectorAll('input[name="associated-poems"]:checked');
          const checkedIds = Array.from(checkedCheckboxes).map(cb => cb.value);
          
          await supabase.from('collection_poems').delete().eq('collection_id', colIdToUse);
          
          if (checkedIds.length > 0) {
            const relations = checkedIds.map(poemId => ({
              collection_id: colIdToUse,
              poem_id: poemId
            }));
            const { error: relError } = await supabase.from('collection_poems').insert(relations);
            if (relError) {
              alert('Coleção salva, mas houve um erro ao associar poemas: ' + relError.message);
            }
          }
          
          renderList();
        });
        
      } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error">Erro ao carregar o formulário: ${err.message}</div>`;
      }
    };
    
    await renderList();
}
