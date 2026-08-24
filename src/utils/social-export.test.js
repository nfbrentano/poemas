import { describe, it, expect, vi } from 'vitest';
import { generateSocialCard } from './social-export.js';

// Mock snapdom
vi.mock('@zumer/snapdom', () => ({
  snapdom: {
    toBlob: vi.fn().mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' }))
  }
}));

describe('social-export', () => {
  it('generates social card with 15x21 ratio', async () => {
    const poem = { title: 'Poema Teste', excerpt: 'Conteúdo de teste', slug: 'poema-teste' };
    const container = document.createElement('div');
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock HTMLAnchorElement click
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await generateSocialCard(poem, container, 'dark', null, '15x21');

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('generates social card with 10x15 ratio', async () => {
    const poem = { title: 'Poema Teste 10x15', excerpt: 'Conteúdo de teste 10x15', slug: 'poema-teste-10x15' };
    const container = document.createElement('div');
    
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
    global.URL.revokeObjectURL = vi.fn();
    
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await generateSocialCard(poem, container, 'sepia', null, '10x15');

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('handles custom text and fallback HTML content safely', async () => {
    const poem = {
      title: '<script>alert(1)</script>Poema Seguro',
      content: '<p>Linha 1<br>Linha 2</p><p>Linha 3</p>',
      slug: 'poema-seguro'
    };
    const container = document.createElement('div');
    
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake');
    global.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await generateSocialCard(poem, container, 'light', 'Citação <img src=x onerror=alert(1)>', 'stories');

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
