import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadReactions, toggleReaction, EMOJIS } from './reactions.js';
import { supabase } from './supabase.js';

vi.mock('./supabase.js', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('reactions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exports valid EMOJIS array', () => {
    expect(Array.isArray(EMOJIS)).toBe(true);
    expect(EMOJIS.length).toBeGreaterThan(0);
  });

  it('loads reactions and counts correctly', async () => {
    const mockData = [
      { emoji: '🕯️', session_id: 'session-123' },
      { emoji: '🕯️', session_id: 'other-session' },
      { emoji: '✨', session_id: 'session-123' }
    ];

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      })
    });

    const result = await loadReactions('poem-1');
    expect(result.counts['🕯️']).toBe(2);
    expect(result.counts['✨']).toBe(1);
    expect(result.counts['🌿']).toBe(0);
    expect(localStorage.getItem('reaction_session_id')).toBeTruthy();
  });

  it('toggles reaction by adding when not existing', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'poem_reactions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: mockMaybeSingle
                })
              })
            })
          }),
          insert: mockInsert
        };
      }
    });

    const status = await toggleReaction('poem-1', '🕯️');
    expect(status).toBe('added');
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      poem_id: 'poem-1',
      emoji: '🕯️'
    }));
  });

  it('toggles reaction by removing when already existing', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'reaction-999' }, error: null });
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'poem_reactions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: mockMaybeSingle
                })
              })
            })
          }),
          delete: mockDelete
        };
      }
    });

    const status = await toggleReaction('poem-1', '🕯️');
    expect(status).toBe('removed');
    expect(mockDelete).toHaveBeenCalled();
  });
});
