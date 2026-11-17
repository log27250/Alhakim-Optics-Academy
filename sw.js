/* HAKIM OPTICS ACADEMY — atomic offline shell + curriculum illustrations */
const CACHE_NAME='alhakim-academy-v3-all-assets-offline-2026-11-17';
const MEDIA_CACHE='alhakim-academy-media-v1';
const COMPLETE_KEY='./__offline_install_complete__';
const CORE=[
 './','./index.html','./styles.css','./app.js','./clinical-cases.js',
 './offline-assets.json','./manifest.webmanifest','./offline.html',
 './icon-192.png','./icon-512.png','./assets/alhakim-logo.png'
];
async function fetchAndCache(cache,path){
 const url=new URL(path,self.registration.scope).href;
 const response=await fetch(url,{cache:'reload'});
 if(!response.ok)throw new Error('Offline asset unavailable: '+path+' ('+response.status+')');
 await cache.put(url,response.clone());
 return true;
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  try{
   // Do not activate a partial release. The previous cache remains untouched on failure.
   for(const path of CORE)await fetchAndCache(cache,path);
   // Pre-cache every bundled academy image/diagram so lessons remain illustrated offline.
   const manifestResponse=await cache.match(new URL('./offline-assets.json',self.registration.scope).href);
   if(!manifestResponse)throw new Error('Offline asset manifest is missing');
   const manifest=await manifestResponse.json();
   const assets=Array.isArray(manifest.images)?[...new Set(manifest.images)]:[];
   let assetsCached=0;
   const assetsFailed=[];
   for(let i=0;i<assets.length;i+=4){
    const batch=await Promise.allSettled(assets.slice(i,i+4).map(path=>fetchAndCache(cache,path)));
    batch.forEach((result,index)=>{
     if(result.status==='fulfilled')assetsCached++;
     else assetsFailed.push({path:assets[i+index],error:String(result.reason?.message||result.reason||'download failed')});
    });
   }
   await cache.put(new URL(COMPLETE_KEY,self.registration.scope).href,new Response(JSON.stringify({
    version:CACHE_NAME,images:assetsCached,assets_total:assets.length,assets_cached:assetsCached,
    assets_failed:assetsFailed,assets_complete:assetsFailed.length===0,installed_at:new Date().toISOString()
   }),{headers:{'Content-Type':'application/json'}}));
   await self.skipWaiting();
  }catch(error){
   await caches.delete(CACHE_NAME);
   console.error('Atomic offline install aborted; previous version preserved.',error);
   throw error;
  }
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const marker=await cache.match(new URL(COMPLETE_KEY,self.registration.scope).href);
  if(!marker)throw new Error('Refusing to activate an incomplete offline cache');
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('alhakim-academy-')&&key!==CACHE_NAME&&key!==MEDIA_CACHE).map(key=>caches.delete(key)));
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
  const navigation=event.request.mode==='navigate';
  const appShell=navigation||/\.(?:html?|js|css|json|webmanifest)$/i.test(url.pathname);
  if(appShell)return networkFirst(event.request,cache);
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
