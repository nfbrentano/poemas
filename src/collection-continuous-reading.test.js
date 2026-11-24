import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGetDocs = vi.fn();
const mockNavigateTo = vi.fn();

vi.mock('./utils/firebase.js', () => ({
  db: {},
  app: {},
  getFirebaseAuth: vi.fn(),
  getFirebaseFunctions: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn((_db, name) => ({ name })),
  query: vi.fn((col, ...constraints) => ({ col, constraints })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  orderBy: vi.fn((field, dir) => ({ field, dir })),
  limit: vi.fn((n) => ({ n })),
  getDocs: (...args) => mockGetDocs(...args)
}));

vi.mock('./utils/poems-store.js', () => ({
  getPublishedPoems: vi.fn()
}));

vi.mock('./utils/analytics.js', () => ({
  trackPageView: vi.fn()
}));

vi.mock('./router.js', () => ({
  navigateTo: (...args) => mockNavigateTo(...args)
}));

import {
  getCollectionReadingContext,
  resolveCollectionContextForPoem
} from './utils/collection-order.js';
import { getPublishedPoems } from './utils/poems-store.js';
import collectionPage from './pages/collection.js';
import poemPage from './pages/poem.js';
import favoritesPage from './pages/favorites.js';
import { cleanupPrintAnthology } from './utils/print-anthology.js';
import { toggleFavorite } from './utils/favorites.js';

const SAMPLE_COLLECTION_ID = '75c966b1-bf90-464e-a6bd-fa00f1c6e81b';

const SERIES_POEMS = [
  {
    id: 'p-1',
    slug: 'o-abraco',
    title: 'O Abraço',
    content: 'Verso inicial do abraço.\n<script>alert("xss")</script>',
    excerpt: 'Verso inicial do abraço.',
    collection_slugs: ['amor-e-conexao'],
    status: 'published',
    published_at: '2026-01-01T12:00:00Z'
  },
  {
    id: 'p-2',
    slug: 'partilhar',
    title: 'Partilhar',
    content: 'Dividir silêncios e manhãs.',
    excerpt: 'Dividir silêncios.',
    collection_slugs: ['amor-e-conexao'],
    status: 'published',
    published_at: '2026-01-02T12:00:00Z'
  },
  {
    id: 'p-3',
    slug: 'ser-porto',
    title: 'Ser Porto',
    content: 'Ancorar no cais sereno.',
    excerpt: 'Ancorar no cais sereno.',
    collection_slugs: ['amor-e-conexao'],
    status: 'published',
    published_at: '2026-01-03T12:00:00Z'
  },
  {
    id: 'p-global-extra',
    slug: 'poema-fora-da-serie',
    title: 'Poema Fora da Série',
    content: 'Outro tema distante.',
    collection_slugs: ['poesia-e-cotidiano'],
    status: 'published',
    published_at: '2026-01-04T12:00:00Z'
  }
];

function setupFirestoreCollectionMocks({ relations = [
  { collection_id: SAMPLE_COLLECTION_ID, poem_id: 'p-3', order: 1 },
  { collection_id: SAMPLE_COLLECTION_ID, poem_id: 'p-1', order: 2 },
  { collection_id: SAMPLE_COLLECTION_ID, poem_id: 'p-2', order: 3 }
] } = {}) {
  mockGetDocs.mockImplementation(async (q) => {
    const colName = q?.col?.name;
    if (colName === 'collections') {
      const slugFilter = q.constraints?.find(c => c.field === 'slug')?.val;
      if (slugFilter === 'amor-e-conexao' || (Array.isArray(slugFilter) && slugFilter.includes('amor-e-conexao'))) {
        return {
          empty: false,
          docs: [{
            id: SAMPLE_COLLECTION_ID,
            data: () => ({
              slug: 'amor-e-conexao',
              name: 'Amor e Conexão',
              description: 'Versos sobre afeto e encontro.'
            })
          }],
          forEach: (cb) => cb({
            id: SAMPLE_COLLECTION_ID,
            data: () => ({
              slug: 'amor-e-conexao',
              name: 'Amor e Conexão',
              description: 'Versos sobre afeto e encontro.'
            })
          })
        };
      }
      return { empty: true, docs: [], forEach: () => {} };
    }

    if (colName === 'collection_poems') {
      return {
        empty: relations.length === 0,
        docs: relations.map(r => ({ data: () => r })),
        forEach: (cb) => relations.forEach(r => cb({ data: () => r }))
      };
    }

    if (colName === 'poems') {
      const slugFilter = q.constraints?.find(c => c.field === 'slug')?.val;
      const found = SERIES_POEMS.find(p => p.slug === slugFilter);
      if (found) {
        return {
          empty: false,
          docs: [{ id: found.id, data: () => ({ ...found, prev_slug: 'global-prev', prev_title: 'Global Anterior', next_slug: 'global-next', next_title: 'Global Próximo' }) }]
        };
      }
      return { empty: true, docs: [] };
    }

    return { empty: true, docs: [], forEach: () => {} };
  });
}

describe('[FEAT] Leitura contínua em coleção (Modo Antologia e impressão de série)', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanupPrintAnthology();
    localStorage.clear();
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="app"><main id="main-content"></main></div>';
    container = document.getElementById('main-content');
    window.history.replaceState({}, '', '/');
    getPublishedPoems.mockResolvedValue(SERIES_POEMS);
  });

  afterEach(() => {
    poemPage.cleanup();
    cleanupPrintAnthology();
    vi.restoreAllMocks();
  });

  it('CT01 & CA01 & CA02: calcula adjacentes, posição (X de Y) e início/fim da série respeitando ordem customizada', () => {
    const ordered = [
      { id: '1', slug: 'p-a', title: 'Poema A' },
      { id: '2', slug: 'p-b', title: 'Poema B' },
      { id: '3', slug: 'p-c', title: 'Poema C' }
    ];

    const middle = getCollectionReadingContext(ordered, 'p-b', { slug: 'serie', name: 'Série' });
    expect(middle.prev).toEqual(ordered[0]);
    expect(middle.next).toEqual(ordered[2]);
    expect(middle.index).toBe(2);
    expect(middle.total).toBe(3);

    const first = getCollectionReadingContext(ordered, 'p-a', { slug: 'serie', name: 'Série' });
    expect(first.prev).toBeNull();
    expect(first.prevSlug).toBe('');
    expect(first.next).toEqual(ordered[1]);
    expect(first.index).toBe(1);

    const last = getCollectionReadingContext(ordered, 'p-c', { slug: 'serie', name: 'Série' });
    expect(last.prev).toEqual(ordered[1]);
    expect(last.next).toBeNull();
    expect(last.nextSlug).toBe('');
    expect(last.index).toBe(3);

    // Respeita `order` curado diferente da ordem cronológica
    const customResolved = resolveCollectionContextForPoem({
      collectionSlug: 'amor-e-conexao',
      poemSlug: 'o-abraco',
      allPoems: SERIES_POEMS,
      firestoreRelations: [
        { collection_id: SAMPLE_COLLECTION_ID, poem_id: 'p-3', order: 1 },
        { collection_id: SAMPLE_COLLECTION_ID, poem_id: 'p-1', order: 2 },
        { collection_id: SAMPLE_COLLECTION_ID, poem_id: 'p-2', order: 3 }
      ]
    });
    expect(customResolved.index).toBe(2);
    expect(customResolved.total).toBe(3);
    expect(customResolved.prevSlug).toBe('ser-porto');
    expect(customResolved.nextSlug).toBe('partilhar');
  });

  it('CT02 & CA07 & RNF02: faz fallback transparente para ordem global quando coleção é inválida ou poema não pertence a ela', async () => {
    // Coleção inexistente e poema fora da coleção testados diretamente
    expect(resolveCollectionContextForPoem({
      collectionSlug: 'colecao-inexistente',
      poemSlug: 'o-abraco',
      allPoems: SERIES_POEMS
    })).toBeNull();

    expect(resolveCollectionContextForPoem({
      collectionSlug: 'amor-e-conexao',
      poemSlug: 'poema-fora-da-serie',
      allPoems: SERIES_POEMS
    })).toBeNull();

    // Renderização com ?colecao=colecao-inexistente mantém navegação global sem banner
    setupFirestoreCollectionMocks();
    getPublishedPoems.mockResolvedValue(
      SERIES_POEMS.map(p => (p.slug === 'o-abraco'
        ? { ...p, prev_slug: 'global-prev', prev_title: 'Global Anterior', next_slug: 'global-next', next_title: 'Global Próximo' }
        : p))
    );
    window.history.replaceState({}, '', '/poema/o-abraco/?colecao=colecao-inexistente');
    await poemPage.render(container, { slug: 'o-abraco', colecao: 'colecao-inexistente' });

    expect(container.querySelector('#poem-series-banner')).toBeNull();
    expect(container.querySelector('#prev-btn')?.getAttribute('href')).toBe('/poema/global-prev/');
    expect(container.querySelector('#next-btn')?.getAttribute('href')).toBe('/poema/global-next/');
  });

  it('CT03 & CA06 & RNF01: preserva canonical e og:url sem query string quando ?colecao=<slug> está presente', async () => {
    setupFirestoreCollectionMocks();
    window.history.replaceState({}, '', '/poema/o-abraco/?colecao=amor-e-conexao');

    await poemPage.render(container, { slug: 'o-abraco', colecao: 'amor-e-conexao' });

    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');

    expect(canonical).toBe('https://nfgbrentano.art.br/poema/o-abraco/');
    expect(ogUrl).toBe('https://nfgbrentano.art.br/poema/o-abraco/');
  });

  it('CT04 & CA05 & RNF03: popula #print-library-container com escape XSS em coleção e favoritos filtrados e limpa após afterprint', async () => {
    const printSpy = vi.fn();
    Object.defineProperty(window, 'print', { value: printSpy, configurable: true, writable: true });

    // 1. Impressão a partir da página de coleção
    setupFirestoreCollectionMocks();
    await collectionPage.render(container, { slug: 'amor-e-conexao' });

    const colPrintBtn = container.querySelector('#print-collection-btn');
    expect(colPrintBtn).not.toBeNull();
    colPrintBtn.click();

    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains('is-printing-anthology')).toBe(true);

    const printContainer = document.getElementById('print-library-container');
    expect(printContainer).not.toBeNull();
    expect(printContainer.textContent).toContain('Amor e Conexão');
    expect(printContainer.textContent).toContain('Ser Porto');
    expect(printContainer.textContent).toContain('O Abraço');
    expect(printContainer.textContent).toContain('Partilhar');
    // Verifica que <script> não foi injetado como elemento executável
    expect(printContainer.querySelector('script')).toBeNull();
    expect(printContainer.textContent).not.toContain('alert("xss")');

    // Dispara afterprint -> limpa DOM e classe do body
    window.dispatchEvent(new Event('afterprint'));
    expect(document.getElementById('print-library-container')).toBeNull();
    expect(document.body.classList.contains('is-printing-anthology')).toBe(false);

    // 2. Impressão em /favoritos/ respeitando filtro ativo
    const favPoems = [
      { id: 'f1', slug: 'aurora-dourada', title: 'Aurora Dourada', content: 'Luz na janela.', status: 'published', published_at: '2026-01-01T12:00:00Z' },
      { id: 'f2', slug: 'vento-frio', title: 'Vento Frio', content: 'Brisa da serra.', status: 'published', published_at: '2026-01-02T12:00:00Z' },
      { id: 'f3', slug: 'chuva-mansa', title: 'Chuva Mansa', content: 'Gotas no vidro.', status: 'published', published_at: '2026-01-03T12:00:00Z' },
      { id: 'f4', slug: 'mar-calmo', title: 'Mar Calmo', content: 'Ondas lentas.', status: 'published', published_at: '2026-01-04T12:00:00Z' },
      { id: 'f5', slug: 'noite-clara', title: 'Noite Clara', content: 'Lua cheia.', status: 'published', published_at: '2026-01-05T12:00:00Z' }
    ];
    getPublishedPoems.mockResolvedValueOnce(favPoems);
    favPoems.forEach(p => toggleFavorite(p));

    await favoritesPage.render(container);

    const searchInput = container.querySelector('#favorites-search-input');
    expect(searchInput).not.toBeNull();
    searchInput.value = 'Aurora';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    container.querySelector('#print-favorites-btn').click();
    expect(printSpy).toHaveBeenCalledTimes(2);

    const favPrintContainer = document.getElementById('print-library-container');
    expect(favPrintContainer.textContent).toContain('Aurora Dourada');
    expect(favPrintContainer.textContent).not.toContain('Vento Frio');
    expect(favPrintContainer.textContent).not.toContain('Noite Clara');

    window.dispatchEvent(new Event('afterprint'));
    expect(document.getElementById('print-library-container')).toBeNull();
  });

  it('CT05 & CA01 & CA02 & CA03 & CA04: "Começar leitura" inicia série no 1º poema e teclado/swipe preservam ?colecao=', async () => {
    setupFirestoreCollectionMocks();

    // 1. Coleção com 3 poemas ordenados (p-3 -> p-1 -> p-2)
    await collectionPage.render(container, { slug: 'amor-e-conexao' });

    const startBtn = container.querySelector('#start-collection-reading-btn');
    expect(startBtn).not.toBeNull();
    expect(startBtn.getAttribute('href')).toBe('/poema/ser-porto/?colecao=amor-e-conexao');

    startBtn.click();
    expect(mockNavigateTo).toHaveBeenCalledWith('/poema/ser-porto/?colecao=amor-e-conexao');

    // 2. Abre o 1º poema da série (`ser-porto`)
    mockNavigateTo.mockClear();
    window.history.replaceState({}, '', '/poema/ser-porto/?colecao=amor-e-conexao');
    await poemPage.render(container, { slug: 'ser-porto', colecao: 'amor-e-conexao' });

    const banner = container.querySelector('#poem-series-banner');
    expect(banner).not.toBeNull();
    expect(banner.textContent).toContain('Série: Amor e Conexão');
    expect(banner.textContent).toContain('Poema 1 de 3');
    expect(banner.querySelector('a.poem-series-back')?.getAttribute('href')).toBe('/colecao/amor-e-conexao/');

    // CA02: No 1º poema, #prev-btn está oculto sem apontar para poema fora da série
    const prevBtn = container.querySelector('#prev-btn');
    expect(prevBtn.tagName).toBe('DIV');
    expect(prevBtn.style.visibility).toBe('hidden');

    // CA01: #next-btn aponta para o 2º poema com ?colecao=
    const nextBtn = container.querySelector('#next-btn');
    expect(nextBtn.tagName).toBe('A');
    expect(nextBtn.getAttribute('href')).toBe('/poema/o-abraco/?colecao=amor-e-conexao');

    // CA03: ArrowRight navega para o 2º poema mantendo ?colecao=
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(mockNavigateTo).toHaveBeenCalledWith('/poema/o-abraco/?colecao=amor-e-conexao');

    // Renderiza 2º poema e verifica swipe mobile + ArrowLeft
    poemPage.cleanup();
    mockNavigateTo.mockClear();
    window.history.replaceState({}, '', '/poema/o-abraco/?colecao=amor-e-conexao');
    await poemPage.render(container, { slug: 'o-abraco', colecao: 'amor-e-conexao' });

    expect(container.querySelector('#poem-series-banner')?.textContent).toContain('Poema 2 de 3');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(mockNavigateTo).toHaveBeenCalledWith('/poema/ser-porto/?colecao=amor-e-conexao');

    mockNavigateTo.mockClear();
    document.dispatchEvent(Object.assign(new Event('touchstart'), { touches: [{ clientX: 250, clientY: 100 }] }));
    document.dispatchEvent(Object.assign(new Event('touchend'), { changedTouches: [{ clientX: 50, clientY: 100 }] }));
    expect(mockNavigateTo).toHaveBeenCalledWith('/poema/partilhar/?colecao=amor-e-conexao');

    // Renderiza 3º (último) poema -> botão final aponta de volta para a coleção
    poemPage.cleanup();
    window.history.replaceState({}, '', '/poema/partilhar/?colecao=amor-e-conexao');
    await poemPage.render(container, { slug: 'partilhar', colecao: 'amor-e-conexao' });

    expect(container.querySelector('#poem-series-banner')?.textContent).toContain('Poema 3 de 3');
    const endBtn = container.querySelector('#next-btn');
    expect(endBtn.tagName).toBe('A');
    expect(endBtn.getAttribute('href')).toBe('/colecao/amor-e-conexao/');
    expect(endBtn.textContent).toContain('Voltar ao índice da coleção');
  });
});
