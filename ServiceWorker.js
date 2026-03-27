const CACHE_NAME = 'funtrivia-cache-v1';
const urlsToCache = [
  '/', // root page
  '/index.html',
  '/Build/FunTriviaBuild.wasm',
  '/Build/FunTriviaBuild.data',
  '/Build/FunTriviaBuild.framework.js',
  '/StreamingAssets/',   // add your StreamingAssets if used
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim()); // take control immediately
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});