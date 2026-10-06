import { supabase } from './compat-client.js';
import { navigateTo } from '../../router.js';
import { escapeHtml } from '../../utils/html.js';
import { debounce } from './debounce.js';

export async function renderList(container) {
    container.innerHTML = '<div class="loading">Carregando obras...</div>';
    
    try {
      const [poemsRes, viewsRes] = await Promise.all([
        supabase.from('poems').select('id, title, slug, status, published_at, scheduled_at, tags, created_at'),
        supabase.from('page_views').select('poem_id')
      ]);
      
      if (poemsRes.error) throw poemsRes.error;
      
      const poems = poemsRes.data || [];
      const views = viewsRes.data || [];
      
      const viewCounts = {};
      views.forEach(v => {
        if (v.poem_id) {
          viewCounts[v.poem_id] = (viewCounts[v.poem_id] || 0) + 1;
        }
      });
      
      const allTags = new Set();
      poems.forEach(p => p.tags?.forEach(t => allTags.add(t.trim())));
      const sortedTags = Array.from(allTags).sort();
      
      container.innerHTML = `
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          
          <!-- Filters Toolbar -->
          <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; background: var(--bg-elevated); padding: var(--space-sm); border-radius: 4px; border: 1px solid var(--border-subtle);">
            <input type="text" id="list-search" placeholder="Buscar por título ou slug..." style="flex-grow: 1; padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; min-width: 200px; font-size: 0.85rem;">
            
            <select id="list-filter-status" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; cursor: pointer;">
              <option value="all">Todos os Estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="scheduled">Agendados</option>
            </select>
            
            <select id="list-filter-tag" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; max-width: 180px; cursor: pointer;">
              <option value="all">Todos os Sentimentos</option>
              ${sortedTags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
            </select>
            
            <select id="list-sort" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; cursor: pointer;">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="title-az">Título (A-Z)</option>
              <option value="title-za">Título (Z-A)</option>
              <option value="views">Mais Vistos (Views)</option>
            </select>
          </div>
          
          <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <div>
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${poems.length}</strong> obras
            </div>
          </div>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Link</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Estado</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500; text-align: center;">Visualizações</th>
                  <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
                </tr>
              </thead>
              <tbody id="list-tbody"></tbody>
            </table>
          </div>
        </div>
      `;
      
      const tbody = container.querySelector('#list-tbody');
      const resultsCountEl = container.querySelector('#results-count');
      
      const renderRows = (filteredPoems) => {
        resultsCountEl.innerText = filteredPoems.length;
        if (filteredPoems.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum poema encontrado com os filtros selecionados.
              </td>
            </tr>
          `;
          return;
        }
        
        tbody.innerHTML = filteredPoems.map(p => {
          const count = viewCounts[p.id] || 0;
          let dateInfo = '';
          if (p.status === 'scheduled') {
            dateInfo = `Agendado • ${new Date(p.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`;
          } else if (p.status === 'published') {
            dateInfo = `Publicado • ${new Date(p.published_at).toLocaleDateString('pt-BR')}`;
          } else {
            dateInfo = `Criado • ${new Date(p.created_at).toLocaleDateString('pt-BR')}`;
          }
          
          const badgeColor = p.status === 'published' ? 'var(--success)' : p.status === 'scheduled' ? 'var(--accent-subtle)' : 'var(--border-strong)';
          const badgeTextColor = p.status === 'published' ? 'var(--success)' : p.status === 'scheduled' ? 'var(--accent-subtle)' : 'var(--text-muted)';
          
          return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary);">${escapeHtml(p.title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(p.slug)}</td>
              <td style="padding: var(--space-md) 0;">
                <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${badgeColor}; color: ${badgeTextColor}; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
                  ${p.status === 'published' ? 'Publicado' : p.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                </span>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; font-family: var(--font-ui); white-space: nowrap;">${dateInfo}</div>
              </td>
              <td style="padding: var(--space-md) 0; text-align: center; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.9rem;">
                👁 ${count}
              </td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${p.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast); text-decoration: none;">Editar</a>
                <button class="delete-btn" data-id="${p.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer; padding: 0;">Excluir</button>
              </td>
            </tr>
          `;
        }).join('');
        
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
          let confirmState = false;
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            
            if (!confirmState) {
              const originalText = btn.innerText;
              btn.innerText = 'Tem certeza?';
              btn.style.color = '#fff';
              btn.style.backgroundColor = 'var(--error)';
              btn.style.padding = '0.2rem 0.5rem';
              btn.style.borderRadius = '2px';
              btn.style.opacity = '1';
              confirmState = true;
              
              setTimeout(() => {
                if (btn && !btn.disabled) {
                  btn.innerText = originalText;
                  btn.style.color = 'var(--error)';
                  btn.style.backgroundColor = 'transparent';
                  btn.style.padding = '0';
                  btn.style.opacity = '0.7';
                  confirmState = false;
                }
              }, 3000);
              return;
            }
            
            btn.innerText = 'Excluindo...';
            btn.disabled = true;
            
            const { error } = await supabase.from('poems').delete().eq('id', id);
            
            if (error) {
              console.error(error);
              alert('Erro ao excluir: ' + error.message);
              btn.innerText = 'Excluir';
              btn.disabled = false;
              return;
            }
            
            navigateTo('/admin?view=list');
          });
        });
      };
      
      const searchInput = container.querySelector('#list-search');
      const statusSelect = container.querySelector('#list-filter-status');
      const tagSelect = container.querySelector('#list-filter-tag');
      const sortSelect = container.querySelector('#list-sort');
      
      const filterList = () => {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusSelect.value;
        const tag = tagSelect.value;
        const sort = sortSelect.value;
        
        let filtered = [...poems];
        
        if (query) {
          filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.slug.toLowerCase().includes(query)
          );
        }
        
        if (status !== 'all') {
          filtered = filtered.filter(p => p.status === status);
        }
        
        if (tag !== 'all') {
          filtered = filtered.filter(p => p.tags && p.tags.includes(tag));
        }
        
        if (sort === 'newest') {
          filtered.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
        } else if (sort === 'oldest') {
          filtered.sort((a, b) => new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at));
        } else if (sort === 'title-az') {
          filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'title-za') {
          filtered.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sort === 'views') {
          filtered.sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0));
        }
        
        renderRows(filtered);
      };
      
      searchInput.addEventListener('input', debounce(filterList, 150));
      statusSelect.addEventListener('change', filterList);
      tagSelect.addEventListener('change', filterList);
      sortSelect.addEventListener('change', filterList);
      
      filterList();
      
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="error">Erro ao carregar obras: ${err.message}</div>`;
    }
}
