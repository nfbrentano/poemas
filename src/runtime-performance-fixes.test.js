import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  trackPageView: vi.fn(),
  getPublishedPoems: vi.fn(),
  getDocs: vi.fn(),
  getCountFromServer: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn((_db, name) => ({ __col: name })),
  query: vi.fn((col, ...constraints) => ({ __query: true, col, constraints })),
  where: vi.fn((field, op, val) => ({ __where: [field, op, val] })),
  orderBy: vi.fn((field, dir) => ({ __orderBy: [field, dir] })),
  limit: vi.fn((n) => ({ __limit: n })),
  listDocs: vi.fn(),
  initializeApp: vi.fn(() => ({ __app: true })),
  getApps: vi.fn(() => []),
  getFirestore: vi.fn(() => ({ __db: true })),
}));

vi.mock('./utils/analytics.js', () => ({
  trackPageView: (...args) => mocks.trackPageView(...args),
}));

vi.mock('./utils/poems-store.js', () => ({
  getPublishedPoems: (...args) => mocks.getPublishedPoems(...args),
}));

vi.mock('./utils/firebase.js', () => ({
  db: { __db: true },
  app: {},
  getFirebaseAuth: vi.fn(),
  getFirebaseFunctions: vi.fn(),
  getFirebaseStorage: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: (...args) => mocks.initializeApp(...args),
  getApps: (...args) => mocks.getApps(...args),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: (...args) => mocks.getFirestore(...args),
  collection: (...args) => mocks.collection(...args),
  query: (...args) => mocks.query(...args),
  where: (...args) => mocks.where(...args),
  orderBy: (...args) => mocks.orderBy(...args),
  limit: (...args) => mocks.limit(...args),
  getDocs: (...args) => mocks.getDocs(...args),
  getCountFromServer: (...args) => mocks.getCountFromServer(...args),
  addDoc: (...args) => mocks.addDoc(...args),
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('./pages/admin/data.js', () => ({
  listDocs: (...args) => mocks.listDocs(...args),
}));

vi.mock('./router.js', () => ({
  navigateTo: vi.fn(),
}));

import archivePage from './pages/archive.js';
import { isPoemPageView } from './pages/analytics.js';
import poemPage from './pages/poem.js';
import aboutPage from './pages/about.js';
import { renderDashboard } from './pages/admin/dashboard.js';
import { syncMostReadSetting } from './pages/admin/most-read-sync.js';
import { sendDailyPoem } from '../scripts/send-daily-poem.js';

const FULL_POEMS = [
  {
    id: 'p-3',
    slug: 'ser-porto',
    title: 'Ser Porto',
    content: 'Ancorar no cais sereno.',
    excerpt: 'Ancorar no cais sereno.',
    tags: ['Amor', 'Calmaria'],
    collection_slugs: ['amor-e-conexao'],
    status: 'published',
    published_at: '2026-03-01T12:00:00Z',
  },
  {
    id: 'p-2',
    slug: 'o-abraco',
    title: 'O Abraço',
    content: 'Verso completo do abraço.\nSegunda linha do poema.',
    excerpt: 'Verso completo do abraço.',
    tags: ['Amor', 'Afeto'],
    collection_slugs: ['amor-e-conexao'],
    status: 'published',
    published_at: '2026-02-01T12:00:00Z',
  },
  {
    id: 'p-1',
    slug: 'partilhar',
    title: 'Partilhar',
    content: 'Dividir silêncios e manhãs.',
    excerpt: 'Dividir silêncios.',
    tags: ['Afeto'],
    collection_slugs: ['amor-e-conexao'],
    status: 'published',
    published_at: '2026-01-01T12:00:00Z',
  },
];

describe('Vazamento de eventos, Analytics, Cache-First e Referer (SDD 2026-11-24)', () => {
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.body.innerHTML = '<main id="main-content"></main>';
    container = document.getElementById('main-content');
  });

  afterEach(() => {
    archivePage.cleanup();
    delete globalThis.__firebaseNodeReferer;
  });

  describe('CT01 & CA01 & CA02: /arquivo/ sem poem_id falso e sem vazamento de listener', () => {
    it('não chama trackPageView em archive.js, remove listener no cleanup() e ignora /arquivo em isPoemPageView', async () => {
      mocks.getPublishedPoems.mockResolvedValue(FULL_POEMS);

      await archivePage.render(container);

      expect(mocks.trackPageView).not.toHaveBeenCalled();

      // Filtra corretamente page_views legados em analytics.js (RNF02)
      expect(isPoemPageView({ page: '/arquivo', poem_id: 'Arquivo e Linha do Tempo Literária' })).toBe(false);
      expect(isPoemPageView({ page: '/poema/o-abraco', poem_id: 'p-2' })).toBe(true);
      expect(isPoemPageView({ page: '/poema/o-abraco', poem_id: null })).toBe(false);

      const sortAscBtnBefore = container.querySelector('.btn-archive-sort[data-sort="asc"]');
      expect(sortAscBtnBefore).not.toBeNull();

      // Chama cleanup() e garante que clique posterior não dispara re-render
      archivePage.cleanup();
      const yearsBefore = container.querySelector('.archive-years-container')?.innerHTML;
      sortAscBtnBefore.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 20));
      const yearsAfter = container.querySelector('.archive-years-container')?.innerHTML;

      expect(yearsAfter).toBe(yearsBefore);
      expect(container.querySelector('.btn-archive-sort[data-sort="desc"]')?.classList.contains('active')).toBe(true);
    });
  });

  describe('CT02 & CA03 & RNF01: Navegação SPA em poem.js via poems-store sem leituras no Firestore', () => {
    it('resolve poema, prev/next, coleção curada e relacionados com 0 getDocs para poems e collections', async () => {
      mocks.getPublishedPoems.mockResolvedValue(FULL_POEMS);
      mocks.getDocs.mockResolvedValue({ empty: true, docs: [], forEach: () => {} });

      await poemPage.render(container, { slug: 'o-abraco' });

      expect(mocks.getDocs).not.toHaveBeenCalled();
      expect(container.querySelector('h1')?.textContent).toContain('O Abraço');
      expect(container.textContent).toContain('Verso completo do abraço.');
      expect(container.textContent).toContain('Amor e Conexão');
      expect(container.querySelector('a[href*="/poema/partilhar/"]')).not.toBeNull();
      expect(container.querySelector('a[href*="/poema/ser-porto/"]')).not.toBeNull();
      expect(container.querySelector('#related-poems-list')?.textContent).toContain('Ser Porto');
    });
  });

  describe('CT03 & CA04: Contagem de poemas em /sobre/ via store sem getCountFromServer', () => {
    it('atualiza #total-poems-count com o total do store sem consultar getCountFromServer', async () => {
      const fake159 = Array.from({ length: 159 }, (_, i) => ({ id: `p-${i}`, slug: `p-${i}` }));
      mocks.getPublishedPoems.mockResolvedValue(fake159);
      mocks.getDocs.mockResolvedValue({ docs: [] });

      await aboutPage.render(container);
      await new Promise(r => setTimeout(r, 30));

      expect(mocks.getCountFromServer).not.toHaveBeenCalled();
      expect(container.querySelector('#total-poems-count')?.textContent).toBe('159');
    });
  });

  describe('CT04 & CA05: Limites nas queries do Dashboard Admin e most-read-sync', () => {
    it('aplica limit: 2500 em page_views e limit: 200 em poem_comments/error_logs no dashboard', async () => {
      mocks.listDocs.mockResolvedValue({ data: [], error: null });

      await renderDashboard(container);

      expect(mocks.listDocs).toHaveBeenCalledWith(
        'poem_comments',
        expect.objectContaining({ limit: 200 })
      );
      expect(mocks.listDocs).toHaveBeenCalledWith(
        'page_views',
        expect.objectContaining({ limit: 2500 })
      );
      expect(mocks.listDocs).toHaveBeenCalledWith(
        'error_logs',
        expect.objectContaining({ limit: 200 })
      );
    });

    it('syncMostReadSetting limita a 2500 no fallback de page_views antigos', async () => {
      const limitFn = vi.fn((n) => ({ __limit: n }));
      const getDocsFn = vi.fn().mockResolvedValue({ docs: [] });

      await syncMostReadSetting({
        dbInstance: { __db: true },
        poems: FULL_POEMS,
        recentViews: [],
        collectionFn: vi.fn((_db, name) => ({ name })),
        queryFn: vi.fn((...args) => args),
        whereFn: vi.fn((...args) => args),
        orderByFn: vi.fn((...args) => args),
        limitFn,
        getDocsFn,
        docFn: vi.fn((...args) => args),
        setDocFn: vi.fn().mockResolvedValue(undefined),
      });

      expect(limitFn).toHaveBeenCalledWith(2500);
      expect(limitFn).not.toHaveBeenCalledWith(10000);
    });
  });

  describe('CT05 & CA06: Referer e config dinâmica em send-daily-poem.js', () => {
    it('lê Firebase config dinamicamente do env e instala globalThis.__firebaseNodeReferer', async () => {
      const prevEnv = {
        VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
        GMAIL_USER: process.env.GMAIL_USER,
        GMAIL_PASS: process.env.GMAIL_PASS,
      };

      process.env.VITE_FIREBASE_API_KEY = 'dynamic-test-key';
      process.env.VITE_FIREBASE_PROJECT_ID = 'poemas-natanael';
      process.env.GMAIL_USER = 'autor@teste.com';
      process.env.GMAIL_PASS = 'app-pass';

      mocks.getDocs.mockResolvedValueOnce({
        docs: [{ data: () => FULL_POEMS[0] }],
      });
      const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-1' });

      try {
        const res = await sendDailyPoem({
          transporterInstance: { sendMail: sendMailMock },
          log: vi.fn(),
          errorLog: vi.fn(),
        });

        expect(globalThis.__firebaseNodeReferer).toBe('https://nfgbrentano.art.br/');
        expect(mocks.initializeApp).toHaveBeenCalledWith(
          expect.objectContaining({
            apiKey: 'dynamic-test-key',
            projectId: 'poemas-natanael',
          })
        );
        expect(res.success).toBe(true);
        expect(sendMailMock).toHaveBeenCalledTimes(1);
      } finally {
        Object.entries(prevEnv).forEach(([k, v]) => {
          if (v === undefined) delete process.env[k];
          else process.env[k] = v;
        });
      }
    });
  });
});
