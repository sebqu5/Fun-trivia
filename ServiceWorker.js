const CACHE_NAME = 'funtrivia-cache-v1';
const urlsToCache = [
  '/index.html',
  '/Build/FunTriviaBuild.loader.js',
  '/Build/FunTriviaBuild.framework.js',
  '/Build/FunTriviaBuild.data',
  '/Build/FunTriviaBuild.wasm',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch: serve from cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});