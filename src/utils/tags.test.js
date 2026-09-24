import { describe, it, expect } from 'vitest';
import { normalizeTag, formatTag, slugifyTag, tagToSlug } from './tags.js';

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

  describe('slugifyTag (CT01)', () => {
    it('CT01: converts Amor-Próprio with spaces to amor-proprio', () => {
      expect(slugifyTag('Amor-Próprio ')).toBe('amor-proprio');
    });

    it('removes sentiment prefixes and normalizes accents and special chars', () => {
      expect(slugifyTag('sentimento:saudade')).toBe('saudade');
      expect(slugifyTag('tag de sentimento: Solidão')).toBe('solidao');
      expect(slugifyTag('  sentimento: paz & amor  ')).toBe('paz-amor');
    });

    it('returns empty string for invalid inputs', () => {
      expect(slugifyTag(null)).toBe('');
      expect(slugifyTag('')).toBe('');
      expect(slugifyTag(undefined)).toBe('');
    });

    it('aliases tagToSlug correctly', () => {
      expect(tagToSlug('Amor-Próprio ')).toBe('amor-proprio');
    });
  });
});

