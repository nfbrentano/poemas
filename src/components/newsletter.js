export function getSubscribeEndpoint() {
  if (import.meta.env.VITE_FIREBASE_FUNCTIONS_URL) {
    const base = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL.replace(/\/$/, '');
    return `${base}/subscribeNewsletter`;
  }
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'poemas-natanael';
  return `https://southamerica-east1-${projectId}.cloudfunctions.net/subscribeNewsletter`;
}

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
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const msgEl = document.getElementById('subscribe-message');
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (msgEl) {
          msgEl.textContent = 'Por favor, insira um e-mail válido.';
          msgEl.style.color = 'var(--error)';
        }
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        if (msgEl) {
          msgEl.textContent = 'Você está offline. Conecte-se à internet para assinar a newsletter.';
          msgEl.style.color = 'var(--text-secondary)';
        }
        return;
      }

      if (msgEl) {
        msgEl.textContent = 'Enviando...';
        msgEl.style.color = 'var(--text-secondary)';
      }
      if (submitBtn) submitBtn.disabled = true;
      
      try {
        const endpoint = getSubscribeEndpoint();
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          if (data.status === 'already_subscribed') {
            if (msgEl) {
              msgEl.textContent = 'Este e-mail já está inscrito.';
              msgEl.style.color = 'var(--text-secondary)';
            }
          } else {
            if (msgEl) {
              msgEl.textContent = data.message || 'Obrigado por assinar.';
              msgEl.style.color = 'var(--success)';
            }
            subForm.reset();
          }
        } else if (res.status === 400) {
          if (msgEl) {
            msgEl.textContent = data.message || 'Por favor, insira um e-mail válido.';
            msgEl.style.color = 'var(--error)';
          }
        } else {
          if (msgEl) {
            msgEl.textContent = 'Erro ao inscrever. Tente novamente.';
            msgEl.style.color = 'var(--error)';
          }
        }
      } catch (_err) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          if (msgEl) {
            msgEl.textContent = 'Você está offline. Conecte-se à internet para assinar a newsletter.';
            msgEl.style.color = 'var(--text-secondary)';
          }
        } else {
          if (msgEl) {
            msgEl.textContent = 'Erro ao inscrever. Tente novamente.';
            msgEl.style.color = 'var(--error)';
          }
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
};
