import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getDocs } from 'firebase/firestore';
import collectionPage from './pages/collection.js';
import sentimentPage from './pages/sentiment.js';
import sentimentsPage from './pages/sentiments.js';
import collectionsPage from './pages/collections.js';
import { renderCollectionMarkup } from './utils/collection-template.js';
import { renderCollectionsPageMarkup } from './utils/collections-template.js';
import { getSentimentIntro, getSentimentName, customSentiments } from './data/sentiments.js';
import { selectRelatedPoems, renderHomeMarkup } from '../scripts/prerender.js';

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

describe('{SEO} Otimização de Rastreamento (Click Depth), Hidratação Resiliente e Enriquecimento Semântico', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = `
      <title>Poemas Brasileiros — Natanael Fernando Gatti Brentano</title>
      <link rel="canonical" href="https://nfgbrentano.art.br/" />
    `;
    document.body.innerHTML = '<main id="main-content"></main>';
    container = document.getElementById('main-content');
    window.history.replaceState({}, '', '/');
  });

  describe('CT01: Alcance de 100% dos poemas e sentimentos em 1 clique a partir da Home', () => {
    it('renderHomeMarkup deve incluir <details class="home-archive-index"> com links para 100% dos poemas e sentimentos indexáveis e manter 1 único <h1>', () => {
      const poems = Array.from({ length: 30 }, (_, i) => ({
        id: `p-${i + 1}`,
        title: `Poema ${i + 1}`,
        slug: `poema-${i + 1}`,
        content: `Verso do poema ${i + 1}\nSegundo verso luminoso`,
        published_at: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z`,
        tags: ['saudade', 'esperanca', 'solidao']
      }));
      const allCollections = [
        { id: 'c1', name: 'Coleção Um', slug: 'colecao-um', description: 'Descrição 1', poemCount: 30 }
      ];
      const qualifyingSentiments = [
        { slug: 'saudade', name: 'Saudade', count: 30 },
        { slug: 'esperanca', name: 'Esperança', count: 30 },
        { slug: 'solidao', name: 'Solidão', count: 30 }
      ];

      const html = renderHomeMarkup({
        poems,
        podPoem: poems[0],
        allCollections,
        qualifyingSentiments
      });
      container.innerHTML = html;

      // Exatamente 1 <h1>
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length).toBe(1);

      // Todos os 30 poemas possuem link <a href="/poema/<slug>/">
      for (const p of poems) {
        const link = container.querySelector(`a[href="/poema/${p.slug}/"]`);
        expect(link).not.toBeNull();
      }

      // Todos os sentimentos possuem link <a href="/sentimento/<slug>/"> e há link para /sentimentos/
      expect(container.querySelector('a[href="/sentimentos/"]')).not.toBeNull();
      for (const s of qualifyingSentiments) {
        const link = container.querySelector(`a[href="/sentimento/${s.slug}/"]`);
        expect(link).not.toBeNull();
      }
    });

    it('dist/index.html deve linkar 100% das URLs de dist/sitemap-poemas.xml e dist/sitemap-sentimentos.xml com exatamente 1 <h1>', () => {
      const distIndex = path.resolve(process.cwd(), 'dist/index.html');
      const sitemapPoemas = path.resolve(process.cwd(), 'dist/sitemap-poemas.xml');
      const sitemapSentimentos = path.resolve(process.cwd(), 'dist/sitemap-sentimentos.xml');

      if (fs.existsSync(distIndex) && fs.existsSync(sitemapPoemas) && fs.existsSync(sitemapSentimentos)) {
        const indexHtml = fs.readFileSync(distIndex, 'utf-8');
        const poemasXml = fs.readFileSync(sitemapPoemas, 'utf-8');
        const sentimentosXml = fs.readFileSync(sitemapSentimentos, 'utf-8');

        const h1Matches = indexHtml.match(/<h1[\s>]/gi) || [];
        expect(h1Matches.length).toBe(1);

        const poemLocs = [...poemasXml.matchAll(/<loc>https:\/\/nfgbrentano\.art\.br(\/poema\/[^<]+\/)<\/loc>/g)].map(m => m[1]);
        expect(poemLocs.length).toBeGreaterThan(0);
        for (const poemPath of poemLocs) {
          expect(indexHtml).toContain(`href="${poemPath}"`);
        }

        const sentLocs = [...sentimentosXml.matchAll(/<loc>https:\/\/nfgbrentano\.art\.br(\/sentimento[s]?\/[^<]*)<\/loc>/g)].map(m => m[1]);
        expect(sentLocs.length).toBeGreaterThan(0);
        for (const sentPath of sentLocs) {
          expect(indexHtml).toContain(`href="${sentPath}"`);
        }
      }
    });
  });

  describe('CT02: Pré-renderização completa de /colecoes/ (dist/colecoes/index.html)', () => {
    it('renderCollectionsPageMarkup deve gerar HTML estático com coleções, sentimentos e poemas recentes com excertos', () => {
      const collections = [
        { name: 'Amor e Tempo', slug: 'amor-e-tempo', description: 'Poemas sobre o tempo.', poemCount: 5 }
      ];
      const sentiments = [
        { slug: 'saudade', name: 'Saudade', count: 5 }
      ];
      const poems = [
        {
          id: '1',
          title: 'Verso Antigo',
          slug: 'verso-antigo',
          content: 'Na dobra silenciosa da tarde\num verso antigo desperta.',
          published_at: '2026-03-10T12:00:00Z'
        }
      ];

      const html = renderCollectionsPageMarkup({ collections, sentiments, poems });
      container.innerHTML = html;

      expect(container.querySelector('h1')?.textContent).toMatch(/(Coleções|Explorar)/);
      expect(container.querySelector('a[href="/colecao/amor-e-tempo/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/sentimento/saudade/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/sentimentos/"]')).not.toBeNull();
      expect(container.querySelector('a[href="/poema/verso-antigo/"]')).not.toBeNull();
      expect(container.querySelector('.poem-row-excerpt')?.textContent).toContain('Na dobra silenciosa da tarde');
    });

    it('dist/colecoes/index.html deve estar pré-renderizado quando o build existir', () => {
      const distColecoes = path.resolve(process.cwd(), 'dist/colecoes/index.html');
      if (fs.existsSync(distColecoes)) {
        const html = fs.readFileSync(distColecoes, 'utf-8');
        expect(html).toMatch(/data-prerendered="(\/colecoes|&#x2F;colecoes)"/);
        expect(html).toContain('href="/colecao/');
        expect(html).toContain('href="/sentimento/');
        expect(html).toContain('href="/poema/');
      }
    });
  });

  describe('CT03: Preservação do HTML pré-renderizado em /colecao/<slug>/ no cliente', () => {
    it('não deve sobrescrever o DOM com .skeleton e deve preservar o conteúdo caso getDocs falhe', async () => {
      container.setAttribute('data-prerendered', '/colecao/noite-viva');
      container.innerHTML = renderCollectionMarkup({
        col: { name: 'Noite Viva', slug: 'noite-viva', description: 'Poemas noturnos.' },
        poemsList: [
          { title: 'Estrela Guia', slug: 'estrela-guia', content: 'Brilha no escuro da noite', published_at: '2026-01-01T12:00:00Z' }
        ]
      });

      getDocs.mockRejectedValueOnce(new Error('Firestore timeout simulado no Googlebot WRS'));

      await collectionPage.render(container, { slug: 'noite-viva' });

      expect(container.querySelector('.skeleton')).toBeNull();
      expect(container.querySelector('h1')?.textContent).toBe('Noite Viva');
      expect(container.querySelector('a[href="/poema/estrela-guia/"]')).not.toBeNull();
      expect(document.querySelector('meta[name="robots"][content*="noindex"]')).toBeNull();
    });
  });

  describe('CT04: Resiliência contra Soft 404 / noindex em /sentimento/<slug>/, /sentimentos/ e /colecoes/ pré-renderizados', () => {
    it('sentimentPage.render deve preservar o DOM pré-renderizado e não injetar noindex quando o Firestore falha', async () => {
      container.setAttribute('data-prerendered', '/sentimento/saudade');
      container.innerHTML = `
        <div class="container sentiment-page">
          <h1>Poemas sobre Saudade</h1>
          <a href="/poema/lembranca/" class="poem-row-link">Lembrança</a>
        </div>
      `;
      getDocs.mockRejectedValueOnce(new Error('Network error in WRS'));

      await sentimentPage.render(container, { slug: 'saudade' });

      expect(container.querySelector('h1')?.textContent).toContain('Poemas sobre Saudade');
      expect(container.querySelector('a[href="/poema/lembranca/"]')).not.toBeNull();
      expect(document.querySelector('meta[name="robots"][content*="noindex"]')).toBeNull();
    });

    it('sentimentsPage.render e collectionsPage.render devem preservar o DOM pré-renderizado quando o Firestore falha', async () => {
      container.setAttribute('data-prerendered', '/sentimentos');
      container.innerHTML = `
        <div class="container sentiments-page">
          <h1>Poemas por Sentimento</h1>
          <a href="/sentimento/saudade/">saudade</a>
        </div>
      `;
      getDocs.mockRejectedValueOnce(new Error('Network error in WRS'));

      await sentimentsPage.render(container);
      expect(container.querySelector('h1')?.textContent).toBe('Poemas por Sentimento');
      expect(document.querySelector('meta[name="robots"][content*="noindex"]')).toBeNull();

      container.setAttribute('data-prerendered', '/colecoes');
      container.innerHTML = renderCollectionsPageMarkup({
        collections: [{ name: 'Amor', slug: 'amor', description: 'Desc', poemCount: 3 }],
        sentiments: [{ slug: 'amor', name: 'Amor', count: 3 }],
        poems: []
      });
      getDocs.mockRejectedValueOnce(new Error('Network error in WRS'));

      await collectionsPage.render(container);
      expect(container.querySelector('h1')?.textContent).toMatch(/(Coleções|Explorar)/);
      expect(container.querySelector('a[href="/colecao/amor/"]')).not.toBeNull();
      expect(document.querySelector('meta[name="robots"][content*="noindex"]')).toBeNull();
    });
  });

  describe('CT05: Presença de trechos poéticos (.poem-row-excerpt) nas listagens de sentimento e coleção', () => {
    it('renderCollectionMarkup deve renderizar .poem-row-excerpt com versos reais do poema', () => {
      const html = renderCollectionMarkup({
        col: { name: 'Vento Sul', slug: 'vento-sul', description: 'Versos do sul.' },
        poemsList: [
          {
            title: 'Horizonte Frio',
            slug: 'horizonte-frio',
            content: 'O vento corta a coxilha\ne deixa um rastro de geada.',
            published_at: '2026-02-15T12:00:00Z'
          }
        ]
      });
      container.innerHTML = html;
      const excerptEl = container.querySelector('.poem-row-excerpt');
      expect(excerptEl).not.toBeNull();
      expect(excerptEl?.textContent).toContain('O vento corta a coxilha e deixa um rastro de geada.');
    });

    it('sentimentPage.render deve renderizar .poem-row-excerpt ao carregar poemas do sentimento', async () => {
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: '1',
            data: () => ({
              title: 'Chama Branda',
              slug: 'chama-branda',
              content: 'Arde quieta na memória\numa brasa que não dorme.',
              published_at: '2026-01-10T12:00:00Z',
              tags: ['saudade']
            })
          },
          {
            id: '2',
            data: () => ({
              title: 'Porto Antigo',
              slug: 'porto-antigo',
              content: 'As águas voltam ao cais\ncomo quem busca um abraço.',
              published_at: '2026-01-12T12:00:00Z',
              tags: ['saudade']
            })
          }
        ]
      });

      await sentimentPage.render(container, { slug: 'saudade' });
      const excerpts = container.querySelectorAll('.poem-row-excerpt');
      expect(excerpts.length).toBe(2);
      expect(excerpts[0].textContent).toContain('As águas voltam ao cais');
      expect(excerpts[1].textContent).toContain('Arde quieta na memória');
    });
  });

  describe('CT06: Descrições exclusivas de sentimentos (getSentimentIntro & getSentimentName)', () => {
    it('deve fornecer introduções literárias ricas e distintas para todos os sentimentos do Search Console', () => {
      const slugs = Object.keys(customSentiments);
      expect(slugs.length).toBeGreaterThanOrEqual(62);

      const intros = new Set();
      for (const slug of slugs) {
        const intro = getSentimentIntro(slug, slug);
        expect(intro.length).toBeGreaterThan(80);
        expect(intro).not.toContain('Explore nossa seleção especial de poemas brasileiros contemporâneos que abordam o tema');
        intros.add(intro);
      }

      // 100% das entradas em customSentiments têm descrições únicas
      expect(intros.size).toBe(slugs.length);
      expect(getSentimentName('solidao')).toBe('Solidão');
      expect(getSentimentName('esperanca')).toBe('Esperança');
      expect(getSentimentName('fe')).toBe('Fé');
    });
  });

  describe('CT07: Distribuição determinística de relatedPoems', () => {
    it('selectRelatedPoems deve rotacionar candidatos de mesmo score para distribuir links internos entre todos os poemas do grupo', () => {
      const poems = Array.from({ length: 12 }, (_, i) => ({
        id: `id-${i + 1}`,
        title: `Poema Grupo ${i + 1}`,
        slug: `poema-grupo-${i + 1}`,
        collection_slugs: ['col-unica'],
        tags: ['mesma-tag']
      }));

      const incomingLinksCount = new Map(poems.map(p => [p.slug, 0]));

      poems.forEach((poem, idx) => {
        const related = selectRelatedPoems(poem, poems, idx, [], 4);
        expect(related.length).toBe(4);
        for (const target of related) {
          expect(target.slug).not.toBe(poem.slug);
          incomingLinksCount.set(target.slug, (incomingLinksCount.get(target.slug) || 0) + 1);
        }
      });

      // Com a rotação determinística por índice, todos os 12 poemas recebem links internos (nenhum fica com 0)
      for (const [slug, count] of incomingLinksCount.entries()) {
        expect(count, `O poema ${slug} deveria receber links de Poemas Relacionados`).toBeGreaterThan(0);
      }
    });
  });
});
