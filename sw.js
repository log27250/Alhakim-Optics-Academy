const CACHE_NAME = "alhakim-academy-v2";

const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/alhakim-logo.png"
];

// تثبيت التطبيق وتخزين الملفات المتاحة
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await Promise.allSettled(
          CORE_FILES.map(file =>
            cache.add(file).catch(error => {
              console.warn("File not cached:", file, error);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل النسخة الجديدة
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith("alhakim-academy-") &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// إدارة الطلبات والعمل دون إنترنت
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // صفحات التنقل
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(request, copy)
          );
          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request) ||
            await caches.match("./offline.html") ||
            await caches.match("./index.html")
          );
        })
    );
    return;
  }

  // ملف المحتوى العلمي: نفضّل النسخة الأحدث عند الاتصال
  if (url.pathname.endsWith(".json")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(request, copy)
            );
          }
          return response;
        })
        .catch(async () => {
          return await caches.match(request) ||
            Response.error();
        })
    );
    return;
  }

  // بقية الملفات: النسخة المخزنة أولاً
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(request, copy)
          );
        }
        return response;
      });
    })
  );
});
