/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildPushPayload,
  handleSendPushLogic,
} = require('../functions/push-helpers.js');

const {
  preparePromotionPayload,
  publishDuePoems,
} = await import('../scripts/publish-scheduled-poems.js');

// Mocks de módulos do painel Admin
const listDocsMock = vi.fn();
const getDocByIdMock = vi.fn();
const insertDocsMock = vi.fn();
const updateDocByIdMock = vi.fn();
const deleteDocByIdMock = vi.fn();
const callFunctionMock = vi.fn();
const navigateToMock = vi.fn();

vi.mock('./pages/admin/data.js', () => ({
  listDocs: (...args) => listDocsMock(...args),
  getDocById: (...args) => getDocByIdMock(...args),
  insertDocs: (...args) => insertDocsMock(...args),
  updateDocById: (...args) => updateDocByIdMock(...args),
  deleteDocById: (...args) => deleteDocByIdMock(...args),
  callFunction: (...args) => callFunctionMock(...args),
  uploadFile: vi.fn(),
  getPublicFileUrl: vi.fn(),
}));

vi.mock('./router.js', () => ({
  navigateTo: (...args) => navigateToMock(...args),
}));

import { renderEmailHistory } from './pages/admin/emails.js';
import { renderEditor } from './pages/admin/editor.js';

function createFirestoreMock({ poems = {}, subscriptions = [] } = {}) {
  const subsGetSpy = vi.fn(async () => ({
    docs: subscriptions.map((sub) => ({
      id: sub.id,
      data: () => ({ subscription: sub.subscription, user_id: sub.user_id || 'anon' }),
      ref: {
        delete: sub.deleteSpy || vi.fn(async () => {}),
      },
    })),
  }));

  const campaignLogsAddSpy = vi.fn(async (entry) => ({ id: 'log-1', entry }));
  const errorLogsAddSpy = vi.fn(async (entry) => ({ id: 'err-1', entry }));

  const dbInstance = {
    collection: vi.fn((name) => {
      if (name === 'poems') {
        return {
          doc: vi.fn((poemId) => ({
            get: vi.fn(async () => {
              const data = poems[poemId];
              return data ? { exists: true, id: poemId, data: () => data } : { exists: false };
            }),
          })),
        };
      }
      if (name === 'push_subscriptions') {
        return { get: subsGetSpy };
      }
      if (name === 'email_campaign_logs') {
        return { add: campaignLogsAddSpy };
      }
      if (name === 'error_logs') {
        return { add: errorLogsAddSpy };
      }
      return { add: vi.fn(async () => ({ id: 'doc-1' })) };
    }),
  };

  return { dbInstance, subsGetSpy, campaignLogsAddSpy, errorLogsAddSpy };
}

function loadServiceWorkerEnv({ windowClients = [], origin = 'https://nfgbrentano.art.br' } = {}) {
  const swPath = resolve(process.cwd(), 'public/sw.js');
  const swCode = readFileSync(swPath, 'utf-8');
  const listeners = {};
  const showNotification = vi.fn(async () => {});
  const openWindow = vi.fn(async () => ({ focused: true }));
  const matchAll = vi.fn(async () => windowClients);

  const mockSelf = {
    location: { origin },
    registration: { showNotification },
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    },
    skipWaiting: vi.fn(),
  };

  const mockClients = {
    claim: vi.fn(),
    matchAll,
    openWindow,
  };

  const mockCaches = {
    open: vi.fn(async () => ({ addAll: vi.fn(async () => {}), put: vi.fn() })),
    keys: vi.fn(async () => []),
    delete: vi.fn(async () => true),
    match: vi.fn(async () => undefined),
  };

  const factory = new Function(
    'self',
    'clients',
    'caches',
    'fetch',
    'URL',
    'Response',
    'console',
    swCode
  );
  factory(mockSelf, mockClients, mockCaches, vi.fn(), URL, Response, console);

  return { listeners, showNotification, openWindow, matchAll };
}

describe('Web Push na Publicação (SDD 2026-11-13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CT01 / CA02: Segurança e pré-condições de sendPushNotification', () => {
    it('rejeita requisição sem autenticação (unauthenticated) sem consultar inscrições', async () => {
      const { dbInstance, subsGetSpy } = createFirestoreMock();
      const webPush = { setVapidDetails: vi.fn(), sendNotification: vi.fn() };

      await expect(
        handleSendPushLogic({
          auth: null,
          data: { poemId: 'poem-1' },
          dbInstance,
          webPush,
          vapidPublicKey: 'pub',
          vapidPrivateKey: 'priv',
        })
      ).rejects.toMatchObject({ code: 'unauthenticated' });

      expect(subsGetSpy).not.toHaveBeenCalled();
    });

    it('rejeita usuário comum sem papel admin (permission-denied)', async () => {
      const { dbInstance, subsGetSpy } = createFirestoreMock();
      const webPush = { setVapidDetails: vi.fn(), sendNotification: vi.fn() };

      await expect(
        handleSendPushLogic({
          auth: { uid: 'user-1', token: { email: 'leitor@exemplo.com' } },
          data: { poemId: 'poem-1' },
          dbInstance,
          webPush,
          vapidPublicKey: 'pub',
          vapidPrivateKey: 'priv',
        })
      ).rejects.toMatchObject({ code: 'permission-denied' });

      expect(subsGetSpy).not.toHaveBeenCalled();
    });

    it('rejeita envio sem poemId, poema inexistente e poema em rascunho/agendado (failed-precondition)', async () => {
      const { dbInstance, subsGetSpy } = createFirestoreMock({
        poems: {
          'draft-1': { title: 'Rascunho', slug: 'rascunho', status: 'draft' },
          'sched-1': { title: 'Agendado', slug: 'agendado', status: 'scheduled' },
        },
      });
      const webPush = { setVapidDetails: vi.fn(), sendNotification: vi.fn() };
      const adminAuth = { uid: 'admin-1', token: { email: 'nfgbrentano@gmail.com' } };

      await expect(
        handleSendPushLogic({
          auth: adminAuth,
          data: {},
          dbInstance,
          webPush,
          vapidPublicKey: 'pub',
          vapidPrivateKey: 'priv',
        })
      ).rejects.toMatchObject({ code: 'invalid-argument' });

      await expect(
        handleSendPushLogic({
          auth: adminAuth,
          data: { poemId: 'missing-id' },
          dbInstance,
          webPush,
          vapidPublicKey: 'pub',
          vapidPrivateKey: 'priv',
        })
      ).rejects.toMatchObject({ code: 'not-found' });

      await expect(
        handleSendPushLogic({
          auth: adminAuth,
          data: { poemId: 'draft-1' },
          dbInstance,
          webPush,
          vapidPublicKey: 'pub',
          vapidPrivateKey: 'priv',
        })
      ).rejects.toMatchObject({ code: 'failed-precondition' });

      await expect(
        handleSendPushLogic({
          auth: adminAuth,
          data: { poemId: 'sched-1' },
          dbInstance,
          webPush,
          vapidPublicKey: 'pub',
          vapidPrivateKey: 'priv',
        })
      ).rejects.toMatchObject({ code: 'failed-precondition' });

      expect(subsGetSpy).not.toHaveBeenCalled();
      expect(webPush.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('CT02 / CA01 / CA03: Entrega em lote, payload <= 3 KB e limpeza 404/410', () => {
    it('formata payload dentro dos limites (<= 140 chars no body e <= 3072 bytes) com URL canônica do poema', () => {
      const longExcerpt = 'Verso longo com muitos caracteres e emojis ✨ '.repeat(20);
      const payload = buildPushPayload({
        poem: {
          title: 'Crepúsculo no Sul',
          slug: 'crepusculo-no-sul',
          content: longExcerpt,
        },
        siteUrl: 'https://nfgbrentano.art.br/',
      });

      expect(payload.title).toBe('Crepúsculo no Sul');
      expect(payload.url).toBe('https://nfgbrentano.art.br/poema/crepusculo-no-sul/');
      expect(payload.body.length).toBeLessThanOrEqual(140);
      expect(Buffer.byteLength(JSON.stringify(payload), 'utf8')).toBeLessThanOrEqual(3072);
    });

    it('envia para 2 inscrições válidas, remove apenas a expirada (410/404) e registra campanha push', async () => {
      const delValid1 = vi.fn(async () => {});
      const delValid2 = vi.fn(async () => {});
      const delExpired410 = vi.fn(async () => {});
      const delExpired404 = vi.fn(async () => {});

      const { dbInstance, campaignLogsAddSpy } = createFirestoreMock({
        poems: {
          'poem-pub': {
            title: 'Noite Clara',
            slug: 'noite-clara',
            status: 'published',
            excerpt: 'Sob as estrelas quietas do pampa.',
          },
        },
        subscriptions: [
          {
            id: 'sub-1',
            subscription: { endpoint: 'https://push.example/1', keys: { p256dh: 'a', auth: 'b' } },
            deleteSpy: delValid1,
          },
          {
            id: 'sub-2',
            subscription: { endpoint: 'https://push.example/2', keys: { p256dh: 'c', auth: 'd' } },
            deleteSpy: delValid2,
          },
          {
            id: 'sub-410',
            subscription: { endpoint: 'https://push.example/410', keys: { p256dh: 'e', auth: 'f' } },
            deleteSpy: delExpired410,
          },
          {
            id: 'sub-404',
            subscription: { endpoint: 'https://push.example/404', keys: { p256dh: 'g', auth: 'h' } },
            deleteSpy: delExpired404,
          },
        ],
      });

      const webPush = {
        setVapidDetails: vi.fn(),
        sendNotification: vi.fn(async (subscription) => {
          if (subscription.endpoint.endsWith('/410')) {
            const err = new Error('Gone');
            err.statusCode = 410;
            throw err;
          }
          if (subscription.endpoint.endsWith('/404')) {
            const err = new Error('Not Found');
            err.statusCode = 404;
            throw err;
          }
          return { statusCode: 201 };
        }),
      };

      const logErrorFn = vi.fn(async () => {});
      const result = await handleSendPushLogic({
        auth: { uid: 'admin-claim', token: { admin: true } },
        data: { poemId: 'poem-pub' },
        dbInstance,
        webPush,
        vapidPublicKey: 'VAPID_PUB',
        vapidPrivateKey: 'VAPID_PRIV',
        vapidSubject: 'mailto:nfgbrentano@gmail.com',
        logErrorFn,
      });

      expect(webPush.setVapidDetails).toHaveBeenCalledWith(
        'mailto:nfgbrentano@gmail.com',
        'VAPID_PUB',
        'VAPID_PRIV'
      );
      expect(result).toEqual({
        success: true,
        sent: 2,
        failed: 2,
        removed: 2,
        total: 4,
      });
      expect(delValid1).not.toHaveBeenCalled();
      expect(delValid2).not.toHaveBeenCalled();
      expect(delExpired410).toHaveBeenCalledTimes(1);
      expect(delExpired404).toHaveBeenCalledTimes(1);
      expect(logErrorFn).not.toHaveBeenCalled();

      const [, sentRawPayload] = webPush.sendNotification.mock.calls[0];
      const sentPayload = JSON.parse(sentRawPayload);
      expect(sentPayload).toEqual({
        title: 'Noite Clara',
        body: 'Sob as estrelas quietas do pampa.',
        url: 'https://nfgbrentano.art.br/poema/noite-clara/',
      });
      expect(Buffer.byteLength(sentRawPayload, 'utf8')).toBeLessThanOrEqual(3072);

      expect(campaignLogsAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          poem_id: 'poem-pub',
          channel: 'push',
          type: 'push',
          status: 'success',
          sent: 2,
          failed: 2,
          removed: 2,
          total: 4,
        })
      );
    });
  });

  describe('CT04 / CA07: Resiliência e logging via logBackendFunctionError', () => {
    it('registra erro via logBackendFunctionError quando chaves VAPID estão ausentes', async () => {
      const { dbInstance } = createFirestoreMock({
        poems: {
          'poem-1': { title: 'Obra', slug: 'obra', status: 'published' },
        },
      });
      const logErrorFn = vi.fn(async () => {});
      const webPush = { setVapidDetails: vi.fn(), sendNotification: vi.fn() };

      await expect(
        handleSendPushLogic({
          auth: { uid: 'admin', token: { email: 'natanaelfernando@outlook.com' } },
          data: { poemId: 'poem-1' },
          dbInstance,
          webPush,
          vapidPublicKey: '',
          vapidPrivateKey: '',
          logErrorFn,
        })
      ).rejects.toMatchObject({ code: 'failed-precondition' });

      expect(logErrorFn).toHaveBeenCalledWith(
        dbInstance,
        expect.any(Error),
        expect.objectContaining({
          route_or_task: 'sendPushNotification',
          severity: 'critical',
        })
      );
    });

    it('registra erro inesperado (HTTP 500) do serviço web-push via logBackendFunctionError', async () => {
      const { dbInstance } = createFirestoreMock({
        poems: {
          'poem-1': { title: 'Obra', slug: 'obra', status: 'published', content: 'Verso' },
        },
        subscriptions: [
          {
            id: 'sub-500',
            subscription: { endpoint: 'https://push.example/err', keys: { p256dh: 'x', auth: 'y' } },
          },
        ],
      });
      const logErrorFn = vi.fn(async () => {});
      const webPush = {
        setVapidDetails: vi.fn(),
        sendNotification: vi.fn(async () => {
          const err = new Error('Upstream push gateway timeout');
          err.statusCode = 500;
          throw err;
        }),
      };

      const res = await handleSendPushLogic({
        auth: { uid: 'admin', token: { email: 'nfgbrentano@gmail.com' } },
        data: { poemId: 'poem-1' },
        dbInstance,
        webPush,
        vapidPublicKey: 'pub',
        vapidPrivateKey: 'priv',
        logErrorFn,
      });

      expect(res).toEqual({
        success: true,
        sent: 0,
        failed: 1,
        removed: 0,
        total: 1,
      });
      expect(logErrorFn).toHaveBeenCalledWith(
        dbInstance,
        expect.any(Error),
        expect.objectContaining({
          category: 'network',
          severity: 'critical',
          route_or_task: 'sendPushNotification',
        })
      );
    });
  });

  describe('CT03 / CA05: Service Worker (public/sw.js) push & notificationclick', () => {
    it('exibe notificação a partir de JSON válido, texto simples e data ausente', async () => {
      const { listeners, showNotification } = loadServiceWorkerEnv();

      let waitPromise;
      listeners.push({
        data: {
          json: () => ({
            title: 'Poema Novo',
            body: 'Primeiro verso aqui',
            url: 'https://nfgbrentano.art.br/poema/poema-novo/',
          }),
        },
        waitUntil: (p) => { waitPromise = p; },
      });
      await waitPromise;
      expect(showNotification).toHaveBeenLastCalledWith('Poema Novo', expect.objectContaining({
        body: 'Primeiro verso aqui',
        data: { url: 'https://nfgbrentano.art.br/poema/poema-novo/' },
      }));

      // Fallback para texto puro quando json() falha
      listeners.push({
        data: {
          json: () => { throw new SyntaxError('Unexpected token'); },
          text: () => 'Mensagem em texto simples',
        },
        waitUntil: (p) => { waitPromise = p; },
      });
      await waitPromise;
      expect(showNotification).toHaveBeenLastCalledWith('Natanael Fernando Gatti Brentano', expect.objectContaining({
        body: 'Mensagem em texto simples',
        data: { url: '/' },
      }));

      // Fallback completo quando event.data é null
      listeners.push({
        data: null,
        waitUntil: (p) => { waitPromise = p; },
      });
      await waitPromise;
      expect(showNotification).toHaveBeenLastCalledWith('Natanael Fernando Gatti Brentano', expect.objectContaining({
        body: 'Uma nova obra foi publicada. Venha ler.',
        data: { url: '/' },
      }));
    });

    it('foca janela já aberta na URL do poema, navega janela na mesma origem ou abre nova janela', async () => {
      const focusMock = vi.fn(async () => {});
      const matchingEnv = loadServiceWorkerEnv({
        windowClients: [{ url: 'https://nfgbrentano.art.br/poema/meu-poema/', focus: focusMock }],
      });

      let clickPromise;
      matchingEnv.listeners.notificationclick({
        notification: { data: { url: 'https://nfgbrentano.art.br/poema/meu-poema/' }, close: vi.fn() },
        waitUntil: (p) => { clickPromise = p; },
      });
      await clickPromise;
      expect(focusMock).toHaveBeenCalledTimes(1);
      expect(matchingEnv.openWindow).not.toHaveBeenCalled();

      // Nenhuma aba aberta -> openWindow
      const closedEnv = loadServiceWorkerEnv({ windowClients: [] });
      closedEnv.listeners.notificationclick({
        notification: { data: { url: 'https://nfgbrentano.art.br/poema/outro/' }, close: vi.fn() },
        waitUntil: (p) => { clickPromise = p; },
      });
      await clickPromise;
      expect(closedEnv.openWindow).toHaveBeenCalledWith('https://nfgbrentano.art.br/poema/outro/');

      // Fallback para '/' quando data estiver ausente
      closedEnv.listeners.notificationclick({
        notification: { data: undefined, close: vi.fn() },
        waitUntil: (p) => { clickPromise = p; },
      });
      await clickPromise;
      expect(closedEnv.openWindow).toHaveBeenLastCalledWith('/');
    });
  });

  describe('CT06 / CA06: Publicação agendada dispara Web Push quando marcado', () => {
    it('preparePromotionPayload limpa notify_push_on_publish e preenche push_sent_at', () => {
      const now = new Date('2026-11-16T12:00:00.000Z');
      const withPush = preparePromotionPayload({ notify_push_on_publish: true }, now);
      expect(withPush.status).toBe('published');
      expect(withPush.notify_push_on_publish).toBe(false);
      expect(withPush.push_sent_at).toBe('2026-11-16T12:00:00.000Z');

      const withoutPush = preparePromotionPayload({ notify_push_on_publish: false }, now);
      expect(withoutPush.notify_push_on_publish).toBeUndefined();
      expect(withoutPush.push_sent_at).toBeUndefined();
    });

    it('publishDuePoems chama sendPushFn apenas para poemas agendados com notify_push_on_publish = true', async () => {
      const duePoems = [
        {
          id: 'sched-push-yes',
          title: 'Poema com Push',
          slug: 'poema-com-push',
          status: 'scheduled',
          scheduled_at: '2026-11-16T11:00:00.000Z',
          notify_newsletter_on_publish: false,
          notify_push_on_publish: true,
        },
        {
          id: 'sched-push-no',
          title: 'Poema sem Push',
          slug: 'poema-sem-push',
          status: 'scheduled',
          scheduled_at: '2026-11-16T11:05:00.000Z',
          notify_newsletter_on_publish: false,
          notify_push_on_publish: false,
        },
      ];

      const sendPushFn = vi.fn(async () => ({ sent: 3, failed: 0, removed: 0 }));
      const reportErrorFn = vi.fn(async () => {});
      const docs = duePoems.map((p) => ({ id: p.id, data: () => p }));

      const summary = await publishDuePoems({
        db: {},
        getDocsFn: vi.fn(async () => ({
          forEach: (cb) => docs.forEach(cb),
        })),
        updateDocFn: vi.fn(async () => {}),
        addDocFn: vi.fn(async () => {}),
        queryFn: vi.fn(() => ({})),
        collectionFn: vi.fn(() => ({})),
        whereFn: vi.fn(() => ({})),
        docFn: vi.fn((_db, _col, id) => ({ id })),
        sendNewsletterFn: vi.fn(async () => {}),
        sendPushFn,
        reportErrorFn,
        now: new Date('2026-11-16T12:00:00.000Z'),
        log: vi.fn(),
        errorLog: vi.fn(),
      });

      expect(summary.publishedCount).toBe(2);
      expect(summary.publishedPoems.map((p) => p.id)).toEqual(['sched-push-yes', 'sched-push-no']);
      expect(sendPushFn).toHaveBeenCalledTimes(1);
      expect(sendPushFn).toHaveBeenCalledWith({ poemId: 'sched-push-yes' });
      expect(reportErrorFn).not.toHaveBeenCalled();

      // Garante resiliência e reportErrorFn caso sendPushFn falhe
      const failingPushFn = vi.fn(async () => {
        throw new Error('Push gateway failure');
      });
      await publishDuePoems({
        db: {},
        getDocsFn: vi.fn(async () => ({
          forEach: (cb) => [docs[0]].forEach(cb),
        })),
        updateDocFn: vi.fn(async () => {}),
        addDocFn: vi.fn(async () => {}),
        queryFn: vi.fn(() => ({})),
        collectionFn: vi.fn(() => ({})),
        whereFn: vi.fn(() => ({})),
        docFn: vi.fn((_db, _col, id) => ({ id })),
        sendNewsletterFn: vi.fn(async () => {}),
        sendPushFn: failingPushFn,
        reportErrorFn,
        now: new Date('2026-11-16T12:00:00.000Z'),
        log: vi.fn(),
        errorLog: vi.fn(),
      });

      expect(reportErrorFn).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: expect.objectContaining({ phase: 'sendPush', poemId: 'sched-push-yes' }),
        })
      );
    });
  });

  describe('CA04 / D01 / D02: UI Admin (Envios / Campanhas e Editor)', () => {
    it('renderEmailHistory exibe Envios / Campanhas, contagem push, filtro por canal e dialog de disparo', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      listDocsMock.mockImplementation(async (collectionName) => {
        if (collectionName === 'email_campaign_logs') {
          return {
            data: [
              {
                id: 'log-nl',
                poem_id: 'p1',
                channel: 'newsletter',
                type: 'newsletter',
                status: 'success',
                details: 'Newsletter enviada.',
                created_at: '2026-11-15T10:00:00.000Z',
              },
              {
                id: 'log-push',
                poem_id: 'p1',
                channel: 'push',
                type: 'push',
                status: 'success',
                details: 'Web Push enviado.',
                created_at: '2026-11-16T10:00:00.000Z',
              },
            ],
            error: null,
          };
        }
        if (collectionName === 'poems') {
          return { data: [{ id: 'p1', title: 'Aurora Boreal', status: 'published' }], error: null };
        }
        if (collectionName === 'push_subscriptions') {
          return { data: [{ id: 's1' }, { id: 's2' }], error: null };
        }
        return { data: [], error: null };
      });

      callFunctionMock.mockResolvedValue({
        data: { success: true, sent: 2, failed: 0, removed: 0, total: 2 },
        error: null,
      });

      await renderEmailHistory(container);

      expect(container.textContent).toContain('Envios / Campanhas');
      expect(container.querySelector('#push-subs-kpi').textContent).toBe('2');

      const channelFilter = container.querySelector('#email-filter-channel');
      expect(channelFilter).not.toBeNull();
      expect(container.querySelectorAll('#email-tbody tr').length).toBe(2);

      channelFilter.value = 'push';
      channelFilter.dispatchEvent(new Event('change'));
      expect(container.querySelectorAll('#email-tbody tr').length).toBe(1);
      expect(container.querySelector('#email-tbody').textContent).toContain('Web Push');

      // Submete o dialog nativo de envio push
      container.querySelector('#open-push-modal-btn').click();
      const pushPoemSelect = container.querySelector('#push-poem-select');
      pushPoemSelect.value = 'p1';
      container.querySelector('#push-confirm-chk').checked = true;
      container.querySelector('#push-dispatch-form').dispatchEvent(new Event('submit', { cancelable: true }));

      await new Promise((r) => setTimeout(r, 20));

      expect(callFunctionMock).toHaveBeenCalledWith('sendPushNotification', { poemId: 'p1' });
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('2 entregue(s), 0 falha(s), 0 expirada(s) removida(s)'));
      container.remove();
    });

    it('editor chama sendPushNotification no Publicar Agora quando checkbox marcada e expõe botão em poema publicado', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      getDocByIdMock.mockResolvedValue({
        data: {
          id: 'draft-p',
          title: 'Poema em Rascunho',
          slug: 'poema-em-rascunho',
          content: 'Verso inicial',
          status: 'draft',
          tags: [],
          collection_slugs: [],
          notify_push_on_publish: false,
        },
        error: null,
      });
      listDocsMock.mockImplementation(async (col) => {
        if (col === 'push_subscriptions') return { data: [{ id: 's1' }], error: null };
        return { data: [], error: null };
      });
      updateDocByIdMock.mockResolvedValue({ data: { id: 'draft-p' }, error: null });
      callFunctionMock.mockImplementation(async (fnName) => {
        if (fnName === 'sendNewsletter') return { data: { count: 4 }, error: null };
        if (fnName === 'sendPushNotification') return { data: { sent: 1, failed: 0, removed: 0 }, error: null };
        return { data: {}, error: null };
      });

      await renderEditor(container, 'draft-p');

      const pushChk = container.querySelector('#notify-push-on-publish');
      expect(pushChk).not.toBeNull();
      pushChk.checked = true;

      const publishBtn = container.querySelector('#publish-btn');
      publishBtn.click(); // 1º clique: confirmação
      publishBtn.click(); // 2º clique: publicação efetiva

      await new Promise((r) => setTimeout(r, 30));

      expect(updateDocByIdMock).toHaveBeenCalledWith(
        'poems',
        'draft-p',
        expect.objectContaining({
          status: 'published',
          notify_push_on_publish: false,
        })
      );
      expect(callFunctionMock).toHaveBeenCalledWith('sendNewsletter', { poemId: 'draft-p' });
      expect(callFunctionMock).toHaveBeenCalledWith('sendPushNotification', { poemId: 'draft-p' });
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Web Push: 1 entregue(s)'));

      // Agora renderiza poema já publicado e verifica botão #send-poem-push-btn
      callFunctionMock.mockClear();
      getDocByIdMock.mockResolvedValue({
        data: {
          id: 'pub-p',
          title: 'Poema Publicado',
          slug: 'poema-publicado',
          content: 'Verso publicado',
          status: 'published',
          tags: [],
          collection_slugs: [],
        },
        error: null,
      });

      await renderEditor(container, 'pub-p');
      const sendPushBtn = container.querySelector('#send-poem-push-btn');
      expect(sendPushBtn).not.toBeNull();
      sendPushBtn.click();

      await new Promise((r) => setTimeout(r, 30));

      expect(confirmSpy).toHaveBeenCalled();
      expect(callFunctionMock).toHaveBeenCalledWith('sendPushNotification', { poemId: 'pub-p' });
      container.remove();
    });
  });

  describe('Contrato estrutural do backend Firebase Functions', () => {
    it('declara dependência web-push e exporta sendPushNotification com secrets VAPID', () => {
      const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'functions/package.json'), 'utf-8'));
      expect(pkg.dependencies['web-push']).toBeTruthy();

      const indexCode = readFileSync(resolve(process.cwd(), 'functions/index.js'), 'utf-8');
      expect(indexCode).toContain('defineSecret("VAPID_PUBLIC_KEY")');
      expect(indexCode).toContain('defineSecret("VAPID_PRIVATE_KEY")');
      expect(indexCode).toContain('defineSecret("VAPID_SUBJECT")');
      expect(indexCode).toContain('exports.sendPushNotification');
    });
  });
});
