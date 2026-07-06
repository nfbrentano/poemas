const CACHE_NAME = 'poemas-cache-v13';
const ASSETS = [
  '/poemas/',
  '/poemas/index.html',
  '/poemas/offline.html',
  '/poemas/manifest.json',
  '/poemas/icons/icon-192x192.png',
  '/poemas/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Navigation fallback: serve index.html for all navigation requests (SPA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/poemas/index.html', responseClone);
            });
            return response;
          }
          // If 404 or other error on navigation, fallback to cached index.html
          return caches.match('/poemas/index.html') || response;
        })
        .catch(() => {
          // If network fails entirely (offline), serve from cache
          // If the page was previously cached, use it, otherwise show offline page
          return caches.match(event.request)
            .then(response => response || caches.match('/poemas/offline.html'));
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
          console.error('[SW] Fetch failed for:', event.request.url, err);
        }
        // Return a generic error response only if it's not a navigation request 
        // (navigation requests are already handled above)
        return new Response('Network error or connection lost', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      });
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
