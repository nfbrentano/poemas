import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  DEFAULT_SITE_REFERER,
  getFirebaseConfig,
  normalizeRefererUrl,
  installFirebaseNodeReferer,
  patchFirebaseAuthReferer,
  readBuildDataCache,
  writeBuildDataCache,
  clearBuildDataCache
} from '../scripts/build-data-cache.js';
import { runGenerateSitemap } from '../scripts/generate-sitemap.js';
import { runGenerateRss } from '../scripts/generate-rss.js';
import { runGenerateLlms } from '../scripts/generate-llms.js';
import poemPage from './pages/poem.js';
import { renderPoemMarkup } from './utils/poem-template.js';

vi.mock('./utils/analytics.js', () => ({
  trackPageView: vi.fn()
}));

describe('Otimização de Leituras do Firestore no Build/Testes e Referer CI (SDD 2026-11-17)', () => {
  let tempRoot;
  let originalFetch;
  let originalEnvKey;
  let originalRefererState;
  let originalWrappedFlag;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'poemas-build-cache-test-'));
    originalFetch = globalThis.fetch;
    originalEnvKey = process.env.VITE_FIREBASE_API_KEY;
    originalRefererState = globalThis.__firebaseNodeReferer;
    originalWrappedFlag = globalThis.__originalFirebaseNodeFetch;
  });

  afterEach(() => {
    poemPage.cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    globalThis.__firebaseNodeReferer = originalRefererState;
    globalThis.__originalFirebaseNodeFetch = originalWrappedFlag;
    if (originalEnvKey === undefined) {
      delete process.env.VITE_FIREBASE_API_KEY;
    } else {
      process.env.VITE_FIREBASE_API_KEY = originalEnvKey;
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
    document.body.innerHTML = '';
    const dataScript = document.getElementById('__DATA__');
    if (dataScript) dataScript.remove();
  });

  describe('CT01 & CA01: Leitura dinâmica de firebaseConfig e fallback sem Firestore', () => {
    it('getFirebaseConfig reflete alterações dinâmicas em process.env.VITE_FIREBASE_API_KEY', () => {
      process.env.VITE_FIREBASE_API_KEY = 'fake-api-key-123';
      expect(getFirebaseConfig().apiKey).toBe('fake-api-key-123');

      delete process.env.VITE_FIREBASE_API_KEY;
      expect(getFirebaseConfig().apiKey).toBeUndefined();
    });

    it('runGenerateSitemap, runGenerateRss e runGenerateLlms usam fallback local sem consultar Firestore quando apiKey é removida', async () => {
      delete process.env.VITE_FIREBASE_API_KEY;
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const outDir = path.join(tempRoot, 'dist-fallback');

      await runGenerateSitemap(outDir);
      await runGenerateRss(outDir);
      await runGenerateLlms(outDir);

      expect(fs.existsSync(path.join(outDir, 'sitemap.xml'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'feed.xml'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'llms.txt'))).toBe(true);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('CT02 & CA02: Cancelamento de timers e bloqueio de leitura diferida em poem.js', () => {
    it('cleanup() cancela timers diferidos agendados em render() e impede chamadas de rede em modo offline', async () => {
      vi.useFakeTimers();
      const origOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      try {
        const container = document.createElement('div');
        container.setAttribute('data-prerendered', '/poema/verso-teste');
        document.body.appendChild(container);

        const mockPoem = {
          id: 'p-offline-1',
          slug: 'verso-teste',
          title: 'Verso Teste',
          content: '<p>Linha única de teste.</p>',
          status: 'published',
          published_at: '2026-10-01T12:00:00Z',
          tags: ['amor']
        };
        const dataScript = document.createElement('script');
        dataScript.id = '__DATA__';
        dataScript.type = 'application/json';
        dataScript.textContent = JSON.stringify({ poem: mockPoem });
        document.body.appendChild(dataScript);
        container.innerHTML = renderPoemMarkup({ poem: mockPoem, baseUrl: '/' });

        const fetchSpy = vi.fn();
        globalThis.fetch = fetchSpy;

        await poemPage.render(container, { slug: 'verso-teste' });
        poemPage.cleanup();

        await vi.advanceTimersByTimeAsync(5000);
        expect(fetchSpy).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(navigator, 'onLine', { value: origOnLine, configurable: true });
      }
    });
  });

  describe('CT03 & CA03: Reutilização e expiração do cache compartilhado de build', () => {
    it('grava payload mesclado, lê dentro do TTL e retorna null após expiração do TTL', () => {
      const cachePath = path.join(tempRoot, 'cache.json');
      const baseTime = 1_700_000_000_000;

      // Por padrão, em Vitest sem forceEnableInTest, cache fica desativado para evitar interferência entre testes
      expect(writeBuildDataCache({ poems: [{ id: '1' }] }, { cachePath })).toBe(false);
      expect(readBuildDataCache({ cachePath })).toBeNull();

      const ok1 = writeBuildDataCache(
        {
          poems: [{ id: 'p1', slug: 'poema-cache', title: 'Poema Cache', content: 'Verso em cache', status: 'published', published_at: '2026-10-01T12:00:00Z' }],
          rawCollections: [{ id: 'c1', slug: 'amor-e-conexao', name: 'Amor e Conexão' }]
        },
        { cachePath, now: baseTime, forceEnableInTest: true }
      );
      expect(ok1).toBe(true);

      const ok2 = writeBuildDataCache(
        { mostReadPoems: [{ position: 1, id: 'p1', slug: 'poema-cache', title: 'Poema Cache' }] },
        { cachePath, now: baseTime + 1000, forceEnableInTest: true }
      );
      expect(ok2).toBe(true);

      const loaded = readBuildDataCache({ cachePath, ttlMs: 60_000, now: baseTime + 2000, forceEnableInTest: true });
      expect(loaded).not.toBeNull();
      expect(loaded.poems).toHaveLength(1);
      expect(loaded.rawCollections).toHaveLength(1);
      expect(loaded.mostReadPoems).toHaveLength(1);

      const expired = readBuildDataCache({ cachePath, ttlMs: 60_000, now: baseTime + 62_000, forceEnableInTest: true });
      expect(expired).toBeNull();

      clearBuildDataCache({ cachePath });
      expect(fs.existsSync(cachePath)).toBe(false);
    });

    it('runGenerateSitemap, runGenerateRss e runGenerateLlms reutilizam poemas do cache mesmo com apiKey presente sem acessar o Firestore', async () => {
      const cachePath = path.join(tempRoot, 'shared-build-cache.json');
      const outDir = path.join(tempRoot, 'dist-cached');
      const now = Date.now();

      process.env.VITE_FIREBASE_API_KEY = 'fake-ci-key-without-firestore-network';

      writeBuildDataCache(
        {
          poems: [
            {
              id: 'p-cached-1',
              title: 'Poema em Cache Compartilhado',
              slug: 'poema-em-cache-compartilhado',
              content: '<p>Verso compartilhado entre etapas.</p>',
              status: 'published',
              published_at: '2026-11-10T10:00:00Z',
              updated_at: '2026-11-11T10:00:00Z',
              tags: ['amor']
            }
          ],
          rawCollections: [],
          rawCollectionPoems: [],
          mostReadPoems: [
            {
              position: 1,
              id: 'p-cached-1',
              slug: 'poema-em-cache-compartilhado',
              title: 'Poema em Cache Compartilhado',
              published_at: '2026-11-10T10:00:00Z'
            }
          ]
        },
        { cachePath, now, forceEnableInTest: true }
      );

      const cacheOptions = { cachePath, now: now + 500, forceEnableInTest: true };
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runGenerateSitemap(outDir, { cacheOptions });
      await runGenerateRss(outDir, { cacheOptions });
      await runGenerateLlms(outDir, { cacheOptions });

      expect(fs.readFileSync(path.join(outDir, 'sitemap-poemas.xml'), 'utf-8')).toContain('poema-em-cache-compartilhado');
      expect(fs.readFileSync(path.join(outDir, 'feed.xml'), 'utf-8')).toContain('Poema em Cache Compartilhado');
      expect(fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf-8')).toContain('Poema em Cache Compartilhado');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('cache compartilhado'));
    });
  });

  describe('CT04 & CA04: Injeção de cabeçalho Referer em Node.js', () => {
    it('normaliza URL de referer com barra final', () => {
      expect(normalizeRefererUrl('https://nfgbrentano.art.br')).toBe('https://nfgbrentano.art.br/');
      expect(normalizeRefererUrl('https://nfgbrentano.art.br/')).toBe('https://nfgbrentano.art.br/');
      expect(normalizeRefererUrl('')).toBe(DEFAULT_SITE_REFERER);
    });

    it('installFirebaseNodeReferer injeta Referer apenas em URLs Google/Firebase sem sobrescrever referer explícito', async () => {
      const fetchCalls = [];
      const mockFetch = vi.fn(async (url, init) => {
        fetchCalls.push({ url, init });
        return { ok: true, status: 200 };
      });
      globalThis.fetch = mockFetch;

      installFirebaseNodeReferer('https://nfgbrentano.art.br');

      await globalThis.fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=abc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      await globalThis.fetch('https://southamerica-east1-poemas-natanael.cloudfunctions.net/sendNewsletter', {
        method: 'POST',
        headers: { Referer: 'https://custom.exemplo.br/' }
      });

      await globalThis.fetch('https://example.com/public-resource', {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      expect(fetchCalls).toHaveLength(3);
      expect(fetchCalls[0].init.headers.Referer).toBe('https://nfgbrentano.art.br/');
      expect(fetchCalls[0].init.headers['Content-Type']).toBe('application/json');
      expect(fetchCalls[1].init.headers.Referer).toBe('https://custom.exemplo.br/');
      expect(fetchCalls[2].init.headers.Referer).toBeUndefined();
    });

    it('patchFirebaseAuthReferer inclui Referer em _getAdditionalHeaders sem perder headers existentes', async () => {
      const fakeAuth = {
        _getAdditionalHeaders: vi.fn().mockResolvedValue({ 'X-Firebase-Client': 'node-test' })
      };

      patchFirebaseAuthReferer(fakeAuth, 'https://nfgbrentano.art.br');
      patchFirebaseAuthReferer(fakeAuth, 'https://nfgbrentano.art.br/');

      const headers = await fakeAuth._getAdditionalHeaders();
      expect(headers).toEqual({
        'X-Firebase-Client': 'node-test',
        Referer: 'https://nfgbrentano.art.br/'
      });
    });
  });
});
