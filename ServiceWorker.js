const CACHE_VERSION = "funtrivia-v1.1.1";

const BASE_PATH = "/Fun-trivia/";
const CACHE_NAME = `${CACHE_VERSION}`;

/* ===============================
   FILES TO PRECACHE
================================= */

const PRECACHE_URLS = [
    BASE_PATH,
    BASE_PATH + "index.html",
    BASE_PATH + "Build/FunTriviaBuild.loader.js",
    BASE_PATH + "Build/FunTriviaBuild.framework.js",
    BASE_PATH + "Build/FunTriviaBuild.data",
    BASE_PATH + "Build/FunTriviaBuild.wasm",
    BASE_PATH + "icon-192.png",
    BASE_PATH + "icon-512.png"
];

/* ===============================
   INSTALL
================================= */

self.addEventListener("install", event => {
    event.waitUntil((async () => {

        const cache = await caches.open(CACHE_NAME);

        // Force fresh downloads (ignore HTTP cache)
        for (const url of PRECACHE_URLS) {
            try {
                const response = await fetch(url, { cache: "no-store" });
                await cache.put(url, response);
            } catch (err) {
                console.warn("Failed to cache:", url, err);
            }
        }

        // Activate immediately
        self.skipWaiting();

    })());
});

/* ===============================
   ACTIVATE
================================= */

self.addEventListener("activate", event => {
    event.waitUntil((async () => {

        const keys = await caches.keys();

        // Delete old versions
        await Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            })
        );

        await self.clients.claim();

        // Notify open tabs about update
        const clients = await self.clients.matchAll();
        clients.forEach(client =>
            client.postMessage({ type: "NEW_VERSION" })
        );

    })());
});

/* ===============================
   FETCH
================================= */

self.addEventListener("fetch", event => {

    const request = event.request;

    /* ---------- index.html ----------
       Network-first so updates appear */
    if (request.url.endsWith("index.html")) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, response.clone()));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    /* ---------- Navigation fallback (iOS fix) ---------- */
    if (request.mode === "navigate") {
        event.respondWith(
            caches.match(BASE_PATH + "index.html")
                .then(response => response || fetch(request))
        );
        return;
    }

    /* ---------- Unity files ----------
       Cache-first for performance */
    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
    );
});