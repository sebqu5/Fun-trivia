const CACHE_NAME = 'FunTrivia-cache-v1';
const urlsToCache = [
  './',                          // index.html
  './Build/FunTriviaBuild.loader',       // Unity loader
  './Build/FunTriviaBuild.data',        // Unity data file
  './Build/FunTriviaBuild.wasm',        // Unity wasm file
  './Build/FunTriviaBuild.framework.js',// Unity framework
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});