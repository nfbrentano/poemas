import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  personSchema,
  profilePageSchema,
  websiteSchema,
  poemSchema,
  collectionSchema,
  collectionsListSchema,
  breadcrumbSchema,
  serializeJsonLd,
  setStructuredData,
  renderBreadcrumbsHtml,
  pageGraphSchema,
  DEFAULT_AUTHOR_PHOTO,
  AUTHOR_ID,
  WEBSITE_ID
} from './utils/structured-data.js';
import { updateSEO, setNotFoundSEO } from './utils/seo.js';

describe('{SEO} Dados estruturados (JSON-LD) completos e Breadcrumbs', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<main id="main-content"></main>';
    document.title = 'Poemas Brasileiros - Natanael Brentano';
  });

  describe('CA01 & CT01: Schema de Poema e BreadcrumbList', () => {
    it('deve gerar item do poema completo com keywords, isPartOf e breadcrumbs válidos', () => {
      const mockPoem = {
        title: 'Aurora Boreal',
        slug: 'aurora-boreal',
        content: 'Noite fria no horizonte verdejante',
        excerpt: 'Noite fria',
        tags: ['noite', 'frio'],
        published_at: '2026-03-10T12:00:00.000Z',
        updated_at: '2026-03-15T08:00:00.000Z'
      };
      const mockCollections = [
        { name: 'Cores Noturnas', slug: 'cores-noturnas' }
      ];

      const pSchema = poemSchema(mockPoem, mockCollections);
      const bSchema = breadcrumbSchema([
        { name: 'Início', url: 'https://nfgbrentano.art.br/' },
        { name: 'Cores Noturnas', url: 'https://nfgbrentano.art.br/colecao/cores-noturnas/' },
        { name: 'Aurora Boreal', url: 'https://nfgbrentano.art.br/poema/aurora-boreal/' }
      ]);

      // Validações do poema (RF02 & RF04)
      expect(pSchema['@type']).toEqual(['CreativeWork', 'Poem']);
      expect(pSchema.headline).toBe('Aurora Boreal');
      expect(pSchema.keywords).toEqual(['noite', 'frio']);
      expect(pSchema.author['@id']).toBe(AUTHOR_ID);
      expect(pSchema.author.name).toBe('Natanael Brentano');
      expect(pSchema.author.url).toBe('https://nfgbrentano.art.br/sobre/');
      expect(pSchema.copyrightHolder['@id']).toBe(AUTHOR_ID);
      expect(pSchema.copyrightYear).toBe(2026);
      expect(pSchema.license).toBe('https://creativecommons.org/licenses/by-nc-nd/4.0/');
      expect(pSchema.wordCount).toBe(5);
      expect(pSchema.about).toHaveLength(2);
      expect(pSchema.about[0]).toEqual({
        '@type': 'DefinedTerm',
        name: 'noite',
        url: 'https://nfgbrentano.art.br/sentimento/noite/'
      });
      expect(pSchema.isPartOf).toEqual([
        { '@id': WEBSITE_ID },
        {
          '@type': 'CollectionPage',
          'name': 'Cores Noturnas',
          'url': 'https://nfgbrentano.art.br/colecao/cores-noturnas/'
        }
      ]);
      expect(pSchema.url).toBe('https://nfgbrentano.art.br/poema/aurora-boreal/');
      expect(pSchema.mainEntityOfPage).toBe('https://nfgbrentano.art.br/poema/aurora-boreal/');

      // Validações do BreadcrumbList
      expect(bSchema['@type']).toBe('BreadcrumbList');
      expect(bSchema.itemListElement).toHaveLength(3);
      expect(bSchema.itemListElement[2].item).toBe('https://nfgbrentano.art.br/poema/aurora-boreal/');
    });
  });

  describe('CA02: ProfilePage e Person do Autor em /sobre/', () => {
    it('ProfilePage deve ter mainEntity apontando para a Person com @id fixo no /sobre/#autor', () => {
      const profile = profilePageSchema();
      expect(profile['@type']).toBe('ProfilePage');
      expect(profile['@id']).toBe('https://nfgbrentano.art.br/sobre/');
      expect(profile.url).toBe('https://nfgbrentano.art.br/sobre/');

      const person = profile.mainEntity;
      expect(person['@type']).toBe('Person');
      expect(person['@id']).toBe('https://nfgbrentano.art.br/sobre/#autor');
      expect(person.name).toBe('Natanael Brentano');
      expect(person.url).toBe('https://nfgbrentano.art.br/sobre/');
      expect(person.image).toBe(DEFAULT_AUTHOR_PHOTO);
      expect(person.nationality).toEqual({ '@type': 'Country', name: 'Brasil' });
      expect(person.knowsLanguage).toBe('pt-BR');
      expect(person.sameAs).toContain('https://instagram.com/nfgbrentano');
      expect(person.knowsAbout).toContain('Poesia');
    });
  });

  describe('CA03: ItemList de Coleção com 10 poemas ordenados e URLs canônicas', () => {
    it('deve gerar ItemList com 10 ListItems na ordem e URLs com barra final', () => {
      const col = { name: 'Antologia da Alma', slug: 'antologia-da-alma' };
      const tenPoems = Array.from({ length: 10 }, (_, i) => ({
        title: `Poema Número ${i + 1}`,
        slug: `poema-numero-${i + 1}`
      }));

      const schema = collectionSchema(col, tenPoems);

      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.url).toBe('https://nfgbrentano.art.br/colecao/antologia-da-alma/');
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.numberOfItems).toBe(10);
      expect(schema.mainEntity.itemListElement).toHaveLength(10);

      schema.mainEntity.itemListElement.forEach((item, idx) => {
        expect(item['@type']).toBe('ListItem');
        expect(item.position).toBe(idx + 1);
        expect(item.name).toBe(`Poema Número ${idx + 1}`);
        expect(item.url).toBe(`https://nfgbrentano.art.br/poema/poema-numero-${idx + 1}/`);
        expect(item.url.endsWith('/')).toBe(true);
      });
    });
  });

  describe('CA04 & CT05 & CT06: Grafo JSON-LD unificado sem duplicação ao navegar via SPA por 5 páginas', () => {
    it('ao navegar sequencialmente por 5 páginas, deve conter exatamente 1 script com o @graph da página atual', () => {
      // 1. Rota Home (/)
      updateSEO({
        title: 'Home',
        url: 'https://nfgbrentano.art.br/',
        structuredData: [websiteSchema()]
      });
      let scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      let graphData = JSON.parse(scripts[0].textContent);
      expect(graphData['@graph']).toBeDefined();
      expect(graphData['@graph'].some(e => e['@type'] === 'WebSite')).toBe(true);
      expect(graphData['@graph'].some(e => e['@type'] === 'Person')).toBe(true);

      // 2. Rota Poema (/poema/sol)
      const poem = { title: 'Sol', slug: 'sol', content: 'Raio de sol dourado' };
      updateSEO({
        title: 'Sol',
        url: 'https://nfgbrentano.art.br/poema/sol/',
        type: 'article',
        structuredData: [
          poemSchema(poem),
          breadcrumbSchema([{ name: 'Início', url: 'https://nfgbrentano.art.br/' }, { name: 'Sol', url: 'https://nfgbrentano.art.br/poema/sol/' }])
        ]
      });
      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      graphData = JSON.parse(scripts[0].textContent);
      expect(graphData['@graph'].some(e => Array.isArray(e['@type']) && e['@type'].includes('Poem'))).toBe(true);
      expect(graphData['@graph'].some(e => e['@type'] === 'BreadcrumbList')).toBe(true);
      expect(graphData['@graph'].some(e => e['@type'] === 'Person')).toBe(true);
      expect(graphData['@graph'].some(e => e['@type'] === 'WebSite')).toBe(true);

      // 3. Rota Coleção (/colecao/luz)
      const col = { name: 'Luz', slug: 'luz' };
      updateSEO({
        title: 'Coleção Luz',
        url: 'https://nfgbrentano.art.br/colecao/luz/',
        structuredData: [
          collectionSchema(col, [poem]),
          breadcrumbSchema([{ name: 'Início', url: 'https://nfgbrentano.art.br/' }, { name: 'Coleções', url: 'https://nfgbrentano.art.br/colecoes/' }, { name: 'Luz', url: 'https://nfgbrentano.art.br/colecao/luz/' }])
        ]
      });
      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      graphData = JSON.parse(scripts[0].textContent);
      expect(graphData['@graph'].some(e => e['@type'] === 'CollectionPage' && e.name === 'Luz')).toBe(true);
      expect(graphData['@graph'].some(e => e['@type'] === 'BreadcrumbList')).toBe(true);
      expect(scripts[0].textContent).not.toContain('Aurora Boreal');

      // 4. Rota Coleções (/colecoes/)
      updateSEO({
        title: 'Coleções',
        url: 'https://nfgbrentano.art.br/colecoes/',
        structuredData: [
          collectionsListSchema([col]),
          breadcrumbSchema([{ name: 'Início', url: 'https://nfgbrentano.art.br/' }, { name: 'Coleções', url: 'https://nfgbrentano.art.br/colecoes/' }])
        ]
      });
      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      graphData = JSON.parse(scripts[0].textContent);
      expect(graphData['@graph'].some(e => e['@type'] === 'CollectionPage' && e.url.endsWith('/colecoes/'))).toBe(true);

      // 5. Rota Sobre (/sobre/)
      updateSEO({
        title: 'Sobre',
        url: 'https://nfgbrentano.art.br/sobre/',
        structuredData: [
          profilePageSchema(),
          breadcrumbSchema([{ name: 'Início', url: 'https://nfgbrentano.art.br/' }, { name: 'Sobre', url: 'https://nfgbrentano.art.br/sobre/' }])
        ]
      });
      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      graphData = JSON.parse(scripts[0].textContent);
      expect(graphData['@graph'].some(e => e['@type'] === 'ProfilePage')).toBe(true);
      expect(graphData['@graph'].some(e => e['@type'] === 'Person')).toBe(true);

      // 6. Rota 404 / Não encontrada
      setNotFoundSEO();
      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(0);
    });
  });

  describe('CA05 & CT03: Título com </script> não quebra HTML e mantém JSON-LD parseável', () => {
    it('dado um poema cujo título contém "</script>", o HTML continua válido e o JSON parseável', () => {
      const maliciousPoem = {
        title: 'A </script><script>alert("hack")</script> B',
        slug: 'a-script-b',
        content: 'Verso com <tag> e </script> injection'
      };

      const schema = poemSchema(maliciousPoem);
      const serialized = serializeJsonLd(schema);

      // Simula injeção no documento HTML
      const fullHtml = `<!DOCTYPE html><html><head><script type="application/ld+json" data-seo="true">${serialized}</script></head><body></body></html>`;

      // Analisa usando JSDOM para verificar validade do documento HTML
      const dom = new JSDOM(fullHtml);
      const scripts = dom.window.document.querySelectorAll('script');

      // Deve existir EXATAMENTE 1 tag script no head
      expect(scripts).toHaveLength(1);
      expect(scripts[0].getAttribute('type')).toBe('application/ld+json');

      // O conteúdo da tag deve ser parseável via JSON.parse
      const parsed = JSON.parse(scripts[0].textContent);
      expect(parsed.headline).toBe('A </script><script>alert("hack")</script> B');
      expect(parsed.url).toBe('https://nfgbrentano.art.br/poema/a-script-b/');
    });
  });

  describe('CT06: Breadcrumb visível no HTML com trilha clicável', () => {
    it('deve gerar trilha Início › Coleção › Poema com URLs relativas e data-link', () => {
      const breadcrumbItems = [
        { name: 'Início', url: 'https://nfgbrentano.art.br/' },
        { name: 'Reflexões', url: 'https://nfgbrentano.art.br/colecao/reflexoes/' },
        { name: 'O Tempo Passa', url: 'https://nfgbrentano.art.br/poema/o-tempo-passa/' }
      ];

      const html = renderBreadcrumbsHtml(breadcrumbItems);

      expect(html).toContain('aria-label="breadcrumb"');
      expect(html).toContain('class="breadcrumb-nav"');
      expect(html).toContain('href="/"');
      expect(html).toContain('href="/colecao/reflexoes/"');
      expect(html).toContain('data-link');
      expect(html).toContain('aria-current="page"');
      expect(html).toContain('O Tempo Passa');
      expect(html).toContain('›');
    });
  });

  describe('GEO: Grafo conectado e entidade autor completa (SDD 2026-09-24)', () => {
    it('CA01 & CT01: pageGraphSchema no poema deve conter Person, WebSite, Poem e BreadcrumbList ligados por @id', () => {
      const mockPoem = {
        title: 'Vozes da Terra',
        slug: 'vozes-da-terra',
        content: 'Canto que brota da terra fértil.',
        published_at: '2026-03-24T12:00:00.000Z',
        tags: ['terra', 'vida']
      };
      const mockCollections = [{ name: 'Sementes', slug: 'sementes' }];
      const poemLd = poemSchema(mockPoem, mockCollections);
      const breadcrumbsLd = breadcrumbSchema([
        { name: 'Início', url: 'https://nfgbrentano.art.br/' },
        { name: 'Sementes', url: 'https://nfgbrentano.art.br/colecao/sementes/' },
        { name: 'Vozes da Terra', url: 'https://nfgbrentano.art.br/poema/vozes-da-terra/' }
      ]);

      const graph = pageGraphSchema([poemLd, breadcrumbsLd]);

      expect(graph['@context']).toBe('https://schema.org');
      expect(Array.isArray(graph['@graph'])).toBe(true);

      const nodes = graph['@graph'];
      const websiteNode = nodes.find(n => n['@type'] === 'WebSite');
      const personNode = nodes.find(n => n['@type'] === 'Person');
      const poemNode = nodes.find(n => Array.isArray(n['@type']) && n['@type'].includes('Poem'));
      const breadcrumbNode = nodes.find(n => n['@type'] === 'BreadcrumbList');

      expect(websiteNode).toBeDefined();
      expect(personNode).toBeDefined();
      expect(poemNode).toBeDefined();
      expect(breadcrumbNode).toBeDefined();

      // Ligação por @id
      expect(websiteNode.publisher['@id']).toBe(AUTHOR_ID);
      expect(websiteNode.author['@id']).toBe(AUTHOR_ID);
      expect(poemNode.author['@id']).toBe(AUTHOR_ID);
      expect(poemNode.copyrightHolder['@id']).toBe(AUTHOR_ID);
      expect(poemNode.isPartOf.some(p => p['@id'] === WEBSITE_ID)).toBe(true);
    });

    it('CA02 & CT02: autor autocontido no Poem com @id, name e url', () => {
      const poem = poemSchema({ title: 'Verso Livre', slug: 'verso-livre' });
      expect(poem.author['@id']).toBe(AUTHOR_ID);
      expect(poem.author.name).toBe('Natanael Brentano');
      expect(poem.author.url).toBe('https://nfgbrentano.art.br/sobre/');
    });

    it('CA03: Poem contém license, copyrightHolder, copyrightYear, wordCount e about (DefinedTerm)', () => {
      const poem = poemSchema({
        title: 'Poema Completo',
        slug: 'poema-completo',
        content: '<p>Um dois três quatro cinco.</p>',
        published_at: '2026-02-10T12:00:00Z',
        tags: ['esperanca']
      });

      expect(poem.license).toBe('https://creativecommons.org/licenses/by-nc-nd/4.0/');
      expect(poem.copyrightHolder['@id']).toBe(AUTHOR_ID);
      expect(poem.copyrightYear).toBe(2026);
      expect(poem.wordCount).toBe(5);
      expect(poem.about).toEqual([
        {
          '@type': 'DefinedTerm',
          name: 'esperanca',
          url: 'https://nfgbrentano.art.br/sentimento/esperanca/'
        }
      ]);
    });

    it('CT03: sem duplicatas de Person com @id diferentes no grafo', () => {
      const poemLd = poemSchema({ title: 'Poema Teste', slug: 'poema-teste' });
      const graph = pageGraphSchema([poemLd, profilePageSchema()]);
      const personNodes = graph['@graph'].filter(n => n['@type'] === 'Person');
      expect(personNodes).toHaveLength(1);
      expect(personNodes[0]['@id']).toBe(AUTHOR_ID);
    });

    it('CA05: home grafo contém WebSite e Person declarados na própria página', () => {
      const graph = pageGraphSchema();
      const websiteNode = graph['@graph'].find(n => n['@type'] === 'WebSite');
      const personNode = graph['@graph'].find(n => n['@type'] === 'Person');

      expect(websiteNode).toBeDefined();
      expect(personNode).toBeDefined();
      expect(websiteNode.publisher['@id']).toBe(personNode['@id']);
      expect(websiteNode.author['@id']).toBe(personNode['@id']);
    });
  });
});
