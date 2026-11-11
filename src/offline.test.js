import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { offlineIndicator } from './components/offline-indicator.js';
import { toggleReaction } from './utils/reactions.js';
import { PoemComments } from './components/poem-comments.js';
import { newsletter } from './components/newsletter.js';
import { clearPersistentPoems, savePersistentPoems, invalidatePoemsCache } from './utils/poems-store.js';
import poemPage from './pages/poem.js';
import { collection as collectionPage } from './pages/collection.js';
import { collections as collectionsPage } from './pages/collections.js';

describe('Leitura offline do acervo e resiliência de rede (SDD 2026-11-10)', () => {
  let originalOnLine;

  beforeEach(async () => {
    originalOnLine = navigator.onLine;
    invalidatePoemsCache();
    await clearPersistentPoems();
    document.body.innerHTML = '<div id="app"><main id="main-content"></main></div>';
    offlineIndicator.cleanup();
  });

  afterEach(async () => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    invalidatePoemsCache();
    await clearPersistentPoems();
    offlineIndicator.cleanup();
  });

  it('CT03 & CA03: offlineIndicator exibe aviso ao perder conexão e oculta ao restabelecer', () => {
    // Configura online inicialmente
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    offlineIndicator.init();

    const indicatorEl = document.getElementById('offline-indicator');
    expect(indicatorEl).not.toBeNull();
    expect(indicatorEl.hidden).toBe(true);

    // Simula evento offline
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    window.dispatchEvent(new Event('offline'));

    expect(indicatorEl.hidden).toBe(false);
    expect(indicatorEl.classList.contains('is-active')).toBe(true);
    expect(indicatorEl.textContent).toContain('Você está navegando em modo offline');

    // Simula volta da conexão
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    window.dispatchEvent(new Event('online'));

    expect(indicatorEl.hidden).toBe(true);
    expect(indicatorEl.classList.contains('is-active')).toBe(false);
  });

  it('CT04 & CA04: toggleReaction informa offline quando sem conexão', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const result = await toggleReaction('poem-1', '🕯️');
    expect(result).toBe('offline');
  });

  it('CT04 & CA04: formulário de comentários informa indisponibilidade amigável quando offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const container = document.createElement('div');
    container.innerHTML = `
      <form id="comment-form">
        <input id="comment-author" value="Leitor Offline" />
        <textarea id="comment-content">Belo verso</textarea>
        <span id="comment-msg"></span>
        <button id="submit-comment-btn" type="submit">Enviar Nota</button>
      </form>
    `;
    document.body.appendChild(container);

    PoemComments.init(container, 'poem-123');

    const form = container.querySelector('#comment-form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const msg = container.querySelector('#comment-msg');
    expect(msg.textContent).toContain('Você está offline');
  });

  it('CT04 & CA04: formulário de newsletter informa indisponibilidade amigável quando offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const container = document.createElement('div');
    container.innerHTML = newsletter.render();
    document.body.appendChild(container);

    newsletter.init();

    const emailInput = container.querySelector('#subscriber-email');
    emailInput.value = 'leitor@exemplo.com';

    const form = container.querySelector('#subscribe-form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const msg = container.querySelector('#subscribe-message');
    expect(msg.textContent).toContain('Você está offline');
  });

  it('CT01 & CA01: poem.js renderiza poema completo a partir do acervo local offline', async () => {
    // Popula o acervo persistente
    await savePersistentPoems([
      {
        id: 'p-prev',
        title: 'Poema Anterior',
        slug: 'poema-anterior',
        content: 'Linha anterior 1\nLinha anterior 2',
        status: 'published',
        published_at: '2026-01-01T00:00:00Z'
      },
      {
        id: 'p-curr',
        title: 'Poema Nunca Visitado',
        slug: 'poema-nunca-visitado',
        content: 'Verso do poema nunca visitado\nSegunda estrofe aqui',
        excerpt: 'Resumo do verso',
        status: 'published',
        published_at: '2026-02-01T00:00:00Z',
        tags: ['amor', 'tempo']
      },
      {
        id: 'p-next',
        title: 'Poema Seguinte',
        slug: 'poema-seguinte',
        content: 'Linha seguinte',
        status: 'published',
        published_at: '2026-03-01T00:00:00Z'
      }
    ]);

    // Simula ambiente offline onde Firestore falha
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const container = document.createElement('div');
    document.body.appendChild(container);

    await poemPage.render(container, { slug: 'poema-nunca-visitado' });

    // Deve exibir o título e versos completos do poema
    expect(container.innerHTML).toContain('Poema Nunca Visitado');
    expect(container.innerHTML).toContain('Verso do poema nunca visitado');
    // Deve deduzir links de próximo e anterior
    expect(container.innerHTML).toContain('poema-anterior');
    expect(container.innerHTML).toContain('poema-seguinte');
  });

  it('CT02 & CA02: collection.js renderiza coleção e poemas vinculados quando offline', async () => {
    await savePersistentPoems([
      {
        id: 'p-col-1',
        title: 'Poema da Coleção',
        slug: 'poema-col-1',
        status: 'published',
        published_at: '2026-02-01T00:00:00Z',
        collection_slugs: ['amor-e-conexao']
      }
    ]);

    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const container = document.createElement('div');
    document.body.appendChild(container);

    await collectionPage.render(container, { slug: 'amor-e-conexao' });

    expect(container.innerHTML).toContain('Amor e Conexão');
    expect(container.innerHTML).toContain('Poema da Coleção');
  });

  it('CT02 & CA02: collections.js renderiza séries em destaque quando offline', async () => {
    await savePersistentPoems([
      {
        id: 'p-col-2',
        title: 'Poema de Amor',
        slug: 'poema-amor',
        status: 'published',
        published_at: '2026-02-01T00:00:00Z',
        collection_slugs: ['amor-e-conexao']
      }
    ]);

    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const container = document.createElement('div');
    document.body.appendChild(container);

    await collectionsPage.render(container, {});

    expect(container.innerHTML).toContain('Amor e Conexão');
    expect(container.innerHTML).toContain('Séries em Destaque');
  });
});
