import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGetDocs = vi.fn();

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

vi.mock('./router.js', () => ({
  navigateTo: vi.fn()
}));

import { getPublishedPoems } from './utils/poems-store.js';
import { hydrateFavoriteBadges, toggleFavorite, clearFavorites } from './utils/favorites.js';
import homePage from './pages/home.js';
import sentimentPage from './pages/sentiment.js';
import collectionsPage from './pages/collections.js';
import collectionPage from './pages/collection.js';

const AUDIO_POEM = {
  id: 'poem-abraco',
  slug: 'o-abraco',
  title: 'O Abraço',
  content: 'Verso inicial sobre o abraço.\nSegunda linha de poesia.',
  excerpt: 'Verso inicial sobre o abraço.',
  tags: ['Amor'],
  collection_slugs: ['amor-e-conexao'],
  audio_url: 'https://cdn.example.com/o-abraco.mp3',
  status: 'published',
  published_at: '2026-05-01T12:00:00Z'
};

describe('Paridade de selos 🔖/🔊 e hidratação pré-renderizada (SDD 2026-11-24)', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    clearFavorites();
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '<main id="main-content"></main>';
    container = document.getElementById('main-content');

    getPublishedPoems.mockResolvedValue([AUDIO_POEM]);
    mockGetDocs.mockImplementation(async (q) => {
      const colName = q?.col?.name;
      if (colName === 'collections') {
        return {
          empty: false,
          docs: [{
            id: 'col-amor',
            data: () => ({
              slug: 'amor-e-conexao',
              name: 'Amor e Conexão',
              description: 'Versos sobre afeto.'
            })
          }]
        };
      }
      if (colName === 'collection_poems') {
        return {
          empty: false,
          docs: [{
            id: 'cp-1',
            data: () => ({
              collection_id: 'col-amor',
              poem_id: 'poem-abraco',
              order: 1
            })
          }],
          forEach: (cb) => cb({
            id: 'cp-1',
            data: () => ({
              collection_id: 'col-amor',
              poem_id: 'poem-abraco',
              order: 1
            })
          })
        };
      }
      return { empty: true, docs: [], forEach: () => {} };
    });
  });

  afterEach(() => {
    clearFavorites();
    localStorage.clear();
  });

  it('CT01: exibe selos 🔖 e 🔊 no Poema do Dia (Home), em Sentimento e em Obras do Acervo (Coleções)', async () => {
    toggleFavorite({ slug: AUDIO_POEM.slug, id: AUDIO_POEM.id });

    // 1. Home (Poema do Dia)
    await homePage.render(container, {});
    const podTitle = container.querySelector('.pod-title');
    expect(podTitle).not.toBeNull();
    expect(podTitle.querySelector('.favorite-badge')?.textContent).toBe('🔖');
    expect(podTitle.querySelector('.audio-badge')?.textContent).toBe('🔊');

    // 2. Sentimento (/sentimento/amor/)
    container.innerHTML = '';
    await sentimentPage.render(container, { slug: 'amor' });
    const sentRowTitle = container.querySelector('.poem-row-title');
    expect(sentRowTitle).not.toBeNull();
    expect(sentRowTitle.querySelector('.favorite-badge')?.textContent).toBe('🔖');
    expect(sentRowTitle.querySelector('.audio-badge')?.textContent).toBe('🔊');

    // 3. Coleções (/colecoes/ -> Obras do Acervo)
    container.innerHTML = '';
    await collectionsPage.render(container, {});
    const colsRowTitle = container.querySelector('#filtered-poems-list .poem-row-title');
    expect(colsRowTitle).not.toBeNull();
    expect(colsRowTitle.querySelector('.favorite-badge')?.textContent).toBe('🔖');
    expect(colsRowTitle.querySelector('.audio-badge')?.textContent).toBe('🔊');
  });

  it('CT02: hydrateFavoriteBadges adiciona 🔖 antes de 🔊 em DOM pré-renderizado sem recriar o container', () => {
    toggleFavorite({ slug: 'o-abraco' });
    container.innerHTML = `
      <section class="collection-detail">
        <div class="poems-list">
          <article class="poem-row">
            <a href="/poema/o-abraco/" class="poem-row-link" data-link>
              <div class="poem-row-main">
                <h3 class="poem-row-title">O Abraço <span class="audio-badge">🔊</span></h3>
              </div>
            </a>
          </article>
        </div>
      </section>
    `;

    const sectionBefore = container.querySelector('section.collection-detail');
    hydrateFavoriteBadges(container);

    expect(container.querySelector('section.collection-detail')).toBe(sectionBefore);
    const titleEl = container.querySelector('.poem-row-title');
    const favBadge = titleEl.querySelector('.favorite-badge');
    const audioBadge = titleEl.querySelector('.audio-badge');
    expect(favBadge?.textContent).toBe('🔖');
    expect(audioBadge?.textContent).toBe('🔊');
    expect(Array.from(titleEl.children).indexOf(favBadge)).toBeLessThan(
      Array.from(titleEl.children).indexOf(audioBadge)
    );
  });

  it('CT02: hidrata selo 🔖 em /colecao/<slug>/ e /sentimento/<slug>/ pré-renderizados preservando o DOM estático', async () => {
    toggleFavorite({ slug: 'o-abraco' });

    // /colecao/amor-e-conexao/ pré-renderizado
    container.setAttribute('data-prerendered', '/colecao/amor-e-conexao');
    container.innerHTML = `
      <section class="collection-detail">
        <header class="collection-header">
          <a id="start-collection-reading-btn" href="/poema/o-abraco/?colecao=amor-e-conexao">Começar leitura</a>
        </header>
        <div class="poems-list">
          <article class="poem-row">
            <a href="/poema/o-abraco/" class="poem-row-link" data-collection-slug="amor-e-conexao" data-poem-slug="o-abraco" data-link>
              <div class="poem-row-main">
                <h3 class="poem-row-title">O Abraço <span class="audio-badge">🔊</span></h3>
              </div>
            </a>
          </article>
        </div>
      </section>
    `;

    const colSectionBefore = container.querySelector('section.collection-detail');
    await collectionPage.render(container, { slug: 'amor-e-conexao' });

    expect(container.querySelector('section.collection-detail')).toBe(colSectionBefore);
    expect(container.querySelector('.poem-row-title .favorite-badge')?.textContent).toBe('🔖');

    // /sentimento/amor/ pré-renderizado
    container.setAttribute('data-prerendered', '/sentimento/amor');
    container.innerHTML = `
      <section class="collection-detail sentiment-detail">
        <div class="poems-list">
          <article class="poem-row">
            <a href="/poema/o-abraco/" class="poem-row-link" data-poem-slug="o-abraco" data-link>
              <div class="poem-row-main">
                <h3 class="poem-row-title">O Abraço <span class="audio-badge">🔊</span></h3>
              </div>
            </a>
          </article>
        </div>
      </section>
    `;

    const sentSectionBefore = container.querySelector('section.sentiment-detail');
    await sentimentPage.render(container, { slug: 'amor' });

    expect(container.querySelector('section.sentiment-detail')).toBe(sentSectionBefore);
    expect(container.querySelector('.poem-row-title .favorite-badge')?.textContent).toBe('🔖');
  });
});
