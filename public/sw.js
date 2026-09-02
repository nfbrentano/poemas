const CACHE_NAME = 'poemas-cache-v18';
const STATIC_ASSETS = [
  '/poemas/',
  '/poemas/index.html',
  '/poemas/offline.html',
  '/poemas/manifest.json',
  '/poemas/favicon.svg',
  '/poemas/icons/icon-192x192.png',
  '/poemas/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(event.request.url);
  } catch {
    return;
  }

  // Skip cross-origin API requests (supabase, clarity, emailjs, etc.)
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // 1. Navigation requests (HTML pages) - Network First strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Only fallback to cache if offline/network failure
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/poemas/index.html').then((cachedIndex) => {
              return cachedIndex || caches.match('/poemas/offline.html');
            });
          });
        })
    );
    return;
  }

  // 2. Static Assets (/poemas/assets/*) - Cache First strategy (Vite content-hashed files)
  if (requestUrl.pathname.startsWith('/poemas/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[SW] Fetch failed for asset:', event.request.url, err);
          return new Response('', { status: 408, statusText: 'Request Timeout' });
        });
      })
    );
    return;
  }

  // 3. Other same-origin resources (images, icons, theme-init.js, manifest.json, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { 
    title: 'Natanael Brentano', 
    body: 'Uma nova obra foi publicada. Venha ler.',
    url: '/poemas/'
  };
  
  const options = {
    body: data.body,
    icon: '/poemas/icons/icon-192x192.png',
    badge: '/poemas/icons/icon-192x192.png',
    data: data.url
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
