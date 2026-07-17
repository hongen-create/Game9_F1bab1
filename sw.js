const CACHE_NAME = 'game-map-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './map.png',
  './badge1.png',
  './badge2.png',
  './badge3.png',
  './badge4.png',
  './badge5.png',
  './badge6.png',
  './badge7.png',
  './badge8.png',
  './badge9.png',
  './level1.html',
  './level2.html',
  './level3.html',
  './level4.html',
  './level5.html',
  './level6.html',
  './level7.html',
  './level8.html',
  './level9.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Event - Caches essential files resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Promise.allSettled to ensure installation completes even if some level pages are missing
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
             console.warn(`Asset bypass failed for cache registration: ${url}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Safely cleans up stale legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return local assets instantly, then update cache silently in the background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Offline background fetch fail bypass */});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      }).catch(() => {
        // Offline recovery handler can be loaded here
      });
    })
  );
});