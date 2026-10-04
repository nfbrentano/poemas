import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { EMOJIS } from './utils/reactions.js';

const rules = readFileSync('firestore.rules', 'utf8');
const block = (name) => {
  const start = rules.indexOf(`match /${name}/`);
  return rules.slice(start, rules.indexOf('\n    }\n', start));
};

describe('firestore.rules: push_subscriptions', () => {
  const b = block('push_subscriptions');
  it('leitura restrita a usuário autenticado', () => {
    expect(b).toMatch(/allow read, update: if request\.auth != null/);
    expect(b).not.toMatch(/allow read[^;]*if true/);
  });
  it('create valida ID, campos e endpoint', () => {
    expect(b).toContain("matches('^[0-9a-f]{64}$')");
    expect(b).toContain("hasOnly(['user_id', 'subscription'])");
    expect(b).toContain("matches('^https://.*')");
  });
});

describe('firestore.rules: poem_reactions', () => {
  const b = block('poem_reactions');
  it('mantém leitura pública', () => {
    expect(b).toMatch(/allow read: if true/);
  });
  it('create valida campos e lista de emojis igual à do cliente', () => {
    expect(b).toContain("hasOnly(['poem_id', 'emoji', 'session_id'])");
    EMOJIS.forEach(e => expect(b).toContain(`'${e}'`));
    expect(b).toContain('session_id.size() <= 64');
  });
});

describe('push.js unsubscribe', () => {
  const deleteDoc = vi.fn();
  const getDocs = vi.fn();
  beforeEach(() => {
    vi.resetModules();
    deleteDoc.mockReset();
    getDocs.mockReset();
    vi.doMock('./utils/firebase.js', () => ({ db: {}, getFirebaseAuth: vi.fn() }));
    vi.doMock('firebase/firestore', () => ({
      setDoc: vi.fn(), getDocs, deleteDoc,
      doc: (_db, col, id) => ({ col, id }),
    }));
  });

  it('remove pelo ID SHA-256 do endpoint sem consultar o Firestore', async () => {
    const { pushManager, subscriptionDocId } = await import('./utils/push.js');
    const endpoint = 'https://push.example.com/abc';
    const unsubscribe = vi.fn();
    vi.spyOn(pushManager, 'isSupported').mockReturnValue(true);
    vi.spyOn(pushManager, 'getSubscription').mockResolvedValue({ unsubscribe, toJSON: () => ({ endpoint }) });
    await pushManager.unsubscribe();
    const id = await subscriptionDocId(endpoint);
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(deleteDoc).toHaveBeenCalledWith({ col: 'push_subscriptions', id });
    expect(getDocs).not.toHaveBeenCalled();
  });
});

describe('deploy.yml', () => {
  it('executa os testes antes do build', () => {
    const y = readFileSync('.github/workflows/deploy.yml', 'utf8');
    const t = y.indexOf('npm test -- --run');
    expect(t).toBeGreaterThan(-1);
    expect(t).toBeLessThan(y.indexOf('npm run build'));
  });
});
