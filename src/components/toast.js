export const toast = {
  init() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
  },

  show(message, type = 'default', duration = 3000) {
    this.init();
    const container = document.getElementById('toast-container');
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast-message toast-${type}`;
    
    // Icon based on type
    let icon = '';
    if (type === 'success') icon = '✓ ';
    if (type === 'error') icon = '⚠ ';
    if (type === 'info') icon = 'ℹ ';
    if (type === 'heart') icon = '♥ ';
    
    toastEl.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message}</span>`;
    
    container.appendChild(toastEl);
    
    // Trigger reflow for animation
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    
    setTimeout(() => {
      toastEl.classList.remove('show');
      toastEl.addEventListener('transitionend', () => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      });
    }, duration);
  }
};
