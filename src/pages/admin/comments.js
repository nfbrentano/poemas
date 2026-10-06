import { listDocs, updateDocById, deleteDocById } from './data.js';
import { escapeHtml } from '../../utils/html.js';
import { attachPoemsToComments, formatCommentPoemHtml } from './comment-helpers.js';

export async function renderComments(container) {
    container.innerHTML = '<div class="loading">Carregando comentários...</div>';
    
    try {
      const [commentsRes, poemsRes] = await Promise.all([
        listDocs('poem_comments', { orderBy: ['created_at', 'desc'] }),
        listDocs('poems')
      ]);
      
      if (commentsRes.error) {
        container.innerHTML = `<div class="error">Erro ao carregar: ${commentsRes.error.message}</div>`;
        return;
      }
      
      const rawComments = commentsRes.data || [];
      const poems = poemsRes.data || [];
      
      if (rawComments.length === 0) {
        container.innerHTML = '<p>Nenhum comentário encontrado.</p>';
        return;
      }
      
      const comments = attachPoemsToComments(rawComments, poems);
      
      const rows = comments.map(c => `
        <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
          <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
            ${new Date(c.created_at).toLocaleDateString('pt-BR')}
          </td>
          <td style="padding: var(--space-md) 0;">
            <div style="font-family: var(--font-display); font-size: 1.1rem;">${escapeHtml(c.author_name)}</div>
            <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${formatCommentPoemHtml(c)}</div>
            <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${escapeHtml(c.content)}</div>
          </td>
          <td style="padding: var(--space-md) 0; vertical-align: middle;">
            <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${c.approved ? 'var(--success)' : 'var(--accent-subtle)'}; color: ${c.approved ? 'var(--success)' : 'var(--accent-subtle)'}; text-transform: uppercase; letter-spacing: 1px;">
              ${c.approved ? 'Aprovado' : 'Pendente'}
            </span>
          </td>
          <td style="padding: var(--space-md) 0; text-align: right; vertical-align: middle;">
            ${!c.approved ? `<button class="approve-btn" data-id="${c.id}" style="color: var(--success); margin-right: 1rem;">Aprovar</button>` : ''}
            <button class="delete-comment-btn" data-id="${c.id}" style="color: var(--error);">Excluir</button>
          </td>
        </tr>
      `).join('');
      
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
              <th style="padding-bottom: var(--space-sm); font-weight: 500;">Data</th>
              <th style="padding-bottom: var(--space-sm); font-weight: 500;">Autor e Comentário</th>
              <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
              <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;

      container.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const { error } = await updateDocById('poem_comments', id, { approved: true });
          if (error) alert('Erro ao aprovar: ' + error.message);
          else renderComments(container);
        });
      });

      container.querySelectorAll('.delete-comment-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Excluir este comentário?')) return;
          const id = btn.dataset.id;
          const { error } = await deleteDocById('poem_comments', id);
          if (error) alert('Erro ao excluir: ' + error.message);
          else renderComments(container);
        });
      });
    } catch (err) {
      container.innerHTML = `<div class="error">Erro ao carregar: ${err.message}</div>`;
    }
}
