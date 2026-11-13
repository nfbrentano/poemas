import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./pages/admin/data.js', () => ({
  getAdminSession: vi.fn(),
  signOutAdmin: vi.fn(),
  listDocs: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('./router.js', () => ({
  navigateTo: vi.fn(),
}));

import adminPage from './pages/admin.js';
import { getAdminSession } from './pages/admin/data.js';
import { navigateTo } from './router.js';

describe('Admin Auth & Hardening (CA01, CT01, RF01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redireciona para /login mesmo quando ?bypass_auth=true é passado se não autenticado', async () => {
    delete window.location;
    window.location = new URL('https://poemas.exemplo.com/admin?bypass_auth=true');

    getAdminSession.mockResolvedValueOnce(null);

    const container = document.createElement('div');
    await adminPage.render(container);

    expect(navigateTo).toHaveBeenCalledWith('/login');
    expect(container.innerHTML).toBe('');
  });

  it('permite renderização quando usuário autenticado', async () => {
    delete window.location;
    window.location = new URL('https://poemas.exemplo.com/admin');

    getAdminSession.mockResolvedValueOnce({ uid: 'admin-1', email: 'nfgbrentano@gmail.com' });

    const container = document.createElement('div');
    await adminPage.render(container);

    expect(navigateTo).not.toHaveBeenCalled();
    expect(container.querySelector('.admin-layout')).not.toBeNull();
    expect(container.querySelector('#logout-btn')).not.toBeNull();
  });
});
