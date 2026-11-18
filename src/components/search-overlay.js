import { navigateTo } from '../router.js';
import { normalizeForSearch, escapeHtml, stripHtml, unwrapSafeHTML } from '../utils/html.js';
import { getPublishedPoems } from '../utils/poems-store.js';
import { curatedCollections, poemCurationMap } from '../data/collections.js';
import { slugifyTag, formatTag } from '../utils/tags.js';

const DEFAULT_SENTIMENT_OPTIONS = [
  { value: 'amor', label: 'Amor' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'saudade', label: 'Saudade' },
  { value: 'esperanca', label: 'Esperança' },
  { value: 'solidao', label: 'Solidão' },
  { value: 'vida', label: 'Vida' },
  { value: 'alma', label: 'Alma' },
  { value: 'paz', label: 'Paz' },
  { value: 'familia', label: 'Família' },
  { value: 'silencio', label: 'Silêncio' }
];

const SEARCH_URL_PARAMS = ['q', 'col', 'sent', 'tam', 'audio'];

/**
 * Conta o número de versos não vazios no conteúdo HTML ou texto de um poema.
 * @param {string} content
 * @returns {number}
 */
export function countPoemVerses(content) {
  if (!content || typeof content !== 'string') return 0;
  const withBreaks = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote)>/gi, '\n');
  const plain = stripHtml(withBreaks);
  return plain
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean).length;
}

/**
 * Classifica o poema por quantidade de versos:
 * curto (<= 15), medio (16-35), longo (> 35).
 * @param {object|string} poemOrContent
 * @returns {'curto'|'medio'|'longo'}
 */
export function getPoemLengthCategory(poemOrContent) {
  const content = typeof poemOrContent === 'string' ? poemOrContent : (poemOrContent?.content || '');
  const verses = countPoemVerses(content);
  if (verses <= 15) return 'curto';
  if (verses <= 35) return 'medio';
  return 'longo';
}

/**
 * Retorna todos os slugs de coleção associados a um poema (Firestore + curadoria estática).
 * @param {object} poem
 * @returns {string[]}
 */
export function getPoemCollectionSlugs(poem) {
  if (!poem || typeof poem !== 'object') return [];
  const slugs = new Set();
  if (Array.isArray(poem.collection_slugs)) {
    poem.collection_slugs.forEach(s => {
      if (s && typeof s === 'string') slugs.add(s.trim());
    });
  }
  if (poem.slug && poemCurationMap[poem.slug]) {
    slugs.add(poemCurationMap[poem.slug]);
  }
  return Array.from(slugs);
}

function getNormalizedPoemData(poem) {
  if (poem._normalized) return poem._normalized;
  return {
    title: normalizeForSearch(poem.title || ''),
    excerpt: normalizeForSearch(poem.excerpt || ''),
    content: normalizeForSearch(poem.content || ''),
    tags: (Array.isArray(poem.tags) ? poem.tags : []).map(normalizeForSearch)
  };
}

/**
 * Filtra e ordena poemas em memória combinando busca textual, coleção, sentimento,
 * faixa de tamanho e narração em áudio.
 * @param {Array<object>} poems
 * @param {object} [filters]
 * @returns {Array<object>}
 */
export function filterAndSortPoems(poems, filters = {}) {
  if (!Array.isArray(poems) || poems.length === 0) return [];

  const rawQuery = typeof filters.query === 'string' ? filters.query.trim() : '';
  const hasQuery = rawQuery.length >= 2;
  const q = hasQuery ? normalizeForSearch(rawQuery) : '';

  const colNorm = typeof filters.col === 'string' ? filters.col.trim().toLowerCase() : '';
  const sentRaw = typeof filters.sent === 'string' ? filters.sent.trim() : '';
  const sentNorm = sentRaw ? normalizeForSearch(sentRaw) : '';
  const sentSlug = sentRaw ? slugifyTag(sentRaw) : '';
  const tamNorm = typeof filters.tam === 'string' ? normalizeForSearch(filters.tam.trim()) : '';
  const audioOnly = filters.audio === true || filters.audio === '1' || filters.audio === 'true';
  const sortBy = filters.sortBy || 'relevance';

  const hasActiveCriteria = hasQuery || Boolean(colNorm) || Boolean(sentNorm) || Boolean(tamNorm) || audioOnly;
  if (!hasActiveCriteria) {
    return [];
  }

  const filtered = poems.filter(p => {
    if (!p || p.status === 'draft' || p.status === 'scheduled') return false;

    const n = getNormalizedPoemData(p);

    if (hasQuery) {
      const matchesText = n.title.includes(q) ||
        n.excerpt.includes(q) ||
        n.content.includes(q) ||
        n.tags.some(t => t.includes(q));
      if (!matchesText) return false;
    }

    if (colNorm) {
      const cols = getPoemCollectionSlugs(p).map(c => c.toLowerCase());
      if (!cols.includes(colNorm)) return false;
    }

    if (sentNorm) {
      const rawTags = Array.isArray(p.tags) ? p.tags : [];
      const matchesTag = rawTags.some(t => {
        const tagNorm = normalizeForSearch(t);
        const tagSlug = slugifyTag(t);
        return tagNorm === sentNorm || tagNorm.includes(sentNorm) || (sentSlug && tagSlug === sentSlug);
      });
      if (!matchesTag) return false;
    }

    if (tamNorm && getPoemLengthCategory(p) !== tamNorm) {
      return false;
    }

    if (audioOnly && !(p.audio_url && String(p.audio_url).trim())) {
      return false;
    }

    return true;
  });

  if (sortBy === 'recent' || !hasQuery) {
    filtered.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  } else {
    filtered.sort((a, b) => {
      const na = getNormalizedPoemData(a);
      const nb = getNormalizedPoemData(b);

      const aExact = na.title === q;
      const bExact = nb.title === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aTitleStart = na.title.startsWith(q);
      const bTitleStart = nb.title.startsWith(q);
      if (aTitleStart && !bTitleStart) return -1;
      if (!aTitleStart && bTitleStart) return 1;

      const aTitleIn = na.title.includes(q);
      const bTitleIn = nb.title.includes(q);
      if (aTitleIn && !bTitleIn) return -1;
      if (!aTitleIn && bTitleIn) return 1;

      const aExcerptIn = na.excerpt.includes(q);
      const bExcerptIn = nb.excerpt.includes(q);
      if (aExcerptIn && !bExcerptIn) return -1;
      if (!aExcerptIn && bExcerptIn) return 1;

      return new Date(b.published_at || 0) - new Date(a.published_at || 0);
    });
  }

  return filtered;
}

export const searchOverlay = {
  overlay: null,
  allPoemsCache: null,
  sortBy: 'relevance',
  filters: {
    col: '',
    sent: '',
    tam: '',
    audio: false
  },

  hasActiveFilters() {
    const f = this.filters || {};
    return Boolean(f.col || f.sent || f.tam || f.audio);
  },

  populateDynamicFilters(poems = []) {
    const sentSelect = this.overlay?.querySelector('#search-filter-sentiment');
    if (!sentSelect) return;

    const currentVal = this.filters?.sent || sentSelect.value || '';
    const optionMap = new Map();

    DEFAULT_SENTIMENT_OPTIONS.forEach(opt => {
      optionMap.set(opt.value, opt.label);
    });

    (poems || []).forEach(poem => {
      (Array.isArray(poem?.tags) ? poem.tags : []).forEach(tag => {
        const slug = slugifyTag(tag);
        const label = formatTag(tag);
        if (slug && label && !optionMap.has(slug)) {
          optionMap.set(slug, label);
        }
      });
    });

    if (currentVal && !optionMap.has(currentVal)) {
      optionMap.set(currentVal, formatTag(currentVal) || currentVal);
    }

    const sortedEntries = Array.from(optionMap.entries()).sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
    sentSelect.textContent = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Todos os sentimentos';
    sentSelect.appendChild(defaultOption);

    sortedEntries.forEach(([value, label]) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      sentSelect.appendChild(opt);
    });

    sentSelect.value = currentVal;
  },

  syncFilterControlsFromState() {
    if (!this.overlay) return;
    const colSelect = this.overlay.querySelector('#search-filter-collection');
    const sentSelect = this.overlay.querySelector('#search-filter-sentiment');
    const lenSelect = this.overlay.querySelector('#search-filter-length');
    const audioCheckbox = this.overlay.querySelector('#search-filter-audio');

    if (colSelect) colSelect.value = this.filters.col || '';
    if (sentSelect) {
      if (this.filters.sent && !Array.from(sentSelect.options).some(o => o.value === this.filters.sent)) {
        const opt = document.createElement('option');
        opt.value = this.filters.sent;
        opt.textContent = formatTag(this.filters.sent) || this.filters.sent;
        sentSelect.appendChild(opt);
      }
      sentSelect.value = this.filters.sent || '';
    }
    if (lenSelect) lenSelect.value = this.filters.tam || '';
    if (audioCheckbox) audioCheckbox.checked = Boolean(this.filters.audio);
  },

  syncUrlWithState(query) {
    if (!this.overlay || !this.overlay.classList.contains('active')) return;
    const url = new URL(window.location);

    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');

    if (this.filters.col) url.searchParams.set('col', this.filters.col);
    else url.searchParams.delete('col');

    if (this.filters.sent) url.searchParams.set('sent', this.filters.sent);
    else url.searchParams.delete('sent');

    if (this.filters.tam) url.searchParams.set('tam', this.filters.tam);
    else url.searchParams.delete('tam');

    if (this.filters.audio) url.searchParams.set('audio', '1');
    else url.searchParams.delete('audio');

    history.replaceState({ ...history.state, searchOpen: true }, '', url);
  },

  async loadAllPoems() {
    if (this.allPoemsCache) {
      this.populateDynamicFilters(this.allPoemsCache);
      return this.allPoemsCache;
    }
    try {
      const poems = await getPublishedPoems();
      const data = poems.map((docData) => ({
        ...docData,
        _normalized: {
          title: normalizeForSearch(docData.title || ''),
          excerpt: normalizeForSearch(docData.excerpt || ''),
          content: normalizeForSearch(docData.content || ''),
          tags: (docData.tags || []).map(normalizeForSearch)
        }
      }));
      this.allPoemsCache = data;
      this.populateDynamicFilters(this.allPoemsCache);
      return this.allPoemsCache;
    } catch (error) {
      console.error('Error fetching all poems for search cache:', error);
      return [];
    }
  },

  renderSearchResults(results, query = '') {
    const resultsContainer = document.getElementById('search-results');
    const sortingContainer = document.getElementById('search-sorting');
    const resultsCountEl = document.getElementById('search-results-count');

    if (!resultsContainer) return;

    const cleanQuery = typeof query === 'string' ? query.trim() : '';
    const hasActiveSearch = cleanQuery.length >= 2 || this.hasActiveFilters();
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

    resultsContainer.innerHTML = unwrapSafeHTML(results.map(poem => {
      const q = cleanQuery.length >= 2 ? normalizeForSearch(cleanQuery) : '';
      const n = getNormalizedPoemData(poem);

      const inTitle = q ? n.title.includes(q) : false;
      const inExcerpt = q && n.excerpt ? n.excerpt.includes(q) : false;
      const inContent = q && n.content ? n.content.includes(q) : false;
      const inTag = q && n.tags ? n.tags.some(t => t.includes(q)) : false;
      const hasAudio = Boolean(poem.audio_url && String(poem.audio_url).trim());
      const audioBadge = hasAudio
        ? ' <span class="audio-badge" aria-label="Com narração em áudio" title="Com narração em áudio">🔊</span>'
        : '';

      let badge = '';
      let snippetHtml = '';

      let baseExcerpt = poem.excerpt;
      if (!baseExcerpt && poem.content) {
        baseExcerpt = stripHtml(poem.content).substring(0, 120).trim() + '...';
      }

      if (cleanQuery.length >= 2) {
        if (inTitle) {
          badge = '<span class="search-match-badge badge-title">no título</span>';
          snippetHtml = `<div class="search-result-excerpt">${highlight(baseExcerpt, cleanQuery)}</div>`;
        } else if (inContent) {
          badge = '<span class="search-match-badge badge-content">no poema</span>';
          const snippet = this.getSnippet(poem.content, cleanQuery) || baseExcerpt;
          snippetHtml = `<div class="search-result-snippet">"${highlight(snippet, cleanQuery)}"</div>`;
        } else if (inTag) {
          badge = '<span class="search-match-badge badge-tag">no sentimento</span>';
          snippetHtml = `<div class="search-result-excerpt">${highlight(baseExcerpt, cleanQuery)}</div>`;
        } else if (inExcerpt) {
          snippetHtml = `<div class="search-result-excerpt">${highlight(baseExcerpt, cleanQuery)}</div>`;
        } else {
          snippetHtml = `<div class="search-result-excerpt">${escapeHtml(baseExcerpt)}</div>`;
        }
      } else {
        snippetHtml = `<div class="search-result-excerpt">${escapeHtml(baseExcerpt || '')}</div>`;
      }

      return `
        <div class="search-result-item" data-slug="${escapeHtml(poem.slug)}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <div class="search-result-title">${highlight(poem.title, cleanQuery)}${audioBadge}</div>
            ${badge}
          </div>
          ${snippetHtml}
          ${poem.tags && poem.tags.length > 0 ? `<div class="search-result-tags" style="font-size:0.7rem; color:var(--accent-subtle); margin-top:4px;">${poem.tags.map(t => highlight(t, cleanQuery)).join(', ')}</div>` : ''}
        </div>
      `;
    }).join(''));

    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const slug = item.getAttribute('data-slug');
        this.close();
        navigateTo(`/poema/${slug}`);
      });
    });
  },

  triggerSearch() {
    const input = this.overlay?.querySelector('#overlay-search-input') || document.getElementById('overlay-search-input');
    const colSelect = this.overlay?.querySelector('#search-filter-collection') || document.getElementById('search-filter-collection');
    const sentSelect = this.overlay?.querySelector('#search-filter-sentiment') || document.getElementById('search-filter-sentiment');
    const lenSelect = this.overlay?.querySelector('#search-filter-length') || document.getElementById('search-filter-length');
    const audioCheckbox = this.overlay?.querySelector('#search-filter-audio') || document.getElementById('search-filter-audio');
    const clearBtn = this.overlay?.querySelector('#search-clear-btn') || document.getElementById('search-clear-btn');

    const query = input ? input.value.trim() : '';
    this.filters = {
      col: colSelect ? colSelect.value : (this.filters.col || ''),
      sent: sentSelect ? sentSelect.value : (this.filters.sent || ''),
      tam: lenSelect ? lenSelect.value : (this.filters.tam || ''),
      audio: audioCheckbox ? Boolean(audioCheckbox.checked) : Boolean(this.filters.audio)
    };

    if (clearBtn) {
      clearBtn.style.display = (query || this.hasActiveFilters()) ? 'block' : 'none';
    }

    this.syncUrlWithState(query);

    if (!this.allPoemsCache) return;

    const hasCriteria = query.length >= 2 || this.hasActiveFilters();
    if (!hasCriteria) {
      this.renderSearchResults([], query);
      window.dispatchEvent(new CustomEvent('global-search', {
        detail: { query, filters: { ...this.filters }, results: null }
      }));
      return;
    }

    const filtered = filterAndSortPoems(this.allPoemsCache, {
      query,
      ...this.filters,
      sortBy: this.sortBy
    });

    this.renderSearchResults(filtered, query);

    window.dispatchEvent(new CustomEvent('global-search', {
      detail: { query, filters: { ...this.filters }, results: filtered }
    }));
  },

  clearFilters() {
    const input = this.overlay?.querySelector('#overlay-search-input') || document.getElementById('overlay-search-input');
    const colSelect = this.overlay?.querySelector('#search-filter-collection') || document.getElementById('search-filter-collection');
    const sentSelect = this.overlay?.querySelector('#search-filter-sentiment') || document.getElementById('search-filter-sentiment');
    const lenSelect = this.overlay?.querySelector('#search-filter-length') || document.getElementById('search-filter-length');
    const audioCheckbox = this.overlay?.querySelector('#search-filter-audio') || document.getElementById('search-filter-audio');
    const clearBtn = this.overlay?.querySelector('#search-clear-btn') || document.getElementById('search-clear-btn');

    if (input) input.value = '';
    if (colSelect) colSelect.value = '';
    if (sentSelect) sentSelect.value = '';
    if (lenSelect) lenSelect.value = '';
    if (audioCheckbox) audioCheckbox.checked = false;
    if (clearBtn) clearBtn.style.display = 'none';

    this.filters = { col: '', sent: '', tam: '', audio: false };
    this.triggerSearch();
    if (input) input.focus();
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

    const collectionOptionsHtml = curatedCollections
      .map(c => `<option value="${escapeHtml(c.slug)}">${escapeHtml(c.name)}</option>`)
      .join('');

    const sentimentOptionsHtml = DEFAULT_SENTIMENT_OPTIONS
      .map(s => `<option value="${escapeHtml(s.value)}">${escapeHtml(s.label)}</option>`)
      .join('');

    const controlStyle = 'padding: 0.4rem 0.6rem; border: 1px solid var(--border-subtle); border-radius: 4px; background: var(--bg-elevated, var(--bg-primary)); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.82rem; cursor: pointer;';

    this.overlay = document.createElement('div');
    this.overlay.id = 'search-overlay';
    this.overlay.className = 'search-overlay';
    this.overlay.innerHTML = unwrapSafeHTML(`
      <div class="search-overlay-content">
        <button class="search-overlay-close" id="search-close-btn" aria-label="Fechar busca">&times;</button>
        <div class="search-input-wrapper">
          <input type="search" id="overlay-search-input" placeholder="Buscar por título, trecho ou sentimento..." aria-label="Buscar poema" autocomplete="off">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <button id="search-clear-btn" class="search-clear-btn" aria-label="Limpar busca">&times;</button>
        </div>

        <div class="search-filters-bar" id="search-filters-bar" style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center; margin-top:0.75rem;">
          <select id="search-filter-collection" aria-label="Filtrar por coleção" style="${controlStyle}">
            <option value="">Todas as coleções</option>
            ${collectionOptionsHtml}
          </select>
          <select id="search-filter-sentiment" aria-label="Filtrar por sentimento" style="${controlStyle}">
            <option value="">Todos os sentimentos</option>
            ${sentimentOptionsHtml}
          </select>
          <select id="search-filter-length" aria-label="Filtrar por tamanho" style="${controlStyle}">
            <option value="">Qualquer tamanho</option>
            <option value="curto">Curto (até 15 versos)</option>
            <option value="medio">Médio (16–35 versos)</option>
            <option value="longo">Longo (36+ versos)</option>
          </select>
          <label class="search-audio-toggle" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.4rem 0.6rem; border:1px solid var(--border-subtle); border-radius:4px; font-family:var(--font-ui); font-size:0.82rem; color:var(--text-primary); cursor:pointer;">
            <input type="checkbox" id="search-filter-audio">
            <span>Com narração em áudio 🔊</span>
          </label>
          <button type="button" id="search-clear-filters-btn" class="search-clear-filters-btn" style="padding:0.4rem 0.65rem; border:1px solid var(--border-subtle); border-radius:4px; background:transparent; color:var(--text-secondary); font-family:var(--font-ui); font-size:0.8rem; cursor:pointer;">
            Limpar filtros
          </button>
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
    `);
    document.body.appendChild(this.overlay);

    const input = this.overlay.querySelector('#overlay-search-input');
    const clearBtn = this.overlay.querySelector('#search-clear-btn');
    const clearFiltersBtn = this.overlay.querySelector('#search-clear-filters-btn');
    const sortSelect = this.overlay.querySelector('#search-sort-select');
    const colSelect = this.overlay.querySelector('#search-filter-collection');
    const sentSelect = this.overlay.querySelector('#search-filter-sentiment');
    const lenSelect = this.overlay.querySelector('#search-filter-length');
    const audioCheckbox = this.overlay.querySelector('#search-filter-audio');

    const debouncedSearch = this.debounce(() => {
      this.triggerSearch();
    }, 250);

    input.addEventListener('input', () => {
      if (clearBtn) clearBtn.style.display = (input.value || this.hasActiveFilters()) ? 'block' : 'none';
      debouncedSearch();
    });

    colSelect?.addEventListener('change', () => this.triggerSearch());
    sentSelect?.addEventListener('change', () => this.triggerSearch());
    lenSelect?.addEventListener('change', () => this.triggerSearch());
    audioCheckbox?.addEventListener('change', () => this.triggerSearch());

    sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.triggerSearch();
    });

    clearBtn?.addEventListener('click', () => {
      this.clearFilters();
    });

    clearFiltersBtn?.addEventListener('click', () => {
      this.clearFilters();
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
    });
  },

  async open(initialQuery = null) {
    this.init();
    const wasActive = this.overlay.classList.contains('active');

    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q');
    const effectiveQuery = initialQuery !== null ? initialQuery : (urlQuery || '');

    this.filters = {
      col: (urlParams.get('col') || '').trim(),
      sent: (urlParams.get('sent') || '').trim(),
      tam: (urlParams.get('tam') || '').trim(),
      audio: urlParams.get('audio') === '1' || urlParams.get('audio') === 'true'
    };

    const hasUrlCriteria = Boolean(effectiveQuery) || this.hasActiveFilters();

    this.overlay.classList.add('active');
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (!wasActive) {
      if (!hasUrlCriteria) {
        this.pushedState = true;
        history.pushState({ ...history.state, searchOpen: true }, '');
      } else {
        this.pushedState = false;
        history.replaceState({ ...history.state, searchOpen: true }, '');
      }
    }

    const input = this.overlay.querySelector('#overlay-search-input');
    if (input) {
      input.value = effectiveQuery;
    }
    this.syncFilterControlsFromState();

    // Lazy load cache
    await this.loadAllPoems();
    this.syncFilterControlsFromState();

    if (input) {
      if (hasUrlCriteria) {
        const clearBtn = this.overlay.querySelector('#search-clear-btn');
        if (clearBtn) clearBtn.style.display = (effectiveQuery || this.hasActiveFilters()) ? 'block' : 'none';
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
      const colSelect = this.overlay.querySelector('#search-filter-collection');
      const sentSelect = this.overlay.querySelector('#search-filter-sentiment');
      const lenSelect = this.overlay.querySelector('#search-filter-length');
      const audioCheckbox = this.overlay.querySelector('#search-filter-audio');
      const clearBtn = this.overlay.querySelector('#search-clear-btn');

      if (input) input.value = '';
      if (resultsContainer) resultsContainer.innerHTML = '';
      if (colSelect) colSelect.value = '';
      if (sentSelect) sentSelect.value = '';
      if (lenSelect) lenSelect.value = '';
      if (audioCheckbox) audioCheckbox.checked = false;
      if (clearBtn) clearBtn.style.display = 'none';
      this.filters = { col: '', sent: '', tam: '', audio: false };

      window.dispatchEvent(new CustomEvent('global-search', {
        detail: { query: '', filters: { ...this.filters }, results: null }
      }));

      if (fromPopState !== true) {
        if (this.pushedState) {
          history.back();
        } else {
          const url = new URL(window.location);
          SEARCH_URL_PARAMS.forEach(p => url.searchParams.delete(p));
          history.replaceState({ ...history.state, searchOpen: false }, '', url);
        }
      }
    }
  }
};
