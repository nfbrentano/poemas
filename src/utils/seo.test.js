import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateSEO } from './seo.js';

describe('updateSEO', () => {
  beforeEach(() => {
    document.title = '';
    document.head.innerHTML = '';
  });

  it('updates the page title', () => {
    updateSEO({ title: 'Test Poem' });
    expect(document.title).toBe('Test Poem — Natanael Brentano');
  });

  it('sets meta description', () => {
    updateSEO({ description: 'A test description' });
    const meta = document.querySelector('meta[name="description"]');
    expect(meta.getAttribute('content')).toBe('A test description');
  });

  it('sets OG tags correctly', () => {
    updateSEO({ 
      title: 'Test', 
      url: 'https://example.com/poema/test',
      type: 'article' 
    });
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType.getAttribute('content')).toBe('article');
  });

  it('does not duplicate brand suffix when title already contains Natanael Brentano (CT05)', () => {
    updateSEO({ title: 'Poemas Brasileiros — Natanael Brentano' });
    expect(document.title).toBe('Poemas Brasileiros — Natanael Brentano');

    updateSEO({ title: 'Sobre Natanael Brentano' });
    expect(document.title).toBe('Sobre Natanael Brentano');
  });

  it('uses default title with brand suffix and length <= 60 chars', () => {
    updateSEO({});
    expect(document.title).toBe('Poemas Brasileiros — Natanael Brentano');
    expect(document.title.length).toBeLessThanOrEqual(60);
  });

  it('normalizes canonical and og:url with trailing slash (RF05, CA01)', () => {
    updateSEO({ url: 'https://nfgbrentano.art.br/poema/277' });
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(canonical.getAttribute('href')).toBe('https://nfgbrentano.art.br/poema/277/');
    expect(ogUrl.getAttribute('content')).toBe('https://nfgbrentano.art.br/poema/277/');
  });

  it('strips query strings and hash from canonical and og:url (RF05, CA05, CT05)', () => {
    updateSEO({ url: 'https://nfgbrentano.art.br/?tags=amor' });
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(canonical.getAttribute('href')).toBe('https://nfgbrentano.art.br/');
    expect(ogUrl.getAttribute('content')).toBe('https://nfgbrentano.art.br/');

    updateSEO({ url: 'https://nfgbrentano.art.br/poema/meu-slug?ref=1#comentarios' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://nfgbrentano.art.br/poema/meu-slug/');
    expect(document.querySelector('meta[property="og:url"]').getAttribute('content')).toBe('https://nfgbrentano.art.br/poema/meu-slug/');
  });
});

