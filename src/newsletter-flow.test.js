import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeHtml as fnEscapeHtml,
  formatPoemContentHtml as fnFormatPoemContentHtml,
  handleSubscribeLogic,
  handleUnsubscribeLogic
} from '../functions/index.js';
import {
  buildDailyPoemEmailHtml,
  getDailyPoemRecipients
} from '../scripts/send-daily-poem.js';
import { normalizeSubscriberDoc, runBackfillSubscribers } from '../scripts/dev/backfill-subscribers.js';
import { newsletter, getSubscribeEndpoint } from './components/newsletter.js';
import unsubscribePage, { getUnsubscribeEndpoint } from './pages/unsubscribe.js';

describe('Fluxo Completo de Newsletter e Unsubscribe (SDD 2026-11-13)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('CT01 & CA01 & CA06: Inscrição de novo assinante e duplicidade idempotente', () => {
    it('cria novo assinante com active: true, unsubscribe_token e created_at', async () => {
      const storedDocs = new Map();
      const mockDb = {
        collection: (name) => {
          expect(name).toBe('subscribers');
          return {
            doc: (docId) => ({
              get: async () => ({
                exists: storedDocs.has(docId),
                data: () => storedDocs.get(docId)
              }),
              set: async (data) => {
                storedDocs.set(docId, data);
              },
              update: async (data) => {
                const current = storedDocs.get(docId) || {};
                storedDocs.set(docId, { ...current, ...data });
              }
            })
          };
        }
      };

      const result = await handleSubscribeLogic({
        dbInstance: mockDb,
        email: 'leitor.novo@dominio.com.br'
      });

      expect(result.statusCode).toBe(200);
      expect(result.body.status).toBe('subscribed');
      expect(result.body.success).toBe(true);

      const saved = storedDocs.get('leitor.novo@dominio.com.br');
      expect(saved).toBeDefined();
      expect(saved.email).toBe('leitor.novo@dominio.com.br');
      expect(saved.active).toBe(true);
      expect(saved.unsubscribe_token).toBeDefined();
      expect(saved.unsubscribe_token.length).toBeGreaterThan(10);
      expect(saved.created_at).toBeDefined();

      // CA06: Segunda chamada com o mesmo e-mail (duplicidade)
      const repeatResult = await handleSubscribeLogic({
        dbInstance: mockDb,
        email: ' LEITOR.NOVO@DOMINIO.COM.BR '
      });

      expect(repeatResult.statusCode).toBe(200);
      expect(repeatResult.body.status).toBe('already_subscribed');
      expect(repeatResult.body.message).toContain('já está inscrito');
      expect(storedDocs.size).toBe(1);
    });

    it('rejeita e-mails inválidos com status 400', async () => {
      const mockDb = { collection: vi.fn() };
      const invalid = await handleSubscribeLogic({ dbInstance: mockDb, email: 'nao-e-um-email' });
      expect(invalid.statusCode).toBe(400);
      expect(invalid.body.success).toBe(false);
    });
  });

  describe('CT02 & CA02: Reativação de assinante inativo', () => {
    it('reativa assinante inativo (active: false), preservando token e limpando unsubscribed_at', async () => {
      const storedDocs = new Map();
      storedDocs.set('inativo@dominio.com', {
        email: 'inativo@dominio.com',
        active: false,
        unsubscribe_token: 'token-existente-123',
        created_at: '2026-01-01T00:00:00.000Z',
        unsubscribed_at: '2026-06-01T00:00:00.000Z'
      });

      const mockDb = {
        collection: () => ({
          doc: (docId) => ({
            get: async () => ({
              exists: storedDocs.has(docId),
              data: () => storedDocs.get(docId)
            }),
            update: async (data) => {
              const current = storedDocs.get(docId) || {};
              storedDocs.set(docId, { ...current, ...data });
            }
          })
        })
      };

      const result = await handleSubscribeLogic({
        dbInstance: mockDb,
        email: 'inativo@dominio.com'
      });

      expect(result.statusCode).toBe(200);
      expect(result.body.status).toBe('reactivated');
      expect(result.body.success).toBe(true);

      const updated = storedDocs.get('inativo@dominio.com');
      expect(updated.active).toBe(true);
      expect(updated.unsubscribed_at).toBeNull();
      expect(updated.unsubscribe_token).toBe('token-existente-123');
      expect(updated.reactivated_at).toBeDefined();
    });
  });

  describe('CT03 & CA03: Cancelamento real e idempotência', () => {
    it('cancela assinante ativo e em repetição mantém status de sucesso sem erro', async () => {
      const storedDocs = new Map();
      storedDocs.set('doc-1', {
        email: 'ativo@dominio.com',
        active: true,
        unsubscribe_token: 'token-valido-xyz'
      });

      const mockDb = {
        collection: () => ({
          where: (_field, _op, val) => ({
            limit: () => ({
              get: async () => {
                const matches = [];
                for (const [id, data] of storedDocs.entries()) {
                  if (data.unsubscribe_token === val) {
                    matches.push({
                      id,
                      data: () => data,
                      ref: {
                        update: async (updateData) => {
                          storedDocs.set(id, { ...data, ...updateData });
                        }
                      }
                    });
                  }
                }
                return {
                  empty: matches.length === 0,
                  docs: matches
                };
              }
            })
          })
        })
      };

      // 1ª chamada: cancelamento com sucesso
      const res1 = await handleUnsubscribeLogic({
        dbInstance: mockDb,
        token: 'token-valido-xyz'
      });
      expect(res1.statusCode).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.already_unsubscribed).toBe(false);

      const docAfter = storedDocs.get('doc-1');
      expect(docAfter.active).toBe(false);
      expect(docAfter.unsubscribed_at).toBeDefined();

      // 2ª chamada: idempotente
      const res2 = await handleUnsubscribeLogic({
        dbInstance: mockDb,
        token: 'token-valido-xyz'
      });
      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.already_unsubscribed).toBe(true);
    });
  });

  describe('CT04 & CA04: Token inválido ou ausente', () => {
    it('handleUnsubscribeLogic retorna 400 se token ausente e 404 se token inexistente', async () => {
      const mockDb = {
        collection: () => ({
          where: () => ({
            limit: () => ({
              get: async () => ({ empty: true, docs: [] })
            })
          })
        })
      };

      const resMissing = await handleUnsubscribeLogic({ dbInstance: mockDb, token: '' });
      expect(resMissing.statusCode).toBe(400);

      const resNotFound = await handleUnsubscribeLogic({ dbInstance: mockDb, token: 'nao-existe' });
      expect(resNotFound.statusCode).toBe(404);
    });

    it('UI de /unsubscribe exibe link inválido quando token ausente ou inexistente', async () => {
      const container = document.createElement('div');
      delete window.location;
      window.location = new URL('https://nfgbrentano.art.br/unsubscribe');

      // Sem token
      await unsubscribePage.render(container);
      expect(container.innerHTML).toContain('Link inválido');
      expect(container.innerHTML).toContain('Não encontramos o token');

      // Com token 404
      window.location = new URL('https://nfgbrentano.art.br/unsubscribe?token=inexistente-123');
      global.fetch = vi.fn().mockResolvedValue({
        status: 404,
        ok: false
      });

      await unsubscribePage.render(container);
      expect(container.innerHTML).toContain('Link inválido ou expirado');
      expect(container.innerHTML).not.toContain('dummy-endpoint.com');
    });
  });

  describe('CT05 & CA05: Escape HTML e List-Unsubscribe', () => {
    it('escapa caracteres perigosos em functions/index.js', () => {
      const rawTitle = '<script>alert("xss")</script> & poesia';
      const escaped = fnEscapeHtml(rawTitle);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; poesia');

      const rawContent = 'Linha 1 <img onerror=xss>\n\nLinha 2 & devaneio';
      const formattedHtml = fnFormatPoemContentHtml(rawContent);
      expect(formattedHtml).toContain('&lt;img onerror=xss&gt;');
      expect(formattedHtml).toContain('&amp; devaneio');
      expect(formattedHtml).toContain('</p><p');
      expect(formattedHtml).not.toContain('<img onerror');
    });

    it('escapa título e conteúdo no template de scripts/send-daily-poem.js', () => {
      const dangerousPoem = {
        title: 'Versos <script>bad()</script>',
        content: 'Estrofe 1 <b>negrito</b>\n\nEstrofe 2 & final',
        slug: 'versos-perigosos'
      };

      const emailHtml = buildDailyPoemEmailHtml({ poem: dangerousPoem });
      expect(emailHtml).toContain('&lt;script&gt;bad()&lt;/script&gt;');
      expect(emailHtml).toContain('&lt;b&gt;negrito&lt;/b&gt;');
      expect(emailHtml).toContain('&amp; final');
      expect(emailHtml).not.toContain('<script>bad()</script>');
    });

    it('getDailyPoemRecipients suporta DAILY_POEM_RECIPIENTS com fallback seguro', () => {
      const originalEnv = process.env.DAILY_POEM_RECIPIENTS;
      delete process.env.DAILY_POEM_RECIPIENTS;
      expect(getDailyPoemRecipients()).toEqual(['nfgbrentano@gmail.com']);

      process.env.DAILY_POEM_RECIPIENTS = 'autor@email.com, leitor@email.com ';
      expect(getDailyPoemRecipients()).toEqual(['autor@email.com', 'leitor@email.com']);

      if (originalEnv !== undefined) {
        process.env.DAILY_POEM_RECIPIENTS = originalEnv;
      } else {
        delete process.env.DAILY_POEM_RECIPIENTS;
      }
    });
  });

  describe('CT08 & CA09: Offline guards em newsletter e unsubscribe', () => {
    let originalOnline;
    beforeEach(() => {
      originalOnline = navigator.onLine;
    });
    afterEach(() => {
      Object.defineProperty(navigator, 'onLine', { value: originalOnline, configurable: true });
    });

    it('formulário de newsletter barra requisição quando offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      document.body.innerHTML = newsletter.render();
      newsletter.init();

      const fetchSpy = vi.spyOn(global, 'fetch');
      const form = document.getElementById('subscribe-form');
      const emailInput = document.getElementById('subscriber-email');
      const msg = document.getElementById('subscribe-message');

      emailInput.value = 'offline@teste.com';
      form.dispatchEvent(new Event('submit'));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(msg.innerHTML).toContain('Você está offline');
    });

    it('página de unsubscribe exibe aviso offline quando navegador sem conexão', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const container = document.createElement('div');
      window.location = new URL('https://nfgbrentano.art.br/unsubscribe?token=offline-token');
      const fetchSpy = vi.spyOn(global, 'fetch');

      await unsubscribePage.render(container);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(container.innerHTML).toContain('Você está offline');
    });
  });

  describe('Backfill de assinantes (scripts/dev/backfill-subscribers.js)', () => {
    it('normalizeSubscriberDoc preenche active: true, unsubscribe_token e created_at quando ausentes', () => {
      const rawDoc = { email: 'legado@teste.com' };
      const { needsUpdate, updatedData } = normalizeSubscriberDoc(rawDoc, {
        generateToken: () => 'token-gerado-mock',
        nowIso: '2026-11-13T12:00:00.000Z'
      });

      expect(needsUpdate).toBe(true);
      expect(updatedData).toEqual({
        active: true,
        unsubscribe_token: 'token-gerado-mock',
        created_at: '2026-11-13T12:00:00.000Z'
      });
    });

    it('normalizeSubscriberDoc não altera doc já normalizado', () => {
      const normalizedDoc = {
        email: 'ok@teste.com',
        active: true,
        unsubscribe_token: 'token-123',
        created_at: '2026-05-01T00:00:00.000Z'
      };
      const { needsUpdate } = normalizeSubscriberDoc(normalizedDoc);
      expect(needsUpdate).toBe(false);
    });

    it('runBackfillSubscribers orquestra atualização de documentos legados', async () => {
      const docs = [
        { id: '1', data: () => ({ email: 'a@a.com' }) },
        { id: '2', data: () => ({ email: 'b@b.com', active: false, unsubscribe_token: 'tok' }) }
      ];

      const getDocsFn = vi.fn().mockResolvedValue({ docs });
      const updateDocFn = vi.fn().mockResolvedValue();
      const collectionFn = vi.fn();
      const docFn = vi.fn((_db, col, id) => ({ col, id }));

      const result = await runBackfillSubscribers({
        db: {},
        collectionFn,
        getDocsFn,
        docFn,
        updateDocFn
      });

      expect(result.totalCount).toBe(2);
      expect(result.updatedCount).toBe(2);
      expect(result.errors).toEqual([]);
      expect(updateDocFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Endpoints de Cloud Functions configurados', () => {
    it('getSubscribeEndpoint e getUnsubscribeEndpoint usam southamerica-east1', () => {
      expect(getSubscribeEndpoint()).toContain('southamerica-east1');
      expect(getSubscribeEndpoint()).toContain('subscribeNewsletter');
      expect(getUnsubscribeEndpoint()).toContain('southamerica-east1');
      expect(getUnsubscribeEndpoint()).toContain('unsubscribeNewsletter');
    });
  });
});
