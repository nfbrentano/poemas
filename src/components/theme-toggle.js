export const themeToggle = {
  currentMode: localStorage.getItem('site-mode') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

  apply(mode) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-high-contrast');
    
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;

    const moon = btn.querySelector('.icon-moon');
    const sun = btn.querySelector('.icon-sun');
    const sepia = btn.querySelector('.icon-sepia');
    const contrast = btn.querySelector('.icon-contrast');
    
    if (moon && sun && contrast) {
      [moon, sun, sepia, contrast].forEach(el => {
        if (el) el.style.display = 'none';
      });

      if (mode === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        sun.style.display = 'block';
        btn.setAttribute('aria-label', 'Mudar para modo sépia');
      } else if (mode === 'sepia') {
        document.documentElement.setAttribute('data-theme', 'sepia');
        if (sepia) sepia.style.display = 'block';
        btn.setAttribute('aria-label', 'Mudar para modo de alto contraste');
      } else if (mode === 'contrast') {
        document.documentElement.setAttribute('data-high-contrast', 'true');
        contrast.style.display = 'block';
        btn.setAttribute('aria-label', 'Mudar para modo escuro');
      } else {
        moon.style.display = 'block';
        btn.setAttribute('aria-label', 'Mudar para modo claro');
      }
    }
    
    this.currentMode = mode;
  },

  init() {
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;

    // Apply initial theme
    this.apply(this.currentMode);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // Only auto-update if the user hasn't explicitly set a preference in this session/localStorage
      if (!localStorage.getItem('site-mode')) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });

    btn.addEventListener('click', () => {
      let nextMode;
      if (this.currentMode === 'dark') nextMode = 'light';
      else if (this.currentMode === 'light') nextMode = 'sepia';
      else if (this.currentMode === 'sepia') nextMode = 'contrast';
      else nextMode = 'dark';
      
      localStorage.setItem('site-mode', nextMode);
      this.apply(nextMode);
    });
  }
};

