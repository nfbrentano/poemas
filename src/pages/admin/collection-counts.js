/** Mapa `collection_id → quantidade de obras`, a partir das relações de `collection_poems`. */
export function countPoemsByCollection(relations) {
  const counts = {};
  const seen = new Set();
  (relations || []).forEach(rel => {
    const colId = rel && rel.collection_id;
    const poemId = rel && rel.poem_id;
    if (colId) {
      const key = poemId ? `${colId}::${poemId}` : null;
      if (!key || !seen.has(key)) {
        if (key) seen.add(key);
        counts[colId] = (counts[colId] || 0) + 1;
      }
    }
  });
  return counts;
}

/** Texto do selo. `counts` nulo significa que as relações não puderam ser lidas. */
export function formatPoemCount(counts, collectionId) {
  if (!counts) return '—';
  const n = counts[collectionId] || 0;
  return n === 1 ? '1 obra' : `${n} obras`;
}
