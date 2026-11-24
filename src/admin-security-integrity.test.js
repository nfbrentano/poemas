import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  assertAdminAuth,
  isAdminAuth,
} = require('../functions/push-helpers.js');

const { fsMocks, invalidatePoemsCacheMock } = vi.hoisted(() => ({
  fsMocks: {
    collection: vi.fn((_db, name) => ({ __col: name })),
    query: vi.fn((col, ...constraints) => ({ __query: true, col, constraints })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    orderBy: vi.fn(),
    limit: vi.fn(),
    doc: vi.fn((_db, col, id) => ({ __doc: true, col, id })),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    writeBatch: vi.fn(),
  },
  invalidatePoemsCacheMock: vi.fn(),
}));

vi.mock('firebase/firestore', () => fsMocks);
vi.mock('firebase/storage', () => ({ ref: vi.fn(), uploadBytes: vi.fn() }));
vi.mock('firebase/functions', () => ({ httpsCallable: vi.fn() }));
vi.mock('./utils/firebase.js', () => ({
  db: { __db: true },
  getFirebaseAuth: vi.fn(),
  getFirebaseStorage: vi.fn(),
  getFirebaseFunctions: vi.fn(),
}));
vi.mock('./utils/poems-store.js', () => ({
  invalidatePoemsCache: (...args) => invalidatePoemsCacheMock(...args),
}));

import {
  deletePoemWithRelations,
  deleteCollectionWithRelations,
} from './pages/admin/data.js';
import {
  escapeCsvCell,
  buildSubscribersCsv,
} from './pages/admin/subscribers.js';

describe('Segurança, Autorização e Integridade Admin (SDD 2026-11-24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CT01 & CA01: Autorização de administrador em sendNewsletter', () => {
    it('assertAdminAuth rejeita auth nulo (unauthenticated) e não-admin (permission-denied)', () => {
      const createErr = (code, message) => {
        const err = new Error(message);
        err.code = code;
        return err;
      };

      try {
        assertAdminAuth(null, createErr, 'enviar a newsletter');
        expect.unreachable('Deveria lançar erro unauthenticated');
      } catch (err) {
        expect(err.code).toBe('unauthenticated');
        expect(err.message).toContain('enviar a newsletter');
      }

      try {
        assertAdminAuth({ token: { email: 'invasor@teste.com' } }, createErr, 'enviar a newsletter');
        expect.unreachable('Deveria lançar erro permission-denied');
      } catch (err) {
        expect(err.code).toBe('permission-denied');
        expect(err.message).toContain('enviar a newsletter');
      }

      expect(isAdminAuth({ token: { admin: true } })).toBe(true);
      expect(isAdminAuth({ token: { email: 'nfgbrentano@gmail.com' } })).toBe(true);
      expect(isAdminAuth({ token: { email: 'invasor@teste.com' } })).toBe(false);
    });

    it('functions/index.js exige assertAdminAuth em sendNewsletter antes de ler poems ou subscribers', () => {
      const indexSource = readFileSync('functions/index.js', 'utf8');
      const sendStart = indexSource.indexOf('exports.sendNewsletter = onCall(');
      const sendBlock = indexSource.slice(sendStart, indexSource.indexOf('exports.sendPushNotification', sendStart));

      const authCheckIdx = sendBlock.indexOf('assertAdminAuth(');
      const poemReadIdx = sendBlock.indexOf('.collection("poems")');
      const subReadIdx = sendBlock.indexOf('.collection("subscribers")');

      expect(authCheckIdx).toBeGreaterThan(-1);
      expect(poemReadIdx).toBeGreaterThan(authCheckIdx);
      expect(subReadIdx).toBeGreaterThan(authCheckIdx);
      expect(sendBlock).toContain('"enviar a newsletter"');
    });
  });

  describe('CT03 & CA03 & CA04: Exclusão em cascata de poemas e coleções', () => {
    it('CA03: deletePoemWithRelations remove o poema e seus vínculos em collection_poems em lote', async () => {
      const batchMock = {
        delete: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };
      fsMocks.writeBatch.mockReturnValueOnce(batchMock);
      fsMocks.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'rel-1', data: () => ({ collection_id: 'col-1', poem_id: 'poem-1' }) },
          { id: 'rel-2', data: () => ({ collection_id: 'col-2', poem_id: 'poem-1' }) },
        ],
      });

      const res = await deletePoemWithRelations('poem-1');

      expect(res.error).toBeNull();
      expect(fsMocks.where).toHaveBeenCalledWith('poem_id', '==', 'poem-1');
      expect(batchMock.delete).toHaveBeenCalledWith({ __doc: true, col: 'poems', id: 'poem-1' });
      expect(batchMock.delete).toHaveBeenCalledWith({ __doc: true, col: 'collection_poems', id: 'rel-1' });
      expect(batchMock.delete).toHaveBeenCalledWith({ __doc: true, col: 'collection_poems', id: 'rel-2' });
      expect(batchMock.commit).toHaveBeenCalledTimes(1);
      expect(invalidatePoemsCacheMock).toHaveBeenCalledTimes(1);
    });

    it('CA04: deleteCollectionWithRelations remove coleção, vínculos em collection_poems e slug de poems.collection_slugs', async () => {
      const batchMock = {
        delete: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };
      fsMocks.writeBatch.mockReturnValueOnce(batchMock);

      // getDoc para a coleção, depois getDoc para cada poema afetado
      fsMocks.getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ slug: 'amor-e-conexao', name: 'Amor e Conexão' }),
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ collection_slugs: ['amor-e-conexao', 'outra-serie'] }),
        });

      fsMocks.getDocs.mockResolvedValueOnce({
        docs: [
          { id: 'rel-a', data: () => ({ collection_id: 'col-amor', poem_id: 'poem-1' }) },
        ],
      });

      const res = await deleteCollectionWithRelations('col-amor');

      expect(res.error).toBeNull();
      expect(fsMocks.where).toHaveBeenCalledWith('collection_id', '==', 'col-amor');
      expect(batchMock.delete).toHaveBeenCalledWith({ __doc: true, col: 'collection_poems', id: 'rel-a' });
      expect(batchMock.delete).toHaveBeenCalledWith({ __doc: true, col: 'collections', id: 'col-amor' });
      expect(batchMock.update).toHaveBeenCalledWith(
        { __doc: true, col: 'poems', id: 'poem-1' },
        expect.objectContaining({
          collection_slugs: ['outra-serie'],
        })
      );
      expect(batchMock.commit).toHaveBeenCalledTimes(1);
      expect(invalidatePoemsCacheMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('CT04 & CA05: Sanitização e exportação CSV de assinantes', () => {
    it('escapeCsvCell neutraliza fórmulas e escapa aspas/cerquilhas com segurança', () => {
      expect(escapeCsvCell('user#1+tag@gmail.com')).toBe('"user#1+tag@gmail.com"');
      expect(escapeCsvCell('=HYPERLINK("http://malicioso")')).toBe('"\'=HYPERLINK(""http://malicioso"")"');
      expect(escapeCsvCell('+1+1')).toBe('"\'+1+1"');
      expect(escapeCsvCell('-10')).toBe('"\'-10"');
      expect(escapeCsvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"');
      expect(escapeCsvCell(null)).toBe('""');
    });

    it('buildSubscribersCsv gera cabeçalho e linhas formatadas sem truncar caracteres especiais', () => {
      const csv = buildSubscribersCsv([
        {
          email: 'user#1+tag@gmail.com',
          active: true,
          created_at: '2026-11-24T10:00:00.000Z',
          unsubscribed_at: '',
        },
        {
          email: '=cmd|" /C calc"!A0',
          active: false,
          created_at: '2026-11-20T10:00:00.000Z',
          unsubscribed_at: '2026-11-21T10:00:00.000Z',
        },
      ]);

      const lines = csv.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('Email,Ativo,Data Inscrição,Data Saída');
      expect(lines[1]).toBe('"user#1+tag@gmail.com","true","2026-11-24T10:00:00.000Z",""');
      expect(lines[2]).toBe('"\'=cmd|"" /C calc""!A0","false","2026-11-20T10:00:00.000Z","2026-11-21T10:00:00.000Z"');
    });
  });
});
