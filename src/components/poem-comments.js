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
      let comments = [];
      let error = null;
      try {
        const { db } = await import('../utils/firebase.js');
        const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
        const q = query(
          collection(db, 'poem_comments'),
          where('poem_id', '==', poemId),
          where('approved', '==', true),
          orderBy('created_at', 'asc')
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          comments.push(doc.data());
        });
      } catch (err) {
        error = err;
        console.error('Error loading comments:', err);
      }
      
      const listEl = document.getElementById('comments-list');
      if (error || comments.length === 0) {
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
      
      const website = document.getElementById('comment-website')?.value;
      if (website) {
        toast.show('Sua nota foi enviada e aguarda moderação.', 'success');
        commentForm.reset();
        commentForm.style.display = 'none';
        return;
      }

      const lastSubmit = localStorage.getItem('last_comment_time');
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
        toast.show('Por favor, aguarde 1 minuto entre os envios.', 'error');
        return;
      }

      const author = document.getElementById('comment-author').value.trim();
      const content = document.getElementById('comment-content').value.trim();

      if (!author || !content) {
        toast.show('Preencha os campos corretamente.', 'error');
        return;
      }

      const btn = document.getElementById('submit-comment-btn');
      btn.disabled = true;
      btn.innerText = 'Enviando...';

      let error = null;
      try {
        const { db } = await import('../utils/firebase.js');
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'poem_comments'), {
          poem_id: poemId,
          author_name: author,
          content: content,
          approved: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('last_comment_time', Date.now().toString());
      } catch (err) {
        error = err;
        console.error('Error adding comment:', err);
      }

      if (error) {
        toast.show('Erro ao enviar comentário.', 'error');
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
      } else {
        toast.show('Sua nota foi enviada e aguarda moderação.', 'success');
        commentForm.reset();
        commentForm.style.display = 'none';
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
      }
    });
  }
};
