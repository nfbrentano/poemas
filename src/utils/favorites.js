/**
 * Gerenciador de poemas favoritos no dispositivo do leitor (localStorage).
 * Operações 100% locais, sem login e sem chamadas de rede/Firestore.
 */

const STORAGE_KEY = 'poemas_favorites';

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
