import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import poemPage from './pages/poem.js';
import favoritesPage from './pages/favorites.js';
import * as poemsStore from './utils/poems-store.js';
import {
  getReadingHistory,
  recordReading,
  removeReadingItem,
  clearReadingHistory,
  READING_HISTORY_KEY,
  MAX_HISTORY_ITEMS
} from './utils/reading-history.js';
import { renderPoemMarkup } from './utils/poem-template.js';

vi.mock('./utils/analytics.js', () => ({
  trackPageView: vi.fn()
}));

describe('Cartão por Estrofe e Histórico de Leitura (SDD 2026-11-13)', () => {
  let container;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    poemPage.cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    const dataScript = document.getElementById('__DATA__');
    if (dataScript) dataScript.remove();
  });

  it('CT01 & CA01: Extração segura de trecho no #poem-body e tooltip com "Gerar Imagem"', async () => {
    const mockPoem = {
      id: 'poem-test-1',
      slug: 'poema-selecao',
      title: 'Poema da Seleção',
      content: '<p>Primeira estrofe com versos líricos profundos.</p><p>Segunda estrofe marcante.</p>',
      status: 'published',
      published_at: '2026-01-01T00:00:00.000Z'
    };

    container.setAttribute('data-prerendered', '/poema/poema-selecao');
    const dataScript = document.createElement('script');
    dataScript.id = '__DATA__';
    dataScript.type = 'application/json';
    dataScript.textContent = JSON.stringify({ poem: mockPoem });
    document.body.appendChild(dataScript);

    container.innerHTML = renderPoemMarkup({ poem: mockPoem, baseUrl: '/' });
    await poemPage.render(container, { slug: 'poema-selecao' });

    const poemBody = container.querySelector('#poem-body');
    const tooltip = container.querySelector('#highlight-tooltip');
    const cardBtn = container.querySelector('#highlight-card-btn');

    expect(poemBody).not.toBeNull();
    expect(tooltip).not.toBeNull();
    expect(cardBtn).not.toBeNull();
    expect(cardBtn.textContent.trim()).toBe('Gerar Imagem');

    // 1. Simular seleção válida dentro de #poem-body (>= 8 caracteres)
    const lineSpan = poemBody.querySelector('.line-reveal');
    expect(lineSpan).not.toBeNull();
    const textNode = lineSpan.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, Math.min(25, textNode.textContent.length));

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Dispara mouseup no #poem-body
    poemBody.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(tooltip.classList.contains('visible')).toBe(true);

    // 2. Simular seleção FORA de #poem-body (no header)
    const headerTitle = container.querySelector('header h1').firstChild;
    const rangeHeader = document.createRange();
    rangeHeader.setStart(headerTitle, 0);
    rangeHeader.setEnd(headerTitle, 5);

    selection.removeAllRanges();
    selection.addRange(rangeHeader);

    document.dispatchEvent(new Event('selectionchange'));
    expect(tooltip.classList.contains('visible')).toBe(false);

    // 3. Simular seleção curta (< 8 caracteres) dentro de #poem-body
    const rangeShort = document.createRange();
    rangeShort.setStart(textNode, 0);
    rangeShort.setEnd(textNode, 4);

    selection.removeAllRanges();
    selection.addRange(rangeShort);

    poemBody.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(tooltip.classList.contains('visible')).toBe(false);
  });

  it('CT02 & CA02 & CA03: Modal de preview do card com trecho vs poema completo e alternância de modo', async () => {
    const mockPoem = {
      id: 'poem-test-2',
      slug: 'poema-card-versos',
      title: 'Versos da Noite',
      content: 'Primeiro verso de teste.\nSegundo verso de teste.\nTerceiro verso de teste.',
      status: 'published',
      published_at: '2026-01-01T00:00:00.000Z'
    };

    container.setAttribute('data-prerendered', '/poema/poema-card-versos');
    const dataScript = document.createElement('script');
    dataScript.id = '__DATA__';
    dataScript.type = 'application/json';
    dataScript.textContent = JSON.stringify({ poem: mockPoem });
    document.body.appendChild(dataScript);

    container.innerHTML = renderPoemMarkup({ poem: mockPoem, baseUrl: '/' });
    await poemPage.render(container, { slug: 'poema-card-versos' });

    const poemBody = container.querySelector('#poem-body');
    const previewModal = container.querySelector('#card-preview-modal');
    const quoteBtn = container.querySelector('#card-mode-quote-btn');
    const fullBtn = container.querySelector('#card-mode-full-btn');
    const previewTitle = container.querySelector('#card-preview-title');
    const previewBody = container.querySelector('#card-preview-body');
    const highlightCardBtn = container.querySelector('#highlight-card-btn');
    const closeBtn = container.querySelector('#close-preview-btn');
    const shareDesktopBtn = container.querySelector('#share-card-btn-desktop');

    // 1. Seleciona trecho no poema
    const stanza = poemBody.querySelector('.stanza');
    expect(stanza).not.toBeNull();
    const range = document.createRange();
    range.selectNodeContents(stanza);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    poemBody.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    // Clica em "Gerar Imagem" a partir da seleção
    highlightCardBtn.click();

    expect(previewModal.style.display).toBe('flex');
    expect(previewModal.classList.contains('active')).toBe(true);
    expect(quoteBtn.classList.contains('active')).toBe(true);
    expect(previewTitle.textContent).toContain('De “Versos da Noite”');
    expect(previewBody.textContent).toContain('Primeiro verso de teste.');
    expect(previewBody.style.fontStyle).toBe('italic');

    // 2. Alterna para modo "Poema completo"
    fullBtn.click();
    expect(fullBtn.classList.contains('active')).toBe(true);
    expect(quoteBtn.classList.contains('active')).toBe(false);
    expect(previewTitle.textContent).toBe('Versos da Noite');
    expect(previewBody.style.fontStyle).toBe('normal');

    // 3. Fecha o modal e abre pelo botão tradicional "Gerar Card" do desktop
    closeBtn.click();
    expect(previewModal.style.display).toBe('none');

    shareDesktopBtn.click();
    expect(previewModal.style.display).toBe('flex');
    // Deve abrir como poema completo sem resquício da citação
    expect(previewTitle.textContent).toBe('Versos da Noite');
    expect(container.querySelector('#card-mode-toggle-group').style.display).toBe('none');
  });

  it('CT03 & CA04 & CA05 & CA06: CRUD de histórico local, ordenação mais recente, limite de 8 itens e limpeza', () => {
    expect(getReadingHistory()).toEqual([]);

    // Grava 9 poemas em ordem sequencial
    for (let i = 1; i <= 9; i++) {
      recordReading({ slug: `poema-${i}`, title: `Poema ${i}` });
    }

    const history = getReadingHistory();
    // Limite máximo de 8 itens (RF03, CA05)
    expect(history.length).toBe(MAX_HISTORY_ITEMS);
    expect(history.length).toBe(8);

    // O mais recente é o poema-9 (CA04)
    expect(history[0].slug).toBe('poema-9');
    expect(history[0].title).toBe('Poema 9');

    // O mais antigo poema-1 foi descartado
    expect(history.some(item => item.slug === 'poema-1')).toBe(false);
    // O mais antigo remanescente é o poema-2
    expect(history[history.length - 1].slug).toBe('poema-2');

    // Deduplicação: ao reler poema-3, ele deve ir para o topo sem duplicar
    recordReading({ slug: 'poema-3', title: 'Poema 3 Revisitado' });
    const deduplicated = getReadingHistory();
    expect(deduplicated.length).toBe(8);
    expect(deduplicated[0].slug).toBe('poema-3');
    expect(deduplicated[0].title).toBe('Poema 3 Revisitado');

    // Remoção individual
    removeReadingItem('poema-3');
    const afterRemoval = getReadingHistory();
    expect(afterRemoval.length).toBe(7);
    expect(afterRemoval.some(i => i.slug === 'poema-3')).toBe(false);

    // Limpeza completa (CA06)
    const cleared = clearReadingHistory();
    expect(cleared).toBe(true);
    expect(getReadingHistory()).toEqual([]);
    expect(localStorage.getItem(READING_HISTORY_KEY)).toBeNull();
  });

  it('CT04 & CA04 & CA06: Exibição de "Lidos recentemente" em /favoritos/ e filtragem de despublicados', async () => {
    const published = [
      { id: '1', slug: 'poema-pub-1', title: 'Poema Publicado 1', status: 'published', excerpt: 'Resumo 1' },
      { id: '2', slug: 'poema-pub-2', title: 'Poema Publicado 2', status: 'published', excerpt: 'Resumo 2' }
    ];

    vi.spyOn(poemsStore, 'getPublishedPoems').mockResolvedValue(published);

    // Registra um poema publicado e um poema despublicado/inexistente
    recordReading({ slug: 'poema-pub-1', title: 'Poema Publicado 1' });
    recordReading({ slug: 'poema-despublicado', title: 'Rascunho Secreto' });

    await favoritesPage.render(container);

    const historySection = container.querySelector('.reading-history-section');
    expect(historySection).not.toBeNull();

    // Deve exibir o publicado e omitir o despublicado
    const links = historySection.querySelectorAll('.reading-history-item');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('data-slug')).toBe('poema-pub-1');
    expect(historySection.textContent).not.toContain('Rascunho Secreto');

    // Testar botão Limpar histórico
    const clearBtn = historySection.querySelector('#clear-reading-history-btn');
    expect(clearBtn).not.toBeNull();
    clearBtn.click();

    expect(getReadingHistory()).toEqual([]);
    expect(container.querySelector('.reading-history-section')).toBeNull();
  });

  it('CT06 & RF01 & RF03: Toolbar mobile de seleção e registro de leitura automático (timer 3s)', async () => {
    vi.useFakeTimers();

    const mockPoem = {
      id: 'poem-mobile-1',
      slug: 'poema-mobile-teste',
      title: 'Poema Mobile Teste',
      content: 'Estrofe no mobile para teste de leitura e seleção.',
      status: 'published',
      published_at: '2026-01-01T00:00:00.000Z'
    };

    container.setAttribute('data-prerendered', '/poema/poema-mobile-teste');
    const dataScript = document.createElement('script');
    dataScript.id = '__DATA__';
    dataScript.type = 'application/json';
    dataScript.textContent = JSON.stringify({ poem: mockPoem });
    document.body.appendChild(dataScript);

    container.innerHTML = renderPoemMarkup({ poem: mockPoem, baseUrl: '/' });

    // Simula User Agent mobile
    const originalUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      configurable: true
    });

    await poemPage.render(container, { slug: 'poema-mobile-teste' });

    // 1. Testa gravação de leitura após 3s
    expect(getReadingHistory().length).toBe(0);
    vi.advanceTimersByTime(3100);
    expect(getReadingHistory().length).toBe(1);
    expect(getReadingHistory()[0].slug).toBe('poema-mobile-teste');

    // 2. Testa seleção no mobile
    const poemBody = container.querySelector('#poem-body');
    const mobileToolbar = container.querySelector('#mobile-selection-toolbar');
    const mobileCardBtn = container.querySelector('#mobile-card-selection-btn');
    expect(mobileToolbar).not.toBeNull();
    expect(mobileCardBtn).not.toBeNull();

    const lineSpan = poemBody.querySelector('.line-reveal');
    const textNode = lineSpan.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 20);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    poemBody.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(mobileToolbar.classList.contains('visible')).toBe(true);

    // Clica no botão de gerar imagem do mobile
    mobileCardBtn.click();
    const previewModal = container.querySelector('#card-preview-modal');
    expect(previewModal.style.display).toBe('flex');
    expect(container.querySelector('#card-preview-title').textContent).toContain('De “Poema Mobile Teste”');

    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      configurable: true
    });
    vi.useRealTimers();
  });

  it('CT05 & CA07: Resiliência a falhas de storage (QuotaExceededError / SecurityError)', async () => {
    // 1. Simular falha de setItem ao registrar leitura
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });

    // Não deve lançar exceção
    expect(() => {
      const res = recordReading({ slug: 'poema-quota', title: 'Poema Quota' });
      expect(Array.isArray(res)).toBe(true);
    }).not.toThrow();

    expect(() => {
      removeReadingItem('poema-quota');
    }).not.toThrow();

    // 2. Simular falha em removeItem ao limpar histórico
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    expect(() => {
      const res = clearReadingHistory();
      expect(res).toBe(false);
    }).not.toThrow();

    // 3. Simular falha de getItem ao ler histórico
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    expect(() => {
      const history = getReadingHistory();
      expect(history).toEqual([]);
    }).not.toThrow();
  });
});
