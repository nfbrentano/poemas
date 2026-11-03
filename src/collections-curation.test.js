import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  curatedCollections,
  poemCurationMap,
  enrichCollectionsWithCurated,
  mergeRelationsWithCurated
} from './data/collections.js';
import { renderCollectionsPageMarkup } from './utils/collections-template.js';
import collectionPage from './pages/collection.js';
import collectionsPage from './pages/collections.js';
import { getPublishedPoems } from './utils/poems-store.js';
import { getDocs } from 'firebase/firestore';

vi.mock('./utils/firebase.js', () => ({
  db: {},
  app: {},
  getFirebaseAuth: vi.fn(),
  getFirebaseStorage: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  documentId: vi.fn(),
  getDocs: vi.fn()
}));

vi.mock('./utils/poems-store.js', () => ({
  getPublishedPoems: vi.fn()
}));

describe('{FEAT} Curadoria Temática e Novas Coleções (SDD 2026-11-03)', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = `
      <title>Poemas Brasileiros — Natanael Fernando Gatti Brentano</title>
      <link rel="canonical" href="https://nfgbrentano.art.br/colecoes/" />
    `;
    document.body.innerHTML = '<main id="main-content"></main>';
    container = document.getElementById('main-content');
    window.history.replaceState({}, '', '/colecoes/');
  });

  describe('CT01: Cobertura de Novas Coleções e Mapeamento de Órfãos (CA01, CA03)', () => {
    it('curatedCollections deve definir 7 coleções temáticas incluindo Alma e Autoconhecimento e Poesia e Cotidiano', () => {
      const slugs = curatedCollections.map(c => c.slug);
      expect(slugs).toContain('alma-e-autoconhecimento');
      expect(slugs).toContain('poesia-e-cotidiano');
      expect(slugs).toContain('amor-e-conexao');
      expect(slugs).toContain('reflexoes-e-tempo');
      expect(slugs).toContain('familia-e-afeto');
      expect(slugs).toContain('paz-e-esperanca');
      expect(slugs).toContain('amor');
      expect(curatedCollections.length).toBe(7);
    });

    it('poemCurationMap deve mapear os 75 poemas órfãos para coleções temáticas válidas', () => {
      const mappedSlugs = Object.keys(poemCurationMap);
      expect(mappedSlugs.length).toBeGreaterThanOrEqual(75);

      const validColSlugs = new Set(curatedCollections.map(c => c.slug));
      for (const [poemSlug, colSlug] of Object.entries(poemCurationMap)) {
        expect(validColSlugs.has(colSlug), `Coleção "${colSlug}" para o poema "${poemSlug}" deve ser válida`).toBe(true);
      }
    });

    it('mergeRelationsWithCurated deve integrar os poemas mapeados e desduplicar pares', () => {
      const poems = [
        { id: 'p-essencia', slug: 'a-essencia-do-eu', title: 'A Essência do Eu' },
        { id: 'p-palavras', slug: 'palavras', title: 'Palavras' },
        { id: 'p-filha', slug: 'para-minha-filha', title: 'Para Minha Filha' }
      ];
      const collections = curatedCollections;
      const initialRelations = [
        { collection_id: 'col-alma-autoconhecimento', poem_id: 'p-essencia' } // Já existente
      ];

      const merged = mergeRelationsWithCurated(initialRelations, poems, collections);

      // Não duplica p-essencia e adiciona palavras e filha
      const essenciaCount = merged.filter(r => r.poem_id === 'p-essencia').length;
      expect(essenciaCount).toBe(1);

      expect(merged.some(r => r.poem_id === 'p-palavras')).toBe(true);
      expect(merged.some(r => r.poem_id === 'p-filha')).toBe(true);
    });
  });

  describe('CT02: Renderização de /colecoes/ com as 7 Coleções (CA01)', () => {
    it('renderCollectionsPageMarkup deve renderizar as 7 coleções temáticas no topo', () => {
      const collectionsWithCounts = curatedCollections.map((c, i) => ({
        ...c,
        poemCount: (i + 1) * 10
      }));

      const html = renderCollectionsPageMarkup({
        collections: collectionsWithCounts,
        poems: []
      });
      container.innerHTML = html;

      const cards = container.querySelectorAll('.collection-card');
      expect(cards.length).toBe(7);

      expect(container.querySelector('a[href="/colecao/alma-e-autoconhecimento/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/colecao/poesia-e-cotidiano/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/colecao/amor-e-conexao/"]')).not.toBeNull();
    });

    it('collectionsPage.render deve carregar as 7 coleções mesmo se o Firestore retornar apenas as 5 antigas', async () => {
      const firestoreCols = [
        { id: 'c1', data: () => ({ name: 'Amor e Conexão', slug: 'amor-e-conexao' }) },
        { id: 'c2', data: () => ({ name: 'Reflexões e Tempo', slug: 'reflexoes-e-tempo' }) },
        { id: 'c3', data: () => ({ name: 'Família e Afeto', slug: 'familia-e-afeto' }) },
        { id: 'c4', data: () => ({ name: 'Paz e Esperança', slug: 'paz-e-esperanca' }) },
        { id: 'c5', data: () => ({ name: 'Amor', slug: 'amor' }) }
      ];

      getDocs
        .mockResolvedValueOnce({ docs: firestoreCols, forEach: cb => firestoreCols.forEach(cb) })
        .mockResolvedValueOnce({ docs: [], forEach: () => {} });

      getPublishedPoems.mockResolvedValueOnce([
        { id: 'p1', slug: 'a-essencia-do-eu', title: 'A Essência do Eu', published_at: '2026-01-01' }
      ]);

      await collectionsPage.render(container);

      const cards = container.querySelectorAll('.collection-card');
      expect(cards.length).toBe(7);
      expect(container.querySelector('a[href="/colecao/alma-e-autoconhecimento/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/colecao/poesia-e-cotidiano/"]')).not.toBeNull();
    });
  });

  describe('CT03: Renderização Individual de Nova Coleção /colecao/:slug/ (CA02)', () => {
    it('collectionPage.render deve renderizar nova coleção curada mesmo que o Firestore retorne vazio', async () => {
      getDocs
        .mockResolvedValueOnce({ empty: true, docs: [] }) // Firestore não tem o doc ainda
        .mockResolvedValueOnce({ docs: [], forEach: () => {} });

      getPublishedPoems.mockResolvedValueOnce([
        {
          id: 'p-essencia',
          title: 'A Essência do Eu',
          slug: 'a-essencia-do-eu',
          content: 'No centro do silêncio habita a verdade.',
          published_at: '2026-01-01'
        }
      ]);

      await collectionPage.render(container, { slug: 'alma-e-autoconhecimento' });

      expect(container.querySelector('h1')?.textContent).toBe('Alma e Autoconhecimento');
      expect(container.querySelector('.collection-meta')?.textContent).toContain('1 poema');
      expect(container.querySelector('a[href="/poema/a-essencia-do-eu/"]')).not.toBeNull();
      expect(container.querySelector('.poem-row-excerpt')?.textContent).toContain('No centro do silêncio habita a verdade.');
    });
  });
});
