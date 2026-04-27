import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { newsletter } from '../components/newsletter.js';

export default {
  meta: {
    title: 'Natanael Brentano - Poemas'
  },
  cleanup() {
    const searchInput = document.getElementById('header-search-input');
    if (searchInput && searchInput._handleSearch) {
      searchInput.removeEventListener('input', searchInput._handleSearch);
      searchInput._handleSearch = null;
    }
  },
  async render(container) {
    updateSEO({
      title: 'Natanael Brentano — Poemas',
      description: 'Poesia contemporânea e textos curtos sobre o efêmero.',
      type: 'website'
    });
    
    const skeletonHtml = `
      <div class="home-layout fade-in">
        <section class="hero-section">
          <div class="skeleton skeleton-title-large"></div>
          <div class="skeleton skeleton-text-center"></div>
          <div class="skeleton skeleton-text-center-short"></div>
        </section>
        <section class="poems-list">
          <div class="skeleton skeleton-featured"></div>
          ${Array(4).fill(0).map(() => `
            <div class="skeleton-row">
              <div class="skeleton skeleton-text" style="width: 50%;"></div>
              <div class="skeleton skeleton-text" style="width: 10%;"></div>
            </div>
          `).join('')}
        </section>
      </div>
    `;
    
    container.innerHTML = skeletonHtml;
    
    // Fetch published poems
    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, title, slug, excerpt, tags, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
      
    if (error) {
      console.error(error);
      container.innerHTML = `
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;
      return;
    }
    
    if (!poems || poems.length === 0) {
      container.innerHTML = `
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;
      return;
    }
    
    // Poem of the Day Logic
    const seedStr = new Date().toISOString().slice(0, 10);
    const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const podIndex = seed % poems.length;
    const podPoem = poems[podIndex];
    
    // Remove POD from the list to avoid repetition
    const remainingPoems = poems.filter((_, i) => i !== podIndex);
    
    const BASE_URL = import.meta.env.BASE_URL;

    // Helper to render the poem list
    const renderPoemList = (items, isSearchActive = false, searchTerm = '') => {
      if (items.length === 0) {
        return `
          <p class="search-empty-msg">
            Nenhum poema encontrado para "<strong>${searchTerm}</strong>".
          </p>
        `;
      }

      return items.map((poem, index) => {
        const year = new Date(poem.published_at).getFullYear();
        const dateStr = new Date(poem.published_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        // Show featured only if NOT searching and it's the first one
        if (!isSearchActive && index === 0) {
          return `
          <article class="poem-featured fade-in">
            <a href="${BASE_URL}poema/${poem.slug}" data-link>
              <h2 class="featured-title">${poem.title}</h2>
              <div class="featured-excerpt">${poem.excerpt || ''}</div>
              <div class="featured-meta">
                <span>${dateStr}</span>
                ${poem.tags && poem.tags.length > 0 ? `<span>•</span><span>${poem.tags[0]}</span>` : ''}
              </div>
            </a>
            <div class="featured-separator"></div>
          </article>
          `;
        }
        
        return `
        <article class="poem-row fade-in">
          <a href="${BASE_URL}poema/${poem.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${poem.title}</h3>
            <span class="poem-row-year">${year}</span>
          </a>
        </article>
      `}).join('');
    };
    
    container.innerHTML = `
      <div class="home-layout">
        
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${BASE_URL}poema/${podPoem.slug}" data-link class="pod-link">
            <h2 class="pod-title">${podPoem.title}</h2>
            <p class="pod-excerpt">${podPoem.excerpt || ''}</p>
          </a>
        </section>

        <section class="hero-section fade-in">
          <h1></h1>
          <p></p>
        </section>

        <section class="poems-list fade-in">
          <input type="search" id="search-input" placeholder="Buscar poema..." aria-label="Buscar poema">
          <div class="list-container">
            ${renderPoemList(remainingPoems)}
          </div>
        </section>
        
        ${newsletter.render()}
      </div>
    `;

    // Search logic
    const searchInput = document.getElementById('search-input');
    const poemsList = container.querySelector('.list-container');

    if (searchInput && poemsList) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const isSearchActive = term.length > 0;
        
        const filtered = isSearchActive 
          ? remainingPoems.filter(p => 
              p.title.toLowerCase().includes(term) || 
              (p.excerpt && p.excerpt.toLowerCase().includes(term))
            )
          : remainingPoems;

        poemsList.innerHTML = renderPoemList(filtered, isSearchActive, term);
      });
    }
    
    // Setup Newsletter form logic
    newsletter.init();
  }
};
