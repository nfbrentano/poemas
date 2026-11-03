import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderCollectionsPageMarkup } from './utils/collections-template.js';
import { countPoemsByCollection, formatPoemCount } from './pages/admin/collection-counts.js';
import collectionsPage from './pages/collections.js';
import collectionPage from './pages/collection.js';
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

describe('[FIX] Organização e Correção Estrutural das Coleções (SDD 2026-11-03)', () => {
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

  describe('CT01: Layout e Apresentação dos Cards na Página /colecoes/ (CA01, CA02)', () => {
    it('renderCollectionsPageMarkup deve renderizar coleções no topo com capa editorial e contagens precisas', () => {
      const collections = [
        {
          name: 'Amor e Conexão',
          slug: 'amor-e-conexao',
          description: 'Versos sobre entrega e cumplicidade.',
          poemCount: 119
        },
        {
          name: 'Reflexões e Tempo',
          slug: 'reflexoes-e-tempo',
          description: 'Meditações sobre a passagem dos dias.',
          poemCount: 76
        }
      ];

      const html = renderCollectionsPageMarkup({
        collections,
        poems: [
          { title: 'Verso Um', slug: 'verso-um', content: 'Conteúdo poético', published_at: '2026-01-01T00:00:00Z' }
        ],
        sentiments: [
          { name: 'Saudade', slug: 'saudade', count: 10 }
        ]
      });
      container.innerHTML = html;

      // H1 claro de Coleções
      expect(container.querySelector('h1')?.textContent).toBe('Coleções');

      // Grid de coleções no topo da página
      const cards = container.querySelectorAll('.collection-card');
      expect(cards.length).toBe(2);

      // Card 1: Amor e Conexão com capa editorial (sem imagem quebrada) e descrição
      const card1 = cards[0];
      expect(card1.querySelector('.collection-name')?.textContent).toBe('Amor e Conexão');
      expect(card1.querySelector('.collection-count')?.textContent).toBe('119 poemas');
      expect(card1.querySelector('.collection-desc-preview')?.textContent).toContain('Versos sobre entrega e cumplicidade.');
      expect(card1.querySelector('.collection-card-cover')).not.toBeNull();

      // Links para sentimentos são auxiliares e não bloqueiam navegação
      expect(container.querySelector('a[href="/sentimento/saudade/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/sentimentos/"]')).not.toBeNull();
    });
  });

  describe('CT02: Contagem Precisa e Desduplicação de Relações (CA03)', () => {
    it('countPoemsByCollection deve desduplicar pares idênticos de (collection_id, poem_id)', () => {
      // Simula triplicação de registros de collection_poems existente no Firestore
      const relationsWithDuplicates = [
        { collection_id: 'col-1', poem_id: 'p-1' },
        { collection_id: 'col-1', poem_id: 'p-1' },
        { collection_id: 'col-1', poem_id: 'p-1' },
        { collection_id: 'col-1', poem_id: 'p-2' },
        { collection_id: 'col-1', poem_id: 'p-2' },
        { collection_id: 'col-2', poem_id: 'p-3' }
      ];

      const counts = countPoemsByCollection(relationsWithDuplicates);
      expect(counts).toEqual({
        'col-1': 2,
        'col-2': 1
      });
      expect(formatPoemCount(counts, 'col-1')).toBe('2 obras');
      expect(formatPoemCount(counts, 'col-2')).toBe('1 obra');
    });

    it('collectionsPage.render no cliente deve desduplicar e contar apenas poemas publicados', async () => {
      const mockCollections = [
        {
          id: 'c1',
          data: () => ({ name: 'Amor e Conexão', slug: 'amor-e-conexao', description: 'Desc' })
        }
      ];

      // Relações triplicadas
      const mockCollectionPoems = [
        { data: () => ({ collection_id: 'c1', poem_id: 'p1' }) },
        { data: () => ({ collection_id: 'c1', poem_id: 'p1' }) },
        { data: () => ({ collection_id: 'c1', poem_id: 'p1' }) },
        { data: () => ({ collection_id: 'c1', poem_id: 'p2' }) },
        { data: () => ({ collection_id: 'c1', poem_id: 'p-invalido' }) } // Poema não publicado
      ];

      getDocs
        .mockResolvedValueOnce({ docs: mockCollections, forEach: cb => mockCollections.forEach(cb) })
        .mockResolvedValueOnce({ docs: mockCollectionPoems, forEach: cb => mockCollectionPoems.forEach(cb) });

      getPublishedPoems.mockResolvedValueOnce([
        { id: 'p1', title: 'Poema 1', slug: 'poema-1', published_at: '2026-01-01' },
        { id: 'p2', title: 'Poema 2', slug: 'poema-2', published_at: '2026-01-02' }
      ]);

      await collectionsPage.render(container);

      // Deve contar apenas 2 poemas publicados únicos (e não 5)
      const countEl = container.querySelector('.collection-count');
      expect(countEl?.textContent).toBe('2 poemas');
    });
  });

  describe('CT03: Renderização da Coleção Individual /colecao/:slug/ (CA05)', () => {
    it('collectionPage.render deve listar os poemas publicados da coleção ordenados e com excertos', async () => {
      getDocs
        .mockResolvedValueOnce({
          empty: false,
          docs: [
            {
              id: 'col-amor',
              data: () => ({ name: 'Amor', slug: 'amor', description: 'Poemas sobre amor' })
            }
          ]
        })
        .mockResolvedValueOnce({
          forEach: cb => [
            { data: () => ({ poem_id: 'p2', order: 1 }) },
            { data: () => ({ poem_id: 'p1', order: 2 }) }
          ].forEach(cb)
        });

      getPublishedPoems.mockResolvedValueOnce([
        { id: 'p1', title: 'Poema Dois', slug: 'poema-dois', content: 'Verso do segundo poema.', published_at: '2026-01-02' },
        { id: 'p2', title: 'Poema Um', slug: 'poema-um', content: 'Verso do primeiro poema.', published_at: '2026-01-01' }
      ]);

      await collectionPage.render(container, { slug: 'amor' });

      expect(container.querySelector('h1')?.textContent).toBe('Amor');
      expect(container.querySelector('.collection-meta')?.textContent).toContain('2 poemas');

      // Verifica ordenação por 'order' (p2 antes de p1)
      const titles = container.querySelectorAll('.poem-row-title');
      expect(titles.length).toBe(2);
      expect(titles[0].textContent).toBe('Poema Um');
      expect(titles[1].textContent).toBe('Poema Dois');

      // Excertos presentes
      const excerpts = container.querySelectorAll('.poem-row-excerpt');
      expect(excerpts.length).toBe(2);
      expect(excerpts[0].textContent).toContain('Verso do primeiro poema.');
    });
  });
});
