import { describe, it, expect } from 'vitest';
import { normalizeTag, formatTag } from './tags.js';

describe('tags utility', () => {
  describe('normalizeTag', () => {
    it('removes common sentiment prefixes case-insensitively', () => {
      expect(normalizeTag('sentimento:amor')).toBe('amor');
      expect(normalizeTag('sentimentos:tristeza')).toBe('tristeza');
      expect(normalizeTag('tag de sentimento:melancolia')).toBe('melancolia');
      expect(normalizeTag('tags de sentimento:solitude')).toBe('solitude');
      expect(normalizeTag('SENTIMENTO: Alegria')).toBe('Alegria');
    });

    it('trims leading and trailing spaces', () => {
      expect(normalizeTag('  sentimento: paz  ')).toBe('paz');
      expect(normalizeTag('  nostalgia  ')).toBe('nostalgia');
    });

    it('returns empty string if tag is not a string', () => {
      expect(normalizeTag(null)).toBe('');
      expect(normalizeTag(undefined)).toBe('');
      expect(normalizeTag(123)).toBe('');
    });
  });

  describe('formatTag', () => {
    it('normalizes and formats tags in Sentence Case', () => {
      expect(formatTag('sentimento:amor')).toBe('Amor');
      expect(formatTag('sentimentos:TRISTEZA')).toBe('Tristeza');
      expect(formatTag('tag de sentimento: mElAnCoLiA')).toBe('Melancolia');
      expect(formatTag('nostalgia')).toBe('Nostalgia');
    });

    it('returns empty string for invalid input', () => {
      expect(formatTag(null)).toBe('');
      expect(formatTag('')).toBe('');
    });
  });
});
