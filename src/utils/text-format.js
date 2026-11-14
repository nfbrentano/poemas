import { escapeHtml } from './html.js';

/**
 * Formata o conteúdo do poema para animação de linhas (staggered reveal),
 * escapando caracteres especiais de cada verso para segurança HTML (RF03, CA03).
 * @param {string} content - O conteúdo em texto plano do poema.
 * @returns {string} - HTML formatado com divs de estrofes e spans de linhas animadas.
 */
export const formatPoemForAnimation = (content) => {
  if (!content) return '';
  // Divide por quebras de linha duplas (estrofes)
  const stanzas = content.split(/\n\s*\n/).filter(s => s.trim());
  let lineIndex = 0;
  return stanzas.map(stanza => {
    const lines = stanza.split('\n');
    const linesHtml = lines.map(line => {
      lineIndex++;
      return `<span class="line-reveal" style="transition-delay: ${parseFloat((lineIndex * 0.05).toFixed(2))}s">${escapeHtml(line)}</span>`;
    }).join('');
    return `<div class="stanza stagger-reveal">${linesHtml}</div>`;
  }).join('');
};
