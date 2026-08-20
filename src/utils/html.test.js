import { describe, it, expect } from 'vitest';
import { escapeHtml, stripHtml, sanitizeUrl } from './html.js';

describe('html utils', () => {
  describe('escapeHtml', () => {
    it('escapes special characters correctly', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHtml("Poema d'Amor & Saudade")).toBe('Poema d&#39;Amor &amp; Saudade');
    });

    it('handles non-string values', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
    });
  });

  describe('stripHtml', () => {
    it('strips basic html tags and preserves line breaks', () => {
      const input = '<p>Linha 1<br>Linha 2</p><p>Linha 3</p>';
      const expected = 'Linha 1\nLinha 2\n\nLinha 3';
      expect(stripHtml(input)).toBe(expected);
    });

    it('strips nested and potentially unsafe tags completely', () => {
      const input = '<p>Texto <iframe src="evil.com"></iframe>com <strong><em>estilo</em></strong></p>';
      expect(stripHtml(input)).toBe('Texto com estilo');
    });

    it('strips script tags and comments', () => {
      const input = '<div><!-- comentário --><script>alert("hack")</script>Poema seguro</div>';
      expect(stripHtml(input)).toBe('Poema seguro');
    });

    it('handles empty or non-string inputs', () => {
      expect(stripHtml('')).toBe('');
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows valid http and https URLs', () => {
      expect(sanitizeUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(sanitizeUrl('http://example.com/image.png')).toBe('http://example.com/image.png');
    });

    it('allows valid relative URLs', () => {
      expect(sanitizeUrl('/images/capa.jpg')).toBe('/images/capa.jpg');
    });

    it('allows valid base64 image data URIs', () => {
      const validDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(sanitizeUrl(validDataUri)).toBe(validDataUri);
    });

    it('blocks dangerous protocols like javascript: and vbscript:', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('blocks protocol-relative URLs and text/html data URIs', () => {
      expect(sanitizeUrl('//evil.com/payload.js')).toBe('');
      expect(sanitizeUrl('/\\evil.com')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('handles non-string and empty inputs', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl('   ')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
      expect(sanitizeUrl(123)).toBe('');
    });
  });
});

