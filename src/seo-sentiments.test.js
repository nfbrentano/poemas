import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { slugifyTag, tagToSlug } from './utils/tags.js';
import { renderPoemMarkup } from './utils/poem-template.js';
import { buildSentimentsSitemap, generateAllSitemaps } from './utils/sitemap-builder.js';
import { sentimentSchema, sentimentsListSchema, SITE_URL } from './utils/structured-data.js';

let mockFirestoreDocs = [];

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(async () => ({
    forEach: (callback) => {
      mockFirestoreDocs.forEach(d => callback({ id: d.id, data: () => d }));
    },
    docs: mockFirestoreDocs.map(d => ({ id: d.id, data: () => d }))
  }))
}));

// Import components after mocking firestore
const { sentiment } = await import('./pages/sentiment.js');
const { sentiments } = await import('./pages/sentiments.js');

describe('{SEO} Páginas indexáveis por sentimento (SDD 2026-09-24)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="main-content"></div>';
    mockFirestoreDocs = [];
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    mockFirestoreDocs = [];
  });

  describe('CT01 & RNF01: Unitário slugifyTag', () => {
    it('CT01: Converte Amor-Próprio com espaços para amor-proprio', () => {
      expect(slugifyTag('Amor-Próprio ')).toBe('amor-proprio');
      expect(tagToSlug('Amor-Próprio ')).toBe('amor-proprio');
    });

    it('Trata prefixos de sentimento, acentos e caracteres especiais', () => {
      expect(slugifyTag('sentimento:saudade')).toBe('saudade');
      expect(slugifyTag('tag de sentimento: Solidão')).toBe('solidao');
      expect(slugifyTag('  sentimento: paz & amor  ')).toBe('paz-amor');
    });
  });

  describe('CA01, CA06 & CT06: Página de sentimento (/sentimento/:slug/)', () => {
    it('CA01: Dado saudade com 12 poemas, vejo h1 "Poemas sobre Saudade" e 12 links', async () => {
      mockFirestoreDocs = Array.from({ length: 12 }, (_, i) => ({
        id: `p-${i}`,
        title: `Poema de Saudade ${i + 1}`,
        slug: `poema-saudade-${i + 1}`,
        tags: ['saudade'],
        status: 'published',
        published_at: `2026-01-${String(i + 1).padStart(2, '0')}`
      }));

      const container = document.getElementById('main-content');
      await sentiment.render(container, { slug: 'saudade' });

      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1.textContent).toBe('Poemas sobre Saudade');

      const poemLinks = container.querySelectorAll('.poem-row-link');
      expect(poemLinks.length).toBe(12);
      expect(poemLinks[0].getAttribute('href')).toContain('poema/poema-saudade-12');

      // Título da página
      expect(document.title).toContain('Poemas sobre Saudade');

      // Sem noindex pois tem 12 poemas
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeNull();
    });

    it('CA06: Tags "Saudade" e "saudade " agrupam na mesma página /sentimento/saudade/', async () => {
      mockFirestoreDocs = [
        { id: 'p1', title: 'Poema 1', slug: 'p1', tags: ['Saudade'], status: 'published', published_at: '2026-01-01' },
        { id: 'p2', title: 'Poema 2', slug: 'p2', tags: ['saudade '], status: 'published', published_at: '2026-01-02' },
        { id: 'p3', title: 'Poema 3', slug: 'p3', tags: ['sentimento:saudade'], status: 'published', published_at: '2026-01-03' }
      ];

      const container = document.getElementById('main-content');
      await sentiment.render(container, { slug: 'saudade' });

      const poemLinks = container.querySelectorAll('.poem-row-link');
      expect(poemLinks.length).toBe(3);
    });

    it('CT06: Página de sentimento exibe links para sentimentos co-ocorrentes', async () => {
      mockFirestoreDocs = [
        { id: 'p1', title: 'P1', slug: 'p1', tags: ['amor', 'saudade', 'paixao'], status: 'published', published_at: '2026-01-01' },
        { id: 'p2', title: 'P2', slug: 'p2', tags: ['amor', 'saudade'], status: 'published', published_at: '2026-01-02' },
        { id: 'p3', title: 'P3', slug: 'p3', tags: ['amor', 'tempo'], status: 'published', published_at: '2026-01-03' }
      ];

      const container = document.getElementById('main-content');
      await sentiment.render(container, { slug: 'amor' });

      const relatedSection = container.querySelector('.sentiment-related');
      expect(relatedSection).not.toBeNull();

      const relatedChips = relatedSection.querySelectorAll('a.filter-chip');
      expect(relatedChips.length).toBeGreaterThanOrEqual(2);
      const chipTexts = Array.from(relatedChips).map(c => c.textContent);
      expect(chipTexts.some(t => t.includes('Saudade'))).toBe(true);
      expect(chipTexts.some(t => t.includes('Tempo'))).toBe(true);
    });
  });

  describe('CA02, CT02 & CT05: Limite de indexação e status de rascunho', () => {
    it('CA02 & CT02: Sentimento com 2 poemas recebe noindex, follow e fica fora do sitemap', async () => {
      mockFirestoreDocs = [
        { id: 'p1', title: 'P1', slug: 'p1', tags: ['raro'], status: 'published', published_at: '2026-01-01' },
        { id: 'p2', title: 'P2', slug: 'p2', tags: ['raro'], status: 'published', published_at: '2026-01-02' }
      ];

      const container = document.getElementById('main-content');
      await sentiment.render(container, { slug: 'raro' });

      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).not.toBeNull();
      expect(robots.getAttribute('content')).toBe('noindex, follow');

      // Verifica no sitemap builder
      const sentSitemap = buildSentimentsSitemap(mockFirestoreDocs, 'https://nfgbrentano.art.br/', 3);
      expect(sentSitemap.xml).not.toContain('/sentimento/raro/');
    });

    it('CT05: Sentimento presente apenas em rascunho retorna 404', async () => {
      mockFirestoreDocs = [
        { id: 'p1', title: 'P1', slug: 'p1', tags: ['amor'], status: 'published', published_at: '2026-01-01' }
      ];

      const container = document.getElementById('main-content');
      await sentiment.render(container, { slug: 'secreto' });

      expect(container.querySelector('.not-found-page')).not.toBeNull();
      expect(container.querySelector('.not-found-title').textContent).toBe('Sentimento não encontrado');
    });
  });

  describe('CT03: Sitemap de sentimentos', () => {
    it('CT03: sitemap.xml e sub-sitemap incluem apenas sentimentos com ≥ 3 poemas, com lastmod', () => {
      const poems = [
        { id: '1', slug: 'p1', status: 'published', tags: ['amor', 'saudade'], published_at: '2026-01-01' },
        { id: '2', slug: 'p2', status: 'published', tags: ['amor', 'saudade'], published_at: '2026-02-01' },
        { id: '3', slug: 'p3', status: 'published', tags: ['amor', 'saudade'], published_at: '2026-03-01' },
        { id: '4', slug: 'p4', status: 'published', tags: ['efemero'], published_at: '2026-03-02' }
      ];

      const sitemaps = generateAllSitemaps({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems,
        collections: [],
        minPoemsPerSentiment: 3
      });

      const sentXml = sitemaps['sitemap-sentimentos.xml'];
      expect(sentXml).toContain('/sentimento/amor/');
      expect(sentXml).toContain('/sentimento/saudade/');
      expect(sentXml).not.toContain('/sentimento/efemero/');

      // Contém lastmod correto (2026-03-01)
      expect(sentXml).toContain('<lastmod>2026-03-01</lastmod>');

      // Contém página hub /sentimentos/
      expect(sentXml).toContain('/sentimentos/');
    });
  });

  describe('CA03 & RF06: Chips de sentimento no poema apontam para /sentimento/<slug>/', () => {
    it('CA03: Chip de sentimento em renderPoemMarkup tem link para /sentimento/<slug>/ com data-link', () => {
      const html = renderPoemMarkup({
        poem: {
          id: 'p1',
          title: 'Poema Com Tags',
          slug: 'poema-com-tags',
          content: 'Versos',
          tags: ['Amor-Próprio', 'Saudade'],
          published_at: '2026-01-01'
        },
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      const chips = div.querySelectorAll('.tag-chip');
      expect(chips.length).toBe(2);
      expect(chips[0].getAttribute('href')).toBe('/sentimento/amor-proprio/');
      expect(chips[0].hasAttribute('data-link')).toBe(true);
      expect(chips[1].getAttribute('href')).toBe('/sentimento/saudade/');
    });
  });

  describe('RF08: Hub de sentimentos (/sentimentos/)', () => {
    it('Renderiza lista de sentimentos indexáveis com contagem', async () => {
      mockFirestoreDocs = [
        { id: '1', tags: ['amor'], status: 'published' },
        { id: '2', tags: ['amor'], status: 'published' },
        { id: '3', tags: ['amor'], status: 'published' },
        { id: '4', tags: ['saudade'], status: 'published' },
        { id: '5', tags: ['saudade'], status: 'published' },
        { id: '6', tags: ['saudade'], status: 'published' },
        { id: '7', tags: ['raro'], status: 'published' }
      ];

      const container = document.getElementById('main-content');
      await sentiments.render(container);

      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1.textContent).toBe('Poemas por Sentimento');

      const sentimentCards = container.querySelectorAll('.sentiment-card');
      expect(sentimentCards.length).toBe(2); // 'amor' e 'saudade' (>= 3 poemas)

      const cardTexts = Array.from(sentimentCards).map(c => c.textContent);
      expect(cardTexts.some(t => t.includes('Amor'))).toBe(true);
      expect(cardTexts.some(t => t.includes('Saudade'))).toBe(true);
    });
  });

  describe('JSON-LD Structured Data para Sentimentos', () => {
    it('Gera CollectionPage + ItemList válidos para sentimento', () => {
      const poems = [
        { title: 'P1', slug: 'p1' },
        { title: 'P2', slug: 'p2' }
      ];
      const schema = sentimentSchema('Amor', 'amor', poems, 'Descrição do amor');

      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.name).toBe('Poemas sobre Amor');
      expect(schema.url).toBe(`${SITE_URL}/sentimento/amor/`);
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.numberOfItems).toBe(2);
      expect(schema.mainEntity.itemListElement[0].name).toBe('P1');
      expect(schema.mainEntity.itemListElement[0].url).toBe(`${SITE_URL}/poema/p1/`);
    });

    it('Gera CollectionPage + ItemList para /sentimentos/', () => {
      const list = [
        { name: 'Amor', slug: 'amor' },
        { name: 'Saudade', slug: 'saudade' }
      ];
      const schema = sentimentsListSchema(list);

      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.url).toBe(`${SITE_URL}/sentimentos/`);
      expect(schema.mainEntity.numberOfItems).toBe(2);
    });
  });
});
