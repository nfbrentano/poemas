import { describe, it, expect, vi, beforeEach } from 'vitest';

const calls = [];
const rec = (name) => vi.fn((...args) => { calls.push([name, ...args]); return { __op: name, args }; });

const fs = {
  collection: rec('collection'),
  query: rec('query'),
  where: rec('where'),
  orderBy: rec('orderBy'),
  limit: rec('limit'),
  doc: rec('doc'),
  setDoc: vi.fn(async (...a) => { calls.push(['setDoc', ...a.slice(1)]); }),
  addDoc: vi.fn(async (...a) => { calls.push(['addDoc', ...a.slice(1)]); return { id: 'auto1' }; }),
  updateDoc: vi.fn(async (...a) => { calls.push(['updateDoc', ...a.slice(1)]); }),
  deleteDoc: vi.fn(async (...a) => { calls.push(['deleteDoc']); }),
  getDocs: vi.fn(),
};
const auth = { currentUser: { uid: 'u1' }, signOut: vi.fn(async () => {}) };
const callable = vi.fn(async () => ({ data: { ok: true } }));

vi.mock('firebase/firestore', () => fs);
vi.mock('firebase/storage', () => ({ ref: vi.fn((_s, p) => ({ path: p })), uploadBytes: vi.fn(async () => {}) }));
vi.mock('firebase/functions', () => ({ httpsCallable: vi.fn(() => callable) }));
vi.mock('../../utils/firebase.js', () => ({
  db: { __db: true },
  getFirebaseAuth: async () => auth,
  getFirebaseStorage: async () => ({}),
  getFirebaseFunctions: async () => ({}),
}));

const snap = (rows) => ({ docs: rows.map(r => ({ id: r.id, data: () => { const { id, ...rest } = r; return rest; } })) });
let data;
beforeEach(async () => {
  calls.length = 0;
  vi.clearAllMocks();
  localStorage.clear();
  data = await import('./data.js');
});

describe('listDocs', () => {
  it('aplica where, orderBy e limit nessa ordem e inclui o id do documento', async () => {
    fs.getDocs.mockResolvedValueOnce(snap([{ id: 'a', n: 1 }, { id: 'b', n: 2 }]));
    const res = await data.listDocs('subscribers', { where: [['active', '==', true]], orderBy: ['created_at', 'desc'], limit: 5 });
    expect(res).toEqual({ data: [{ id: 'a', n: 1 }, { id: 'b', n: 2 }], error: null });
    expect(calls.filter(c => ['where', 'orderBy', 'limit'].includes(c[0])).map(c => c[0])).toEqual(['where', 'orderBy', 'limit']);
    expect(fs.where).toHaveBeenCalledWith('active', '==', true);
    expect(fs.orderBy).toHaveBeenCalledWith('created_at', 'desc');
    expect(fs.limit).toHaveBeenCalledWith(5);
  });
  it('sem opções lista a coleção inteira', async () => {
    fs.getDocs.mockResolvedValueOnce(snap([]));
    expect(await data.listDocs('poems')).toEqual({ data: [], error: null });
    expect(fs.where).not.toHaveBeenCalled();
  });
  it('single devolve o primeiro ou null', async () => {
    fs.getDocs.mockResolvedValueOnce(snap([{ id: 'a', t: 'x' }, { id: 'b' }]));
    expect((await data.listDocs('poems', { single: true })).data).toEqual({ id: 'a', t: 'x' });
    fs.getDocs.mockResolvedValueOnce(snap([]));
    expect(await data.listDocs('poems', { single: true })).toEqual({ data: null, error: null });
  });
  it('devolve o erro em vez de lançar', async () => {
    const err = new Error('Missing or insufficient permissions.');
    fs.getDocs.mockRejectedValueOnce(err);
    expect(await data.listDocs('poems')).toEqual({ data: null, error: err });
  });
});

describe('insertDocs', () => {
  it('objeto sem id usa addDoc e devolve o documento com id', async () => {
    expect(await data.insertDocs('poems', { title: 'T' })).toEqual({ data: { id: 'auto1', title: 'T' }, error: null });
    expect(fs.addDoc).toHaveBeenCalledTimes(1);
  });
  it('item com id usa setDoc com esse id', async () => {
    const res = await data.insertDocs('poems', { id: 'x1', title: 'T' });
    expect(fs.setDoc).toHaveBeenCalledTimes(1);
    expect(fs.doc).toHaveBeenCalledWith({ __db: true }, 'poems', 'x1');
    expect(res.data).toEqual({ id: 'x1', title: 'T' });
  });
  it('array devolve array', async () => {
    const res = await data.insertDocs('collection_poems', [{ poem_id: 'p1' }, { poem_id: 'p2' }]);
    expect(res.data).toEqual([{ id: 'auto1', poem_id: 'p1' }, { id: 'auto1', poem_id: 'p2' }]);
    expect(fs.addDoc).toHaveBeenCalledTimes(2);
  });
  it('erro volta em { error } sem data', async () => {
    const err = new Error('x'); fs.addDoc.mockRejectedValueOnce(err);
    expect(await data.insertDocs('poems', { a: 1 })).toEqual({ error: err });
  });
});

describe('updateDocById / deleteDocById / deleteDocsWhere', () => {
  it('update e delete operam pelo ID do documento', async () => {
    expect(await data.updateDocById('poems', 'p1', { a: 1 })).toEqual({ error: null });
    expect(fs.doc).toHaveBeenCalledWith({ __db: true }, 'poems', 'p1');
    expect(fs.updateDoc).toHaveBeenCalledWith({ __op: 'doc', args: [{ __db: true }, 'poems', 'p1'] }, { a: 1 });
    expect(await data.deleteDocById('poems', 'p1')).toEqual({ error: null });
    expect(fs.deleteDoc).toHaveBeenCalledTimes(1);
  });
  it('devolvem o erro em { error }', async () => {
    const err = new Error('x');
    fs.updateDoc.mockRejectedValueOnce(err);
    fs.deleteDoc.mockRejectedValueOnce(err);
    expect(await data.updateDocById('poems', 'p1', {})).toEqual({ error: err });
    expect(await data.deleteDocById('poems', 'p1')).toEqual({ error: err });
  });
  it('deleteDocsWhere apaga cada documento encontrado', async () => {
    fs.getDocs.mockResolvedValueOnce(snap([{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }]));
    expect(await data.deleteDocsWhere('collection_poems', 'collection_id', 'c1')).toEqual({ error: null });
    expect(fs.where).toHaveBeenCalledWith('collection_id', '==', 'c1');
    expect(fs.deleteDoc).toHaveBeenCalledTimes(3);
  });
  it('deleteDocsWhere sem resultados não apaga nada', async () => {
    fs.getDocs.mockResolvedValueOnce(snap([]));
    await data.deleteDocsWhere('collection_poems', 'collection_id', 'c1');
    expect(fs.deleteDoc).not.toHaveBeenCalled();
  });
});

describe('arquivos, funções e sessão', () => {
  it('uploadFile devolve o caminho; getPublicFileUrl mantém a codificação histórica', async () => {
    expect(await data.uploadFile('avatars', 'a b.png', new Blob(['x']))).toEqual({ data: { path: 'a b.png' }, error: null });
    expect(data.getPublicFileUrl('avatars', 'a b.png')).toBe(
      `https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent('avatars%2Fa b.png')}?alt=media`
    );
    expect(data.getPublicFileUrl('avatars', 'x.png')).toContain('avatars%252Fx.png');
  });
  it('callFunction devolve data ou error', async () => {
    expect(await data.callFunction('sendNewsletter', { poemId: 'p' })).toEqual({ data: { ok: true }, error: null });
    const err = new Error('boom'); callable.mockRejectedValueOnce(err);
    expect(await data.callFunction('sendNewsletter', {})).toEqual({ error: err });
  });
  it('getAdminSession devolve o usuário e mantém o flag local', async () => {
    expect(await data.getAdminSession()).toEqual({ uid: 'u1' });
    expect(localStorage.getItem('has_admin_session')).toBe('1');
    auth.currentUser = null;
    expect(await data.getAdminSession()).toBeNull();
    expect(localStorage.getItem('has_admin_session')).toBeNull();
    auth.currentUser = { uid: 'u1' };
  });
  it('signOutAdmin sai e limpa o flag', async () => {
    localStorage.setItem('has_admin_session', '1');
    await data.signOutAdmin();
    expect(auth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem('has_admin_session')).toBeNull();
  });
});
