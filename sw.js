/* HAKIM OPTICS ACADEMY — network-first updates with offline fallback */
const CACHE_NAME = 'alhakim-academy-v2-22-admin-entry';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './offline.html',
  './content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/alhakim-logo.png',
  './assets/founder-photo.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (_) {
        // An unavailable optional asset must not block installation.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('alhakim-academy-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, cache) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;

    const offline = await cache.match('./offline.html');
    if (offline) return offline;
    const home = await cache.match('./index.html');
    if (home) return home;

    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const path = url.pathname;
    const isNavigation = event.request.mode === 'navigate';
    const isAppCode = /\.(?:html?|js|css)$/i.test(path);

    // Always check the network first for pages and application code.
    // This prevents an old cached app.js from hiding a published update.
    if (isNavigation || isAppCode) {
      return networkFirst(event.request, cache);
    }

    // Images, icons, and other static assets remain cache-first for speed/offline use.
    const cached = await cache.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (_) {
      const fallback = await cache.match('./offline.html');
      if (fallback) return fallback;
      return new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
