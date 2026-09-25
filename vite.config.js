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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: '/',
    plugins: [fbAppIdPlugin(env.VITE_FB_APP_ID?.trim())],
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
