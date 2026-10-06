/** Mapa `collection_id → quantidade de obras`, a partir das relações de `collection_poems`. */
export function countPoemsByCollection(relations) {
  const counts = {};
  (relations || []).forEach(rel => {
    const id = rel && rel.collection_id;
    if (id) counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}

/** Texto do selo. `counts` nulo significa que as relações não puderam ser lidas. */
export function formatPoemCount(counts, collectionId) {
  if (!counts) return '—';
  const n = counts[collectionId] || 0;
  return n === 1 ? '1 obra' : `${n} obras`;
}
