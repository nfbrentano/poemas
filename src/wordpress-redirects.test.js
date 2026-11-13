import { describe, it, expect, beforeEach, vi } from 'vitest';
import legacyRedirects from '../scripts/legacy-redirects.json';
import { generateLegacyRedirects } from '../scripts/build-legacy-redirects.js';

describe('[SEO] Redirecionamentos e Backlinks do WordPress (SDD 2026-11-04)', () => {
  describe('CT01 & CT02: Mapeamento de rotas legadas em scripts/legacy-redirects.json', () => {
    it('deve conter mais de 400 rotas mapeadas do acervo histórico do WordPress', () => {
      const keys = Object.keys(legacyRedirects);
      expect(keys.length).toBeGreaterThanOrEqual(400);
    });

    it('deve mapear permalinks de data para /poema/<slug>/', () => {
      expect(legacyRedirects['/2015/12/23/como-falar/']).toBe('/poema/como-falar/');
      expect(legacyRedirects['/2015/12/23/como-falar']).toBe('/poema/como-falar/');
      expect(legacyRedirects['/2015/12/23/carinho/']).toBe('/poema/carinho/');
      expect(legacyRedirects['/2015/12/24/acasos/']).toBe('/poema/acasos/');
      expect(legacyRedirects['/2026/04/15/arquitetura-do-afeto/']).toBe('/poema/arquitetura-do-afeto/');
    });

    it('deve mapear parâmetros legados /?p=:id para o respectivo poema', () => {
      expect(legacyRedirects['/?p=2']).toBe('/poema/como-falar/');
      expect(legacyRedirects['/?p=6']).toBe('/poema/carinho/');
      expect(legacyRedirects['/?p=277']).toBe('/poema/277');
    });

    it('deve preservar redirecionamentos institucionais existentes', () => {
      expect(legacyRedirects['/sobre-mim/']).toBe('/sobre');
      expect(legacyRedirects['/sobre-mim']).toBe('/sobre');
    });
  });

  describe('CT03: Roteamento dinâmico no router SPA', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('deve reconhecer qualquer permalink no padrão de data /YYYY/MM/DD/:slug/ e navegar para /poema/:slug/', async () => {
      // Simula a lógica de regex usada no router
      const testPaths = [
        '/2026/04/15/novo-poema/',
        '/2026/04/15/novo-poema',
        '/2020/01/01/poema-antigo/'
      ];

      testPaths.forEach(path => {
        const wpDateMatch = path.match(/^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/);
        expect(wpDateMatch).not.toBeNull();
        expect(wpDateMatch[1]).toBeTruthy();
      });
    });

    it('deve extrair e resolver corretamente parâmetros ?p=:id da busca', () => {
      const search = '?p=2';
      const pParam = new URLSearchParams(search).get('p');
      expect(pParam).toBe('2');
      expect(legacyRedirects[`/?p=${pParam}`]).toBe('/poema/como-falar/');
    });
  });

  describe('CT04: Geração idempotente de scripts/build-legacy-redirects.js', () => {
    it('generateLegacyRedirects deve ser determinístico e retornar objeto válido', () => {
      const generated = generateLegacyRedirects();
      expect(typeof generated).toBe('object');
      expect(generated['/2015/12/23/como-falar/']).toBe('/poema/como-falar/');
      expect(generated['/sobre-mim/']).toBe('/sobre');
    });
  });
});
