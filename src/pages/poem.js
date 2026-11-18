import { updateSEO, setNotFoundSEO } from '../utils/seo.js';
import { poemSchema, breadcrumbSchema, SITE_URL } from '../utils/structured-data.js';
import { trackPageView } from '../utils/analytics.js';
import { navigateTo } from '../router.js';
import { newsletter } from '../components/newsletter.js';
import { escapeHtml, stripHtml, unwrapSafeHTML } from '../utils/html.js';
import { toast } from '../components/toast.js';
import { AudioPlayer } from '../components/audio-player.js';
import { ImmersiveReader } from '../components/immersive-reader.js';
import { PoemComments } from '../components/poem-comments.js';
import { renderPoemMarkup, renderSeriesBannerMarkup, renderPoemNavInnerMarkup } from '../utils/poem-template.js';
import { resolveCollectionContextForPoem } from '../utils/collection-order.js';
import { isFavorite, toggleFavorite } from '../utils/favorites.js';
import { recordReading } from '../utils/reading-history.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
let handleSelectionChange = null;
let isExportingQuote = false;
let quoteText = '';
let readingTimer = null;
let deferredTimer = null;
let deferredIdleId = null;
let prefetchTimer = null;

export default {
  meta: {
    title: 'Poema'
  },
  cleanup() {
    if (readingTimer) {
      clearTimeout(readingTimer);
      readingTimer = null;
    }
    if (deferredTimer) {
      clearTimeout(deferredTimer);
      deferredTimer = null;
    }
    if (prefetchTimer) {
      clearTimeout(prefetchTimer);
      prefetchTimer = null;
    }
    if (deferredIdleId !== null && typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(deferredIdleId);
      deferredIdleId = null;
    }
    if (handleScroll) window.removeEventListener('scroll', handleScroll);
    if (handleTouchStart) document.removeEventListener('touchstart', handleTouchStart);
    if (handleTouchEnd) document.removeEventListener('touchend', handleTouchEnd);
    if (handleKeydown) document.removeEventListener('keydown', handleKeydown);
    if (handleSelectionChange) document.removeEventListener('selectionchange', handleSelectionChange);
    
    ImmersiveReader.cleanup();
    AudioPlayer.cleanup();
    PoemComments.cleanup();
    document.body.classList.remove('poem-page-active');

    handleScroll = null;
    handleTouchStart = null;
    handleTouchEnd = null;
    handleKeydown = null;
    handleSelectionChange = null;
    isExportingQuote = false;
    quoteText = '';
  },
  async render(container, params) {
    document.body.classList.add('poem-page-active');
    const slug = params.slug;
    let requestedCollectionSlug = params?.colecao || '';
    if (!requestedCollectionSlug && typeof window !== 'undefined') {
      try {
        requestedCollectionSlug = new URLSearchParams(window.location.search).get('colecao') || '';
      } catch {
        requestedCollectionSlug = '';
      }
    }

    const currentRoute = '/poema/' + slug;
    const isPrerendered = container.getAttribute('data-prerendered') === currentRoute;
    let poem = null;
    let prevSlug = '';
    let nextSlug = '';
    let prevTitle = '';
    let nextTitle = '';
    let collectionsData = [];
    let relatedPoems = [];
    let seriesContext = null;

    const resolveSeriesContext = async (targetPoem) => {
      if (!targetPoem || !requestedCollectionSlug || !SLUG_REGEX.test(requestedCollectionSlug)) {
        return null;
      }
      try {
        const { getPublishedPoems } = await import('../utils/poems-store.js');
        const allPublished = await getPublishedPoems().catch(() => []);
        const allPoems = allPublished.some(p => p && p.slug === targetPoem.slug)
          ? allPublished
          : [targetPoem, ...allPublished];

        let firestoreCollections = [];
        let firestoreRelations = [];
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

        if (!isOffline) {
          try {
            const { db } = await import('../utils/firebase.js');
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const colSnap = await getDocs(
              query(collection(db, 'collections'), where('slug', '==', requestedCollectionSlug))
            ).catch(() => null);
            if (colSnap && !colSnap.empty) {
              firestoreCollections = colSnap.docs.map(d => ({ id: d.id, ...(d.data ? d.data() : {}) }));
            }

            let targetColId = firestoreCollections[0]?.id || '';
            if (!targetColId) {
              const { enrichCollectionsWithCurated } = await import('../data/collections.js');
              targetColId = enrichCollectionsWithCurated([]).find(c => c.slug === requestedCollectionSlug)?.id || '';
            }

            if (targetColId) {
              const cpSnap = await getDocs(
                query(collection(db, 'collection_poems'), where('collection_id', '==', targetColId))
              ).catch(() => null);
              if (cpSnap && typeof cpSnap.forEach === 'function') {
                cpSnap.forEach(d => {
                  const data = d.data ? d.data() : d;
                  if (data) firestoreRelations.push({ collection_id: targetColId, ...data });
                });
              }
            }
          } catch {
            // Fallback seguro para curadoria/acervo local
          }
        }

        return resolveCollectionContextForPoem({
          collectionSlug: requestedCollectionSlug,
          poemSlug: targetPoem.slug,
          allPoems,
          firestoreCollections,
          firestoreRelations
        });
      } catch {
        return null;
      }
    };

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

      if (poem && requestedCollectionSlug) {
        seriesContext = await resolveSeriesContext(poem);
        if (seriesContext) {
          prevSlug = seriesContext.prevSlug;
          nextSlug = seriesContext.nextSlug;
          prevTitle = seriesContext.prevTitle;
          nextTitle = seriesContext.nextTitle;

          if (!container.querySelector('#poem-series-banner')) {
            const articleEl = container.querySelector('.single-poem');
            const headerEl = articleEl?.querySelector('header');
            if (articleEl && headerEl) {
              const bannerWrapper = document.createElement('div');
              bannerWrapper.innerHTML = unwrapSafeHTML(renderSeriesBannerMarkup(seriesContext, import.meta.env.BASE_URL));
              const bannerEl = bannerWrapper.firstElementChild;
              if (bannerEl) {
                articleEl.insertBefore(bannerEl, headerEl);
              }
            }
          }

          const navEl = container.querySelector('.poem-nav');
          if (navEl) {
            navEl.innerHTML = unwrapSafeHTML(renderPoemNavInnerMarkup({
              prevSlug,
              nextSlug,
              prevTitle,
              nextTitle,
              seriesContext,
              baseUrl: import.meta.env.BASE_URL
            }));
          }
        }
      }
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
      container.innerHTML = unwrapSafeHTML(skeletonHtml);

      console.log('[Poem] Fetching slug:', slug);
      let error = null;

      try {
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        if (!isOffline) {
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
        }
      } catch (err) {
        error = err;
        console.error('[Poem] Error:', error);
      }

      // Fallback para acervo local quando offline ou em falha de rede (CA01, CA02)
      if (!poem) {
        try {
          const { getPublishedPoems } = await import('../utils/poems-store.js');
          const allPublished = await getPublishedPoems();
          const found = allPublished.find(p => p.slug === slug);
          if (found) {
            poem = { ...found };
            error = null;
            const idx = allPublished.findIndex(p => p.slug === slug);
            if (idx !== -1) {
              if (idx < allPublished.length - 1 && !poem.prev_slug) {
                poem.prev_slug = allPublished[idx + 1].slug;
                poem.prev_title = allPublished[idx + 1].title;
              }
              if (idx > 0 && !poem.next_slug) {
                poem.next_slug = allPublished[idx - 1].slug;
                poem.next_title = allPublished[idx - 1].title;
              }
            }
            if (Array.isArray(poem.tags) && poem.tags.length > 0 && relatedPoems.length === 0) {
              const tagsSet = new Set(poem.tags);
              relatedPoems = allPublished
                .filter(p => p.slug !== slug && Array.isArray(p.tags) && p.tags.some(t => tagsSet.has(t)))
                .slice(0, 3);
            }
          }
        } catch (localErr) {
          console.warn('[Poem] Falha no fallback local:', localErr);
        }
      }

      if (error || !poem) {
        console.warn('[Poem] Poem not found or error occurred');
        setNotFoundSEO();
        container.innerHTML = unwrapSafeHTML(`
          <div class="not-found-page fade-in">
            <p class="not-found-label">404</p>
            <h2 class="not-found-title">Página não encontrada</h2>
            <p class="not-found-desc">O poema que você procura pode ter mudado de endereço ou ainda não foi publicado.</p>
            <a href="${import.meta.env.BASE_URL}" data-link class="not-found-link">← Voltar ao sumário</a>
          </div>
        `);
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
        if (collectionsData.length === 0) {
          try {
            const { enrichCollectionsWithCurated } = await import('../data/collections.js');
            collectionsData = enrichCollectionsWithCurated([])
              .filter(c => poem.collection_slugs.includes(c.slug));
          } catch {}
        }
      }

      if (requestedCollectionSlug) {
        seriesContext = await resolveSeriesContext(poem);
        if (seriesContext) {
          prevSlug = seriesContext.prevSlug;
          nextSlug = seriesContext.nextSlug;
          prevTitle = seriesContext.prevTitle;
          nextTitle = seriesContext.nextTitle;
        }
      }

      // Render DOM
      container.innerHTML = unwrapSafeHTML(renderPoemMarkup({
        poem,
        prevSlug,
        nextSlug,
        prevTitle,
        nextTitle,
        collectionsData,
        relatedPoems,
        seriesContext,
        baseUrl: import.meta.env.BASE_URL
      }));
    }

    const buildPoemNavUrl = (targetSlug) => {
      const path = `${import.meta.env.BASE_URL}poema/${targetSlug}/`;
      return seriesContext?.collectionSlug
        ? `${path}?colecao=${encodeURIComponent(seriesContext.collectionSlug)}`
        : path;
    };

    // Rastrear visualização do poema
    trackPageView('/poema/' + poem.slug, poem.id);

    // Update SEO dynamically
    const rawPoemSlug = poem.slug || slug || '';
    const safePoemSlug = typeof rawPoemSlug === 'string' && SLUG_REGEX.test(rawPoemSlug)
      ? rawPoemSlug
      : encodeURIComponent(String(rawPoemSlug));
    const canonicalPoemUrl = `${SITE_URL}/poema/${safePoemSlug}/`;
    const cleanExcerpt = stripHtml(poem.excerpt || poem.content || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) + '...';

    const escapedPoemTitle = escapeHtml(poem.title || '');
    const primaryCol = collectionsData && collectionsData.length > 0 ? collectionsData[0] : null;
    const breadcrumbItems = primaryCol ? [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: primaryCol.name, url: `${SITE_URL}/colecao/${primaryCol.slug}/` },
      { name: escapedPoemTitle, url: canonicalPoemUrl }
    ] : [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: escapedPoemTitle, url: canonicalPoemUrl }
    ];

    const fallbackImageUrl = `${window.location.origin}${import.meta.env.BASE_URL}og-cover.jpg`;
    updateSEO({
      title: poem.title,
      description: cleanExcerpt,
      url: canonicalPoemUrl,
      imageUrl: fallbackImageUrl,
      type: 'article',
      publishedTime: poem.published_at,
      modifiedTime: poem.updated_at,
      poemTitle: poem.title,
      tags: poem.tags,
      structuredData: [
        poemSchema(poem, collectionsData),
        breadcrumbSchema(breadcrumbItems)
      ]
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

    // Histórico de Leitura Local (RF03, RNF01, CA04, CA05, CA07)
    let hasRecordedReading = false;
    const tryRecordReading = () => {
      if (hasRecordedReading) return;
      if (!poem || !poem.slug) return;
      if (poem.status && poem.status !== 'published') return;
      hasRecordedReading = true;
      recordReading({ slug: poem.slug, title: poem.title });
    };

    if (readingTimer) clearTimeout(readingTimer);
    readingTimer = setTimeout(() => {
      tryRecordReading();
    }, 3000);

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

    PoemComments.init(container, poem.id);

    // Favorite Button Logic (RF01, RF02, CA01, CA02, CA10)
    const favoriteBtn = container.querySelector('#favorite-poem-btn');
    if (favoriteBtn) {
      const updateFavUI = (active) => {
        favoriteBtn.classList.toggle('active', active);
        favoriteBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
        favoriteBtn.setAttribute('aria-label', active ? 'Remover poema dos favoritos' : 'Salvar poema nos favoritos');
        const textSpan = favoriteBtn.querySelector('.favorite-btn-text');
        if (textSpan) {
          textSpan.textContent = active ? 'Favoritado' : 'Favoritar';
        }
      };

      // Estado inicial
      updateFavUI(isFavorite(poem.slug) || (poem.id && isFavorite(poem.id)));

      const handleToggle = () => {
        const res = toggleFavorite(poem);
        if (!res.success) {
          toast.show('Não foi possível salvar o favorito no navegador.', 'error');
          return;
        }
        updateFavUI(res.isFavorite);
        if (res.isFavorite) {
          toast.show('Poema salvo nos seus favoritos!', 'success');
        } else {
          toast.show('Poema removido dos favoritos.', 'info');
        }
      };

      favoriteBtn.addEventListener('click', handleToggle);
      favoriteBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          handleToggle();
        }
      });
    }

    // Print Button Logic (RF01, CA01)
    const printBtn = container.querySelector('#print-poem-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Sharing Logic
    const shareUrl = window.location.href;
    const shareText = `Leia "${poem.title}", um poema de Natanael Fernando Gatti Brentano:`;

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
        } catch (_err) {}
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
    AudioPlayer.init(container, import.meta.env.BASE_URL, {
      title: poem.title,
      prevSlug,
      nextSlug,
      onNavigate: (targetSlug) => navigateTo(buildPoemNavUrl(targetSlug))
    });

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

    const poemBody = document.getElementById('poem-body') || document.getElementById('poem-text');
    const tooltip = document.getElementById('highlight-tooltip');
    let selectedText = '';

    const mobileSelectionToolbar = document.getElementById('mobile-selection-toolbar');
    const mobileShareSelectionBtn = document.getElementById('mobile-share-selection-btn');
    const mobileCardSelectionBtn = document.getElementById('mobile-card-selection-btn');

    const hideSelectionUI = () => {
      tooltip?.classList.remove('visible');
      mobileSelectionToolbar?.classList.remove('visible');
      mobileShareSelectionBtn?.classList.remove('visible');
    };

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || selection.isCollapsed) {
        hideSelectionUI();
        return;
      }
      
      const range = selection.getRangeAt(0);
      if (!poemBody || !poemBody.contains(range.commonAncestorContainer)) {
        hideSelectionUI();
        return;
      }

      selectedText = selection.toString().trim();

      if (selectedText.length >= 8 && selectedText.length <= 1500) {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          if (mobileSelectionToolbar) {
            mobileSelectionToolbar.classList.add('visible');
          } else if (mobileShareSelectionBtn) {
            mobileShareSelectionBtn.classList.add('visible');
          }
        } else if (tooltip) {
          const rect = typeof range.getBoundingClientRect === 'function'
            ? range.getBoundingClientRect()
            : { left: 0, top: 0, width: 0, height: 0 };
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top + window.scrollY}px`;
          tooltip.classList.add('visible');
        }
      } else {
        hideSelectionUI();
      }
    };

    poemBody?.addEventListener('mouseup', handleSelection);
    poemBody?.addEventListener('touchend', handleSelection);
    handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || selection.isCollapsed) {
        hideSelectionUI();
        return;
      }
      const range = selection.getRangeAt(0);
      if (!poemBody || !poemBody.contains(range.commonAncestorContainer)) {
        hideSelectionUI();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);

    mobileShareSelectionBtn?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: poem.title,
            text: `"${selectedText}" — Natanael Fernando Gatti Brentano`,
            url: window.location.href
          });
        } catch (_err) {}
      } else {
        const textToShare = `"${selectedText}" — Natanael Fernando Gatti Brentano\n${window.location.href}`;
        navigator.clipboard.writeText(textToShare).then(() => {
          toast.show('Trecho copiado!', 'success');
        });
      }
      window.getSelection()?.removeAllRanges();
      hideSelectionUI();
    });

    document.getElementById('highlight-copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(selectedText).then(() => {
        toast.show('Trecho copiado para a área de transferência!', 'success');
        window.getSelection()?.removeAllRanges();
        hideSelectionUI();
      });
    });

    document.getElementById('highlight-share-btn')?.addEventListener('click', () => {
      const textToShare = `"${selectedText}" — Natanael Fernando Gatti Brentano\n${window.location.href}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      window.getSelection()?.removeAllRanges();
      hideSelectionUI();
    });

    // Preview do card e alternador de modo (RF02, CA02, CA03)
    const previewModal = document.getElementById('card-preview-modal');
    const cardModeToggleGroup = document.getElementById('card-mode-toggle-group');
    const cardModeQuoteBtn = document.getElementById('card-mode-quote-btn');
    const cardModeFullBtn = document.getElementById('card-mode-full-btn');
    const cardPreviewTitle = document.getElementById('card-preview-title');
    const cardPreviewBody = document.getElementById('card-preview-body');

    const updateCardModalPreview = () => {
      if (!cardPreviewTitle || !cardPreviewBody) return;
      if (isExportingQuote && quoteText) {
        cardPreviewTitle.textContent = `De “${poem.title}”`;
        cardPreviewBody.textContent = `“ ${quoteText} ”`;
        cardPreviewBody.style.fontStyle = 'italic';
      } else {
        cardPreviewTitle.textContent = poem.title || 'Poema';
        const plainText = stripHtml(poem.content || '');
        const lines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
        cardPreviewBody.textContent = lines.slice(0, 10).join('\n') + (lines.length > 10 ? '\n...' : '');
        cardPreviewBody.style.fontStyle = 'normal';
      }
    };

    const setCardExportMode = (mode) => {
      if (mode === 'quote') {
        isExportingQuote = true;
        cardModeQuoteBtn?.classList.add('active');
        cardModeQuoteBtn?.style.setProperty('border-color', 'var(--accent-subtle)');
        cardModeQuoteBtn?.style.setProperty('color', 'var(--text-primary)');
        cardModeFullBtn?.classList.remove('active');
        cardModeFullBtn?.style.setProperty('border-color', 'var(--border-subtle)');
        cardModeFullBtn?.style.setProperty('color', 'var(--text-muted)');
      } else {
        isExportingQuote = false;
        cardModeFullBtn?.classList.add('active');
        cardModeFullBtn?.style.setProperty('border-color', 'var(--accent-subtle)');
        cardModeFullBtn?.style.setProperty('color', 'var(--text-primary)');
        cardModeQuoteBtn?.classList.remove('active');
        cardModeQuoteBtn?.style.setProperty('border-color', 'var(--border-subtle)');
        cardModeQuoteBtn?.style.setProperty('color', 'var(--text-muted)');
      }
      updateCardModalPreview();
    };

    cardModeQuoteBtn?.addEventListener('click', () => setCardExportMode('quote'));
    cardModeFullBtn?.addEventListener('click', () => setCardExportMode('full'));

    const showCardPreview = (quote = null) => {
      const chosenQuote = quote !== null ? quote : selectedText;
      window.getSelection()?.removeAllRanges();
      hideSelectionUI();

      if (chosenQuote) {
        quoteText = chosenQuote;
        isExportingQuote = true;
        if (cardModeToggleGroup) cardModeToggleGroup.style.display = 'flex';
        setCardExportMode('quote');
      } else {
        quoteText = '';
        isExportingQuote = false;
        if (cardModeToggleGroup) cardModeToggleGroup.style.display = 'none';
        setCardExportMode('full');
      }

      if (previewModal) {
        previewModal.style.display = 'flex';
        previewModal.classList.add('active');
      }
    };

    document.getElementById('highlight-card-btn')?.addEventListener('click', () => showCardPreview());
    mobileCardSelectionBtn?.addEventListener('click', () => showCardPreview());

    // Botão de copiar citação ABNT
    const copyCitationBtn = document.getElementById('copy-citation-btn');
    if (copyCitationBtn) {
      copyCitationBtn.addEventListener('click', async () => {
        const citation = copyCitationBtn.getAttribute('data-citation') || '';
        try {
          await navigator.clipboard.writeText(citation);
          const textSpan = copyCitationBtn.querySelector('.copy-citation-text');
          const originalText = textSpan ? textSpan.textContent : 'Copiar citação';
          if (textSpan) textSpan.textContent = 'Copiado!';
          copyCitationBtn.classList.add('copied');
          toast.show('Citação copiada para a área de transferência!', 'success');
          setTimeout(() => {
            if (textSpan) textSpan.textContent = originalText;
            copyCitationBtn.classList.remove('copied');
          }, 2500);
        } catch (_err) {
          toast.show('Não foi possível copiar automaticamente.', 'error');
        }
      });
    }

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
          if (nextSlug) navigateTo(buildPoemNavUrl(nextSlug));
          break;
        case 'ArrowLeft':
          if (prevSlug) navigateTo(buildPoemNavUrl(prevSlug));
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
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      if (scrollBar) scrollBar.style.width = scrolled + "%";

      if (scrolled > 25) {
        tryRecordReading();
      }

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
        if (deltaX > 0 && nextSlug) navigateTo(buildPoemNavUrl(nextSlug));
        else if (deltaX < 0 && prevSlug) navigateTo(buildPoemNavUrl(prevSlug));
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Newsletter form logic
    newsletter.init();

    // Card Export Preview Modal Logic
    const shareCardBtnMobile = document.getElementById('share-card-btn-mobile');
    const shareCardBtnDesktop = document.getElementById('share-card-btn-desktop');
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
        if (cardModeToggleGroup) cardModeToggleGroup.style.display = 'none';
        setCardExportMode('full');
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
        isExportingQuote = false;
        quoteText = '';
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
        const textToExport = (isExportingQuote && quoteText) ? quoteText : null;
        await generateSocialCard(poem, document.getElementById('social-card-container'), selectedExportTheme, textToExport, selectedExportRatio);
        toast.show('Card gerado com sucesso!', 'success');
      } catch (err) {
        console.error(err);
        import('../utils/error-reporter.js')
          .then(({ reportError }) => reportError(err, {
            category: 'runtime',
            severity: 'warning',
            context: { action: 'generateSocialCard', slug: poem?.slug }
          }))
          .catch(() => {});
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
            adminSlot.textContent = '';
            const editLink = document.createElement('a');
            editLink.href = `${import.meta.env.BASE_URL}admin?view=editor&id=${encodeURIComponent(poem.id || '')}`;
            editLink.className = 'btn-secondary';
            editLink.setAttribute('data-link', '');
            editLink.textContent = 'Editar Obra';

            const resendBtn = document.createElement('button');
            resendBtn.id = 'resend-email-btn';
            resendBtn.className = 'btn-secondary';
            resendBtn.textContent = 'Reenviar Email';

            adminSlot.appendChild(editLink);
            adminSlot.appendChild(document.createTextNode(' '));
            adminSlot.appendChild(resendBtn);

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
      deferredTimer = null;
      deferredIdleId = null;
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const isIsolatedVitest = typeof process !== 'undefined' && Boolean(process.env?.VITEST) && !globalThis.__ALLOW_DEFERRED_POEM_FEATURES_IN_TEST__;
      if (isOffline || isIsolatedVitest) {
        return;
      }
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
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
              toast.show('Você está offline. Conecte-se à internet para reagir.', 'info');
              btn.disabled = false;
              return;
            }
            const res = await toggleReaction(poem.id, emoji);
            if (res === 'offline') {
              toast.show('Você está offline. Conecte-se à internet para reagir.', 'info');
              btn.disabled = false;
              return;
            }
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

      // 2. Comments (Firestore query deferred)
      PoemComments.loadComments(poem.id, container);

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
                  relatedList.innerHTML = unwrapSafeHTML(top3.map(r => `
                    <a href="${import.meta.env.BASE_URL}poema/${r.slug}/" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
                      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${escapeHtml(r.title)}</h3>
                      ${r.excerpt ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${escapeHtml(stripHtml(r.excerpt).substring(0, 100))}...</p>` : ''}
                    </a>
                  `).join(''));
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

    if (deferredTimer) {
      clearTimeout(deferredTimer);
      deferredTimer = null;
    }
    if (deferredIdleId !== null && typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(deferredIdleId);
      deferredIdleId = null;
    }
    if (prefetchTimer) {
      clearTimeout(prefetchTimer);
      prefetchTimer = null;
    }

    if ('requestIdleCallback' in window) {
      deferredIdleId = window.requestIdleCallback(loadDeferredFeatures, { timeout: 3000 });
    } else {
      deferredTimer = setTimeout(loadDeferredFeatures, 1000);
    }

    // Prefetch adjacent routes (RF04)
    const prefetchRoutes = () => {
      prefetchTimer = null;
      const BASE_URL = import.meta.env.BASE_URL;
      const slugsToPrefetch = [prevSlug, nextSlug].filter(s => typeof s === 'string' && SLUG_REGEX.test(s));

      slugsToPrefetch.forEach(s => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `${window.location.origin}${BASE_URL}poema/${encodeURIComponent(s)}/`;
        document.head.appendChild(link);
      });
    };
    prefetchTimer = setTimeout(prefetchRoutes, 2000);
  }
};
