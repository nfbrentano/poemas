import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import favorites from './favorites.js';
import poemPage from './poem.js';
import * as poemsStore from '../utils/poems-store.js';
import { toggleFavorite } from '../utils/favorites.js';
import { renderCollectionMarkup } from '../utils/collection-template.js';
import { buildPoemSitemap, buildCollectionSitemap, buildPagesSitemap, buildSentimentsSitemap } from '../utils/sitemap-builder.js';

describe('Página e Integração de Favoritos (SDD 2026-11-10)', () => {
  let container;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('CT02 & CA02: teclado Enter e Espaço no botão de favorito alternam aria-pressed', async () => {
    const mockPoem = {
      id: 'poem-key-1',
      slug: 'poema-teclado',
      title: 'Poema do Teclado',
      content: '<p>Versos para testar acessibilidade de teclado.</p>',
      status: 'published',
      published_at: '2026-01-01T00:00:00.000Z'
    };

    container.setAttribute('data-prerendered', '/poema/poema-teclado');
    const dataScript = document.createElement('script');
    dataScript.id = '__DATA__';
    dataScript.type = 'application/json';
    dataScript.textContent = JSON.stringify({ poem: mockPoem });
    document.body.appendChild(dataScript);

    const { renderPoemMarkup } = await import('../utils/poem-template.js');
    container.innerHTML = renderPoemMarkup({ poem: mockPoem, baseUrl: '/' });

    await poemPage.render(container, { slug: 'poema-teclado' });

    const btn = container.querySelector('#favorite-poem-btn');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    // 1. Pressionar Enter
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.classList.contains('active')).toBe(true);

    // 2. Pressionar Espaço
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.classList.contains('active')).toBe(false);

    dataScript.remove();
  });

  it('CT03 & CA04: listagem ordenada de favoritos (mais recente primeiro)', async () => {
    const p1 = { id: 'id-1', slug: 'primeiro-poema', title: 'Primeiro Poema', status: 'published', published_at: '2026-01-01' };
    const p2 = { id: 'id-2', slug: 'segundo-poema', title: 'Segundo Poema', status: 'published', published_at: '2026-02-01' };
    const p3 = { id: 'id-3', slug: 'terceiro-poema', title: 'Terceiro Poema', status: 'published', published_at: '2026-03-01' };

    vi.spyOn(poemsStore, 'getPublishedPoems').mockResolvedValue([p1, p2, p3]);

    toggleFavorite(p1);
    await new Promise(r => setTimeout(r, 10));
    toggleFavorite(p2);
    await new Promise(r => setTimeout(r, 10));
    toggleFavorite(p3);

    await favorites.render(container);

    const items = container.querySelectorAll('.favorite-item');
    expect(items.length).toBe(3);

    // Mais recente no topo: p3, depois p2, depois p1
    expect(items[0].getAttribute('data-slug')).toBe('terceiro-poema');
    expect(items[1].getAttribute('data-slug')).toBe('segundo-poema');
    expect(items[2].getAttribute('data-slug')).toBe('primeiro-poema');

    // Link para a página do poema
    const link = items[0].querySelector('a.favorite-item-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toContain('poema/terceiro-poema/');
  });

  it('CT04 & CA05: estado vazio com mensagem e link para o acervo quando não há favoritos', async () => {
    vi.spyOn(poemsStore, 'getPublishedPoems').mockResolvedValue([]);

    await favorites.render(container);

    const emptyBox = container.querySelector('.favorites-empty');
    expect(emptyBox).not.toBeNull();
    expect(emptyBox.textContent).toContain('Nenhum poema favoritado ainda');

    const exploreLink = emptyBox.querySelector('a');
    expect(exploreLink).not.toBeNull();
    expect(exploreLink.getAttribute('href')).toBe('/');
  });

  it('CT05 & CA06: poemas favoritados que foram despublicados são ignorados sem erro', async () => {
    const published = [
      { id: 'pub-1', slug: 'poema-publicado', title: 'Poema Publicado', status: 'published' }
    ];
    vi.spyOn(poemsStore, 'getPublishedPoems').mockResolvedValue(published);

    // Favorita um poema publicado e um despublicado
    toggleFavorite({ slug: 'poema-publicado', id: 'pub-1' });
    toggleFavorite({ slug: 'poema-despublicado', id: 'despub-2' });

    await favorites.render(container);

    const items = container.querySelectorAll('.favorite-item');
    expect(items.length).toBe(1);
    expect(items[0].getAttribute('data-slug')).toBe('poema-publicado');
  });

  it('CT06 & CA07: indicador de favorito nos cards de coleções', () => {
    toggleFavorite({ slug: 'poema-estrela', id: 'star-1' });

    const col = { name: 'Coleção Teste', slug: 'colecao-teste', description: 'Desc' };
    const poems = [
      { slug: 'poema-estrela', title: 'Poema Estrela' },
      { slug: 'poema-comum', title: 'Poema Comum' }
    ];

    const html = renderCollectionMarkup({ col, poemsList: poems, baseUrl: '/' });

    expect(html).toContain('poema-estrela');
    // Poema estrela deve ter o badge
    expect(html).toMatch(/Poema Estrela\s*<span class="favorite-badge"/);
    // Poema comum não deve ter o badge
    expect(html).not.toMatch(/Poema Comum\s*<span class="favorite-badge"/);
  });

  it('CT08 & CA09: rota de favoritos tem noindex e não deve constar em nenhum sitemap', () => {
    expect(favorites.meta.robots).toBe('noindex, nofollow');

    const baseUrl = 'https://nfgbrentano.art.br/';
    const poems = [{ id: '1', slug: 'p1', status: 'published' }];
    const collections = [{ id: 'c1', slug: 'col1' }];

    const poemSitemap = buildPoemSitemap(poems, baseUrl);
    const colSitemap = buildCollectionSitemap(collections, [], poems, baseUrl);
    const pagesSitemap = buildPagesSitemap({ staticPages: [{ loc: 'sobre' }, { loc: 'colecoes' }] }, baseUrl);
    const sentimentsSitemap = buildSentimentsSitemap(poems, baseUrl);

    expect(poemSitemap.xml).not.toContain('/favoritos');
    expect(colSitemap.xml).not.toContain('/favoritos');
    expect(pagesSitemap.xml).not.toContain('/favoritos');
    expect(sentimentsSitemap.xml).not.toContain('/favoritos');
  });
});
