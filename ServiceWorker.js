const CACHE_NAME = 'funtrivia-cache-v3';

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

  const requestURL = new URL(event.request.url);

  // ---- Handle navigation requests (Safari offline fix) ----
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(BASE_PATH + 'index.html')
        .then(response => response || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {

      // Exact cache match
      let response = await cache.match(event.request);
      if (response) return response;

      // Unity WebGL fix:
      // match by filename because Unity uses relative paths
      const filename = requestURL.pathname.split('/').pop();
      const normalizedPath = BASE_PATH + 'Build/' + filename;

      response = await cache.match(normalizedPath);
      if (response) return response;

      // Network fallback
      try {
        const networkResponse = await fetch(event.request);

        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (err) {
        console.warn("Offline and not cached:", event.request.url);
        throw err;
      }
    })
  );
});