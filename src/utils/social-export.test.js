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
});
