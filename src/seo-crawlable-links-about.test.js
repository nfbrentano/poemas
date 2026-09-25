import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderPoemMarkup } from './utils/poem-template.js';
import { renderAboutMarkup, DEFAULT_AVATAR_URL } from './utils/about-template.js';
import { updateSEO } from './utils/seo.js';
import { poemSchema, SITE_URL } from './utils/structured-data.js';
import aboutPage from './pages/about.js';
import { routes } from './router.js';

describe('{SEO} Links rastreáveis e página Sobre (SDD 2026-09-24)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="main-content"></div>';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('RF01, CA01, CT01, CT02: Links prev/next rastreáveis', () => {
    const mockPoem = {
      id: 'p1',
      title: 'Poema Central',
      slug: 'poema-central',
      content: 'Versos do meio',
      published_at: '2026-03-01'
    };

    it('CA01 & CT01: Poema do meio deve ter <a rel="prev"> e <a rel="next"> com href canônico e acessibilidade', () => {
      const html = renderPoemMarkup({
        poem: mockPoem,
        prevSlug: 'poema-anterior',
        nextSlug: 'poema-proximo',
        prevTitle: 'Poema Anterior',
        nextTitle: 'Próximo Poema',
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      const prevLink = div.querySelector('a[rel="prev"]');
      const nextLink = div.querySelector('a[rel="next"]');

      expect(prevLink).not.toBeNull();
      expect(nextLink).not.toBeNull();
      expect(prevLink.getAttribute('href')).toBe('/poema/poema-anterior/');
      expect(nextLink.getAttribute('href')).toBe('/poema/poema-proximo/');
      expect(prevLink.hasAttribute('data-link')).toBe(true);
      expect(nextLink.hasAttribute('data-link')).toBe(true);

      // RNF02: Nome acessível descritivo
      expect(prevLink.getAttribute('aria-label')).toBe('Poema anterior: Poema Anterior');
      expect(nextLink.getAttribute('aria-label')).toBe('Próximo poema: Próximo Poema');

      // CT01: document.querySelectorAll('a[rel=prev],a[rel=next]') deve retornar exatamente 2 elementos
      const navLinks = div.querySelectorAll('a[rel="prev"], a[rel="next"]');
      expect(navLinks.length).toBe(2);
    });

    it('CT02: Poema mais antigo (sem anterior) não deve renderizar <a rel="prev"> nem link quebrado', () => {
      const html = renderPoemMarkup({
        poem: mockPoem,
        prevSlug: '',
        nextSlug: 'poema-proximo',
        prevTitle: '',
        nextTitle: 'Próximo Poema',
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      const prevLink = div.querySelector('a[rel="prev"]');
      const nextLink = div.querySelector('a[rel="next"]');

      expect(prevLink).toBeNull();
      expect(nextLink).not.toBeNull();

      // CT01 query com apenas 1 link
      const navLinks = div.querySelectorAll('a[rel="prev"], a[rel="next"]');
      expect(navLinks.length).toBe(1);
    });

    it('Poema mais recente (sem próximo) não deve renderizar <a rel="next">', () => {
      const html = renderPoemMarkup({
        poem: mockPoem,
        prevSlug: 'poema-anterior',
        nextSlug: '',
        prevTitle: 'Poema Anterior',
        nextTitle: '',
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      const prevLink = div.querySelector('a[rel="prev"]');
      const nextLink = div.querySelector('a[rel="next"]');

      expect(prevLink).not.toBeNull();
      expect(nextLink).toBeNull();
    });
  });

  describe('RF02 & CA02: Poemas relacionados no markup', () => {
    it('CA02: Deve incluir pelo menos 3 poemas relacionados como links <a> estáticos', () => {
      const related = [
        { id: '1', slug: 'rel-1', title: 'Relacionado 1', excerpt: 'Trecho 1' },
        { id: '2', slug: 'rel-2', title: 'Relacionado 2', excerpt: 'Trecho 2' },
        { id: '3', slug: 'rel-3', title: 'Relacionado 3', excerpt: 'Trecho 3' }
      ];

      const html = renderPoemMarkup({
        poem: { id: 'p', title: 'Principal', slug: 'principal', content: 'Corpo', published_at: '2026-01-01' },
        prevSlug: 'prev',
        nextSlug: 'next',
        relatedPoems: related,
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      const relatedLinks = div.querySelectorAll('#related-poems-list a.related-poem-card');
      expect(relatedLinks.length).toBe(3);
      expect(relatedLinks[0].getAttribute('href')).toBe('/poema/rel-1/');
      expect(relatedLinks[1].getAttribute('href')).toBe('/poema/rel-2/');
      expect(relatedLinks[2].getAttribute('href')).toBe('/poema/rel-3/');
    });
  });

  describe('RF06 & CA06: Escapamento de poem.title com escapeHtml', () => {
    it('CA06: Dado um poema com título <b>x</b>, o título deve aparecer como texto literal', () => {
      const html = renderPoemMarkup({
        poem: { id: 'p_xss', title: '<b>x</b>', slug: 'x-bold', content: 'Poema seguro', published_at: '2026-01-01' },
        prevSlug: 'prev-slug',
        nextSlug: 'next-slug',
        prevTitle: '<script>alert(1)</script>',
        nextTitle: '<b>Proximo</b>',
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      const h1 = div.querySelector('h1');
      expect(h1.textContent).toBe('<b>x</b>');
      expect(h1.innerHTML).toBe('&lt;b&gt;x&lt;/b&gt;');

      const prevLink = div.querySelector('a[rel="prev"]');
      expect(prevLink.querySelector('.nav-btn-title').textContent).toBe('<script>alert(1)</script>');
      expect(prevLink.querySelector('.nav-btn-title').innerHTML).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
  });

  describe('RF03, CA03, CT04, RF07: SEO da página Sobre e transição SPA', () => {
    it('CA03 & CT04: Ao navegar de um poema para /sobre/ via SPA, canonical, description, og e json-ld devem ser do Sobre', async () => {
      // 1. Simula estar em um poema
      updateSEO({
        title: 'Poema das Horas',
        description: 'Um poema sobre o tempo que passa devagar.',
        url: `${SITE_URL}/poema/poema-das-horas/`,
        type: 'article',
        publishedTime: '2026-05-10T12:00:00Z',
        tags: ['tempo', 'vida'],
        structuredData: [
          poemSchema({ id: '1', title: 'Poema das Horas', slug: 'poema-das-horas', published_at: '2026-05-10', excerpt: 'Um poema sobre o tempo' })
        ]
      });

      // Valida que o estado inicial é do poema
      expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE_URL}/poema/poema-das-horas/`);
      expect(document.querySelector('meta[property="og:type"]').getAttribute('content')).toBe('article');
      expect(document.querySelector('meta[property="article:published_time"]')).not.toBeNull();
      expect(document.querySelectorAll('meta[property="article:tag"]').length).toBe(2);

      // 2. Renderiza a página Sobre (navegação SPA)
      const container = document.getElementById('main-content');
      await aboutPage.render(container);

      // CT04: Canonical do Sobre
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical.getAttribute('href')).toBe(`${SITE_URL}/sobre/`);

      // RF03: Title e Description próprios
      expect(document.title).toBe('Sobre Natanael Brentano — Poeta');
      expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe(
        'Biografia, influências e trajetória poética de Natanael Fernando Gatti Brentano.'
      );

      // RF03: og:type = profile
      expect(document.querySelector('meta[property="og:type"]').getAttribute('content')).toBe('profile');

      // Limpeza de tags de article do poema anterior
      expect(document.querySelector('meta[property="article:published_time"]')).toBeNull();
      expect(document.querySelectorAll('meta[property="article:tag"]').length).toBe(0);

      // JSON-LD deve conter ProfilePage (isolado ou dentro do @graph)
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const parsedLd = jsonLdScripts.map(s => JSON.parse(s.textContent));
      const hasProfilePage = parsedLd.some(s => s['@type'] === 'ProfilePage' || (Array.isArray(s['@graph']) && s['@graph'].some(g => g['@type'] === 'ProfilePage')));
      expect(hasProfilePage).toBe(true);
    });
  });

  describe('RF04, CA04, CT05: Foto real e marcação estática do Sobre', () => {
    it('CA04 & CT05: renderAboutMarkup deve renderizar img com src real, alt descritivo, width e height', () => {
      const html = renderAboutMarkup({
        avatarUrl: DEFAULT_AVATAR_URL,
        bioText: 'Texto da biografia do autor.',
        poemsCount: 222,
        baseUrl: '/'
      });

      const div = document.createElement('div');
      div.innerHTML = html;

      // CT05: curl /sobre/ | grep '<img'
      const img = div.querySelector('img#profile-img');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe(DEFAULT_AVATAR_URL);
      expect(img.getAttribute('src')).not.toContain('data:image/gif');
      expect(img.getAttribute('alt')).toBe('Natanael Brentano, poeta');
      expect(img.getAttribute('width')).toBe('140');
      expect(img.getAttribute('height')).toBe('140');

      // H1 e Bio presentes no HTML estático
      expect(div.querySelector('h1').textContent).toBe('Natanael Brentano');
      expect(div.querySelector('#bio-content').textContent.trim()).toBe('Texto da biografia do autor.');
      expect(div.querySelector('#total-poems-count').textContent).toBe('222');
    });
  });

  describe('RF05, CA05, CT06: Remoção de /info como página e redirecionamento para /sobre/', () => {
    it('CA05: /info não deve estar registrado como rota independente no objeto routes', () => {
      expect(routes['/info']).toBeUndefined();
      expect(routes['/sobre']).toBeDefined();
    });
  });
});
