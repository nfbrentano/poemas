import { supabase } from '../utils/supabase.js';
import { navigateTo } from '../router.js';

export const filterChips = {
  async fetchMetadata() {
    const { data: poems } = await supabase
      .from('poems')
      .select('tags')
      .eq('status', 'published');
    
    const tagCounts = {};
    poems?.forEach(p => {
      (p.tags || []).forEach(t => {
        let normalized = t.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i, '').trim();
        normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
      });
    });

    return { 
      tags: Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 20)
    };
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

  async init(container, activeTags = []) {
    const { tags } = await this.fetchMetadata();
    
    const tagsContainer = container.querySelector('#dynamic-tags');

    if (tagsContainer) {
      tagsContainer.innerHTML = tags.map(tag => `
        <button class="filter-chip ${activeTags.includes(tag) ? 'active' : ''}" data-type="tag" data-value="${tag}">${tag}</button>
      `).join('');
    }

    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.type;
        const value = chip.dataset.value;
        
        let newTags = [...activeTags];

        if (value === 'all') {
          newTags = [];
        } else {
          if (newTags.includes(value)) newTags = newTags.filter(t => t !== value);
          else newTags.push(value);
        }

        const params = new URLSearchParams(window.location.search);
        if (newTags.length > 0) params.set('tags', newTags.join(','));
        else params.delete('tags');
        
        const queryString = params.toString();
        navigateTo(window.location.pathname + (queryString ? `?${queryString}` : ''));
      });
    });
  }
};
