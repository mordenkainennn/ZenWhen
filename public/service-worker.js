const CACHE_NAME = "zenwhen-v2";
const APP_SHELL = ["/", "/manifest.json", "/icon.svg", "/icon-maskable.svg", "/offline.html"];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);
}

async function clearOldCaches() {
  const keys = await caches.keys();
  const staleKeys = keys.filter((key) => key !== CACHE_NAME);
  await Promise.all(staleKeys.map((key) => caches.delete(key)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await cacheAppShell();
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await clearOldCaches();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put("/", copy)),
          );
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("/");
          return cached || caches.match("/offline.html");
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)),
        );
        return response;
      });
    }),
  );
});
