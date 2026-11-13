import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let mockGetDocs = vi.fn();
let mockAddDoc = vi.fn();
let mockDeleteDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  query: vi.fn((col, ...constraints) => ({ col, constraints })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  getDocs: (...args) => mockGetDocs(...args),
  addDoc: (...args) => mockAddDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
}));

vi.mock('./firebase.js', () => ({
  db: { __db: true },
}));

vi.mock('./error-reporter.js', () => ({
  reportError: vi.fn(),
}));

import { toggleReaction, loadReactions } from './reactions.js';

describe('reactions.js (RF03, CA03, CT03)', () => {
  let originalOnLine;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    originalOnLine = navigator.onLine;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  it('retorna offline quando desconectado da rede', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const res = await toggleReaction('poem-1', '🕯️');
    expect(res).toBe('offline');
    expect(mockAddDoc).not.toHaveBeenCalled();
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('adiciona reação via addDoc quando usuário ainda não reagiu (retorna "added")', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    mockGetDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    mockAddDoc.mockResolvedValueOnce({ id: 'rec-123' });

    const res = await toggleReaction('poem-1', '🕯️');
    expect(res).toBe('added');
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        poem_id: 'poem-1',
        emoji: '🕯️',
      })
    );
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('retorna "already_reacted" e não chama deleteDoc quando reação já existe', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    mockGetDocs.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: 'rec-existente', data: () => ({ poem_id: 'poem-1', emoji: '🕯️' }) }],
    });

    const res = await toggleReaction('poem-1', '🕯️');
    expect(res).toBe('already_reacted');
    expect(mockAddDoc).not.toHaveBeenCalled();
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('loadReactions contabiliza contagens e identifica reações da sessão atual', async () => {
    localStorage.setItem('reaction_session_id', 'sessao-atual');
    const mockDocs = [
      { data: () => ({ poem_id: 'poem-1', emoji: '🕯️', session_id: 'sessao-atual' }) },
      { data: () => ({ poem_id: 'poem-1', emoji: '🕯️', session_id: 'outra-sessao' }) },
      { data: () => ({ poem_id: 'poem-1', emoji: '❤️', session_id: 'outra-sessao' }) },
    ];
    mockGetDocs.mockResolvedValueOnce({
      forEach: (cb) => mockDocs.forEach(cb),
    });

    const { counts, userReactions } = await loadReactions('poem-1');
    expect(counts['🕯️']).toBe(2);
    expect(counts['❤️']).toBe(1);
    expect(counts['🌙']).toBe(0);
    expect(userReactions.has('🕯️')).toBe(true);
    expect(userReactions.has('❤️')).toBe(false);
  });
});
