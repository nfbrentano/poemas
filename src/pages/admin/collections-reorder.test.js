import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks para data.js
const listDocsMock = vi.fn();
const replaceCollectionPoemsMock = vi.fn();
const updateDocByIdMock = vi.fn();
const insertDocsMock = vi.fn();
const deleteDocByIdMock = vi.fn();

vi.mock('./data.js', () => ({
  listDocs: (...args) => listDocsMock(...args),
  replaceCollectionPoems: (...args) => replaceCollectionPoemsMock(...args),
  updateDocById: (...args) => updateDocByIdMock(...args),
  insertDocs: (...args) => insertDocsMock(...args),
  deleteDocById: (...args) => deleteDocByIdMock(...args),
  deleteDocsWhere: vi.fn(),
  uploadFile: vi.fn(),
  getPublicFileUrl: vi.fn(),
}));

describe('Admin: reordenar poemas de uma coleção (SDD 2026-11-10)', () => {
  let container;
  let renderCollections;
  const tick = () => new Promise(resolve => setTimeout(resolve, 20));

  const samplePoems = [
    { id: 'p1', title: 'Primeiro Poema', status: 'published', published_at: '2023-01-01' },
    { id: 'p2', title: 'Segundo Poema', status: 'published', published_at: '2023-02-01' },
    { id: 'p3', title: 'Terceiro Poema', status: 'published', published_at: '2023-03-01' },
    { id: 'p4', title: 'Quarto Poema', status: 'draft', published_at: null },
  ];

  const sampleCollection = {
    id: 'col1',
    name: 'Coleção Noturna',
    slug: 'colecao-noturna',
    description: 'Poemas da noite',
    image_url: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');

    // Configura respostas padrão
    listDocsMock.mockImplementation((colName, opts) => {
      if (colName === 'collections') {
        if (opts?.single) return Promise.resolve({ data: sampleCollection, error: null });
        return Promise.resolve({ data: [sampleCollection], error: null });
      }
      if (colName === 'poems') {
        return Promise.resolve({ data: samplePoems, error: null });
      }
      if (colName === 'collection_poems') {
        return Promise.resolve({
          data: [
            { id: 'cp1', collection_id: 'col1', poem_id: 'p1', order: 1 },
            { id: 'cp2', collection_id: 'col1', poem_id: 'p2', order: 2 },
          ],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    });

    replaceCollectionPoemsMock.mockResolvedValue({ error: null });

    const mod = await import('./collections.js');
    renderCollections = mod.renderCollections;
  });

  it('CA01 & CA02: Renderiza lista de poemas ordenáveis e permite subir uma posição', async () => {
    await renderCollections(container);

    // Clica em Editar para abrir o formulário
    const editBtn = container.querySelector('.edit-col-btn[data-id="col1"]');
    expect(editBtn).not.toBeNull();
    editBtn.click();
    await tick();

    // Aguarda o formulário carregar
    const orderItems = container.querySelectorAll('.poem-order-item');
    expect(orderItems.length).toBe(2);
    expect(orderItems[0].textContent).toContain('Primeiro Poema');
    expect(orderItems[1].textContent).toContain('Segundo Poema');

    // Clica para mover p1 para baixo (p2 sobe)
    const moveDownBtn = container.querySelector('.btn-move-down[data-index="0"]');
    expect(moveDownBtn).not.toBeNull();
    moveDownBtn.click();

    // Ordem na tela deve ter invertido
    const updatedItems = container.querySelectorAll('.poem-order-item');
    expect(updatedItems[0].textContent).toContain('Segundo Poema');
    expect(updatedItems[1].textContent).toContain('Primeiro Poema');
  });

  it('CA03: Salvar ordem grava atomicamente e exibe confirmação', async () => {
    await renderCollections(container);
    const editBtn = container.querySelector('.edit-col-btn[data-id="col1"]');
    editBtn.click();
    await tick();

    // Inverte a ordem
    const moveDownBtn = container.querySelector('.btn-move-down[data-index="0"]');
    moveDownBtn.click();

    const saveOrderBtn = container.querySelector('#save-order-btn');
    expect(saveOrderBtn).not.toBeNull();

    await saveOrderBtn.click();

    expect(replaceCollectionPoemsMock).toHaveBeenCalledWith('col1', [
      { collection_id: 'col1', poem_id: 'p2', order: 1 },
      { collection_id: 'col1', poem_id: 'p1', order: 2 },
    ]);

    const feedback = container.querySelector('#order-feedback');
    expect(feedback.textContent).toContain('Ordem salva com sucesso');
  });

  it('CA04: Falha na gravação exibe mensagem de erro e preserva a ordem na tela', async () => {
    replaceCollectionPoemsMock.mockResolvedValueOnce({ error: new Error('Permissão negada') });

    await renderCollections(container);
    const editBtn = container.querySelector('.edit-col-btn[data-id="col1"]');
    editBtn.click();
    await tick();

    // Inverte a ordem
    const moveDownBtn = container.querySelector('.btn-move-down[data-index="0"]');
    moveDownBtn.click();

    const saveOrderBtn = container.querySelector('#save-order-btn');
    await saveOrderBtn.click();

    const feedback = container.querySelector('#order-feedback');
    expect(feedback.textContent).toContain('Erro ao salvar ordem: Permissão negada');

    // Ordem continua preservada na tela
    const updatedItems = container.querySelectorAll('.poem-order-item');
    expect(updatedItems[0].textContent).toContain('Segundo Poema');
    expect(updatedItems[0].textContent).not.toContain('Primeiro Poema');
    expect(updatedItems[1].textContent).toContain('Primeiro Poema');
  });

  it('CA07: Adicionar novo poema via checklist insere no final da lista', async () => {
    await renderCollections(container);
    const editBtn = container.querySelector('.edit-col-btn[data-id="col1"]');
    editBtn.click();
    await tick();

    expect(container.querySelectorAll('.poem-order-item').length).toBe(2);

    // Marca p3 no checklist
    const p3Checkbox = container.querySelector('input[name="associated-poems"][value="p3"]');
    expect(p3Checkbox).not.toBeNull();
    p3Checkbox.checked = true;
    p3Checkbox.dispatchEvent(new Event('change'));

    const items = container.querySelectorAll('.poem-order-item');
    expect(items.length).toBe(3);
    expect(items[2].textContent).toContain('Terceiro Poema');
  });

  it('CA08: Restaurar ordem automática confirma e volta ao padrão cronológico', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await renderCollections(container);
    const editBtn = container.querySelector('.edit-col-btn[data-id="col1"]');
    editBtn.click();
    await tick();

    const restoreBtn = container.querySelector('#restore-order-btn');
    expect(restoreBtn).not.toBeNull();

    await restoreBtn.click();

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('restaurar a ordem automática'));
    expect(replaceCollectionPoemsMock).toHaveBeenCalledWith('col1', [
      { collection_id: 'col1', poem_id: 'p1', order: null },
      { collection_id: 'col1', poem_id: 'p2', order: null },
    ]);

    const feedback = container.querySelector('#order-feedback');
    expect(feedback.textContent).toContain('padrão cronológico');
  });

  it('CA09: Sair com alterações não salvas pede confirmação ao autor', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    await renderCollections(container);
    const editBtn = container.querySelector('.edit-col-btn[data-id="col1"]');
    editBtn.click();
    await tick();

    // Altera a ordem (torna dirty)
    const moveDownBtn = container.querySelector('.btn-move-down[data-index="0"]');
    moveDownBtn.click();

    // Tenta cancelar
    const cancelBtn = container.querySelector('#cancel-form-btn');
    cancelBtn.click();

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('alterações não salvas'));
    // Como confirmou falso, formulário ainda continua visível
    expect(container.querySelector('#col-form')).not.toBeNull();
  });
});
