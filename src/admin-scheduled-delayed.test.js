import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./pages/admin/data.js', () => ({
  listDocs: vi.fn()
}));

import { renderDashboard } from './pages/admin/dashboard.js';
import { listDocs } from './pages/admin/data.js';

describe('Admin Dashboard: Sinalização de Poemas Agendados Atrasados (RF05, CA05 & CT05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CT05 & CA05: dado um poema scheduled com data vencida há mais de 60 minutos, exibe badge "Atrasado"', async () => {
    const ninetyMinutesAgo = new Date(Date.now() - 90 * 60 * 1000).toISOString();
    const mockPoems = [
      {
        id: 'delayed-poem-1',
        title: 'Poema Atrasado',
        slug: 'poema-atrasado',
        status: 'scheduled',
        scheduled_at: ninetyMinutesAgo
      }
    ];

    listDocs.mockImplementation((collectionName) => {
      if (collectionName === 'poems') return Promise.resolve({ data: mockPoems });
      return Promise.resolve({ data: [] });
    });

    const container = document.createElement('div');
    await renderDashboard(container);

    const delayedBadge = container.querySelector('.badge-delayed');
    expect(delayedBadge).not.toBeNull();
    expect(delayedBadge.textContent.trim()).toBe('Atrasado');
    expect(container.textContent).toContain('Poema Atrasado');
  });

  it('CT05 & CA05: dado um poema agendado para o futuro, não exibe badge "Atrasado"', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const mockPoems = [
      {
        id: 'future-poem-1',
        title: 'Poema Futuro',
        slug: 'poema-futuro',
        status: 'scheduled',
        scheduled_at: tomorrow
      }
    ];

    listDocs.mockImplementation((collectionName) => {
      if (collectionName === 'poems') return Promise.resolve({ data: mockPoems });
      return Promise.resolve({ data: [] });
    });

    const container = document.createElement('div');
    await renderDashboard(container);

    const delayedBadge = container.querySelector('.badge-delayed');
    expect(delayedBadge).toBeNull();
    expect(container.textContent).toContain('Poema Futuro');
    expect(container.textContent).not.toContain('Atrasado');
  });
});
