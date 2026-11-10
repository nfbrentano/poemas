import fs from 'fs';
import path from 'path';

/**
 * Loads fallback published poems from scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml
 * when Firebase environment variables are not available (e.g. in PRs from forks).
 * @returns {Array<object>}
 */
export function loadFallbackPoems() {
  const xmlPath = path.resolve(process.cwd(), 'scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml');
  if (!fs.existsSync(xmlPath)) {
    console.warn('[Fallback] XML de poemas não encontrado em:', xmlPath);
    return [];
  }

  const xml = fs.readFileSync(xmlPath, 'utf-8');
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const poems = [];

  for (const item of items) {
    const postTypeMatch = item.match(/<wp:post_type>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:post_type>/);
    const statusMatch = item.match(/<wp:status>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:status>/);

    if (postTypeMatch && postTypeMatch[1] === 'post' && statusMatch && statusMatch[1] === 'publish') {
      const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const slugMatch = item.match(/<wp:post_name>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:post_name>/);
      const dateMatch = item.match(/<wp:post_date>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/wp:post_date>/);
      const contentMatch = item.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/);
      const excerptMatch = item.match(/<excerpt:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/excerpt:encoded>/);
      const tags = [...item.matchAll(/<category domain="post_tag"[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/category>/g)].map(m => m[1]);

      const slug = slugMatch && slugMatch[1] ? slugMatch[1].trim() : '';
      if (!slug) continue;

      const dateStr = dateMatch && dateMatch[1] ? dateMatch[1].trim() : '';
      const publishedAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

      // Ensure fallback poems have sentiment tags for indexable /sentimento/ hubs
      const fallbackTags = tags.length > 0 ? tags : [
        ['Amor', 'Afeto'],
        ['Saudade', 'Tempo'],
        ['Esperança', 'Vida'],
        ['Reflexão', 'Amor'],
        ['Tempo', 'Saudade']
      ][poems.length % 5];

      poems.push({
        id: slug,
        title: titleMatch && titleMatch[1] ? titleMatch[1].trim() : slug,
        slug,
        content: contentMatch && contentMatch[1] ? contentMatch[1].trim() : '',
        excerpt: excerptMatch && excerptMatch[1] ? excerptMatch[1].trim() : '',
        published_at: publishedAt,
        status: 'published',
        tags: fallbackTags
      });
    }
  }

  return poems;
}
