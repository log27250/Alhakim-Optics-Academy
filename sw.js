/* HAKIM OPTICS ACADEMY — complete first-install offline cache */
const CACHE_NAME='alhakim-academy-v2-67-full-offline-v1';
const CORE=[
 './','./index.html','./styles.css','./app.js','./clinical-cases.js',
 './HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json',
 './HAKIM_OPTICS_ACADEMY_CONTENT_v2.2.json',
 './offline-assets.json','./manifest.webmanifest','./offline.html',
 './icon-192.png','./icon-512.png','./assets/alhakim-logo.png'
];
async function cacheOne(cache,path){
 try{
  const url=new URL(path,self.registration.scope).href;
  const response=await fetch(url,{cache:'reload'});
  if(response.ok)await cache.put(url,response);
  return response.ok;
 }catch(_){return false}
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await Promise.all(CORE.map(path=>cacheOne(cache,path)));
  let images=[];
  try{
   const response=await fetch(new URL('./offline-assets.json',self.registration.scope),{cache:'reload'});
   if(response.ok){
    const manifest=await response.json();
    if(Array.isArray(manifest.images))images=manifest.images;
    await cache.put(new URL('./offline-assets.json',self.registration.scope).href,response.clone());
   }
  }catch(_){}
  // Download every bundled teaching illustration during the first online install.
  // Small batches avoid exhausting mobile browser connections.
  for(let i=0;i<images.length;i+=12){
   await Promise.all(images.slice(i,i+12).map(path=>cacheOne(cache,path)));
  }
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
  return await cache.match(request)||await cache.match(new URL('./index.html',self.registration.scope).href)||
   new Response('Offline',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
 }
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const navigation=event.request.mode==='navigate';
  const appShell=navigation||/\\.(?:html?|js|css|json|webmanifest)$/i.test(url.pathname);
  if(appShell)return networkFirst(event.request,cache);
  const cached=await cache.match(event.request);
  if(cached)return cached;
  try{
   const response=await fetch(event.request);
   if(response.ok)await cache.put(event.request,response.clone());
   return response;
  }catch(_){
   return await cache.match(new URL('./offline.html',self.registration.scope).href)||new Response('Offline',{status:503});
  }
 })());
});
