/* HAKIM OPTICS ACADEMY — lightweight offline-first application shell */
const CACHE_NAME='alhakim-academy-v28-full-offline-sync-2026-11-26';
const MEDIA_CACHE='alhakim-academy-media-v1';
const COMPLETE_KEY='./__offline_install_complete__';
const CORE=[
 './','./index.html','./styles.css','./app.js','./clinical-cases.js',
 './offline-assets.json','./manifest.webmanifest','./offline.html',
 './icon-192.png','./icon-512.png','./assets/alhakim-logo.png','./assets/founder-photo.jpg'
];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function fetchAndCache(cache,path){
 const url=new URL(path,self.registration.scope).href;
 let lastError;
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const response=await fetch(url,{cache:'reload'});
   if(!response.ok)throw new Error('HTTP '+response.status);
   await cache.put(url,response.clone());
   return true;
  }catch(error){lastError=error;if(attempt<3)await sleep(350*attempt)}
 }
 throw new Error('Offline asset unavailable: '+path+' ('+(lastError?.message||'download failed')+')');
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  // Cache only the lightweight application shell. Do not bulk-download the 692-image
  // library or every PDF during installation; media is cached on demand.
  for(const path of CORE)await fetchAndCache(cache,path);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  // CORE assets were cached successfully during install; media remains on-demand.
  const keys=await caches.keys();
  const PRESERVED_CACHES=new Set([CACHE_NAME,MEDIA_CACHE,'alhakim-academy-reference-text-v2']);
  await Promise.all(keys.filter(key=>key.startsWith('alhakim-academy-')&&!PRESERVED_CACHES.has(key)).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
async function networkFirst(request,cache){
 try{
  const response=await fetch(request,{cache:'no-store'});
  if(response&&response.ok)await cache.put(request,response.clone());
  return response;
 }catch(_){
  return await cache.match(request,{ignoreSearch:true})||await cache.match(new URL('./index.html',self.registration.scope).href)||
   new Response('Offline',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
 }
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const mediaCache=await caches.open(MEDIA_CACHE);
  const offlineMedia=await mediaCache.match(event.request);
  if(offlineMedia)return offlineMedia;
  // Cache-first app shell: once installed, reopening the app does not redownload
  // index, JavaScript, CSS, manifest, or JSON assets on every visit.
  const navigation=event.request.mode==='navigate';
  const appShell=navigation||/\.(?:html?|js|css|json|webmanifest)$/i.test(url.pathname);
  if(appShell){
   const cached=await cache.match(event.request,{ignoreSearch:true});
   if(cached)return cached;
   try{
    const response=await fetch(event.request);
    if(response.ok)await cache.put(event.request,response.clone());
    return response;
   }catch(_){
    return await cache.match(new URL('./index.html',self.registration.scope).href)||
     new Response('Offline',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
   }
  }
  const cached=await cache.match(event.request,{ignoreSearch:true});
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
