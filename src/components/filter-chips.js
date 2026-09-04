import { db } from '../utils/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
      try {
        const q = query(collection(db, 'poems'), where('status', '==', 'published'));
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          data.push({ tags: docData.tags });
        });
        poems = data;
      } catch (err) {
        poems = [];
      }
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

    const tags = Object.keys(tagCounts).map(name => ({ name, count: tagCounts[name] }))
      .sort((a, b) => b.count - a.count).slice(0, 20);

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
        <button class="filter-chip ${activeTags.includes(tag.name) ? 'active' : ''}" data-type="tag" data-value="${tag.name}">
          ${tag.name} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em; margin-left: 2px;">(${tag.count})</span>
        </button>
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
