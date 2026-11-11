import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  reportError,
  initGlobalErrorTracking,
  buildErrorLogPayload,
  sanitizeSensitiveText,
  resetErrorReporterState,
  MAX_ERRORS_PER_SESSION,
  FIELD_LIMITS
} from './utils/error-reporter.js';
import { publishDuePoems } from '../scripts/publish-scheduled-poems.js';

vi.mock('./pages/admin/data.js', () => ({
  listDocs: vi.fn(),
  updateDocById: vi.fn(),
  deleteDocById: vi.fn()
}));

import { renderErrorLogs, formatErrorDiagnosticMarkdown } from './pages/admin/errors.js';
import { renderDashboard } from './pages/admin/dashboard.js';
import { listDocs, updateDocById, deleteDocById } from './pages/admin/data.js';

describe('Observabilidade de Erros Front-end e Back-end (SDD 2026-11-11)', () => {
  beforeEach(() => {
    resetErrorReporterState();
    vi.clearAllMocks();
  });

  describe('CT01 & CA01: Captura de erro global e Promise rejeitada no Front-end', () => {
    it('registra window error e unhandledrejection na coleção error_logs com source: frontend e status: open', async () => {
      const addDocFn = vi.fn().mockResolvedValue({ id: 'err-1' });
      const collectionFn = vi.fn((_db, name) => name);
      const dbInstance = { __mockDb: true };

      initGlobalErrorTracking(window, {
        reportFn: (err, opts) =>
          reportError(err, {
            ...opts,
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
            isOnline: true,
            addDocFn,
            collectionFn,
            dbInstance
          })
      });

      const errorEvent = new ErrorEvent('error', {
        error: new Error('Falha ao renderizar componente X'),
        message: 'Falha ao renderizar componente X',
        filename: 'https://nfgbrentano.art.br/assets/index.js',
        lineno: 42,
        colno: 13
      });
      window.dispatchEvent(errorEvent);

      // Aguarda resolução da chamada assíncrona
      await new Promise(r => setTimeout(r, 10));

      expect(addDocFn).toHaveBeenCalledTimes(1);
      expect(collectionFn).toHaveBeenCalledWith(dbInstance, 'error_logs');
      const firstPayload = addDocFn.mock.calls[0][1];
      expect(firstPayload.source).toBe('frontend');
      expect(firstPayload.category).toBe('runtime');
      expect(firstPayload.status).toBe('open');
      expect(firstPayload.message).toContain('Falha ao renderizar componente X');
      expect(firstPayload.context).toContain('"lineno":42');

      // Dispara unhandledrejection
      const rejectionEvent = new CustomEvent('unhandledrejection');
      rejectionEvent.reason = new Error('Promise rejeitada na busca');
      window.dispatchEvent(rejectionEvent);

      await new Promise(r => setTimeout(r, 10));

      expect(addDocFn).toHaveBeenCalledTimes(2);
      const secondPayload = addDocFn.mock.calls[1][1];
      expect(secondPayload.source).toBe('frontend');
      expect(secondPayload.category).toBe('promise');
      expect(secondPayload.status).toBe('open');
      expect(secondPayload.message).toContain('Promise rejeitada na busca');
    });
  });

  describe('CT02 & CA02: Utilitário reportError em fluxos e rotas', () => {
    it('persiste erro com categoria e metadados de contexto customizados', async () => {
      const addDocFn = vi.fn().mockResolvedValue({ id: 'err-router' });
      const collectionFn = vi.fn((_db, name) => name);

      const res = await reportError(new Error('Failed to fetch dynamically imported module /poema.js'), {
        category: 'chunk',
        severity: 'warning',
        route_or_task: '/poema/noite-escura/',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        isOnline: true,
        context: { isChunkError: true, attempt: 1 },
        addDocFn,
        collectionFn,
        dbInstance: {}
      });

      expect(res.sent).toBe(true);
      expect(res.payload.category).toBe('chunk');
      expect(res.payload.severity).toBe('warning');
      expect(res.payload.route_or_task).toBe('/poema/noite-escura/');
      expect(res.payload.context).toContain('"isChunkError":true');
    });
  });

  describe('CT03 & CA03: Persistência de erro na Cloud Function (backend:functions)', () => {
    it('formata e grava erro de sendNewsletter com source: backend:functions', async () => {
      const fnModule = await import('../functions/index.js');
      const addMock = vi.fn().mockResolvedValue({ id: 'fn-err-1' });
      const mockAdminDb = {
        collection: vi.fn(() => ({ add: addMock }))
      };

      const smtpErr = new Error('Invalid login: 535-5.7.8 Username and Password not accepted for user@gmail.com');
      const payload = await fnModule.logBackendFunctionError(mockAdminDb, smtpErr, {
        category: 'smtp',
        severity: 'critical',
        route_or_task: 'sendNewsletter',
        context: { poemId: 'poem-123', failCount: 5 }
      });

      expect(mockAdminDb.collection).toHaveBeenCalledWith('error_logs');
      expect(addMock).toHaveBeenCalledTimes(1);
      expect(payload.source).toBe('backend:functions');
      expect(payload.category).toBe('smtp');
      expect(payload.severity).toBe('critical');
      expect(payload.route_or_task).toBe('sendNewsletter');
      expect(payload.status).toBe('open');
      // Verifica que o e-mail também foi sanitizado no back-end
      expect(payload.message).toContain('[EMAIL_REDACTED]');
      expect(payload.message).not.toContain('user@gmail.com');
    });
  });

  describe('CT04 & CA04: Persistência de erro em scripts de back-end (backend:scripts)', () => {
    it('registra erro em error_logs quando publishDuePoems falha ao atualizar poema agendado', async () => {
      const mockPoems = [
        { id: 'fail-poem', title: 'Poema Agendado', slug: 'poema-agendado', status: 'scheduled', scheduled_at: '2026-11-10T08:00:00.000Z' }
      ];
      const mockSnapshot = {
        forEach: (cb) => mockPoems.forEach(p => cb({ id: p.id, data: () => p }))
      };

      const addDocFn = vi.fn().mockResolvedValue({ id: 'script-err-1' });
      const collectionFn = vi.fn((_db, name) => name);

      await publishDuePoems({
        db: { __scriptDb: true },
        getDocsFn: vi.fn().mockResolvedValue(mockSnapshot),
        updateDocFn: vi.fn().mockRejectedValue(new Error('Firestore quota exceeded')),
        addDocFn,
        queryFn: vi.fn(),
        collectionFn,
        whereFn: vi.fn(),
        docFn: vi.fn((_db, col, id) => ({ col, id })),
        now: new Date('2026-11-10T10:00:00.000Z'),
        log: vi.fn(),
        errorLog: vi.fn()
      });

      expect(addDocFn).toHaveBeenCalledTimes(1);
      const loggedPayload = addDocFn.mock.calls[0][1];
      expect(loggedPayload.source).toBe('backend:scripts');
      expect(loggedPayload.category).toBe('script');
      expect(loggedPayload.route_or_task).toBe('scripts/publish-scheduled-poems.js');
      expect(loggedPayload.message).toContain('Firestore quota exceeded');
    });
  });

  describe('CT05 & CA05: Truncamento de campos longos dentro dos limites do Firestore', () => {
    it('trunca message <= 1000, stack <= 4000, context <= 2000 e route_or_task <= 300', () => {
      const hugeError = new Error('M'.repeat(2500));
      hugeError.stack = 'S'.repeat(10000);

      const payload = buildErrorLogPayload(hugeError, {
        route_or_task: '/' + 'r'.repeat(500),
        context: { detail: 'C'.repeat(4000) },
        user_agent: 'U'.repeat(600)
      });

      expect(payload.message.length).toBeLessThanOrEqual(FIELD_LIMITS.message);
      expect(payload.stack.length).toBeLessThanOrEqual(FIELD_LIMITS.stack);
      expect(payload.context.length).toBeLessThanOrEqual(FIELD_LIMITS.context);
      expect(payload.route_or_task.length).toBeLessThanOrEqual(FIELD_LIMITS.route_or_task);
      expect(payload.user_agent.length).toBeLessThanOrEqual(FIELD_LIMITS.user_agent);
      expect(payload.fingerprint.length).toBeLessThanOrEqual(FIELD_LIMITS.fingerprint);
    });
  });

  describe('CT06 & CA06: Desduplicação e rate-limit por sessão no Front-end', () => {
    it('envia o mesmo erro apenas 1 vez e respeita o limite máximo de 10 erros por sessão', async () => {
      const addDocFn = vi.fn().mockResolvedValue({ id: 'ok' });
      const collectionFn = vi.fn((_db, name) => name);
      const baseOpts = {
        user_agent: 'Mozilla/5.0 (Macintosh)',
        isOnline: true,
        addDocFn,
        collectionFn,
        dbInstance: {}
      };

      // Dispara 5 vezes exatamente o mesmo erro
      for (let i = 0; i < 5; i++) {
        await reportError(new Error('Erro repetido idêntico'), baseOpts);
      }
      expect(addDocFn).toHaveBeenCalledTimes(1);

      // Dispara mais 15 erros distintos
      for (let i = 1; i <= 15; i++) {
        await reportError(new Error(`Erro distinto único ${i} - ${Math.random()}`), {
          ...baseOpts,
          route_or_task: `/rota-${i}`
        });
      }

      // Total na sessão não deve ultrapassar MAX_ERRORS_PER_SESSION (10)
      expect(addDocFn).toHaveBeenCalledTimes(MAX_ERRORS_PER_SESSION);
    });
  });

  describe('CT07 & CA07: Ignorar bots/crawlers e erros de rede quando offline', () => {
    it('descarta eventos originados por Googlebot ou quando navigator.onLine === false', async () => {
      const addDocFn = vi.fn().mockResolvedValue({ id: 'ok' });
      const collectionFn = vi.fn();

      const botRes = await reportError(new Error('Bot error'), {
        user_agent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        isOnline: true,
        addDocFn,
        collectionFn,
        dbInstance: {}
      });
      expect(botRes.sent).toBe(false);
      expect(botRes.reason).toBe('bot');

      const offlineRes = await reportError(new Error('Failed to fetch'), {
        user_agent: 'Mozilla/5.0 (iPhone)',
        isOnline: false,
        category: 'network',
        addDocFn,
        collectionFn,
        dbInstance: {}
      });
      expect(offlineRes.sent).toBe(false);
      expect(offlineRes.reason).toBe('offline');
      expect(addDocFn).not.toHaveBeenCalled();
    });
  });

  describe('CT08, CT09, CT10 & CT12: Aba Erros no Admin (/admin?view=errors)', () => {
    const nowIso = new Date().toISOString();
    const twoDaysAgoIso = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const sampleLogs = [
      {
        id: 'err-front-1',
        source: 'frontend',
        category: 'router',
        severity: 'error',
        message: 'Falha ao carregar rota /poema/teste',
        stack: 'Error: Falha ao carregar rota\n at router.js:280',
        route_or_task: '/poema/teste/',
        fingerprint: 'frontend:router:/poema/teste/:a1b2c3d4',
        context: '{"isChunkError":false}',
        user_agent: 'Mozilla/5.0 Chrome',
        status: 'open',
        created_at: nowIso
      },
      {
        id: 'err-back-1',
        source: 'backend:functions',
        category: 'smtp',
        severity: 'critical',
        message: 'Todos os envios falharam via Gmail SMTP',
        stack: 'Error: SMTP timeout\n at index.js:182',
        route_or_task: 'sendNewsletter',
        fingerprint: 'backend:functions:smtp:sendNewsletter:f9e8d7c6',
        context: '{"poemId":"p1","failCount":3}',
        user_agent: 'firebase-functions/node',
        status: 'open',
        created_at: twoDaysAgoIso
      },
      {
        id: 'err-resolved-1',
        source: 'backend:scripts',
        category: 'script',
        severity: 'warning',
        message: 'Aviso antigo já corrigido',
        stack: '',
        route_or_task: 'scripts/publish-scheduled-poems.js',
        fingerprint: 'backend:scripts:script:11223344',
        context: '{}',
        user_agent: 'node-script',
        status: 'resolved',
        created_at: '2026-10-01T10:00:00.000Z'
      }
    ];

    it('CT08 & CA08: renderiza KPIs corretos e lista ordenada do mais recente para o mais antigo', async () => {
      listDocs.mockResolvedValueOnce({ data: sampleLogs, error: null });

      const container = document.createElement('div');
      await renderErrorLogs(container);

      expect(container.querySelector('#kpi-open-errors').textContent).toBe('2');
      expect(container.querySelector('#kpi-recent-24h').textContent).toBe('1');
      expect(container.querySelector('#kpi-source-split').textContent).toBe('1 Front · 2 Back');
      expect(container.querySelector('#kpi-resolved-errors').textContent).toBe('1');

      const rows = container.querySelectorAll('#error-logs-tbody tr');
      expect(rows.length).toBe(3);
      expect(rows[0].getAttribute('data-error-id')).toBe('err-front-1');
      expect(rows[1].getAttribute('data-error-id')).toBe('err-back-1');
      expect(rows[2].getAttribute('data-error-id')).toBe('err-resolved-1');
    });

    it('CT09 & CA09: filtra registros por origem, status, severidade e busca textual', async () => {
      listDocs.mockResolvedValueOnce({ data: sampleLogs, error: null });

      const container = document.createElement('div');
      await renderErrorLogs(container);

      const sourceSelect = container.querySelector('#error-filter-source');
      sourceSelect.value = 'backend:functions';
      sourceSelect.dispatchEvent(new Event('change'));

      let rows = container.querySelectorAll('#error-logs-tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].getAttribute('data-error-id')).toBe('err-back-1');

      // Reset source e filtra por status = resolved
      sourceSelect.value = 'all';
      const statusSelect = container.querySelector('#error-filter-status');
      statusSelect.value = 'resolved';
      statusSelect.dispatchEvent(new Event('change'));

      rows = container.querySelectorAll('#error-logs-tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].getAttribute('data-error-id')).toBe('err-resolved-1');
    });

    it('CT10 & CA10: permite marcar erro como resolvido e excluir registro', async () => {
      listDocs.mockResolvedValueOnce({ data: sampleLogs.map(l => ({ ...l })), error: null });
      updateDocById.mockResolvedValue({ error: null });
      deleteDocById.mockResolvedValue({ error: null });

      const container = document.createElement('div');
      await renderErrorLogs(container);

      const resolveBtn = container.querySelector('.resolve-error-btn[data-id="err-front-1"]');
      resolveBtn.click();
      await new Promise(r => setTimeout(r, 10));

      expect(updateDocById).toHaveBeenCalledWith('error_logs', 'err-front-1', { status: 'resolved' });
      expect(container.querySelector('#kpi-open-errors').textContent).toBe('1');

      const deleteBtn = container.querySelector('.delete-error-btn[data-id="err-back-1"]');
      deleteBtn.click();
      await new Promise(r => setTimeout(r, 10));

      expect(deleteDocById).toHaveBeenCalledWith('error_logs', 'err-back-1');
      expect(container.querySelectorAll('#error-logs-tbody tr').length).toBe(2);
    });

    it('CT12 & CA12: formata e copia diagnóstico em Markdown ao acionar Copiar diagnóstico', async () => {
      listDocs.mockResolvedValueOnce({ data: sampleLogs.map(l => ({ ...l })), error: null });
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

      const container = document.createElement('div');
      await renderErrorLogs(container);

      const viewBtn = container.querySelector('.view-error-btn[data-id="err-front-1"]');
      viewBtn.click();

      const copyBtn = container.querySelector('#copy-diagnostic-btn');
      copyBtn.click();
      await new Promise(r => setTimeout(r, 10));

      expect(writeTextMock).toHaveBeenCalledTimes(1);
      const copiedMarkdown = writeTextMock.mock.calls[0][0];
      expect(copiedMarkdown).toContain('### Diagnóstico de Erro (ERROR)');
      expect(copiedMarkdown).toContain('Falha ao carregar rota /poema/teste');
      expect(copiedMarkdown).toContain('frontend:router:/poema/teste/:a1b2c3d4');

      const directMd = formatErrorDiagnosticMarkdown(sampleLogs[0]);
      expect(directMd).toContain('#### Stack Trace');
    });
  });

  describe('CT11 & CA11: Indicador de erros em aberto no Dashboard principal', () => {
    it('exibe a contagem de erros em aberto no card do Dashboard com link para ?view=errors', async () => {
      listDocs.mockImplementation((col) => {
        if (col === 'error_logs') {
          return Promise.resolve({
            data: [{ id: 'e1', status: 'open' }, { id: 'e2', status: 'open' }, { id: 'e3', status: 'open' }, { id: 'e4', status: 'open' }]
          });
        }
        return Promise.resolve({ data: [] });
      });

      const container = document.createElement('div');
      await renderDashboard(container);

      const errorCard = container.querySelector('#open-errors-kpi-card');
      expect(errorCard).not.toBeNull();
      expect(errorCard.getAttribute('href')).toContain('admin?view=errors');

      const countSpan = container.querySelector('#dashboard-open-errors-count');
      expect(countSpan.textContent).toBe('4');
      expect(errorCard.textContent).toContain('Analisar');
    });
  });

  describe('CT13 & CT14 (CA13 & CA14): Regras de segurança em firestore.rules', () => {
    const rules = readFileSync('firestore.rules', 'utf8');
    const start = rules.indexOf('match /error_logs/');
    const errorLogsBlock = rules.slice(start, rules.indexOf('\n    }\n', start));

    it('nega leitura, update e delete para usuários não autenticados', () => {
      expect(errorLogsBlock).toContain('allow read, update, delete: if request.auth != null;');
      expect(errorLogsBlock).not.toMatch(/allow read\s*:\s*if true/);
    });

    it('exige schema estrito, status open e limites de tamanho no create', () => {
      expect(errorLogsBlock).toContain("request.resource.data.status == 'open'");
      expect(errorLogsBlock).toContain("request.resource.data.source in ['frontend', 'backend:functions', 'backend:scripts']");
      expect(errorLogsBlock).toContain('request.resource.data.message.size() <= 1000');
      expect(errorLogsBlock).toContain('request.resource.data.stack.size() <= 4000');
      expect(errorLogsBlock).toContain('request.resource.data.context.size() <= 2000');
    });
  });

  describe('CT15 & CA15: Proteção anti-loop quando a gravação no Firestore falha', () => {
    it('absorve a rejeição silenciosamente sem lançar exceção e sem entrar em recursão', async () => {
      const addDocFn = vi.fn().mockRejectedValue(new Error('Firestore unavailable'));
      const collectionFn = vi.fn((_db, name) => name);

      const res = await reportError(new Error('Erro inicial'), {
        user_agent: 'Mozilla/5.0 (Macintosh)',
        isOnline: true,
        addDocFn,
        collectionFn,
        dbInstance: {}
      });

      expect(res.sent).toBe(false);
      expect(res.reason).toBe('write_failed');
      expect(addDocFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('CT16 & CA16: Sanitização de dados sensíveis (LGPD / PII / Tokens)', () => {
    it('mascara e-mails, tokens, senhas e headers Bearer antes de persistir', () => {
      const dirtyText = 'Falha para leitor.teste@dominio.com.br na URL https://nfgbrentano.art.br/unsubscribe?token=segredo999&password=minhasenha123 com Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.xyz';
      const clean = sanitizeSensitiveText(dirtyText);

      expect(clean).toContain('[EMAIL_REDACTED]');
      expect(clean).not.toContain('leitor.teste@dominio.com.br');
      expect(clean).toContain('token=[REDACTED]');
      expect(clean).not.toContain('segredo999');
      expect(clean).toContain('password=[REDACTED]');
      expect(clean).not.toContain('minhasenha123');
      expect(clean).toContain('Bearer [REDACTED]');
      expect(clean).not.toContain('eyJhbGciOiJIUzI1NiJ9');
    });
  });
});
