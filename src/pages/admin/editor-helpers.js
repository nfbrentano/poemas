import { stripHtml } from '../../utils/html.js';
import { listDocs, insertDocs, deleteDocById } from './data.js';

/**
 * Calcula métricas de poesia em tempo real: estrofes, versos, palavras e tempo de leitura (RF05, CA06).
 *
 * @param {string} content
 * @returns {{ stanzas: number, verses: number, words: number, readingMinutes: number, readingLabel: string, summary: string }}
 */
export function calculatePoemMetrics(content = '') {
  const text = String(content || '');
  if (!text.trim()) {
    return {
      stanzas: 0,
      verses: 0,
      words: 0,
      readingMinutes: 0,
      readingLabel: '0 min de leitura',
      summary: '0 estrofes · 0 versos'
    };
  }

  // Estrofes: blocos de texto separados por uma ou mais linhas em branco
  const stanzas = text.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  const stanzasCount = stanzas.length;

  // Versos: linhas com conteúdo não vazio
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const versesCount = lines.length;

  // Contagem de palavras e estimativa de leitura (200 palavras/minuto)
  const plainText = stripHtml(text).replace(/\s+/g, ' ').trim();
  const words = plainText.length > 0 ? plainText.split(' ').filter(w => w.length > 0).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));
  const readingLabel = readingMinutes <= 1 ? '1 min de leitura' : `${readingMinutes} min de leitura`;

  const stanzaLabel = stanzasCount === 1 ? '1 estrofe' : `${stanzasCount} estrofes`;
  const verseLabel = versesCount === 1 ? '1 verso' : `${versesCount} versos`;
  const summary = `${stanzaLabel} · ${verseLabel}`;

  return {
    stanzas: stanzasCount,
    verses: versesCount,
    words,
    readingMinutes,
    readingLabel,
    summary
  };
}

/**
 * Retorna a chave de armazenamento local para rascunho de um poema (RF01).
 *
 * @param {string|null|undefined} poemId
 * @returns {string}
 */
export function getDraftStorageKey(poemId) {
  return `admin_draft_${poemId || 'new'}`;
}

/**
 * Salva rascunho localmente no localStorage com proteção contra erros de cota (RF01, RNF02, CA01).
 *
 * @param {string|null|undefined} poemId
 * @param {object} draftData
 * @returns {boolean}
 */
export function saveDraft(poemId, draftData = {}) {
  try {
    const key = getDraftStorageKey(poemId);
    const payload = {
      ...draftData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[Autosave] Não foi possível salvar rascunho no localStorage:', err);
    return false;
  }
}

/**
 * Carrega rascunho salvo do localStorage com tratamento de exceções (RF02, CA02).
 *
 * @param {string|null|undefined} poemId
 * @returns {object|null}
 */
export function loadDraft(poemId) {
  try {
    const key = getDraftStorageKey(poemId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Autosave] Não foi possível carregar rascunho do localStorage:', err);
    return null;
  }
}

/**
 * Remove rascunho do localStorage (RF03, CA03, CA04).
 *
 * @param {string|null|undefined} poemId
 * @returns {boolean}
 */
export function clearDraft(poemId) {
  try {
    const key = getDraftStorageKey(poemId);
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn('[Autosave] Não foi possível remover rascunho do localStorage:', err);
    return false;
  }
}

/**
 * Determina se o rascunho local possui diferenças significativas em relação aos dados carregados (RF02).
 *
 * @param {object} initialData
 * @param {object} draftData
 * @returns {boolean}
 */
export function hasDraftDifference(initialData = {}, draftData = {}) {
  if (!draftData || typeof draftData !== 'object') return false;

  // Para novos poemas, se houver título ou conteúdo preenchido no rascunho
  if (!initialData || !initialData.id) {
    return Boolean((draftData.title && draftData.title.trim()) || (draftData.content && draftData.content.trim()));
  }

  // Para poemas existentes, compara campos cruciais
  const norm = val => String(val || '').trim();
  if (norm(initialData.title) !== norm(draftData.title)) return true;
  if (norm(initialData.slug) !== norm(draftData.slug)) return true;
  if (norm(initialData.content) !== norm(draftData.content)) return true;
  if (norm(initialData.excerpt) !== norm(draftData.excerpt)) return true;
  if (norm(initialData.dedication) !== norm(draftData.dedication)) return true;
  if (norm(initialData.author_note) !== norm(draftData.author_note)) return true;
  if (norm(initialData.written_at) !== norm(draftData.written_at)) return true;
  if (norm(initialData.written_location) !== norm(draftData.written_location)) return true;
  if (norm(initialData.status) !== norm(draftData.status)) return true;

  const initialTags = Array.isArray(initialData.tags) ? initialData.tags.join(',') : '';
  const draftTags = Array.isArray(draftData.tags) ? draftData.tags.join(',') : (draftData.tags || '');
  if (initialTags !== draftTags) return true;

  return false;
}

/**
 * Valida se um slug já está em uso por outro poema cadastrado (RF06, RNF03, CA07).
 *
 * @param {string} slug
 * @param {string|null|undefined} currentPoemId
 * @param {Function} [listDocsFn]
 * @returns {Promise<{ hasConflict: boolean, conflictingPoem: object|null }>}
 */
export async function checkSlugConflict(slug, currentPoemId = null, listDocsFn = listDocs) {
  if (!slug || !slug.trim()) {
    return { hasConflict: false, conflictingPoem: null };
  }

  const cleanSlug = slug.trim().toLowerCase();
  const { data: poems, error } = await listDocsFn('poems', {
    where: [['slug', '==', cleanSlug]]
  });

  if (error || !Array.isArray(poems) || poems.length === 0) {
    return { hasConflict: false, conflictingPoem: null };
  }

  const conflicts = poems.filter(p => p.id !== currentPoemId);
  if (conflicts.length > 0) {
    return { hasConflict: true, conflictingPoem: conflicts[0] };
  }

  return { hasConflict: false, conflictingPoem: null };
}

/**
 * Sincroniza relações de coleções de um poema em `collection_poems` (RF04, CA05).
 * Adiciona às novas coleções mantendo ordem automática ao final e remove das desmarcadas,
 * sem duplicar relações pré-existentes.
 *
 * @param {string} poemId
 * @param {string[]} selectedCollectionIds
 * @param {object} [deps]
 * @returns {Promise<{ error: any, added: number, removed: number }>}
 */
export async function syncPoemCollections(poemId, selectedCollectionIds = [], deps = {}) {
  const listDocsFn = deps.listDocs || listDocs;
  const insertDocsFn = deps.insertDocs || insertDocs;
  const deleteDocByIdFn = deps.deleteDocById || deleteDocById;

  if (!poemId) return { error: null, added: 0, removed: 0 };

  try {
    const { data: existingRelations, error: relError } = await listDocsFn('collection_poems', {
      where: [['poem_id', '==', poemId]]
    });
    if (relError) throw relError;

    const relations = existingRelations || [];
    const existingColIds = new Set(relations.map(r => r.collection_id));
    const targetColIds = new Set(selectedCollectionIds || []);

    let added = 0;
    let removed = 0;

    // Remove relações desmarcadas
    for (const rel of relations) {
      if (!targetColIds.has(rel.collection_id)) {
        await deleteDocByIdFn('collection_poems', rel.id);
        removed++;
      }
    }

    // Adiciona novas relações para coleções recém-marcadas
    for (const colId of (selectedCollectionIds || [])) {
      if (!existingColIds.has(colId)) {
        const { data: colRelations } = await listDocsFn('collection_poems', {
          where: [['collection_id', '==', colId]]
        });
        const currentOrders = (colRelations || [])
          .map(r => (typeof r.order === 'number' ? r.order : 0));
        const maxOrder = currentOrders.length > 0 ? Math.max(...currentOrders) : 0;
        const nextOrder = maxOrder + 1;

        await insertDocsFn('collection_poems', {
          collection_id: colId,
          poem_id: poemId,
          order: nextOrder
        });
        added++;
      }
    }

    return { error: null, added, removed };
  } catch (error) {
    return { error, added: 0, removed: 0 };
  }
}
