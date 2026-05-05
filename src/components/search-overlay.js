import { supabase } from '../utils/supabase.js';
import { navigateTo } from '../router.js';

export const searchOverlay = {
  overlay: null,
  allPoemsCache: null,

  async fetchPoems() {
    if (this.allPoemsCache) return this.allPoemsCache;
    const { data, error } = await supabase
      .from('poems')
      .select('id, title, slug, excerpt, tags')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (!error && data) {
      this.allPoemsCache = data;
      return data;
    }
    return [];
  },

  renderSearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p class="search-no-results">Nenhum poema encontrado.</p>';
      return;
    }

    resultsContainer.innerHTML = results.map(poem => `
      <div class="search-result-item" data-slug="${poem.slug}">
        <div class="search-result-title">${poem.title}</div>
        <div class="search-result-excerpt">${poem.excerpt || ''}</div>
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

  async handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const poems = await this.fetchPoems();
    
    const results = poems.filter(poem => 
      poem.title.toLowerCase().includes(query) || 
      (poem.excerpt && poem.excerpt.toLowerCase().includes(query)) ||
      (poem.tags && poem.tags.some(tag => tag.toLowerCase().includes(query)))
    );

    this.renderSearchResults(results, query);
    
    window.dispatchEvent(new CustomEvent('global-search', { 
      detail: { query, results } 
    }));
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
        </div>
        <div id="search-results" class="search-results-container"></div>
        <p class="search-overlay-help">Digite título, trecho ou sentimento do poema</p>
      </div>
    `;
    document.body.appendChild(this.overlay);

    const input = this.overlay.querySelector('#overlay-search-input');
    input.addEventListener('input', (e) => this.handleSearch(e));

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

  open() {
    this.init();
    this.overlay.classList.add('active');
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.fetchPoems();

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
      
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: '', results: null } 
      }));
    }
  }
};
