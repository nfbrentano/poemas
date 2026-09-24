import { db } from '../utils/firebase.js';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { navigateTo } from '../router.js';
import { normalizeForSearch, escapeHtml, stripHtml } from '../utils/html.js';

export const searchOverlay = {
  overlay: null,
  allPoemsCache: null,
  sortBy: 'relevance',

  async loadAllPoems() {
    if (this.allPoemsCache) return this.allPoemsCache;
    try {
      const q = query(
        collection(db, 'poems'),
        where('status', '==', 'published'),
        orderBy('published_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({ 
          id: doc.id, 
          ...docData,
          _normalized: {
            title: normalizeForSearch(docData.title || ''),
            excerpt: normalizeForSearch(docData.excerpt || ''),
            content: normalizeForSearch(docData.content || ''),
            tags: (docData.tags || []).map(normalizeForSearch)
          }
        });
      });
      this.allPoemsCache = data;
      return this.allPoemsCache;
    } catch (error) {
      console.error('Error fetching all poems for search cache:', error);
      return [];
    }
  },

  renderSearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    const sortingContainer = document.getElementById('search-sorting');
    const resultsCountEl = document.getElementById('search-results-count');
    
    if (!resultsContainer) return;

    const hasActiveSearch = query.length >= 2;

    const helpText = document.getElementById('search-help-text');

    if (!hasActiveSearch) {
      resultsContainer.innerHTML = '';
      if (sortingContainer) sortingContainer.style.display = 'none';
      if (helpText) helpText.style.display = 'block';
      return;
    }

    if (helpText) helpText.style.display = 'none';
    if (sortingContainer) sortingContainer.style.display = 'flex';
    if (resultsCountEl) {
      resultsCountEl.textContent = `${results.length} obra${results.length !== 1 ? 's' : ''} encontrada${results.length !== 1 ? 's' : ''}`;
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p class="search-no-results">Nenhum poema encontrado.</p>';
      return;
    }

    const highlight = (text, term) => {
      if (!text) return '';
      if (!term || term.length < 2) return escapeHtml(text);
      const q = normalizeForSearch(term);
      if (!q) return escapeHtml(text);

      let result = '';
      let remaining = text;
      
      const getNorm = (str) => str.normalize('NFD').replace(/[\p{Diacritic}]/gu, '').toLowerCase();
      let normRemaining = getNorm(remaining);
      let idx = normRemaining.indexOf(q);

      while (idx !== -1) {
        result += escapeHtml(remaining.substring(0, idx));
        result += '<mark>' + escapeHtml(remaining.substring(idx, idx + q.length)) + '</mark>';
        remaining = remaining.substring(idx + q.length);
        normRemaining = getNorm(remaining);
        idx = normRemaining.indexOf(q);
      }
      result += escapeHtml(remaining);
      return result;
    };

    resultsContainer.innerHTML = results.map(poem => {
      const q = normalizeForSearch(query);
      const n = poem._normalized;
      
      const inTitle = n.title.includes(q);
      const inExcerpt = n.excerpt && n.excerpt.includes(q);
      const inContent = n.content && n.content.includes(q);
      const inTag = n.tags && n.tags.some(t => t.includes(q));
      
      let badge = '';
      let snippetHtml = '';

      let baseExcerpt = poem.excerpt;
      if (!baseExcerpt && poem.content) {
        baseExcerpt = stripHtml(poem.content).substring(0, 120).trim() + '...';
      }

      if (query.length >= 2) {
        if (inTitle) {
          badge = '<span class="search-match-badge badge-title">no título</span>';
          snippetHtml = `<div class="search-result-excerpt">${highlight(baseExcerpt, query)}</div>`;
        } else if (inContent) {
          badge = '<span class="search-match-badge badge-content">no poema</span>';
          const snippet = this.getSnippet(poem.content, query) || baseExcerpt;
          snippetHtml = `<div class="search-result-snippet">"${highlight(snippet, query)}"</div>`;
        } else if (inTag) {
          badge = '<span class="search-match-badge badge-tag">no sentimento</span>';
          snippetHtml = `<div class="search-result-excerpt">${highlight(baseExcerpt, query)}</div>`;
        } else if (inExcerpt) {
          snippetHtml = `<div class="search-result-excerpt">${highlight(baseExcerpt, query)}</div>`;
        } else {
           snippetHtml = `<div class="search-result-excerpt">${escapeHtml(baseExcerpt)}</div>`;
        }
      } else {
        snippetHtml = `<div class="search-result-excerpt">${escapeHtml(baseExcerpt)}</div>`;
      }

      return `
        <div class="search-result-item" data-slug="${poem.slug}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <div class="search-result-title">${highlight(poem.title, query)}</div>
            ${badge}
          </div>
          ${snippetHtml}
          ${poem.tags && poem.tags.length > 0 ? `<div class="search-result-tags" style="font-size:0.7rem; color:var(--accent-subtle); margin-top:4px;">${poem.tags.map(t => highlight(t, query)).join(', ')}</div>` : ''}
        </div>
      `;
    }).join('');

    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const slug = item.getAttribute('data-slug');
        this.close();
        navigateTo(`/poema/${slug}`);
      });
    });
  },

  triggerSearch() {
    const input = document.getElementById('overlay-search-input');
    const query = input ? input.value.trim() : '';
    
    if (this.overlay && this.overlay.classList.contains('active')) {
      const url = new URL(window.location);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      history.replaceState({ ...history.state, searchOpen: true }, '', url);
    }

    if (!this.allPoemsCache) return;

    let filtered = [...this.allPoemsCache];
    
    // 1. Text & Tag Filter
    if (query.length >= 2) {
      const q = normalizeForSearch(query);
      filtered = filtered.filter(p => {
        const n = p._normalized;
        return n.title.includes(q) || 
               n.excerpt.includes(q) || 
               n.content.includes(q) ||
               n.tags.some(t => t.includes(q));
      });
    } else {
      this.renderSearchResults([], query);
      return;
    }
    
    // 2. Sorting
    if (this.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    } else {
      // Relevance
      if (query.length >= 2) {
        const q = normalizeForSearch(query);
        filtered.sort((a, b) => {
          const aTitle = a._normalized.title;
          const bTitle = b._normalized.title;
          
          const aExact = aTitle === q;
          const bExact = bTitle === q;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aTitleStart = aTitle.startsWith(q);
          const bTitleStart = bTitle.startsWith(q);
          if (aTitleStart && !bTitleStart) return -1;
          if (!aTitleStart && bTitleStart) return 1;

          const aTitleIn = aTitle.includes(q);
          const bTitleIn = bTitle.includes(q);
          if (aTitleIn && !bTitleIn) return -1;
          if (!aTitleIn && bTitleIn) return 1;
          
          const aExcerptIn = a._normalized.excerpt.includes(q);
          const bExcerptIn = b._normalized.excerpt.includes(q);
          if (aExcerptIn && !bExcerptIn) return -1;
          if (!aExcerptIn && bExcerptIn) return 1;

          return new Date(b.published_at) - new Date(a.published_at);
        });
      } else {
        filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      }
    }
    
    this.renderSearchResults(filtered, query);
    
    window.dispatchEvent(new CustomEvent('global-search', { 
      detail: { query, results: query.length >= 2 ? filtered : null } 
    }));
  },

  getSnippet(content, query) {
    if (!content || !query || query.length < 2) return null;
    const cleanContent = stripHtml(content);
    const q = normalizeForSearch(query);
    const c = normalizeForSearch(cleanContent);
    const idx = c.indexOf(q);
    if (idx === -1) return null;
    
    const start = Math.max(0, idx - 40);
    const end = Math.min(cleanContent.length, idx + q.length + 40);
    let snippet = cleanContent.substring(start, end).replace(/\n/g, ' ');
    if (start > 0) snippet = '…' + snippet;
    if (end < cleanContent.length) snippet = snippet + '…';
    return snippet;
  },

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  init() {
    if (this.overlay) return;
    
    window.addEventListener('popstate', (e) => {
      if (this.overlay && this.overlay.classList.contains('active') && (!e.state || !e.state.searchOpen)) {
        this.close(true);
      }
    });

    this.overlay = document.createElement('div');
    this.overlay.id = 'search-overlay';
    this.overlay.className = 'search-overlay';
    this.overlay.innerHTML = `
      <div class="search-overlay-content">
        <button class="search-overlay-close" id="search-close-btn" aria-label="Fechar busca">&times;</button>
        <div class="search-input-wrapper">
          <input type="search" id="overlay-search-input" placeholder="Buscar por título, trecho ou sentimento..." aria-label="Buscar poema" autocomplete="off">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <button id="search-clear-btn" class="search-clear-btn" aria-label="Limpar busca">&times;</button>
        </div>
        
        <p id="search-help-text" class="search-overlay-help">Digite título, trecho ou sentimento do poema</p>

        <div id="search-sorting" class="search-sorting-container" style="display:none;">
          <span id="search-results-count"></span>
          <div class="search-sort-controls">
            <label for="search-sort-select">Ordenar por:</label>
            <select id="search-sort-select">
              <option value="relevance">Relevância</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>
        </div>

        <div id="search-results" class="search-results-container"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    const input = this.overlay.querySelector('#overlay-search-input');
    const clearBtn = this.overlay.querySelector('#search-clear-btn');
    const sortSelect = this.overlay.querySelector('#search-sort-select');

    const debouncedSearch = this.debounce(() => {
      this.triggerSearch();
      if (clearBtn && input) clearBtn.style.display = input.value ? 'block' : 'none';
    }, 250);

    input.addEventListener('input', debouncedSearch);

    sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.triggerSearch();
    });

    clearBtn?.addEventListener('click', () => {
      input.value = '';
      input.focus();
      clearBtn.style.display = 'none';
      this.triggerSearch();
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay || e.target.id === 'search-close-btn') {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.close();
      }
      if (e.key === '/' && !this.overlay.classList.contains('active')) {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          e.preventDefault();
          this.open();
        }
      }
    });
  },

  async open(initialQuery = null) {
    this.init();
    const wasActive = this.overlay.classList.contains('active');
    
    this.overlay.classList.add('active');
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (!wasActive) {
      if (initialQuery === null) {
        this.pushedState = true;
        history.pushState({ ...history.state, searchOpen: true }, '');
      } else {
        this.pushedState = false;
        history.replaceState({ ...history.state, searchOpen: true }, '');
      }
    }

    // Lazy load cache
    await this.loadAllPoems();

    const input = this.overlay.querySelector('#overlay-search-input');
    if (input) {
      if (initialQuery !== null) {
        input.value = initialQuery;
        const clearBtn = this.overlay.querySelector('#search-clear-btn');
        if (clearBtn) clearBtn.style.display = initialQuery ? 'block' : 'none';
        this.triggerSearch();
      }
      setTimeout(() => input.focus(), 100);
    }
  },

  close(fromPopState = false) {
    if (this.overlay && this.overlay.classList.contains('active')) {
      this.overlay.classList.remove('active');
      this.overlay.style.display = 'none';
      document.body.style.overflow = '';
      
      const input = this.overlay.querySelector('#overlay-search-input');
      const resultsContainer = this.overlay.querySelector('#search-results');
      if (input) input.value = '';
      if (resultsContainer) resultsContainer.innerHTML = '';
      
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: '', results: null } 
      }));

      if (fromPopState !== true) {
        if (this.pushedState) {
          history.back();
        } else {
          const url = new URL(window.location);
          url.searchParams.delete('q');
          history.replaceState({ ...history.state, searchOpen: false }, '', url);
        }
      }
    }
  }
};
