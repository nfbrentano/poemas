import { describe, it, expect } from 'vitest';
import { formatPoemForAnimation, normalizePoemContent } from './text-format.js';

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

  it('CT01: limpa blocos Gutenberg (wp:verse, wp:paragraph, wp:group) e ignora parágrafos vazios (CA01)', () => {
    const wpPoem = `<!-- wp:verse {"textAlign":"center"} -->
<pre class="wp-block-verse has-text-align-center">Todo sentimento, amor que vive em meu peito,
E tais palavras não saem com facilidade.

Algo que sinto,
E não é de momento.</pre>
<!-- /wp:verse -->

<!-- wp:paragraph -->
<p class="has-text-align-right">Terceira estrofe</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph -->

<!-- wp:group -->
<div class="wp-block-group"><div class="wp-block-group__inner-container"><p><a href="https://www.instagram.com/nfgbrentano/">@nfgbrentano</a></p></div></div>
<!-- /wp:group -->`;

    const formatted = formatPoemForAnimation(wpPoem);
    expect(formatted).not.toContain('&lt;!--');
    expect(formatted).not.toContain('&lt;pre');
    expect(formatted).not.toContain('&lt;p');
    expect(formatted).not.toContain('&lt;div');
    expect(formatted).not.toContain('&lt;a');
    expect(formatted).not.toMatch(/<span class="line-reveal"[^>]*><\/span>/);
    expect(formatted.match(/class="stanza stagger-reveal"/g)).toHaveLength(4);
    expect(formatted).toContain('>Todo sentimento, amor que vive em meu peito,</span>');
    expect(formatted).toContain('>Terceira estrofe</span>');
    expect(formatted).toContain('>@nfgbrentano</span>');
  });

  it('CT02: traduz <br>, <br />, <br><br>, <strong> e <em> em versos e estrofes válidas (CA02)', () => {
    const wpBrPoem = '<!-- wp:verse -->\n<pre class="wp-block-verse">Verso um<br><em>Verso dois em itálico</em><br /><br /><strong>Terceiro verso</strong></pre>\n<!-- /wp:verse -->';
    const formatted = formatPoemForAnimation(wpBrPoem);

    expect(formatted).toBe(
      '<div class="stanza stagger-reveal">' +
        '<span class="line-reveal" style="transition-delay: 0.05s">Verso um</span>' +
        '<span class="line-reveal" style="transition-delay: 0.1s"><em>Verso dois em itálico</em></span>' +
      '</div>' +
      '<div class="stanza stagger-reveal">' +
        '<span class="line-reveal" style="transition-delay: 0.15s"><strong>Terceiro verso</strong></span>' +
      '</div>'
    );
  });

  it('CT03: balanceia <strong> contendo <br> sem criar linhas vazias nem quebrar estrofes (CA03)', () => {
    const poemTrailingBr = '<p><strong>ao nosso passo.<br></strong><br>Verso 2</p>';
    const formatted1 = formatPoemForAnimation(poemTrailingBr);
    expect(formatted1).toBe(
      '<div class="stanza stagger-reveal">' +
        '<span class="line-reveal" style="transition-delay: 0.05s"><strong>ao nosso passo.</strong></span>' +
      '</div>' +
      '<div class="stanza stagger-reveal">' +
        '<span class="line-reveal" style="transition-delay: 0.1s">Verso 2</span>' +
      '</div>'
    );

    const poemMultiLineStrong = '<p><strong>Carinho dou,<br>Honesto sou.</strong></p>';
    const formatted2 = formatPoemForAnimation(poemMultiLineStrong);
    expect(formatted2).toBe(
      '<div class="stanza stagger-reveal">' +
        '<span class="line-reveal" style="transition-delay: 0.05s"><strong>Carinho dou,</strong></span>' +
        '<span class="line-reveal" style="transition-delay: 0.1s"><strong>Honesto sou.</strong></span>' +
      '</div>'
    );

    expect(normalizePoemContent('<span style="font-weight: 400">Texto limpo</span>')).toBe('Texto limpo');
    expect(normalizePoemContent('Somos uma<strong> família linda</strong>, e <strong>mas o tempo passa </strong>no mesmo compasso.')).toBe(
      'Somos uma <strong>família linda</strong>, e <strong>mas o tempo passa</strong> no mesmo compasso.'
    );
  });

  it('CT04: mantém payloads XSS escapados e remove atributos de <strong>/<em> (CA04)', () => {
    const malicious = '<script>alert("xss")</script>\n<img src=x onerror=alert(1)>\n<strong onclick="alert(1)">Verso</strong>';
    const formatted = formatPoemForAnimation(malicious);

    expect(formatted).not.toContain('<script>');
    expect(formatted).not.toContain('<img');
    expect(formatted).not.toContain('onclick');
    expect(formatted).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    expect(formatted).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(formatted).toContain('<strong>Verso</strong>');
  });
});
