import { supabase } from '../utils/supabase.js';
import { escapeHtml } from '../utils/html.js';
import { toast } from './toast.js';

export const PoemComments = {
  async init(container, poemId) {
    const toggleCommentBtn = document.getElementById('toggle-comment-btn');
    const commentForm = document.getElementById('comment-form');
    
    toggleCommentBtn?.addEventListener('click', () => {
      commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
      toggleCommentBtn.style.display = 'none';
    });

    // Load Comments
    const loadComments = async () => {
      const { data: comments, error } = await supabase
        .from('poem_comments')
        .select('author_name, content, created_at')
        .eq('poem_id', poemId)
        .eq('approved', true)
        .order('created_at', { ascending: true });
      
      const listEl = document.getElementById('comments-list');
      if (error || !comments || comments.length === 0) {
        if (listEl) listEl.innerHTML = '<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>';
        return;
      }

      if (listEl) {
        listEl.innerHTML = comments.map(c => `
          <div class="comment-item fade-in">
            <div class="comment-meta">
              <span class="comment-author">${escapeHtml(c.author_name)}</span>
              <span class="comment-date">${new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="comment-text">${escapeHtml(c.content)}</div>
          </div>
        `).join('');
      }
    };
    loadComments();

    // Submit Comment
    commentForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = document.getElementById('comment-author').value;
      const content = document.getElementById('comment-content').value;
      const btn = document.getElementById('submit-comment-btn');

      btn.disabled = true;
      btn.innerText = 'Enviando...';

      const { error } = await supabase
        .from('poem_comments')
        .insert([{ poem_id: poemId, author_name: author, content: content }]);

      if (error) {
        toast.show('Erro ao enviar comentário.', 'error');
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
      } else {
        toast.show('Sua nota foi enviada e aguarda moderação.', 'success');
        commentForm.reset();
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
      }
    });
  }
};
