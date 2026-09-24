import { describe, it, expect, vi } from 'vitest';
import { XMLValidator, XMLParser } from 'fast-xml-parser';

const { mockDocsStore } = vi.hoisted(() => ({
  mockDocsStore: [
    { id: '1', data: { title: 'P1', published_at: '2026-01-01T00:00:00Z' } },
    { id: '2', data: { title: 'P2', published_at: '2026-02-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' } }
  ]
}));

vi.mock('firebase/firestore', () => ({
  collection: () => 'poems-col',
  doc: (db, col, id) => id,
  getDocs: async () => ({
    docs: mockDocsStore.map(d => ({
      id: d.id,
      data: () => ({ ...d.data })
    }))
  }),
  updateDoc: async (id, update) => {
    const docItem = mockDocsStore.find(d => d.id === id);
    if (docItem) {
      Object.assign(docItem.data, update);
    }
  }
}));

import {
  getPoemLastMod,
  formatDateToYMD,
  buildPoemSitemap,
  buildCollectionSitemap,
  buildPagesSitemap,
  buildSentimentsSitemap,
  buildSitemapIndex,
  generateAllSitemaps,
  SITE_URL
} from './utils/sitemap-builder.js';
import {
  buildRssFeed,
  formatPoemHtmlForRss,
  getExcerpt
} from './utils/rss-builder.js';
import { migrateUpdatedAt } from '../scripts/migrate-updated-at.js';

describe('{SEO} Sitemap e RSS: lastmod real, datas de atualização e feed completo', () => {
  const mockPoems = [
    {
      id: 'p1',
      title: 'Poema Um',
      slug: 'poema-um',
      content: 'Este é o primeiro poema de amor.\n\nSegunda estrofe cheia de paixão.',
      status: 'published',
      published_at: '2026-01-01T10:00:00Z',
      updated_at: '2026-05-15T14:30:00Z',
      tags: ['amor', 'sentimentos']
    },
    {
      id: 'p2',
      title: 'Poema Dois',
      slug: 'poema-dois',
      content: '<p>Este é o segundo poema com html.</p>',
      status: 'published',
      published_at: '2026-02-01T10:00:00Z',
      updated_at: '2026-02-01T10:00:00Z',
      tags: ['saudade', 'amor']
    },
    {
      id: 'p3',
      title: 'Poema Três',
      slug: 'poema-tres',
      content: 'Poema sobre a dor e o amor.',
      status: 'published',
      published_at: '2026-03-01T10:00:00Z',
      // No updated_at provided, should fallback to published_at
      tags: ['amor', 'dor']
    },
    {
      id: 'p-draft',
      title: 'Poema Rascunho',
      slug: 'poema-rascunho',
      content: 'Rascunho não público',
      status: 'draft',
      published_at: '2026-04-01T10:00:00Z',
      tags: ['amor']
    }
  ];

  const mockCollections = [
    { id: 'c1', title: 'Coleção Amorosa', slug: 'colecao-amorosa' },
    { id: 'c2', title: 'Coleção Vazia', slug: 'colecao-vazia' }
  ];

  const mockCollectionPoems = [
    { collection_id: 'c1', poem_id: 'p1' },
    { collection_id: 'c1', poem_id: 'p2' }
  ];

  describe('CT01: Unitário lastmod (RF01, RF02, CA01)', () => {
    it('poema com updated_at > published_at deve ter lastmod = updated_at', () => {
      const poem = {
        published_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-06-20T15:00:00Z'
      };
      expect(getPoemLastMod(poem)).toBe('2026-06-20');
    });

    it('poema sem updated_at deve ter lastmod = published_at', () => {
      const poem = {
        published_at: '2026-03-12T00:00:00Z'
      };
      expect(getPoemLastMod(poem)).toBe('2026-03-12');
    });

    it('suporta Timestamp do Firestore com método toDate()', () => {
      const poem = {
        published_at: '2026-01-01T00:00:00Z',
        updated_at: {
          toDate: () => new Date('2026-08-10T12:00:00Z')
        }
      };
      expect(getPoemLastMod(poem)).toBe('2026-08-10');
    });
  });

  describe('CT02: lastmod de coleção (RF02)', () => {
    it('coleção com poemas de datas diferentes deve ter lastmod igual à maior data entre eles', () => {
      // p1 was updated 2026-05-15, p2 was published 2026-02-01
      // c1 has p1 and p2 -> max lastmod should be 2026-05-15
      const { xml } = buildCollectionSitemap(mockCollections, mockCollectionPoems, mockPoems);
      
      const parser = new XMLParser();
      const parsed = parser.parse(xml);
      const urls = parsed.urlset.url;
      const c1Url = urls.find(u => u.loc.includes('colecao-amorosa'));
      expect(c1Url).toBeDefined();
      expect(c1Url.lastmod).toBe('2026-05-15');
    });
  });

  describe('CT03: XSD e ausência de changefreq/priority (RF03, RF04, CA02, CA03, RNF01)', () => {
    it('sitemaps gerados devem ser XML válidos e não conter changefreq nem priority', () => {
      const sitemaps = generateAllSitemaps({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems,
        staticPages: [
          { loc: 'sobre', lastmod: '2026-04-10' },
          { loc: 'colecoes', lastmod: '2026-05-15' }
        ]
      });

      for (const [filename, xml] of Object.entries(sitemaps)) {
        // Validação sintática de XML
        const validation = XMLValidator.validate(xml);
        expect(validation, `Arquivo ${filename} deve ser XML válido`).toBe(true);

        // RF03 & CA03: Nem changefreq nem priority devem existir
        expect(xml).not.toContain('<changefreq>');
        expect(xml).not.toContain('<priority>');
      }

      // CA02: sitemap.xml deve ser sitemapindex
      expect(sitemaps['sitemap.xml']).toContain('<sitemapindex');
      expect(sitemaps['sitemap.xml']).toContain('sitemap-poemas.xml');
      expect(sitemaps['sitemap.xml']).toContain('sitemap-colecoes.xml');
      expect(sitemaps['sitemap.xml']).toContain('sitemap-paginas.xml');
      expect(sitemaps['sitemap.xml']).toContain('sitemap-sentimentos.xml');
    });

    it('todas as URLs de páginas e poemas devem ter barra final canônica (RNF03)', () => {
      const sitemaps = generateAllSitemaps({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      const poemXml = sitemaps['sitemap-poemas.xml'];
      const locMatches = [...poemXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      for (const loc of locMatches) {
        expect(loc.endsWith('/')).toBe(true);
      }
    });
  });

  describe('CT04: Feed RSS completo (RF06, RF07, CA04, RNF01, RNF03)', () => {
    it('deve conter namespaces content, dc, atom, lastBuildDate, channel image e language pt-BR', () => {
      const buildDate = new Date('2026-09-24T18:00:00Z');
      const feedXml = buildRssFeed({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: mockPoems,
        buildDate
      });

      expect(XMLValidator.validate(feedXml)).toBe(true);

      // Namespaces
      expect(feedXml).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
      expect(feedXml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
      expect(feedXml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');

      // Channel details
      expect(feedXml).toContain('<language>pt-BR</language>');
      expect(feedXml).toContain(`<lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>`);
      expect(feedXml).toContain('<atom:link href="https://nfgbrentano.art.br/feed.xml" rel="self" type="application/rss+xml" />');
      expect(feedXml).toContain('<image>');
      expect(feedXml).toContain('<url>https://nfgbrentano.art.br/og-default.png</url>');
    });

    it('cada item do feed deve conter content:encoded com CDATA, dc:creator, categoria e link com barra final', () => {
      const feedXml = buildRssFeed({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: mockPoems
      });

      const parser = new XMLParser({
        ignoreAttributes: false
      });
      const parsed = parser.parse(feedXml);
      const items = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];

      // Somente publicados (p1, p2, p3), rascunho excluído
      expect(items.length).toBe(3);

      for (const item of items) {
        expect(item.link.endsWith('/')).toBe(true);
        expect(item.guid['#text'].endsWith('/')).toBe(true);
        expect(item['dc:creator']).toBe('Natanael Fernando Gatti Brentano');
        expect(item['content:encoded']).toBeTruthy();
        expect(item.category).toBeDefined();
      }

      // Verifica CDATA no XML bruto
      expect(feedXml).toContain('<content:encoded><![CDATA[');
    });

    it('deve limitar o feed a no máximo 50 poemas mais recentes (RF07)', () => {
      const manyPoems = Array.from({ length: 65 }, (_, i) => ({
        id: `poem-${i}`,
        title: `Poema ${i}`,
        slug: `poema-${i}`,
        content: `Conteúdo ${i}`,
        status: 'published',
        published_at: new Date(2026, 0, i + 1).toISOString(),
        tags: ['amor']
      }));

      const feedXml = buildRssFeed({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: manyPoems
      });

      const parser = new XMLParser();
      const parsed = parser.parse(feedXml);
      const items = parsed.rss.channel.item;
      expect(items.length).toBe(50);
    });
  });

  describe('CT05: Migração de updated_at idempotente (RF01)', () => {
    it('migrateUpdatedAt deve preencher updated_at apenas onde estiver ausente e ser idempotente', async () => {
      const mockDb = {};

      // Reset mock docs store
      mockDocsStore[0].data = { title: 'P1', published_at: '2026-01-01T00:00:00Z' };
      mockDocsStore[1].data = { title: 'P2', published_at: '2026-02-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' };

      // Primeira execução
      const result1 = await migrateUpdatedAt(mockDb);
      expect(result1.updatedCount).toBe(1);
      expect(result1.skippedCount).toBe(1);
      expect(mockDocsStore[0].data.updated_at).toBe('2026-01-01T00:00:00Z');
      expect(mockDocsStore[1].data.updated_at).toBe('2026-03-01T00:00:00Z'); // Não foi sobrescrito!

      // Segunda execução (idempotente)
      const result2 = await migrateUpdatedAt(mockDb);
      expect(result2.updatedCount).toBe(0);
      expect(result2.skippedCount).toBe(2);
    });
  });

  describe('CA06: Rascunhos não aparecem em sitemap nem em feed', () => {
    it('poemas com status !== "published" não são incluídos no sitemap nem no feed', () => {
      const sitemaps = generateAllSitemaps({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: mockPoems
      });

      expect(sitemaps['sitemap-poemas.xml']).not.toContain('poema-rascunho');

      const feedXml = buildRssFeed({
        baseUrl: 'https://nfgbrentano.art.br/',
        poems: mockPoems
      });

      expect(feedXml).not.toContain('poema-rascunho');
    });
  });
});
