import { supabase } from '../utils/supabase.js';

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
      
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      
      if (!error || error.code === '23505') {
        // Chamar a Edge Function para registrar no Loops
        try {
          const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/loops-subscribe`;
          await fetch(fnUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ email })
          });
        } catch (e) {
          // Falha silenciosa no Loops não impede a confirmação ao usuário
          console.warn('Loops sync failed:', e);
        }

        msgEl.innerHTML = error?.code === '23505'
          ? 'Este e-mail já está inscrito.'
          : 'Obrigado por assinar.';
        msgEl.style.color = error?.code === '23505'
          ? 'var(--text-secondary)'
          : 'var(--success)';
        if (!error) subForm.reset();
      } else {
        msgEl.innerHTML = 'Erro ao inscrever. Tente novamente.';
        msgEl.style.color = 'var(--error)';
      }
    });
  }
};
