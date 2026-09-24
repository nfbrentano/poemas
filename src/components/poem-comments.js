import { escapeHtml } from '../utils/html.js';
import { toast } from './toast.js';

let currentPoemId = null;
let commentsLoading = false;
let commentsLoaded = false;
let activeContainer = null;

export const PoemComments = {
  openForm(container = activeContainer || document) {
    const root = container || activeContainer || document;
    const commentForm = root.querySelector('#comment-form');
    const toggleCommentBtn = root.querySelector('#toggle-comment-btn');
    const authorInput = root.querySelector('#comment-author');

    if (commentForm) {
      commentForm.hidden = false;
      commentForm.style.display = '';
    }
    if (toggleCommentBtn) {
      toggleCommentBtn.hidden = true;
      toggleCommentBtn.style.display = '';
      toggleCommentBtn.setAttribute('aria-expanded', 'true');
    }
    authorInput?.focus();

    if (currentPoemId && !commentsLoaded && !commentsLoading) {
      this.loadComments(currentPoemId, root);
    }
  },

  closeForm(container = activeContainer || document) {
    const root = container || activeContainer || document;
    const commentForm = root.querySelector('#comment-form');
    const toggleCommentBtn = root.querySelector('#toggle-comment-btn');

    if (commentForm) {
      commentForm.hidden = true;
      commentForm.style.display = '';
    }
    if (toggleCommentBtn) {
      toggleCommentBtn.hidden = false;
      toggleCommentBtn.style.display = '';
      toggleCommentBtn.setAttribute('aria-expanded', 'false');
    }
  },

  async loadComments(poemId = currentPoemId, container = activeContainer || document) {
    const root = container || activeContainer || document;
    if (!poemId) return;
    if (commentsLoading || (commentsLoaded && poemId === currentPoemId)) return;
    commentsLoading = true;

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
      commentsLoaded = true;
    } catch (err) {
      error = err;
      console.error('Error loading comments:', err);
    } finally {
      commentsLoading = false;
    }

    const listEl = root.querySelector('#comments-list');
    if (!listEl) return;

    if (error) {
      listEl.innerHTML = '<p class="comments-error" style="font-style: italic; color: var(--text-secondary); font-size: 0.9rem;">Não foi possível carregar as notas agora.</p>';
      return;
    }

    if (comments.length === 0) {
      listEl.innerHTML = '<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>';
      return;
    }

    listEl.innerHTML = comments.map(c => `
      <div class="comment-item fade-in">
        <div class="comment-meta">
          <span class="comment-author">${escapeHtml(c.author_name)}</span>
          <span class="comment-date">${new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="comment-text">${escapeHtml(c.content)}</div>
      </div>
    `).join('');
  },

  init(container, poemId) {
    this.cleanup();
    activeContainer = container;
    currentPoemId = poemId;

    const toggleCommentBtn = container.querySelector('#toggle-comment-btn');
    const commentForm = container.querySelector('#comment-form');

    // RF01, RF02, RNF01, RNF04: Single click listener to open the form
    toggleCommentBtn?.addEventListener('click', () => {
      this.openForm(container);
    });

    // Submit Comment
    commentForm?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msgEl = container.querySelector('#comment-msg');
      if (msgEl) msgEl.textContent = '';

      // Honeypot check
      const website = container.querySelector('#comment-website')?.value;
      if (website) {
        toast.show('Sua nota foi enviada e aguarda moderação.', 'success');
        commentForm.reset();
        this.closeForm(container);
        return;
      }

      // Rate limit check
      const lastSubmit = localStorage.getItem('last_comment_time');
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
        const waitMsg = 'Por favor, aguarde 1 minuto entre os envios.';
        toast.show(waitMsg, 'error');
        if (msgEl) {
          msgEl.textContent = waitMsg;
          msgEl.style.color = 'var(--text-error, #e53e3e)';
        }
        return;
      }

      const authorInput = container.querySelector('#comment-author');
      const contentInput = container.querySelector('#comment-content');
      const author = authorInput?.value.trim();
      const content = contentInput?.value.trim();

      if (!author || !content) {
        const invalidMsg = 'Preencha os campos corretamente.';
        toast.show(invalidMsg, 'error');
        if (msgEl) {
          msgEl.textContent = invalidMsg;
          msgEl.style.color = 'var(--text-error, #e53e3e)';
        }
        return;
      }

      const btn = container.querySelector('#submit-comment-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Enviando...';
      }

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

      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Enviar Nota';
      }

      if (error) {
        const errorText = 'Erro ao enviar comentário.';
        toast.show(errorText, 'error');
        if (msgEl) {
          msgEl.textContent = errorText;
          msgEl.style.color = 'var(--text-error, #e53e3e)';
        }
      } else {
        toast.show('Sua nota foi enviada e aguarda moderação.', 'success');
        commentForm.reset();
        this.closeForm(container);
      }
    });
  },

  cleanup() {
    currentPoemId = null;
    commentsLoading = false;
    commentsLoaded = false;
    activeContainer = null;
  }
};
