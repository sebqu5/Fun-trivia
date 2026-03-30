const CACHE_NAME = 'funtrivia-cache-v2';

// IMPORTANT: GitHub Pages repo path
const BASE_PATH = '/Fun-trivia/';

// Files required for offline play
const CORE_ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',

  // Unity build files
  BASE_PATH + 'Build/FunTriviaBuild.loader.js',
  BASE_PATH + 'Build/FunTriviaBuild.framework.js',
  BASE_PATH + 'Build/FunTriviaBuild.data',
  BASE_PATH + 'Build/FunTriviaBuild.wasm',

  // Icons / PWA assets
  BASE_PATH + 'icon-192.png',
  BASE_PATH + 'icon-512.png'
];


/* ================================
   INSTALL
   Cache core game files
================================ */
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(
        CORE_ASSETS.map(url =>
          new Request(url, { cache: 'reload' }) // important for Unity files
        )
      );
    })
  );
});


/* ================================
   ACTIVATE
   Clean old caches + take control
================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});


/* ================================
   FETCH
================================ */
self.addEventListener('fetch', event => {

  // ---- Handle page navigation (Safari fix) ----
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(BASE_PATH + 'index.html')
        .then(response => {
          return response || fetch(event.request);
        })
    );
    return;
  }

  // ---- Cache-first strategy for assets ----
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(networkResponse => {

          // Cache new successful requests
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.method === 'GET'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }

          return networkResponse;
        })
        .catch(() => {
          // Optional: fallback if offline asset missing
          return caches.match(BASE_PATH + 'index.html');
        });
    })
  );
});