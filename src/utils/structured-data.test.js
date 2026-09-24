import { describe, it, expect, beforeEach } from 'vitest';
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
} from './structured-data.js';

describe('structured-data.js', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  describe('CT01: Unitário poemSchema', () => {
    it('deve incluir keywords com as 2 tags e isPartOf com a coleção', () => {
      const mockPoem = {
        title: 'Cântico do Silêncio',
        slug: 'cantico-do-silencio',
        content: '<p>Este é o primeiro verso.<br>Este é o segundo.</p>',
        excerpt: 'Este é o primeiro verso.',
        tags: ['amor', 'tempo'],
        published_at: '2026-01-15T12:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z'
      };

      const mockCollections = [
        { name: 'Versos Livres', slug: 'versos-livres' }
      ];

      const schema = poemSchema(mockPoem, mockCollections);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toEqual(['CreativeWork', 'Poem']);
      expect(schema.headline).toBe('Cântico do Silêncio');
      expect(schema.keywords).toEqual(['amor', 'tempo']);
      expect(schema.datePublished).toBe('2026-01-15T12:00:00.000Z');
      expect(schema.dateModified).toBe('2026-02-01T10:00:00.000Z');
      expect(schema.author['@id']).toBe(AUTHOR_ID);
      expect(schema.url).toBe('https://nfgbrentano.art.br/poema/cantico-do-silencio/');

      // isPartOf deve conter o WebSite e a coleção
      expect(Array.isArray(schema.isPartOf)).toBe(true);
      expect(schema.isPartOf).toEqual([
        { '@id': WEBSITE_ID },
        {
          '@type': 'CollectionPage',
          'name': 'Versos Livres',
          'url': 'https://nfgbrentano.art.br/colecao/versos-livres/'
        }
      ]);
    });

    it('deve usar datePublished como fallback se poem.updated_at não existir', () => {
      const mockPoem = {
        title: 'Poema Sem Edição',
        slug: 'poema-sem-edicao',
        published_at: '2026-01-15T12:00:00.000Z'
      };
      const schema = poemSchema(mockPoem);
      expect(schema.dateModified).toBe('2026-01-15T12:00:00.000Z');
      expect(schema.isPartOf).toEqual({ '@id': WEBSITE_ID });
    });
  });

  describe('CT02: Unitário breadcrumbSchema', () => {
    it('deve gerar 3 itens com position 1..3 e último item com a URL da página', () => {
      const items = [
        { name: 'Início', url: 'https://nfgbrentano.art.br/' },
        { name: 'Coleções', url: 'https://nfgbrentano.art.br/colecoes/' },
        { name: 'Versos Livres', url: 'https://nfgbrentano.art.br/colecao/versos-livres/' }
      ];

      const schema = breadcrumbSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);

      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: 'https://nfgbrentano.art.br/'
      });

      expect(schema.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Coleções',
        item: 'https://nfgbrentano.art.br/colecoes/'
      });

      expect(schema.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Versos Livres',
        item: 'https://nfgbrentano.art.br/colecao/versos-livres/'
      });
    });
  });

  describe('CT03: Escape e serialização de JSON-LD', () => {
    it('escapa "<" evitando fechar </script> prematuramente e mantém parseável', () => {
      const dangerousData = {
        title: 'A </script> B',
        text: '<script>alert("xss")</script>'
      };

      const serialized = serializeJsonLd(dangerousData);

      // Não pode conter '<' cru
      expect(serialized).not.toContain('<');
      expect(serialized).toContain('\\u003c/script>');

      // Ao fazer JSON.parse, os caracteres são recuperados exatamente
      const parsed = JSON.parse(serialized);
      expect(parsed.title).toBe('A </script> B');
      expect(parsed.text).toBe('<script>alert("xss")</script>');
    });
  });

  describe('personSchema e profilePageSchema (RF02)', () => {
    it('personSchema deve conter @id fixo, name, url, image, sameAs e knowsAbout', () => {
      const person = personSchema();
      expect(person['@id']).toBe('https://nfgbrentano.art.br/sobre/#autor');
      expect(person.name).toBe('Natanael Brentano');
      expect(person.url).toBe('https://nfgbrentano.art.br/sobre/');
      expect(person.sameAs).toContain('https://instagram.com/nfgbrentano');
      expect(person.knowsAbout).toContain('Poesia');
    });

    it('profilePageSchema deve ter mainEntity referenciando a Person (CA02)', () => {
      const profile = profilePageSchema();
      expect(profile['@type']).toBe('ProfilePage');
      expect(profile['@id']).toBe('https://nfgbrentano.art.br/sobre/');
      expect(profile.mainEntity['@id']).toBe('https://nfgbrentano.art.br/sobre/#autor');
      expect(profile.mainEntity['@type']).toBe('Person');
    });
  });

  describe('websiteSchema (RF03)', () => {
    it('deve conter @id, SearchAction, publisher e author apontando para Person', () => {
      const site = websiteSchema();
      expect(site['@type']).toBe('WebSite');
      expect(site['@id']).toBe('https://nfgbrentano.art.br/#website');
      expect(site.publisher['@id']).toBe(AUTHOR_ID);
      expect(site.author['@id']).toBe(AUTHOR_ID);
      expect(site.potentialAction['@type']).toBe('SearchAction');
      expect(site.potentialAction.target).toContain('?q={search_term_string}');
    });
  });

  describe('collectionSchema e collectionsListSchema (RF05 & RF06)', () => {
    it('collectionSchema deve conter ItemList com ListItems ordenados (CA03)', () => {
      const col = { name: 'Elegias Urbanas', slug: 'elegias-urbanas' };
      const poems = [
        { title: 'Primeiro Poema', slug: 'primeiro-poema' },
        { title: 'Segundo Poema', slug: 'segundo-poema' }
      ];

      const schema = collectionSchema(col, poems);

      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.url).toBe('https://nfgbrentano.art.br/colecao/elegias-urbanas/');
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.numberOfItems).toBe(2);
      expect(schema.mainEntity.itemListElement).toEqual([
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Primeiro Poema',
          url: 'https://nfgbrentano.art.br/poema/primeiro-poema/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Segundo Poema',
          url: 'https://nfgbrentano.art.br/poema/segundo-poema/'
        }
      ]);
    });

    it('collectionsListSchema deve listar coleções como ItemList', () => {
      const cols = [
        { name: 'Coleção A', slug: 'colecao-a' },
        { name: 'Coleção B', slug: 'colecao-b' }
      ];

      const schema = collectionsListSchema(cols);

      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.url).toBe('https://nfgbrentano.art.br/colecoes/');
      expect(schema.mainEntity.numberOfItems).toBe(2);
      expect(schema.mainEntity.itemListElement[0].url).toBe('https://nfgbrentano.art.br/colecao/colecao-a/');
    });
  });

  describe('setStructuredData (RF08 & CA04)', () => {
    it('deve substituir (não acumular) scripts JSON-LD ao trocar de rota com data-seo', () => {
      // Página 1: Home
      setStructuredData([websiteSchema()]);
      let scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      expect(scripts[0].getAttribute('data-seo')).toBe('true');
      expect(scripts[0].textContent).toContain('WebSite');

      // Página 2: Poema (Poema + Breadcrumb)
      const poem = { title: 'Poema 1', slug: 'poema-1' };
      setStructuredData([
        poemSchema(poem),
        breadcrumbSchema([{ name: 'Início', url: 'https://nfgbrentano.art.br/' }])
      ]);

      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(2);
      expect(scripts[0].textContent).toContain('CreativeWork');
      expect(scripts[1].textContent).toContain('BreadcrumbList');

      // Página 3: Página sem dados estruturados (limpeza)
      setStructuredData([]);
      scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(0);
    });
  });

  describe('renderBreadcrumbsHtml (RF07 & CT06)', () => {
    it('deve renderizar trilha clicável com nav aria-label="breadcrumb"', () => {
      const items = [
        { name: 'Início', url: 'https://nfgbrentano.art.br/' },
        { name: 'Versos', url: 'https://nfgbrentano.art.br/colecao/versos/' },
        { name: 'Poema 1', url: 'https://nfgbrentano.art.br/poema/poema-1/' }
      ];

      const html = renderBreadcrumbsHtml(items);

      expect(html).toContain('<nav aria-label="breadcrumb" class="breadcrumb-nav">');
      expect(html).toContain('<ol class="breadcrumb-list">');
      expect(html).toContain('href="/"');
      expect(html).toContain('href="/colecao/versos/"');
      expect(html).toContain('data-link');
      expect(html).toContain('aria-current="page"');
      expect(html).toContain('Poema 1');
      expect(html).toContain('›');
    });
  });
});
