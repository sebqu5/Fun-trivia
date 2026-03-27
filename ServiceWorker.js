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

// Install service worker and cache files
self.addEventListener("install", event => {
  self.skipWaiting();
});

// Fetch files from cache first, fallback to network
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});