import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { newsletter } from '../components/newsletter.js';
import { getRandomPoem } from '../utils/navigation.js';

export default {
  meta: {
    title: 'Natanael Brentano - Poemas'
  },
  cleanup() {
  },
  async render(container, params = {}) {
    const activeTag = params.tag ? decodeURIComponent(params.tag) : null;

    if (activeTag) {
      updateSEO({
        title: `Tag: ${activeTag} — Natanael Brentano`,
        description: `Poemas marcados com a tag ${activeTag}.`,
        type: 'website'
      });
    } else {
      updateSEO({
        title: 'Natanael Brentano — Poemas',
        description: 'Poesia contemporânea e textos curtos sobre o efêmero.',
        type: 'website'
      });
    }
    
    const skeletonHtml = `
      <div class="home-layout fade-in">
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
    
    const BASE_URL = import.meta.env.BASE_URL;

    // Collect and count tags
    const tagCounts = {};
    poems.forEach(p => {
      (p.tags || []).forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    // Sort tags by frequency and take top 5
    let topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // If there's an activeTag and it's not in the top 5, add it to the menu
    if (activeTag && !topTags.includes(activeTag)) {
      topTags.push(activeTag);
    }
    
    topTags.sort(); // Keep alphabetical in UI

    // Filter poems if tag is active
    let displayPoems = poems;
    if (activeTag) {
      displayPoems = poems.filter(p => p.tags && p.tags.includes(activeTag));
    }

    // Poem of the Day Logic (only show when not filtering by tag)
    const seedStr = new Date().toISOString().slice(0, 10);
    const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const podIndex = seed % poems.length;
    const podPoem = poems[podIndex];
    
    // Remove POD from the list to avoid repetition if we are showing all
    if (!activeTag) {
      displayPoems = displayPoems.filter((_, i) => i !== podIndex);
    }

    // Helper to render the poem list
    const renderPoemList = (items, isSearchActive = false, searchTerm = '') => {
      if (items.length === 0) {
        return `
          <p class="search-empty-msg">
            Nenhum poema encontrado${searchTerm ? ` para "<strong>${searchTerm}</strong>"` : ''}.
          </p>
        `;
      }

      return items.map((poem, index) => {
        const year = new Date(poem.published_at).getFullYear();
        const dateStr = new Date(poem.published_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        // Show featured only if NOT searching, NOT filtering by tag, and it's the first one
        if (!isSearchActive && !activeTag && index === 0) {
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
            <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="featured-share-btn" data-platform="whatsapp" data-slug="${poem.slug}" data-title="${poem.title}" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Partilhar no Zap</button>
              <button class="featured-share-btn" data-platform="twitter" data-slug="${poem.slug}" data-title="${poem.title}" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Tweetar</button>
            </div>
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
    
    const renderTagsMenu = () => {
      if (topTags.length === 0) return '';
      return `
        <div class="tags-menu fade-in">
          <a href="${BASE_URL}" data-link class="tag-chip ${!activeTag ? 'active' : ''}">Todos</a>
          ${topTags.map(tag => `
            <a href="${BASE_URL}tag/${encodeURIComponent(tag)}" data-link class="tag-chip ${tag === activeTag ? 'active' : ''}">${tag}</a>
          `).join('')}
        </div>
      `;
    };

    container.innerHTML = `
      <div class="home-layout">
        
        ${!activeTag && podPoem ? `
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${BASE_URL}poema/${podPoem.slug}" data-link class="pod-link">
            <h2 class="pod-title">${podPoem.title}</h2>
            <p class="pod-excerpt">${podPoem.excerpt || ''}</p>
          </a>
        </section>
        ` : ''}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          ${renderTagsMenu()}
          
          ${activeTag ? `<h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center;">Poemas sobre "${activeTag}"</h2>` : ''}
          
          <div class="list-container">
            ${renderPoemList(displayPoems)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${newsletter.render()}
      </div>
    `;


    
    newsletter.init();

    // Setup Event Listeners for featured share
    container.querySelectorAll('.featured-share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const { platform, slug, title } = btn.dataset;
        const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}poema/${slug}`;
        const shareText = `Leia "${title}", de Natanael Brentano:`;
        
        let url = '';
        if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    const handleGlobalSearch = (e) => {
      const { query, results } = e.detail;
      const searchTerm = query;
      const listContainer = container.querySelector('.list-container');

      if (listContainer) {
        // Se temos resultados pré-filtrados do evento global, usamos eles.
        // Caso contrário (como ao fechar a busca), voltamos para a lista original.
        const poemsToShow = results || remainingPoems;
        listContainer.innerHTML = renderPoemList(poemsToShow, searchTerm.length > 0, searchTerm);
      }
      
      // Hide POD and Hero when searching
      const podSection = container.querySelector('.poem-of-day');
      const heroSection = container.querySelector('.hero-section');
      if (searchTerm.length > 0) {
        if (podSection) podSection.style.display = 'none';
        if (heroSection) heroSection.style.display = 'none';
      } else {
        if (podSection) podSection.style.display = 'block';
        if (heroSection) heroSection.style.display = 'block';
      }
    };

    window.addEventListener('global-search', handleGlobalSearch);
    
    this.cleanup = () => {
      window.removeEventListener('global-search', handleGlobalSearch);
    };

    // Random Poem logic
    const randomHomeBtn = container.querySelector('#random-home-btn');
    randomHomeBtn?.addEventListener('click', () => {
      getRandomPoem();
    });
  }
};
