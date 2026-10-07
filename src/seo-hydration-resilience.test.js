import { describe, it, expect, beforeEach, vi } from 'vitest';
import collectionPage from './pages/collection.js';
import poemPage from './pages/poem.js';
import { setNotFoundSEO } from './utils/seo.js';

// Mock do Firebase Firestore para testes controlados
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    documentId: vi.fn(),
    limit: vi.fn(),
    orderBy: vi.fn()
  };
});

vi.mock('./utils/firebase.js', () => ({
  db: {}
}));

import sentimentPage from './pages/sentiment.js';

describe('{FIX} Resiliência de SEO e Hidratação de Coleções e Poemas (SDD 2026-10-07)', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <title>Poemas Brasileiros — Natanael Fernando Gatti Brentano</title>
      <link rel="canonical" href="https://nfgbrentano.art.br/colecao/amor/" />
    `;
    document.body.innerHTML = `
      <div id="main-content"></div>
    `;
    vi.clearAllMocks();
  });

  describe('CT01 & CA01: Build embute payload __DATA__ em páginas de coleção', () => {
    it('o script de prerender formata payload contendo col e poemsList no script __DATA__', () => {
      const col = { id: 'col-1', slug: 'amor', name: 'Amor' };
      const colPoems = [{ id: 'p-1', title: 'Poema 1', slug: 'poema-1' }];
      const colDataPayload = { col, poemsList: colPoems };
      const colDataScriptTag = `<script type="application/json" id="__DATA__">${JSON.stringify(colDataPayload)}</script>`;
      expect(colDataScriptTag).toContain('id="__DATA__"');
      expect(colDataScriptTag).toContain('"slug":"amor"');
      expect(colDataScriptTag).toContain('"poemsList"');
    });
  });

  describe('CT02 & CA02: Hidratação de coleção sem skeleton a partir de __DATA__', () => {
    it('deve hidratar a partir do __DATA__ e não apagar com skeleton se data-prerendered bater com a rota', async () => {
      const container = document.getElementById('main-content');
      container.setAttribute('data-prerendered', '/colecao/amor');
      container.innerHTML = '<section class="prerendered-content">Conteúdo pré-renderizado</section>';

      const dataScript = document.createElement('script');
      dataScript.id = '__DATA__';
      dataScript.type = 'application/json';
      dataScript.textContent = JSON.stringify({
        col: {
          id: 'col-1',
          slug: 'amor',
          name: 'Amor',
          description: 'Coleção sobre amor'
        },
        poemsList: [
          { id: 'p1', slug: 'poema-1', title: 'Poema 1', published_at: '2025-01-01' }
        ]
      });
      document.body.appendChild(dataScript);

      await collectionPage.render(container, { slug: 'amor' });

      // O container não deve ter sido substituído por skeleton
      expect(container.innerHTML).not.toContain('skeleton');
      // O conteúdo pré-renderizado deve ter sido preservado
      expect(container.innerHTML).toContain('Conteúdo pré-renderizado');
      // O atributo data-prerendered deve ser limpo
      expect(container.hasAttribute('data-prerendered')).toBe(false);
      // Título e SEO devem estar corretos
      expect(document.title).toContain('Amor');
      expect(document.querySelector('meta[name="robots"]')).toBeNull();
    });
  });

  describe('CT03 & CA03: Coleção pré-renderizada resiliente a falhas de rede no Firestore', () => {
    it('não deve disparar setNotFoundSEO nem injetar noindex se falhar o Firestore em página pré-renderizada', async () => {
      const container = document.getElementById('main-content');
      container.setAttribute('data-prerendered', '/colecao/amor');
      container.innerHTML = '<section class="original-markup">Poemas de Amor Estáticos</section>';

      // Simula ausência de __DATA__ e erro forçado no Firestore
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Firebase network connection failed'));

      await collectionPage.render(container, { slug: 'amor' });

      // O markup original deve ser preservado
      expect(container.innerHTML).toContain('Poemas de Amor Estáticos');
      // NÃO deve virar página 404
      expect(container.innerHTML).not.toContain('not-found-page');
      // NÃO deve conter tag noindex
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeNull();
      // O título não deve virar "Página não encontrada"
      expect(document.title).not.toContain('Página não encontrada');
    });
  });

  describe('CT04 & CA04: Poema pré-renderizado resiliente a erro de rede', () => {
    it('não deve chamar setNotFoundSEO se houver erro ao buscar poema pré-renderizado', async () => {
      const container = document.getElementById('main-content');
      container.setAttribute('data-prerendered', '/poema/meu-poema');
      container.innerHTML = '<article class="original-poem">Versos Originais</article>';

      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network offline'));

      await poemPage.render(container, { slug: 'meu-poema' });

      // Conteúdo estático original deve ser preservado
      expect(container.innerHTML).toContain('Versos Originais');
      // NÃO deve virar 404 nem adicionar noindex
      expect(container.innerHTML).not.toContain('not-found-page');
      expect(document.querySelector('meta[name="robots"]')).toBeNull();
      expect(document.title).not.toContain('Página não encontrada');
    });
  });

  describe('CT05 & CA05: Coleção inexistente em navegação dinâmica dispara 404', () => {
    it('deve chamar setNotFoundSEO e exibir 404 ao navegar para coleção inexistente sem pré-render', async () => {
      const container = document.getElementById('main-content');
      // Sem data-prerendered
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue({
        empty: true,
        docs: []
      });

      await collectionPage.render(container, { slug: 'colecao-que-nao-existe' });

      // Deve renderizar página 404
      expect(container.innerHTML).toContain('not-found-page');
      expect(container.innerHTML).toContain('Página não encontrada');
      // Deve ter noindex
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeTruthy();
      expect(robots?.getAttribute('content')).toBe('noindex');
      expect(document.title).toContain('Página não encontrada');
    });
  });

  describe('CT06: Sentimento pré-renderizado resiliente a erro de rede', () => {
    it('não deve disparar renderNotFound nem noindex se houver falha de rede em sentimento pré-renderizado', async () => {
      const container = document.getElementById('main-content');
      container.setAttribute('data-prerendered', '/sentimento/amor');
      container.innerHTML = '<section class="original-sentiment">Poemas de Amor</section>';

      const dataScript = document.createElement('script');
      dataScript.id = '__DATA__';
      dataScript.type = 'application/json';
      dataScript.textContent = JSON.stringify({
        name: 'Amor',
        slug: 'amor',
        poems: [
          { id: 'p1', title: 'Poema 1', slug: 'poema-1', published_at: '2025-01-01' },
          { id: 'p2', title: 'Poema 2', slug: 'poema-2', published_at: '2025-01-02' },
          { id: 'p3', title: 'Poema 3', slug: 'poema-3', published_at: '2025-01-03' }
        ]
      });
      document.body.appendChild(dataScript);

      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      await sentimentPage.render(container, { slug: 'amor' });

      // O markup original deve ser preservado
      expect(container.innerHTML).toContain('Poemas de Amor');
      expect(container.innerHTML).not.toContain('not-found-page');
      expect(document.querySelector('meta[name="robots"]')).toBeNull();
      expect(document.title).not.toContain('Página não encontrada');
    });
  });
});
