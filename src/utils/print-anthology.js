import { escapeHtml, stripHtml, unwrapSafeHTML } from './html.js';

let activeAfterPrintHandler = null;

/**
 * Remove `#print-library-container` e a classe `is-printing-anthology` do `body` (CA05).
 */
export function cleanupPrintAnthology() {
  if (typeof document !== 'undefined') {
    document.body?.classList.remove('is-printing-anthology');
    const existing = document.getElementById('print-library-container');
    if (existing) {
      existing.remove();
    }
  }
  if (typeof window !== 'undefined' && activeAfterPrintHandler) {
    window.removeEventListener('afterprint', activeAfterPrintHandler);
    activeAfterPrintHandler = null;
  }
}

/**
 * Gera markup HTML sanitizado para impressão de uma antologia/coleção ou favoritos.
 * @param {object} params
 * @param {string} params.title
 * @param {string} [params.subtitle='']
 * @param {string} [params.author='Natanael Fernando Gatti Brentano']
 * @param {Array<object>} [params.poems=[]]
 * @returns {string}
 */
export function buildAnthologyPrintHtml({
  title = 'Antologia Poética',
  subtitle = '',
  author = 'Natanael Fernando Gatti Brentano',
  poems = []
} = {}) {
  const safeTitle = escapeHtml(String(title || 'Antologia Poética'));
  const safeSubtitle = escapeHtml(String(subtitle || '').trim());
  const safeAuthor = escapeHtml(String(author || 'Natanael Fernando Gatti Brentano'));
  const countText = `${poems.length} poema${poems.length !== 1 ? 's' : ''}`;

  const coverHtml = `
    <section class="print-poem print-anthology-cover">
      <h1 class="print-poem-title">${safeTitle}</h1>
      <p class="print-anthology-author">${safeAuthor}</p>
      ${safeSubtitle ? `<p class="print-anthology-desc">${safeSubtitle}</p>` : ''}
      <p class="print-anthology-count">${escapeHtml(countText)}</p>
    </section>
  `;

  const poemsHtml = poems.map((poem) => {
    const poemTitle = escapeHtml(String(poem?.title || 'Sem título'));
    const poemSlug = escapeHtml(String(poem?.slug || ''));
    const dedication = poem?.dedication ? escapeHtml(stripHtml(String(poem.dedication))) : '';
    const plainBody = stripHtml(String(poem?.content || poem?.excerpt || ''));
    const safeBody = escapeHtml(plainBody);
    return `
      <article class="print-poem" data-print-slug="${poemSlug}">
        <h2 class="print-poem-title">${poemTitle}</h2>
        ${dedication ? `<p class="print-poem-dedication"><em>${dedication}</em></p>` : ''}
        <div class="print-poem-content">${safeBody}</div>
      </article>
    `;
  }).join('');

  return `${coverHtml}${poemsHtml}`;
}

/**
 * Popula `#print-library-container`, aplica `is-printing-anthology` ao `body`,
 * dispara `window.print()` e limpa automaticamente após `afterprint` (RF04, RNF03, CA05).
 * @param {object} options
 * @returns {boolean}
 */
export function printAnthology(options = {}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const poems = Array.isArray(options.poems) ? options.poems.filter(Boolean) : [];
  if (poems.length === 0) {
    return false;
  }

  cleanupPrintAnthology();

  const container = document.createElement('div');
  container.id = 'print-library-container';
  container.className = 'print-library-container';
  container.setAttribute('aria-hidden', 'true');
  container.innerHTML = unwrapSafeHTML(buildAnthologyPrintHtml({ ...options, poems }));

  document.body.appendChild(container);
  document.body.classList.add('is-printing-anthology');

  activeAfterPrintHandler = () => {
    cleanupPrintAnthology();
  };
  window.addEventListener('afterprint', activeAfterPrintHandler, { once: true });

  if (typeof window.print === 'function') {
    window.print();
  }

  return true;
}
