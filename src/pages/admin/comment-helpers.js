import { escapeHtml } from '../../utils/html.js';

export function attachPoemsToComments(comments, poems) {
  const poemsMap = new Map();
  (poems || []).forEach(p => {
    if (!p) return;
    if (p.id) poemsMap.set(String(p.id), p);
    if (p.slug) poemsMap.set(String(p.slug), p);
  });

  return (comments || []).map(c => {
    if (!c) return c;
    const poemId = c.poem_id || c.poemId;
    const matched = poemId ? poemsMap.get(String(poemId)) : null;
    let createdAt = c.created_at;
    if (createdAt && typeof createdAt.toDate === 'function') {
      createdAt = createdAt.toDate().toISOString();
    } else if (createdAt && createdAt.seconds) {
      createdAt = new Date(createdAt.seconds * 1000).toISOString();
    }
    return {
      ...c,
      created_at: createdAt,
      poems: matched ? { id: matched.id, title: matched.title, slug: matched.slug } : (c.poems || null)
    };
  });
}

export function formatCommentPoemHtml(c, baseUrl = (import.meta.env?.BASE_URL || '/')) {
  if (c?.poems?.title) {
    const titleEscaped = escapeHtml(c.poems.title);
    if (c.poems.slug) {
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = `${cleanBase}poema/${encodeURIComponent(c.poems.slug)}`;
      return `Em: <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-subtle); text-decoration: underline;" title="Ver poema publicado">${titleEscaped}</a>`;
    }
    return `Em: ${titleEscaped}`;
  }
  return 'Em: <span style="font-style: italic; color: var(--text-muted);">Obra removida</span>';
}
