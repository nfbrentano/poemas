/**
 * Gerenciador de poemas favoritos no dispositivo do leitor (localStorage).
 * Operações 100% locais, sem login e sem chamadas de rede/Firestore.
 */

const STORAGE_KEY = 'poemas_favorites';

export const MAX_IMPORT_SLUGS = 500;
export const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Valida se um slug candidato atende às regras de formato e tamanho seguro.
 * @param {unknown} slug
 * @returns {boolean}
 */
export function isValidFavoriteSlug(slug) {
  return typeof slug === 'string' && slug.length > 0 && slug.length <= 120 && VALID_SLUG_REGEX.test(slug);
}

/**
 * Retorna se o localStorage está disponível no ambiente atual.
 * @returns {boolean}
 */
function isStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__fav_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém todos os favoritos persistidos, ordenados do mais recente para o mais antigo.
 * @returns {Array<{ slug: string, id?: string, added_at: string }>}
 */
export function getFavorites() {
  try {
    if (!isStorageAvailable()) return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(item => item && typeof item === 'object' && typeof item.slug === 'string')
      .sort((a, b) => {
        const timeA = a.added_at ? new Date(a.added_at).getTime() : 0;
        const timeB = b.added_at ? new Date(b.added_at).getTime() : 0;
        return timeB - timeA;
      });
  } catch (err) {
    console.warn('[Favorites] Erro ao ler favoritos do localStorage:', err);
    return [];
  }
}

/**
 * Retorna um Set contendo todos os slugs e IDs favoritados para verificação rápida O(1).
 * @returns {Set<string>}
 */
export function getFavoriteSlugs() {
  const set = new Set();
  const favs = getFavorites();
  for (const f of favs) {
    if (f.slug) set.add(f.slug);
    if (f.id) set.add(f.id);
  }
  return set;
}

/**
 * Hidrata dinamicamente os selos de favorito (🔖) em listagens pré-renderizadas
 * sem recriar o container nem modificar os nós de áudio existentes.
 * @param {HTMLElement|null|undefined} container
 */
export function hydrateFavoriteBadges(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  const favSlugs = getFavoriteSlugs();
  const links = container.querySelectorAll('.poem-row-link');

  links.forEach((link) => {
    let slug = link.dataset?.poemSlug || '';
    if (!slug) {
      const href = link.getAttribute('href') || '';
      const match = href.match(/\/poema\/([^/?#]+)/);
      if (match) slug = match[1];
    }

    const titleEl = link.querySelector('.poem-row-title');
    if (!slug || !titleEl) return;

    const isFav = favSlugs.has(slug);
    const existingBadge = titleEl.querySelector('.favorite-badge');

    if (isFav && !existingBadge) {
      const badge = document.createElement('span');
      badge.className = 'favorite-badge';
      badge.setAttribute('aria-label', 'Poema favoritado');
      badge.setAttribute('title', 'Poema favoritado');
      badge.textContent = '🔖';

      const audioBadge = titleEl.querySelector('.audio-badge');
      const space = document.createTextNode(' ');
      if (audioBadge) {
        titleEl.insertBefore(space, audioBadge);
        titleEl.insertBefore(badge, space);
      } else {
        titleEl.append(space, badge);
      }
    } else if (!isFav && existingBadge) {
      existingBadge.remove();
    }
  });
}

/**
 * Verifica se um poema está favoritado (por slug ou por ID).
 * @param {string} slugOrId
 * @returns {boolean}
 */
export function isFavorite(slugOrId) {
  if (!slugOrId) return false;
  const slugs = getFavoriteSlugs();
  return slugs.has(slugOrId);
}

/**
 * Alterna o estado de favorito de um poema.
 * Se favoritado, remove. Se não favoritado, adiciona ao topo com timestamp atual.
 *
 * Em caso de falha de gravação (ex.: cota cheia ou modo privado bloqueado),
 * captura o erro graciosamente e retorna `{ success: false, isFavorite: previousState, error }`
 * sem deixar a UI em estado falso ativo (CA10).
 *
 * @param {object|string} poem Objeto do poema com { slug, id? } ou string de slug.
 * @returns {{ success: boolean, isFavorite: boolean, error?: any }}
 */
export function toggleFavorite(poem) {
  try {
    if (!isStorageAvailable()) {
      return { success: false, isFavorite: false, error: new Error('localStorage unavailable') };
    }

    const slug = typeof poem === 'object' ? poem.slug : poem;
    const id = typeof poem === 'object' ? poem.id : undefined;

    if (!slug || typeof slug !== 'string') {
      return { success: false, isFavorite: false, error: new Error('Slug inválido') };
    }

    const currentFavs = getFavorites();
    const existingIndex = currentFavs.findIndex(f => f.slug === slug || (id && f.id === id));
    let isNowFavorite = false;
    let nextFavs = [];

    if (existingIndex >= 0) {
      // Remove
      nextFavs = currentFavs.filter((_, idx) => idx !== existingIndex);
      isNowFavorite = false;
    } else {
      // Adiciona ao topo com data/hora ISO
      const newItem = {
        slug,
        id: id || undefined,
        added_at: new Date().toISOString()
      };
      nextFavs = [newItem, ...currentFavs];
      isNowFavorite = true;
    }

    // Tenta persistir no localStorage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavs));

    // Evento personalizado no Microsoft Clarity (RF08, CA08)
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      try {
        window.clarity('event', isNowFavorite ? 'favorite_add' : 'favorite_remove');
      } catch {}
    }

    // Dispara evento DOM para sincronizar outros componentes abertos
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('favorites-changed', {
          detail: { slug, id, isFavorite: isNowFavorite }
        }));
      } catch {}
    }

    return { success: true, isFavorite: isNowFavorite };
  } catch (err) {
    console.warn('[Favorites] Erro ao alternar favorito no localStorage:', err);
    return { success: false, isFavorite: false, error: err };
  }
}

/**
 * Remove explicitamente um poema dos favoritos por slug ou id.
 * @param {string} slugOrId
 * @returns {{ success: boolean, isFavorite: boolean, error?: any }}
 */
export function removeFavorite(slugOrId) {
  if (!slugOrId) return { success: false, isFavorite: false };
  if (!isFavorite(slugOrId)) return { success: true, isFavorite: false };
  return toggleFavorite(slugOrId);
}

/**
 * Limpa todos os favoritos (útil para testes).
 */
export function clearFavorites() {
  try {
    if (isStorageAvailable()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

function collectValidSlugs(candidates) {
  const seen = new Set();
  const slugs = [];
  let invalidCount = 0;

  for (const item of candidates) {
    if (slugs.length >= MAX_IMPORT_SLUGS) {
      invalidCount++;
      continue;
    }
    const rawSlug = typeof item === 'string'
      ? item.trim()
      : (item && typeof item === 'object' && typeof item.slug === 'string' ? item.slug.trim() : '');

    if (!rawSlug) {
      if (item !== '' && item !== null && item !== undefined) {
        invalidCount++;
      }
      continue;
    }

    if (!isValidFavoriteSlug(rawSlug)) {
      invalidCount++;
      continue;
    }

    if (!seen.has(rawSlug)) {
      seen.add(rawSlug);
      slugs.push(rawSlug);
    }
  }

  return { slugs, invalidCount };
}

/**
 * Serializa a lista de favoritos para arquivo JSON portável.
 * @param {Array<{ slug: string, id?: string, added_at?: string }>} [favs]
 * @returns {string}
 */
export function exportFavoritesJson(favs = getFavorites()) {
  const list = Array.isArray(favs) ? favs : [];
  const validFavs = [];
  const seen = new Set();

  for (const item of list) {
    const rawSlug = typeof item === 'string' ? item : item?.slug;
    if (!isValidFavoriteSlug(rawSlug) || seen.has(rawSlug)) continue;
    seen.add(rawSlug);
    validFavs.push({
      slug: rawSlug,
      ...(item && typeof item === 'object' && item.id ? { id: item.id } : {}),
      added_at: (item && typeof item === 'object' && item.added_at) ? item.added_at : new Date().toISOString()
    });
    if (validFavs.length >= MAX_IMPORT_SLUGS) break;
  }

  return JSON.stringify({
    version: 1,
    exported_at: new Date().toISOString(),
    slugs: validFavs.map(f => f.slug),
    favorites: validFavs
  }, null, 2);
}

/**
 * Codifica favoritos em string compacta separada por vírgulas para uso em parâmetro `?import=`.
 * @param {Array<{ slug: string }|string>} [favs]
 * @returns {string}
 */
export function encodeFavoritesShareParam(favs = getFavorites()) {
  const list = Array.isArray(favs) ? favs : [];
  const { slugs } = collectValidSlugs(list);
  return slugs.join(',');
}

/**
 * Decodifica o parâmetro `?import=` (ou array/JSON) validando rigorosamente cada slug.
 * @param {string|Array|object|null|undefined} param
 * @returns {{ slugs: string[], invalidCount: number, error?: string|null }}
 */
export function decodeFavoritesShareParam(param) {
  if (!param) {
    return { slugs: [], invalidCount: 0, error: null };
  }

  if (Array.isArray(param)) {
    return { ...collectValidSlugs(param), error: null };
  }

  if (typeof param === 'object') {
    return parseFavoritesImportPayload(param);
  }

  if (typeof param !== 'string') {
    return { slugs: [], invalidCount: 1, error: 'Formato inválido' };
  }

  const trimmed = param.trim();
  if (!trimmed) {
    return { slugs: [], invalidCount: 0, error: null };
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseFavoritesImportPayload(trimmed);
  }

  const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  return { ...collectValidSlugs(parts), error: null };
}

/**
 * Analisa e valida payloads de importação de favoritos (JSON, link com `?import=` ou lista CSV).
 * @param {string|Array|object} rawInput
 * @returns {{ slugs: string[], invalidCount: number, error: string|null }}
 */
export function parseFavoritesImportPayload(rawInput) {
  if (!rawInput) {
    return { slugs: [], invalidCount: 0, error: null };
  }

  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { slugs: [], invalidCount: 0, error: null };
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/favoritos') || trimmed.startsWith('?import=')) {
      try {
        const parsedUrl = new URL(trimmed, 'https://nfgbrentano.art.br');
        const importVal = parsedUrl.searchParams.get('import');
        if (importVal) {
          return decodeFavoritesShareParam(importVal);
        }
      } catch {
        // segue para fallback normal
      }
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      let parsed;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return { slugs: [], invalidCount: 1, error: 'JSON inválido' };
      }
      return parseFavoritesImportPayload(parsed);
    }

    return decodeFavoritesShareParam(trimmed);
  }

  if (Array.isArray(rawInput)) {
    return { ...collectValidSlugs(rawInput), error: null };
  }

  if (typeof rawInput === 'object') {
    if (Array.isArray(rawInput.slugs)) {
      return { ...collectValidSlugs(rawInput.slugs), error: null };
    }
    if (Array.isArray(rawInput.favorites)) {
      return { ...collectValidSlugs(rawInput.favorites), error: null };
    }
    return { slugs: [], invalidCount: 1, error: 'Formato JSON inválido' };
  }

  return { slugs: [], invalidCount: 1, error: 'Formato inválido' };
}

/**
 * Mescla slugs importados com os favoritos atuais no localStorage sem duplicar,
 * filtrando inválidos e (quando fornecido) poemas não publicados.
 *
 * @param {string|Array|object} input
 * @param {{ publishedPoems?: Array<object>|null }} [options]
 * @returns {{ success: boolean, addedCount: number, totalCount: number, ignoredCount: number, slugs: string[], error?: string }}
 */
export function mergeFavorites(input, { publishedPoems = null } = {}) {
  const isJsonOrObject = (typeof input === 'object' && input !== null) ||
    (typeof input === 'string' && (input.trim().startsWith('{') || input.trim().startsWith('[') || input.trim().startsWith('http') || input.trim().startsWith('/favoritos') || input.trim().startsWith('?import=')));

  const decoded = isJsonOrObject
    ? parseFavoritesImportPayload(input)
    : decodeFavoritesShareParam(input);

  const currentFavs = getFavorites();

  if (decoded.error) {
    return {
      success: false,
      addedCount: 0,
      totalCount: currentFavs.length,
      ignoredCount: decoded.invalidCount || 1,
      slugs: [],
      error: decoded.error
    };
  }

  let ignoredCount = decoded.invalidCount || 0;
  let validPublishedSlugs = decoded.slugs;
  let poemMap = null;

  if (Array.isArray(publishedPoems)) {
    poemMap = new Map();
    for (const p of publishedPoems) {
      if (p && typeof p.slug === 'string' && p.status !== 'draft' && p.status !== 'scheduled') {
        poemMap.set(p.slug, p);
      }
    }
    const filtered = [];
    for (const slug of decoded.slugs) {
      if (poemMap.has(slug)) {
        filtered.push(slug);
      } else {
        ignoredCount++;
      }
    }
    validPublishedSlugs = filtered;
  }

  if (validPublishedSlugs.length === 0) {
    return {
      success: false,
      addedCount: 0,
      totalCount: currentFavs.length,
      ignoredCount,
      slugs: [],
      error: 'Nenhum poema válido encontrado para importar.'
    };
  }

  if (!isStorageAvailable()) {
    return {
      success: false,
      addedCount: 0,
      totalCount: currentFavs.length,
      ignoredCount,
      slugs: [],
      error: 'Armazenamento local indisponível.'
    };
  }

  const existingSlugs = new Set(currentFavs.map(f => f.slug));
  const newItems = [];
  const baseMs = Date.now();

  for (let i = 0; i < validPublishedSlugs.length; i++) {
    const slug = validPublishedSlugs[i];
    if (existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);
    const matchedPoem = poemMap?.get(slug);
    newItems.push({
      slug,
      ...(matchedPoem?.id ? { id: matchedPoem.id } : {}),
      added_at: new Date(baseMs + i).toISOString()
    });
  }

  const mergedFavs = [...newItems, ...currentFavs].slice(0, MAX_IMPORT_SLUGS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedFavs));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('favorites-changed', {
          detail: { imported: newItems.length }
        }));
      } catch {}
    }
    return {
      success: true,
      addedCount: newItems.length,
      totalCount: mergedFavs.length,
      ignoredCount,
      slugs: mergedFavs.map(f => f.slug)
    };
  } catch (err) {
    console.warn('[Favorites] Erro ao mesclar favoritos no localStorage:', err);
    return {
      success: false,
      addedCount: 0,
      totalCount: currentFavs.length,
      ignoredCount,
      slugs: [],
      error: err?.message || 'Erro ao salvar favoritos.'
    };
  }
}
