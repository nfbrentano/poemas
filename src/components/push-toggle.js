import { pushManager } from '../utils/push.js';

export const pushToggle = {
  render() {
    return `
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
    `;
  },

  async init(container) {
    const btn = container.querySelector('#push-toggle-btn');
    const msg = container.querySelector('#push-message');
    if (!btn) return;

    const updateUI = async () => {
      const sub = await pushManager.getSubscription();
      if (sub) {
        btn.classList.add('subscribed');
        btn.querySelector('.push-status-text').textContent = 'Notificações Ativas';
        btn.querySelector('.push-status-icon').textContent = '🔕';
      } else {
        btn.classList.remove('subscribed');
        btn.querySelector('.push-status-text').textContent = 'Ativar Notificações';
        btn.querySelector('.push-status-icon').textContent = '🔔';
      }
    };

    await updateUI();

    btn.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        const sub = await pushManager.getSubscription();
        if (sub) {
          await pushManager.unsubscribe();
          msg.textContent = 'Notificações desativadas.';
        } else {
          await pushManager.subscribe();
          msg.textContent = 'Você receberá avisos sobre novos poemas!';
        }
        await updateUI();
      } catch (err) {
        console.error(err);
        msg.textContent = 'Erro ao configurar notificações. Verifique as permissões do navegador.';
      } finally {
        btn.disabled = false;
        setTimeout(() => { msg.textContent = ''; }, 5000);
      }
    });
  }
};
