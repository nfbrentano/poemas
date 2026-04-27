import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { newsletter } from '../components/newsletter.js';

export default {
  meta: {
    title: 'Natanael Brentano - Poemas'
  },
  async render(container) {
    updateSEO({
      title: 'A poética do silêncio',
      description: 'Obras contemporâneas de Natanael Brentano. Textos curtos sobre a imensidão do efêmero.'
    });
    
    const skeletonHtml = `
      <div class="home-layout fade-in">
        <section class="hero-section">
          <div class="skeleton skeleton-title" style="margin: 0 auto 2rem auto; width: 40%; height: 4rem;"></div>
          <div class="skeleton skeleton-text" style="margin: 0 auto 0.5rem auto; width: 60%;"></div>
          <div class="skeleton skeleton-text" style="margin: 0 auto; width: 50%;"></div>
        </section>
        <section class="poems-list">
          <div class="skeleton-featured">
            <div class="skeleton skeleton-title" style="width: 70%; height: 3.5rem;"></div>
            <div class="skeleton skeleton-text" style="width: 90%;"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 30%; height: 1rem; margin-top: 1.5rem;"></div>
          </div>
          ${Array(4).fill(0).map(() => `
            <div class="skeleton-row">
              <div class="skeleton skeleton-text" style="width: 50%; height: 1.5rem;"></div>
              <div class="skeleton skeleton-text" style="width: 10%; height: 1rem;"></div>
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
      container.innerHTML = '<div class="error-container">Erro ao carregar os poemas. Tente novamente mais tarde.</div>';
      return;
    }
    
    if (!poems || poems.length === 0) {
      container.innerHTML = `
        <div class="empty-state fade-in">
          <h2>O silêncio ainda impera.</h2>
          <p>Nenhum poema publicado no momento.</p>
        </div>
      `;
      return;
    }
    
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
            <a href="${import.meta.env.BASE_URL}poema/${poem.slug}" data-link>
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
          <a href="${import.meta.env.BASE_URL}poema/${poem.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${poem.title}</h3>
            <span class="poem-row-year">${year}</span>
          </a>
        </article>
      `}).join('');
    };
    
    container.innerHTML = `
      <div class="home-layout">
        
        <section class="hero-section fade-in">
          <h1>
            A poética<br>do silêncio.
          </h1>
          <p>
            Obras contemporâneas de Natanael Brentano. Textos curtos sobre a imensidão do efêmero.
          </p>
        </section>

        <section class="poems-list fade-in">
          ${renderPoemList(poems)}
        </section>
        
        ${newsletter.render()}
      </div>
    `;

    // Search logic (using header search input)
    const searchInput = document.getElementById('header-search-input');
    const poemsList = container.querySelector('.poems-list');

    if (searchInput && poemsList) {
      // Remove previous listener if any (to avoid capturing old poems data)
      if (searchInput._handleSearch) {
        searchInput.removeEventListener('input', searchInput._handleSearch);
      }

      searchInput._handleSearch = (e) => {
        const term = e.target.value.toLowerCase().trim();
        const isSearchActive = term.length > 0;
        
        const filtered = isSearchActive 
          ? poems.filter(p => 
              p.title.toLowerCase().includes(term) || 
              (p.excerpt && p.excerpt.toLowerCase().includes(term))
            )
          : poems;

        poemsList.innerHTML = renderPoemList(filtered, isSearchActive, term);
      };

      searchInput.addEventListener('input', searchInput._handleSearch);
    }
    
    // Setup Newsletter form logic
    newsletter.init();
  }
};
