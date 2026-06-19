import { supabase } from '../utils/supabase.js';
import { navigateTo } from '../router.js';
import { formatTag } from '../utils/tags.js';

let cachedTags = null;

export const filterChips = {
  async fetchMetadata(initialPoems = null) {
    if (cachedTags) {
      return { tags: cachedTags };
    }

    let poems = initialPoems;
    if (!poems) {
      const { data } = await supabase
        .from('poems')
        .select('tags')
        .eq('status', 'published');
      poems = data;
    }
    
    const tagCounts = {};
    poems?.forEach(p => {
      (p.tags || []).forEach(t => {
        const normalized = formatTag(t);
        if (normalized) {
          tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
        }
      });
    });

    const tags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 20);

    if (tags.length > 0) {
      cachedTags = tags;
    }

    return { tags };
  },

  render(activeTags = []) {
    return `
      <div class="filter-section fade-in">
        <div class="filter-group">
          <span class="filter-label">Sentimentos:</span>
          <div class="filter-chips" id="tag-filters">
            <button class="filter-chip ${activeTags.length === 0 ? 'active' : ''}" data-type="tag" data-value="all">Todos</button>
            <div id="dynamic-tags" class="filter-chips-scroll"></div>
          </div>
        </div>
      </div>
    `;
  },

  async init(container, activeTags = [], initialPoems = null) {
    const { tags } = await this.fetchMetadata(initialPoems);
    
    const tagsContainer = container.querySelector('#dynamic-tags');

    if (tagsContainer) {
      tagsContainer.innerHTML = tags.map(tag => `
        <button class="filter-chip ${activeTags.includes(tag) ? 'active' : ''}" data-type="tag" data-value="${tag}">${tag}</button>
      `).join('');
    }

    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value;
        let newTags = [...activeTags];

        if (value === 'all') {
          newTags = [];
        } else {
          // Toggle tag
          const index = newTags.indexOf(value);
          if (index > -1) newTags.splice(index, 1);
          else newTags.push(value);
        }

        const params = new URLSearchParams(window.location.search);
        if (newTags.length > 0) params.set('tags', newTags.join(','));
        else params.delete('tags');
        
        const queryString = params.toString();
        const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
        const relativePath = window.location.pathname.replace(basePath, '') || '/';
        navigateTo(relativePath + (queryString ? `?${queryString}` : ''));
      });
    });

  }
};
