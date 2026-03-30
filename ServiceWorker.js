const BASE_PATH = "/Fun-trivia/";
const VERSION_FILE = BASE_PATH + "Build/FunTriviaBuild.loader.js";

// Files to precache
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

/* Generate cache version from loader.js content */
async function getBuildVersion() {
    const response = await fetch(VERSION_FILE, { cache: "no-store" });
    const text = await response.text();

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    return "funtrivia-" + hash;
}

/* INSTALL: precache Unity files */
self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const version = await getBuildVersion();
        const cache = await caches.open(version);

        for (const url of PRECACHE_URLS) {
            try {
                const response = await fetch(url, { cache: "reload" });
                await cache.put(url, response);
            } catch (err) {
                console.warn("Failed to cache:", url, err);
            }
        }

        self.skipWaiting();
    })());
});

/* ACTIVATE: delete old caches */
self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const version = await getBuildVersion();
        const keys = await caches.keys();

        await Promise.all(
            keys.map(key => key !== version && caches.delete(key))
        );

        await self.clients.claim();
    })());
});

/* FETCH: serve all cached assets offline */
self.addEventListener("fetch", event => {

    // Safari offline navigation fix
    if (event.request.mode === "navigate") {
        event.respondWith(
            caches.match(BASE_PATH + "index.html")
                .then(response => response || fetch(event.request))
        );
        return;
    }

    // Cache-first for all precached files
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});