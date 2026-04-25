import { supabase } from '../utils/supabase.js';
import { navigateTo } from '../router.js';

export default {
  meta: { title: 'Dashboard Admin' },
  
  async render(container, params) {
    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigateTo('/login');
      return;
    }
    
    // Simple query param router for admin
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'list';
    
    container.innerHTML = `
      <div class="admin-layout" style="max-width: var(--container-admin); margin: 0 auto;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary);">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-sm); align-items: center; font-family: var(--font-ui);">
            <a href="${import.meta.env.BASE_URL}admin?view=list" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">Obras</a>
            <a href="${import.meta.env.BASE_URL}admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast);">Nova Obra</a>
            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await supabase.auth.signOut();
      navigateTo('/login');
    });
    
    const contentDiv = document.getElementById('admin-content');
    
    if (view === 'list') {
      await this.renderList(contentDiv);
    } else if (view === 'editor') {
      await this.renderEditor(contentDiv, urlParams.get('id'));
    }
  },
  
  async renderList(container) {
    container.innerHTML = '<div class="loading">Carregando poemas...</div>';
    
    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, title, slug, status, published_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      container.innerHTML = `<div class="error">Erro ao carregar. ${error.message}</div>`;
      return;
    }
    
    if (poems.length === 0) {
      container.innerHTML = '<p>Nenhum poema encontrado.</p>';
      return;
    }
    
    const rows = poems.map(p => `
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem;">${p.title}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${p.slug}</td>
        <td style="padding: var(--space-md) 0;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${p.status === 'published' ? 'var(--success)' : 'var(--border-strong)'}; color: ${p.status === 'published' ? 'var(--success)' : 'var(--text-muted)'}; text-transform: uppercase; letter-spacing: 1px;">
            ${p.status === 'published' ? 'Publicado' : 'Rascunho'}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
          <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${p.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast);">Editar</a>
          <button class="delete-btn" data-id="${p.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast);">Excluir</button>
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Link</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Estado</th>
            <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    
    // Delete handlers
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Tem certeza que deseja excluir este poema?')) {
          const id = e.target.dataset.id;
          await supabase.from('poems').delete().eq('id', id);
          navigateTo('/admin');
        }
      });
    });
  },
  
  async renderEditor(container, id) {
    let poem = { title: '', slug: '', content: '', excerpt: '', tags: [], status: 'draft' };
    
    if (id) {
      container.innerHTML = '<div class="loading">Carregando poema...</div>';
      const { data } = await supabase.from('poems').select('*').eq('id', id).single();
      if (data) {
        poem = data;
        // Clean imported HTML tags so the editor is always pure natural text
        poem.content = (poem.content || '')
          .replace(/<br\s*[\/]?>/gi, '\n')
          .replace(/<\/p>\s*<p>/gi, '\n\n')
          .replace(/<\/?(p|pre|div|span|strong|em|b|i)[^>]*>/gi, '')
          .trim();
      }
    }
    
    container.innerHTML = `
      <form id="editor-form" style="display: grid; gap: var(--space-lg); font-family: var(--font-ui);">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
          <div>
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
            <input type="text" id="poem-title" value="${poem.title}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
            <input type="text" id="poem-slug" value="${poem.slug}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
          </div>
        </div>
        
        <div style="margin-top: var(--space-md);">
          <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Corpo da Obra</label>
          <textarea id="poem-content" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.2rem; line-height: 2; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${poem.content}</textarea>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho (para listagem)</label>
          <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${poem.excerpt || ''}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
          <div>
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Tags (separadas por vírgula)</label>
            <input type="text" id="poem-tags" value="${poem.tags ? poem.tags.join(', ') : ''}" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
          </div>
          <div>
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado da Obra</label>
            <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
              <option value="draft" ${poem.status === 'draft' ? 'selected' : ''}>Rascunho (Privado)</option>
              <option value="published" ${poem.status === 'published' ? 'selected' : ''}>Publicado (Visível)</option>
            </select>
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
          <a href="${import.meta.env.BASE_URL}admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
          <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
          ${poem.status === 'draft' ? `<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar e Notificar Assinantes</button>` : ''}
        </div>
      </form>
    `;
    
    // Auto-generate slug from title if empty
    const titleInput = document.getElementById('poem-title');
    const slugInput = document.getElementById('poem-slug');
    
    titleInput.addEventListener('input', () => {
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
    
    titleInput.addEventListener('blur', () => {
       if (!slugInput.value) {
         let slug = titleInput.value.toLowerCase().trim()
          .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
          .replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
         slugInput.value = slug;
       }
    });

    const getFormData = () => {
      const tagsRaw = document.getElementById('poem-tags').value;
      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
      
      return {
        title: document.getElementById('poem-title').value,
        slug: document.getElementById('poem-slug').value,
        content: document.getElementById('poem-content').value,
        excerpt: document.getElementById('poem-excerpt').value,
        tags,
        status: document.getElementById('poem-status').value
      };
    };
    
    document.getElementById('editor-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('save-btn');
      btn.innerText = 'Salvando...';
      btn.disabled = true;
      
      const payload = getFormData();
      if (payload.status === 'published' && poem.status !== 'published') {
        payload.published_at = new Date().toISOString();
      }
      
      let error = null;
      if (id) {
        const res = await supabase.from('poems').update(payload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('poems').insert([payload]);
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
        
        let poemId = id;
        let error = null;
        
        if (id) {
          const res = await supabase.from('poems').update(payload).eq('id', id);
          error = res.error;
        } else {
          const res = await supabase.from('poems').insert([payload]).select().single();
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
        
        // Trigger edge function
        if (poemId) {
          try {
            await supabase.functions.invoke('send-newsletter', {
              body: { poemId }
            });
            alert('Obra publicada e e-mails enviados com sucesso!');
          } catch(err) {
            console.error(err);
            alert('Obra publicada, mas houve um erro ao enviar e-mails.');
          }
        }
        
        navigateTo('/admin');
      });
    }
  }
};
