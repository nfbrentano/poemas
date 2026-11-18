const CACHE_NAME = 'poemas-cache-v24';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/fonts/merriweather-v33-latin-regular.woff2',
  '/fonts/cormorant-garamond-v21-latin-regular.woff2'
];

const AMBIENT_SOUND_ASSETS = [
  '/sounds/rain.mp3',
  '/sounds/fire.mp3'
];

async function warmAmbientSoundsCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      AMBIENT_SOUND_ASSETS.map(async (soundUrl) => {
        try {
          const existing = await cache.match(soundUrl);
          if (existing) return;
          const res = await fetch(soundUrl);
          if (res && res.status === 200) {
            await cache.put(soundUrl, res.clone());
          }
        } catch (err) {
          console.warn('[SW] Failed to pre-warm ambient sound:', soundUrl, err);
        }
      })
    );
  } catch (err) {
    console.warn('[SW] Unable to warm ambient sounds cache:', err);
  }
}

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

  // Skip cross-origin API requests (clarity, emailjs, etc.)
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHtmlPage = event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    acceptHeader.includes('text/html') ||
    (!requestUrl.pathname.includes('.') && !requestUrl.pathname.startsWith('/api'));

  // 1. Navigation requests & HTML pages - Network First strategy
  if (isHtmlPage) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then SPA index.html, then offline.html without rejecting
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html').then((cachedIndex) => {
              return cachedIndex || caches.match('/offline.html');
            });
          }).then((fallback) => {
            return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
          });
        })
    );
    return;
  }

  // 2. Static Assets (/assets/*) - Cache First strategy (Vite content-hashed files)
  if (requestUrl.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
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

  // 2b. Ambient Sound Assets (/sounds/*) - Cache First on-demand (offline support without blocking install)
  if (requestUrl.pathname.startsWith('/sounds/')) {
    event.respondWith((async () => {
      const cacheKey = requestUrl.pathname;
      const cached = (await caches.match(cacheKey)) || (await caches.match(event.request));
      if (cached) {
        return cached;
      }
      try {
        const networkResponse = await fetch(cacheKey);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(cacheKey, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        console.warn('[SW] Fetch failed for ambient sound:', event.request.url, err);
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      }
    })());
    return;
  }

  // 3. Other same-origin resources (images, icons, theme-init.js, manifest.json, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[SW] Background/fetch failed for:', event.request.url, err);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('', { status: 408, statusText: 'Request Timeout' });
      });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Natanael Fernando Gatti Brentano',
    body: 'Uma nova obra foi publicada. Venha ler.',
    url: '/'
  };

  let payload = { ...fallback };
  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed && typeof parsed === 'object') {
        payload = {
          title: parsed.title || fallback.title,
          body: parsed.body || fallback.body,
          url: parsed.url || fallback.url
        };
      } else if (typeof parsed === 'string' && parsed.trim()) {
        payload.body = parsed.trim();
      }
    } catch (_jsonErr) {
      try {
        const text = typeof event.data.text === 'function' ? event.data.text() : '';
        if (text && text.trim()) {
          payload.body = text.trim();
        }
      } catch (_textErr) {}
    }
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: payload.url }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawData = event.notification && event.notification.data;
  const targetUrl = (typeof rawData === 'string' ? rawData : rawData && rawData.url) || '/';
  const origin = (self.location && self.location.origin) || 'https://nfgbrentano.art.br';
  const normalizedTarget = new URL(targetUrl, origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === normalizedTarget && 'focus' in client) {
          return client.focus();
        }
      }
      for (const client of windowClients) {
        if (client.url && client.url.startsWith(origin) && 'navigate' in client && 'focus' in client) {
          return client.navigate(normalizedTarget).then(() => client.focus());
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event?.data && event.data.type === 'WARM_AMBIENT_SOUNDS') {
    if (typeof event.waitUntil === 'function') {
      event.waitUntil(warmAmbientSoundsCache());
    } else {
      warmAmbientSoundsCache();
    }
  }
});
