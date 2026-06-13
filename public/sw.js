/* Fik Conciergerie — service worker. Bump CACHE version to invalidate. */
const CACHE = 'fik-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE = ['/offline.html', '/manifest.json', '/logo.png', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // ne touche pas aux API externes (supabase, backend)

  // Admin + API : JAMAIS de cache (toujours frais, données sensibles)
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return; // laisse le navigateur gérer (réseau direct)
  }

  // Pages HTML : réseau d'abord, cache/offline en secours
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // JS/CSS (_next) : RÉSEAU d'abord (sinon une nouvelle version ne charge jamais), cache en secours offline
  if (/\/_next\/.*\.(?:js|css)$/.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Images / polices : cache d'abord (statique, sûr)
  if (/\.(?:png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        }).catch(() => cached)
      )
    );
  }
});
