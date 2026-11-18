import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { defineConfig, loadEnv } from 'vite';

// Injeta <meta property="fb:app_id"> no index.html quando VITE_FB_APP_ID estiver definido.
// O prerender usa o dist/index.html como template, então todas as páginas herdam a tag.
export function fbAppIdPlugin(appId) {
  return {
    name: 'fb-app-id',
    transformIndexHtml() {
      if (!appId || !/^\d+$/.test(appId)) return [];
      return [{ tag: 'meta', attrs: { property: 'fb:app_id', content: appId }, injectTo: 'head' }];
    }
  };
}

/**
 * Estampa um sufixo de versão/hash de build em CACHE_NAME dentro do conteúdo de sw.js (RF04, CA05).
 * @param {string} swContent
 * @param {string} buildVersion
 * @returns {string}
 */
export function stampServiceWorkerCacheName(swContent, buildVersion) {
  if (typeof swContent !== 'string' || !buildVersion) return swContent;
  return swContent.replace(
    /const CACHE_NAME = '([^']+)';/,
    (_match, baseName) => {
      const cleanBase = baseName.replace(/-[a-f0-9]{8,}$/, '');
      return `const CACHE_NAME = '${cleanBase}-${buildVersion}';`;
    }
  );
}

/**
 * Gera um identificador curto único por compilação usando assets emitidos + entropia temporal.
 * @param {string} outDir
 * @param {Record<string, unknown>} [bundle]
 * @returns {string}
 */
export function computeBuildHash(outDir, bundle = {}) {
  const hash = crypto.createHash('sha256');
  const keys = Object.keys(bundle).sort();
  for (const key of keys) {
    hash.update(key);
  }
  const assetsDir = path.join(outDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir).sort();
    for (const file of files) {
      hash.update(file);
    }
  }
  hash.update(String(Date.now()));
  return hash.digest('hex').slice(0, 10);
}

/**
 * Plugin Vite que atualiza CACHE_NAME em dist/sw.js automaticamente ao final do build (RF04, CA05).
 * @param {{ outDir?: string, buildVersion?: string }} [options]
 */
export function swVersionPlugin(options = {}) {
  let outDir = options.outDir ? path.resolve(options.outDir) : path.resolve(process.cwd(), 'dist');
  let bundleFileKeys = {};

  return {
    name: 'sw-version-stamp',
    configResolved(resolvedConfig) {
      if (!options.outDir && resolvedConfig?.build?.outDir) {
        outDir = path.resolve(resolvedConfig.root || process.cwd(), resolvedConfig.build.outDir);
      }
    },
    writeBundle(_outputOptions, bundle) {
      bundleFileKeys = bundle || {};
    },
    closeBundle() {
      const swDistPath = path.join(outDir, 'sw.js');
      if (!fs.existsSync(swDistPath)) return null;
      const original = fs.readFileSync(swDistPath, 'utf-8');
      const buildVersion = options.buildVersion || computeBuildHash(outDir, bundleFileKeys);
      const stamped = stampServiceWorkerCacheName(original, buildVersion);
      if (stamped !== original) {
        fs.writeFileSync(swDistPath, stamped, 'utf-8');
      }
      return buildVersion;
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: '/',
    plugins: [
      fbAppIdPlugin(env.VITE_FB_APP_ID?.trim()),
      swVersionPlugin()
    ],
    build: {
      modulePreload: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'vendor-firebase';
            }
          }
        }
      }
    }
  };
});
