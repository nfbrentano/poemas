import { updateSEO, setNotFoundSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';
import { escapeHtml, stripHtml, sanitizeUrl } from '../utils/html.js';
import { toast } from '../components/toast.js';
import { AudioPlayer } from '../components/audio-player.js';
import { ImmersiveReader } from '../components/immersive-reader.js';
import { renderPoemMarkup, EMOJIS } from '../utils/poem-template.js';

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Module-level variables to store removable handlers
let handleScroll = null;
let handleTouchStart = null;
let handleTouchEnd = null;
let handleKeydown = null;
let isExportingQuote = false;
let quoteText = '';

export default {
  meta: {
    title: 'Poema'
  },
  cleanup() {
    if (handleScroll) window.removeEventListener('scroll', handleScroll);
    if (handleTouchStart) document.removeEventListener('touchstart', handleTouchStart);
    if (handleTouchEnd) document.removeEventListener('touchend', handleTouchEnd);
    if (handleKeydown) document.removeEventListener('keydown', handleKeydown);
    
    ImmersiveReader.cleanup();
    AudioPlayer.cleanup();
    document.body.classList.remove('poem-page-active');

    handleScroll = null;
    handleTouchStart = null;
    handleTouchEnd = null;
    handleKeydown = null;
    isExportingQuote = false;
    quoteText = '';
  },
  async render(container, params) {
    document.body.classList.add('poem-page-active');
    const slug = params.slug;

    const currentRoute = '/poema/' + slug;
    const isPrerendered = container.getAttribute('data-prerendered') === currentRoute;
    let poem = null;
    let prevSlug = '';
    let nextSlug = '';
    let prevTitle = '';
    let nextTitle = '';
    let collectionsData = [];
    let relatedPoems = [];

    // RF01 & CA01 & CA02: Hydrate pre-rendered DOM without removing or skeleton
    if (isPrerendered) {
      const dataScript = document.getElementById('__DATA__');
      if (dataScript) {
        try {
          const parsed = JSON.parse(dataScript.textContent);
          poem = parsed.poem;
          prevSlug = parsed.prev?.slug || '';
          nextSlug = parsed.next?.slug || '';
          prevTitle = parsed.prev?.title || '';
          nextTitle = parsed.next?.title || '';
          collectionsData = parsed.collections || [];
          relatedPoems = parsed.related || [];
        } catch (e) {
          console.warn('[Poem] Failed to parse __DATA__:', e);
        }
      }
      container.removeAttribute('data-prerendered');
    }

    // If not prerendered (SPA navigation from another page): fetch Firestore
    if (!poem) {
      const skeletonHtml = `
        <div class="poem-container fade-in">
          <article class="single-poem">
            <header>
              <div class="skeleton skeleton-title-large" style="width: 70%;"></div>
              <div class="skeleton-row" style="width: 40%; margin: 0 auto;"></div>
            </header>
            
            <div class="poem-content">
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row" style="width: 85%;"></div>
              <div class="skeleton skeleton-row" style="width: 90%;"></div>
              <div class="skeleton skeleton-row" style="width: 75%;"></div>
              <div class="skeleton-row" style="height: 2rem; border: none;"></div>
              <div class="skeleton skeleton-row" style="width: 80%;"></div>
              <div class="skeleton skeleton-row"></div>
              <div class="skeleton skeleton-row" style="width: 70%;"></div>
            </div>
            
            <div class="poem-actions">
              <div class="skeleton" style="width: 140px; height: 3rem;"></div>
            </div>
          </article>
        </div>
      `;
      container.innerHTML = skeletonHtml;

      console.log('[Poem] Fetching slug:', slug);
      let error = null;

      try {
        const { db } = await import('../utils/firebase.js');
        const { collection, query, where, getDocs, limit, orderBy } = await import('firebase/firestore');

        const q = query(collection(db, 'poems'), where('slug', '==', slug), where('status', '==', 'published'), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          poem = { id: doc.id, ...doc.data() };

          // RF03 & CA03: Parallel queries for prev and next poems
          if (!poem.prev_slug || !poem.next_slug) {
            try {
              const prevQ = query(collection(db, 'poems'), where('status', '==', 'published'), where('published_at', '<', poem.published_at), orderBy('published_at', 'desc'), limit(1));
              const nextQ = query(collection(db, 'poems'), where('status', '==', 'published'), where('published_at', '>', poem.published_at), orderBy('published_at', 'asc'), limit(1));
              const [prevSnap, nextSnap] = await Promise.all([
                getDocs(prevQ).catch(e => { console.warn('Error fetching prev poem:', e); return null; }),
                getDocs(nextQ).catch(e => { console.warn('Error fetching next poem:', e); return null; })
              ]);

              if (prevSnap && !prevSnap.empty) {
                const prevDoc = prevSnap.docs[0].data();
                poem.prev_slug = prevDoc.slug;
                poem.prev_title = prevDoc.title;
              }
              if (nextSnap && !nextSnap.empty) {
                const nextDoc = nextSnap.docs[0].data();
                poem.next_slug = nextDoc.slug;
                poem.next_title = nextDoc.title;
              }
            } catch (e) {
              console.warn('Error in parallel prev/next query:', e);
            }
          }
        }
      } catch (err) {
        error = err;
        console.error('[Poem] Error:', error);
      }

      if (error || !poem) {
        console.warn('[Poem] Poem not found or error occurred');
        setNotFoundSEO();
        container.innerHTML = `
          <div class="not-found-page fade-in">
            <p class="not-found-label">404</p>
            <h2 class="not-found-title">Página não encontrada</h2>
            <p class="not-found-desc">O poema que você procura pode ter mudado de endereço ou ainda não foi publicado.</p>
            <a href="${import.meta.env.BASE_URL}" data-link class="not-found-link">← Voltar ao sumário</a>
          </div>
        `;
        return;
      }

      prevSlug = poem.prev_slug || '';
      nextSlug = poem.next_slug || '';
      prevTitle = poem.prev_title || '';
      nextTitle = poem.next_title || '';

      if (poem.collection_slugs && poem.collection_slugs.length > 0) {
        try {
          const { db } = await import('../utils/firebase.js');
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const qCols = query(collection(db, 'collections'), where('slug', 'in', poem.collection_slugs));
          const colsSnap = await getDocs(qCols);
          collectionsData = [];
          colsSnap.forEach(d => collectionsData.push(d.data()));
        } catch (e) {
          console.warn(e);
        }
      }

      // Render DOM
      container.innerHTML = renderPoemMarkup({
        poem,
        prevSlug,
        nextSlug,
        prevTitle,
        nextTitle,
        collectionsData,
        relatedPoems,
        baseUrl: import.meta.env.BASE_URL
      });
    }

    // Rastrear visualização do poema
    trackPageView('/poema/' + poem.slug, poem.id);

    // Update SEO dynamically
    const poemUrl = window.location.href;
    const cleanExcerpt = stripHtml(poem.excerpt || poem.content || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) + '...';

    const fallbackImageUrl = `${window.location.origin}${import.meta.env.BASE_URL}og-cover.jpg`;
    updateSEO({
      title: poem.title,
      description: cleanExcerpt,
      url: poemUrl,
      imageUrl: fallbackImageUrl,
      type: 'article',
      publishedTime: poem.published_at,
      tags: poem.tags
    });

    // Setup Intersection Observer para animação das estrofes
    const setupStanzaAnimation = () => {
      const prefersReducedMotion = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
      if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
        container.querySelectorAll('.stagger-reveal').forEach(el => el.classList.add('revealed'));
        return;
      }

      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0
      };

      const stanzaObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const windowHeight = window.innerHeight;
      container.querySelectorAll('.stagger-reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight) {
          el.classList.add('revealed');
        } else {
          el.classList.add('js-reveal-ready');
          stanzaObserver.observe(el);
        }
      });
    };

    setupStanzaAnimation();

    // Toggle Logic for Settings and Comments
    const toggleSettingsBtn = document.getElementById('mobile-reading-settings-btn');
    const settingsPanel = document.getElementById('poem-settings-panel');
    const settingsOverlay = document.getElementById('poem-settings-overlay');

    const closeSettings = () => {
      settingsPanel?.classList.remove('active');
      settingsOverlay?.classList.remove('active');
      toggleSettingsBtn?.focus();
    };

    toggleSettingsBtn?.addEventListener('click', () => {
      settingsPanel.classList.toggle('active');
      settingsOverlay.classList.toggle('active');
    });

    settingsOverlay?.addEventListener('click', closeSettings);

    let sheetTouchStartY = 0;
    settingsPanel?.addEventListener('touchstart', (e) => {
      sheetTouchStartY = e.touches[0].clientY;
    }, { passive: true });
    settingsPanel?.addEventListener('touchend', (e) => {
      const deltaY = e.changedTouches[0].clientY - sheetTouchStartY;
      if (deltaY > 50) { // swipe down
        closeSettings();
      }
    }, { passive: true });

    const toggleCommentBtn = document.getElementById('toggle-comment-btn');
    const commentForm = document.getElementById('comment-form');
    toggleCommentBtn?.addEventListener('click', () => {
      commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
      toggleCommentBtn.style.display = 'none';
    });

    // Sharing Logic
    const shareUrl = window.location.href;
    const shareText = `Leia "${poem.title}", um poema de Natanael Brentano:`;

    document.querySelectorAll('[data-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        let url = '';
        if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    const shareNativeContainer = document.getElementById('share-native');
    const shareFallbackContainer = document.getElementById('share-fallback');

    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      shareNativeContainer.style.display = 'flex';
      document.getElementById('web-share-btn')?.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: poem.title,
            text: shareText,
            url: shareUrl
          });
        } catch (err) {}
      });
    } else {
      shareFallbackContainer.style.display = 'flex';
      document.getElementById('copy-link-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast.show('Link copiado para a área de transferência!', 'success');
        });
      });
    }

    // Typography Controls Logic
    const sizeBtns = container.querySelectorAll('.size-btn');
    const familyBtns = container.querySelectorAll('.family-btn');
    const heightBtns = container.querySelectorAll('.height-btn');
    const alignBtns = container.querySelectorAll('.align-btn');

    const updateActiveBtns = (btns, val) => {
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.size === val || btn.dataset.family === val || btn.dataset.height === val || btn.dataset.align === val));
    };

    // Load preferences
    const currentFontSize = localStorage.getItem('reading-font-size') || 'md';
    const currentFontFamily = localStorage.getItem('reading-font-family') || 'serif';
    const currentLineHeight = localStorage.getItem('reading-line-height') || 'normal';
    const currentAlignment = localStorage.getItem('reading-alignment') || 'center';

    // Apply initial classes
    document.documentElement.classList.remove('font-reading-sm', 'font-reading-md', 'font-reading-lg');
    document.documentElement.classList.add(`font-reading-${currentFontSize}`);
    document.documentElement.classList.remove('font-family-serif', 'font-family-sans', 'font-family-hand');
    document.documentElement.classList.add(`font-family-${currentFontFamily}`);
    document.documentElement.classList.remove('line-height-normal', 'line-height-relaxed');
    document.documentElement.classList.add(`line-height-${currentLineHeight}`);
    document.documentElement.classList.remove('align-reading-left', 'align-reading-center');
    document.documentElement.classList.add(`align-reading-${currentAlignment}`);

    updateActiveBtns(sizeBtns, currentFontSize);
    updateActiveBtns(familyBtns, currentFontFamily);
    updateActiveBtns(heightBtns, currentLineHeight);
    updateActiveBtns(alignBtns, currentAlignment);

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        document.documentElement.classList.remove('font-reading-sm', 'font-reading-md', 'font-reading-lg');
        document.documentElement.classList.add(`font-reading-${size}`);
        localStorage.setItem('reading-font-size', size);
        updateActiveBtns(sizeBtns, size);
      });
    });

    familyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const family = btn.dataset.family;
        document.documentElement.classList.remove('font-family-serif', 'font-family-sans', 'font-family-hand');
        document.documentElement.classList.add(`font-family-${family}`);
        localStorage.setItem('reading-font-family', family);
        updateActiveBtns(familyBtns, family);
      });
    });

    heightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const height = btn.dataset.height;
        document.documentElement.classList.remove('line-height-normal', 'line-height-relaxed');
        document.documentElement.classList.add(`line-height-${height}`);
        localStorage.setItem('reading-line-height', height);
        updateActiveBtns(heightBtns, height);
      });
    });

    alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.dataset.align;
        document.documentElement.classList.remove('align-reading-left', 'align-reading-center');
        document.documentElement.classList.add(`align-reading-${align}`);
        localStorage.setItem('reading-alignment', align);
        updateActiveBtns(alignBtns, align);
      });
    });

    // Audio Player Logic
    AudioPlayer.init(container, import.meta.env.BASE_URL);

    // Immersive Mode Logic
    ImmersiveReader.init(container);

    // Highlight Tooltip & Gestures Logic
    const poemText = document.getElementById('poem-text');
    let lastTap = 0;

    poemText?.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300 && now - lastTap > 0) {
        const reactionBtn = document.querySelector('.reaction-btn[data-emoji="❤️"]');
        if (reactionBtn && !reactionBtn.classList.contains('active')) {
          reactionBtn.click();
        }
        showHeartAnimation(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        );
      }
      lastTap = now;
    }, { passive: true });

    function showHeartAnimation(x, y) {
      const heart = document.createElement('span');
      heart.textContent = '♥';
      heart.style.cssText = `
        position:fixed; left:${x}px; top:${y}px;
        font-size:3rem; color:var(--accent-subtle);
        pointer-events:none; z-index:9999;
        animation: heartFloat 0.8s ease forwards;
        transform: translate(-50%,-50%);
        text-shadow: 0 0 10px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 800);
    }

    const tooltip = document.getElementById('highlight-tooltip');
    let selectedText = '';

    const mobileShareSelectionBtn = document.getElementById('mobile-share-selection-btn');
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        tooltip?.classList.remove('visible');
        if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
        return;
      }
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.add('visible');
        } else if (tooltip) {
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top + window.scrollY}px`;
          tooltip.classList.add('visible');
        }
      } else {
        tooltip?.classList.remove('visible');
        if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
      }
    };

    poemText?.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection.isCollapsed) {
        tooltip?.classList.remove('visible');
        if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
      }
    });

    mobileShareSelectionBtn?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: poem.title,
            text: `"${selectedText}" — Natanael Brentano`,
            url: window.location.href
          });
        } catch (err) {}
      } else {
        const textToShare = `"${selectedText}" — Natanael Brentano\n${window.location.href}`;
        navigator.clipboard.writeText(textToShare).then(() => {
          toast.show('Trecho copiado!', 'success');
        });
      }
      window.getSelection().removeAllRanges();
      mobileShareSelectionBtn.classList.remove('visible');
    });

    document.getElementById('highlight-copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(selectedText).then(() => {
        toast.show('Trecho copiado para a área de transferência!', 'success');
        window.getSelection().removeAllRanges();
        tooltip?.classList.remove('visible');
      });
    });

    document.getElementById('highlight-share-btn')?.addEventListener('click', () => {
      const textToShare = `"${selectedText}" — Natanael Brentano\n${window.location.href}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      window.getSelection().removeAllRanges();
      tooltip?.classList.remove('visible');
    });

    const showCardPreview = () => {
      window.getSelection().removeAllRanges();
      tooltip?.classList.remove('visible');
      if (mobileShareSelectionBtn) mobileShareSelectionBtn.classList.remove('visible');
      isExportingQuote = true;
      quoteText = selectedText || stripHtml(poem.content).substring(0, 150) + '...';
      const previewModal = document.getElementById('card-preview-modal');
      if (previewModal) {
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    };
    document.getElementById('highlight-card-btn')?.addEventListener('click', showCardPreview);

    // Atalhos de teclado
    handleKeydown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch(e.key) {
        case 'Escape':
          if (document.getElementById('poem-settings-panel')?.classList.contains('active')) {
            closeSettings();
          } else if (document.documentElement.classList.contains('immersive-mode')) {
            document.getElementById('immersive-exit-btn')?.click();
          }
          break;
        case 'ArrowRight':
          if (nextSlug) navigateTo(`/poema/${nextSlug}`);
          break;
        case 'ArrowLeft':
          if (prevSlug) navigateTo(`/poema/${prevSlug}`);
          break;
        case 'i':
        case 'I':
          if (document.documentElement.classList.contains('immersive-mode')) {
            document.getElementById('immersive-exit-btn')?.click();
          } else {
            document.getElementById('immersive-btn')?.click();
          }
          break;
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Scroll logic (Progress bar + sequential nav)
    const scrollBar = document.getElementById('scroll-bar');
    const poemNav = document.querySelector('.poem-nav');
    const nextBtn = document.getElementById('next-btn');
    let showedNext = false;

    handleScroll = throttle(() => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (scrollBar) scrollBar.style.width = scrolled + "%";

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (poemNav) {
        if (scrollTop > 50) {
          poemNav.classList.add('visible');
        } else {
          poemNav.classList.remove('visible');
        }
      }

      if (scrollTop + clientHeight > scrollHeight * 0.90 && nextSlug && !showedNext) {
        showedNext = true;
        if (nextBtn) nextBtn.style.transform = 'scale(1.05)';
        setTimeout(() => { if (nextBtn) nextBtn.style.transform = 'scale(1)'; }, 200);
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Touch swipe mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    handleTouchStart = e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };
    handleTouchEnd = e => {
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const elapsedTime = Date.now() - touchStartTime;

      if (elapsedTime <= 500 && Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY) * 3) {
        if (deltaX > 0 && nextSlug) navigateTo(`/poema/${nextSlug}`);
        else if (deltaX < 0 && prevSlug) navigateTo(`/poema/${prevSlug}`);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Click handlers
    nextBtn?.addEventListener('click', () => {
      if (nextSlug) navigateTo(`/poema/${nextSlug}`);
    });
    document.getElementById('prev-btn')?.addEventListener('click', () => {
      if (prevSlug) navigateTo(`/poema/${prevSlug}`);
    });

    // Newsletter form logic
    newsletter.init();

    // Card Export Preview Modal Logic
    const shareCardBtnMobile = document.getElementById('share-card-btn-mobile');
    const shareCardBtnDesktop = document.getElementById('share-card-btn-desktop');
    const previewModal = document.getElementById('card-preview-modal');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const themeBtns = container.querySelectorAll('.preview-theme-btn');
    const ratioBtns = container.querySelectorAll('.preview-ratio-btn');
    let selectedExportTheme = 'dark';
    let selectedExportRatio = 'feed';

    const openExportModal = () => {
      if (previewModal) {
        isExportingQuote = false;
        quoteText = '';
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    };
    shareCardBtnMobile?.addEventListener('click', openExportModal);
    shareCardBtnDesktop?.addEventListener('click', openExportModal);

    closePreviewBtn?.addEventListener('click', () => {
      if (previewModal) {
        previewModal.style.display = 'none';
        previewModal.classList.remove('active');
      }
    });

    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedExportTheme = btn.dataset.theme;
      });
    });

    ratioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        ratioBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--border-subtle)';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--border-strong)';
        selectedExportRatio = btn.dataset.ratio;
      });
    });

    downloadCardBtn?.addEventListener('click', async () => {
      downloadCardBtn.innerText = 'Gerando...';
      downloadCardBtn.disabled = true;
      try {
        const { generateSocialCard } = await import('../utils/social-export.js');
        const textToExport = isExportingQuote ? quoteText : null;
        await generateSocialCard(poem, document.getElementById('social-card-container'), selectedExportTheme, textToExport, selectedExportRatio);
        toast.show('Card gerado com sucesso!', 'success');
      } catch (err) {
        console.error(err);
        toast.show('Erro ao gerar card.', 'error');
      } finally {
        downloadCardBtn.innerText = 'Baixar Imagem';
        downloadCardBtn.disabled = false;
        isExportingQuote = false;
        quoteText = '';
        if (previewModal) {
          previewModal.style.display = 'none';
          previewModal.classList.remove('active');
        }
      }
    });

    // Setup Admin async if logged in
    const setupAdmin = async () => {
      if (localStorage.getItem('has_admin_session') !== '1') return;

      try {
        const { getFirebaseAuth } = await import('../utils/firebase.js');
        const auth = await getFirebaseAuth();
        const initUI = () => {
          if (!auth.currentUser) {
            localStorage.removeItem('has_admin_session');
            return;
          }
          const adminSlot = document.getElementById('poem-admin-actions');
          if (adminSlot) {
            adminSlot.innerHTML = `
              <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${poem.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `;
            const resendBtn = document.getElementById('resend-email-btn');
            if (resendBtn) {
              resendBtn.addEventListener('click', async () => {
                if (!confirm('Deseja realmente reenviar o email desta obra para todos os assinantes?')) return;
                resendBtn.innerText = 'Enviando...';
                resendBtn.disabled = true;
                try {
                  const { getFirebaseFunctions } = await import('../utils/firebase.js');
                  const { httpsCallable } = await import('firebase/functions');
                  const functions = await getFirebaseFunctions();
                  const callable = httpsCallable(functions, 'sendNewsletter');
                  const result = await callable({ poemId: poem.id });
                  alert(`Email reenviado com sucesso para ${result.data?.count || 0} assinantes!`);
                } catch(err) {
                  console.error('Newsletter erro:', err);
                  alert(`Houve um erro ao reenviar a newsletter: ${err.message || 'Erro'}`);
                } finally {
                  resendBtn.innerText = 'Reenviar Email';
                  resendBtn.disabled = false;
                }
              });
            }
          }
        };

        if (auth.currentUser) {
          initUI();
        } else {
          auth.authStateReady().then(() => initUI()).catch(() => {});
        }
      } catch (_) {}
    };
    setupAdmin();

    // RF02: Load reactions and comments deferred after idle or timeout
    const loadDeferredFeatures = () => {
      // 1. Reactions
      import('../utils/reactions.js').then(({ loadReactions, toggleReaction, EMOJIS }) => {
        const updateReactionUI = (counts, userReactions) => {
          EMOJIS.forEach(emoji => {
            const btn = container.querySelector(`.reaction-btn[data-emoji="${emoji}"]`);
            const countEl = container.querySelector(`.reaction-count[data-count="${emoji}"]`);
            if (btn) btn.classList.toggle('reacted', userReactions.has(emoji));
            if (countEl) countEl.textContent = counts[emoji] || 0;
          });
        };

        loadReactions(poem.id).then(({ counts, userReactions }) => {
          updateReactionUI(counts, userReactions);
        }).catch(() => {});

        container.querySelectorAll('.reaction-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const emoji = btn.dataset.emoji;
            btn.disabled = true;
            await toggleReaction(poem.id, emoji);
            const { counts: newCounts, userReactions: newUR } = await loadReactions(poem.id);
            updateReactionUI(newCounts, newUR);

            btn.classList.add('reacted');
            setTimeout(() => {
              btn.style.animation = 'none';
              btn.offsetHeight;
              btn.style.animation = null;
            }, 10);

            btn.disabled = false;
          });
        });
      }).catch(err => console.debug?.('[reactions]', err));

      // 2. Comments
      import('../components/poem-comments.js').then(({ PoemComments }) => {
        PoemComments.init(container, poem.id);
      }).catch(err => console.debug?.('[comments]', err));

      // 3. Related poems (only if not pre-rendered)
      if ((!relatedPoems || relatedPoems.length === 0) && poem.tags && poem.tags.length > 0) {
        (async () => {
          try {
            const { db } = await import('../utils/firebase.js');
            const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
            const searchTags = poem.tags.slice(0, 10);
            const relatedQ = query(
              collection(db, 'poems'),
              where('status', '==', 'published'),
              where('tags', 'array-contains-any', searchTags),
              limit(20)
            );
            const relatedSnap = await getDocs(relatedQ);
            let relatedDocs = [];
            relatedSnap.forEach(d => {
              if (d.id !== poem.id) {
                relatedDocs.push({ id: d.id, ...d.data() });
              }
            });

            if (relatedDocs.length > 0) {
              relatedDocs.forEach(d => {
                d._commonTags = (d.tags || []).filter(t => poem.tags.includes(t)).length;
                d._sameCollection = 0;
                if (poem.collection_slugs && d.collection_slugs) {
                  d._sameCollection = d.collection_slugs.some(c => poem.collection_slugs.includes(c)) ? 1 : 0;
                }
              });

              relatedDocs.sort((a, b) => {
                if (b._commonTags !== a._commonTags) return b._commonTags - a._commonTags;
                if (b._sameCollection !== a._sameCollection) return b._sameCollection - a._sameCollection;
                return b.published_at.localeCompare(a.published_at);
              });

              const top3 = relatedDocs.slice(0, 3);
              if (top3.length > 0) {
                const relatedList = document.getElementById('related-poems-list');
                if (relatedList) {
                  relatedList.innerHTML = top3.map(r => `
                    <a href="${import.meta.env.BASE_URL}poema/${r.slug}" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
                      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${escapeHtml(r.title)}</h3>
                      ${r.excerpt ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${escapeHtml(stripHtml(r.excerpt).substring(0, 100))}...</p>` : ''}
                    </a>
                  `).join('');
                  const sec = document.getElementById('related-poems-section');
                  if (sec) sec.style.display = 'block';
                }
              }
            }
          } catch (e) {
            console.warn('Error fetching related poems:', e);
          }
        })();
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadDeferredFeatures, { timeout: 3000 });
    } else {
      setTimeout(loadDeferredFeatures, 1000);
    }

    // Prefetch adjacent routes
    const prefetchRoutes = () => {
      const BASE_URL = import.meta.env.BASE_URL;
      const slugsToPrefetch = [prevSlug, nextSlug].filter(Boolean);

      slugsToPrefetch.forEach(s => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `${window.location.origin}${BASE_URL}poema/${s}`;
        document.head.appendChild(link);
      });
    };
    setTimeout(prefetchRoutes, 2000);
  }
};
