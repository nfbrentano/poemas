import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { getPublishedPoemsMock } = vi.hoisted(() => ({
  getPublishedPoemsMock: vi.fn()
}));

vi.mock('./utils/poems-store.js', () => ({
  getPublishedPoems: (...args) => getPublishedPoemsMock(...args)
}));

vi.mock('./utils/analytics.js', () => ({
  trackPageView: vi.fn()
}));

import {
  searchOverlay,
  countPoemVerses,
  getPoemLengthCategory,
  filterAndSortPoems
} from './components/search-overlay.js';
import {
  getFavorites,
  toggleFavorite,
  clearFavorites,
  exportFavoritesJson,
  encodeFavoritesShareParam,
  decodeFavoritesShareParam,
  mergeFavorites
} from './utils/favorites.js';
import favoritesPage from './pages/favorites.js';

function makeLines(count) {
  return Array.from({ length: count }, (_, i) => `<p>Verso número ${i + 1}</p>`).join('');
}

const SAMPLE_POEMS = [
  {
    id: 'id-curto-audio',
    slug: 'tempo-de-luz',
    title: 'Tempo de Luz',
    excerpt: 'Um instante de luz no tempo.',
    content: '<p>Um instante breve de luz.<br>O tempo passa sereno.</p>',
    tags: ['Amor', 'Tempo'],
    collection_slugs: ['amor-e-conexao'],
    audio_url: 'https://cdn.exemplo.com/tempo-de-luz.mp3',
    status: 'published',
    published_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 'id-curto-sem-audio',
    slug: 'solidao-breve',
    title: 'Solidão Breve',
    excerpt: 'Silêncio curto.',
    content: makeLines(6),
    tags: ['Solidao'],
    collection_slugs: ['alma-e-autoconhecimento'],
    audio_url: null,
    status: 'published',
    published_at: '2026-09-15T10:00:00Z'
  },
  {
    id: 'id-medio-audio',
    slug: 'esperanca-no-mar',
    title: 'Esperança no Mar',
    excerpt: 'Ondas e tempo.',
    content: `${makeLines(20)}<p>Luz clara no horizonte do mar.</p>`,
    tags: ['Esperanca', 'Amor'],
    collection_slugs: ['paz-e-esperanca'],
    audio_url: 'https://cdn.exemplo.com/esperanca-no-mar.mp3',
    status: 'published',
    published_at: '2026-08-20T10:00:00Z'
  },
  {
    id: 'id-longo-audio',
    slug: 'travessia-longa',
    title: 'Travessia Longa',
    excerpt: 'Caminhada extensa pelo tempo.',
    content: makeLines(42),
    tags: ['Tempo', 'Vida'],
    collection_slugs: ['reflexoes-e-tempo'],
    audio_url: 'https://cdn.exemplo.com/travessia-longa.mp3',
    status: 'published',
    published_at: '2026-07-10T10:00:00Z'
  },
  {
    id: 'id-luz-sem-audio',
    slug: 'luz-silenciosa',
    title: 'Lúcida Manhã',
    excerpt: 'Brilho de amor sem acento.',
    content: '<p>Toda luz do amor desperta.</p>',
    tags: ['Amor'],
    collection_slugs: ['amor'],
    audio_url: '',
    status: 'published',
    published_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'id-curto-outro',
    slug: 'abraco-calmo',
    title: 'Abraço Calmo',
    excerpt: 'Ternura em dois versos.',
    content: '<p>Um abraço acolhe o tempo.<br>Na paz do lar.</p>',
    tags: ['Familia', 'Paz'],
    collection_slugs: ['familia-e-afeto'],
    audio_url: 'https://cdn.exemplo.com/abraco-calmo.mp3',
    status: 'published',
    published_at: '2026-06-05T10:00:00Z'
  },
  {
    id: 'id-draft',
    slug: 'poema-rascunho-secreto',
    title: 'Rascunho Secreto',
    excerpt: 'Não publicado.',
    content: '<p>Luz oculta com áudio.</p>',
    tags: ['Amor'],
    collection_slugs: ['amor'],
    audio_url: 'https://cdn.exemplo.com/rascunho.mp3',
    status: 'draft',
    published_at: '2026-11-10T10:00:00Z'
  }
];

function resetSearchOverlayState() {
  if (searchOverlay.overlay && searchOverlay.overlay.parentNode) {
    searchOverlay.overlay.parentNode.removeChild(searchOverlay.overlay);
  }
  searchOverlay.overlay = null;
  searchOverlay.allPoemsCache = null;
  searchOverlay.sortBy = 'relevance';
  searchOverlay.filters = { col: '', sent: '', tam: '', audio: false };
}

describe('[FEAT] Busca Avançada e Portabilidade de Favoritos (SDD 2026-11-13)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearFavorites();
    resetSearchOverlayState();
    vi.clearAllMocks();
    getPublishedPoemsMock.mockResolvedValue(SAMPLE_POEMS.filter(p => p.status === 'published'));
    window.history.replaceState({}, '', '/');
    document.body.innerHTML = '<main id="main-content"></main>';
  });

  afterEach(() => {
    resetSearchOverlayState();
    clearFavorites();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    document.body.style.overflow = '';
    document.body.innerHTML = '';
  });

  describe('CT01 & CA01 & CA02 & CA07 & RNF01: Filtragem combinada multi-critério e UI do Search Overlay', () => {
    it('classifica corretamente poemas curtos, médios e longos por quantidade de versos', () => {
      expect(countPoemVerses('<p>Linha 1<br>Linha 2</p><p>Linha 3</p>')).toBe(3);
      expect(getPoemLengthCategory(makeLines(15))).toBe('curto');
      expect(getPoemLengthCategory(makeLines(16))).toBe('medio');
      expect(getPoemLengthCategory(makeLines(35))).toBe('medio');
      expect(getPoemLengthCategory(makeLines(36))).toBe('longo');
    });

    it('filterAndSortPoems combina áudio + tamanho sem termo textual e termo sem acento + sentimento com desempenho < 50ms', () => {
      const audioShort = filterAndSortPoems(SAMPLE_POEMS, { audio: true, tam: 'curto' });
      expect(audioShort.map(p => p.slug)).toEqual(['tempo-de-luz', 'abraco-calmo']);

      const lightAndLove = filterAndSortPoems(SAMPLE_POEMS, { query: 'luz', sent: 'amor' });
      expect(lightAndLove.map(p => p.slug)).toEqual(['tempo-de-luz', 'luz-silenciosa', 'esperanca-no-mar']);

      const largeSet = Array.from({ length: 320 }, (_, i) => ({
        ...SAMPLE_POEMS[i % 6],
        id: `perf-${i}`,
        slug: `poema-perf-${i}`
      }));
      const t0 = performance.now();
      const perfRes = filterAndSortPoems(largeSet, { query: 'tempo', audio: true, tam: 'curto' });
      const elapsed = performance.now() - t0;
      expect(perfRes.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(50);
    });

    it('overlay exibe resultados apenas por filtros, mostra selo 🔊 e Limpar filtros restaura estado e foca input', async () => {
      await searchOverlay.open();

      const input = document.getElementById('overlay-search-input');
      const colSelect = document.getElementById('search-filter-collection');
      const sentSelect = document.getElementById('search-filter-sentiment');
      const lenSelect = document.getElementById('search-filter-length');
      const audioCheckbox = document.getElementById('search-filter-audio');
      const clearFiltersBtn = document.getElementById('search-clear-filters-btn');

      // CA01: Com narração em áudio + curto sem texto
      audioCheckbox.checked = true;
      audioCheckbox.dispatchEvent(new Event('change'));
      lenSelect.value = 'curto';
      lenSelect.dispatchEvent(new Event('change'));

      let slugs = Array.from(document.querySelectorAll('.search-result-item')).map(el => el.dataset.slug);
      expect(slugs).toEqual(['tempo-de-luz', 'abraco-calmo']);

      // CA02 & RF03: termo "luz" + sentimento "amor" e selo 🔊 apenas nos com audio_url
      audioCheckbox.checked = false;
      audioCheckbox.dispatchEvent(new Event('change'));
      lenSelect.value = '';
      lenSelect.dispatchEvent(new Event('change'));
      input.value = 'luz';
      sentSelect.value = 'amor';
      sentSelect.dispatchEvent(new Event('change'));

      const items = Array.from(document.querySelectorAll('.search-result-item'));
      slugs = items.map(el => el.dataset.slug);
      expect(slugs).toEqual(['tempo-de-luz', 'luz-silenciosa', 'esperanca-no-mar']);

      const audioItem = items.find(el => el.dataset.slug === 'tempo-de-luz');
      const noAudioItem = items.find(el => el.dataset.slug === 'luz-silenciosa');
      expect(audioItem.querySelector('.audio-badge')?.textContent).toContain('🔊');
      expect(noAudioItem.querySelector('.audio-badge')).toBeNull();

      // CA07: Limpar filtros reseta controles, URL e foca o input
      colSelect.value = 'amor-e-conexao';
      colSelect.dispatchEvent(new Event('change'));
      const focusSpy = vi.spyOn(input, 'focus');

      clearFiltersBtn.click();

      expect(input.value).toBe('');
      expect(colSelect.value).toBe('');
      expect(sentSelect.value).toBe('');
      expect(lenSelect.value).toBe('');
      expect(audioCheckbox.checked).toBe(false);
      expect(window.location.search).toBe('');
      expect(focusSpy).toHaveBeenCalled();
      expect(document.querySelectorAll('.search-result-item').length).toBe(0);
    });
  });

  describe('CT02 & CA03: Sincronia e restauração de filtros via URL', () => {
    it('restaura q, audio e tamanho a partir da URL ao abrir o searchOverlay', async () => {
      window.history.replaceState({}, '', '/?q=tempo&audio=1&tam=curto');

      await searchOverlay.open();

      const input = document.getElementById('overlay-search-input');
      const audioCheckbox = document.getElementById('search-filter-audio');
      const lenSelect = document.getElementById('search-filter-length');

      expect(input.value).toBe('tempo');
      expect(audioCheckbox.checked).toBe(true);
      expect(lenSelect.value).toBe('curto');

      const slugs = Array.from(document.querySelectorAll('.search-result-item')).map(el => el.dataset.slug);
      expect(slugs).toEqual(['tempo-de-luz', 'abraco-calmo']);
    });
  });

  describe('CT03 & CA04: Busca interna em /favoritos/ sem alterar dados persistidos', () => {
    it('exibe busca interna com >= 5 favoritos e filtra visualmente sem chamar removeFavorite', async () => {
      const sixPoems = SAMPLE_POEMS.filter(p => p.status === 'published');
      getPublishedPoemsMock.mockResolvedValue(sixPoems);

      sixPoems.forEach(p => toggleFavorite({ slug: p.slug, id: p.id }));
      expect(getFavorites()).toHaveLength(6);

      const container = document.getElementById('main-content');
      await favoritesPage.render(container);

      const searchInput = container.querySelector('#favorites-search-input');
      expect(searchInput).not.toBeNull();
      expect(container.querySelectorAll('.favorite-item')).toHaveLength(6);

      searchInput.value = 'esperanca';
      searchInput.dispatchEvent(new Event('input'));

      const visible = Array.from(container.querySelectorAll('.favorite-item')).map(el => el.dataset.slug);
      expect(visible).toEqual(['esperanca-no-mar']);
      expect(getFavorites()).toHaveLength(6);
    });
  });

  describe('CT04 & CA05 & CA06 & RNF02 & RNF03: Exportar, mesclar e validar portabilidade de favoritos', () => {
    it('exportFavoritesJson, encode/decodeFavoritesShareParam e mergeFavorites mesclam válidos e rejeitam malformados/rascunhos', () => {
      // 4 favoritos exportados no navegador A
      const browserAPoems = SAMPLE_POEMS.slice(0, 4);
      browserAPoems.forEach(p => toggleFavorite({ slug: p.slug, id: p.id }));

      const exportedJson = exportFavoritesJson();
      const shareParam = encodeFavoritesShareParam();
      expect(JSON.parse(exportedJson).slugs).toHaveLength(4);
      expect(shareParam.split(',')).toHaveLength(4);

      // Validação estrita de decodificação (XSS, maiúsculas, limite 500)
      const decoded = decodeFavoritesShareParam(`${shareParam},<script>alert(1)</script>,INV@LID,slug-valido`);
      expect(decoded.slugs).toContain('tempo-de-luz');
      expect(decoded.slugs).toContain('slug-valido');
      expect(decoded.slugs).not.toContain('<script>alert(1)</script>');
      expect(decoded.invalidCount).toBe(2);

      const hugeInput = Array.from({ length: 520 }, (_, i) => `poema-${i}`).join(',');
      expect(decodeFavoritesShareParam(hugeInput).slugs).toHaveLength(500);

      // Navegador B já possui 1 favorito diferente + 1 sobreposto opcional; importamos os 4 do A + inválidos/draft
      clearFavorites();
      toggleFavorite({ slug: 'abraco-calmo', id: 'id-curto-outro' });

      const merged = mergeFavorites(
        `${shareParam},poema-rascunho-secreto,<script>bad()</script>,nao-existe`,
        { publishedPoems: SAMPLE_POEMS }
      );

      expect(merged.success).toBe(true);
      expect(merged.addedCount).toBe(4);
      expect(merged.totalCount).toBe(5);
      expect(merged.ignoredCount).toBe(3);

      const finalSlugs = getFavorites().map(f => f.slug);
      expect(finalSlugs).toHaveLength(5);
      expect(finalSlugs).toContain('abraco-calmo');
      expect(finalSlugs).toContain('tempo-de-luz');
      expect(finalSlugs).not.toContain('poema-rascunho-secreto');

      // JSON totalmente inválido retorna erro claro
      const invalidRes = mergeFavorites('{json-quebrado', { publishedPoems: SAMPLE_POEMS });
      expect(invalidRes.success).toBe(false);
      expect(invalidRes.error).toBe('JSON inválido');
    });

    it('página /favoritos/?import=... mantém noindex, nofollow e permite confirmar importação mesclando sem duplicatas', async () => {
      toggleFavorite({ slug: 'abraco-calmo', id: 'id-curto-outro' });
      window.history.replaceState(
        {},
        '',
        '/favoritos/?import=tempo-de-luz,solidao-breve,esperanca-no-mar,travessia-longa,poema-rascunho-secreto,%3Cscript%3E'
      );

      const container = document.getElementById('main-content');
      await favoritesPage.render(container);

      expect(favoritesPage.meta.robots).toBe('noindex, nofollow');
      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');

      const banner = container.querySelector('#favorites-import-banner');
      expect(banner).not.toBeNull();
      expect(banner.textContent).toContain('4');

      container.querySelector('#confirm-import-btn').click();

      expect(getFavorites()).toHaveLength(5);
      expect(container.querySelectorAll('.favorite-item')).toHaveLength(5);
      expect(window.location.search).toBe('');
    });

    it('painel manual de portabilidade importa JSON válido e botão Copiar link gera ?import=', async () => {
      toggleFavorite({ slug: 'tempo-de-luz', id: 'id-curto-audio' });
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true
      });

      const container = document.getElementById('main-content');
      await favoritesPage.render(container);

      container.querySelector('#copy-favorites-link-btn').click();
      await Promise.resolve();
      expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('/favoritos/?import=tempo-de-luz'));

      container.querySelector('#toggle-import-panel-btn').click();
      const textarea = container.querySelector('#import-favorites-textarea');
      textarea.value = JSON.stringify({ slugs: ['luz-silenciosa', 'tempo-de-luz', 'poema-rascunho-secreto'] });
      container.querySelector('#submit-import-favorites-btn').click();

      const slugs = getFavorites().map(f => f.slug);
      expect(slugs).toEqual(['luz-silenciosa', 'tempo-de-luz']);
    });
  });
});
