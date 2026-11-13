import { describe, it, expect, vi } from 'vitest';
import {
  getDueScheduledPoems,
  preparePromotionPayload,
  publishDuePoems
} from './publish-scheduled-poems.js';

describe('Publicação automática de poemas agendados (SDD 2026-11-10)', () => {
  const baseTime = new Date('2026-11-10T12:00:00.000Z');

  describe('getDueScheduledPoems', () => {
    it('CT01 & CA01: deve selecionar apenas poemas agendados com data vencida em relação ao relógio', () => {
      const poems = [
        { id: '1', title: 'Poema Passado', status: 'scheduled', scheduled_at: '2026-11-10T11:00:00.000Z' },
        { id: '2', title: 'Poema Exato', status: 'scheduled', scheduled_at: '2026-11-10T12:00:00.000Z' },
        { id: '3', title: 'Poema Futuro', status: 'scheduled', scheduled_at: '2026-11-10T13:00:00.000Z' },
        { id: '4', title: 'Poema Sem Data', status: 'scheduled', scheduled_at: null },
        { id: '5', title: 'Rascunho Vencido', status: 'draft', scheduled_at: '2026-11-10T11:00:00.000Z' },
        { id: '6', title: 'Publicado Anterior', status: 'published', scheduled_at: '2026-11-10T11:00:00.000Z' }
      ];

      const due = getDueScheduledPoems(poems, baseTime);
      expect(due.map(p => p.id)).toEqual(['1', '2']);
    });

    it('CT04 & CA04: poemas futuros ou sem data não são selecionados', () => {
      const poems = [
        { id: '1', title: 'Futuro 1', status: 'scheduled', scheduled_at: '2026-11-10T15:00:00.000Z' },
        { id: '2', title: 'Sem Data', status: 'scheduled', scheduled_at: null },
        { id: '3', title: 'Data Inválida', status: 'scheduled', scheduled_at: 'not-a-date' }
      ];

      const due = getDueScheduledPoems(poems, baseTime);
      expect(due).toEqual([]);
    });

    it('deve lidar graciosamente com entrada nula ou vazia', () => {
      expect(getDueScheduledPoems(null, baseTime)).toEqual([]);
      expect(getDueScheduledPoems([], baseTime)).toEqual([]);
      expect(getDueScheduledPoems([{ invalid: true }], baseTime)).toEqual([]);
    });
  });

  describe('preparePromotionPayload', () => {
    it('CT02 & CA02: deve manter published_at igual a scheduled_at e atualizar updated_at para now', () => {
      const poem = {
        id: 'poem-1',
        title: 'Manhã Serena',
        status: 'scheduled',
        scheduled_at: '2026-11-10T08:00:00.000Z'
      };

      const executionTime = new Date('2026-11-10T08:20:00.000Z');
      const payload = preparePromotionPayload(poem, executionTime);

      expect(payload).toEqual({
        status: 'published',
        published_at: '2026-11-10T08:00:00.000Z',
        updated_at: '2026-11-10T08:20:00.000Z'
      });
    });

    it('RF06: reseta notify_newsletter_on_publish e grava newsletter_sent_at quando habilitado', () => {
      const poem = {
        id: 'poem-notify',
        title: 'Entardecer',
        status: 'scheduled',
        scheduled_at: '2026-11-10T08:00:00.000Z',
        notify_newsletter_on_publish: true
      };

      const executionTime = new Date('2026-11-10T08:20:00.000Z');
      const payload = preparePromotionPayload(poem, executionTime);

      expect(payload).toEqual({
        status: 'published',
        published_at: '2026-11-10T08:00:00.000Z',
        updated_at: '2026-11-10T08:20:00.000Z',
        notify_newsletter_on_publish: false,
        newsletter_sent_at: '2026-11-10T08:20:00.000Z'
      });
    });
  });

  describe('publishDuePoems (orquestração e idempotência)', () => {
    it('promove poemas vencidos chamando updateDoc com o payload correto', async () => {
      const mockPoems = [
        { id: 'due-1', title: 'Obra 1', slug: 'obra-1', status: 'scheduled', scheduled_at: '2026-11-10T10:00:00.000Z' },
        { id: 'due-2', title: 'Obra 2', slug: 'obra-2', status: 'scheduled', scheduled_at: '2026-11-10T11:30:00.000Z' },
        { id: 'future-1', title: 'Obra Futura', slug: 'obra-futura', status: 'scheduled', scheduled_at: '2026-11-10T15:00:00.000Z' }
      ];

      const mockSnapshot = {
        forEach: (cb) => mockPoems.forEach(p => cb({ id: p.id, data: () => p }))
      };

      const getDocsFn = vi.fn().mockResolvedValue(mockSnapshot);
      const updateDocFn = vi.fn().mockResolvedValue();
      const queryFn = vi.fn((c, w) => ({ c, w }));
      const collectionFn = vi.fn((_db, name) => name);
      const whereFn = vi.fn((f, op, val) => ({ f, op, val }));
      const docFn = vi.fn((_db, col, id) => ({ col, id }));

      const result = await publishDuePoems({
        db: {},
        getDocsFn,
        updateDocFn,
        queryFn,
        collectionFn,
        whereFn,
        docFn,
        now: baseTime
      });

      expect(result.publishedCount).toBe(2);
      expect(result.errors).toEqual([]);
      expect(updateDocFn).toHaveBeenCalledTimes(2);

      expect(updateDocFn).toHaveBeenNthCalledWith(
        1,
        { col: 'poems', id: 'due-1' },
        {
          status: 'published',
          published_at: '2026-11-10T10:00:00.000Z',
          updated_at: baseTime.toISOString()
        }
      );

      expect(updateDocFn).toHaveBeenNthCalledWith(
        2,
        { col: 'poems', id: 'due-2' },
        {
          status: 'published',
          published_at: '2026-11-10T11:30:00.000Z',
          updated_at: baseTime.toISOString()
        }
      );
    });

    it('CT07 & CA07: idempotência - executar sem novos vencidos não chama updateDoc nem dispara ações', async () => {
      const mockSnapshot = {
        forEach: (cb) => [
          { id: 'future-1', title: 'Obra Futura', status: 'scheduled', scheduled_at: '2026-11-10T18:00:00.000Z' }
        ].forEach(p => cb({ id: p.id, data: () => p }))
      };

      const getDocsFn = vi.fn().mockResolvedValue(mockSnapshot);
      const updateDocFn = vi.fn().mockResolvedValue();

      const result = await publishDuePoems({
        db: {},
        getDocsFn,
        updateDocFn,
        queryFn: vi.fn(),
        collectionFn: vi.fn(),
        whereFn: vi.fn(),
        docFn: vi.fn(),
        now: baseTime
      });

      expect(result.publishedCount).toBe(0);
      expect(result.publishedPoems).toEqual([]);
      expect(updateDocFn).not.toHaveBeenCalled();
    });

    it('RF06 & CA07: dispara newsletter apenas para poemas com notify_newsletter_on_publish === true', async () => {
      const mockPoems = [
        { id: 'due-with-notify', title: 'Com Notificação', slug: 'com-notif', status: 'scheduled', scheduled_at: '2026-11-10T10:00:00.000Z', notify_newsletter_on_publish: true },
        { id: 'due-without-notify', title: 'Sem Notificação', slug: 'sem-notif', status: 'scheduled', scheduled_at: '2026-11-10T10:30:00.000Z', notify_newsletter_on_publish: false }
      ];

      const mockSnapshot = {
        forEach: (cb) => mockPoems.forEach(p => cb({ id: p.id, data: () => p }))
      };

      const getDocsFn = vi.fn().mockResolvedValue(mockSnapshot);
      const updateDocFn = vi.fn().mockResolvedValue();
      const sendNewsletterFn = vi.fn().mockResolvedValue({ success: true, count: 5 });

      const result = await publishDuePoems({
        db: {},
        getDocsFn,
        updateDocFn,
        queryFn: vi.fn(),
        collectionFn: vi.fn(),
        whereFn: vi.fn(),
        docFn: vi.fn((_db, col, id) => ({ col, id })),
        sendNewsletterFn,
        now: baseTime
      });

      expect(result.publishedCount).toBe(2);
      expect(sendNewsletterFn).toHaveBeenCalledTimes(1);
      expect(sendNewsletterFn).toHaveBeenCalledWith({ poemId: 'due-with-notify' });
    });

    it('CT09 & CA09: falha de gravação não quebra a execução dos outros poemas e registra erro no log', async () => {
      const mockPoems = [
        { id: 'fail-1', title: 'Falha Esperada', status: 'scheduled', scheduled_at: '2026-11-10T10:00:00.000Z' },
        { id: 'ok-1', title: 'Sucesso', status: 'scheduled', scheduled_at: '2026-11-10T10:30:00.000Z' }
      ];

      const mockSnapshot = {
        forEach: (cb) => mockPoems.forEach(p => cb({ id: p.id, data: () => p }))
      };

      const getDocsFn = vi.fn().mockResolvedValue(mockSnapshot);
      const updateDocFn = vi.fn()
        .mockRejectedValueOnce(new Error('Permission denied mock'))
        .mockResolvedValueOnce();

      const errorLog = vi.fn();

      const result = await publishDuePoems({
        db: {},
        getDocsFn,
        updateDocFn,
        queryFn: vi.fn(),
        collectionFn: vi.fn(),
        whereFn: vi.fn(),
        docFn: vi.fn((_db, col, id) => ({ col, id })),
        now: baseTime,
        errorLog
      });

      expect(result.publishedCount).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toEqual({
        id: 'fail-1',
        title: 'Falha Esperada',
        error: 'Permission denied mock'
      });
      expect(errorLog).toHaveBeenCalled();
    });
  });
});
