import { slugifyTag } from './tags.js';
import { SITE_URL } from './url.js';

export { SITE_URL };

const STATUS_MAP = { published: 'publish', draft: 'draft', scheduled: 'future' };
const VERSE_OPEN = '<!-- wp:verse {"textAlign":"center"} -->\n<pre class="wp-block-verse has-text-align-center">';
const VERSE_CLOSE = '</pre>\n<!-- /wp:verse -->';

const HEADER_COMMENT = `<?xml version="1.0" encoding="UTF-8" ?>
<!-- This is a WordPress eXtended RSS file generated as an export of the poems from this site. -->
<!-- It follows the same format as the WordPress export (WXR 1.2). -->
<!-- You may use this file as a backup or to transfer the poems to a WordPress site. -->

<!-- To import this information into a WordPress site follow these steps: -->
<!-- 1. Log in to that site as an administrator. -->
<!-- 2. Go to Tools: Import in the WordPress admin panel. -->
<!-- 3. Install the "WordPress" importer from the list. -->
<!-- 4. Activate & Run Importer. -->
<!-- 5. Upload this file using the form provided on that page. -->
<!-- 6. You will first be asked to map the authors in this export file to users -->
<!--    on the site. For each author, you may choose to map to an -->
<!--    existing user on the site or to create a new user. -->
<!-- 7. WordPress will then import each of the posts, pages, comments, categories, etc. -->
<!--    contained in this file into your site. -->
`;

const AUTHOR = {
  id: 98882272,
  login: 'nataroots',
  email: 'natanaelfernando@outlook.com',
  displayName: 'Natanael',
  firstName: 'Natanael Fernando',
  lastName: 'Gatti Brentano'
};

/** Envolve o texto em CDATA; `]]>` dentro do texto é dividido em dois blocos para não fechar o CDATA. */
export function cdata(text) {
  return `<![CDATA[${String(text ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

export function escapeHtmlText(text) {
  return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const pad = (n) => String(n).padStart(2, '0');

/** `YYYY-MM-DD HH:mm:ss` em UTC. */
export function formatGmt(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/** `YYYY-MM-DD HH:mm:ss` no fuso America/Sao_Paulo (inclui o horário de verão das datas antigas). */
export function formatLocal(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(date).map(p => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function formatRfc822(date) {
  return date.toUTCString().replace(' GMT', ' +0000');
}

const toDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const isHtml = (text) => /<\/?[a-z][^>]*>/i.test(text);

/** Conteúdo no formato do export original: texto puro vira bloco de verso; HTML existente é mantido. */
export function buildContent(content) {
  const text = String(content ?? '');
  if (!isHtml(text)) return `${VERSE_OPEN}${escapeHtmlText(text)}${VERSE_CLOSE}`;
  const trimmed = text.trim();
  const isBareVerse = /^<pre class="wp-block-verse[^"]*">[\s\S]*<\/pre>$/.test(trimmed) && !trimmed.includes('<!-- wp:');
  return isBareVerse ? `<!-- wp:verse {"textAlign":"center"} -->\n${trimmed}\n<!-- /wp:verse -->` : text;
}

function buildCategories(tags) {
  const seen = new Set();
  const lines = ['\t\t<category domain="category" nicename="sem-categoria"><![CDATA[Sem categoria]]></category>'];
  (Array.isArray(tags) ? tags : []).forEach(tag => {
    const name = typeof tag === 'string' ? tag.trim() : '';
    const nicename = slugifyTag(name);
    if (!name || !nicename || seen.has(nicename)) return;
    seen.add(nicename);
    lines.push(`\t\t<category domain="post_tag" nicename="${nicename}">${cdata(name)}</category>`);
  });
  return lines.join('\n');
}

function buildItem(poem, id, siteUrl) {
  const published = toDate(poem.published_at) || toDate(poem.created_at) || new Date(0);
  const modified = toDate(poem.updated_at) || published;
  const status = STATUS_MAP[poem.status] || 'draft';
  return `\t\t<item>
\t\t<title>${cdata(poem.title)}</title>
\t\t<link>${siteUrl}/poema/${encodeURIComponent(poem.slug || '')}</link>
\t\t<pubDate>${formatRfc822(published)}</pubDate>
\t\t<dc:creator>${cdata(AUTHOR.login)}</dc:creator>
\t\t<guid isPermaLink="false">${siteUrl}/?p=${id}</guid>
\t\t<description></description>
\t\t<content:encoded>${cdata(buildContent(poem.content))}</content:encoded>
\t\t<excerpt:encoded>${cdata(poem.excerpt || '')}</excerpt:encoded>
\t\t<wp:post_id>${id}</wp:post_id>
\t\t<wp:post_date>${cdata(formatLocal(published))}</wp:post_date>
\t\t<wp:post_date_gmt>${cdata(formatGmt(published))}</wp:post_date_gmt>
\t\t<wp:post_modified>${cdata(formatLocal(modified))}</wp:post_modified>
\t\t<wp:post_modified_gmt>${cdata(formatGmt(modified))}</wp:post_modified_gmt>
\t\t<wp:comment_status>${cdata('open')}</wp:comment_status>
\t\t<wp:ping_status>${cdata('open')}</wp:ping_status>
\t\t<wp:post_name>${cdata(poem.slug || '')}</wp:post_name>
\t\t<wp:status>${cdata(status)}</wp:status>
\t\t<wp:post_parent>0</wp:post_parent>
\t\t<wp:menu_order>0</wp:menu_order>
\t\t<wp:post_type>${cdata('post')}</wp:post_type>
\t\t<wp:post_password>${cdata('')}</wp:post_password>
\t\t<wp:is_sticky>0</wp:is_sticky>
${buildCategories(poem.tags)}
\t\t</item>`;
}

/**
 * Gera o XML no formato de exportação do WordPress (WXR 1.2) com os poemas informados,
 * do mais antigo ao mais novo. `now` define as datas do cabeçalho (útil para testes).
 */
export function buildWxr({ poems, siteUrl = SITE_URL, now = new Date() } = {}) {
  const base = String(siteUrl).replace(/\/+$/, '');
  const sorted = [...(poems || [])].sort((a, b) => {
    const da = (toDate(a.published_at) || toDate(a.created_at) || new Date(0)).getTime();
    const db = (toDate(b.published_at) || toDate(b.created_at) || new Date(0)).getTime();
    return da - db;
  });
  const items = sorted.map((poem, i) => buildItem(poem, i + 1, base)).join('\n');

  return `${HEADER_COMMENT}
\t<!-- generator="sitepoemas" created="${formatGmt(now).slice(0, 16)}"-->
<rss version="2.0"
\txmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
\txmlns:content="http://purl.org/rss/1.0/modules/content/"
\txmlns:wfw="http://wellformedweb.org/CommentAPI/"
\txmlns:dc="http://purl.org/dc/elements/1.1/"
\txmlns:wp="http://wordpress.org/export/1.2/"
>

<channel>
\t<title>Poemas de Natanael</title>
\t<link>${base}</link>
\t<description>Em poucas palavras este é o refúgio das minhas falas, é onde transcrevo sensações, sentimentos, angústias e alegrias.</description>
\t<pubDate>${formatRfc822(now)}</pubDate>
\t<language>pt-BR</language>
\t<wp:wxr_version>1.2</wp:wxr_version>
\t<wp:base_site_url>${base}</wp:base_site_url>
\t<wp:base_blog_url>${base}</wp:base_blog_url>

\t\t<wp:author><wp:author_id>${AUTHOR.id}</wp:author_id><wp:author_login>${cdata(AUTHOR.login)}</wp:author_login><wp:author_email>${cdata(AUTHOR.email)}</wp:author_email><wp:author_display_name>${cdata(AUTHOR.displayName)}</wp:author_display_name><wp:author_first_name>${cdata(AUTHOR.firstName)}</wp:author_first_name><wp:author_last_name>${cdata(AUTHOR.lastName)}</wp:author_last_name></wp:author>

\t<generator>${base}</generator>

${items}
\t\t</channel>
</rss>
`;
}
