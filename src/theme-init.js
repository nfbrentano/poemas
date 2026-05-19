(function() {
  const saved = localStorage.getItem('site-mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = saved || (prefersDark ? 'dark' : 'light');
  if (mode === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (mode === 'contrast') {
    document.documentElement.setAttribute('data-high-contrast', 'true');
  }
})();
