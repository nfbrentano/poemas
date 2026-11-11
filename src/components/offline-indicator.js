/**
 * Componente de aviso discreto de conectividade offline (RF03, CA03, RF05, CA05)
 */
let indicatorEl = null;
let initialized = false;

export const offlineIndicator = {
  render() {
    return `
      <div id="offline-indicator" class="offline-indicator" role="status" aria-live="polite" hidden>
        <span class="offline-indicator-icon" aria-hidden="true">📡</span>
        <span class="offline-indicator-text">Você está navegando em modo offline. O acervo local continua disponível para leitura.</span>
      </div>
    `;
  },

  updateStatus(isOnline) {
    if (!indicatorEl && typeof document !== 'undefined') {
      indicatorEl = document.getElementById('offline-indicator');
    }
    if (!indicatorEl) return;

    if (isOnline) {
      indicatorEl.hidden = true;
      indicatorEl.classList.remove('is-active');
    } else {
      indicatorEl.hidden = false;
      indicatorEl.classList.add('is-active');
    }
  },

  init() {
    if (typeof document === 'undefined') return;

    // Se o elemento não existe ainda no DOM (ex.: SPA ou SSR), cria e insere logo antes do conteúdo principal
    if (!document.getElementById('offline-indicator')) {
      const el = document.createElement('div');
      el.id = 'offline-indicator';
      el.className = 'offline-indicator';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.hidden = true;

      const icon = document.createElement('span');
      icon.className = 'offline-indicator-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '📡';

      const text = document.createElement('span');
      text.className = 'offline-indicator-text';
      text.textContent = 'Você está navegando em modo offline. O acervo local continua disponível para leitura.';

      el.appendChild(icon);
      el.appendChild(document.createTextNode(' '));
      el.appendChild(text);

      const main = document.getElementById('main-content') || document.body.firstElementChild;
      if (main && main.parentNode) {
        main.parentNode.insertBefore(el, main);
      } else {
        document.body.prepend(el);
      }
    }

    indicatorEl = document.getElementById('offline-indicator');
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.updateStatus(isOnline);

    if (typeof window !== 'undefined' && !initialized) {
      initialized = true;

      window.addEventListener('online', async () => {
        this.updateStatus(true);
        // RF05 & CA05: Ao voltar a conexão, revalida e atualiza acervo local
        try {
          const { getPublishedPoems } = await import('../utils/poems-store.js');
          await getPublishedPoems({ forceRefresh: true });
        } catch (e) {
          console.warn('[OfflineIndicator] Revalidação pós-conexão:', e);
        }
      });

      window.addEventListener('offline', () => {
        this.updateStatus(false);
      });
    }
  },

  cleanup() {
    indicatorEl = null;
    initialized = false;
  }
};
