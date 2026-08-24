import { describe, it, expect } from 'vitest';
import { formatPoemForAnimation } from './text-format.js';

describe('formatPoemForAnimation', () => {
  it('should return empty string for empty input', () => {
    expect(formatPoemForAnimation('')).toBe('');
    expect(formatPoemForAnimation(null)).toBe('');
    expect(formatPoemForAnimation(undefined)).toBe('');
  });

  it('should format a single line poem', () => {
    const poem = 'Uma linha apenas';
    const expected = '<div class="stanza stagger-reveal"><span class="line-reveal" style="transition-delay: 0.05s">Uma linha apenas</span></div>';
    expect(formatPoemForAnimation(poem)).toBe(expected);
  });

  it('should format a poem with multiple lines in one stanza', () => {
    const poem = 'Linha 1\nLinha 2';
    const expected = '<div class="stanza stagger-reveal"><span class="line-reveal" style="transition-delay: 0.05s">Linha 1</span><span class="line-reveal" style="transition-delay: 0.1s">Linha 2</span></div>';
    expect(formatPoemForAnimation(poem)).toBe(expected);
  });

  it('should format a poem with multiple stanzas', () => {
    const poem = 'Estrofe 1, linha 1\nEstrofe 1, linha 2\n\nEstrofe 2, linha 1';
    const expected = '<div class="stanza stagger-reveal"><span class="line-reveal" style="transition-delay: 0.05s">Estrofe 1, linha 1</span><span class="line-reveal" style="transition-delay: 0.1s">Estrofe 1, linha 2</span></div>' +
                     '<div class="stanza stagger-reveal"><span class="line-reveal" style="transition-delay: 0.15s">Estrofe 2, linha 1</span></div>';
    expect(formatPoemForAnimation(poem)).toBe(expected);
  });
  
  it('should handle extra whitespace between stanzas', () => {
    const poem = 'Linha 1\n   \n\nLinha 2';
    const expected = '<div class="stanza stagger-reveal"><span class="line-reveal" style="transition-delay: 0.05s">Linha 1</span></div>' +
                     '<div class="stanza stagger-reveal"><span class="line-reveal" style="transition-delay: 0.1s">Linha 2</span></div>';
    expect(formatPoemForAnimation(poem)).toBe(expected);
  });
});
