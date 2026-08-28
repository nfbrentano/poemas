import { db } from '../utils/firebase.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export const newsletter = {
  render() {
    return `
      <section class="newsletter-section fade-in">
        <h2 class="newsletter-title">O Eco das Palavras</h2>
        <p class="newsletter-description">
          Receba ocasionalmente novos poemas e devaneios direto na sua caixa de entrada. Sem spam, apenas poesia.
        </p>
        <form id="subscribe-form" class="subscribe-form" aria-label="Assinar newsletter">
          <input type="email" id="subscriber-email" class="subscribe-input" placeholder="Endereço de e-mail" required aria-label="Endereço de e-mail para newsletter">
          <button type="submit" class="subscribe-button">Assinar</button>
        </form>
        <div id="subscribe-message" class="subscribe-message" aria-live="polite"></div>
      </section>
    `;
  },

  init() {
    const subForm = document.getElementById('subscribe-form');
    if (!subForm) return;

    subForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('subscriber-email');
      const email = emailInput.value;
      const msgEl = document.getElementById('subscribe-message');
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        msgEl.innerHTML = 'Por favor, insira um e-mail válido.';
        msgEl.style.color = 'var(--error)';
        return;
      }

      msgEl.innerHTML = 'Enviando...';
      msgEl.style.color = 'var(--text-secondary)';
      
      try {
        const q = query(collection(db, 'subscribers'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          msgEl.innerHTML = 'Este e-mail já está inscrito.';
          msgEl.style.color = 'var(--text-secondary)';
        } else {
          await addDoc(collection(db, 'subscribers'), { email, created_at: new Date().toISOString() });
          msgEl.innerHTML = 'Obrigado por assinar.';
          msgEl.style.color = 'var(--success)';
          subForm.reset();
        }
      } catch (err) {
        msgEl.innerHTML = 'Erro ao inscrever. Tente novamente.';
        msgEl.style.color = 'var(--error)';
      }
    });
  }
};
