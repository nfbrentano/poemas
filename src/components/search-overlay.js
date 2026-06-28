import { supabase } from '../utils/supabase.js';
import { navigateTo } from '../router.js';

export const searchOverlay = {
  overlay: null,
  allPoemsCache: null,
  tagsList: [],
  activeTag: null,
  sortBy: 'relevance',

  async loadAllPoems() {
    if (this.allPoemsCache) return this.allPoemsCache;
    const { data, error } = await supabase
      .from('poems')
      .select('id, title, slug, excerpt, tags, published_at, content')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) {
      console.error('Error fetching all poems for search cache:', error);
      return [];
    }
    this.allPoemsCache = data || [];
    
    // Extract unique tags
    const allTags = new Set();
    this.allPoemsCache.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => allTags.add(t));
      }
    });
    this.tagsList = Array.from(allTags).sort();
    
    return this.allPoemsCache;
  },

  renderTagChips() {
    const container = document.getElementById('search-filters');
    if (!container) return;
    
    if (this.tagsList.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this.tagsList.map(tag => `
      <button class="search-tag-chip ${this.activeTag === tag ? 'active' : ''}" data-tag="${tag}" style="font-size:0.75rem; padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-subtle); color: var(--text-secondary); background: transparent; cursor: pointer; transition: all var(--transition-fast);">
        ${tag}
      </button>
    `).join('');

    container.querySelectorAll('.search-tag-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        this.activeTag = (this.activeTag === tag) ? null : tag;
        this.renderTagChips();
        this.triggerSearch();
      });
    });
  },

  renderSearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    const sortingContainer = document.getElementById('search-sorting');
    const resultsCountEl = document.getElementById('search-results-count');
    
    if (!resultsContainer) return;

    const hasActiveSearch = query.length >= 2 || this.activeTag;

    if (!hasActiveSearch) {
      resultsContainer.innerHTML = '';
      if (sortingContainer) sortingContainer.style.display = 'none';
      return;
    }

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
      if (!term || term.length < 2) return text;
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    resultsContainer.innerHTML = results.map(poem => `
      <div class="search-result-item" data-slug="${poem.slug}">
        <div class="search-result-title">${highlight(poem.title, query)}</div>
        <div class="search-result-excerpt">${highlight(poem.excerpt, query)}</div>
        ${poem.tags && poem.tags.length > 0 ? `<div class="search-result-tags" style="font-size:0.7rem; color:var(--accent-subtle); margin-top:4px;">${poem.tags.join(', ')}</div>` : ''}
      </div>
    `).join('');

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
    
    if (!this.allPoemsCache) return;

    let filtered = [...this.allPoemsCache];
    
    // 1. Text Filter
    if (query.length >= 2) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) || 
        (p.content && p.content.toLowerCase().includes(q))
      );
    } else if (query.length > 0 && !this.activeTag) {
      // Query entered but too short, and no tag filter active -> render empty
      this.renderSearchResults([], query);
      return;
    }
    
    // 2. Tag Filter
    if (this.activeTag) {
      filtered = filtered.filter(p => 
        p.tags && p.tags.includes(this.activeTag)
      );
    }
    
    // 3. Sorting
    if (this.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    } else {
      // Relevance
      if (query.length >= 2) {
        const q = query.toLowerCase();
        filtered.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(q);
          const bTitle = b.title.toLowerCase().includes(q);
          if (aTitle && !bTitle) return -1;
          if (!aTitle && bTitle) return 1;
          return new Date(b.published_at) - new Date(a.published_at);
        });
      } else {
        filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      }
    }
    
    this.renderSearchResults(filtered, query);
    
    window.dispatchEvent(new CustomEvent('global-search', { 
      detail: { query, results: (query.length >= 2 || this.activeTag) ? filtered : null } 
    }));
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
    
    this.overlay = document.createElement('div');
    this.overlay.id = 'search-overlay';
    this.overlay.className = 'search-overlay';
    this.overlay.innerHTML = `
      <div class="search-overlay-content">
        <button class="search-overlay-close" id="search-close-btn" aria-label="Fechar busca">&times;</button>
        <div class="search-input-wrapper">
          <input type="search" id="overlay-search-input" placeholder="Buscar poema..." aria-label="Buscar poema" autocomplete="off">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <button id="search-clear-btn" class="search-clear-btn" aria-label="Limpar busca">&times;</button>
        </div>
        
        <div id="search-filters" class="search-filters-container" style="display:flex; flex-wrap:wrap; gap:var(--space-2xs); margin: var(--space-sm) 0; min-height: 24px; justify-content: center;"></div>
        
        <div id="search-sorting" class="search-sorting-container" style="display:none; justify-content:space-between; align-items:center; margin: var(--space-sm) 0; font-size:0.75rem; color:var(--text-secondary); font-family:var(--font-ui); border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
          <span id="search-results-count"></span>
          <div style="display:flex; align-items:center; gap:4px;">
            <label for="search-sort-select">Ordenar por:</label>
            <select id="search-sort-select" style="background:transparent; border:none; color:var(--text-primary); font-size:0.75rem; padding:0; outline:none; cursor:pointer;">
              <option value="relevance" style="background:var(--bg-elevated); color:var(--text-primary);">Relevância</option>
              <option value="recent" style="background:var(--bg-elevated); color:var(--text-primary);">Mais Recentes</option>
            </select>
          </div>
        </div>

        <div id="search-results" class="search-results-container"></div>
        <p class="search-overlay-help">Digite título, trecho ou sentimento do poema</p>
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
      this.activeTag = null;
      this.renderTagChips();
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

  async open() {
    this.init();
    this.overlay.classList.add('active');
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Lazy load cache & render chips
    await this.loadAllPoems();
    this.renderTagChips();

    setTimeout(() => {
      const input = this.overlay.querySelector('#overlay-search-input');
      if (input) input.focus();
    }, 100);
  },

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      this.overlay.style.display = 'none';
      document.body.style.overflow = '';
      
      const input = this.overlay.querySelector('#overlay-search-input');
      const resultsContainer = this.overlay.querySelector('#search-results');
      if (input) input.value = '';
      if (resultsContainer) resultsContainer.innerHTML = '';
      this.activeTag = null;
      
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: '', results: null } 
      }));
    }
  }
};
