import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculatePoemMetrics,
  getDraftStorageKey,
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraftDifference,
  checkSlugConflict,
  syncPoemCollections
} from './editor-helpers.js';

// Mocks para data.js e router.js
const listDocsMock = vi.fn();
const getDocByIdMock = vi.fn();
const insertDocsMock = vi.fn();
const updateDocByIdMock = vi.fn();
const deleteDocByIdMock = vi.fn();
const callFunctionMock = vi.fn();
const navigateToMock = vi.fn();

vi.mock('./data.js', () => ({
  listDocs: (...args) => listDocsMock(...args),
  getDocById: (...args) => getDocByIdMock(...args),
  insertDocs: (...args) => insertDocsMock(...args),
  updateDocById: (...args) => updateDocByIdMock(...args),
  deleteDocById: (...args) => deleteDocByIdMock(...args),
  callFunction: (...args) => callFunctionMock(...args),
  uploadFile: vi.fn(),
  getPublicFileUrl: vi.fn()
}));

vi.mock('../../router.js', () => ({
  navigateTo: (...args) => navigateToMock(...args)
}));

import { renderEditor } from './editor.js';

describe('Admin: Autosave, métricas e coleções no editor de poemas (SDD 2026-11-13)', () => {
  let container;
  const tick = () => new Promise(resolve => setTimeout(resolve, 20));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.alert = vi.fn();
    window.confirm = vi.fn().mockReturnValue(true);
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');

    // Default mocks
    listDocsMock.mockImplementation(async (colName) => {
      if (colName === 'collections') return { data: [], error: null };
      if (colName === 'collection_poems') return { data: [], error: null };
      if (colName === 'poems') return { data: [], error: null };
      return { data: [], error: null };
    });

    getDocByIdMock.mockResolvedValue({ data: null, error: null });
    insertDocsMock.mockResolvedValue({ data: { id: 'p_new' }, error: null });
    updateDocByIdMock.mockResolvedValue({ error: null });
    deleteDocByIdMock.mockResolvedValue({ error: null });
    callFunctionMock.mockResolvedValue({ data: { count: 10 }, error: null });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('CT04 & CA06: Contagem de estrofes e versos ao vivo', () => {
    it('calcula métricas com 3 estrofes e 12 versos separados por linha em branco', () => {
      const poemText = `Verso um da primeira estrofe
Verso dois da primeira estrofe
Verso três da primeira estrofe
Verso quatro da primeira estrofe

Verso cinco da segunda estrofe
Verso seis da segunda estrofe
Verso sete da segunda estrofe
Verso oito da segunda estrofe

Verso nove da terceira estrofe
Verso dez da terceira estrofe
Verso onze da terceira estrofe
Verso doze da terceira estrofe`;

      const metrics = calculatePoemMetrics(poemText);
      expect(metrics.stanzas).toBe(3);
      expect(metrics.verses).toBe(12);
      expect(metrics.summary).toBe('3 estrofes · 12 versos');
      expect(metrics.words).toBe(60);
      expect(metrics.readingMinutes).toBe(1);
      expect(metrics.readingLabel).toBe('1 min de leitura');
    });

    it('formata singular corretamente para 1 estrofe e 1 verso', () => {
      const metrics = calculatePoemMetrics('Apenas um verso solitário');
      expect(metrics.stanzas).toBe(1);
      expect(metrics.verses).toBe(1);
      expect(metrics.summary).toBe('1 estrofe · 1 verso');
    });

    it('retorna zeros graciosamente para texto vazio ou nulo', () => {
      const metricsEmpty = calculatePoemMetrics('');
      expect(metricsEmpty.stanzas).toBe(0);
      expect(metricsEmpty.verses).toBe(0);
      expect(metricsEmpty.summary).toBe('0 estrofes · 0 versos');
      expect(metricsEmpty.words).toBe(0);

      const metricsNull = calculatePoemMetrics(null);
      expect(metricsNull.stanzas).toBe(0);
      expect(metricsNull.verses).toBe(0);
    });
  });

  describe('CT01 & CA01 & CA02 & CA03: Persistência, detecção e restauração de rascunho local', () => {
    it('salva rascunho no localStorage e compara diferenças corretamente', () => {
      const key = getDraftStorageKey('p1');
      expect(key).toBe('admin_draft_p1');

      const formData = {
        title: 'Título Editado',
        slug: 'titulo-editado',
        content: 'Novo conteúdo poético',
        tags: ['Amor']
      };

      const saved = saveDraft('p1', formData);
      expect(saved).toBe(true);

      const loaded = loadDraft('p1');
      expect(loaded.title).toBe('Título Editado');
      expect(loaded.savedAt).toBeDefined();

      const initialData = { id: 'p1', title: 'Título Antigo', slug: 'titulo-antigo', content: 'Conteúdo antigo' };
      expect(hasDraftDifference(initialData, loaded)).toBe(true);

      const identicalDraft = { ...initialData, tags: [] };
      expect(hasDraftDifference(initialData, identicalDraft)).toBe(false);

      clearDraft('p1');
      expect(loadDraft('p1')).toBeNull();
    });

    it('detecta rascunho local existente ao renderizar o editor e permite restaurar os dados (CA02)', async () => {
      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'poem-123',
          title: 'Título no Banco',
          slug: 'titulo-no-banco',
          content: 'Texto original do banco',
          status: 'draft',
          tags: ['Geral']
        },
        error: null
      });

      // Simula rascunho pré-existente no localStorage
      saveDraft('poem-123', {
        title: 'Título Não Salvo',
        slug: 'titulo-nao-salvo',
        content: 'Texto digitado antes da queda de energia',
        status: 'draft',
        tags: ['Geral', 'Amor'],
        savedAt: new Date('2026-11-13T10:00:00Z').toISOString()
      });

      await renderEditor(container, 'poem-123');
      await tick();

      const banner = container.querySelector('#draft-recovery-banner');
      expect(banner).not.toBeNull();
      expect(banner.style.display).toBe('block');

      // Campos começam com os dados do banco
      const titleInput = container.querySelector('#poem-title');
      const contentInput = container.querySelector('#poem-content-input');
      expect(titleInput.value).toBe('Título no Banco');
      expect(contentInput.value).toBe('Texto original do banco');

      // Clica em "Restaurar rascunho local"
      const restoreBtn = container.querySelector('#restore-draft-btn');
      expect(restoreBtn).not.toBeNull();
      restoreBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Campos devem ser atualizados com o rascunho
      expect(titleInput.value).toBe('Título Não Salvo');
      expect(contentInput.value).toBe('Texto digitado antes da queda de energia');
      expect(banner.style.display).toBe('none');

      // Preview deve ter sido sincronizado
      const previewTitle = container.querySelector('#preview-title');
      expect(previewTitle.textContent).toBe('Título Não Salvo');
    });

    it('permite descartar o rascunho local removendo-o do localStorage (CA03)', async () => {
      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'poem-456',
          title: 'Poema Oficial',
          slug: 'poema-oficial',
          content: 'Conteúdo oficial',
          status: 'draft'
        },
        error: null
      });

      saveDraft('poem-456', {
        title: 'Rascunho a Descartar',
        content: 'Conteúdo descartável',
        savedAt: new Date().toISOString()
      });

      await renderEditor(container, 'poem-456');
      await tick();

      const banner = container.querySelector('#draft-recovery-banner');
      expect(banner.style.display).toBe('block');

      const discardBtn = container.querySelector('#discard-draft-btn');
      discardBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(banner.style.display).toBe('none');
      expect(loadDraft('poem-456')).toBeNull();

      // Dados oficiais permanecem nos inputs
      expect(container.querySelector('#poem-title').value).toBe('Poema Oficial');
    });
  });

  describe('CT02 & CA04: Limpeza automática do rascunho local após salvar', () => {
    it('remove a chave de rascunho do localStorage após sucesso ao gravar (CA04)', async () => {
      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'poem-save-test',
          title: 'Poema Para Gravar',
          slug: 'poema-para-gravar',
          content: 'Texto em edição',
          status: 'draft'
        },
        error: null
      });

      saveDraft('poem-save-test', {
        title: 'Poema Para Gravar Modificado',
        slug: 'poema-para-gravar',
        content: 'Texto modificado com sucesso'
      });

      expect(loadDraft('poem-save-test')).not.toBeNull();

      await renderEditor(container, 'poem-save-test');
      await tick();

      const form = container.querySelector('#editor-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await tick();

      expect(updateDocByIdMock).toHaveBeenCalledWith(
        'poems',
        'poem-save-test',
        expect.objectContaining({
          title: 'Poema Para Gravar',
          slug: 'poema-para-gravar'
        })
      );

      // Rascunho local deve ter sido apagado
      expect(loadDraft('poem-save-test')).toBeNull();
      expect(navigateToMock).toHaveBeenCalledWith('/admin');
    });
  });

  describe('CT03 & CA05: Gestão e sincronização multi-coleções', () => {
    it('syncPoemCollections adiciona novas relações e remove desmarcadas sem duplicar existentes (CA05)', async () => {
      const mockListDocs = vi.fn().mockImplementation(async (colName, opts) => {
        if (colName === 'collection_poems') {
          // Se estiver consultando as relações do poema
          if (opts?.where?.[0]?.[0] === 'poem_id') {
            return {
              data: [
                { id: 'rel-1', collection_id: 'col-antologia', poem_id: 'p1', order: 2 },
                { id: 'rel-2', collection_id: 'col-antiga', poem_id: 'p1', order: 5 }
              ],
              error: null
            };
          }
          // Se estiver consultando relações da coleção para pegar max order
          if (opts?.where?.[0]?.[0] === 'collection_id' && opts?.where?.[0]?.[2] === 'col-noturna') {
            return {
              data: [
                { id: 'rel-x1', collection_id: 'col-noturna', poem_id: 'p99', order: 3 }
              ],
              error: null
            };
          }
        }
        return { data: [], error: null };
      });

      const mockInsertDocs = vi.fn().mockResolvedValue({ error: null });
      const mockDeleteDocById = vi.fn().mockResolvedValue({ error: null });

      // O usuário selecionou 'col-antologia' (já existente) e 'col-noturna' (nova).
      // Desmarcou 'col-antiga'.
      const result = await syncPoemCollections('p1', ['col-antologia', 'col-noturna'], {
        listDocs: mockListDocs,
        insertDocs: mockInsertDocs,
        deleteDocById: mockDeleteDocById
      });

      expect(result.error).toBeNull();
      expect(result.removed).toBe(1);
      expect(result.added).toBe(1);

      // Deve ter deletado apenas a relação da coleção desmarcada 'col-antiga'
      expect(mockDeleteDocById).toHaveBeenCalledTimes(1);
      expect(mockDeleteDocById).toHaveBeenCalledWith('collection_poems', 'rel-2');

      // Deve ter inserido a nova relação para 'col-noturna' com order = 4 (max 3 + 1)
      expect(mockInsertDocs).toHaveBeenCalledTimes(1);
      expect(mockInsertDocs).toHaveBeenCalledWith('collection_poems', {
        collection_id: 'col-noturna',
        poem_id: 'p1',
        order: 4
      });
    });

    it('renderEditor lista coleções como checkboxes e salva collection_slugs no poema', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Antologia de Amor', slug: 'antologia-de-amor' },
        { id: 'col-2', name: 'Poemas Noturnos', slug: 'poemas-noturnos' }
      ];

      listDocsMock.mockImplementation(async (colName, opts) => {
        if (colName === 'collections') {
          return { data: mockCollections, error: null };
        }
        if (colName === 'collection_poems') {
          if (opts?.where?.[0]?.[0] === 'poem_id') {
            return { data: [{ id: 'rel-1', collection_id: 'col-1', poem_id: 'p-multi' }], error: null };
          }
          return { data: [], error: null };
        }
        return { data: [], error: null };
      });

      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'p-multi',
          title: 'Poema das Horas',
          slug: 'poema-das-horas',
          content: 'Verso teste',
          status: 'draft',
          collection_slugs: ['antologia-de-amor']
        },
        error: null
      });

      await renderEditor(container, 'p-multi');
      await tick();

      const checkboxes = container.querySelectorAll('.poem-collection-checkbox');
      expect(checkboxes.length).toBe(2);

      // col-1 deve estar marcada inicialmente
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(false);

      // Marca também col-2
      checkboxes[1].checked = true;
      checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));

      // Submete o formulário
      const form = container.querySelector('#editor-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await tick();

      expect(updateDocByIdMock).toHaveBeenCalledWith(
        'poems',
        'p-multi',
        expect.objectContaining({
          collection_slugs: ['antologia-de-amor', 'poemas-noturnos']
        })
      );
    });
  });

  describe('CT05 & CA07: Prevenção de slug duplicado no editor', () => {
    it('checkSlugConflict detecta conflito se outro poema já possuir o mesmo slug', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [{ id: 'p_outro', title: 'Outro Poema', slug: 'o-tempo-passa' }],
        error: null
      });

      // Testando para novo poema (sem ID)
      const resNew = await checkSlugConflict('o-tempo-passa', null, mockList);
      expect(resNew.hasConflict).toBe(true);
      expect(resNew.conflictingPoem.id).toBe('p_outro');

      // Testando para o mesmo poema (com o mesmo ID 'p_outro' - não deve dar conflito)
      const resSame = await checkSlugConflict('o-tempo-passa', 'p_outro', mockList);
      expect(resSame.hasConflict).toBe(false);

      // Testando para slug inédito
      mockList.mockResolvedValueOnce({ data: [], error: null });
      const resFresh = await checkSlugConflict('slug-inedito', 'p_outro', mockList);
      expect(resFresh.hasConflict).toBe(false);
    });

    it('bloqueia submissão do formulário e exibe mensagem se o slug estiver em conflito (CA07)', async () => {
      listDocsMock.mockImplementation(async (colName, opts) => {
        if (colName === 'poems' && opts?.where?.[0]?.[1] === '==') {
          const queriedSlug = opts.where[0][2];
          if (queriedSlug === 'slug-duplicado') {
            return {
              data: [{ id: 'p_existente', title: 'Poema Existente', slug: 'slug-duplicado' }],
              error: null
            };
          }
        }
        return { data: [], error: null };
      });

      await renderEditor(container, null); // Novo poema
      await tick();

      const titleInput = container.querySelector('#poem-title');
      const slugInput = container.querySelector('#poem-slug');
      const contentInput = container.querySelector('#poem-content-input');
      const form = container.querySelector('#editor-form');

      titleInput.value = 'Poema Novo';
      slugInput.value = 'slug-duplicado';
      contentInput.value = 'Conteúdo do novo poema';

      // Dispara submissão
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await tick();

      // Deve alertar o usuário e bloquear a gravação
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('já está em uso'));
      expect(insertDocsMock).not.toHaveBeenCalled();

      // Mensagem visual no DOM
      const slugError = container.querySelector('#slug-error');
      expect(slugError.style.display).toBe('block');
      expect(slugError.textContent).toContain('Poema Existente');
    });
  });

  describe('CT08 & CA08: Normalização de poemas do WordPress e Preview formatado no editor', () => {
    it('remove blocos Gutenberg/wrappers preservando <strong> e renderiza preview formatado', async () => {
      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'poem-wp-1',
          title: 'Poema do WordPress',
          slug: 'poema-do-wordpress',
          content: '<!-- wp:verse {"textAlign":"center"} -->\n<pre class="wp-block-verse">Linha 1<br><strong>Linha 2</strong></pre>\n<!-- /wp:verse -->',
          status: 'published',
          tags: ['Amor']
        },
        error: null
      });

      await renderEditor(container, 'poem-wp-1');
      await tick();

      const contentInput = container.querySelector('#poem-content-input');
      expect(contentInput.value).toBe('Linha 1\n<strong>Linha 2</strong>');

      const previewContent = container.querySelector('#preview-content');
      expect(previewContent.querySelectorAll('.stanza.stagger-reveal').length).toBe(1);
      expect(previewContent.querySelectorAll('.line-reveal').length).toBe(2);
      expect(previewContent.querySelector('strong')?.textContent).toBe('Linha 2');
      expect(previewContent.textContent).not.toContain('wp:verse');
      expect(previewContent.textContent).not.toContain('<pre');
    });
  });

  describe('CT03 & CT04 (SDD 2026-11-24): Controle explícito de newsletter ao publicar no Editor', () => {
    it('CT03: publica rascunho sem chamar sendNewsletter ou sendPushNotification quando checkboxes estão desmarcados', async () => {
      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'poem-draft-silent',
          title: 'Poema de Arquivo',
          slug: 'poema-de-arquivo',
          content: 'Verso antigo resgatado.',
          status: 'draft',
          notify_newsletter_on_publish: false,
          notify_push_on_publish: false
        },
        error: null
      });

      await renderEditor(container, 'poem-draft-silent');
      await tick();

      const notificationsFieldset = container.querySelector('#publish-notifications-fields');
      const newsletterCheckbox = container.querySelector('#notify-newsletter-on-publish');
      const pushCheckbox = container.querySelector('#notify-push-on-publish');
      const publishBtn = container.querySelector('#publish-btn');

      expect(notificationsFieldset).not.toBeNull();
      expect(notificationsFieldset.contains(newsletterCheckbox)).toBe(true);
      expect(newsletterCheckbox.checked).toBe(false);
      expect(pushCheckbox.checked).toBe(false);

      // 1º clique entra no estado de confirmação
      publishBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await tick();
      expect(publishBtn.innerText).toContain('publicar sem notificar');

      // 2º clique confirma a publicação silenciosa
      publishBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await tick();

      expect(updateDocByIdMock).toHaveBeenCalledWith(
        'poems',
        'poem-draft-silent',
        expect.objectContaining({
          status: 'published'
        })
      );
      expect(callFunctionMock).not.toHaveBeenCalledWith('sendNewsletter', expect.anything());
      expect(callFunctionMock).not.toHaveBeenCalledWith('sendPushNotification', expect.anything());
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Nenhuma notificação foi enviada'));
    });

    it('CT04: dispara sendNewsletter quando #notify-newsletter-on-publish está marcado ao publicar', async () => {
      getDocByIdMock.mockResolvedValueOnce({
        data: {
          id: 'poem-draft-notify',
          title: 'Poema Inédito',
          slug: 'poema-inedito',
          content: 'Verso inédito para assinantes.',
          status: 'draft',
          notify_newsletter_on_publish: false,
          notify_push_on_publish: false
        },
        error: null
      });

      await renderEditor(container, 'poem-draft-notify');
      await tick();

      const newsletterCheckbox = container.querySelector('#notify-newsletter-on-publish');
      const publishBtn = container.querySelector('#publish-btn');

      newsletterCheckbox.checked = true;
      newsletterCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

      // 1º clique entra no estado de confirmação exibindo newsletter
      publishBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await tick();
      expect(publishBtn.innerText).toContain('enviar newsletter');

      // 2º clique confirma a publicação com newsletter
      publishBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await tick();

      expect(updateDocByIdMock).toHaveBeenCalledWith(
        'poems',
        'poem-draft-notify',
        expect.objectContaining({
          status: 'published',
          notify_newsletter_on_publish: false
        })
      );
      expect(callFunctionMock).toHaveBeenCalledTimes(1);
      expect(callFunctionMock).toHaveBeenCalledWith('sendNewsletter', { poemId: 'poem-draft-notify' });
    });
  });
});
