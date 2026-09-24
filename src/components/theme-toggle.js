export const themeToggle = {
  currentMode: localStorage.getItem('site-mode') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

  apply(mode) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-high-contrast');
    
    if (mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (mode === 'sepia') {
      document.documentElement.setAttribute('data-theme', 'sepia');
    } else if (mode === 'contrast') {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    }
    
    this.currentMode = mode;
    
    const themeColors = {
      dark: '#050505',
      light: '#fdfdfd',
      sepia: '#f4ecd8',
      contrast: '#000000'
    };
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor && themeColors[mode]) {
      metaThemeColor.setAttribute('content', themeColors[mode]);
    }
    
    const btn = document.getElementById('mode-toggle');
    if (btn) {
      const moon = btn.querySelector('.icon-moon');
      const sun = btn.querySelector('.icon-sun');
      const sepia = btn.querySelector('.icon-sepia');
      const contrast = btn.querySelector('.icon-contrast');
      
      if (moon && sun && contrast) {
        [moon, sun, sepia, contrast].forEach(el => {
          if (el) el.style.display = 'none';
        });

        if (mode === 'light') {
          sun.style.display = 'block';
          btn.setAttribute('aria-label', 'Mudar para modo sépia');
        } else if (mode === 'sepia') {
          if (sepia) sepia.style.display = 'block';
          btn.setAttribute('aria-label', 'Mudar para modo de alto contraste');
        } else if (mode === 'contrast') {
          contrast.style.display = 'block';
          btn.setAttribute('aria-label', 'Mudar para modo escuro');
        } else {
          moon.style.display = 'block';
          btn.setAttribute('aria-label', 'Mudar para modo claro');
        }
      }
    }

    // update mobile label and active buttons
    const label = document.getElementById('current-theme-label');
    if (label) {
      const names = { light: 'Claro', dark: 'Escuro', sepia: 'Sépia', contrast: 'Alto Contraste' };
      label.textContent = `Tema: ${names[mode] || 'Automático'}`;
    }
    
    document.querySelectorAll('.btn-theme-select').forEach(el => {
      if (el.dataset.theme === mode) {
        el.classList.add('active');
        el.style.borderColor = 'var(--text-primary)';
        el.style.backgroundColor = 'var(--bg-secondary)';
      } else {
        el.classList.remove('active');
        el.style.borderColor = 'var(--border-subtle)';
        el.style.backgroundColor = 'transparent';
      }
    });
  },

  init() {
    // Apply initial theme
    this.apply(this.currentMode);

    const btn = document.getElementById('mode-toggle');

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // Only auto-update if the user hasn't explicitly set a preference in this session/localStorage
      if (!localStorage.getItem('site-mode')) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });

    if (btn) {
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

    document.querySelectorAll('.btn-theme-select').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.theme;
        localStorage.setItem('site-mode', mode);
        this.apply(mode);
      });
    });
  }
};

