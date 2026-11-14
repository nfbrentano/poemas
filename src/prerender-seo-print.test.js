import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { renderBaseShell } from './utils/shell-template.js';
import { formatPoemForAnimation } from './utils/text-format.js';
import { getAboutFaq } from './utils/about-template.js';
import { profilePageSchema, poemSchema } from './utils/structured-data.js';
import { updateSEO } from './utils/seo.js';
import { invalidatePoemsCache } from './utils/poems-store.js';
import * as navigationModule from './utils/navigation.js';

describe('Fix Impressão e Paridade Prerender SEO (SDD 2026-11-13)', () => {
  describe('CT01 & CA01: Estilos de impressão e botão Imprimir', () => {
    it('garante que body #app não é oculto incondicionalmente em @media print', () => {
      const componentsCss = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/components.css'), 'utf-8');
      const globalCss = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');

      // Verifica que não existe regra isolada de body #app com display: none em print
      const hasUnscopedAppHide = /@media\s+print\s*\{[^}]*body\s+#app\s*\{[^}]*display:\s*none/s.test(componentsCss)
        || /@media\s+print\s*\{[^}]*body\s+#app\s*\{[^}]*display:\s*none/s.test(globalCss);

      expect(hasUnscopedAppHide).toBe(false);

      // Deve existir a regra escopada para body.is-printing-anthology #app
      expect(componentsCss).toContain('body.is-printing-anthology #app');
    });

    it('verifica que o botão #print-poem-btn e classe .btn-print estão presentes', () => {
      const poemTemplate = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/poem-template.js'), 'utf-8');
      const componentsCss = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/components.css'), 'utf-8');

      expect(poemTemplate).toContain('id="print-poem-btn"');
      expect(poemTemplate).toContain('title="Imprimir este poema');
      expect(componentsCss).toContain('.btn-print');
    });
  });

  describe('CT02 & CA02: Paridade do Shell HTML e Newsletter', () => {
    it('renderBaseShell inclui links /favoritos/ no header e no settings sheet', () => {
      const html = renderBaseShell({
        mainContentHtml: '<article>Conteúdo</article>',
        mainAttrs: '',
        baseUrl: '/'
      });

      expect(html).toContain('href="/favoritos/"');
      expect(html).toContain('global-settings-sheet');
      expect(html).toContain('🔖 Poemas Favoritos');
    });

    it('scripts/prerender.js utiliza newsletter.render() com #subscribe-form', () => {
      const prerenderJs = fs.readFileSync(path.resolve(process.cwd(), 'scripts/prerender.js'), 'utf-8');

      expect(prerenderJs).toContain('${newsletter.render()}');
      expect(prerenderJs).not.toContain('<form class="newsletter-form" action="#">');
    });
  });

  describe('CT03 & CA03: Sanitização XSS e remoção de inline handlers', () => {
    it('formatPoemForAnimation escapa tags HTML nos versos', () => {
      const malicious = '<script>alert("xss")</script>\nLinha 2';
      const formatted = formatPoemForAnimation(malicious);

      expect(formatted).not.toContain('<script>');
      expect(formatted).toContain('&lt;&#x2F;script&gt;');
    });

    it('JSON.stringify de __DATA__ em scripts/prerender.js escapa < como \\u003c', () => {
      const prerenderJs = fs.readFileSync(path.resolve(process.cwd(), 'scripts/prerender.js'), 'utf-8');

      expect(prerenderJs).toContain(".replace(/</g, '\\\\u003c')");
    });

    it('related-poem-card em poem-template.js não possui onmouseover ou onmouseout inline', () => {
      const poemTemplate = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/poem-template.js'), 'utf-8');

      expect(poemTemplate).not.toContain('onmouseover');
      expect(poemTemplate).not.toContain('onmouseout');
    });
  });

  describe('CT04 & CA04 & CA05: Metadados Open Graph e FAQ About', () => {
    it('poemSchema não utiliza o domínio antigo poemas-natanael.web.app', () => {
      const poem = {
        title: 'Poema Teste',
        slug: 'poema-teste',
        content: 'Linha um\nLinha dois',
        published_at: '2026-11-13T10:00:00Z',
        cover_image: null
      };

      const jsonLd = poemSchema(poem);
      const serialized = JSON.stringify(jsonLd);

      expect(serialized).not.toContain('poemas-natanael.web.app');
      expect(serialized).toContain('https://nfgbrentano.art.br/og/poema/poema-teste.png');
    });

    it('updateSEO define og:image:type dinamicamente de acordo com extensão', () => {
      document.head.innerHTML = '';
      updateSEO({
        title: 'Teste OG Image',
        description: 'Descrição de teste',
        url: 'https://nfgbrentano.art.br/poema/teste',
        type: 'article',
        image: 'https://nfgbrentano.art.br/og/poema/teste.png'
      });

      const ogTypeTag = document.querySelector('meta[property="og:image:type"]');
      expect(ogTypeTag).toBeTruthy();
      expect(ogTypeTag.getAttribute('content')).toBe('image/png');

      updateSEO({
        title: 'Teste OG Image JPG',
        description: 'Descrição de teste',
        url: 'https://nfgbrentano.art.br/sobre',
        type: 'website',
        image: 'https://nfgbrentano.art.br/og-default.jpg'
      });

      const ogTypeTagJpg = document.querySelector('meta[property="og:image:type"]');
      expect(ogTypeTagJpg.getAttribute('content')).toBe('image/jpeg');
    });

    it('getAboutFaq e profilePageSchema refletem coleções e avatar corretamente', () => {
      const faq = getAboutFaq({ collectionsCount: 7 });
      const serializedFaq = JSON.stringify(faq);

      expect(serializedFaq).toContain('7 coleções temáticas');

      const avatarUrl = 'https://nfgbrentano.art.br/autor.jpg';
      const schema = profilePageSchema(avatarUrl);
      const serializedSchema = JSON.stringify(schema);

      expect(serializedSchema).toContain(avatarUrl);
    });
  });

  describe('CT05 & CA06 & CA07: Limpeza de listeners e invalidação de cache', () => {
    it('search-overlay.js não possui listener de keydown duplicado para /', () => {
      const searchOverlayJs = fs.readFileSync(path.resolve(process.cwd(), 'src/components/search-overlay.js'), 'utf-8');

      // Header.js gerencia o atalho '/' para abrir o search overlay
      expect(searchOverlayJs).not.toMatch(/window\.addEventListener\(['"]keydown['"],\s*\(?e\)?\s*=>\s*\{\s*if\s*\(e\.key\s*===\s*['"]\/['"]/);
    });

    it('poem.js remove listener de selectionchange em cleanup()', () => {
      const poemJs = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/poem.js'), 'utf-8');

      expect(poemJs).toContain("document.removeEventListener('selectionchange', handleSelectionChange)");
    });

    it('invalidatePoemsCache chama invalidatePublishedSlugsCache', async () => {
      const spy = vi.spyOn(navigationModule, 'invalidatePublishedSlugsCache');
      invalidatePoemsCache();
      await new Promise(r => setTimeout(r, 50));
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('CT06 & CA08: Cache-Control em _headers', () => {
    it('public/_headers não aplica immutable a /* e preserva cache longo apenas em assets/fonts/icons', () => {
      const headersContent = fs.readFileSync(path.resolve(process.cwd(), 'public/_headers'), 'utf-8');

      // Verifica que /* usa must-revalidate ou max-age=0
      const wildcardMatch = headersContent.match(/^\/\*\s*\n\s*Cache-Control:\s*([^\n]+)/m);
      expect(wildcardMatch).toBeTruthy();
      expect(wildcardMatch[1]).not.toContain('immutable');
      expect(wildcardMatch[1]).toContain('must-revalidate');

      // Verifica que /assets/*, /fonts/* e /icons/* possuem immutable
      expect(headersContent).toMatch(/^\/assets\/\*\s*\n\s*Cache-Control:.*immutable/m);
      expect(headersContent).toMatch(/^\/fonts\/\*\s*\n\s*Cache-Control:.*immutable/m);
      expect(headersContent).toMatch(/^\/icons\/\*\s*\n\s*Cache-Control:.*immutable/m);

      // Verifica que sw.js e manifest possuem must-revalidate
      expect(headersContent).toMatch(/^\/sw\.js\s*\n\s*Cache-Control:.*must-revalidate/m);
      expect(headersContent).toMatch(/^\/manifest\.json\s*\n\s*Cache-Control:.*must-revalidate/m);
    });
  });
});
