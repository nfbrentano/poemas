import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PoemComments } from './poem-comments.js';
import { toast } from './toast.js';

vi.mock('./toast.js', () => ({
  toast: {
    show: vi.fn()
  }
}));

const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('../utils/firebase.js', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  getDocs: (...args) => mockGetDocs(...args),
  addDoc: (...args) => mockAddDoc(...args)
}));

function createFixture() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="comments-section">
      <div id="comments-list" class="comments-list">
        <p class="comments-empty">Silêncio... nenhum comentário ainda.</p>
      </div>
      <button id="toggle-comment-btn" class="btn-secondary" aria-expanded="false" aria-controls="comment-form">+ Deixar uma nota</button>
      <form id="comment-form" class="comment-form" hidden>
        <p class="comment-form-title">Deixe sua nota</p>
        <div class="comment-form-group" style="display: none;" aria-hidden="true">
          <input type="text" id="comment-website" name="website" tabindex="-1" autocomplete="off">
        </div>
        <div class="comment-form-group">
          <input type="text" id="comment-author" placeholder="Seu nome" required maxlength="50">
        </div>
        <div class="comment-form-group">
          <textarea id="comment-content" placeholder="Sua percepção sobre esta obra..." required maxlength="500"></textarea>
        </div>
        <button type="submit" id="submit-comment-btn" class="btn-primary">Enviar Nota</button>
        <p id="comment-msg" class="comment-msg" aria-live="polite"></p>
      </form>
    </div>
  `;
  document.body.appendChild(container);
  return container;
}

describe('PoemComments Component', () => {
  let container;
  const poemId = 'test-poem-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDocs.mockResolvedValue([]);
    mockAddDoc.mockResolvedValue({ id: 'mock-doc-id' });
    localStorage.clear();
    document.body.innerHTML = '';
    container = createFixture();
  });

  afterEach(() => {
    PoemComments.cleanup();
  });

  it('CA01 & CT01: opens form and focuses name input on button click', () => {
    PoemComments.init(container, poemId);

    const toggleBtn = container.querySelector('#toggle-comment-btn');
    const form = container.querySelector('#comment-form');
    const authorInput = container.querySelector('#comment-author');

    expect(form.hidden).toBe(true);
    expect(toggleBtn.hidden).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');

    const focusSpy = vi.spyOn(authorInput, 'focus');

    toggleBtn.click();

    expect(form.hidden).toBe(false);
    expect(toggleBtn.hidden).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    expect(focusSpy).toHaveBeenCalled();
  });

  it('CA02 & CT02: opens form correctly at any timing (before comments load)', () => {
    PoemComments.init(container, poemId);

    const toggleBtn = container.querySelector('#toggle-comment-btn');
    const form = container.querySelector('#comment-form');

    // Click immediately before any deferred loader
    toggleBtn.click();

    expect(form.hidden).toBe(false);
    expect(toggleBtn.hidden).toBe(true);
  });

  it('CA07 & CT03: does not duplicate listeners or collapse form when navigating across poems', () => {
    // Simulate first poem render
    PoemComments.init(container, poemId);
    PoemComments.cleanup();

    // Simulate SPA navigation to a second poem
    const nextContainer = createFixture();
    PoemComments.init(nextContainer, 'second-poem-456');

    const toggleBtn = nextContainer.querySelector('#toggle-comment-btn');
    const form = nextContainer.querySelector('#comment-form');

    toggleBtn.click();

    // It should open and STAY open, not instantly close
    expect(form.hidden).toBe(false);
    expect(toggleBtn.hidden).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('CT05: rejects empty or whitespace-only author and content', async () => {
    PoemComments.init(container, poemId);

    const form = container.querySelector('#comment-form');
    const authorInput = container.querySelector('#comment-author');
    const contentInput = container.querySelector('#comment-content');

    authorInput.value = '   ';
    contentInput.value = '   ';

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(toast.show).toHaveBeenCalledWith('Preencha os campos corretamente.', 'error');
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('CT06: enforces 60s cooldown between submissions', async () => {
    PoemComments.init(container, poemId);

    localStorage.setItem('last_comment_time', Date.now().toString());

    const form = container.querySelector('#comment-form');
    const authorInput = container.querySelector('#comment-author');
    const contentInput = container.querySelector('#comment-content');

    authorInput.value = 'Maria';
    contentInput.value = 'Lindo poema.';

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(toast.show).toHaveBeenCalledWith('Por favor, aguarde 1 minuto entre os envios.', 'error');
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('CT07: honeypot triggers fake success without saving to firestore', async () => {
    PoemComments.init(container, poemId);

    const toggleBtn = container.querySelector('#toggle-comment-btn');
    const form = container.querySelector('#comment-form');
    const websiteInput = container.querySelector('#comment-website');

    websiteInput.value = 'https://spam-bot.com';

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(toast.show).toHaveBeenCalledWith('Sua nota foi enviada e aguarda moderação.', 'success');
    expect(mockAddDoc).not.toHaveBeenCalled();
    expect(form.hidden).toBe(true);
    expect(toggleBtn.hidden).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('CA03 & CA04 & CT04: valid submission creates document with approved: false and restores toggle button', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'new-doc-id' });

    PoemComments.init(container, poemId);

    const toggleBtn = container.querySelector('#toggle-comment-btn');
    const form = container.querySelector('#comment-form');
    const authorInput = container.querySelector('#comment-author');
    const contentInput = container.querySelector('#comment-content');

    // Open form
    toggleBtn.click();
    expect(form.hidden).toBe(false);

    authorInput.value = 'Carlos Drummond';
    contentInput.value = 'No meio do caminho tinha uma pedra.';

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await vi.waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          poem_id: poemId,
          author_name: 'Carlos Drummond',
          content: 'No meio do caminho tinha uma pedra.',
          approved: false,
          created_at: expect.any(String)
        })
      );
    });

    expect(toast.show).toHaveBeenCalledWith('Sua nota foi enviada e aguarda moderação.', 'success');
    expect(form.hidden).toBe(true);
    expect(toggleBtn.hidden).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(localStorage.getItem('last_comment_time')).toBeTruthy();
  });

  it('CA05 & CT08: loadComments renders approved comments list', async () => {
    const fakeComments = [
      {
        data: () => ({
          author_name: 'Clarice',
          content: 'Maravilhoso.',
          created_at: '2026-09-24T12:00:00.000Z'
        })
      }
    ];

    mockGetDocs.mockResolvedValueOnce(fakeComments);

    await PoemComments.loadComments(poemId, container);

    const listEl = container.querySelector('#comments-list');
    expect(listEl.innerHTML).toContain('Clarice');
    expect(listEl.innerHTML).toContain('Maravilhoso.');
  });

  it('CA06 & CT09: displays distinct error message and logs to console when comment load fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetDocs.mockRejectedValueOnce(new Error('Index missing or permission denied'));

    await PoemComments.loadComments(poemId, container);

    const listEl = container.querySelector('#comments-list');
    expect(listEl.innerHTML).toContain('Não foi possível carregar as notas agora.');
    expect(listEl.innerHTML).not.toContain('Silêncio... nenhum comentário ainda.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading comments:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
