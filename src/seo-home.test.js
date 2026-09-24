import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import homePage from './pages/home.js';
import { updateSEO } from './utils/seo.js';

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
  getDocs: vi.fn().mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => ({
          title: 'Poema Um',
          slug: 'poema-um',
          published_at: '2026-01-01T12:00:00Z',
          excerpt: 'Trecho do primeiro poema',
          tags: ['amor']
        })
      },
      {
        id: '2',
        data: () => ({
          title: 'Poema Dois',
          slug: 'poema-dois',
          published_at: '2026-02-01T12:00:00Z',
          excerpt: 'Trecho do segundo poema',
          tags: ['tempo']
        })
      }
    ]
  })
}));

describe('{SEO} Home: h1, título sem duplicação, canonical limpo e conteúdo estático', () => {
  let container;

  beforeEach(() => {
    document.head.innerHTML = `
      <title>Poemas Brasileiros — Natanael Brentano</title>
      <link rel="canonical" href="https://nfgbrentano.art.br/" />
    `;
    document.body.innerHTML = '<main id="main-content"></main>';
    container = document.getElementById('main-content');
    window.history.replaceState({}, '', '/');
  });

  describe('CA01 & CT01: h1 único na home', () => {
    it('deve conter exatamente um <h1> no DOM quando a home é carregada', async () => {
      await homePage.render(container, {});
      const h1List = document.querySelectorAll('h1');
      expect(h1List.length).toBe(1);
      expect(h1List[0].textContent).toContain('Poemas de Natanael Brentano');
    });

    it('deve manter exatamente um <h1> no DOM mesmo quando houver filtros ativos', async () => {
      await homePage.render(container, { tags: 'amor' });
      const h1List = document.querySelectorAll('h1');
      expect(h1List.length).toBe(1);
    });
  });

  describe('CA02 & CT02: Título da home sem duplicação', () => {
    it('document.title da home deve ser "Poemas Brasileiros — Natanael Brentano" com a marca aparecendo uma única vez', async () => {
      await homePage.render(container, {});
      expect(document.title).toBe('Poemas Brasileiros — Natanael Brentano');
      const matches = document.title.match(/Natanael Brentano/g);
      expect(matches?.length).toBe(1);
      expect(document.title.length).toBeLessThanOrEqual(60);
    });
  });

  describe('CA03 & CT03: Canonical fixo e robots noindex, follow com filtros', () => {
    it('ao acessar com filtros /?tags=amor, canonical deve ser https://nfgbrentano.art.br/ e robots noindex, follow', async () => {
      window.history.replaceState({}, '', '/?tags=amor');
      await homePage.render(container, { tags: 'amor' });

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).not.toBeNull();
      expect(canonical?.getAttribute('href')).toBe('https://nfgbrentano.art.br/');

      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).not.toBeNull();
      expect(robots?.getAttribute('content')).toBe('noindex, follow');
    });

    it('ao acessar com múltiplos filtros /?cols=x&tags=y, canonical permanece a raiz e robots noindex, follow', async () => {
      window.history.replaceState({}, '', '/?cols=x&tags=y');
      await homePage.render(container, { cols: 'x', tags: 'y' });

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe('https://nfgbrentano.art.br/');

      const robots = document.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toBe('noindex, follow');
    });
  });

  describe('CA05: Limpar filtros remove noindex da home', () => {
    it('ao remover filtros, meta robots noindex é removida do <head>', async () => {
      // 1. Aplica filtro
      window.history.replaceState({}, '', '/?tags=amor');
      await homePage.render(container, { tags: 'amor' });
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');

      // 2. Limpa filtros e renderiza rota limpa
      window.history.replaceState({}, '', '/');
      await homePage.render(container, {});
      expect(document.querySelector('meta[name="robots"]')).toBeNull();
    });
  });

  describe('CA04 & CT04: dist/index.html prerenderizado sem JS', () => {
    it('dist/index.html deve conter h1, apresentação, links para coleções/sobre e pelo menos 20 poemas', () => {
      const distIndexPath = path.resolve(process.cwd(), 'dist/index.html');
      expect(fs.existsSync(distIndexPath)).toBe(true);

      const html = fs.readFileSync(distIndexPath, 'utf-8');
      
      // Contagem de h1 deve ser 1
      const h1Matches = html.match(/<h1[^>]*>/gi);
      expect(h1Matches?.length).toBe(1);
      expect(html).toContain('Poemas de Natanael Brentano');

      // Parágrafo de apresentação e links internos
      expect(html).toContain('home-description');
      expect(html).toMatch(/href=["']\/colecoes\/?["']/);
      expect(html).toMatch(/href=["']\/sobre\/?["']/);

      // Links para pelo menos 20 poemas
      const poemLinks = html.match(/href=["']\/poema\/[^"']+\/?["']/g) || [];
      expect(poemLinks.length).toBeGreaterThanOrEqual(20);

      // Canonical e sem noindex
      expect(html).toMatch(/<link\s+rel=["']canonical["']\s+href=["']https:\/\/nfgbrentano\.art\.br\/["']/i);
      expect(html).not.toMatch(/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i);
    });

    it('meta description na home deve ter entre 140 e 160 caracteres', () => {
      const distIndexPath = path.resolve(process.cwd(), 'dist/index.html');
      const html = fs.readFileSync(distIndexPath, 'utf-8');
      const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      expect(match).not.toBeNull();
      const desc = match[1];
      expect(desc.length).toBeGreaterThanOrEqual(140);
      expect(desc.length).toBeLessThanOrEqual(160);
      expect(desc.toLowerCase()).toContain('poema');
      expect(desc.toLowerCase()).toContain('natanael brentano');
    });
  });
});
