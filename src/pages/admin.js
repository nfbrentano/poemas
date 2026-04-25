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
      <div class="admin-layout" style="max-width: var(--container-width-admin); margin: 0 auto;">
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
          <h2>Painel Admin</h2>
          <div style="display: flex; gap: 1rem;">
            <a href="/admin?view=list" data-link class="btn-secondary" style="font-size: 0.85rem;">Poemas</a>
            <a href="/admin?view=editor" data-link class="btn-primary" style="font-size: 0.85rem;">Novo Poema</a>
            <button id="logout-btn" class="btn-secondary" style="font-size: 0.85rem;">Sair</button>
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
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 1rem 0;">${p.title}</td>
        <td style="padding: 1rem 0; color: var(--text-secondary);">${p.slug}</td>
        <td style="padding: 1rem 0;">
          <span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: ${p.status === 'published' ? 'var(--success-color)' : 'var(--text-muted)'}; color: #fff;">
            ${p.status === 'published' ? 'Publicado' : 'Rascunho'}
          </span>
        </td>
        <td style="padding: 1rem 0; text-align: right;">
          <a href="/admin?view=editor&id=${p.id}" data-link style="color: var(--accent-color); margin-right: 1rem;">Editar</a>
          <button class="delete-btn" data-id="${p.id}" style="color: var(--error-color);">Excluir</button>
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.9rem;">
            <th style="padding-bottom: 0.5rem;">Título</th>
            <th style="padding-bottom: 0.5rem;">Slug</th>
            <th style="padding-bottom: 0.5rem;">Status</th>
            <th style="padding-bottom: 0.5rem; text-align: right;">Ações</th>
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
      if (data) poem = data;
    }
    
    container.innerHTML = `
      <form id="editor-form" style="display: grid; gap: 1.5rem;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Título</label>
            <input type="text" id="poem-title" value="${poem.title}" required style="font-size: 1.2rem;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Slug</label>
            <input type="text" id="poem-slug" value="${poem.slug}" required>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Conteúdo</label>
          <textarea id="poem-content" required style="min-height: 400px; font-family: var(--font-serif-text); font-size: 1.1rem; line-height: 1.8;">${poem.content}</textarea>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Resumo / Trecho (para listagem)</label>
          <textarea id="poem-excerpt" style="min-height: 80px;">${poem.excerpt || ''}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Tags (separadas por vírgula)</label>
            <input type="text" id="poem-tags" value="${poem.tags ? poem.tags.join(', ') : ''}">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Status</label>
            <select id="poem-status">
              <option value="draft" ${poem.status === 'draft' ? 'selected' : ''}>Rascunho</option>
              <option value="published" ${poem.status === 'published' ? 'selected' : ''}>Publicado</option>
            </select>
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
          <a href="/admin" data-link class="btn-secondary">Cancelar</a>
          <button type="submit" class="btn-primary" id="save-btn">Salvar Poema</button>
          ${poem.status === 'draft' ? `<button type="button" class="btn-primary" id="publish-btn" style="background: var(--success-color);">Publicar e Enviar E-mail</button>` : ''}
        </div>
      </form>
    `;
    
    // Auto-generate slug from title if empty
    const titleInput = document.getElementById('poem-title');
    const slugInput = document.getElementById('poem-slug');
    
    titleInput.addEventListener('input', () => {
      if (!id && !slugInput.value) { // only auto-fill for new if user hasn't typed
        // basic slugify
        let slug = titleInput.value.toLowerCase().trim()
          .replace(/[áàãâä]/g, 'a')
          .replace(/[éèêë]/g, 'e')
          .replace(/[íìîï]/g, 'i')
          .replace(/[óòõôö]/g, 'o')
          .replace(/[úùûü]/g, 'u')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        // We only set it on blur usually, but input is ok for now.
      }
    });
    
    titleInput.addEventListener('blur', () => {
       if (!id && !slugInput.value) {
         let slug = titleInput.value.toLowerCase().trim()
          .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
          .replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c')
          .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
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
      
      if (id) {
        await supabase.from('poems').update(payload).eq('id', id);
      } else {
        await supabase.from('poems').insert([payload]);
      }
      
      navigateTo('/admin');
    });
    
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', async () => {
        if (!confirm('Isto irá publicar o poema e disparar e-mails para os assinantes. Continuar?')) return;
        
        publishBtn.innerText = 'Publicando...';
        publishBtn.disabled = true;
        
        const payload = getFormData();
        payload.status = 'published';
        payload.published_at = new Date().toISOString();
        
        let poemId = id;
        
        if (id) {
          await supabase.from('poems').update(payload).eq('id', id);
        } else {
          const { data } = await supabase.from('poems').insert([payload]).select().single();
          if (data) poemId = data.id;
        }
        
        // Trigger edge function
        if (poemId) {
          try {
            await supabase.functions.invoke('send-newsletter', {
              body: { poemId }
            });
            alert('Poema publicado e e-mails enviados com sucesso!');
          } catch(err) {
            console.error(err);
            alert('Poema publicado, mas houve um erro ao enviar e-mails.');
          }
        }
        
        navigateTo('/admin');
      });
    }
  }
};
