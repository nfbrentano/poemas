export const newsletter = {
  render() {
    return `
      <section class="newsletter-section fade-in">
        <h2 class="newsletter-title">Um pedacinho de mim para você</h2>
        <p class="newsletter-description">
          Receba novos poemas, devaneios e o compilado do mês direto na sua caixa de entrada. Sem spam, apenas palavras sinceras.
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
      const submitBtn = subForm.querySelector('button[type="submit"]');
      const email = emailInput.value.trim().toLowerCase();
      const msgEl = document.getElementById('subscribe-message');
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        msgEl.innerHTML = 'Por favor, insira um e-mail válido.';
        msgEl.style.color = 'var(--error)';
        return;
      }

      msgEl.innerHTML = 'Enviando...';
      msgEl.style.color = 'var(--text-secondary)';
      submitBtn.disabled = true;
      
      try {
        const { db } = await import('../utils/firebase.js');
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'subscribers', email), { 
          email, 
          created_at: new Date().toISOString() 
        });
        msgEl.innerHTML = 'Obrigado por assinar.';
        msgEl.style.color = 'var(--success)';
        subForm.reset();
      } catch (err) {
        if (err.code === 'permission-denied') {
          msgEl.innerHTML = 'Este e-mail já está inscrito.';
          msgEl.style.color = 'var(--text-secondary)';
        } else {
          msgEl.innerHTML = 'Erro ao inscrever. Tente novamente.';
          msgEl.style.color = 'var(--error)';
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
};
