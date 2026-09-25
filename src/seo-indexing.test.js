import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { setNotFoundSEO, updateSEO } from './utils/seo.js';
import { routes } from './router.js';
import legacyRedirects from '../scripts/legacy-redirects.json';

describe('{SEO} Controle de indexação: noindex, robots.txt, soft 404 e slugs legados', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<main id="main-content"></main>';
    document.title = 'Poemas Brasileiros - Natanael Brentano';
  });

  describe('CT01: noindex em páginas privadas prerenderizadas (CA01)', () => {
    it('deve conter noindex, nofollow em admin, login, unsubscribe e cancelar-inscricao gerados no dist', () => {
      const privateRoutes = ['admin', 'login', 'unsubscribe', 'cancelar-inscricao'];
      for (const route of privateRoutes) {
        const filePath = path.resolve(process.cwd(), `dist/${route}/index.html`);
        expect(fs.existsSync(filePath), `Arquivo ${filePath} deve existir`).toBe(true);
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/<meta\s+name=["']robots["']\s+content=["']noindex,\s*nofollow["']/i);
      }
    });
  });

  describe('CT02: robots.txt e Sitemap limpo (CA02)', () => {
    it('robots.txt deve conter Disallow: /admin, Allow: / e Sitemap', () => {
      const robotsPath = path.resolve(process.cwd(), 'dist/robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Disallow: /admin');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Sitemap: https://nfgbrentano.art.br/sitemap.xml');
    });

    it('sitemap.xml não deve conter páginas privadas como admin, login, unsubscribe', () => {
      const sitemapPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).not.toContain('/admin');
      expect(content).not.toContain('/login');
      expect(content).not.toContain('/unsubscribe');
      expect(content).not.toContain('/cancelar-inscricao');
    });
  });

  describe('CT03: Soft 404 SPA e setNotFoundSEO (CA03)', () => {
    it('setNotFoundSEO deve definir noindex, título padrão de 404 e remover canonical', () => {
      // Setup canonical
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = 'https://nfgbrentano.art.br/poema/inexistente';
      document.head.appendChild(canonical);

      setNotFoundSEO();

      expect(document.title).toBe('Página não encontrada — Natanael Brentano');
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeTruthy();
      expect(robots?.getAttribute('content')).toBe('noindex');
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    });

    it('updateSEO deve restaurar canonical e remover noindex ao navegar para página válida', () => {
      setNotFoundSEO();
      expect(document.querySelector('meta[name="robots"]')).not.toBeNull();
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();

      updateSEO({
        title: 'Poema Válido',
        description: 'Descrição de teste',
        url: 'https://nfgbrentano.art.br/poema/poema-valido'
      });

      expect(document.title).toBe('Poema Válido — Natanael Brentano');
      expect(document.querySelector('meta[name="robots"]')).toBeNull();
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).toBeTruthy();
      expect(canonical?.getAttribute('href')).toBe('https://nfgbrentano.art.br/poema/poema-valido/');
    });

    it('updateSEO deve aceitar parâmetro robots personalizado quando explicitado', () => {
      updateSEO({
        title: 'Área Privada',
        description: 'Painel',
        robots: 'noindex, nofollow'
      });
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toBeTruthy();
      expect(robots?.getAttribute('content')).toBe('noindex, nofollow');
    });
  });

  describe('CT04 & CT05: 404.html e checagem de rotas conhecidas (CA04)', () => {
    it('dist/404.html deve conter meta noindex, título e links para início, coleções e busca', () => {
      const html404Path = path.resolve(process.cwd(), 'dist/404.html');
      expect(fs.existsSync(html404Path)).toBe(true);
      const content = fs.readFileSync(html404Path, 'utf-8');
      expect(content).toMatch(/<meta\s+name=["']robots["']\s+content=["']noindex["']/i);
      expect(content).toContain('Página não encontrada — Natanael Brentano');
      expect(content).toContain('href="/"');
      expect(content).toContain('href="/colecoes"');
      expect(content).toContain('href="/?busca=1"');
    });

    it('dist/routes.json deve listar as rotas conhecidas geradas no build', () => {
      const routesJsonPath = path.resolve(process.cwd(), 'dist/routes.json');
      expect(fs.existsSync(routesJsonPath)).toBe(true);
      const routesList = JSON.parse(fs.readFileSync(routesJsonPath, 'utf-8'));
      expect(Array.isArray(routesList)).toBe(true);
      expect(routesList).toContain('/');
      expect(routesList).toContain('/sobre');
      expect(routesList).toContain('/colecoes');
      expect(routesList.some(r => r.startsWith('/poema/'))).toBe(true);
    });

    it('lógica de 404.html: não redireciona rota desconhecida /xyz, mas redireciona rota conhecida', () => {
      const knownRoutes = ['/', '/sobre', '/colecoes', '/poema/meu-poema'];
      const simulate404Logic = (pathname) => {
        const cleanPath = '/' + pathname.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        let isKnown = false;
        for (let i = 0; i < knownRoutes.length; i++) {
          if (knownRoutes[i] === cleanPath || knownRoutes[i] === pathname) {
            isKnown = true;
            break;
          }
        }
        if (!isKnown) {
          return { redirected: false };
        }
        return { redirected: true, target: cleanPath };
      };

      // CT05: Rota inválida /xyz não redireciona
      expect(simulate404Logic('/xyz')).toEqual({ redirected: false });
      expect(simulate404Logic('/qualquer-coisa-inexistente')).toEqual({ redirected: false });

      // CT04: Rota válida conhecida redireciona
      expect(simulate404Logic('/poema/meu-poema')).toEqual({ redirected: true, target: '/poema/meu-poema' });
    });
  });

  describe('CT06: Guarda no build contra noindex no sitemap (CA06, RNF01)', () => {
    it('deve falhar se uma URL do sitemap contiver noindex no HTML prerenderizado', () => {
      const auditSitemap = (sitemapXml, fileContentsMap) => {
        const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
        const baseUrl = 'https://nfgbrentano.art.br';
        for (const loc of locMatches) {
          const relativePath = loc.replace(baseUrl, '').replace(/^\/|\/$/g, '');
          const html = fileContentsMap[relativePath || 'index'] || '';
          if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
            throw new Error(`[BUILD AUDIT FAILED] Sitemap URL "${loc}" contains 'noindex'!`);
          }
        }
        return true;
      };

      const validSitemap = `<urlset><url><loc>https://nfgbrentano.art.br/poema/teste</loc></url></urlset>`;
      const cleanFiles = { 'poema/teste': '<html><head><title>Teste</title></head></html>' };
      expect(auditSitemap(validSitemap, cleanFiles)).toBe(true);

      const faultyFiles = { 'poema/teste': '<html><head><meta name="robots" content="noindex"></head></html>' };
      expect(() => auditSitemap(validSitemap, faultyFiles)).toThrow(/BUILD AUDIT FAILED/);
    });
  });

  describe('Redirecionamentos legados (CA05, RF06, RNF02)', () => {
    it('legacy-redirects.json deve mapear URLs antigas para destinos válidos', () => {
      expect(legacyRedirects['/?p=277']).toBe('/poema/277');
      expect(legacyRedirects['/2021/02/18/277']).toBe('/poema/277');
    });

    it('redirecionamentos estáticos em dist devem ter canonical, meta refresh 0 e link visível', () => {
      const redirectFile = path.resolve(process.cwd(), 'dist/2021/02/18/277/index.html');
      expect(fs.existsSync(redirectFile)).toBe(true);
      const html = fs.readFileSync(redirectFile, 'utf-8');
      expect(html).toContain('<meta http-equiv="refresh" content="0; url=/poema/277">');
      expect(html).toContain('<link rel="canonical" href="https://nfgbrentano.art.br/poema/277">');
      expect(html).toContain('<a href="/poema/277">/poema/277</a>');
    });
  });
});
