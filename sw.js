const CACHE_NAME='alhakim-academy-v2-1';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./offline.html','./content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json','./icons/icon-192.png','./icons/icon-512.png','./assets/alhakim-logo.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match('./offline.html')||caches.match('./index.html'))))});
