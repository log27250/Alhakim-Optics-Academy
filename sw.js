/* HAKIM OPTICS ACADEMY — cache recovery / network-first application shell */
const CACHE_NAME = 'alhakim-academy-v2-64-cache-recovery-v4';
const CORE = ['./','./index.html','./styles.css','./app.js','./clinical-cases.js','./manifest.webmanifest','./offline.html','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await Promise.all(CORE.map(async path=>{
   try{const response=await fetch(path,{cache:'reload'});if(response.ok)await cache.put(path,response)}catch(_){}
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('alhakim-academy-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
async function networkFirst(request,cache){
 try{
  const response=await fetch(request,{cache:'no-store'});
  if(response&&response.ok)await cache.put(request,response.clone());
  return response;
 }catch(_){
  return await cache.match(request)||await cache.match('./index.html')||
   new Response('Offline',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
 }
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const path=url.pathname;
  const navigation=event.request.mode==='navigate';
  const appShell=navigation||/\.(?:html?|js|css|json|webmanifest)$/i.test(path);
  if(appShell)return networkFirst(event.request,cache);
  const cached=await cache.match(event.request);
  if(cached)return cached;
  try{
   const response=await fetch(event.request);
   if(response.ok)await cache.put(event.request,response.clone());
   return response;
  }catch(_){return await cache.match('./offline.html')||new Response('Offline',{status:503})}
 })());
});
