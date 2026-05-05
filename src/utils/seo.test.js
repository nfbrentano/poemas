import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateSEO } from './seo.js';

describe('updateSEO', () => {
  beforeEach(() => {
    document.title = '';
    document.head.innerHTML = '';
  });

  it('updates the page title', () => {
    updateSEO({ title: 'Test Poem' });
    expect(document.title).toBe('Test Poem | Natanael Brentano');
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
    expect(ogTitle.getAttribute('content')).toBe('Test');
    
    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType.getAttribute('content')).toBe('article');
  });
});
