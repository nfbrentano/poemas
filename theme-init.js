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
    
    var themeColors = {
      dark: '#050505',
      light: '#fdfdfd',
      sepia: '#f4ecd8',
      contrast: '#000000'
    };

    if (mode === 'light' || mode === 'sepia') {
      document.documentElement.setAttribute('data-theme', mode);
    } else if (mode === 'contrast') {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    }
    
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor && themeColors[mode]) {
      metaThemeColor.setAttribute('content', themeColors[mode]);
    }
  } catch (e) {}
})();
