import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  filterPublishedPoems,
  calculateMilestones,
  groupPoemsByYear,
  getArchiveStats,
  renderArchiveMarkup
} from './utils/archive-builder.js';
import { archivePageSchema } from './utils/structured-data.js';
import { renderAboutMarkup } from './utils/about-template.js';

vi.mock('./utils/poems-store.js', () => ({
  getPublishedPoems: vi.fn()
}));

vi.mock('./utils/analytics.js', () => ({
  trackPageView: vi.fn()
}));

import { archive } from './pages/archive.js';
import { getPublishedPoems } from './utils/poems-store.js';

describe('Página de Arquivo e Linha do Tempo Literária (SDD 2026-11-13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('CT01 & CA01 & CA02 & CA06: Agrupamento por ano e marcos literários', () => {
    it('filtra apenas poemas publicados e ignora rascunhos e agendados (CA06)', () => {
      const mixedPoems = [
        { id: '1', title: 'P1', slug: 'p1', status: 'published', published_at: '2016-01-01' },
        { id: '2', title: 'P2', slug: 'p2', status: 'draft', published_at: '2016-02-01' },
        { id: '3', title: 'P3', slug: 'p3', status: 'scheduled', published_at: '2026-12-01' },
        { id: '4', title: 'P4', slug: null, status: 'published', published_at: '2017-01-01' },
        { id: '5', title: 'P5', slug: 'p5', status: 'published', published_at: null }
      ];

      const published = filterPublishedPoems(mixedPoems);
      expect(published.length).toBe(1);
      expect(published[0].id).toBe('1');
    });

    it('calcula corretamente o 1º, 50º e 100º marcos literários da obra (CA02)', () => {
      // Gera 120 poemas com datas estritamente crescentes a partir de 2015
      const generatedPoems = Array.from({ length: 120 }, (_, i) => {
        const date = new Date(Date.UTC(2015, 0, 1 + i, 12, 0, 0));
        return {
          id: `p-${i + 1}`,
          title: `Poema Número ${i + 1}`,
          slug: `poema-numero-${i + 1}`,
          status: 'published',
          published_at: date.toISOString()
        };
      });

      const milestones = calculateMilestones(generatedPoems);

      expect(milestones.length).toBe(3); // 1º, 50º, 100º

      // 1º Poema
      expect(milestones[0].number).toBe(1);
      expect(milestones[0].label).toBe('1º Poema Publicado');
      expect(milestones[0].title).toBe('Poema Número 1');
      expect(milestones[0].slug).toBe('poema-numero-1');
      expect(milestones[0].year).toBe(2015);

      // 50º Poema
      expect(milestones[1].number).toBe(50);
      expect(milestones[1].label).toBe('50º Poema Catalogado');
      expect(milestones[1].title).toBe('Poema Número 50');
      expect(milestones[1].slug).toBe('poema-numero-50');

      // 100º Poema
      expect(milestones[2].number).toBe(100);
      expect(milestones[2].label).toBe('100º Poema Catalogado');
      expect(milestones[2].title).toBe('Poema Número 100');
      expect(milestones[2].slug).toBe('poema-numero-100');
    });

    it('agrupa por ano com contagens e principais sentimentos (CA01)', () => {
      const samplePoems = [
        { title: 'A', slug: 'a', status: 'published', published_at: '2020-05-10', tags: ['Amor', 'Saudade'] },
        { title: 'B', slug: 'b', status: 'published', published_at: '2020-08-15', tags: ['Amor'] },
        { title: 'C', slug: 'c', status: 'published', published_at: '2021-02-01', tags: ['Tempo'] }
      ];

      const groupsDesc = groupPoemsByYear(samplePoems, { sortOrder: 'desc' });
      expect(groupsDesc.length).toBe(2);
      expect(groupsDesc[0].year).toBe(2021);
      expect(groupsDesc[0].count).toBe(1);
      expect(groupsDesc[1].year).toBe(2020);
      expect(groupsDesc[1].count).toBe(2);
      expect(groupsDesc[1].topSentiments[0].name).toBe('Amor');
      expect(groupsDesc[1].topSentiments[0].count).toBe(2);

      const stats = getArchiveStats(samplePoems);
      expect(stats.totalPoems).toBe(3);
      expect(stats.startYear).toBe(2020);
      expect(stats.latestYear).toBe(2021);
      expect(stats.peakYear.year).toBe(2020);
      expect(stats.peakYear.count).toBe(2);
    });
  });

  describe('CT02 & CA03: Alternância de ordenação e navegação rápida', () => {
    it('renderiza página de arquivo e alterna entre mais recentes e ordem cronológica', async () => {
      const mockPoems = [
        { id: '1', title: 'Poema Antigo', slug: 'poema-antigo', status: 'published', published_at: '2015-12-10' },
        { id: '2', title: 'Poema Recente', slug: 'poema-recente', status: 'published', published_at: '2026-03-20' }
      ];
      getPublishedPoems.mockResolvedValue(mockPoems);

      const container = document.createElement('div');
      document.body.appendChild(container);

      await archive.render(container);

      // Ordem padrão: decrescente (2026 antes de 2015)
      let yearSections = container.querySelectorAll('.archive-year-section');
      expect(yearSections.length).toBe(2);
      expect(yearSections[0].id).toBe('ano-2026');
      expect(yearSections[1].id).toBe('ano-2015');

      // Chips de ano
      const yearChips = container.querySelectorAll('.year-chip');
      expect(yearChips.length).toBe(2);
      expect(yearChips[0].getAttribute('href')).toBe('#ano-2026');

      // Clica no botão de ordem cronológica ascendente
      const sortAscBtn = container.querySelector('#archive-sort-asc');
      expect(sortAscBtn).not.toBeNull();
      sortAscBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      // Aguarda microtarefa
      await new Promise(r => setTimeout(r, 10));

      yearSections = container.querySelectorAll('.archive-year-section');
      expect(yearSections[0].id).toBe('ano-2015');
      expect(yearSections[1].id).toBe('ano-2026');

      // Clica de volta em mais recentes
      const sortDescBtn = container.querySelector('#archive-sort-desc');
      sortDescBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 10));

      yearSections = container.querySelectorAll('.archive-year-section');
      expect(yearSections[0].id).toBe('ano-2026');
      expect(yearSections[1].id).toBe('ano-2015');

      archive.cleanup();
    });
  });

  describe('CT03 & CA04: Schema.org, Prerender e Sitemap', () => {
    it('archivePageSchema gera CollectionPage com ItemList de poemas', () => {
      const poems = [
        { title: 'Primeiro', slug: 'primeiro', status: 'published', published_at: '2015-12-01' },
        { title: 'Segundo', slug: 'segundo', status: 'published', published_at: '2016-01-01' }
      ];

      const schema = archivePageSchema(poems);

      expect(schema['@type']).toContain('CollectionPage');
      expect(schema.url).toContain('/arquivo/');
      expect(schema.mainEntity.numberOfItems).toBe(2);
      expect(schema.mainEntity.itemListElement[0].name).toBe('Primeiro');
      expect(schema.mainEntity.itemListElement[0].url).toContain('/poema/primeiro/');
    });

    it('scripts/generate-sitemap.js e scripts/prerender.js incluem rota /arquivo/', () => {
      const sitemapScript = fs.readFileSync(path.resolve(process.cwd(), 'scripts/generate-sitemap.js'), 'utf-8');
      const prerenderScript = fs.readFileSync(path.resolve(process.cwd(), 'scripts/prerender.js'), 'utf-8');

      expect(sitemapScript).toContain("{ loc: 'arquivo'");
      expect(prerenderScript).toContain("route: 'arquivo'");
      expect(prerenderScript).toContain('renderArchiveMarkup');
    });

    it('renderArchiveMarkup gera todos os links <a href="/poema/<slug>/"> rastreáveis sem JS', () => {
      const poems = [
        { title: 'Poema Um', slug: 'poema-um', status: 'published', published_at: '2020-01-01' },
        { title: 'Poema Dois', slug: 'poema-dois', status: 'published', published_at: '2021-01-01' }
      ];

      const html = renderArchiveMarkup({ poems, baseUrl: '/' });

      expect(html).toContain('href="/poema/poema-um/"');
      expect(html).toContain('href="/poema/poema-dois/"');
      expect(html).toContain('id="ano-2020"');
      expect(html).toContain('id="ano-2021"');
      expect(html).not.toContain('undefined');
    });
  });

  describe('CT04 & CA05: Links de entrada na Home e Sobre', () => {
    it('renderAboutMarkup contém link para /arquivo/', () => {
      const aboutHtml = renderAboutMarkup({
        avatarUrl: 'https://example.com/foto.jpg',
        bioText: 'Biografia teste',
        poemsCount: 200,
        collectionsCount: 7,
        baseUrl: '/'
      });

      expect(aboutHtml).toContain('href="/arquivo/"');
      expect(aboutHtml).toContain('data-link');
    });

    it('Home page e prerender incluem chamada para /arquivo/', () => {
      const homeJs = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/home.js'), 'utf-8');
      const prerenderJs = fs.readFileSync(path.resolve(process.cwd(), 'scripts/prerender.js'), 'utf-8');

      expect(homeJs).toContain('href="${BASE_URL}arquivo/"');
      expect(prerenderJs).toContain('href="/arquivo/"');
    });
  });
});
