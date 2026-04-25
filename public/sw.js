const CACHE_NAME = 'poemas-cache-v1';
const ASSETS = [
  '/poemas/',
  '/poemas/index.html',
  '/poemas/manifest.json',
  '/poemas/icons/icon-192x192.png',
  '/poemas/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache new poems dynamically only if successful
        if (fetchResponse.status === 200 && event.request.url.includes('/poema/')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    })
  );
});
