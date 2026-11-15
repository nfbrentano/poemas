import { escapeHtml } from './html.js';

/**
 * Normaliza o conteúdo bruto de um poema (incluindo poemas importados do WordPress/Gutenberg):
 * - Remove comentários HTML/Gutenberg (`<!-- wp:... -->`, `<!-- /wp:... -->`)
 * - Converte `<br>` / `<br />` em `\n` e blocos `<pre>`, `<p>`, `<div>` em separadores de estrofe (`\n\n`)
 * - Desempacota `<span>` e `<a>` preservando apenas seu texto interno
 * - Normaliza e balanceia tags `<strong>` e `<em>` por verso (sem atributos)
 *
 * @param {string} content
 * @returns {string}
 */
export function normalizePoemContent(content) {
  if (!content || typeof content !== 'string') return '';

  let text = content.replace(/\r\n?/g, '\n');

  // 1. Remove comentários HTML/Gutenberg iterativamente até estabilizar
  let prev;
  do {
    prev = text;
    text = text.replace(/<!--[\s\S]*?-->/g, '');
  } while (text !== prev);

  // 2. Balanceia tags inline permitidas (<strong>, <em>) entre <br> e \n, descartando atributos
  do {
    prev = text;
    text = text.replace(/<(strong|em)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi, (_, rawTag, inner) => {
      const tag = rawTag.toLowerCase();
      const withNewlines = inner.replace(/<br\s*\/?>/gi, '\n');
      if (!withNewlines.includes('\n')) {
        const trimmed = withNewlines.trim();
        if (!trimmed) return withNewlines.length > 0 ? ' ' : '';
        const leading = withNewlines.match(/^\s*/)[0];
        const trailing = withNewlines.match(/\s*$/)[0];
        return `${leading}<${tag}>${trimmed}</${tag}>${trailing}`;
      }
      return withNewlines
        .split('\n')
        .map(part => {
          const trimmed = part.trim();
          return trimmed ? `<${tag}>${trimmed}</${tag}>` : '';
        })
        .join('\n');
    });
  } while (text !== prev);

  // 3. Traduz tags estruturais em quebras de verso/estrofe e desempacota containers inline neutros
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(?:pre|p|div)\b[^>]*>/gi, '\n\n')
    .replace(/<\/?(?:span|a)\b[^>]*>/gi, '');

  // 4. Limpa espaços à direita por linha e colapsa múltiplas linhas em branco em \n\n
  return text
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Restaura apenas tags `<strong>` e `<em>` balanceadas após `escapeHtml`,
 * mantendo qualquer outra tag ou payload potencialmente malicioso escapado.
 *
 * @param {string} escapedText
 * @returns {string}
 */
export function restoreAllowedInlineTags(escapedText) {
  let result = escapedText;
  let prev;
  do {
    prev = result;
    result = result.replace(
      /&lt;(strong|em)&gt;([\s\S]*?)&lt;(?:&#x2F;|\/)\1&gt;/g,
      '<$1>$2</$1>'
    );
  } while (result !== prev);
  return result;
}

/**
 * Formata o conteúdo do poema para animação de linhas (staggered reveal),
 * normalizando blocos legados do WordPress, escapando caracteres especiais para segurança HTML
 * e preservando apenas `<strong>` e `<em>` balanceados por verso (RF01, RF02, CA01–CA04).
 *
 * @param {string} content - O conteúdo do poema (texto plano ou HTML do WordPress).
 * @returns {string} - HTML formatado com divs `.stanza.stagger-reveal` e spans `.line-reveal`.
 */
export const formatPoemForAnimation = (content) => {
  const normalized = normalizePoemContent(content);
  if (!normalized) return '';

  // Divide por quebras de linha duplas (estrofes)
  const stanzas = normalized.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  let lineIndex = 0;

  return stanzas.map(stanza => {
    const lines = stanza.split('\n').map(l => l.trim()).filter(Boolean);
    const linesHtml = lines.map(line => {
      lineIndex++;
      const safeLine = restoreAllowedInlineTags(escapeHtml(line));
      return `<span class="line-reveal" style="transition-delay: ${parseFloat((lineIndex * 0.05).toFixed(2))}s">${safeLine}</span>`;
    }).join('');
    return `<div class="stanza stagger-reveal">${linesHtml}</div>`;
  }).join('');
};
