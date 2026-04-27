const CACHE_NAME = 'poemas-cache-v8';
const ASSETS = [
  '/poemas/',
  '/poemas/index.html',
  '/poemas/manifest.json',
  '/poemas/icons/icon-192x192.png',
  '/poemas/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Become available to all pages immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Navigation fallback: serve index.html for all navigation requests (SPA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, cache the new version of index.html
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/poemas/index.html', responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match('/poemas/index.html');
        })
    );
    return;
  }

  // Skip cross-origin API requests (analytics, supabase, emailjs)
  // Let the browser handle these directly to avoid CORS/SW interaction issues
  if (!event.request.url.startsWith(self.location.origin)) {
    if (event.request.url.includes('supabase.co') || 
        event.request.url.includes('api.emailjs.com') ||
        event.request.url.includes('ipwho.is') ||
        event.request.url.includes('freeipapi.com')) {
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache new poems dynamically only if successful (200 OK)
        if (fetchResponse.status === 200 && event.request.url.includes('/poema/')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      }).catch((err) => {
        // Fail gracefully on network errors
        if (event.request.destination !== 'image') {
          console.warn('[SW] Fetch failed for:', event.request.url);
        }
        // Return a generic error response to avoid "Failed to convert value to 'Response'"
        return new Response('Network error occurred', { status: 408, statusText: 'Network Error' });
      });
    })
  );
});
