/* HAKIM OPTICS ACADEMY — verified offline shell and complete image bundle */
const CACHE_NAME='alhakim-academy-v16-reference-reader-final-2026-11-20';
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
  try{
   for(const path of CORE)await fetchAndCache(cache,path);
   const manifestURL=new URL('./offline-assets.json',self.registration.scope).href;
   const manifestResponse=await cache.match(manifestURL);
   if(!manifestResponse)throw new Error('Offline asset manifest is missing');
   const manifest=await manifestResponse.json();
   const assets=Array.isArray(manifest.images)?[...new Set(manifest.images)]:[];
   if(!assets.length||Number(manifest.image_count)!==assets.length)throw new Error('Offline asset manifest is invalid');
   let assetsCached=0;
   const assetsFailed=[];
   for(let i=0;i<assets.length;i+=4){
    const batch=await Promise.allSettled(assets.slice(i,i+4).map(path=>fetchAndCache(cache,path)));
    batch.forEach((result,index)=>{
     if(result.status==='fulfilled')assetsCached++;
     else assetsFailed.push({path:assets[i+index],error:String(result.reason?.message||result.reason||'download failed')});
    });
   }
   if(assetsFailed.length||assetsCached!==assets.length){
    const sample=assetsFailed.slice(0,8).map(x=>x.path).join(', ');
    throw new Error('Offline image bundle incomplete: '+assetsCached+'/'+assets.length+' cached. '+sample);
   }
   await cache.put(new URL(COMPLETE_KEY,self.registration.scope).href,new Response(JSON.stringify({
    version:CACHE_NAME,images:assetsCached,assets_total:assets.length,assets_cached:assetsCached,
    assets_failed:[],assets_complete:true,installed_at:new Date().toISOString()
   }),{headers:{'Content-Type':'application/json'}}));
   await self.skipWaiting();
  }catch(error){
   // This cache has a unique version; never delete the currently active worker's cache.
   await caches.delete(CACHE_NAME);
   console.error('Offline install aborted; previous active version preserved.',error);
   throw error;
  }
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const markerResponse=await cache.match(new URL(COMPLETE_KEY,self.registration.scope).href);
  if(!markerResponse)throw new Error('Refusing to activate an incomplete offline cache');
  const marker=await markerResponse.json();
  if(!marker.assets_complete||marker.assets_cached!==marker.assets_total)throw new Error('Refusing to activate an incomplete image bundle');
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
