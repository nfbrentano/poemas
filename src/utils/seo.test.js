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
});
