import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fbAppIdPlugin } from '../vite.config.js';

const root = process.cwd();
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
const prerenderSrc = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf-8');

const countMeta = (html, prop) =>
  (html.match(new RegExp(`<meta property="${prop}"`, 'g')) || []).length;

describe('Open Graph: fb:app_id', () => {
  it('RF02/RF03: injeta fb:app_id quando VITE_FB_APP_ID está definido', () => {
    const tags = fbAppIdPlugin('1657229069459357').transformIndexHtml();
    expect(tags).toEqual([
      { tag: 'meta', attrs: { property: 'fb:app_id', content: '1657229069459357' }, injectTo: 'head' }
    ]);
  });

  it('CA06: não emite a tag quando a variável está ausente ou inválida', () => {
    expect(fbAppIdPlugin(undefined).transformIndexHtml()).toEqual([]);
    expect(fbAppIdPlugin('').transformIndexHtml()).toEqual([]);
    expect(fbAppIdPlugin('abc"><script>').transformIndexHtml()).toEqual([]);
  });

  it('deploy injeta VITE_FB_APP_ID no build', () => {
    const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf-8');
    expect(workflow).toMatch(/VITE_FB_APP_ID:\s*'\d+'/);
  });
});

describe('Open Graph: tags estáticas do template', () => {
  it('RF04: og:locale e og:site_name estão no HTML estático', () => {
    expect(indexHtml).toContain('<meta property="og:locale" content="pt_BR" />');
    expect(indexHtml).toContain('<meta property="og:site_name" content="Poemas — Natanael Brentano" />');
  });

  it('template tem uma única ocorrência de cada og:image:*', () => {
    for (const prop of ['og:image', 'og:image:width', 'og:image:height', 'og:image:type']) {
      expect(countMeta(indexHtml, prop)).toBe(1);
    }
  });
});

describe('Open Graph: prerender', () => {
  it('RF05: remove og:image:* do template antes de cada substituição de og:image', () => {
    const lines = prerenderSrc.split('\n');
    const ogImageLines = lines
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => /\/<meta property="og:image" content=/.test(l));
    expect(ogImageLines.length).toBeGreaterThan(0);
    for (const { i } of ogImageLines) {
      const context = lines.slice(Math.max(0, i - 2), i + 1).join('\n');
      expect(context).toContain('OG_IMAGE_EXTRAS_RE');
    }
  });

  it('RF05: a regex de limpeza remove as tags herdadas e mantém og:image', () => {
    const match = prerenderSrc.match(/const OG_IMAGE_EXTRAS_RE = (\/.*\/gi);/);
    expect(match).not.toBeNull();
    const re = eval(match[1]);
    const cleaned = indexHtml.replace(re, '');
    expect(countMeta(cleaned, 'og:image')).toBe(1);
    expect(countMeta(cleaned, 'og:image:width')).toBe(0);
    expect(countMeta(cleaned, 'og:image:type')).toBe(0);
  });

  it('RF06: descrições das meta tags passam por metaDescAttr (linha única)', () => {
    const descReplacements = prerenderSrc.match(
      /<meta (?:name="description"|property="og:description"|name="twitter:description") content="\$\{[^}]+\}"/g
    ) || [];
    expect(descReplacements.length).toBeGreaterThan(0);
    for (const r of descReplacements) {
      expect(r).toContain('metaDescAttr(');
    }
  });
});

describe('Open Graph: build (dist)', () => {
  const distPoemDir = path.join(root, 'dist/poema');
  const hasDist = fs.existsSync(distPoemDir);

  it.skipIf(!hasDist)('CA04/CA05: páginas de poema sem og:image:* duplicadas e descrição em linha única', () => {
    const slugs = fs.readdirSync(distPoemDir).slice(0, 20);
    for (const slug of slugs) {
      const file = path.join(distPoemDir, slug, 'index.html');
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, 'utf-8');
      for (const prop of ['og:image:width', 'og:image:height', 'og:image:type', 'og:locale', 'og:site_name']) {
        expect(countMeta(html, prop), `${slug} ${prop}`).toBe(1);
      }
      const desc = html.match(/<meta property="og:description" content="([^"]*)"/);
      expect(desc?.[1]).not.toMatch(/\n/);
    }
  });
});
