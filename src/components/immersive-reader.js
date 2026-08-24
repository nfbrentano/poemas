export const ImmersiveReader = {
  init(container) {
    const immersiveBtn = document.getElementById('immersive-btn');
    const immersiveExitBtn = document.getElementById('immersive-exit-btn');
    const sizeSlider = document.getElementById('immersive-size-slider');
    const sizeValue = document.getElementById('immersive-size-value');
    const heightSlider = document.getElementById('immersive-height-slider');
    const heightValue = document.getElementById('immersive-height-value');
    const poemTextEl = document.getElementById('poem-text');

    // Load initial values from localStorage or default
    const savedImmersiveSize = localStorage.getItem('immersive-reading-font-size') || '20';
    const savedImmersiveHeight = localStorage.getItem('immersive-reading-line-height') || '22';

    // Apply values to css custom properties on the poem text element
    if (poemTextEl) {
      poemTextEl.style.setProperty('--immersive-font-size', `${savedImmersiveSize}px`);
      poemTextEl.style.setProperty('--immersive-line-height', `${parseFloat(savedImmersiveHeight) / 10}`);
    }

    if (sizeSlider && sizeValue) {
      sizeSlider.value = savedImmersiveSize;
      sizeValue.textContent = `${savedImmersiveSize}px`;
      sizeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        sizeValue.textContent = `${val}px`;
        poemTextEl?.style.setProperty('--immersive-font-size', `${val}px`);
        localStorage.setItem('immersive-reading-font-size', val);
      });
    }

    if (heightSlider && heightValue) {
      heightSlider.value = savedImmersiveHeight;
      heightValue.textContent = `${(parseFloat(savedImmersiveHeight) / 10).toFixed(1)}`;
      heightSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const lh = (parseFloat(val) / 10).toFixed(1);
        heightValue.textContent = lh;
        poemTextEl?.style.setProperty('--immersive-line-height', lh);
        localStorage.setItem('immersive-reading-line-height', val);
      });
    }

    const enterImmersive = () => {
      document.documentElement.classList.add('immersive-mode');
      
      // Show gesture hint on first time
      const hintShown = localStorage.getItem('immersive-hint-shown');
      if (!hintShown) {
        const hint = document.getElementById('immersive-hint');
        if (hint) {
          hint.classList.add('visible');
          setTimeout(() => {
            hint.classList.remove('visible');
            localStorage.setItem('immersive-hint-shown', 'true');
          }, 3000);
        }
      }
    };

    const exitImmersive = () => {
      document.documentElement.classList.remove('immersive-mode');
    };

    immersiveBtn?.addEventListener('click', enterImmersive);
    immersiveExitBtn?.addEventListener('click', exitImmersive);
  },

  cleanup() {
    document.documentElement.classList.remove('immersive-mode');
  }
};
