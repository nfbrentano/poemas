import { describe, it, expect } from 'vitest';
import {
  SITE_URL,
  hasFileExtension,
  ensureTrailingSlash,
  buildUrl,
  buildRelativeUrl,
  cleanCanonicalUrl
} from './url.js';

describe('url.js helper (RF01, CT03)', () => {
  describe('SITE_URL', () => {
    it('deve ter valor canônico terminando em barra', () => {
      expect(SITE_URL).toBe('https://nfgbrentano.art.br/');
    });
  });

  describe('hasFileExtension', () => {
    it('deve identificar arquivos com extensão', () => {
      expect(hasFileExtension('/feed.xml')).toBe(true);
      expect(hasFileExtension('sitemap.xml')).toBe(true);
      expect(hasFileExtension('/assets/main.js')).toBe(true);
      expect(hasFileExtension('/image.png?v=1')).toBe(true);
      expect(hasFileExtension('/style.css#main')).toBe(true);
    });

    it('não deve considerar rotas de página como arquivos', () => {
      expect(hasFileExtension('')).toBe(false);
      expect(hasFileExtension('/')).toBe(false);
      expect(hasFileExtension('/poema/277')).toBe(false);
      expect(hasFileExtension('/sobre')).toBe(false);
      expect(hasFileExtension('/colecao/amor')).toBe(false);
      expect(hasFileExtension('/sentimento/amor/')).toBe(false);
    });
  });

  describe('ensureTrailingSlash', () => {
    it('deve adicionar barra a caminhos sem barra', () => {
      expect(ensureTrailingSlash('/poema/277')).toBe('/poema/277/');
      expect(ensureTrailingSlash('https://nfgbrentano.art.br/sobre')).toBe('https://nfgbrentano.art.br/sobre/');
    });

    it('não deve duplicar barra se já existir', () => {
      expect(ensureTrailingSlash('/poema/277/')).toBe('/poema/277/');
      expect(ensureTrailingSlash('https://nfgbrentano.art.br/')).toBe('https://nfgbrentano.art.br/');
    });

    it('deve preservar query strings e hashes colocando barra no caminho', () => {
      expect(ensureTrailingSlash('/poema/277?ref=social')).toBe('/poema/277/?ref=social');
      expect(ensureTrailingSlash('/sobre#autor')).toBe('/sobre/#autor');
      expect(ensureTrailingSlash('/colecoes?sort=alpha#top')).toBe('/colecoes/?sort=alpha#top');
    });

    it('não deve adicionar barra em URLs de arquivo/asset', () => {
      expect(ensureTrailingSlash('/feed.xml')).toBe('/feed.xml');
      expect(ensureTrailingSlash('https://nfgbrentano.art.br/sitemap.xml')).toBe('https://nfgbrentano.art.br/sitemap.xml');
      expect(ensureTrailingSlash('/og/poema/277.png')).toBe('/og/poema/277.png');
    });
  });

  describe('buildUrl (CT03)', () => {
    it('buildUrl(\'poema/x\') deve retornar https://nfgbrentano.art.br/poema/x/', () => {
      expect(buildUrl('poema/x')).toBe('https://nfgbrentano.art.br/poema/x/');
    });

    it('buildUrl(\'/poema/x/\') deve retornar https://nfgbrentano.art.br/poema/x/', () => {
      expect(buildUrl('/poema/x/')).toBe('https://nfgbrentano.art.br/poema/x/');
    });

    it('buildUrl(\'\') deve retornar a home com barra', () => {
      expect(buildUrl('')).toBe('https://nfgbrentano.art.br/');
    });

    it('buildUrl(\'/\') deve retornar a home com barra', () => {
      expect(buildUrl('/')).toBe('https://nfgbrentano.art.br/');
    });

    it('buildUrl com rota estática deve retornar com barra final', () => {
      expect(buildUrl('sobre')).toBe('https://nfgbrentano.art.br/sobre/');
      expect(buildUrl('/colecoes')).toBe('https://nfgbrentano.art.br/colecoes/');
      expect(buildUrl('/sentimentos/')).toBe('https://nfgbrentano.art.br/sentimentos/');
    });

    it('buildUrl com URL já absoluta deve garantir barra final', () => {
      expect(buildUrl('https://nfgbrentano.art.br/poema/meu-slug')).toBe('https://nfgbrentano.art.br/poema/meu-slug/');
    });

    it('buildUrl com arquivo não deve adicionar barra', () => {
      expect(buildUrl('feed.xml')).toBe('https://nfgbrentano.art.br/feed.xml');
    });
  });

  describe('buildRelativeUrl', () => {
    it('deve gerar URLs relativas com barra final', () => {
      expect(buildRelativeUrl('poema/277')).toBe('/poema/277/');
      expect(buildRelativeUrl('/poema/277/')).toBe('/poema/277/');
      expect(buildRelativeUrl('sobre')).toBe('/sobre/');
      expect(buildRelativeUrl('/colecoes')).toBe('/colecoes/');
      expect(buildRelativeUrl('')).toBe('/');
      expect(buildRelativeUrl('/')).toBe('/');
    });

    it('deve suportar baseUrl customizada', () => {
      expect(buildRelativeUrl('poema/277', '/site/')).toBe('/site/poema/277/');
    });
  });

  describe('cleanCanonicalUrl (RF05, CT05)', () => {
    it('deve remover query string e hash mantendo barra final', () => {
      expect(cleanCanonicalUrl('/?tags=amor')).toBe('https://nfgbrentano.art.br/');
      expect(cleanCanonicalUrl('/poema/277?ref=tw#quote')).toBe('https://nfgbrentano.art.br/poema/277/');
      expect(cleanCanonicalUrl('https://nfgbrentano.art.br/sobre?busca=1#autor')).toBe('https://nfgbrentano.art.br/sobre/');
    });

    it('deve lidar com valores vazios ou default', () => {
      expect(cleanCanonicalUrl('')).toBe('https://nfgbrentano.art.br/');
      expect(cleanCanonicalUrl('/')).toBe('https://nfgbrentano.art.br/');
    });
  });
});
