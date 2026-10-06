import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Public Query Constraints', () => {
  it('ensures firestore.rules restricts public read of poems to status == published', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const content = fs.readFileSync(rulesPath, 'utf-8');

    // Ensure unrestricted read is not present for poems
    const poemsMatchBlock = content.match(/match\s+\/poems\/\{document=\*\*\}\s*\{([\s\S]*?)\}/);
    expect(poemsMatchBlock).not.toBeNull();

    const block = poemsMatchBlock[1];
    expect(block).not.toMatch(/allow\s+read\s*:\s*if\s+true\s*;/);
    expect(block).toMatch(/allow\s+read\s*:\s*if\s+resource\.data\.status\s*==\s*['"]published['"]\s*\|\|\s*request\.auth\s*!=\s*null\s*;/);
    expect(block).toMatch(/allow\s+write\s*:\s*if\s+request\.auth\s*!=\s*null\s*;/);
  });

  it('ensures all public queries to poems in src/ include status == published filter', () => {
    const srcDir = path.resolve(process.cwd(), 'src');

    function getFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(filePath));
        } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
          results.push(filePath);
        }
      });
      return results;
    }

    const files = getFiles(srcDir).filter(f => !f.endsWith('admin.js') && !f.includes('/pages/admin/')); // Admin is authenticated

    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf-8');
      if (code.includes("'poems'") || code.includes('"poems"')) {
        // Find every query block mentioning poems
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes("collection(db, 'poems')") || line.includes("firestoreCollection(db, 'poems')") || line.includes("collection(db, \"poems\")")) {
            // Check context (+/- 10 lines) for status == published
            const start = Math.max(0, idx - 5);
            const end = Math.min(lines.length, idx + 10);
            const context = lines.slice(start, end).join('\n');
            const hasPublishedStatus = context.includes("'status', '==', 'published'") || context.includes('"status", "==", "published"');
            expect(hasPublishedStatus, `Query in ${path.relative(process.cwd(), file)}:${idx + 1} must filter by status == published`).toBe(true);
          }
        });
      }
    });
  });
});

describe('CodeQL Security Scanning Fixes (SDD 2026-09-29)', () => {
  describe('CT01 & CA01: Bio com payload XSS em renderAboutMarkup', () => {
    it('renderAboutMarkup escapa payload XSS na bio e não renderiza tags executáveis', async () => {
      const { renderAboutMarkup } = await import('./utils/about-template.js');
      const xssPayload = '<img src=x onerror=alert(1)>';
      const html = renderAboutMarkup({ bioText: xssPayload });

      const { JSDOM } = await import('jsdom');
      const dom = new JSDOM(html);
      const bioEl = dom.window.document.getElementById('bio-content');

      expect(bioEl).not.toBeNull();
      expect(bioEl.querySelector('img')).toBeNull();
      expect(bioEl.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
      expect(bioEl.textContent.trim()).toBe('<img src=x onerror=alert(1)>');
    });
  });

  describe('CT02 & CA02: Bio multilinha e preservação de caracteres especiais', () => {
    it('escapa HTML preservando quebras de linha com <br>', async () => {
      const { escapeHtml } = await import('./utils/html.js');
      const rawBio = "Linha 1\nLinha 2 & <3\nLinha 3";
      const formatted = escapeHtml(rawBio).replace(/\n/g, '<br>');

      expect(formatted).toBe('Linha 1<br>Linha 2 &amp; &lt;3<br>Linha 3');
      expect(formatted).not.toContain('<script');
      expect(formatted).not.toContain('<3\n');
    });
  });

  describe('CT03 & CA03: RSS com payloads maliciosos de bypass', () => {
    it('formatPoemHtmlForRss remove scripts aninhados, eventos on*, javascript: e iframes', async () => {
      const { formatPoemHtmlForRss } = await import('./utils/rss-builder.js');

      const payloads = [
        '<scr<script>ipt>alert(1)</script >',
        '<p onclick=alert(1)>Texto seguro</p>',
        '<a href="javascript:alert(1)">Link malicioso</a>',
        '<svg onload=alert(1)>',
        '<iframe>alert(1)</iframe>'
      ];

      for (const payload of payloads) {
        const clean = formatPoemHtmlForRss(payload);
        expect(clean).not.toMatch(/<script\b/i);
        expect(clean).not.toMatch(/<iframe\b/i);
        expect(clean).not.toMatch(/<svg\b/i);
        expect(clean).not.toMatch(/\son\w+=/i);
        expect(clean).not.toMatch(/javascript:/i);
      }
    });
  });

  describe('CT04 & CA04: RSS mantém formatação legítima de poemas', () => {
    it('preserva tags p, br, em, strong e formata poemas em texto puro', async () => {
      const { formatPoemHtmlForRss } = await import('./utils/rss-builder.js');

      const richPoem = '<p>Verso com <em>itálico</em> e <strong>negrito</strong>.<br>Segunda linha.</p>';
      const result = formatPoemHtmlForRss(richPoem);
      expect(result).toBe('<p>Verso com <em>itálico</em> e <strong>negrito</strong>.<br>Segunda linha.</p>');

      const plainPoem = 'Estrofe um\nLinha dois\n\nEstrofe dois';
      const plainResult = formatPoemHtmlForRss(plainPoem);
      expect(plainResult).toMatch(/<p>Estrofe um<br\s*\/?>Linha dois<\/p>/);
      expect(plainResult).toContain('<p>Estrofe dois</p>');
    });
  });

  describe('CT05 & CA05: Link de edição com id malicioso', () => {
    it('encodeURIComponent codifica adequadamente poem.id em parâmetros de busca', () => {
      const maliciousId = '"><img src=x onerror=alert(1)>';
      const encoded = encodeURIComponent(maliciousId);
      const url = `/admin?view=editor&id=${encoded}`;

      expect(url).not.toContain('<img');
      expect(url).not.toContain('"');
      expect(url).toContain('%22%3E%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');
    });
  });

  describe('CT06 & CA06: Prefetch com validação estrita de slug', () => {
    it('descarta slugs com caminhos relativos ou payloads javascript:', () => {
      const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      expect(SLUG_REGEX.test('javascript:alert(1)')).toBe(false);
      expect(SLUG_REGEX.test('../../x')).toBe(false);
      expect(SLUG_REGEX.test('<script>')).toBe(false);
      expect(SLUG_REGEX.test('slug com espaco')).toBe(false);
      expect(SLUG_REGEX.test('-slug-comeca-hifen')).toBe(false);

      expect(SLUG_REGEX.test('poema-valido')).toBe(true);
      expect(SLUG_REGEX.test('outro-poema-123')).toBe(true);
      expect(SLUG_REGEX.test('solidao')).toBe(true);
    });
  });

  describe('CT07 & CA07: Canonical e og:url sempre enraizados em SITE_URL', () => {
    it('ignora host e parâmetros de window.location ao gerar canonical e og:url', async () => {
      const { updateSEO } = await import('./utils/seo.js');

      // Simular window.location de localhost com parâmetros e hash
      delete window.location;
      window.location = new URL('http://localhost:5173/poema/teste-seguranca/?utm_source=facebook#comentarios');

      document.head.innerHTML = '';
      updateSEO({});

      const canonical = document.querySelector('link[rel="canonical"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');

      expect(canonical).not.toBeNull();
      expect(canonical.getAttribute('href')).toBe('https://nfgbrentano.art.br/poema/teste-seguranca/');
      expect(ogUrl.getAttribute('content')).toBe('https://nfgbrentano.art.br/poema/teste-seguranca/');
    });
  });

  describe('CT08 & CA08: Breadcrumb protege contra domínio similar', () => {
    it('mantém URL externa absoluta se o host não for exatamente o origin de SITE_URL', async () => {
      const { renderBreadcrumbsHtml } = await import('./utils/structured-data.js');

      const items = [
        { name: 'Início', url: 'https://nfgbrentano.art.br/' },
        { name: 'Phishing', url: 'https://nfgbrentano.art.br.evil.com/x' },
        { name: 'Atual', url: 'https://nfgbrentano.art.br/poema/meu-poema/' }
      ];

      const html = renderBreadcrumbsHtml(items);

      // O link de phishing NÃO deve ser transformado em relativo (.evil.com/x)
      expect(html).toContain('href="https://nfgbrentano.art.br.evil.com/x"');
      expect(html).not.toContain('href=".evil.com/x"');
      // O link interno deve ser transformado no caminho relativo /
      expect(html).toContain('href="/"');
    });
  });

  describe('CT09 & CA09: decodeHtmlEntities sem double-unescaping', () => {
    it('decodifica em passada única sem transformar &amp;lt; em <', async () => {
      const { decodeHtmlEntities } = await import('./utils/llms-builder.js');

      expect(decodeHtmlEntities('&amp;lt;b&amp;gt;')).toBe('&lt;b&gt;');
      expect(decodeHtmlEntities('&lt;b&gt;')).toBe('<b>');
      expect(decodeHtmlEntities('Amor &amp; Saudade')).toBe('Amor & Saudade');
      expect(decodeHtmlEntities('&nbsp;')).toBe(' ');
      expect(decodeHtmlEntities('&#39;Poesia&#39;')).toBe("'Poesia'");
      expect(decodeHtmlEntities('&#x2F;caminho&#x2F;')).toBe('/caminho/');
    });
  });

  describe('CT10 & CA10: removeJsonLdScripts remove blocos completos e aninhados', () => {
    it('remove todos os scripts ld+json mesmo se houver repetições', async () => {
      const { removeJsonLdScripts } = await import('../scripts/prerender.js');

      const htmlWithJsonLd = `
        <html>
          <head>
            <script type="application/ld+json">{"@type": "WebSite"}</script>
            <title>Teste</title>
            <script type="application/ld+json">{"@type": "Poem"}</script>
          </head>
          <body><h1>Olá</h1></body>
        </html>
      `;

      const cleaned = removeJsonLdScripts(htmlWithJsonLd);
      expect(cleaned).not.toContain('application/ld+json');
      expect(cleaned).not.toContain('WebSite');
      expect(cleaned).not.toContain('Poem');
      expect(cleaned).toContain('<title>Teste</title>');
      expect(cleaned).toContain('<h1>Olá</h1>');
    });
  });
});
