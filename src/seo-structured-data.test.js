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

      // Validações do poema
      expect(pSchema['@type']).toEqual(['CreativeWork', 'Poem']);
      expect(pSchema.headline).toBe('Aurora Boreal');
      expect(pSchema.keywords).toEqual(['noite', 'frio']);
      expect(pSchema.author['@id']).toBe(AUTHOR_ID);
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
      expect(person.image).toBe('https://nfgbrentano.art.br/og-cover.jpg');
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

  describe('CA04 & CT05: Sem duplicação de blocos JSON-LD ao navegar via SPA por 5 páginas', () => {
    it('ao navegar sequencialmente por 5 páginas, deve conter apenas os blocos da página atual', () => {
      // 1. Rota Home (/)
      updateSEO({
        title: 'Home',
        url: 'https://nfgbrentano.art.br/',
        structuredData: [websiteSchema()]
      });
      let scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      expect(scripts[0].textContent).toContain('WebSite');

      // 2. Rota Poema (/poema/sol)
      const poem = { title: 'Sol', slug: 'sol' };
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
      expect(scripts).toHaveLength(2);
      expect(scripts[0].textContent).toContain('CreativeWork');
      expect(scripts[1].textContent).toContain('BreadcrumbList');
      expect(document.head.innerHTML).not.toContain('"@type":"WebSite"');

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
      expect(scripts).toHaveLength(2);
      expect(scripts[0].textContent).toContain('CollectionPage');
      expect(scripts[1].textContent).toContain('BreadcrumbList');
      expect(document.head.innerHTML).not.toContain('Aurora Boreal');

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
      expect(scripts).toHaveLength(2);
      expect(scripts[0].textContent).toContain('CollectionPage');
      expect(scripts[1].textContent).toContain('BreadcrumbList');

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
      expect(scripts).toHaveLength(2);
      expect(scripts[0].textContent).toContain('ProfilePage');
      expect(scripts[1].textContent).toContain('BreadcrumbList');

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
});
