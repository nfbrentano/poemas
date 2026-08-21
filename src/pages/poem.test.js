import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import poemPage from './poem.js';
import { supabase } from '../utils/supabase.js';

// Mock Supabase and submodules
vi.mock('../utils/supabase.js', () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null })
  };
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } })
      },
      rpc: vi.fn(),
      from: vi.fn().mockReturnValue(mockQueryBuilder)
    }
  };
});

vi.mock('../utils/favorites.js', () => ({
  favorites: {
    has: vi.fn().mockResolvedValue(false),
    isFavorite: vi.fn().mockResolvedValue(false),
    add: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true)
  },
  history: {
    add: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../utils/analytics.js', () => ({
  trackPageView: vi.fn()
}));

vi.mock('../utils/seo.js', () => ({
  updateSEO: vi.fn()
}));

describe('Poem Page - Audio Player Feature', () => {
  let container;

  beforeEach(() => {
    window.matchMedia = window.matchMedia || vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    // Mock HTMLMediaElement pause/load methods
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    poemPage.cleanup();
    document.body.innerHTML = '';
  });

  it('renders audio player when poem has audio_url', async () => {
    const mockPoem = [{
      id: 'p-1',
      title: 'Noite Estrelada',
      slug: 'noite-estrelada',
      content: 'Céu escuro e límpido\nBrilham as estrelas.',
      excerpt: 'Céu escuro...',
      tags: ['Noite', 'Paz'],
      audio_url: 'https://example.com/noite.mp3',
      published_at: new Date().toISOString(),
      prev_slug: null,
      prev_title: null,
      next_slug: null,
      next_title: null
    }];

    supabase.rpc.mockResolvedValue({ data: mockPoem, error: null });

    await poemPage.render(container, { slug: 'noite-estrelada' });

    const player = container.querySelector('.poem-narration-player');
    expect(player).not.toBeNull();
    expect(player.getAttribute('aria-label')).toContain('Player de áudio da poesia');

    const audioElement = container.querySelector('#narration-audio');
    expect(audioElement).not.toBeNull();
    expect(audioElement.src).toBe('https://example.com/noite.mp3');
    expect(audioElement.getAttribute('preload')).toBe('metadata');

    const playBtn = container.querySelector('#narration-play-btn');
    expect(playBtn).not.toBeNull();
    expect(playBtn.getAttribute('aria-label')).toBe('Reproduzir narração');

    const progress = container.querySelector('#narration-progress');
    expect(progress).not.toBeNull();

    const speedBtn = container.querySelector('#narration-speed-btn');
    expect(speedBtn).not.toBeNull();
    expect(speedBtn.textContent).toBe('1x');

    const muteBtn = container.querySelector('#narration-mute-btn');
    expect(muteBtn).not.toBeNull();
  });

  it('does NOT render audio player when poem has no audio_url', async () => {
    const mockPoem = [{
      id: 'p-2',
      title: 'Versos sem Som',
      slug: 'versos-sem-som',
      content: 'Apenas silêncio e palavras.',
      excerpt: 'Apenas silêncio...',
      tags: ['Silêncio'],
      audio_url: null,
      published_at: new Date().toISOString(),
      prev_slug: null,
      prev_title: null,
      next_slug: null,
      next_title: null
    }];

    supabase.rpc.mockResolvedValue({ data: mockPoem, error: null });

    await poemPage.render(container, { slug: 'versos-sem-som' });

    const player = container.querySelector('.poem-narration-player');
    expect(player).toBeNull();
    const audioElement = container.querySelector('#narration-audio');
    expect(audioElement).toBeNull();
  });
});
