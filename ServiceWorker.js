const CACHE_NAME = 'funtrivia-cache-v1';
const urlsToCache = [
  '/', // root page
  '/index.html',
  '/Build/FunTriviaBuild.wasm',
  '/Build/FunTriviaBuild.data',
  '/Build/FunTriviaBuild.framework.js',
  // add StreamingAssets or icons if you use them
  '/StreamingAssets/', 
  '/icon-192.png',
  '/icon-512.png'
];

// Install event – cache all necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event – serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});