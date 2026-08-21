(function () {
  try {
    var saved = localStorage.getItem('site-mode');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = saved || (prefersDark ? 'dark' : 'light');
    if (mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (mode === 'contrast') {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    }
  } catch (e) {}
})();
