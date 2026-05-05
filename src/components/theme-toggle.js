export const themeToggle = {
  currentMode: localStorage.getItem('site-mode') || 'dark',

  apply(mode) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-high-contrast');
    
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;

    const moon = btn.querySelector('.icon-moon');
    const sun = btn.querySelector('.icon-sun');
    const contrast = btn.querySelector('.icon-contrast');
    
    [moon, sun, contrast].forEach(el => el.style.display = 'none');

    if (mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      sun.style.display = 'block';
      btn.setAttribute('aria-label', 'Mudar para modo de alto contraste');
    } else if (mode === 'contrast') {
      document.documentElement.setAttribute('data-high-contrast', 'true');
      contrast.style.display = 'block';
      btn.setAttribute('aria-label', 'Mudar para modo escuro');
    } else {
      moon.style.display = 'block';
      btn.setAttribute('aria-label', 'Mudar para modo claro');
    }
    
    localStorage.setItem('site-mode', mode);
    this.currentMode = mode;
  },

  init() {
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;

    this.apply(this.currentMode);

    btn.addEventListener('click', () => {
      let nextMode;
      if (this.currentMode === 'dark') nextMode = 'light';
      else if (this.currentMode === 'light') nextMode = 'contrast';
      else nextMode = 'dark';
      
      this.apply(nextMode);
    });
  }
};
