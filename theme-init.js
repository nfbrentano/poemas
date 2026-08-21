(function () {
  // Anti-clickjacking (Framebusting) protection
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (e) {
    try {
      window.location.replace(window.location.href);
    } catch (_) {}
  }

  // Trusted Types default policy registration
  try {
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      if (!window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', {
          createHTML: function (string) {
            return string;
          },
          createScript: function (string) {
            return string;
          },
          createScriptURL: function (string) {
            return string;
          }
        });
      }
    }
  } catch (e) {}

  // Theme initialization
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
