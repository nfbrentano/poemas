import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  computeMostReadPoems,
  filterPublishedMostRead,
  renderMostReadMarkup
} from './utils/most-read.js';
import { buildLlmsTxt, SITE_URL } from './utils/llms-builder.js';
import { loadMostReadForBuild } from '../scripts/most-read-loader.js';
import { renderHomeMarkup } from '../scripts/prerender.js';
import { syncMostReadSetting } from './pages/admin/most-read-sync.js';

vi.mock('./utils/firebase.js', () => ({
  db: {},
  app: {},
  getFirebaseAuth: vi.fn(),
  getFirebaseStorage: vi.fn()
}));

const mockGetDocs = vi.fn();
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn((_db, name) => ({ name })),
  query: vi.fn((...args) => args),
  where: vi.fn((...args) => args),
  orderBy: vi.fn((...args) => args),
  limit: vi.fn((...args) => args),
  getDocs: (...args) => mockGetDocs(...args)
}));

describe('[FEAT] Seção "Mais lidos" com os poemas mais visitados (SDD 2026-11-10)', () => {
  const fixedNow = new Date('2026-11-16T12:00:00Z');
  const daysAgoIso = (days) => new Date(fixedNow.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const makePoems = (count = 7) =>
    Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      title: `Poema ${i + 1}`,
      slug: `poema-${i + 1}`,
      content: `Primeiro verso do poema ${i + 1}\nSegundo verso.`,
      status: 'published',
      published_at: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z`
    }));

  const makeViews = (poemId, slug, count, createdAt = daysAgoIso(2)) =>
    Array.from({ length: count }, () => ({
      poem_id: poemId,
      page: `/poema/${slug}/`,
      created_at: createdAt
    }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CT01 & CA01 & CA02: Ranking básico sem contagens públicas', () => {
    it('retorna os 5 poemas publicados mais lidos em ordem decrescente e o HTML omite contagens', () => {
      const poems = makePoems(7);
      const pageViews = [
        ...makeViews('p1', 'poema-1', 3),
        ...makeViews('p2', 'poema-2', 10),
        ...makeViews('p3', 'poema-3', 7),
        ...makeViews('p4', 'poema-4', 1),
        ...makeViews('p5', 'poema-5', 15),
        ...makeViews('p6', 'poema-6', 5),
        ...makeViews('p7', 'poema-7', 12)
      ];

      const ranked = computeMostReadPoems({ poems, pageViews, now: fixedNow });

      expect(ranked.map(p => p.slug)).toEqual([
        'poema-5', // 15
        'poema-7', // 12
        'poema-2', // 10
        'poema-3', // 7
        'poema-6'  // 5
      ]);
      expect(ranked.map(p => p.position)).toEqual([1, 2, 3, 4, 5]);

      // Nenhum campo numérico de contagem é exposto
      ranked.forEach(item => {
        expect(item).not.toHaveProperty('views');
        expect(item).not.toHaveProperty('count');
      });

      const markup = renderMostReadMarkup(ranked, { baseUrl: '/' });
      const container = document.createElement('div');
      container.innerHTML = markup;

      expect(container.querySelector('.most-read-heading')?.textContent).toBe('Mais lidos');
      const items = container.querySelectorAll('.most-read-item');
      expect(items.length).toBe(5);

      const links = Array.from(container.querySelectorAll('.most-read-link'));
      expect(links.map(a => a.getAttribute('href'))).toEqual([
        '/poema/poema-5/',
        '/poema/poema-7/',
        '/poema/poema-2/',
        '/poema/poema-3/',
        '/poema/poema-6/'
      ]);
      expect(links.map(a => a.querySelector('.most-read-rank')?.textContent)).toEqual(['1', '2', '3', '4', '5']);
      expect(links.map(a => a.querySelector('.most-read-title')?.textContent)).toEqual([
        'Poema 5',
        'Poema 7',
        'Poema 2',
        'Poema 3',
        'Poema 6'
      ]);

      // Garante ausência de contagens de visualização (15, 12, 10, 7, 5) no texto
      const renderedText = container.textContent;
      expect(renderedText).not.toMatch(/15|12|10|visualiza/i);
    });
  });

  describe('CT02 & CA03: Poemas despublicados e páginas não-poema ignorados', () => {
    it('exclui poemas draft/scheduled e páginas que não são de poema', () => {
      const poems = makePoems(6);
      poems[0].status = 'draft';
      poems[1].status = 'scheduled';

      const pageViews = [
        ...makeViews('p1', 'poema-1', 50), // draft -> fora
        ...makeViews('p2', 'poema-2', 40), // scheduled -> fora
        ...Array.from({ length: 30 }, () => ({ poem_id: 'Arquivo e Linha do Tempo Literária', page: '/arquivo', created_at: daysAgoIso(1) })),
        ...Array.from({ length: 25 }, () => ({ poem_id: null, page: '/', created_at: daysAgoIso(1) })),
        ...makeViews('p3', 'poema-3', 8),
        ...makeViews('p4', 'poema-4', 6),
        ...makeViews('p5', 'poema-5', 4),
        ...makeViews('p6', 'poema-6', 2)
      ];

      const ranked = computeMostReadPoems({ poems, pageViews, now: fixedNow });
      expect(ranked.map(p => p.slug)).toEqual(['poema-3', 'poema-4', 'poema-5', 'poema-6']);
    });

    it('filterPublishedMostRead remove poema despublicado depois da agregação', () => {
      const poems = makePoems(3);
      poems[0].status = 'draft';
      const cached = [
        { id: 'p1', slug: 'poema-1', title: 'Poema 1' },
        { id: 'p2', slug: 'poema-2', title: 'Poema 2' },
        { id: 'p3', slug: 'poema-3', title: 'Poema 3' }
      ];

      const filtered = filterPublishedMostRead(cached, poems);
      expect(filtered.map(p => p.slug)).toEqual(['poema-2', 'poema-3']);
      expect(filtered.map(p => p.position)).toEqual([1, 2]);
    });
  });

  describe('CT03, RF04 & CA04: Fallback do período total e omissão sem dados', () => {
    it('omite completamente a seção quando não há visualizações válidas', () => {
      const poems = makePoems(5);
      expect(computeMostReadPoems({ poems, pageViews: [], now: fixedNow })).toEqual([]);
      expect(renderMostReadMarkup([])).toBe('');

      const homeHtml = renderHomeMarkup({
        poems,
        podPoem: poems[0],
        mostReadPoems: []
      });
      expect(homeHtml).not.toContain('class="most-read');
      expect(homeHtml).not.toContain('Mais lidos');
    });

    it('completa até 5 vagas com o período total quando últimos 30 dias têm menos de 5 poemas', () => {
      const poems = makePoems(7);
      const pageViews = [
        // Últimos 30 dias: apenas p1 e p2
        ...makeViews('p1', 'poema-1', 2, daysAgoIso(5)),
        ...makeViews('p2', 'poema-2', 4, daysAgoIso(10)),
        // Mais antigos que 30 dias: p4 (20), p6 (12), p3 (8), p5 (3)
        ...makeViews('p4', 'poema-4', 20, daysAgoIso(45)),
        ...makeViews('p6', 'poema-6', 12, daysAgoIso(60)),
        ...makeViews('p3', 'poema-3', 8, daysAgoIso(90)),
        ...makeViews('p5', 'poema-5', 3, daysAgoIso(120))
      ];

      const ranked = computeMostReadPoems({ poems, pageViews, days: 30, limit: 5, now: fixedNow });
      expect(ranked.map(p => p.slug)).toEqual([
        'poema-2', // 30d: 4
        'poema-1', // 30d: 2
        'poema-4', // total fill: 20
        'poema-6', // total fill: 12
        'poema-3'  // total fill: 8
      ]);
    });
  });

  describe('CT04, RF05 & CA05: Desempate pelo poema publicado mais recentemente', () => {
    it('ordena empates por published_at decrescente', () => {
      const poems = [
        { id: 'a', title: 'Antigo', slug: 'antigo', status: 'published', published_at: '2025-01-01T10:00:00Z' },
        { id: 'b', title: 'Recente', slug: 'recente', status: 'published', published_at: '2026-11-01T10:00:00Z' },
        { id: 'c', title: 'Intermediário', slug: 'intermediario', status: 'published', published_at: '2026-05-01T10:00:00Z' }
      ];
      const pageViews = [
        ...makeViews('a', 'antigo', 5),
        ...makeViews('b', 'recente', 5),
        ...makeViews('c', 'intermediario', 5)
      ];

      const ranked = computeMostReadPoems({ poems, pageViews, now: fixedNow });
      expect(ranked.map(p => p.slug)).toEqual(['recente', 'intermediario', 'antigo']);
    });
  });

  describe('CT05 & CA06: Seção "Poemas em destaque" em llms.txt', () => {
    it('inclui "Poemas em destaque" com título e URL canônica, sem contagens nem rascunhos', () => {
      const poems = makePoems(6);
      poems[5].status = 'draft';
      const mostReadPoems = [
        { id: 'p6', slug: 'poema-6', title: 'Poema 6' }, // draft -> deve ser filtrado
        { id: 'p3', slug: 'poema-3', title: 'Poema 3', views: 99 },
        { id: 'p1', slug: 'poema-1', title: 'Poema 1' }
      ];

      const llms = buildLlmsTxt({
        baseUrl: SITE_URL,
        poems,
        mostReadPoems
      });

      expect(llms).toContain('## Poemas em destaque');
      expect(llms).toContain(`- [Poema 3](${SITE_URL}poema/poema-3/):`);
      expect(llms).toContain(`- [Poema 1](${SITE_URL}poema/poema-1/):`);
      expect(llms).not.toContain(`- [Poema 6](${SITE_URL}poema/poema-6/)`);
      expect(llms).not.toContain('99');
    });

    it('omite "Poemas em destaque" em llms.txt quando não há destaques', () => {
      const poems = makePoems(3);
      const llms = buildLlmsTxt({ baseUrl: SITE_URL, poems, mostReadPoems: [] });
      expect(llms).not.toContain('## Poemas em destaque');
    });
  });

  describe('CT06, CA07, D03 & Hidratação na Home sem leitura de page_views', () => {
    it('renderiza seção "Mais lidos" antes da lista principal sem consultar page_views na rede', async () => {
      const poems = makePoems(6);
      mockGetDocs.mockResolvedValueOnce({
        docs: poems.map(p => ({ id: p.id, data: () => p }))
      });

      const mostReadPayload = [
        { id: 'p2', slug: 'poema-2', title: 'Poema 2' },
        { id: 'p4', slug: 'poema-4', title: 'Poema 4' },
        { id: 'p1', slug: 'poema-1', title: 'Poema 1' }
      ];

      document.head.innerHTML = `
        <title>Poemas Brasileiros — Natanael Fernando Gatti Brentano</title>
        <link rel="canonical" href="https://nfgbrentano.art.br/" />
        <script type="application/json" id="__MOST_READ__">${JSON.stringify(mostReadPayload)}</script>
      `;
      document.body.innerHTML = '<main id="main-content" data-prerendered="/"></main>';
      window.history.replaceState({}, '', '/');

      const { default: homePage, resetMostReadClientCache } = await import('./pages/home.js');
      resetMostReadClientCache();

      const container = document.getElementById('main-content');
      await homePage.render(container, {});

      // Apenas 1 chamada getDocs (poems publicados), nenhuma leitura a page_views ou site_settings
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      const mostReadEl = container.querySelector('.most-read');
      const podEl = container.querySelector('.poem-of-day');
      const listEl = container.querySelector('.poems-list');
      expect(mostReadEl).not.toBeNull();
      expect(podEl).not.toBeNull();
      expect(listEl).not.toBeNull();

      // D03: Depois de Poema do Dia e antes da lista principal
      expect(podEl.compareDocumentPosition(mostReadEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(mostReadEl.compareDocumentPosition(listEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

      const links = Array.from(mostReadEl.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
      expect(links).toEqual(['/poema/poema-2/', '/poema/poema-4/', '/poema/poema-1/']);

      // Oculta durante busca global
      window.dispatchEvent(new CustomEvent('global-search', { detail: { query: 'Poema', results: poems } }));
      expect(container.querySelector('.most-read')?.style.display).toBe('none');
      window.dispatchEvent(new CustomEvent('global-search', { detail: { query: '', results: null } }));
      expect(container.querySelector('.most-read')?.style.display).toBe('');
    });

    it('carrega /most-read.json via fetch quando #__MOST_READ__ não está no DOM (navegação SPA)', async () => {
      const poems = makePoems(4);
      mockGetDocs.mockResolvedValueOnce({
        docs: poems.map(p => ({ id: p.id, data: () => p }))
      });

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          poems: [
            { id: 'p3', slug: 'poema-3', title: 'Poema 3' },
            { id: 'p1', slug: 'poema-1', title: 'Poema 1' }
          ]
        })
      });
      globalThis.__ENABLE_MOST_READ_FETCH_TEST__ = true;

      document.head.innerHTML = '<title>Poemas</title><link rel="canonical" href="https://nfgbrentano.art.br/" />';
      document.body.innerHTML = '<main id="main-content"></main>';
      window.history.replaceState({}, '', '/');

      try {
        const { default: homePage, resetMostReadClientCache } = await import('./pages/home.js');
        resetMostReadClientCache();

        const container = document.getElementById('main-content');
        await homePage.render(container, {});

        expect(fetchSpy).toHaveBeenCalledWith('/most-read.json');
        const links = Array.from(container.querySelectorAll('.most-read-link')).map(a => a.getAttribute('href'));
        expect(links).toEqual(['/poema/poema-3/', '/poema/poema-1/']);
      } finally {
        delete globalThis.__ENABLE_MOST_READ_FETCH_TEST__;
      }
    });

    it('renderHomeMarkup posiciona .most-read antes de .poems-list e escapa XSS no título', () => {
      const poems = makePoems(5);
      const html = renderHomeMarkup({
        poems,
        podPoem: poems[0],
        mostReadPoems: [
          { id: 'x', slug: 'x-xss', title: '<img src=x onerror=alert(1)>' }
        ]
      });

      expect(html.indexOf('class="poem-of-day')).toBeLessThan(html.indexOf('class="most-read'));
      expect(html.indexOf('class="most-read')).toBeLessThan(html.indexOf('class="poems-list'));
      expect(html).not.toContain('<img src=x onerror=alert(1)>');
      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
  });

  describe('CT08, CA09 & D01: Resiliência do build e estratégia híbrida', () => {
    it('emite aviso e retorna lista vazia sem derrubar o build quando page_views e fallback falham', async () => {
      const warnSpy = vi.fn();
      const poems = makePoems(3);

      const result = await loadMostReadForBuild({
        db: { mock: true },
        auth: { currentUser: null },
        poems,
        adminEmail: 'admin@example.com',
        adminPassword: 'secret',
        warn: warnSpy,
        signInFn: vi.fn().mockRejectedValue(new Error('auth failed')),
        collectionFn: vi.fn(),
        queryFn: vi.fn(),
        whereFn: vi.fn(),
        orderByFn: vi.fn(),
        limitFn: vi.fn(),
        getDocsFn: vi.fn(),
        docFn: vi.fn(),
        getDocFn: vi.fn().mockRejectedValue(new Error('network error'))
      });

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('usa fallback site_settings/most_read quando não há credenciais admin e filtra não publicados', async () => {
      const poems = makePoems(4);
      poems[1].status = 'draft';

      const result = await loadMostReadForBuild({
        db: { mock: true },
        poems,
        adminEmail: '',
        adminPassword: '',
        collectionFn: vi.fn(),
        queryFn: vi.fn(),
        whereFn: vi.fn(),
        orderByFn: vi.fn(),
        limitFn: vi.fn(),
        getDocsFn: vi.fn(),
        docFn: vi.fn((_db, col, id) => ({ col, id })),
        getDocFn: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            poems: [
              { id: 'p2', slug: 'poema-2', title: 'Poema 2' }, // draft -> fora
              { id: 'p3', slug: 'poema-3', title: 'Poema 3', views: 42 },
              { id: 'p1', slug: 'poema-1', title: 'Poema 1' }
            ]
          })
        })
      });

      expect(result.map(p => p.slug)).toEqual(['poema-3', 'poema-1']);
      expect(result[0]).not.toHaveProperty('views');
    });

    it('autentica e lê page_views diretamente quando credenciais admin existem, completando com histórico se < 5', async () => {
      const poems = makePoems(6);
      const signInFn = vi.fn().mockResolvedValue({ user: { email: 'admin@example.com' } });
      const getDocsFn = vi.fn()
        .mockResolvedValueOnce({
          docs: [
            ...makeViews('p2', 'poema-2', 4, daysAgoIso(3)),
            ...makeViews('p1', 'poema-1', 2, daysAgoIso(5))
          ].map(v => ({ data: () => v }))
        })
        .mockResolvedValueOnce({
          docs: [
            ...makeViews('p5', 'poema-5', 9, daysAgoIso(45)),
            ...makeViews('p4', 'poema-4', 6, daysAgoIso(50)),
            ...makeViews('p3', 'poema-3', 3, daysAgoIso(60))
          ].map(v => ({ data: () => v }))
        });
      const getDocFn = vi.fn();

      const result = await loadMostReadForBuild({
        db: { mock: true },
        auth: { currentUser: null },
        poems,
        adminEmail: 'admin@example.com',
        adminPassword: 'secret',
        now: fixedNow,
        signInFn,
        collectionFn: vi.fn(),
        queryFn: vi.fn(),
        whereFn: vi.fn(),
        orderByFn: vi.fn(),
        limitFn: vi.fn(),
        getDocsFn,
        docFn: vi.fn(),
        getDocFn
      });

      expect(signInFn).toHaveBeenCalledTimes(1);
      expect(getDocsFn).toHaveBeenCalledTimes(2);
      expect(getDocFn).not.toHaveBeenCalled();
      expect(result.map(p => p.slug)).toEqual(['poema-2', 'poema-1', 'poema-5', 'poema-4', 'poema-3']);
    });

    it('syncMostReadSetting atualiza site_settings/most_read sem contagens públicas', async () => {
      const poems = makePoems(6);
      const setDocMock = vi.fn().mockResolvedValue(undefined);
      const getDocsMock = vi.fn().mockResolvedValue({
        docs: makeViews('p4', 'poema-4', 8, daysAgoIso(40)).map(v => ({ data: () => v }))
      });

      const res = await syncMostReadSetting({
        dbInstance: { mock: true },
        poems,
        recentViews: makeViews('p2', 'poema-2', 5, daysAgoIso(3)),
        now: fixedNow,
        collectionFn: vi.fn(),
        queryFn: vi.fn(),
        whereFn: vi.fn(),
        orderByFn: vi.fn(),
        limitFn: vi.fn(),
        getDocsFn: getDocsMock,
        docFn: vi.fn((_db, col, id) => ({ col, id })),
        setDocFn: setDocMock
      });

      expect(res.synced).toBe(true);
      expect(res.poems.map(p => p.slug)).toEqual(['poema-2', 'poema-4']);
      expect(setDocMock).toHaveBeenCalledTimes(1);
      const [docRef, payload] = setDocMock.mock.calls[0];
      expect(docRef).toEqual({ col: 'site_settings', id: 'most_read' });
      expect(payload.poems).toEqual([
        { id: 'p2', slug: 'poema-2', title: 'Poema 2', published_at: '2026-10-02T12:00:00Z' },
        { id: 'p4', slug: 'poema-4', title: 'Poema 4', published_at: '2026-10-04T12:00:00Z' }
      ]);
      expect(payload.updated_at).toBe(fixedNow.toISOString());
    });
  });

  describe('CT05, CT07 & D02: Artefatos de build e workflows', () => {
    it('workflows deploy.yml e daily-poem.yml configuram credenciais e rebuild diário', () => {
      const deployYml = fs.readFileSync(path.resolve(process.cwd(), '.github/workflows/deploy.yml'), 'utf-8');
      expect(deployYml).toContain('FIREBASE_ADMIN_EMAIL');
      expect(deployYml).toContain('FIREBASE_ADMIN_PASSWORD');

      const dailyYml = fs.readFileSync(path.resolve(process.cwd(), '.github/workflows/daily-poem.yml'), 'utf-8');
      expect(dailyYml).toContain('actions: write');
      expect(dailyYml).toContain('gh workflow run deploy.yml --ref main');
    });

    it('pós-build: dist/index.html, dist/most-read.json e dist/llms.txt mantêm paridade e integridade', () => {
      const distIndexPath = path.resolve(process.cwd(), 'dist/index.html');
      const distMostReadPath = path.resolve(process.cwd(), 'dist/most-read.json');
      const distLlmsPath = path.resolve(process.cwd(), 'dist/llms.txt');

      if (!fs.existsSync(distIndexPath) || !fs.existsSync(distMostReadPath) || !fs.existsSync(distLlmsPath)) {
        return;
      }

      const indexHtml = fs.readFileSync(distIndexPath, 'utf-8');
      const mostReadJson = JSON.parse(fs.readFileSync(distMostReadPath, 'utf-8'));
      const llmsTxt = fs.readFileSync(distLlmsPath, 'utf-8');

      expect(Array.isArray(mostReadJson.poems)).toBe(true);
      expect(indexHtml).toContain('id="__MOST_READ__"');

      const embeddedMatch = indexHtml.match(/<script type="application\/json" id="__MOST_READ__">([\s\S]*?)<\/script>/);
      expect(embeddedMatch).not.toBeNull();
      const embedded = JSON.parse(embeddedMatch[1]);
      expect(embedded).toEqual(mostReadJson.poems);

      if (mostReadJson.poems.length > 0) {
        expect(indexHtml).toContain('class="most-read');
        expect(llmsTxt).toContain('## Poemas em destaque');
        for (const item of mostReadJson.poems) {
          expect(indexHtml).toContain(`href="/poema/${item.slug}/"`);
          expect(llmsTxt).toContain(`](${SITE_URL}poema/${item.slug}/)`);
        }
      } else {
        expect(indexHtml).not.toContain('class="most-read');
        expect(llmsTxt).not.toContain('## Poemas em destaque');
      }
    });
  });
});
