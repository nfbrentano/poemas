import { describe, it, expect, vi, beforeEach } from 'vitest';
import admin from './admin.js';
import { supabase } from '../utils/supabase.js';

// Mock Supabase
vi.mock('../utils/supabase.js', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        signOut: vi.fn()
      },
      from: vi.fn(),
      functions: {
        invoke: vi.fn()
      }
    }
  };
});

describe('Admin - renderEmailHistory', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    vi.clearAllMocks();
    
    // Default mocks
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
  });

  it('renders loading state first, then details and search filters', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        sent_at: new Date().toISOString(),
        status: 'success',
        details: 'Enviado para 10 assinantes',
        poem_id: 'poem-1',
        poems: { title: 'Poema do Amor' }
      },
      {
        id: 'log-2',
        sent_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'failed',
        details: 'Erro SMTP',
        poem_id: 'poem-2',
        poems: { title: 'Poema da Dor' }
      }
    ];

    const mockPoems = [
      { id: 'poem-1', title: 'Poema do Amor' },
      { id: 'poem-2', title: 'Poema da Dor' }
    ];

    // Mock query calls
    const mockFrom = vi.fn().mockImplementation((table) => {
      if (table === 'email_campaign_logs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockLogs, error: null })
        };
      }
      if (table === 'poems') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockPoems, error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      };
    });

    supabase.from = mockFrom;

    await admin.renderEmailHistory(container);

    // Verify elements exist in container
    expect(container.innerHTML).toContain('Novo Disparo Manual');
    expect(container.innerHTML).toContain('Total de Campanhas');
    expect(container.innerHTML).toContain('Taxa de Sucesso');
    expect(container.innerHTML).toContain('Último Envio');
    
    // Verify specific values
    // Total is 2
    expect(container.innerHTML).toContain('2');
    // Success rate is 50.0%
    expect(container.innerHTML).toContain('50.0%');
    // Last sent title is "Poema do Amor"
    expect(container.innerHTML).toContain('Poema do Amor');

    // Verify search and filters toolbar
    expect(container.querySelector('#email-search')).not.toBeNull();
    expect(container.querySelector('#email-filter-status')).not.toBeNull();
    expect(container.querySelector('#email-sort')).not.toBeNull();

    // Verify modals are present
    expect(container.querySelector('#manual-dispatch-modal')).not.toBeNull();
    expect(container.querySelector('#log-details-modal')).not.toBeNull();
  });

  it('handles empty logs gracefully', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'email_campaign_logs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      };
    });

    await admin.renderEmailHistory(container);

    expect(container.innerHTML).toContain('Total de Campanhas');
    expect(container.innerHTML).toContain('0'); // 0 campaigns
    expect(container.innerHTML).toContain('100.0%'); // Default success rate when 0 campaigns
    expect(container.innerHTML).toContain('Nenhum registro de envio encontrado');
  });
});
