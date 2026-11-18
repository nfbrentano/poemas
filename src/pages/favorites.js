import { getPublishedPoems } from '../utils/poems-store.js';
import {
  getFavorites,
  removeFavorite,
  exportFavoritesJson,
  encodeFavoritesShareParam,
  decodeFavoritesShareParam,
  mergeFavorites
} from '../utils/favorites.js';
import { getReadingHistory, clearReadingHistory } from '../utils/reading-history.js';
import { updateSEO } from '../utils/seo.js';
import { breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { stripHtml, escapeHtml, normalizeForSearch, unwrapSafeHTML } from '../utils/html.js';
import { toast } from '../components/toast.js';
import { printAnthology } from '../utils/print-anthology.js';

function formatRelativeTime(dateIso) {
  if (!dateIso) return '';
  const date = new Date(dateIso);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now - date) / 1000));
  if (diffSec < 60) return 'Agora mesmo';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function clearImportQueryParam() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('import')) {
      url.searchParams.delete('import');
      window.history.replaceState(
        window.history.state,
        '',
        url.pathname + url.search + url.hash
      );
    }
  } catch {
    // ignore URL errors in non-standard environments
  }
}

function buildFavoriteItemHtml({ poem }, baseUrl) {
  const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
  const rawExcerpt = poem.excerpt || stripHtml(poem.content || '').replace(/\s+/g, ' ').trim().slice(0, 160) + '...';
  const hasAudio = Boolean(poem.audio_url && String(poem.audio_url).trim());
  const audioBadge = hasAudio
    ? ' <span class="audio-badge" aria-label="Com narração em áudio" title="Com narração em áudio">🔊</span>'
    : '';

  return `
    <article class="favorite-item" data-slug="${escapeHtml(poem.slug)}">
      <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" class="favorite-item-link" data-link>
        <h2 class="favorite-item-title">${escapeHtml(poem.title)}${audioBadge}</h2>
        <p class="favorite-item-excerpt">${escapeHtml(rawExcerpt)}</p>
        <div class="favorite-item-meta">
          ${year ? `<span>${year}</span>` : ''}
        </div>
      </a>
      <button type="button" class="favorite-item-remove" data-slug="${escapeHtml(poem.slug)}" aria-label="Remover &quot;${escapeHtml(poem.title)}&quot; dos favoritos" title="Remover dos favoritos">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </article>
  `;
}

export const favorites = {
  meta: {
    title: 'Poemas Favoritos — Natanael Fernando Gatti Brentano',
    robots: 'noindex, nofollow'
  },

  async render(container) {
    const baseUrl = import.meta.env.BASE_URL;

    // Atualiza metadados com noindex, nofollow (RNF02, RNF03, CA09)
    updateSEO({
      title: 'Poemas Favoritos — Natanael Fernando Gatti Brentano',
      description: 'Seus poemas favoritos salvos para reler e revisitar.',
      url: `${SITE_URL}/favoritos/`,
      type: 'website',
      robots: 'noindex, nofollow',
      structuredData: [
        breadcrumbSchema([
          { name: 'Início', url: `${SITE_URL}/` },
          { name: 'Favoritos', url: `${SITE_URL}/favoritos/` }
        ])
      ]
    });

    document.title = 'Poemas Favoritos — Natanael Fernando Gatti Brentano';

    // Esqueleto inicial
    container.innerHTML = unwrapSafeHTML(`
      <div class="favorites-page fade-in">
        <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: var(--space-md);"></div>
        <div class="skeleton" style="width: 220px; height: 32px; margin-bottom: var(--space-sm);"></div>
        <div class="skeleton" style="width: 320px; height: 18px; margin-bottom: var(--space-xl);"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
      </div>
    `);

    // Busca acervo publicado e lista de favoritos
    let published = [];
    try {
      published = await getPublishedPoems();
    } catch {
      published = [];
    }

    let pendingImportRaw = null;
    try {
      pendingImportRaw = new URLSearchParams(window.location.search).get('import');
    } catch {
      pendingImportRaw = null;
    }

    let isImportPanelOpen = false;
    let currentFilterQuery = '';

    const renderContent = () => {
      const favs = getFavorites();
      const history = getReadingHistory();

      // Cruza favoritos com o cache de publicados (RF06, CA06)
      // Mantém a ordem exata dos favoritos (mais recente primeiro - RF03, CA04)
      const matchingItems = [];
      for (const fav of favs) {
        const poem = published.find(p => p.slug === fav.slug || (fav.id && p.id === fav.id));
        if (poem) {
          matchingItems.push({ poem, fav });
        }
      }

      // Cruza histórico de leitura com o acervo publicado (RF04, CA04)
      const matchingHistory = [];
      for (const item of history) {
        const poem = published.find(p => p.slug === item.slug);
        if (poem) {
          matchingHistory.push({ poem, history: item });
        }
      }

      const breadcrumbItems = [
        { name: 'Início', url: baseUrl },
        { name: 'Favoritos', url: `${baseUrl}favoritos/` }
      ];
      const breadcrumbsHtml = renderBreadcrumbsHtml(breadcrumbItems);

      // Banner de importação pendente via URL ?import= (CA05, CA06, RNF03)
      let importBannerHtml = '';
      if (pendingImportRaw !== null && pendingImportRaw !== '') {
        const previewDecoded = decodeFavoritesShareParam(pendingImportRaw);
        const publishedSlugSet = new Set(
          published
            .filter(p => p && typeof p.slug === 'string' && p.status !== 'draft' && p.status !== 'scheduled')
            .map(p => p.slug)
        );
        const validPreviewSlugs = previewDecoded.slugs.filter(s => publishedSlugSet.has(s));
        const ignoredPreviewCount = previewDecoded.invalidCount + (previewDecoded.slugs.length - validPreviewSlugs.length);

        importBannerHtml = `
          <div id="favorites-import-banner" class="favorites-import-banner" role="region" aria-label="Importar favoritos compartilhados" style="margin-bottom: var(--space-lg); padding: var(--space-md); border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-elevated);">
            <p style="margin: 0 0 var(--space-sm) 0; color: var(--text-primary); font-family: var(--font-ui); font-size: 0.92rem;">
              ${validPreviewSlugs.length > 0
                ? `Link compartilhado com <strong>${validPreviewSlugs.length}</strong> ${validPreviewSlugs.length === 1 ? 'poema válido' : 'poemas válidos'} para adicionar à sua lista.${ignoredPreviewCount > 0 ? ` (${ignoredPreviewCount} item(ns) inválido(s) ou indisponível(is) serão ignorados.)` : ''}`
                : 'Nenhum poema publicado válido foi encontrado neste link de importação.'}
            </p>
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              ${validPreviewSlugs.length > 0 ? '<button type="button" id="confirm-import-btn" class="btn-primary">Confirmar importação</button>' : ''}
              <button type="button" id="cancel-import-btn" class="btn-secondary">${validPreviewSlugs.length > 0 ? 'Cancelar' : 'Fechar'}</button>
            </div>
          </div>
        `;
      }

      // Controles de portabilidade (RF04, CA05)
      const hasSavedItems = matchingItems.length > 0;
      const portabilityHtml = `
        <div class="favorites-portability-section" style="margin-bottom: var(--space-lg);">
          <div class="favorites-portability-actions" style="display: flex; flex-wrap: wrap; gap: var(--space-xs); align-items: center;">
            <button type="button" id="export-favorites-json-btn" class="btn-secondary" ${hasSavedItems ? '' : 'disabled'} style="font-size: 0.85rem; padding: 0.45rem 0.8rem; cursor: ${hasSavedItems ? 'pointer' : 'not-allowed'};">
              Exportar JSON
            </button>
            <button type="button" id="copy-favorites-link-btn" class="btn-secondary" ${hasSavedItems ? '' : 'disabled'} style="font-size: 0.85rem; padding: 0.45rem 0.8rem; cursor: ${hasSavedItems ? 'pointer' : 'not-allowed'};">
              Copiar link da lista
            </button>
            <button type="button" id="toggle-import-panel-btn" class="btn-secondary" aria-expanded="${isImportPanelOpen ? 'true' : 'false'}" style="font-size: 0.85rem; padding: 0.45rem 0.8rem; cursor: pointer;">
              Importar favoritos
            </button>
            <button type="button" id="print-favorites-btn" class="btn-print" ${hasSavedItems ? '' : 'disabled'} style="font-size: 0.85rem; padding: 0.45rem 0.8rem; cursor: ${hasSavedItems ? 'pointer' : 'not-allowed'};">
              Imprimir / Salvar PDF
            </button>
          </div>
          <div id="favorites-import-panel" class="favorites-import-panel" style="display: ${isImportPanelOpen ? 'grid' : 'none'}; gap: var(--space-sm); margin-top: var(--space-sm); padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-elevated);">
            <label for="import-favorites-file" style="font-size: 0.85rem; color: var(--text-secondary); font-family: var(--font-ui);">
              Selecione um arquivo <code>.json</code> exportado ou cole abaixo o JSON / link / slugs:
            </label>
            <input type="file" id="import-favorites-file" accept=".json,application/json" style="font-size: 0.85rem;">
            <textarea id="import-favorites-textarea" rows="3" placeholder="Cole aqui o JSON exportado ou link/lista de slugs..." style="width: 100%; padding: 0.6rem; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.85rem; box-sizing: border-box;"></textarea>
            <div style="display: flex; gap: var(--space-xs);">
              <button type="button" id="submit-import-favorites-btn" class="btn-primary">Mesclar favoritos</button>
            </div>
          </div>
        </div>
      `;

      // Bloco de Histórico de Leitura ("Lidos recentemente") (RF04, CA04, CA06)
      let historyHtml = '';
      if (matchingHistory.length > 0) {
        historyHtml = `
          <section class="reading-history-section" style="margin-top: var(--space-2xl); border-top: 1px solid var(--border-subtle); padding-top: var(--space-xl);" aria-label="Lidos recentemente">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-xs);">
              <div>
                <h2 style="font-family: var(--font-display); font-size: 1.35rem; color: var(--text-primary); margin: 0;">Lidos recentemente</h2>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Poemas que você visitou neste dispositivo.</p>
              </div>
              <button type="button" id="clear-reading-history-btn" class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; border-radius: 4px; cursor: pointer;">
                Limpar histórico
              </button>
            </div>
            <div class="reading-history-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-sm);">
              ${matchingHistory.map(({ poem, history: h }) => {
                const year = poem.published_at ? new Date(poem.published_at).getFullYear() : '';
                return `
                  <article class="reading-history-item" data-slug="${escapeHtml(poem.slug)}" style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 6px; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
                    <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" class="reading-history-link" data-link style="text-decoration: none; color: inherit;">
                      <h3 style="font-family: var(--font-poem); font-size: 1.05rem; margin: 0 0 4px 0; color: var(--text-primary);">${escapeHtml(poem.title)}</h3>
                      <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(poem.excerpt || stripHtml(poem.content).slice(0, 100) + '...')}</p>
                    </a>
                    <div style="margin-top: var(--space-xs); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                      <span>${escapeHtml(formatRelativeTime(h.readAt))}${year ? ` • ${year}` : ''}</span>
                      <a href="${baseUrl}poema/${escapeHtml(poem.slug)}/" data-link style="color: var(--accent-subtle); text-decoration: none; font-weight: 500;">Continuar lendo →</a>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>
        `;
      }

      const bindRemoveListeners = (rootEl) => {
        rootEl.querySelectorAll('.favorite-item-remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const slug = btn.dataset.slug;
            if (slug) {
              removeFavorite(slug);
              toast.show('Poema removido dos favoritos.', 'info');
              renderContent();
            }
          });
        });
      };

      const filterMatchingItems = (query) => {
        const q = normalizeForSearch(query || '').trim();
        if (!q) return matchingItems;
        return matchingItems.filter(({ poem }) => {
          const title = normalizeForSearch(poem.title || '');
          const excerpt = normalizeForSearch(poem.excerpt || '');
          const content = normalizeForSearch(poem.content || '');
          const tags = (Array.isArray(poem.tags) ? poem.tags : []).map(normalizeForSearch);
          return title.includes(q) || excerpt.includes(q) || content.includes(q) || tags.some(t => t.includes(q));
        });
      };

      // Estado Vazio de Favoritos (RF04, CA05)
      if (matchingItems.length === 0) {
        container.innerHTML = unwrapSafeHTML(`
          <div class="favorites-page fade-in">
            ${breadcrumbsHtml}
            <header class="favorites-header">
              <h1 class="favorites-title">Poemas Favoritos</h1>
              <p class="favorites-subtitle">Seus poemas salvos para reler e revisitar.</p>
            </header>
            ${importBannerHtml}
            ${portabilityHtml}
            <div class="favorites-empty">
              <div class="empty-icon" aria-hidden="true">🔖</div>
              <h2 class="empty-title">Nenhum poema favoritado ainda</h2>
              <p class="empty-desc">
                Quando encontrar versos que tocam sua alma, clique no botão <strong>Favoritar</strong> ao final do poema para guardá-los aqui e reler quando desejar.
              </p>
              <a href="${baseUrl}" class="btn-primary" data-link>Explorar o acervo de poemas</a>
            </div>
            ${historyHtml}
          </div>
        `);
      } else {
        // Listagem de Favoritos (RF03, RF04, CA04)
        const countLabel = matchingItems.length === 1 ? '1 poema salvo' : `${matchingItems.length} poemas salvos`;
        const showInternalSearch = matchingItems.length >= 5;
        const visibleItems = filterMatchingItems(currentFilterQuery);

        container.innerHTML = unwrapSafeHTML(`
          <div class="favorites-page fade-in">
            ${breadcrumbsHtml}
            <header class="favorites-header">
              <h1 class="favorites-title">Poemas Favoritos</h1>
              <p class="favorites-subtitle">${countLabel} no seu navegador.</p>
            </header>
            ${importBannerHtml}
            ${portabilityHtml}
            ${showInternalSearch ? `
              <div class="favorites-search-wrapper" style="margin-bottom: var(--space-md);">
                <input
                  type="search"
                  id="favorites-search-input"
                  value="${escapeHtml(currentFilterQuery)}"
                  placeholder="Buscar nos seus favoritos..."
                  aria-label="Buscar nos seus favoritos"
                  style="width: 100%; padding: 0.65rem 0.9rem; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.95rem; box-sizing: border-box;"
                >
              </div>
            ` : ''}
            <div class="favorites-list" id="favorites-list">
              ${visibleItems.map(item => buildFavoriteItemHtml(item, baseUrl)).join('')}
            </div>
            <p id="favorites-filter-empty" class="favorites-filter-empty" style="display: ${visibleItems.length === 0 ? 'block' : 'none'}; color: var(--text-muted); font-style: italic; margin-top: var(--space-md);">
              Nenhum poema favoritado corresponde à busca.
            </p>
            ${historyHtml}
          </div>
        `);

        const listEl = container.querySelector('#favorites-list');
        if (listEl) {
          bindRemoveListeners(listEl);
        }

        const searchInput = container.querySelector('#favorites-search-input');
        if (searchInput && listEl) {
          searchInput.addEventListener('input', (e) => {
            currentFilterQuery = e.target.value || '';
            const nextVisible = filterMatchingItems(currentFilterQuery);
            listEl.innerHTML = unwrapSafeHTML(
              nextVisible.map(item => buildFavoriteItemHtml(item, baseUrl)).join('')
            );
            bindRemoveListeners(listEl);
            const emptyFilterEl = container.querySelector('#favorites-filter-empty');
            if (emptyFilterEl) {
              emptyFilterEl.style.display = nextVisible.length === 0 ? 'block' : 'none';
            }
          });
        }
      }

      // Handlers de importação via link (?import=)
      container.querySelector('#confirm-import-btn')?.addEventListener('click', () => {
        const res = mergeFavorites(pendingImportRaw, { publishedPoems: published });
        pendingImportRaw = null;
        clearImportQueryParam();
        if (res.success) {
          const msg = res.addedCount > 0
            ? `${res.addedCount} ${res.addedCount === 1 ? 'favorito importado' : 'favoritos importados'} com sucesso!`
            : 'Os poemas deste link já estavam nos seus favoritos.';
          toast.show(msg, 'success');
        } else {
          toast.show(res.error || 'Nenhum poema válido encontrado para importar.', 'error');
        }
        renderContent();
      });

      container.querySelector('#cancel-import-btn')?.addEventListener('click', () => {
        pendingImportRaw = null;
        clearImportQueryParam();
        renderContent();
      });

      // Exportar JSON
      container.querySelector('#export-favorites-json-btn')?.addEventListener('click', () => {
        if (!hasSavedItems) return;
        const jsonContent = exportFavoritesJson();
        try {
          if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favoritos-poemas.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            if (typeof URL.revokeObjectURL === 'function') {
              URL.revokeObjectURL(url);
            }
          }
          toast.show('Favoritos exportados em JSON.', 'success');
        } catch {
          toast.show('Não foi possível baixar o arquivo JSON.', 'error');
        }
      });

      // Copiar link da lista compartilhável
      container.querySelector('#copy-favorites-link-btn')?.addEventListener('click', async () => {
        if (!hasSavedItems) return;
        const param = encodeFavoritesShareParam();
        const shareUrl = `${SITE_URL}/favoritos/?import=${encodeURIComponent(param)}`;
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(shareUrl);
            toast.show('Link da lista copiado!', 'success');
          } else {
            isImportPanelOpen = true;
            renderContent();
            const textarea = container.querySelector('#import-favorites-textarea');
            if (textarea) textarea.value = shareUrl;
            toast.show('Link gerado abaixo para copiar.', 'info');
          }
        } catch {
          toast.show('Não foi possível copiar o link automaticamente.', 'error');
        }
      });

      // Imprimir / Salvar PDF dos favoritos visíveis (RF04, CA05)
      container.querySelector('#print-favorites-btn')?.addEventListener('click', () => {
        const visiblePoems = filterMatchingItems(currentFilterQuery).map(item => item.poem);
        if (visiblePoems.length === 0) {
          toast.show('Nenhum poema visível para imprimir.', 'info');
          return;
        }
        printAnthology({
          title: 'Poemas Favoritos',
          subtitle: 'Antologia pessoal de poemas salvos.',
          poems: visiblePoems
        });
      });

      // Alternar painel de importação manual
      container.querySelector('#toggle-import-panel-btn')?.addEventListener('click', () => {
        isImportPanelOpen = !isImportPanelOpen;
        const panel = container.querySelector('#favorites-import-panel');
        const toggleBtn = container.querySelector('#toggle-import-panel-btn');
        if (panel) {
          panel.style.display = isImportPanelOpen ? 'grid' : 'none';
        }
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', isImportPanelOpen ? 'true' : 'false');
        }
      });

      const runManualImport = (rawPayload) => {
        const res = mergeFavorites(rawPayload, { publishedPoems: published });
        if (res.success) {
          isImportPanelOpen = false;
          const summary = res.addedCount > 0
            ? `${res.addedCount} ${res.addedCount === 1 ? 'favorito importado' : 'favoritos importados'}!`
            : 'Todos os poemas válidos já estavam salvos.';
          toast.show(
            res.ignoredCount > 0 ? `${summary} (${res.ignoredCount} inválido(s) descartado(s))` : summary,
            'success'
          );
          renderContent();
        } else {
          toast.show(res.error || 'Nenhum poema válido encontrado para importar.', 'error');
        }
      };

      container.querySelector('#submit-import-favorites-btn')?.addEventListener('click', () => {
        const textarea = container.querySelector('#import-favorites-textarea');
        const raw = textarea ? textarea.value.trim() : '';
        runManualImport(raw);
      });

      container.querySelector('#import-favorites-file')?.addEventListener('change', async (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        try {
          const text = typeof file.text === 'function'
            ? await file.text()
            : await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(reader.error);
              reader.readAsText(file);
            });
          runManualImport(text);
        } catch {
          toast.show('Erro ao ler o arquivo selecionado.', 'error');
        }
      });

      // Event listener para botão de limpar histórico de leitura
      const clearHistoryBtn = container.querySelector('#clear-reading-history-btn');
      if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
          clearReadingHistory();
          toast.show('Histórico de leitura limpo.', 'info');
          renderContent();
        });
      }
    };

    renderContent();
  }
};

export default favorites;
