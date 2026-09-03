import { db } from '../utils/firebase.js';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { updateSEO } from '../utils/seo.js';
import { newsletter } from '../components/newsletter.js';
import { getRandomPoem } from '../utils/navigation.js';
import { filterChips } from '../components/filter-chips.js';
import { normalizeTag, formatTag } from '../utils/tags.js';
import { stripHtml, escapeHtml } from '../utils/html.js';

export default {
  meta: {
    title: 'Natanael Brentano - Poemas'
  },
  cleanup() {
  },
  async render(container, params = {}) {
    const activeTags = params.tags ? params.tags.split(',') : [];
    const activeCols = params.cols ? params.cols.split(',') : [];
    const activeTagLegacy = params.tag ? [decodeURIComponent(params.tag)] : []; // Support legacy /tag/:tag
    const tags = [...new Set([...activeTags, ...activeTagLegacy])];

    let seoTitle = 'Natanael Brentano — Poemas';
    if (tags.length > 0 || activeCols.length > 0) {
      const parts = [];
      if (tags.length > 0) parts.push(`Sentimentos: ${tags.join(', ')}`);
      if (activeCols.length > 0) parts.push(`Coleções: ${activeCols.join(', ')}`);
      seoTitle = `${parts.join(' | ')} — Natanael Brentano`;
    }

    updateSEO({
      title: seoTitle,
      description: 'Poesia contemporânea e textos curtos sobre o efêmero.',
      type: 'website'
    });
    
    let websiteSchema = document.querySelector('script[id="website-schema"]');
    if (!websiteSchema) {
      websiteSchema = document.createElement('script');
      websiteSchema.id = 'website-schema';
      websiteSchema.type = 'application/ld+json';
      websiteSchema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://nfgbrentano.art.br/",
        "name": "Poemas — Natanael Brentano",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://nfgbrentano.art.br/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      });
      document.head.appendChild(websiteSchema);
    }
    
    const isFiltering = tags.length > 0 || activeCols.length > 0;
    
    const skeletonHtml = `
      <div class="home-layout">
        ${!isFiltering ? `
        <section class="poem-of-day" aria-hidden="true" style="min-height: 180px;">
          <div class="skeleton" style="width: 140px; height: 14px; margin: 0 auto var(--space-sm) auto; border-radius: 4px;"></div>
          <div class="skeleton" style="width: 50%; max-width: 320px; height: 28px; margin: 0 auto var(--space-sm) auto; border-radius: 4px;"></div>
          <div class="skeleton" style="width: 75%; max-width: 480px; height: 20px; margin: 0 auto; border-radius: 4px;"></div>
        </section>
        ` : ''}

        <section class="poems-list" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            <div class="filter-section">
              <div class="filter-group">
                <span class="filter-label">Sentimentos:</span>
                <div class="filter-chips">
                  <div class="skeleton" style="width: 65px; height: 32px; border-radius: 20px; display: inline-block;"></div>
                  <div class="skeleton" style="width: 80px; height: 32px; border-radius: 20px; display: inline-block;"></div>
                  <div class="skeleton" style="width: 70px; height: 32px; border-radius: 20px; display: inline-block;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="list-container">
            <div class="skeleton skeleton-featured"></div>
            ${Array(8).fill(0).map(() => `
              <div class="skeleton-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                <div class="skeleton" style="width: 45%; height: 22px; border-radius: 3px;"></div>
                <div class="skeleton" style="width: 45px; height: 22px; border-radius: 3px;"></div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
    
    container.innerHTML = skeletonHtml;
    
    // Fetch published poems with collections
    let poems = [];
    let error = null;
    try {
      const q = query(
        collection(db, 'poems'),
        where('status', '==', 'published'),
        orderBy('published_at', 'desc')
      );
      const snapshot = await getDocs(q);
      poems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      error = err;
    }
      
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

    // Collect and count tags (unifying sentiments)
    const tagCounts = {};
    poems.forEach(p => {
      (p.tags || []).forEach(t => {
        const normalized = formatTag(t);
        if (normalized) {
          tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
        }
      });
    });

    // Sort tags by frequency and take top 5
    let topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // If there's an active tag and it's not in the top 5, add it to the menu (for legacy support if needed)
    tags.forEach(tag => {
      if (!topTags.includes(tag)) topTags.push(tag);
    });
    
    topTags.sort();

    // Filter poems
    let displayPoems = poems;
    if (tags.length > 0) {
      displayPoems = displayPoems.filter(p => 
        p.tags && p.tags.some(t => {
          const normalized = normalizeTag(t).toLowerCase();
          return tags.some(at => at.toLowerCase() === normalized);
        })
      );
    }

    if (activeCols.length > 0) {
      displayPoems = displayPoems.filter(p => 
        p.collection_slugs && p.collection_slugs.some(slug => activeCols.includes(slug))
      );
    }

    // Poem of the Day Logic (only show when not filtering by tag)
    const seedStr = new Date().toISOString().slice(0, 10);
    const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const podIndex = seed % poems.length;
    const podPoem = poems[podIndex];
    
    // Remove POD from the list to avoid repetition if we are showing all
    if (!isFiltering) {
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
        
        // Show featured only if NOT searching, NOT filtering, and it's the first one
        if (!isSearchActive && !isFiltering && index === 0) {
          const rawExcerpt = poem.excerpt || stripHtml(poem.content || '').replace(/\s+/g, ' ').trim().slice(0, 160) + '...';
          return `
          <article class="poem-featured fade-in">
            <a href="${BASE_URL}poema/${poem.slug}" data-link>
              <h2 class="featured-title">${escapeHtml(poem.title)}</h2>
              <div class="featured-excerpt">${escapeHtml(rawExcerpt)}</div>
              <div class="featured-meta">
                <span>${dateStr}</span>
              </div>
            </a>
            <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="whatsapp" data-slug="${poem.slug}" data-title="${poem.title}">WhatsApp</button>
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="twitter" data-slug="${poem.slug}" data-title="${poem.title}">X (Twitter)</button>
            </div>
            <div class="featured-separator"></div>
          </article>
          `;
        }
        
        return `
        <article class="poem-row fade-in">
          <a href="${BASE_URL}poema/${poem.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
            <span class="poem-row-year">${year}</span>
          </a>
        </article>
      `}).join('');
    };
    
    const podExcerpt = podPoem ? (podPoem.excerpt || stripHtml(podPoem.content || '').replace(/\s+/g, ' ').trim().slice(0, 160) + '...') : '';

    container.innerHTML = `
      <div class="home-layout">
        
        ${!isFiltering && podPoem ? `
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${BASE_URL}poema/${podPoem.slug}" data-link class="pod-link">
            <h2 class="pod-title">${escapeHtml(podPoem.title)}</h2>
            <p class="pod-excerpt">${escapeHtml(podExcerpt)}</p>
          </a>
        </section>
        ` : ''}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${filterChips.render(tags)}
          </div>
          
          ${isFiltering ? `<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>` : ''}
          
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
    await filterChips.init(container, tags, poems);

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
        const poemsToShow = results || displayPoems;
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
    
    // Parallax logic on scroll for POD & Featured title
    let handleHomeScroll = null;
    const podTitle = container.querySelector('.pod-title');
    const featuredTitle = container.querySelector('.featured-title');
    
    if (podTitle || featuredTitle) {
      handleHomeScroll = () => {
        const scrollTop = window.scrollY;
        if (podTitle) {
          const offset = Math.min(20, scrollTop * 0.12);
          podTitle.style.transform = `translateY(${offset}px)`;
        }
        if (featuredTitle) {
          const offset = Math.min(20, scrollTop * 0.08);
          featuredTitle.style.transform = `translateY(${offset}px)`;
        }
      };
      window.addEventListener('scroll', handleHomeScroll, { passive: true });
    }

    this.cleanup = () => {
      window.removeEventListener('global-search', handleGlobalSearch);
      if (handleHomeScroll) {
        window.removeEventListener('scroll', handleHomeScroll);
      }
    };

    // Random Poem logic
    const randomHomeBtn = container.querySelector('#random-home-btn');
    randomHomeBtn?.addEventListener('click', () => {
      getRandomPoem();
    });
  }
};
