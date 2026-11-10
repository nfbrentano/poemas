/**
 * Utilitários para ordenação de poemas dentro de coleções.
 * Usado pelo painel administrativo (arrastar-e-soltar / botões), pela SPA e pelo prerender.
 */

/**
 * Move um item de `fromIndex` para `toIndex` em um array, retornando um novo array.
 * @template T
 * @param {T[]} array
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {T[]}
 */
export function moveItem(array, fromIndex, toIndex) {
  if (!Array.isArray(array)) return [];
  const len = array.length;
  if (fromIndex < 0 || fromIndex >= len || toIndex < 0 || toIndex >= len) {
    return [...array];
  }
  if (fromIndex === toIndex) return [...array];

  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Move um item para cima (posição anterior), se não for o primeiro.
 * @template T
 * @param {T[]} array
 * @param {number} index
 * @returns {T[]}
 */
export function moveItemUp(array, index) {
  if (!Array.isArray(array) || index <= 0) return Array.isArray(array) ? [...array] : [];
  return moveItem(array, index, index - 1);
}

/**
 * Move um item para baixo (próxima posição), se não for o último.
 * @template T
 * @param {T[]} array
 * @param {number} index
 * @returns {T[]}
 */
export function moveItemDown(array, index) {
  if (!Array.isArray(array) || index >= array.length - 1) return Array.isArray(array) ? [...array] : [];
  return moveItem(array, index, index + 1);
}

/**
 * Adiciona um poema ao final da lista ordenada caso ele ainda não esteja presente.
 * @param {Array<{ id: string }>} orderedPoems
 * @param {{ id: string }} newPoem
 * @returns {Array<{ id: string }>}
 */
export function appendPoemToOrder(orderedPoems, newPoem) {
  if (!Array.isArray(orderedPoems)) return newPoem ? [newPoem] : [];
  if (!newPoem || !newPoem.id) return [...orderedPoems];
  if (orderedPoems.some(p => p.id === newPoem.id)) {
    return [...orderedPoems];
  }
  return [...orderedPoems, newPoem];
}

/**
 * Remove um poema da lista ordenada pelo seu ID.
 * @param {Array<{ id: string }>} orderedPoems
 * @param {string} poemId
 * @returns {Array<{ id: string }>}
 */
export function removePoemFromOrder(orderedPoems, poemId) {
  if (!Array.isArray(orderedPoems)) return [];
  return orderedPoems.filter(p => p.id !== poemId);
}

/**
 * Ordena poemas com base nas relações de `collection_poems`.
 * - Se as relações têm `order` numérico, respeita essa ordem (`a.order - b.order`).
 * - Se algum poema não possui `order` definido (ex.: adicionado depois ou ordem automática),
 *   ele é posicionado após os ordenados e organizado cronologicamente por `published_at`.
 * - Se nenhum possui `order`, preserva ordenação cronológica pura (`published_at asc`).
 *
 * @param {Array<{ id: string, published_at?: string }>} poems
 * @param {Array<{ poem_id: string, order?: number | null }>} relations
 * @returns {Array<{ id: string, published_at?: string }>}
 */
export function sortPoemsByCollectionRelations(poems, relations) {
  if (!Array.isArray(poems)) return [];
  if (!Array.isArray(relations) || relations.length === 0) {
    return sortPoemsByAutoOrder(poems);
  }

  const orderMap = new Map();
  relations.forEach(r => {
    if (r && r.poem_id) {
      orderMap.set(r.poem_id, typeof r.order === 'number' ? r.order : null);
    }
  });

  const sorted = [...poems];
  sorted.sort((a, b) => {
    const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : null;
    const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : null;

    if (orderA !== null && orderB !== null && orderA !== orderB) {
      return orderA - orderB;
    }
    if (orderA !== null && orderB === null) return -1;
    if (orderA === null && orderB !== null) return 1;

    // Critério padrão: cronológico por published_at asc
    const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return timeA - timeB;
  });

  return sorted;
}

/**
 * Ordenação automática padrão de poemas: cronológica por `published_at` crescente.
 * @param {Array<{ published_at?: string }>} poems
 * @returns {Array<{ published_at?: string }>}
 */
export function sortPoemsByAutoOrder(poems) {
  if (!Array.isArray(poems)) return [];
  const sorted = [...poems];
  sorted.sort((a, b) => {
    const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return timeA - timeB;
  });
  return sorted;
}

/**
 * Monta o payload de relações `collection_poems` a partir da lista ordenada.
 * Se `isManualOrder` for true, grava `order: index + 1`.
 * Se for false (automática/restaurada), não inclui o campo `order` (ou inclui `order: null`).
 *
 * @param {string} collectionId
 * @param {Array<{ id: string }>} orderedPoems
 * @param {boolean} isManualOrder
 * @returns {Array<{ collection_id: string, poem_id: string, order?: number | null }>}
 */
export function buildCollectionPoemsPayload(collectionId, orderedPoems, isManualOrder = true) {
  if (!Array.isArray(orderedPoems)) return [];
  return orderedPoems.map((p, index) => {
    const item = {
      collection_id: collectionId,
      poem_id: p.id
    };
    if (isManualOrder) {
      item.order = index + 1;
    } else {
      item.order = null;
    }
    return item;
  });
}
