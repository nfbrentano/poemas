import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { buildWxr, buildContent, cdata, formatLocal, formatGmt, formatRfc822 } from './wxr-builder.js';

const NOW = new Date('2026-10-06T12:00:00Z');
const poem = (over = {}) => ({
  title: 'Como falar', slug: 'como-falar', content: 'Verso um,\nverso dois.', excerpt: '', tags: ['amor', 'Dani'],
  status: 'published', published_at: '2015-12-23T22:42:40+00:00', updated_at: '2025-07-17T00:48:47.000Z', ...over
});
const parse = (xml) => new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata', trimValues: false }).parse(xml);
const itemsOf = (xml) => { const i = parse(xml).rss.channel.item; return Array.isArray(i) ? i : [i]; };

/** Nomes dos elementos do núcleo de um <item> (até wp:is_sticky), a partir do texto do XML. */
const coreOrder = (itemXml) => {
  const names = [...itemXml.matchAll(/^\s*<([A-Za-z:_]+)[ >\/]/gm)].map(m => m[1]).filter(n => n !== 'item');
  return names.slice(0, names.indexOf('wp:is_sticky') + 1);
};
const firstItemOf = (xml) => xml.slice(xml.indexOf('<item>'), xml.indexOf('</item>'));

describe('buildWxr', () => {
  it('gera XML bem-formado com um item por poema, do mais antigo ao mais novo', () => {
    const xml = buildWxr({ poems: [poem({ title: 'B', published_at: '2020-01-01T00:00:00Z' }), poem({ title: 'A', published_at: '2019-01-01T00:00:00Z' })], now: NOW });
    const items = itemsOf(xml);
    expect(items).toHaveLength(2);
    expect(items[0].title.__cdata).toBe('A');
    expect(items[1]['wp:post_id']).toBe(2);
    expect(parse(xml).rss.channel['wp:wxr_version']).toBe(1.2);
  });

  it('mantém a mesma ordem de elementos do item do export original', () => {
    const original = readFileSync('scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml', 'utf8');
    const originalOrder = coreOrder(firstItemOf(original));
    expect(originalOrder).toContain('pubDate');
    expect(originalOrder.length).toBeGreaterThan(20);
    expect(coreOrder(firstItemOf(buildWxr({ poems: [poem()], now: NOW })))).toEqual(originalOrder);
  });

  it('usa o link do site e converte as datas (local em São Paulo, GMT em UTC)', () => {
    const xml = buildWxr({ poems: [poem({ published_at: '2026-06-26T02:15:24.227+00:00', updated_at: undefined })], siteUrl: 'https://exemplo.com/', now: NOW });
    const item = itemsOf(xml)[0];
    expect(item.link).toBe('https://exemplo.com/poema/como-falar');
    expect(item['wp:post_date_gmt'].__cdata).toBe('2026-06-26 02:15:24');
    expect(item['wp:post_date'].__cdata).toBe('2026-06-25 23:15:24');
    expect(item['wp:post_modified_gmt'].__cdata).toBe('2026-06-26 02:15:24');
    expect(item.pubDate).toBe('Fri, 26 Jun 2026 02:15:24 +0000');
  });

  it('mapeia o status', () => {
    const xml = buildWxr({ poems: ['published', 'draft', 'scheduled', 'outro'].map((status, i) => poem({ status, slug: `s${i}`, published_at: `2020-01-0${i + 1}T00:00:00Z` })), now: NOW });
    expect(itemsOf(xml).map(i => i['wp:status'].__cdata)).toEqual(['publish', 'draft', 'future', 'draft']);
  });

  it('tags viram post_tag, sem duplicar, e mantém sem-categoria', () => {
    const xml = buildWxr({ poems: [poem({ tags: ['amor', 'Amor', ' Dani ', '', 'equilíbrio'] })], now: NOW });
    const cats = itemsOf(xml)[0].category;
    expect(cats.map(c => c['@_domain'] + ':' + c['@_nicename'])).toEqual(['category:sem-categoria', 'post_tag:amor', 'post_tag:dani', 'post_tag:equilibrio']);
  });

  it('tolera poema sem tags, sem slug e sem datas', () => {
    const xml = buildWxr({ poems: [{ title: 'X', content: 'y' }], now: NOW });
    expect(itemsOf(xml)).toHaveLength(1);
  });

  it('conteúdo HTML com ]]> continua gerando XML válido e se reconstitui inteiro', () => {
    const xml = buildWxr({ poems: [poem({ content: '<b>antes</b> ]]> depois' })], now: NOW });
    const text = itemsOf(xml)[0]['content:encoded'].__cdata;
    expect(Array.isArray(text) ? text.join('') : text).toBe('<b>antes</b> ]]> depois');
  });
  it('texto puro com ]]> também fica válido (o > é escapado)', () => {
    const xml = buildWxr({ poems: [poem({ content: 'antes ]]> depois' })], now: NOW });
    expect(itemsOf(xml)[0]['content:encoded'].__cdata).toContain('antes ]]&gt; depois');
  });

  it('sem poemas gera só o cabeçalho', () => {
    expect(itemsOf(buildWxr({ poems: [], now: NOW }).replace('</channel>', '<item><title/></item></channel>'))).toHaveLength(1);
    expect(buildWxr({ poems: [], now: NOW })).not.toContain('<wp:post_id>');
  });
});

describe('buildContent', () => {
  it('texto puro: escapa &, < e > e envolve no bloco de verso', () => {
    const out = buildContent('Tu & eu <3\nfim');
    expect(out).toBe('<!-- wp:verse {"textAlign":"center"} -->\n<pre class="wp-block-verse has-text-align-center">Tu &amp; eu &lt;3\nfim</pre>\n<!-- /wp:verse -->');
  });
  it('HTML existente é mantido sem escape adicional', () => {
    const html = 'O <strong>amor</strong><br>e a vida';
    expect(buildContent(html)).toBe(html);
  });
  it('bloco <pre> de verso sem comentários do WordPress ganha os comentários', () => {
    const pre = '<pre class="wp-block-verse has-text-align-center">Um<br>dois</pre>';
    expect(buildContent(pre)).toBe(`<!-- wp:verse {"textAlign":"center"} -->\n${pre}\n<!-- /wp:verse -->`);
  });
  it('bloco que já tem os comentários não é duplicado', () => {
    const full = '<!-- wp:verse -->\n<pre class="wp-block-verse">Um</pre>\n<!-- /wp:verse -->';
    expect(buildContent(full)).toBe(full);
  });
});

describe('formatação', () => {
  it('cdata divide ]]>', () => expect(cdata('a]]>b')).toBe('<![CDATA[a]]]]><![CDATA[>b]]>'));
  it('datas', () => {
    const d = new Date('2015-12-23T22:42:40Z');
    expect(formatGmt(d)).toBe('2015-12-23 22:42:40');
    expect(formatLocal(d)).toBe('2015-12-23 20:42:40'); // horário de verão (UTC-2) em dezembro de 2015
    expect(formatRfc822(d)).toBe('Wed, 23 Dec 2015 22:42:40 +0000');
  });
});
