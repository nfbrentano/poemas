import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

vi.mock('./utils/firebase.js', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn((_db, name) => ({ name })),
  query: vi.fn((col, ...constraints) => ({ col, constraints })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  getDocs: vi.fn(async () => ({ empty: true, docs: [] }))
}));

import { AudioPlayer, AUDIO_PREF_KEYS } from './components/audio-player.js';
import {
  savePersistentPoems,
  clearPersistentPoems,
  invalidatePoemsCache,
  MAX_LOCAL_STORAGE_BYTES,
  getSerializedByteSize
} from './utils/poems-store.js';
import {
  stampServiceWorkerCacheName,
  swVersionPlugin
} from '../vite.config.js';
import { initGlobalErrorTracking, resetErrorReporterState } from './utils/error-reporter.js';

function createPlayerFixture({
  title = 'Noturno em Abril',
  hasPrev = true,
  hasNext = true,
  audioUrl = 'https://cdn.exemplo.test/narracao.mp3'
} = {}) {
  const container = document.createElement('div');
  container.innerHTML = `
    <article>
      <h1>${title}</h1>
      <div class="ambient-audio-controls">
        <button class="ambient-btn" data-sound="silence">Mudo</button>
        <button class="ambient-btn" data-sound="rain">Chuva</button>
        <button class="ambient-btn" data-sound="fire">Lareira</button>
      </div>
      <section class="poem-narration-player">
        <audio id="narration-audio" src="${audioUrl}"></audio>
        <button id="narration-speed-btn" type="button">1x</button>
        <button id="narration-mute-btn" type="button">
          <svg id="narration-vol-icon-on"></svg>
          <svg id="narration-vol-icon-off" style="display:none;"></svg>
        </button>
        <input type="range" id="narration-vol-slider" min="0" max="1" step="0.05" value="1" />
        <button id="narration-play-btn" type="button">
          <svg id="narration-play-icon"></svg>
          <svg id="narration-pause-icon" style="display:none;"></svg>
        </button>
        <span id="narration-current-time">00:00</span>
        <input type="range" id="narration-progress" min="0" max="100" value="0" step="0.1" />
        <span id="narration-duration">--:--</span>
      </section>
      <div class="poem-nav">
        ${hasPrev ? '<a id="prev-btn" href="/poema/anterior/">Anterior</a>' : ''}
        ${hasNext ? '<a id="next-btn" href="/poema/seguinte/">Próximo</a>' : ''}
      </div>
      <audio id="ambient-audio" loop></audio>
    </article>
  `;
  document.body.innerHTML = '';
  document.body.appendChild(container);
  return container;
}

function createInMemoryIndexedDb() {
  const storeData = new Map();
  return {
    storeData,
    api: {
      open: vi.fn(() => {
        const request = {
          result: {
            objectStoreNames: { contains: () => true },
            createObjectStore: vi.fn(),
            transaction: vi.fn(() => {
              const tx = {
                oncomplete: null,
                onerror: null,
                objectStore: vi.fn(() => ({
                  put: vi.fn((val, key) => {
                    storeData.set(key, val);
                    const req = { onsuccess: null, onerror: null };
                    queueMicrotask(() => {
                      req.onsuccess?.();
                      tx.oncomplete?.();
                    });
                    return req;
                  }),
                  get: vi.fn((key) => {
                    const req = { result: storeData.get(key), onsuccess: null, onerror: null };
                    queueMicrotask(() => {
                      req.onsuccess?.();
                    });
                    return req;
                  }),
                  delete: vi.fn((key) => {
                    storeData.delete(key);
                    const req = { onsuccess: null, onerror: null };
                    queueMicrotask(() => {
                      req.onsuccess?.();
                      tx.oncomplete?.();
                    });
                    return req;
                  })
                }))
              };
              return tx;
            })
          },
          onupgradeneeded: null,
          onsuccess: null,
          onerror: null,
          onblocked: null
        };
        queueMicrotask(() => {
          request.onsuccess?.({ target: request });
        });
        return request;
      })
    }
  };
}

describe('Evolução do player de áudio, MediaSession e cache offline (SDD 2026-11-13)', () => {
  let originalMediaSessionDescriptor;
  let originalMediaMetadata;
  let originalIndexedDbDescriptor;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    resetErrorReporterState();
    originalMediaSessionDescriptor = Object.getOwnPropertyDescriptor(navigator, 'mediaSession');
    originalMediaMetadata = globalThis.MediaMetadata;
    originalIndexedDbDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function pauseMock() {
      Object.defineProperty(this, 'paused', { value: true, configurable: true });
    });
  });

  afterEach(() => {
    AudioPlayer.cleanup();
    vi.restoreAllMocks();
    if (originalMediaSessionDescriptor) {
      Object.defineProperty(navigator, 'mediaSession', originalMediaSessionDescriptor);
    } else {
      delete navigator.mediaSession;
    }
    globalThis.MediaMetadata = originalMediaMetadata;
    if (originalIndexedDbDescriptor) {
      Object.defineProperty(globalThis, 'indexedDB', originalIndexedDbDescriptor);
    } else {
      delete globalThis.indexedDB;
    }
    invalidatePoemsCache();
  });

  it('CT01 & CA01: persiste velocidade, volume, mute e som ambiente entre inicializações do AudioPlayer', async () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

    const container1 = createPlayerFixture({ title: 'Poema Um' });
    AudioPlayer.init(container1, '/');

    const speedBtn1 = container1.querySelector('#narration-speed-btn');
    const volSlider1 = container1.querySelector('#narration-vol-slider');
    const rainBtn1 = container1.querySelector('.ambient-btn[data-sound="rain"]');

    // Ajusta velocidade: 1x -> 1.25x -> 1.5x
    speedBtn1.click();
    speedBtn1.click();
    expect(speedBtn1.textContent).toBe('1.5x');
    expect(localStorage.getItem(AUDIO_PREF_KEYS.playbackRate)).toBe('1.5');

    // Ajusta volume para 0.6
    volSlider1.value = '0.6';
    volSlider1.dispatchEvent(new Event('input', { bubbles: true }));
    expect(localStorage.getItem(AUDIO_PREF_KEYS.volume)).toBe('0.6');
    expect(localStorage.getItem(AUDIO_PREF_KEYS.muted)).toBe('false');

    // Ativa som ambiente "Chuva"
    rainBtn1.click();
    expect(localStorage.getItem(AUDIO_PREF_KEYS.ambientMode)).toBe('rain');
    expect(rainBtn1.classList.contains('active')).toBe(true);

    // Simula troca de rota/poema
    AudioPlayer.cleanup();
    const container2 = createPlayerFixture({ title: 'Poema Dois' });
    AudioPlayer.init(container2, '/');

    const narrationAudio2 = container2.querySelector('#narration-audio');
    const speedBtn2 = container2.querySelector('#narration-speed-btn');
    const volSlider2 = container2.querySelector('#narration-vol-slider');
    const rainBtn2 = container2.querySelector('.ambient-btn[data-sound="rain"]');

    expect(narrationAudio2.playbackRate).toBe(1.5);
    expect(speedBtn2.textContent).toBe('1.5x');
    expect(narrationAudio2.volume).toBeCloseTo(0.6, 5);
    expect(volSlider2.value).toBe('0.6');
    expect(narrationAudio2.muted).toBe(false);
    expect(rainBtn2.classList.contains('active')).toBe(true);
    expect(playSpy).toHaveBeenCalled();

    // Testa também persistência de mute
    const muteBtn2 = container2.querySelector('#narration-mute-btn');
    muteBtn2.click();
    expect(narrationAudio2.muted).toBe(true);
    expect(localStorage.getItem(AUDIO_PREF_KEYS.muted)).toBe('true');

    await Promise.resolve();
  });

  it('CT02 & CA02: trata bloqueio de autoplay (NotAllowedError) retornando UI para silêncio/pausado sem reportar erro', async () => {
    const reportSpy = vi.fn();
    initGlobalErrorTracking(window, { reportFn: reportSpy });

    // Pre-salva som ambiente ativo para tentar restaurar na troca de rota
    localStorage.setItem(AUDIO_PREF_KEYS.ambientMode, 'fire');

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() =>
      Promise.reject(new DOMException('Autoplay prevented', 'NotAllowedError'))
    );

    const container = createPlayerFixture();
    AudioPlayer.init(container, '/');

    // Aguarda microtasks da Promise rejeitada de .play()
    await new Promise(r => setTimeout(r, 15));

    const silenceBtn = container.querySelector('.ambient-btn[data-sound="silence"]');
    const fireBtn = container.querySelector('.ambient-btn[data-sound="fire"]');
    const playIcon = container.querySelector('#narration-play-icon');
    const pauseIcon = container.querySelector('#narration-pause-icon');

    expect(silenceBtn.classList.contains('active')).toBe(true);
    expect(fireBtn.classList.contains('active')).toBe(false);
    expect(reportSpy).not.toHaveBeenCalled();

    // Tenta também reproduzir narração bloqueada
    container.querySelector('#narration-play-btn').click();
    await new Promise(r => setTimeout(r, 15));
    expect(playIcon.style.display).toBe('block');
    expect(pauseIcon.style.display).toBe('none');
    expect(reportSpy).not.toHaveBeenCalled();
  });

  it('CT03 & CA03: integra navigator.mediaSession com metadados e action handlers de play/pause/seek/track', async () => {
    const handlers = {};
    const mediaSessionMock = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: vi.fn((action, fn) => {
        handlers[action] = fn;
      })
    };
    Object.defineProperty(navigator, 'mediaSession', {
      value: mediaSessionMock,
      configurable: true
    });
    globalThis.MediaMetadata = class MediaMetadata {
      constructor(init) {
        Object.assign(this, init);
      }
    };

    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function playOk() {
      Object.defineProperty(this, 'paused', { value: false, configurable: true });
      return Promise.resolve();
    });

    const onNavigateSpy = vi.fn();
    const container = createPlayerFixture({ title: 'Soneto da Bruma', hasPrev: true, hasNext: true });
    AudioPlayer.init(container, '/', {
      title: 'Soneto da Bruma',
      prevSlug: 'poema-anterior',
      nextSlug: 'poema-proximo',
      onNavigate: onNavigateSpy
    });

    const narrationAudio = container.querySelector('#narration-audio');
    Object.defineProperty(narrationAudio, 'duration', { value: 120, configurable: true });
    Object.defineProperty(narrationAudio, 'paused', { value: true, configurable: true });

    container.querySelector('#narration-play-btn').click();
    await new Promise(r => setTimeout(r, 10));

    expect(mediaSessionMock.metadata).not.toBeNull();
    expect(mediaSessionMock.metadata.title).toBe('Soneto da Bruma');
    expect(mediaSessionMock.metadata.artist).toBe('Natanael Fernando Gatti Brentano');
    expect(mediaSessionMock.metadata.album).toBe('Poemas Brasileiros');
    expect(Array.isArray(mediaSessionMock.metadata.artwork)).toBe(true);
    expect(mediaSessionMock.playbackState).toBe('playing');

    // Testa seekto via MediaSession
    handlers.seekto({ seekTime: 60 });
    expect(narrationAudio.currentTime).toBe(60);
    expect(container.querySelector('#narration-progress').value).toBe('50');

    // Testa pause e play via MediaSession
    handlers.pause();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();

    handlers.play();
    expect(playSpy).toHaveBeenCalledTimes(2);

    // Testa previoustrack e nexttrack
    handlers.previoustrack();
    handlers.nexttrack();
    expect(onNavigateSpy).toHaveBeenNthCalledWith(1, 'poema-anterior');
    expect(onNavigateSpy).toHaveBeenNthCalledWith(2, 'poema-proximo');
  });

  it('CT04 & CA04 & RNF01: Service Worker mantém install enxuto e atende /sounds/*.mp3 offline após primeira visita', async () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const swCode = fs.readFileSync(swPath, 'utf-8');

    // RNF01: MP3s não devem bloquear STATIC_ASSETS do install
    const staticMatch = swCode.match(/const STATIC_ASSETS = \[([\s\S]*?)\];/);
    expect(staticMatch).toBeTruthy();
    expect(staticMatch[1]).not.toContain('/sounds/rain.mp3');
    expect(staticMatch[1]).not.toContain('/sounds/fire.mp3');

    // Ambiente simulado de Service Worker com Cache API real em memória
    const cacheStore = new Map();
    const cacheObj = {
      addAll: vi.fn(async () => {}),
      match: vi.fn(async (req) => cacheStore.get(typeof req === 'string' ? req : req.url)),
      put: vi.fn(async (req, res) => {
        cacheStore.set(typeof req === 'string' ? req : req.url, res);
      })
    };
    const mockCaches = {
      open: vi.fn(async () => cacheObj),
      match: vi.fn(async (req) => cacheStore.get(typeof req === 'string' ? req : req.url)),
      keys: vi.fn(async () => ['poemas-cache-v24']),
      delete: vi.fn(async () => true)
    };
    const fetchMock = vi.fn(async (req) => {
      const target = typeof req === 'string' ? req : req.url;
      return new Response(`audio-bytes:${target}`, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' }
      });
    });

    const listeners = {};
    const mockSelf = {
      location: { origin: 'https://nfgbrentano.art.br' },
      registration: { showNotification: vi.fn() },
      addEventListener: (type, fn) => { listeners[type] = fn; },
      skipWaiting: vi.fn()
    };

    const runner = new Function('self', 'clients', 'caches', 'fetch', 'URL', 'Response', 'console', swCode);
    runner(mockSelf, { claim: vi.fn(), matchAll: vi.fn(async () => []) }, mockCaches, fetchMock, URL, Response, console);

    // 1. Primeira requisição online popula o cache
    let firstResponsePromise;
    listeners.fetch({
      request: {
        method: 'GET',
        url: 'https://nfgbrentano.art.br/sounds/rain.mp3',
        mode: 'no-cors',
        destination: 'audio',
        headers: { get: () => '' }
      },
      respondWith: (p) => { firstResponsePromise = p; }
    });
    const firstResp = await firstResponsePromise;
    expect(firstResp.status).toBe(200);
    expect(cacheObj.put).toHaveBeenCalled();

    // 2. Segunda requisição totalmente OFFLINE (rede rejeita) é servida do cache sem erro e sem tocar a rede
    fetchMock.mockImplementation(async () => {
      throw new Error('NetworkError: offline');
    });
    let offlineResponsePromise;
    listeners.fetch({
      request: {
        method: 'GET',
        url: 'https://nfgbrentano.art.br/sounds/rain.mp3',
        mode: 'no-cors',
        destination: 'audio',
        headers: { get: () => '' }
      },
      respondWith: (p) => { offlineResponsePromise = p; }
    });
    const offlineResp = await offlineResponsePromise;
    expect(offlineResp.status).toBe(200);
    expect(await offlineResp.text()).toBe('audio-bytes:/sounds/rain.mp3');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 3. Online novamente, mensagem WARM_AMBIENT_SOUNDS pré-aquece fire.mp3 em background
    fetchMock.mockImplementation(async (req) => {
      const target = typeof req === 'string' ? req : req.url;
      return new Response(`audio-bytes:${target}`, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' }
      });
    });
    let warmPromise;
    listeners.message({
      data: { type: 'WARM_AMBIENT_SOUNDS' },
      waitUntil: (p) => { warmPromise = p; }
    });
    await warmPromise;
    expect(cacheStore.has('/sounds/fire.mp3')).toBe(true);
  });

  it('CT05 & CA05: Vite swVersionPlugin estampa identificador único em dist/sw.js após o build', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'poemas-sw-test-'));
    try {
      const swSrc = fs.readFileSync(path.resolve(process.cwd(), 'public/sw.js'), 'utf-8');
      const swDest = path.join(tmpDir, 'sw.js');
      fs.writeFileSync(swDest, swSrc, 'utf-8');

      // Valida helper de estampa diretamente
      const stampedCustom = stampServiceWorkerCacheName(swSrc, 'abc123def0');
      expect(stampedCustom).toMatch(/const CACHE_NAME = 'poemas-cache-v\d+-abc123def0';/);

      // Valida ciclo do plugin Vite sobre um arquivo em disco
      const plugin = swVersionPlugin({ outDir: tmpDir });
      plugin.writeBundle({}, { 'assets/index-123456.js': {}, 'assets/poem-789012.js': {} });
      const version = plugin.closeBundle();

      expect(version).toMatch(/^[a-f0-9]{10}$/);
      const builtSw = fs.readFileSync(swDest, 'utf-8');
      expect(builtSw).toContain(`-${version}';`);
      expect(builtSw).not.toBe(swSrc);

      // Se dist/sw.js existir neste ambiente, confirma que também foi estampado no último build
      const realDistSw = path.resolve(process.cwd(), 'dist/sw.js');
      if (fs.existsSync(realDistSw)) {
        const realBuiltSw = fs.readFileSync(realDistSw, 'utf-8');
        expect(realBuiltSw).toMatch(/const CACHE_NAME = 'poemas-cache-v\d+-[a-f0-9]{10}';/);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('CT06 & CA06 & RNF03: guarda de tamanho envia acervo completo ao IndexedDB e restringe localStorage sem QuotaExceededError', async () => {
    const mockIdb = createInMemoryIndexedDb();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: mockIdb.api,
      configurable: true
    });

    await clearPersistentPoems();

    // Preserva chave não relacionada para confirmar ausência de corrupção
    localStorage.setItem('reader_other_setting', 'keep-intact');

    // Gera catálogo realista cuja serialização integral excede 4.2 MB (> MAX_LOCAL_STORAGE_BYTES)
    const bigBody = 'Verso extenso da memória poética em noite de chuva.\n'.repeat(1800); // ~95 KB por poema
    const largeCatalog = Array.from({ length: 48 }, (_, i) => ({
      id: `poem-${i + 1}`,
      slug: `poema-extenso-${i + 1}`,
      title: `Poema Extenso ${i + 1}`,
      excerpt: `Resumo do poema ${i + 1}`,
      content: bigBody,
      tags: ['memoria', 'noite'],
      collection_slugs: ['antologia'],
      status: 'published',
      published_at: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`
    }));

    expect(getSerializedByteSize(JSON.stringify(largeCatalog))).toBeGreaterThan(MAX_LOCAL_STORAGE_BYTES);

    const saved = await savePersistentPoems(largeCatalog);
    expect(saved).toBe(true);

    // 1. IndexedDB recebeu todos os 48 poemas com conteúdo integral
    const idbStored = mockIdb.storeData.get('published_poems');
    expect(Array.isArray(idbStored)).toBe(true);
    expect(idbStored).toHaveLength(48);
    expect(idbStored[0].content).toBe(bigBody);

    // 2. localStorage respeita estritamente <= MAX_LOCAL_STORAGE_BYTES (< 4.5 MB) com resumo válido
    const lsRaw = localStorage.getItem('poemas_offline_acervo_v1');
    expect(lsRaw).toBeTruthy();
    expect(getSerializedByteSize(lsRaw)).toBeLessThanOrEqual(MAX_LOCAL_STORAGE_BYTES);
    expect(getSerializedByteSize(lsRaw)).toBeLessThan(4.5 * 1024 * 1024);

    const parsedLs = JSON.parse(lsRaw);
    expect(parsedLs).toHaveLength(48);
    expect(parsedLs[0]._lightweight).toBe(true);
    expect(parsedLs[0].content).toBeUndefined();
    expect(localStorage.getItem('reader_other_setting')).toBe('keep-intact');

    // 3. Simula erro extremo de cota no localStorage -> não propaga QuotaExceededError nem quebra persistência
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    const safeRes = await savePersistentPoems(largeCatalog);
    expect(safeRes).toBe(true);
    localStorage.setItem = originalSetItem;
  });
});
