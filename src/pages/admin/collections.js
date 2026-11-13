import { listDocs, getDocById, insertDocs, updateDocById, deleteDocById, replaceCollectionPoems, uploadFile, getPublicFileUrl } from './data.js';
import { escapeHtml, sanitizeUrl, unwrapSafeHTML } from '../../utils/html.js';
import { countPoemsByCollection, formatPoemCount } from './collection-counts.js';
import {
  moveItem,
  moveItemUp,
  moveItemDown,
  appendPoemToOrder,
  removePoemFromOrder,
  sortPoemsByCollectionRelations,
  sortPoemsByAutoOrder,
  buildCollectionPoemsPayload,
} from '../../utils/collection-order.js';

export async function renderCollections(container) {
    const renderList = async () => {
      container.innerHTML = '<div class="loading">Carregando coleções...</div>';
      
      const [{ data: cols, error }, relationsRes] = await Promise.all([
        listDocs('collections'),
        listDocs('collection_poems')
      ]);
        
      if (error) {
        container.innerHTML = unwrapSafeHTML(`<div class="error">Erro ao carregar coleções: ${escapeHtml(error.message)}</div>`);
        return;
      }
      
      // Se as relações não puderem ser lidas, o selo mostra "—" e a lista segue funcionando.
      const poemCounts = relationsRes.error ? null : countPoemsByCollection(relationsRes.data);

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
                  ${formatPoemCount(poemCounts, c.id)}
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
      
      container.innerHTML = unwrapSafeHTML(`
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
      `);
      
      container.querySelector('#new-col-btn').addEventListener('click', () => renderForm());
      
      container.querySelectorAll('.edit-col-btn').forEach(btn => {
        btn.addEventListener('click', () => renderForm(btn.dataset.id));
      });
      
      container.querySelectorAll('.delete-col-btn').forEach(btn => {
        let confirmState = false;
        btn.addEventListener('click', async (_e) => {
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
          const { error: delErr } = await deleteDocById('collections', btn.dataset.id);
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
          listDocs('poems', { orderBy: ['title', 'asc'] }),
          colId ? getDocById('collections', colId) : Promise.resolve({ data: null }),
          colId ? listDocs('collection_poems', { where: [['collection_id', '==', colId]] }) : Promise.resolve({ data: [] })
        ]);
        
        if (poemsRes.error) throw poemsRes.error;
        if (colId && colRes.error) throw colRes.error;
        if (colId && assocRes.error) throw assocRes.error;
        
        const poems = poemsRes.data || [];
        if (colRes.data) col = colRes.data;
        const assocData = assocRes.data || [];
        assocData.forEach(a => associatedSet.add(a.poem_id));

        let isManualOrder = assocData.some(a => typeof a.order === 'number');
        let isDirtyOrder = false;

        const associatedPoems = poems.filter(p => associatedSet.has(p.id));
        let orderedPoems = isManualOrder
          ? sortPoemsByCollectionRelations(associatedPoems, assocData)
          : sortPoemsByAutoOrder(associatedPoems);
        
        container.innerHTML = unwrapSafeHTML(`
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

              <!-- Ordem de Leitura dos Poemas -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-2xs); margin-bottom: var(--space-xs);">
                  <div>
                    <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">
                      Ordem de Leitura dos Poemas (<span id="order-count">${orderedPoems.length}</span>)
                    </label>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                      Arraste os itens ou use as setas ↑ ↓ para definir a ordem na qual os poemas aparecem nesta coleção.
                    </p>
                  </div>
                  <div>
                    <span id="order-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 2px; font-family: var(--font-ui); text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${isManualOrder ? 'var(--accent-subtle)' : 'var(--border-strong)'}; color: ${isManualOrder ? 'var(--accent-subtle)' : 'var(--text-muted)'};">
                      ${isManualOrder ? '✓ Ordem manual' : 'Ordem automática'}
                    </span>
                  </div>
                </div>

                <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; margin-bottom: var(--space-xs);">
                  <button type="button" id="save-order-btn" class="btn-secondary" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.8rem; background: var(--bg-secondary); color: var(--text-primary);">
                    Salvar ordem
                  </button>
                  <button type="button" id="restore-order-btn" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid transparent; border-radius: 2px; font-size: 0.8rem; background: transparent; color: var(--text-secondary);">
                    Restaurar ordem automática
                  </button>
                  <span id="order-feedback" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
                </div>

                <div id="order-list-container" style="max-height: 280px; overflow-y: auto; border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-2xs); background: var(--bg-secondary); display: grid; gap: 4px;">
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
        `);
        
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
            
            const { error: upErr } = await uploadFile('avatars', fileName, file);
              
            if (upErr) throw upErr;
            
            const publicUrl = getPublicFileUrl('avatars', fileName);
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
        
        // Elementos da seção de ordem de poemas
        const orderListContainer = container.querySelector('#order-list-container');
        const orderCountEl = container.querySelector('#order-count');
        const orderBadge = container.querySelector('#order-badge');
        const orderFeedback = container.querySelector('#order-feedback');
        const saveOrderBtn = container.querySelector('#save-order-btn');
        const restoreOrderBtn = container.querySelector('#restore-order-btn');

        const updateBadge = () => {
          if (orderBadge) {
            orderBadge.textContent = isManualOrder ? '✓ Ordem manual' : 'Ordem automática';
            orderBadge.style.borderColor = isManualOrder ? 'var(--accent-subtle)' : 'var(--border-strong)';
            orderBadge.style.color = isManualOrder ? 'var(--accent-subtle)' : 'var(--text-muted)';
          }
          if (orderCountEl) {
            orderCountEl.textContent = String(orderedPoems.length);
          }
        };

        let draggedIndex = null;

        const renderOrderList = () => {
          if (!orderListContainer) return;
          if (orderedPoems.length === 0) {
            orderListContainer.innerHTML = unwrapSafeHTML(`
              <p style="color: var(--text-muted); font-size: 0.85rem; padding: 16px; margin: 0; text-align: center;">
                Nenhum poema selecionado para esta coleção. Marque poemas na lista acima para ordená-los.
              </p>
            `);
            return;
          }

          orderListContainer.innerHTML = unwrapSafeHTML(orderedPoems.map((p, index) => `
            <div class="poem-order-item" data-id="${p.id}" data-index="${index}" draggable="true" tabindex="0" role="listitem"
                 style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 2px; cursor: grab; user-select: none; transition: background-color var(--transition-fast), border-color var(--transition-fast);">
              <span class="order-handle" title="Arraste para mover" style="color: var(--text-muted); font-size: 1rem; cursor: grab; padding: 0 4px;">⠿</span>
              <span class="order-num" style="font-family: var(--font-ui); font-size: 0.8rem; color: var(--text-muted); width: 22px; text-align: right; font-variant-numeric: tabular-nums;">${index + 1}.</span>
              <span style="flex: 1; font-size: 0.85rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(p.title)}</span>
              <span style="font-size: 0.68rem; color: ${p.status === 'published' ? 'var(--success)' : 'var(--text-muted)'}; border: 1px solid ${p.status === 'published' ? 'var(--success)' : 'var(--border-strong)'}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui); text-transform: uppercase;">
                ${p.status === 'published' ? 'Pub' : 'Rasc'}
              </span>
              <div style="display: flex; gap: 2px;">
                <button type="button" class="btn-move-up" data-index="${index}" aria-label="Mover ${escapeHtml(p.title)} para cima" ${index === 0 ? 'disabled' : ''}
                        style="background: transparent; border: 1px solid var(--border-subtle); border-radius: 2px; padding: 1px 6px; font-size: 0.75rem; color: var(--text-secondary); cursor: ${index === 0 ? 'not-allowed' : 'pointer'}; opacity: ${index === 0 ? '0.4' : '1'};">
                  ↑
                </button>
                <button type="button" class="btn-move-down" data-index="${index}" aria-label="Mover ${escapeHtml(p.title)} para baixo" ${index === orderedPoems.length - 1 ? 'disabled' : ''}
                        style="background: transparent; border: 1px solid var(--border-subtle); border-radius: 2px; padding: 1px 6px; font-size: 0.75rem; color: var(--text-secondary); cursor: ${index === orderedPoems.length - 1 ? 'not-allowed' : 'pointer'}; opacity: ${index === orderedPoems.length - 1 ? '0.4' : '1'};">
                  ↓
                </button>
              </div>
            </div>
          `).join(''));

          // Ações de mover com teclado e clique
          orderListContainer.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = parseInt(btn.dataset.index, 10);
              if (idx > 0) {
                orderedPoems = moveItemUp(orderedPoems, idx);
                isManualOrder = true;
                isDirtyOrder = true;
                updateBadge();
                renderOrderList();
                const nextBtn = orderListContainer.querySelector(`.btn-move-up[data-index="${idx - 1}"]`);
                if (nextBtn) nextBtn.focus();
              }
            });
          });

          orderListContainer.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = parseInt(btn.dataset.index, 10);
              if (idx < orderedPoems.length - 1) {
                orderedPoems = moveItemDown(orderedPoems, idx);
                isManualOrder = true;
                isDirtyOrder = true;
                updateBadge();
                renderOrderList();
                const nextBtn = orderListContainer.querySelector(`.btn-move-down[data-index="${idx + 1}"]`);
                if (nextBtn) nextBtn.focus();
              }
            });
          });

          // Suporte a teclado no item (Alt+ArrowUp e Alt+ArrowDown)
          orderListContainer.querySelectorAll('.poem-order-item').forEach(item => {
            item.addEventListener('keydown', (e) => {
              const idx = parseInt(item.dataset.index, 10);
              if (e.key === 'ArrowUp' && (e.altKey || e.ctrlKey)) {
                e.preventDefault();
                if (idx > 0) {
                  orderedPoems = moveItemUp(orderedPoems, idx);
                  isManualOrder = true;
                  isDirtyOrder = true;
                  updateBadge();
                  renderOrderList();
                  const targetItem = orderListContainer.querySelector(`.poem-order-item[data-index="${idx - 1}"]`);
                  if (targetItem) targetItem.focus();
                }
              } else if (e.key === 'ArrowDown' && (e.altKey || e.ctrlKey)) {
                e.preventDefault();
                if (idx < orderedPoems.length - 1) {
                  orderedPoems = moveItemDown(orderedPoems, idx);
                  isManualOrder = true;
                  isDirtyOrder = true;
                  updateBadge();
                  renderOrderList();
                  const targetItem = orderListContainer.querySelector(`.poem-order-item[data-index="${idx + 1}"]`);
                  if (targetItem) targetItem.focus();
                }
              }
            });

            // HTML5 Drag and drop (mouse)
            item.addEventListener('dragstart', (e) => {
              draggedIndex = parseInt(item.dataset.index, 10);
              if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(draggedIndex));
              }
              item.style.opacity = '0.4';
            });

            item.addEventListener('dragend', () => {
              item.style.opacity = '1';
              orderListContainer.querySelectorAll('.poem-order-item').forEach(el => {
                el.style.borderTop = '';
                el.style.borderBottom = '';
              });
            });

            item.addEventListener('dragover', (e) => {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
              const targetIndex = parseInt(item.dataset.index, 10);
              if (draggedIndex !== null && draggedIndex !== targetIndex) {
                if (draggedIndex < targetIndex) {
                  item.style.borderBottom = '2px solid var(--accent-subtle)';
                  item.style.borderTop = '';
                } else {
                  item.style.borderTop = '2px solid var(--accent-subtle)';
                  item.style.borderBottom = '';
                }
              }
            });

            item.addEventListener('dragleave', () => {
              item.style.borderTop = '';
              item.style.borderBottom = '';
            });

            item.addEventListener('drop', (e) => {
              e.preventDefault();
              const targetIndex = parseInt(item.dataset.index, 10);
              if (draggedIndex !== null && draggedIndex !== targetIndex) {
                orderedPoems = moveItem(orderedPoems, draggedIndex, targetIndex);
                isManualOrder = true;
                isDirtyOrder = true;
                updateBadge();
                renderOrderList();
              }
              draggedIndex = null;
            });

            // Touch events para mobile (RNF02 & CA01)
            let _touchStartY = 0;
            let currentOverIndex = null;
            item.addEventListener('touchstart', (e) => {
              if (e.touches.length === 1) {
                _touchStartY = e.touches[0].clientY;
                draggedIndex = parseInt(item.dataset.index, 10);
              }
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
              if (draggedIndex === null || e.touches.length !== 1) return;
              const touch = e.touches[0];
              const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
              const targetItem = elBelow ? elBelow.closest('.poem-order-item') : null;
              if (targetItem && targetItem !== item) {
                currentOverIndex = parseInt(targetItem.dataset.index, 10);
                orderListContainer.querySelectorAll('.poem-order-item').forEach(el => {
                  el.style.backgroundColor = el === targetItem ? 'var(--bg-elevated)' : 'var(--bg-primary)';
                });
              }
            }, { passive: true });

            item.addEventListener('touchend', () => {
              if (draggedIndex !== null && currentOverIndex !== null && draggedIndex !== currentOverIndex) {
                orderedPoems = moveItem(orderedPoems, draggedIndex, currentOverIndex);
                isManualOrder = true;
                isDirtyOrder = true;
                updateBadge();
                renderOrderList();
              }
              draggedIndex = null;
              currentOverIndex = null;
              orderListContainer.querySelectorAll('.poem-order-item').forEach(el => {
                el.style.backgroundColor = 'var(--bg-primary)';
              });
            });
          });
        };

        // Renderiza lista inicial
        renderOrderList();

        // Atualização reativa da lista de ordem quando os checkboxes são marcados/desmarcados
        const checkboxes = container.querySelectorAll('input[name="associated-poems"]');
        checkboxes.forEach(cb => {
          cb.addEventListener('change', () => {
            const poemId = cb.value;
            const poem = poems.find(p => p.id === poemId);
            if (cb.checked) {
              if (poem) {
                orderedPoems = appendPoemToOrder(orderedPoems, poem);
                isDirtyOrder = true;
              }
            } else {
              orderedPoems = removePoemFromOrder(orderedPoems, poemId);
              isDirtyOrder = true;
            }
            updateBadge();
            renderOrderList();
          });
        });

        // Botão Salvar Ordem (RF03, CA03, CA04)
        if (saveOrderBtn) {
          saveOrderBtn.addEventListener('click', async () => {
            if (!colId) {
              alert('Por favor, crie e salve a coleção antes de gravar a ordem individualmente.');
              return;
            }
            saveOrderBtn.disabled = true;
            saveOrderBtn.textContent = 'Salvando ordem...';
            orderFeedback.textContent = '';

            const relations = buildCollectionPoemsPayload(colId, orderedPoems, true);
            const { error: saveErr } = await replaceCollectionPoems(colId, relations, { collectionSlug: col.slug });

            saveOrderBtn.disabled = false;
            saveOrderBtn.textContent = 'Salvar ordem';

            if (saveErr) {
              orderFeedback.textContent = 'Erro ao salvar ordem: ' + (saveErr.message || 'Falha na rede');
              orderFeedback.style.color = 'var(--error)';
            } else {
              isManualOrder = true;
              isDirtyOrder = false;
              updateBadge();
              orderFeedback.textContent = '✓ Ordem salva com sucesso!';
              orderFeedback.style.color = 'var(--success)';
              setTimeout(() => {
                if (orderFeedback.textContent.startsWith('✓')) orderFeedback.textContent = '';
              }, 4000);
            }
          });
        }

        // Botão Restaurar Ordem Automática (RF07, CA08)
        if (restoreOrderBtn) {
          restoreOrderBtn.addEventListener('click', async () => {
            if (!confirm('Deseja restaurar a ordem automática (cronológica) dos poemas desta coleção?')) return;
            orderedPoems = sortPoemsByAutoOrder(orderedPoems);
            isManualOrder = false;
            updateBadge();
            renderOrderList();

            if (colId) {
              restoreOrderBtn.disabled = true;
              orderFeedback.textContent = 'Restaurando...';
              orderFeedback.style.color = 'var(--text-muted)';

              const relations = buildCollectionPoemsPayload(colId, orderedPoems, false);
              const { error: restErr } = await replaceCollectionPoems(colId, relations, { collectionSlug: col.slug });
              restoreOrderBtn.disabled = false;

              if (restErr) {
                orderFeedback.textContent = 'Erro ao restaurar ordem: ' + (restErr.message || 'Falha');
                orderFeedback.style.color = 'var(--error)';
              } else {
                isDirtyOrder = false;
                orderFeedback.textContent = '✓ Ordem restaurada para o padrão cronológico.';
                orderFeedback.style.color = 'var(--success)';
                setTimeout(() => {
                  if (orderFeedback.textContent.startsWith('✓')) orderFeedback.textContent = '';
                }, 4000);
              }
            } else {
              isDirtyOrder = true;
            }
          });
        }

        // Aviso ao sair da tela com alterações não salvas (RF08, CA09)
        const beforeUnloadHandler = (e) => {
          if (isDirtyOrder) {
            e.preventDefault();
            e.returnValue = '';
          }
        };
        window.addEventListener('beforeunload', beforeUnloadHandler);

        container.querySelector('#cancel-form-btn').addEventListener('click', () => {
          if (isDirtyOrder && !confirm('Há alterações não salvas na ordem dos poemas. Deseja realmente sair sem salvar?')) {
            return;
          }
          window.removeEventListener('beforeunload', beforeUnloadHandler);
          renderList();
        });
        
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
            const res = await updateDocById('collections', colId, payload);
            colError = res.error;
          } else {
            payload.created_at = new Date().toISOString();
            const res = await insertDocs('collections', payload);
            colError = res.error;
            if (res.data) colIdToUse = res.data.id;
          }
          
          if (colError) {
            alert('Erro ao salvar coleção: ' + colError.message);
            saveBtn.innerText = colId ? 'Salvar Alterações' : 'Criar Coleção';
            saveBtn.disabled = false;
            return;
          }
          
          window.removeEventListener('beforeunload', beforeUnloadHandler);

          // Salva relações atomicamente com a ordem atualizada (RNF03)
          if (orderedPoems.length > 0) {
            const relations = buildCollectionPoemsPayload(colIdToUse, orderedPoems, isManualOrder);
            const { error: relError } = await replaceCollectionPoems(colIdToUse, relations, { collectionSlug: payload.slug });
            if (relError) {
              alert('Coleção salva, mas houve um erro ao associar/ordenar poemas: ' + relError.message);
            }
          } else {
            await replaceCollectionPoems(colIdToUse, [], { collectionSlug: payload.slug });
          }
          
          renderList();
        });
        
      } catch (err) {
        console.error(err);
        container.innerHTML = unwrapSafeHTML(`<div class="error">Erro ao carregar o formulário: ${escapeHtml(err.message)}</div>`);
      }
    };
    
    await renderList();
}
