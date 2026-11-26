/* HAKIM OPTICS ACADEMY v2.1 — public browser key only; never add service_role here. */
const SUPABASE_URL='https://upmluemrhkadcffcsuzt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_k0VCQgULXGy_qnjvfyQKkjg_M9x43HVc';
const SUPABASE_ANON_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbWx1ZW1yaGthZGNmZmNzdXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5MTMzNDIsImV4cCI6MjEwOTQ4OTM0Mn0.TjDwjDgRVqTyXyFM_TSAsJMyEMcra7N7F71cVi4z4MU';
let DB=null,dataSource='local',session=null,profile=null,deferredInstallPrompt=null;
const HOME_DEFAULTS={
 logo_url:'./assets/alhakim-logo.png',
 founder_photo_url:'',
 founder_name:'د.لقمان بابكر',
 founder_title:'بكالوريوس الشرف علوم البصريات — جامعة غرب كردفان',
 topic_count:650,reference_count:30,
 welcome_title:'مرحباً بك في مستقبل البصريات!',
 welcome_subtitle:'ابدأ رحلتك التعليمية الآن.',
 hero_image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85',
 academy_card_image_url:'./assets/alhakim-logo.png',
 background_color:'#f3f6f7',primary_color:'#123c61',accent_color:'#d6b66c',
 show_founder:true,show_articles:true,show_courses:true,show_academy_card:true,
 articles:[
  {title:'أحدث تقنيات تصحيح الإبصار',image:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80',description:'مستجدات وتقنيات حديثة في رعاية البصر.'},
  {title:'تأثير الشاشات على صحة العين',image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',description:'إرشادات علمية للتعامل مع إجهاد العين الرقمي.'},
  {title:'دور تقويم البصر في التعليم',image:'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=500&q=80',description:'أهمية الرؤية الوظيفية في التعلم.'}
 ],
 featured_course_ids:[],
 quick_links:[
  {label:'الأقسام',icon:'▤',page:'departments',visible:true},
  {label:'المهارات',icon:'🩺',page:'clinical-hub',visible:true},
  {label:'المكتبة',icon:'📚',page:'library',visible:true},
  {label:'الدورات التدريبية',icon:'🎓',page:'courses',visible:true},
  {label:'تقدمي الدراسي',icon:'↗',page:'progress',visible:true}
 ]
};
let HOME_SETTINGS={...HOME_DEFAULTS},HOME_COURSES=[];
const main=document.getElementById('main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const first=(o,keys,f='')=>{for(const k of keys)if(o?.[k]!==undefined&&o[k]!==null&&o[k]!=='')return o[k];return f};
const authHeaders=()=>({apikey:SUPABASE_ANON_JWT,Authorization:`Bearer ${session?.access_token||SUPABASE_ANON_JWT}`,'Content-Type':'application/json'});
async function refreshAuthSession(){
 if(!session?.refresh_token)throw Error('انتهت جلسة الدخول. سجّل الخروج ثم ادخل مجدداً بحساب الإدارة.');
 const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||!data.access_token){session=null;profile=null;localStorage.removeItem('hakim_auth_session');syncAdminNavigation();throw Error('انتهت جلسة الدخول ولم نتمكن من تجديدها. سجّل الدخول مجدداً بحساب الإدارة.')}
 session=data;localStorage.setItem('hakim_auth_session',JSON.stringify(data));return data;
}
async function authorizedFetch(url,options={}){
 let response=await fetch(url,{...options,headers:{...(options.headers||{}),...authHeaders()}});
 if(response.status===401&&session?.refresh_token){
  await refreshAuthSession();
  response=await fetch(url,{...options,headers:{...(options.headers||{}),...authHeaders()}});
 }
 return response;
}
async function rest(table,query='select=*'){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);let r;try{r=await authorizedFetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`,{headers:authHeaders(),signal:controller.signal})}catch(e){if(controller.signal.aborted)throw Error(`${table}: انتهت مهلة الاتصال بالخادم بعد 12 ثانية.`);throw e}finally{clearTimeout(timer)}if(!r.ok){const body=await r.json().catch(()=>({}));throw Error(`${table}: ${r.status} ${body.message||body.msg||body.error_description||body.error||''}`.trim())}return r.json()}
async function optionalTable(table,query='select=*'){try{return await rest(table,query)}catch(e){console.info('Optional table unavailable:',table,e.message);return null}}
function normalizeCloud(depts,topics,lessons){
 const topicById=new Map(topics.map(t=>[String(t.id),t]));
 const topicMap=new Map();
 for(const t of topics){const k=String(t.department_id||'');if(!topicMap.has(k))topicMap.set(k,[]);topicMap.get(k).push({id:String(t.id),code:t.code,title_en:String(first(t,['title_en','title_ar','code'],'Topic')),title_ar:String(first(t,['title_ar'],'')),display_order:Number(t.display_order??0),description_en:String(t.description_en||''),description_ar:String(t.description_ar||''),is_published:t.is_published!==false})}
 const deptById=new Map(depts.map(d=>[String(d.id),d]));
 const departments=depts.map(d=>{const id=String(d.id),code=String(d.code||id);return {...d,id,code,name_en:String(first(d,['name_en'],'Untitled department')),name_ar:String(first(d,['name_ar'],'')),curriculum_topics:topicMap.get(id)||[]}});
 const mapped=lessons.map(l=>{const topic=topicById.get(String(l.topic_id||''));const dept=topic?deptById.get(String(topic.department_id||'')):null;return {...l,id:String(l.id),department_code:String(dept?.code||''),title_en:String(first(l,['title_en'],'Untitled lesson')),learning_objectives:first(l,['learning_objectives'],[]),content_en:String(first(l,['content_en'],'')),content_ar:String(first(l,['content_ar'],'')),reference_titles:first(l,['reference_titles'],[]),self_assessment:first(l,['self_assessment','questions'],[]),review_required:String(l.status||'').toLowerCase()!=='published'}});
 return{departments,lessons:mapped,reference_catalog:[],department_count:departments.length,curriculum_topic_count:topics.length};
}
async function rpc(name,args={}){if(!session?.access_token)throw Error('سجّل الدخول أولاً لتنفيذ هذه العملية.');const r=await authorizedFetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:authHeaders(),body:JSON.stringify(args)});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.message||body.details||body.hint||`فشل تنفيذ ${name} (${r.status})`);return body}
async function publicRpc(name,args={}){const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify(args)});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.message||body.details||body.hint||`فشل تحميل الأسئلة (${r.status})`);return body}

/* IndexedDB keeps the full practice-question bank available offline without exhausting localStorage. */
const OFFLINE_DB_NAME='alhakim-academy-offline';
let offlineQuestionBanks=new Map(),offlineMediaMap=new Map();
const OFFLINE_MEDIA_CACHE='alhakim-academy-media-v1';
function openOfflineDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(OFFLINE_DB_NAME,3);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('lesson_questions'))db.createObjectStore('lesson_questions',{keyPath:'lesson_id'});if(!db.objectStoreNames.contains('academy_meta'))db.createObjectStore('academy_meta',{keyPath:'key'});if(!db.objectStoreNames.contains('media_map'))db.createObjectStore('media_map',{keyPath:'source_url'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function saveOfflineQuestionBanks(records){const db=await openOfflineDB();await new Promise((resolve,reject)=>{const tx=db.transaction('lesson_questions','readwrite'),store=tx.objectStore('lesson_questions');records.forEach(x=>{store.put(x);offlineQuestionBanks.set(String(x.lesson_id),x.questions)});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});db.close()}
async function readOfflineQuestionBank(lessonId){const key=String(lessonId);if(offlineQuestionBanks.has(key))return offlineQuestionBanks.get(key);try{const db=await openOfflineDB();const value=await new Promise((resolve,reject)=>{const req=db.transaction('lesson_questions','readonly').objectStore('lesson_questions').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();if(value?.questions){offlineQuestionBanks.set(key,value.questions);return value.questions}}catch(e){console.warn('Offline question bank unavailable:',e)}return null}
function offlineMediaHash(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')+'-'+value.length.toString(16)}
async function loadOfflineMediaMap(){try{const db=await openOfflineDB();const rows=await new Promise((resolve,reject)=>{const req=db.transaction('media_map','readonly').objectStore('media_map').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)});db.close();rows.forEach(x=>offlineMediaMap.set(x.source_url,x.local_url))}catch(e){console.info('Offline image map not available:',e.message)}}
async function cacheWikimediaLessonImages(maxNewImages=Number.MAX_SAFE_INTEGER){
 if(!navigator.onLine||!window.caches||!Array.isArray(DB?.lessons)||!window.indexedDB)throw Error('لا يمكن حفظ الصور دون اتصال.');
 const urls=new Set(),add=raw=>{const v=String(raw||'').trim().replace(/^['"]|['"]$/g,'');if(!v||/^(data:|blob:|#)/i.test(v))return;try{const u=new URL(v,location.href);if(/^https?:$/.test(u.protocol)&&u.origin!==location.origin)urls.add(u.href)}catch(_){}};
 const fields=['image_url','image_urls','illustration_url','thumbnail_url','cover_image_url','featured_image_url','diagram_url'];
 const home=HOME_SETTINGS||HOME_DEFAULTS;
 [home.logo_url,home.founder_photo_url,home.hero_image_url,home.academy_card_image_url,...(home.articles||[]).map(x=>x?.image)].forEach(add);
 for(const ref of DB.reference_catalog||[])['image_url','cover_image_url','thumbnail_url','preview_image_url'].forEach(k=>add(ref?.[k]));
 for(const lesson of DB.lessons){if(!canViewLesson(lesson))continue;fields.forEach(k=>{const v=lesson[k];if(Array.isArray(v))v.forEach(add);else if(v)add(v)});
  for(const raw of [lesson.content_en,lesson.content_ar]){if(!raw)continue;const source=String(raw),doc=new DOMParser().parseFromString(source,'text/html');
   doc.querySelectorAll('img,source,image,video,[style]').forEach(n=>{for(const attr of ['src','href','xlink:href','data-src','data-original','data-lazy-src','poster'])add(n.getAttribute(attr));for(const attr of ['srcset','data-srcset'])(n.getAttribute(attr)||'').split(',').forEach(x=>add(x.trim().split(/\s+/)[0]));const style=n.getAttribute('style')||'';for(const m of style.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi))add(m[2])});
   for(const m of source.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g))add(m[1]);
   for(const m of source.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi))add(m[2]);
  }
  // Capture images and video sources injected only by the final lecture renderer.
  try{
   const rendered=renderLectureContentWithIllustration(lesson);
   const renderedDoc=new DOMParser().parseFromString(String(rendered||''),'text/html');
   renderedDoc.querySelectorAll('img,source,image,video,[style]').forEach(el=>{
    for(const attr of ['src','href','xlink:href','data-src','data-original','data-original-src','data-lazy-src','poster'])add(el.getAttribute(attr));
    for(const attr of ['srcset','data-srcset'])(el.getAttribute(attr)||'').split(',').forEach(part=>add(part.trim().split(/\s+/)[0]));
    const style=el.getAttribute('style')||'';
    for(const match of style.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi))add(match[2]);
   });
  }catch(error){console.warn('Could not inspect final lecture media during full sync:',lesson.id,error)}
 }
 // Prioritize the newly added VIS-042 through VIS-045 clinical photographs, followed by earlier clinical photographs, anatomy and perception resources.
 const pediatricPriority=[...new Set(DB.lessons.filter(l=>/^PED-/i.test(String(l.code||''))).flatMap(l=>{const found=[];for(const raw of [l.content_en,l.content_ar]){const source=String(raw||'');for(const m of source.matchAll(/!\\[[^\\]]*\\]\\(([^)\\s]+)(?:\\s+[^)]*)?\\)/g)){try{const u=new URL(m[1],location.href);if(/^https?:$/.test(u.protocol))found.push(u.href)}catch(_){}}const doc=new DOMParser().parseFromString(source,'text/html');doc.querySelectorAll('img[src],source[src],image[href],image').forEach(n=>{const rawUrl=n.getAttribute('src')||n.getAttribute('href')||n.getAttribute('xlink:href');if(rawUrl){try{const u=new URL(rawUrl,location.href);if(/^https?:$/.test(u.protocol))found.push(u.href)}catch(_){}}})}return found}))];
 const prioritySources=[...pediatricPriority,
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cavernous%20sinus.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Slit%20lamp%20view%20of%20Cataract%20in%20Human%20Eye.png?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tapetum-lucidum-001.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Spectral%20Domain%20OCT%20-%20Optic%20Disc%20Cross-Sections.png?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Auge%20Entwicklung.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/2014%20ERG%20test.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Fluorescein-Stained%20Central%20Corneal%20Epithelial%20Defect%20in%20Infective%20Keratitis.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eye%20opening%20and%20closing.gif',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Anterior-uveitis2.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Diabetic%20macular%20edema.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Goldmann%20Applanation%20Tonometer.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cherry%20red%20spot%20in%20patient%20with%20central%20retinal%20artery%20occlusion%20%28CRAO%29.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/LDHvsICG.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Vitreous%20floater.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eye%20doctor%20examining%20Nigerian%20patient%20with%20keratometer.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Imagen%20confocal%20apilada%20en%20Z%20de%20una%20c%C3%B3rnea%20montada%20entera%20de%20un%20rat%C3%B3n.png?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Endothelium%2024yo%20F%20AntSeg0239.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Pattern%20of%20lens%20fibers.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Oculomotor%20nerve.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Fluorescein%20angiography.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Horner%20syndrome.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Pupillary%20light%20reflex.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Fluorescin%20in%20dropper.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Retinal_Pigment_Epithelium_%28RPE%29_Cells.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Fundus_photograph_of_normal_right_eye.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Optic%20nerve.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Optic%20nerve%20optic%20tract%20optic%20radiation.jpg?width=960',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Extraocular%20muscles.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lens%20fibre-epithelium-capsule.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/FundusPhotoAnthaL.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Organization%20of%20rod%20photoreceptors%20in%20the%20mammalian%20retina.png?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Conjuctival%20capillary%20network.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cornea.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Human%20eye%20close%20up%2C%20anterior%20view.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/SD%20OCT%20-%20Anterior%20Chamber%20Angle%20Cross-Section%20%28with%20viewfinder%29.png?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Close-up%20Image%20of%20a%20Human%20Iris.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A1%D0%BB%D1%91%D0%B7%D0%BD%D0%B0%D1%8F%20%D0%B6%D0%B5%D0%BB%D0%B5%D0%B7%D0%B0.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Human%20eye%20with%20eyelid%20pulled%20open%2C%20anterior%20view.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Orbita%20mensch.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eye%20and%20Orbit%20of%20Human%20Embryo%20%283459323897%29.jpg?width=1000',
  'https://commons.wikimedia.org/wiki/Special:FilePath/NEI%20laboratory%20research%20eye.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eye%20examination%20visual%20acuity.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eye%20screening.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Optometry%20Testing.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eye%20test%20to%20students.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Titmus%20Randot%20Sterotests.JPG?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Optical%20illusion.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/LEA%20Contrast%20Sensitivity%20Test.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Visual%20field%20test.jpg?width=1200',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Perimeter%20Vision%20Tester.jpg?width=1100',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Rubin%27s%20Vase.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/RotatingBrentanoL.gif?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/LinearPerspective.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Spatial%20vision%20and%20perspective.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Hand%20held%20stereoscope.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lateral%20geniculate%20nucleus.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/BA17%20Primary%20visual%20cortex%20-%20medial%20view.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/BA19%20-%20Visual%20association%20cortex%20%28V3%29%20-%20lateral%20view.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Ventral%20and%20dorsal%20stream%20in%20visual%20information%20processing.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Dorsal%20and%20ventral%20attention%20systems.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/CSF8.png?width=900',
  'https://denispelli.com/pellirobson/pelli-robson.gif',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Visual%20acuity%20chart.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/3833%20flou%20stroboscopique.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/16%20KW%20Stroboscope.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Rods%20and%20Cones%20in%20Retina%20%2851175951237%29.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/ColorVision.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Diagram%20of%20the%20opponent%20process.png?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Ishihara%201.svg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Farnsworth%E2%80%93Munsell%20Hue%20Color%20Vision%20Test%2C%20Material%20and%20Finishing%20Laboratory.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Hot%20air%20balloon%20-%20color%20constancy.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Perimetry.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Humphrey%20visual%20field.JPG?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Hemianopsia%20en.jpg?width=900',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Caudal%20view%20of%20a%20brain%20after%20dissection.png?width=900',
'https://commons.wikimedia.org/wiki/Special:FilePath/Human%20eye%2C%20anterior%20view.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Daqing%20Science%20and%20Technology%20Museum%20optical%20illusion%20pillars.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Slit%20lamp%20eye%20exam.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Layers%20of%20nerve%20cells%20in%20the%20retina.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Rods%20and%20cones%20of%20the%20primate%20retina.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Rod%20Outer%20Segment%20Discs.png',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Fundus%20of%20patient%20with%20retinitis%20pigmentosa%2C%20mid%20stage.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Small%20Town%20Night%20Scene.JPG',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Slit%20lamp%20view%20of%20Cataract%20in%20Human%20Eye.png',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Visual%20acuity%20chart.jpg',
  'https://commons.wikimedia.org/wiki/Special:FilePath/TandCexample.jpg'
 ].map(x=>new URL(x,location.href).href);
 const priorityList=prioritySources.filter(x=>urls.has(x));
 const cache=await caches.open(OFFLINE_MEDIA_CACHE),db=await openOfflineDB(),failed=[],list=[...new Set([...priorityList,...urls])];let cached=0;
 let newlyDownloaded=0;for(let i=0;i<list.length&&newlyDownloaded<maxNewImages;i+=5)await Promise.allSettled(list.slice(i,i+5).map(async src=>{try{const local=new URL('./__offline_media__/'+offlineMediaHash(src),location.href).href;if(await cache.match(local)){offlineMediaMap.set(src,local);cached++;return}
  if(newlyDownloaded>=maxNewImages)return;
  let res;try{res=await fetch(src,{mode:'cors',credentials:'omit',cache:'default'})}catch(_){res=await fetch(src,{mode:'no-cors',credentials:'omit',cache:'default'})}
  if(res.type!=='opaque'&&!res.ok)throw Error('HTTP '+res.status);await cache.put(local,res.clone());offlineMediaMap.set(src,local);cached++;newlyDownloaded++;
 }catch(e){failed.push({url:src,error:e.message})}}));
 const records=[...offlineMediaMap].filter(([src,local])=>urls.has(src)).map(([source_url,local_url])=>({source_url,local_url,cached_at:new Date().toISOString()}));
 await new Promise((resolve,reject)=>{const tx=db.transaction('media_map','readwrite'),st=tx.objectStore('media_map');records.forEach(x=>st.put(x));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});db.close();
 // Rewrite every supported image source to its same-origin cached copy.
 const localize=(raw)=>{try{const source=new URL(String(raw||'').trim(),location.href).href;return offlineMediaMap.get(source)||raw}catch(_){return raw}};
 document.querySelectorAll('img[src],source[src],image[href],image[xlink\\:href]').forEach(el=>{
  for(const attr of ['src','href','xlink:href']){const raw=el.getAttribute(attr);if(raw){const local=localize(raw);if(local&&local!==raw)el.setAttribute(attr,local)}}
 });
 document.querySelectorAll('img[srcset],source[srcset]').forEach(el=>{
  const raw=el.getAttribute('srcset');if(!raw)return;
  const rewritten=raw.split(',').map(candidate=>{const parts=candidate.trim().split(/\s+/);if(!parts[0])return candidate;const local=localize(parts[0]);return [local,...parts.slice(1)].join(' ')}).join(', ');
  el.setAttribute('srcset',rewritten);
 });
 document.querySelectorAll('[style]').forEach(el=>{
  const style=el.getAttribute('style');if(!style||!style.includes('url('))return;
  el.setAttribute('style',style.replace(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi,(match,quote,url)=>{const local=localize(url);return local&&local!==url?'url('+quote+local+quote+')':match}));
 });
 return {total:list.length,cached,failed,remaining:Math.max(0,list.length-cached),complete:failed.length===0&&cached>=list.length,priority_images:priorityList.length};
}
async function saveOfflineCurriculum(value){const db=await openOfflineDB();await new Promise((resolve,reject)=>{const tx=db.transaction('academy_meta','readwrite');tx.objectStore('academy_meta').put({key:'curriculum',value,synced_at:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});db.close()}
async function readOfflineCurriculum(){try{const db=await openOfflineDB();const value=await new Promise((resolve,reject)=>{const req=db.transaction('academy_meta','readonly').objectStore('academy_meta').get('curriculum');req.onsuccess=()=>resolve(req.result?.value||null);req.onerror=()=>reject(req.error)});db.close();return value}catch(e){console.warn('IndexedDB curriculum cache unavailable:',e);return null}}
async function readFullSyncReport(){try{const db=await openOfflineDB();const row=await new Promise((resolve,reject)=>{const req=db.transaction('academy_meta','readonly').objectStore('academy_meta').get('full_sync');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();return row?.value||null}catch(e){return null}}
async function saveFullSyncReport(patch={}){const previous=await readFullSyncReport()||{};const value={...previous,...patch};const db=await openOfflineDB();await new Promise((resolve,reject)=>{const tx=db.transaction('academy_meta','readwrite');tx.objectStore('academy_meta').put({key:'full_sync',value,synced_at:value.synced_at||new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});db.close();return value}
async function refreshOfflineSyncBadge(){const box=document.getElementById('offlineSyncBadge');if(!box)return;const report=await readFullSyncReport();if(!document.getElementById('offlineSyncBadge'))return;const when=report?.synced_at?new Date(report.synced_at):null;const date=when&&!Number.isNaN(when.getTime())?when.toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}):'لم تتم المزامنة بعد';const ok=report?.complete!==false;const images=Number(report?.images_cached||0);const total=Number(report?.images_total||0);const references=Number(report?.reference_files_cached||0)+Number(report?.reference_text_cached||0);const referenceTotal=Number(report?.reference_total||0);box.innerHTML='<span class="offline-sync-dot">●</span><span><b>'+(navigator.onLine?(dataSource==='supabase'?'متصل — أحدث محتوى سحابي':'متصل — نسخة محفوظة'):'وضع عدم الاتصال')+'</b><small>آخر تحديث تمت مزامنته: '+esc(date)+' · الصور المحفوظة: '+images+(total?' / '+total:'')+' · المراجع المحفوظة: '+references+(referenceTotal?' / '+referenceTotal:'')+'</small></span><span class="offline-sync-state">'+(ok?'✓ محفوظ':'تحتاج المزامنة')+'</span><button type="button" id="refreshAcademyContent" class="secondary" style="padding:6px 10px;font-size:11px" '+(!navigator.onLine?'disabled':'')+'>تحديث المحتوى</button>';box.setAttribute('aria-label','آخر تحديث تمت مزامنته '+date);const refresh=document.getElementById('refreshAcademyContent');if(refresh)refresh.onclick=refreshAcademyContent}
async function restAll(table,query,chunkSize=1000){const rows=[];for(let offset=0;offset<100000;offset+=chunkSize){const response=await authorizedFetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`,{headers:{...authHeaders(),'Range-Unit':'items','Range':`${offset}-${offset+chunkSize-1}`}});if(!response.ok){const body=await response.json().catch(()=>({}));throw Error(`${table}: ${response.status} ${body.message||body.details||''}`)}const page=await response.json();if(!Array.isArray(page))throw Error('Invalid response for '+table);rows.push(...page);if(page.length<chunkSize)break}return rows}
async function refreshOfflineQuestionBanks(){
 if(!navigator.onLine||!Array.isArray(DB?.lessons)||!DB.lessons.length||!window.indexedDB)throw Error('لا يمكن مزامنة بنك الأسئلة دون اتصال أو دون محاضرات.');
 const ids=new Set(DB.lessons.filter(l=>!l.review_required&&String(l.status||'published')==='published').map(l=>String(l.id)));
 const [questions,options]=await Promise.all([
  restAll('questions','select=id,lesson_id,question_en,question_ar,difficulty,explanation_en,explanation_ar&is_published=eq.true&order=created_at.asc,id.asc'),
  restAll('question_options','select=id,question_id,option_en,option_ar,is_correct,display_order&order=display_order.asc')
 ]);
 const map=new Map();options.forEach(o=>{const k=String(o.question_id);if(!map.has(k))map.set(k,[]);map.get(k).push({id:String(o.id),text:String(o.option_en||''),text_ar:String(o.option_ar||''),is_correct:o.is_correct===true})});
 const byLesson=new Map();questions.forEach(q=>{const id=String(q.lesson_id||'');if(!ids.has(id))return;if(!byLesson.has(id))byLesson.set(id,[]);byLesson.get(id).push({id:String(q.id),question:String(q.question_en||''),question_ar:String(q.question_ar||''),difficulty:q.difficulty||'',explanation_en:String(q.explanation_en||''),explanation_ar:String(q.explanation_ar||''),options:map.get(String(q.id))||[]})});
 const records=[...byLesson].map(([lesson_id,qs])=>({lesson_id,questions:qs,synced_at:new Date().toISOString()}));
 await saveOfflineQuestionBanks(records);localStorage.setItem('alhakim_question_bank_sync',new Date().toISOString());
 return {questions:questions.length,lessons:records.length};
}

function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))}
const ACADEMY_ADMIN_EMAIL='alhakimoptic@gmail.com';
function currentAccountEmail(){let email=session?.user?.email||session?.email||session?.user_metadata?.email||'';if(!email){try{const saved=JSON.parse(localStorage.getItem('hakim_auth_session')||'null');email=saved?.user?.email||saved?.email||''}catch(_){}}return String(email).trim().toLowerCase()}
function isAdminAccount(){return currentAccountEmail()===ACADEMY_ADMIN_EMAIL}
function isAdmin(){return isAdminAccount()&&profile?.is_admin===true}
function canViewLesson(l){return isAdmin()||String(l?.status||'').toLowerCase()==='published'||(!l?.status&&!l?.review_required)}
function syncAdminNavigation(){syncStudentDashboardNavigation();const canEnter=isAdmin();document.querySelectorAll('[data-page="admin"]').forEach(b=>{b.hidden=!canEnter;b.setAttribute('aria-hidden',String(!canEnter))});const top=document.getElementById('adminTopButton');if(top){top.hidden=!canEnter;top.onclick=()=>{if(!isAdmin())return;showPage('admin')}}const entry=document.getElementById('homeAdminEntry');if(entry)entry.remove()}
function syncStudentDashboardNavigation(){const b=document.getElementById('studentDashboardTopButton');if(b){const visible=!!(session?.user?.id||session?.user?.email)&&!isAdmin();b.hidden=!visible;b.style.display=visible?'inline-flex':'none';b.onclick=()=>renderMyStudentPerformance();b.setAttribute('aria-hidden',String(!visible));}}
async function loadContent(){
 const empty={departments:[],lessons:[],reference_catalog:[],department_count:0,curriculum_topic_count:0};
 let local=empty, cloudError=null, topicError=null, lessonError=null;
 try{const cached=await readOfflineCurriculum();if(cached)local=cached;else{const legacy=localStorage.getItem('alhakim_content_cache');if(legacy)local=JSON.parse(legacy)||empty}await loadOfflineMediaMap()}catch(e){console.warn('Invalid local curriculum cache:',e)}
 // Supabase is the authoritative curriculum source. Offline startup uses only the last verified local cache.
 DB=local;dataSource='local';
 // Render the last verified Supabase snapshot immediately; cloud refresh must never block the first screen.
 try{renderHome();connection()}catch(renderError){console.error('Initial local academy render failed:',renderError)}
 // Offline-first: when the device has no connection, use the verified local snapshot only.
 // Do not start REST requests, reference downloads, or background media downloads.
 if(!navigator.onLine){renderHome();connection();return;}
 try{
  // Departments are the essential payload. Load them independently so a failure
  // in topics or lessons can never force the entire academy back to stale local data.
  // Fetch every page: PostgREST may cap a normal REST response at 1,000 rows.
  // A truncated response must never replace the complete offline curriculum.
  const results=await Promise.allSettled([
   restAll('departments','select=*&order=display_order.asc,code.asc'),
   restAll('topics','select=*&order=display_order.asc'),
   restAll('lessons','select=*&order=display_order.asc')
  ]);
  const d=results[0].status==='fulfilled'?results[0].value:[];
  if(results[0].status!=='fulfilled')throw Error(results[0].reason?.message||'تعذر تحميل الأقسام');
  if(!Array.isArray(d)||!d.length)throw Error('لم تصل بيانات الأقسام المنشورة من قاعدة البيانات.');
  let t=[],l=[];
  if(results[1].status==='fulfilled'&&Array.isArray(results[1].value))t=results[1].value;
  else topicError=results[1].reason?.message||'تعذر تحميل الموضوعات';
  if(results[2].status==='fulfilled'&&Array.isArray(results[2].value))l=results[2].value;
  else lessonError=results[2].reason?.message||'تعذر تحميل المحاضرات';
  // Never replace a valid offline snapshot with a partial cloud response.
  if(topicError||lessonError||!t.length||!l.length)throw Error([topicError,lessonError].filter(Boolean).join(' · ')||'المنهج السحابي وصل بصورة غير مكتملة؛ تم الاحتفاظ بالنسخة المحلية السابقة.');
  const cloud=normalizeCloud(d,t,l);
  // Replace the cached snapshot with the complete current Supabase response; do not retain deleted or obsolete local lessons.
  DB=cloud;
  dataSource='supabase';
  // Persist the complete lesson text immediately, before optional reference requests.
  // If connectivity drops while references are loading, the lectures are already offline.
  try{
   await saveOfflineCurriculum(DB);
   try{localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}
   catch(e){console.info('Curriculum stored in IndexedDB; localStorage limit reached.')}
  }catch(e){console.warn('Could not save initial offline curriculum snapshot:',e)}
  // Refresh the scientific library independently from lecture-reference links.
  // A failure in lesson_references must never hide newly added Library records.
  const [referenceResult,lessonReferenceResult]=await Promise.allSettled([
   restAll('references','select=*&order=publication_year.desc'),
   restAll('lesson_references','select=lesson_id,reference_id')
  ]);
  if(referenceResult.status==='fulfilled'&&Array.isArray(referenceResult.value)){
   const previousReferences=[...(DB.reference_catalog||[])];
   DB.reference_catalog=referenceResult.value.map(x=>({...x}));
   await purgeRemovedOfflineReferenceAssets(previousReferences,DB.reference_catalog);
  }else{
   console.warn('Scientific Library refresh failed; preserving its last verified offline copy:',referenceResult.reason);
  }
  if(lessonReferenceResult.status==='fulfilled'&&Array.isArray(lessonReferenceResult.value)){
   const refMap=new Map((DB.reference_catalog||[]).map(x=>[String(x.id),x])),byLesson=new Map();
   lessonReferenceResult.value.forEach(x=>{const ref=refMap.get(String(x.reference_id));if(ref){if(!byLesson.has(String(x.lesson_id)))byLesson.set(String(x.lesson_id),[]);byLesson.get(String(x.lesson_id)).push(ref)}});
   DB.lessons.forEach(x=>{if(byLesson.has(String(x.id)))x.reference_titles=byLesson.get(String(x.id));else delete x.reference_titles});
  }else{
   console.warn('Lesson-to-reference links refresh failed; preserving existing links:',lessonReferenceResult.reason);
  }
  await saveOfflineCurriculum(DB);
  try{localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}catch(e){console.info('Curriculum stored in IndexedDB only.')}
  let questionsSync={questions:0,lessons:0};
  try{questionsSync=await refreshOfflineQuestionBanks()}catch(questionError){console.warn('Offline question bank sync failed; media sync will continue:',questionError)}
  // Never hold the lecture interface while downloading the entire academy image library.
  // Lesson images render from their original URLs immediately; offline copies are saved in the background.
  const previousImageReport=await readFullSyncReport()||{};
  await saveFullSyncReport({...previousImageReport,departments:DB.departments.length,topics:DB.curriculum_topic_count,lessons:DB.lessons.length,references:(DB.reference_catalog||[]).length,questions:questionsSync.questions,questions_lessons:questionsSync.lessons,images_sync_status:'queued',complete:false,synced_at:new Date().toISOString()});
  refreshOfflineSyncBadge();
  // Start the full media/library download automatically after the complete cloud catalogue is saved.
  startFullOfflineSync().catch(error=>console.warn('Full offline sync will resume on the next online opening:',error));

 }catch(e){
  cloudError=e.message||String(e);
  console.error('Cloud departments load failed; using saved local curriculum:',cloudError);
 }
 renderHome();connection();
 // Large media is intentionally not downloaded in bulk. PDFs are cached when a student opens them;
 // same-origin lesson assets are cached on first use by the service worker.
 if(cloudError||topicError||lessonError){
  const details=[cloudError&&('الأقسام: '+cloudError),topicError&&('الموضوعات: '+topicError),lessonError&&('المحاضرات: '+lessonError)].filter(Boolean).join(' · ');
  const notice=document.createElement('div');
  notice.className='notice';
  notice.style.cssText='margin:16px 0;padding:12px;border:1px solid #d7a94b;border-radius:12px;direction:rtl';
  notice.innerHTML='<b>تنبيه تحميل المنهج:</b> '+esc(details)+' <button type="button" class="text-btn" id="retryCurriculum" style="margin-inline-start:10px">إعادة المحاولة</button>';
  main.prepend(notice);
  document.getElementById('retryCurriculum')?.addEventListener('click',()=>loadContent());
 }
}
async function refreshAcademyContent(){const button=document.getElementById('refreshAcademyContent');if(!navigator.onLine){if(button)button.textContent='لا يوجد اتصال';return}if(button){button.disabled=true;button.textContent='جارٍ التحديث…'}const state=document.getElementById('connectionState');if(state)state.textContent='● جارٍ جلب أحدث المحتوى';try{await loadContent();if(dataSource!=='supabase')throw Error('لم يتم جلب النسخة السحابية؛ احتفظنا بالمحتوى المحفوظ محلياً. راجع تنبيه التحميل أعلى الصفحة.');await loadHomepageSettings();applyWelcomePortalSettings();const count=DB?.lessons?.length||0;if(state)state.textContent='● تم تحديث المحتوى السحابي';const box=document.getElementById('offlineSyncBadge');if(box){const status=document.createElement('small');status.textContent='تم تحديث '+count+' محاضرة من الخادم الآن.';box.appendChild(status)}}catch(e){if(state)state.textContent='● تعذر التحديث — النسخة المحفوظة';alert(e.message||'تعذر تحديث المحتوى.')}finally{refreshOfflineSyncBadge();const b=document.getElementById('refreshAcademyContent');if(b){b.disabled=!navigator.onLine;b.textContent='تحديث المحتوى'}}}
function departmentName(code){return DB.departments.find(d=>d.code===code)?.name_en||code||'General'}
function homeButton(){return `<button class="home-return" onclick="renderHome()" aria-label="العودة للواجهة الرئيسية">⌂ <span>العودة للواجهة الرئيسية</span></button>`}
function pageShell(title,desc,body){main.innerHTML=`${homeButton()}<div class="section-heading"><div><span class="eyebrow">ALHAKIM OPTICS ACADEMY</span><h2>${esc(title)}</h2><p>${esc(desc||'')}</p></div></div>${body}`;window.scrollTo({top:0,behavior:'smooth'})}
function applyWelcomePortalSettings(){
 const s={...HOME_DEFAULTS,...HOME_SETTINGS};
 const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value??'')};
 set('portalFounderName',s.founder_name);
 set('portalFounderTitle',s.founder_title);
 const portalPhoto=document.getElementById('portalFounderPhoto');
 if(portalPhoto){portalPhoto.alt=s.founder_name||'المؤسس';portalPhoto.src=s.founder_photo_url||'./assets/founder-photo.jpg';portalPhoto.onerror=()=>{if(portalPhoto.dataset.fallback!=='1'){portalPhoto.dataset.fallback='1';portalPhoto.src='./assets/founder-photo.jpg'}else portalPhoto.hidden=true};portalPhoto.hidden=false}
 const topic=Number(s.topic_count??650),refs=Number(s.reference_count??30);
 set('portalTopicCount',(s.topic_count_prefix||'أكثر من ')+topic.toLocaleString('en-US'));
 set('portalReferenceCount',(s.reference_count_prefix||'أكثر من ')+refs.toLocaleString('en-US'));
}
async function saveOfflineHomepageSettings(settings){
 const safe={...HOME_DEFAULTS,...(settings||{})};
 const value={founder_name:safe.founder_name,founder_title:safe.founder_title,founder_photo_url:safe.founder_photo_url||'./assets/founder-photo.jpg',logo_url:safe.logo_url||'./assets/alhakim-logo.png',show_founder:safe.show_founder!==false,settings:safe,updated_at:new Date().toISOString()};
 const db=await openOfflineDB();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('academy_meta','readwrite');tx.objectStore('academy_meta').put({key:'homepage_settings',value, synced_at:value.updated_at});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}
}
async function readOfflineHomepageSettings(){
 const db=await openOfflineDB();
 try{return await new Promise((resolve,reject)=>{const req=db.transaction('academy_meta','readonly').objectStore('academy_meta').get('homepage_settings');req.onsuccess=()=>resolve(req.result?.value?.settings||req.result?.value||null);req.onerror=()=>reject(req.error)})}finally{db.close()}
}
async function loadHomepageSettings(){
 // Hydrate the last saved identity before trying the network, so the portal never starts with an empty founder profile offline.
 try{const saved=await readOfflineHomepageSettings();if(saved)HOME_SETTINGS={...HOME_DEFAULTS,...saved}}catch(e){console.info('Offline homepage identity unavailable:',e.message)}
 if(navigator.onLine){
  try{
   const rows=await rest('academy_homepage_settings','select=settings&id=eq.1');
   if(rows?.[0]?.settings){HOME_SETTINGS={...HOME_DEFAULTS,...rows[0].settings};await saveOfflineHomepageSettings(HOME_SETTINGS)}
  }catch(e){console.info('Homepage settings unavailable; using last offline copy:',e.message)}
  try{HOME_COURSES=await rest('courses','select=id,title_en,title_ar,description_en,price,currency,is_published&is_published=eq.true&order=created_at.desc')}catch(e){HOME_COURSES=[]}
 }else HOME_COURSES=[];
}
function homeImage(url,alt,cls=''){const src=localizeOfflineMediaUrl(url);return src?'<img class="'+cls+'" src="'+esc(src)+'" alt="'+esc(alt)+'" loading="eager" onerror="this.style.display=\'none\'">':''}
function founderImage(url,name){const src=url||'./assets/founder-photo.jpg';return '<img class="founder-photo" src="'+esc(src)+'" data-founder-photo alt="'+esc(name||'المؤسس')+'" loading="eager" onerror="this.onerror=null;this.src=\'./assets/founder-photo.jpg\'">'}
function renderHome(){
 document.body.classList.add('home-screen');
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));
 const s={...HOME_DEFAULTS,...HOME_SETTINGS};
 const headerLogo=document.querySelector('.topbar .brand img');if(headerLogo&&s.logo_url)headerLogo.src=s.logo_url;
 document.documentElement.style.setProperty('--home-bg',s.background_color||'#f3f6f7');
 document.documentElement.style.setProperty('--home-primary',s.primary_color||'#123c61');
 document.documentElement.style.setProperty('--home-accent',s.accent_color||'#d6b66c');
 // Preserve the Clinical Skills shortcut even when legacy homepage settings are loaded from Supabase.
 const configuredLinks=Array.isArray(s.quick_links)?s.quick_links:HOME_DEFAULTS.quick_links;
 const skillsDefault=HOME_DEFAULTS.quick_links.find(x=>x.page==='clinical-hub');
 const configuredSkills=configuredLinks.find(x=>x.page==='clinical-hub');
 const quickSource=configuredLinks.filter(x=>x.page!=='clinical-hub');
 const departmentIndex=quickSource.findIndex(x=>x.page==='departments');
 quickSource.splice(departmentIndex>=0?departmentIndex+1:1,0,{...skillsDefault,...(configuredSkills||{}),visible:true});
 const quick=quickSource.filter(x=>x.visible!==false).slice(0,5);
 main.innerHTML=`
 <div class="academy-home">
  <section class="home-top-search"><div class="home-search-title"><span>⌕</span><input id="globalSearch" placeholder="ابحث عن دورات، مصادر، أو طلب..." autocomplete="off"><button id="searchBtn" aria-label="بحث">⌕</button></div><div class="home-notices"><button aria-label="الإشعارات" title="الإشعارات">♧<i></i></button><button aria-label="حسابي" title="حسابي" onclick="showPage('accounts')">◉</button></div></section>
  <section id="offlineSyncBadge" class="offline-sync-badge" aria-live="polite"><span>●</span><span><b>حالة النسخة دون اتصال</b><small>جارٍ قراءة آخر تحديث محفوظ…</small></span></section>
  <section class="home-identity-row">
   <div class="home-founder" ${s.show_founder===false?'hidden':''}>
    ${founderImage(s.founder_photo_url,s.founder_name)}
    <div><small>المؤسس: والعضو المنتدب</small><h2>${esc(s.founder_name)}</h2><p>${esc(s.founder_title)}</p></div>
   </div>
   <nav class="home-shortcuts">${quick.map((x,i)=>`<button onclick="showPage('${esc(x.page)}')"><span class="shortcut-number">${i+1}</span><span class="shortcut-icon">${esc(x.icon||'▣')}</span><b>${esc(x.page==='library'?'المكتبة':x.label)}</b></button>`).join('')}</nav>
  </section>
  <section class="home-columns">
   <aside class="home-academy-side" ${s.show_academy_card===false?'hidden':''}>
    <h2>الأكاديمية</h2><article class="academy-brand-card">${homeImage(s.academy_card_image_url||s.logo_url,'الأكاديمية','academy-card-logo')}<b>الأكاديمية<br>للبصريات</b><div class="academy-eye-mark">◉</div></article>
   </aside>
   <div class="home-center-column">
    <section class="home-hero-banner">${homeImage(s.hero_image_url,'رحلة تعليمية في علوم البصريات','home-hero-photo')}<div class="home-hero-overlay"><h1>${esc(s.welcome_title)}</h1><p>${esc(s.welcome_subtitle)}</p><button onclick="showPage('departments')">ابدأ رحلتك التعليمية الآن ←</button></div></section>
    <section class="home-featured-courses" ${s.show_courses===false?'hidden':''}><div class="home-section-heading"><h2>الدورات المميزة</h2><button onclick="showPage('courses')">عرض الكل ←</button></div><div class="home-course-cards">${((s.featured_course_ids||[]).length?(s.featured_course_ids.map(id=>(HOME_COURSES||[]).find(c=>String(c.id)===String(id))).filter(Boolean)):(HOME_COURSES||[]).slice(0,3)).slice(0,3).map((c,i)=>`<article class="home-course-card"><div class="course-thumb course-thumb-${i+1}">${i===0?'🎓':i===1?'👁':'📚'}</div><small>دورات أكاديمية الحكيم</small><b>${esc(c.title_ar||c.title_en)}</b><p>${esc(c.description_en||'برنامج تدريبي متخصص في علوم البصريات.')}</p><button onclick="showCourse('${esc(c.id)}')">تفاصيل الدورة</button></article>`).join('')||'<div class="home-course-empty">الدورات التدريبية المميزة ستظهر هنا بعد نشرها من الإدارة.</div>'}</div></section>
   </div>
   <aside class="home-articles" ${s.show_articles===false?'hidden':''}><h2>المقالات والبحوث</h2>${(s.articles||[]).slice(0,5).map((x,i)=>`<article class="home-article">${homeImage(x.image,x.title,'')}<div><b>${esc(x.title)}</b><p>${esc(x.description||'مقال علمي من مكتبة الأكاديمية.')}</p></div></article>`).join('')}</aside>
  </section>
  <section class="home-bottom-links"><span>أكاديمية الحكيم للبصريات</span><span>معاً نحو مستقبل أفضل لعلوم البصريات</span><span>© ${new Date().getFullYear()} ALHAKIM OPTICS ACADEMY</span></section>
  <div id="searchResults" class="search-results home-search-results"></div>
 </div>`;
 const globalInput=document.getElementById('globalSearch'),globalButton=document.getElementById('searchBtn');
 if(globalButton)globalButton.onclick=()=>search(globalInput?.value,'searchResults');
 if(globalInput){globalInput.addEventListener('input',()=>search(globalInput.value,'searchResults'));globalInput.addEventListener('keydown',e=>{if(e.key==='Enter')search(globalInput.value,'searchResults')})}
 syncAdminNavigation();
 refreshOfflineSyncBadge();
 window.scrollTo({top:0,behavior:'smooth'});
}
function deptCard(d,i){return `<article class="dept-card" onclick="showDepartment('${esc(d.code)}')"><div class="dept-num">DEPARTMENT ${String(i+1).padStart(2,'0')} · ${esc(d.code)}</div><h3>${esc(d.name_en)}</h3><p>${esc(d.name_ar)}</p><small>${(d.curriculum_topics||[]).length} موضوعاً في المنهج</small></article>`}
function showPage(page){document.body.classList.remove('home-screen');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));if(page==='home'){renderHome();return}
 if(page==='departments')pageShell('الأقسام العلمية','اختر قسماً لاستعراض موضوعاته ومحاضراته.',`<div class="department-grid">${DB.departments.map(deptCard).join('')}</div>`);
 if(page==='lessons')pageShell('المحاضرات','جميع المحاضرات المنشورة في الأقسام العلمية.',`<div class="content-card">${lessonList(DB.lessons,false)}</div>`);

 if(page==='clinical-hub'&&typeof renderClinicalHub==='function')renderClinicalHub();
 if(page==='clinical-cases'&&typeof renderClinicalCases==='function')renderClinicalCases();
 if(page==='permanent')pageShell('بنك الأسئلة','اختر المحاضرة لعرض أسئلتها المنشورة من قاعدة البيانات.',`<div class="notice">الأسئلة المعروضة هي الأسئلة المنشورة المرتبطة بكل محاضرة. الإجابة والتفسير يظهران بعد اختيارك.</div><div class="content-card">${lessonList(DB.lessons,true)}</div>`);
 if(page==='library')renderLibrary();if(page==='progress')renderProgress();if(page==='courses')renderCourses();if(page==='subscriptions')renderSubscriptions();if(page==='accounts')renderAccounts();if(page==='admin')renderAdmin();}
function lessonList(lessons,quizOnly=false){lessons=(lessons||[]).filter(canViewLesson);return `<ol class="lesson-ordered-list" dir="ltr">${lessons.map((l,i)=>`<li class="lesson-list-item"><button type="button" class="lesson-row" dir="ltr" onclick="${quizOnly?`showQuiz('${esc(l.id)}')`:`showLesson('${esc(l.id)}')`}"><span class="lesson-row-number">${i+1}</span><span class="lesson-row-title"><b>${esc(l.title_en)}</b><small>${esc(departmentName(l.department_code))}</small></span><span class="lesson-row-status">${l.review_required?'Under review':'Published'}</span><span class="lesson-row-arrow" aria-hidden="true">←</span></button></li>`).join('')||'<li class="empty-lessons" dir="rtl">لا توجد محاضرات مسجلة حالياً.</li>'}</ol>`}
async function showDepartment(code){
 const d=DB.departments.find(x=>x.code===code);if(!d)return;
 const topicOrder=new Map((d.curriculum_topics||[]).slice().sort((a,b)=>Number(a.display_order??0)-Number(b.display_order??0)).map((t,i)=>[String(t.id),i]));
 const ls=DB.lessons.filter(l=>(topicOrder.has(String(l.topic_id))||l.department_code===code)&&canViewLesson(l)&&String(l.status||'').toLowerCase()==='published').slice().sort((a,b)=>{
  const ai=topicOrder.has(String(a.topic_id))?topicOrder.get(String(a.topic_id)):Number.MAX_SAFE_INTEGER;
  const bi=topicOrder.has(String(b.topic_id))?topicOrder.get(String(b.topic_id)):Number.MAX_SAFE_INTEGER;
  return ai-bi||Number(a.display_order??0)-Number(b.display_order??0)||String(a.title_en||'').localeCompare(String(b.title_en||''));
 });
 const isFinalDepartment=['REF','BV'].includes(code);
 const examCount=isFinalDepartment?100:20;
 const examPanel=session
  ? `<div class="exam-progress"><h3>الامتحان النهائي للقسم</h3><p>${isFinalDepartment?'امتحان نهائي شامل من 100 سؤال موزعة على محاضرات القسم الـ45.':'اختبار شامل من 20 سؤالاً عشوائياً.'}</p><button class="primary" onclick="startDepartmentExam('${esc(code)}')">ابدأ الامتحان · ${examCount} سؤالاً</button><small>درجة النجاح 70%. يلزم تسجيل الدخول لحفظ المحاولة والنتيجة.</small></div>`
  : `<div class="exam-progress"><h3>الامتحان النهائي للقسم</h3><p>سجّل الدخول أولاً لبدء الامتحان وحفظ نتيجتك.</p><button class="primary" onclick="showPage('accounts')">تسجيل الدخول</button></div>`;
 pageShell(d.name_en,d.name_ar,`
  <button class="home-return section-back" onclick="showPage('departments')" aria-label="العودة إلى الأقسام">▦ <span>العودة إلى الأقسام</span></button>
  <div class="content-card">
   <span class="tag">${esc(code)}</span>
   <h3>محاضرات القسم المنشورة (${ls.length})</h3>
   ${lessonList(ls,false)}
   ${examPanel}
  </div>`);
}

function searchTopic(topic,code){const normalized=String(topic||'').trim().toLowerCase();const dept=DB.departments.find(d=>d.code===code);const item=(dept?.curriculum_topics||[]).find(t=>String(t.title_en||'').trim().toLowerCase()===normalized||String(t.code||'').trim().toLowerCase()===normalized);const found=DB.lessons.filter(l=>l.department_code===code&&((item&&String(l.topic_id)===String(item.id))||String(l.title_en||'').trim().toLowerCase()===normalized));if(found.length){showLesson(found[0].id);return}pageShell(topic,'موضوع ضمن خريطة المنهج العلمي.',`<div class="content-card"><div class="notice">هذا الموضوع موجود في المنهج، لكن لا توجد محاضرة مرتبطة به حالياً. لم نعد نبحث بالتشابه الجزئي في العناوين حتى لا نفتح محاضرة غير مطابقة.</div><p>القسم: ${esc(departmentName(code))}</p></div>`)}
function academyImageSource(rawSrc){
 try{
  const value=String(rawSrc||'').trim();
  if(!value)return '';
  const repoPrefix='/log27250/Alhakim-Optics-Academy/main/';
  if(value.startsWith('./assets/')||value.startsWith('assets/')){
   const path=value.replace(/^\.\//,'');
   // Resolve assets against the deployed application folder (GitHub Pages project
   // sites live below /<repository>/, not at the domain root).
   const appRoot=new URL('./',location.href);
   return offlineMediaMap.get(value)||offlineMediaMap.get(new URL(path,appRoot).href)||new URL(path,appRoot).href;
  }
  const url=new URL(value,document.baseURI),originalUrl=url.href;
  // Resolve Wikimedia Special:FilePath for the known ophthalmoscope photo to a stable upload URL.
  if(url.hostname==='commons.wikimedia.org'&&/Special:FilePath\/Oculus(?:%20|_)Ophthalmoscope\.JPG/i.test(url.pathname)){
   const direct='https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Oculus_Ophthalmoscope.JPG/960px-Oculus_Ophthalmoscope.JPG';
   return offlineMediaMap.get(value)||offlineMediaMap.get(originalUrl)||direct;
  }
  if(url.protocol==='http:')url.protocol='https:';
  if(url.hostname==='raw.githubusercontent.com'&&url.pathname.startsWith(repoPrefix)){
   const path=url.pathname.slice(repoPrefix.length);
   const local=new URL(path,document.baseURI);
   return offlineMediaMap.get(value)||offlineMediaMap.get(originalUrl)||offlineMediaMap.get(url.href)||local.href;
  }
  return offlineMediaMap.get(value)||offlineMediaMap.get(originalUrl)||offlineMediaMap.get(url.href)||url.href;
 }catch(_){return ''}
}
function inlineFormat(text){return esc(text).replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(match,alt,src)=>{
 const safe=academyImageSource(src);if(!safe)return esc(alt);
 return '<img class="lesson-real-photo" src="'+esc(safe)+'" alt="'+esc(alt)+'" loading="eager" decoding="async" referrerpolicy="no-referrer" style="display:block;max-width:min(100%,760px);height:auto;margin:18px auto;border:1px solid #d5e1ea;border-radius:14px">';
 }).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\x60([^\x60]+)\x60/g,'<code>$1</code>');}
function renderLectureHtml(raw,rtl=false){
 const source=String(raw||'').replace(/\\n/g,'\n').replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(_,alt,src)=>'<img src="'+esc(academyImageSource(src))+'" data-original-src="'+esc(src)+'" alt="'+esc(alt)+'">');
 const doc=new DOMParser().parseFromString(source,'text/html');
 const allowed=new Set(['H1','H2','H3','H4','P','UL','OL','LI','STRONG','B','EM','I','BR','HR','BLOCKQUOTE','TABLE','THEAD','TBODY','TR','TH','TD','SUB','SUP','CODE','FIGURE','FIGCAPTION','IMG','SVG','G','RECT','CIRCLE','ELLIPSE','LINE','POLYLINE','POLYGON','PATH','TEXT','TSPAN']);
 const svgAttrs=new Set(['xmlns','viewBox','role','aria-label','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','d','points','fill','fill-rule','stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin','text-anchor','font-size','font-weight','font-family','opacity','transform','preserveAspectRatio']);
 const renderNode=node=>{
  if(node.nodeType===Node.TEXT_NODE){
   const textValue=String(node.nodeValue||'').replace(/[ \\t]{2,}/g,' ');
   if(node.parentElement?.tagName==='BODY'&&/[\\r\\n]/.test(textValue)){
    return textValue.split(/\\r?\\n/).map(line=>{
     const value=line.trim();if(!value)return '';
     let m;
     if((m=value.match(/^(#{1,4})\\s+(.+)$/))){const tag='h'+Math.min(m[1].length+1,4);return '<'+tag+' class="lecture-h2">'+esc(m[2])+'</'+tag+'>'}
     if((m=value.match(/^[-*]\\s+(.+)$/)))return '<ul><li>'+esc(m[1])+'</li></ul>';
     if((m=value.match(/^\\d+[.)]\\s+(.+)$/)))return '<ol><li>'+esc(m[1])+'</li></ol>';
     if((m=value.match(/^>\\s*(.+)$/)))return '<blockquote>'+esc(m[1])+'</blockquote>';
     if(/^---+$/.test(value))return '<hr>';
     return '<p>'+esc(value)+'</p>';
    }).join('');
   }
   return esc(textValue);
  }
  if(node.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=node.tagName;
  if(tag==='IMG'){
   const rawSrc=node.getAttribute('src')||'';
   const originalSrc=node.getAttribute('data-original-src')||rawSrc;
   let parsed;
   try{parsed=new URL(academyImageSource(rawSrc),location.href)}catch(_){return ''}
   const appBasePath=new URL('./',location.href).pathname;
   const isOfflineMediaCache=parsed.origin===location.origin&&parsed.pathname.startsWith(appBasePath+'__offline_media__/');
   const sameOriginImage=parsed.origin===location.origin&&parsed.pathname.startsWith(appBasePath)&&(/\.(?:svg|png|jpe?g|webp|gif)$/i.test(parsed.pathname)||isOfflineMediaCache);
   if(parsed.protocol!=='https:'&&!sameOriginImage)return '';
   const alt=esc(node.getAttribute('alt')||'Photograph of an ophthalmic instrument');
   return '<img class="lesson-real-photo" src="'+esc(parsed.href)+'" data-original-src="'+esc(originalSrc)+'" alt="'+alt+'" loading="eager" decoding="async" referrerpolicy="no-referrer">';
  }
  if(tag==='SVG'||['G','RECT','CIRCLE','ELLIPSE','LINE','POLYLINE','POLYGON','PATH','TEXT','TSPAN'].includes(tag)){
   if(!allowed.has(tag))return '';
   const attrs=[...node.attributes].filter(a=>svgAttrs.has(a.name)&&!/^on/i.test(a.name)).map(a=>' '+a.name+'="'+esc(a.value)+'"').join('');
   const children=[...node.childNodes].map(renderNode).join('');
   return '<'+tag.toLowerCase()+attrs+'>'+children+'</'+tag.toLowerCase()+'>';
  }
  const children=[...node.childNodes].map(renderNode).join('');
  if(!allowed.has(tag))return children;
  // A paragraph containing only an image is a figure, so slide pagination
  // keeps it attached to the preceding explanatory paragraph.
  if(tag==='P'&&node.querySelector('img')&&!String(node.textContent||'').trim()){
   const imageNodes=[...node.querySelectorAll('img')].map(img=>renderNode(img)).join('');
   return imageNodes?'<figure class="lesson-figure">'+imageNodes+'</figure>':'';
  }
  const textContent=node.textContent||'';
  // Split mixed-language paragraphs at the first Arabic character while preserving
  // inline emphasis and nested markup. The previous textContent-only split discarded
  // formatting and ignored explicit dir attributes on Arabic paragraphs.
  if((tag==='P'||tag==='LI')&&/[A-Za-z]/.test(textContent)&&/[\u0600-\u06FF]/.test(textContent)){
   const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
   let textNode,splitNode=null,splitOffset=0;
   while((textNode=walker.nextNode())){
    const at=textNode.nodeValue.search(/[\u0600-\u06FF]/);
    if(at>=0){splitNode=textNode;splitOffset=at;break;}
   }
   if(splitNode){
    const range=document.createRange();
    range.setStart(splitNode,splitOffset);
    range.setEnd(node,node.childNodes.length);
    const arabicFragment=range.extractContents();
    const englishHtml=[...node.childNodes].map(renderNode).join('');
    const arabicHtml=[...arabicFragment.childNodes].map(renderNode).join('');
    if(englishHtml.trim()&&arabicHtml.trim()){const wrapper=tag==='LI'?'li':'p';return '<'+wrapper+' dir="ltr" lang="en">'+englishHtml+'</'+wrapper+'><'+wrapper+' dir="rtl" lang="ar">'+arabicHtml+'</'+wrapper+'>'; }
   }
  }
  // Detect each block from its first strong character. Ignore stale RTL attributes
  // on English paragraphs so English content always reads left-to-right.
  const explicitDir=(node.getAttribute('dir')||'').toLowerCase();
  const firstStrong=(textContent.match(/[\u0600-\u06FF]|[A-Za-z]/)||[])[0]||'';
  const detectedDir=firstStrong?(/[\u0600-\u06FF]/.test(firstStrong)?'rtl':'ltr'):'';
  const dir=detectedDir||(explicitDir==='rtl'||explicitDir==='ltr'?explicitDir:(rtl?'rtl':'ltr'));
  const attrs=[' dir="'+dir+'"',' lang="'+(node.getAttribute('lang')|| (dir==='rtl'?'ar':'en'))+'"'];
  if(tag==='FIGURE'){
   if(!children.trim())return '';
   const cls=node.classList.contains('real-device-photo')?'real-device-photo':node.classList.contains('lesson-figure')?'lesson-figure':'lesson-figure';
   return '<figure class="'+cls+'">'+children+'</figure>';
  }
  if(tag==='FIGCAPTION'){
   // Keep attribution text readable without exposing raw Commons file URLs as visible link-like text.
   const caption=[...node.childNodes].map(n=>n.nodeType===Node.TEXT_NODE?n.nodeValue||'':n.textContent||'').join('').replace(/(?:Source(?: and licence details)?|File):?\s*https?:\/\/commons\.wikimedia\.org\/[^\s]+/gi,'').replace(/\s{2,}/g,' ').trim();
   return '<figcaption>'+esc(caption||node.textContent||'')+'</figcaption>';
  }
  if(['H1','H2','H3','H4'].includes(tag)&&/^(?:[0-9]+[.]?\s+)?Clinical\s+Applications?\b/i.test(String(node.textContent||'').trim()))return '<p'+attrs.join('')+'>'+children+'</p>';
  if(tag==='H1'||tag==='H2')return '<h2 class="lecture-h2"'+attrs.join('')+'>'+children+'</h2>';
  if(tag==='H3')return '<h3 class="lecture-h3"'+attrs.join('')+'>'+children+'</h3>';
  if(tag==='H4')return '<h4'+attrs.join('')+'>'+children+'</h4>';
  if(tag==='BR'||tag==='HR')return '<'+tag.toLowerCase()+'>';
  return '<'+tag.toLowerCase()+(['P','LI','TH','TD','BLOCKQUOTE'].includes(tag)?attrs.join(''):'')+'>'+children+'</'+tag.toLowerCase()+'>';
 };
 const rendered=[...doc.body.childNodes].map(node=>{
  // Markdown images and standalone HTML images become figure blocks.
  // This prevents a slide break from separating an illustration from its context.
  if(node.nodeType===Node.ELEMENT_NODE&&node.tagName==='IMG'){
   const image=renderNode(node);return image?'<figure class="lesson-figure">'+image+'</figure>':'';
  }
  return renderNode(node);
 }).join('');
 return '<div class="lecture-body '+(rtl?'lecture-ar':'lecture-en')+'" dir="ltr" lang="en">'+rendered+'</div>';
}
function renderLectureMarkdown(raw,rtl=false){
 let original=String(raw||'').trim();
 // Normalize literal backslash-n sequences stored by older Contact Lens imports.
 // They must become real paragraph breaks before Markdown parsing, otherwise
 // Clinical Applications and its Arabic explanation are rendered as one mixed block.
 original=original.replace(/\\n/g,'\n').replace(/\\r/g,'\r');
 // Keep the English paragraph LTR and render its following Arabic explanation as a separate RTL paragraph.
 original=original.replace(/\n[ \t]*\*\*الشرح بالعربي:\*\*[ \t]*/g,'\n\n**الشرح بالعربي:** ');
 // Older lesson records stored Arabic explanations as <br><span dir="rtl">...</span>.
 // Convert each one into its own semantic paragraph so it is never appended inline
 // to the English paragraph and remains readable in both slide and full-page views.
 original=original.replace(/<br\s*\/?\s*>\s*<span\s+dir=["']rtl["'][^>]*>([\s\S]*?)<\/span>/gi,'<p dir="rtl" lang="ar">$1</p>');
 // Normalize every Markdown image before choosing the Markdown/HTML rendering path.
 // This guarantees that images embedded in mixed HTML/Markdown content become real
 // figure/img elements instead of being left as visible link-like Markdown text.
 original=original.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,(_,alt,src,title)=>{
  const safe=academyImageSource(src);if(!safe)return '';
  return '<figure class="lesson-figure"><img src="'+esc(safe)+'" data-original-src="'+esc(src)+'" alt="'+esc(alt||title||'Educational illustration')+'"></figure>';
 });
 // Preserve the leading illustration as a figure node. Figures are extracted
 // before Markdown parsing, so mixed HTML/Markdown cannot swallow the image.
 original=original.replace(/<p\b[^>]*>\s*(<img\b[^>]*>)\s*<\/p>/gi,'<figure class="lesson-figure">$1</figure>');
 // Preserve image figures by sanitising stored HTML as a whole.
 const hasMarkdown=/(^|\n)\s{0,3}#{1,4}\s|(^|\n)\s*[-*]\s/m.test(original);
 const hasHtmlBlocks=/<(?:h[1-6]|p|div|ul|ol|li|table|blockquote|br|figure|figcaption|img|svg)(?:\s|>|\/)/i.test(original);
 if(hasHtmlBlocks&&!hasMarkdown)return renderLectureHtml(original,rtl);
 const figureBlocks=[];
 const source=original.replace(/<figure\b[\s\S]*?<\/figure>/gi,block=>{
  const token='HAKIMFIGUREBLOCK'+figureBlocks.length+'END';
  const safe=renderLectureHtml(block,rtl).replace(/^<div[^>]*>/,'').replace(/<\/div>$/,'');
  figureBlocks.push({token,html:safe});
  return '\n\n'+token+'\n\n';
 });
 const restoreFigures=html=>figureBlocks.reduce((result,item)=>result.replace(item.token,item.html),html);
 const hasMarkdownBlocks=/(^|\n)\s{0,3}#{1,4}\s|(^|\n)\s*[-*]\s/m.test(source);
 if(hasMarkdownBlocks&&/<(?:h[12]\b|hr\b)/i.test(source)){
  const normalized=source.replace(/<hr\s*\/?\s*>/gi,'\n---\n').replace(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]\s*>/gi,'\n## $1\n');
  return restoreFigures(renderLectureMarkdown(normalized,rtl));
 }
 if(/<(?:h[1-6]|p|div|ul|ol|li|table|blockquote|br|figure|figcaption|img|svg)(?:\s|>|\/)/i.test(source))return restoreFigures(renderLectureHtml(source,rtl));
 const lines=source.replace(/\r/g,'').split('\n');let out='',list=null,table=[];
 const blockDir=text=>{const v=String(text||'').replace(/\*\*|__|\*|_|\x60/g,'');const ar=(v.match(/[\u0600-\u06FF]/g)||[]).length;const en=(v.match(/[A-Za-z]/g)||[]).length;return ar>en?'rtl':'ltr'};
 const attrs=text=>{const d=blockDir(text);return ' dir="'+d+'" lang="'+(d==='rtl'?'ar':'en')+'" class="lecture-block-'+d+'"'};
 const closeList=()=>{if(list){out+=list==='ul'?'</ul>':'</ol>';list=null}};
 const flushTable=()=>{if(!table.length)return;out+='<div class="lecture-table-wrap"><table class="lecture-table">';table.forEach((row,i)=>{const cells=row.split('|').slice(1,-1).map(x=>x.trim());if(cells.every(x=>/^:?-{3,}:?$/.test(x)))return;out+=i===0?'<thead><tr>':'<tbody><tr>';cells.forEach(cell=>out+=i===0?'<th'+attrs(cell)+'>'+inlineFormat(cell)+'</th>':'<td'+attrs(cell)+'>'+inlineFormat(cell)+'</td>');out+='</tr>'+(i===0?'</thead>':'')});out+='</tbody></table></div>';table=[]};
 for(const rawLine of lines){const line=rawLine.trim();if(!line){closeList();flushTable();continue}let m;
 // Render a standalone Markdown image as a real figure element, never as a text/link block.
 if((m=line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))){closeList();const image=inlineFormat(line);if(image.includes('<img '))out+='<figure class=\"lesson-figure\">'+image+'</figure>';continue}
 if(line.startsWith('|')&&line.endsWith('|')){closeList();table.push(line);continue}else flushTable();
 if(/^Clinical\s+Applications?$/i.test(line)){closeList();out+='<p dir="ltr" lang="en"><strong>Clinical Applications</strong></p>';continue}
 if((m=line.match(/^(#{1,4})\s+(.+)$/))){closeList();const n=m[1].length;if(/^(?:[0-9]+[.]?\s+)?Clinical\s+Applications?\b/i.test(m[2]))out+='<p'+attrs(m[2])+'>'+inlineFormat(m[2])+'</p>';else out+=n===1?'<h2 class="lecture-h2"'+attrs(m[2])+'>'+inlineFormat(m[2])+'</h2>':n===2?'<h3 class="lecture-h3"'+attrs(m[2])+'>'+inlineFormat(m[2])+'</h3>':'<h4'+attrs(m[2])+'>'+inlineFormat(m[2])+'</h4>';continue}
 if(/^---+$/.test(line)){closeList();out+='<hr>';continue}
 if((m=line.match(/^[-*]\s+(.+)$/))){if(list!=='ul'){closeList();out+='<ul>';list='ul'}out+='<li'+attrs(m[1])+'>'+inlineFormat(m[1])+'</li>';continue}
 if((m=line.match(/^\d+[.)]\s+(.+)$/))){if(list!=='ol'){closeList();out+='<ol>';list='ol'}out+='<li'+attrs(m[1])+'>'+inlineFormat(m[1])+'</li>';continue}
 if((m=line.match(/^>\s*(.+)$/))){closeList();out+='<blockquote'+attrs(m[1])+'>'+inlineFormat(m[1])+'</blockquote>';continue}
 closeList();out+='<p'+attrs(line)+'>'+inlineFormat(line)+'</p>';}
 closeList();flushTable();return restoreFigures('<div class="lecture-body '+(rtl?'lecture-ar':'lecture-en')+'" dir="ltr" lang="en">'+out+'</div>');
}
function buildIntegratedBilingualMarkdown(contentEn,contentAr){
 const en=String(contentEn||'').trim(),ar=String(contentAr||'').trim();
 if(!en&&!ar)return 'لم يضف المحتوى العلمي بعد.';
 if(!en)return '<h2>Arabic explanation — الشرح العربي</h2>'+ar;
 if(!ar)return en;
 // Both complete language fields must be rendered; previously only content_en
 // was returned, so the separately stored Arabic body and its images were hidden.
 return en+'\n\n<hr>\n<h2>Arabic explanation — الشرح العربي</h2>\n'+ar;
}
function buildLectureSlides(html){
 const doc=new DOMParser().parseFromString(html,'text/html');
 // Keep each English paragraph together with its Arabic explanatory paragraph.
 // Pagination must never separate a bilingual pair across two different slides.
 const body=doc.querySelector('.lecture-body');
 const nodes=body?[...body.children]:[...doc.body.children],slides=[];
 const target=3000,hardLimit=4300;
 let page=[],size=0;
 const weightOf=node=>Math.max(45,(node.textContent||'').trim().length);
 const isHeading=node=>node.matches('h2.lecture-h2,h3.lecture-h3,h4');
 const isArabicParagraph=node=>node.matches('p[dir="rtl"],p[lang="ar"]');
 const isEnglishParagraph=node=>node.matches('p[dir="ltr"],p[lang="en"]');
 const emit=()=>{if(page.length){slides.push(page);page=[];size=0}};
 for(let index=0;index<nodes.length;index++){
  const group=[nodes[index]];
  if(isEnglishParagraph(nodes[index])&&nodes[index+1]&&isArabicParagraph(nodes[index+1]))group.push(nodes[++index]);
  // Keep each clinical photograph with the bilingual explanation that introduces it.
  if(group.length===2&&nodes[index+1]?.matches('figure.real-device-photo'))group.push(nodes[++index]);
  const heading=isHeading(group[0]),figure=group.some(n=>n.matches('figure'));
  const weight=group.reduce((sum,n)=>sum+weightOf(n),0);
  if(heading&&page.length&&size>target)emit();
  if(!figure&&!heading&&page.length&&size+weight>target)emit();
  if(page.length&&size+weight>hardLimit&&!figure)emit();
  group.forEach(n=>page.push(n.outerHTML));size+=weight;
  if(heading&&size>target&&nodes[index+1]&&isHeading(nodes[index+1]))emit();
 }
 emit();
 return slides.length?slides:[['<p>Lecture content is not available.</p>']];
}
async function cacheLessonImagesOffline(lesson){
 if(!lesson||!navigator.onLine||!window.caches||!window.indexedDB)return {cached:0,failed:0,skipped:true};
 await loadOfflineMediaMap();
 const urls=new Set(),add=raw=>{
  const value=String(raw||'').trim().replace(/^['"]|['"]$/g,'');
  if(!value||/^(data:|blob:|#)/i.test(value))return;
  try{const u=new URL(value,location.href);if(/^https?:$/.test(u.protocol)&&u.origin!==location.origin)urls.add(u.href)}catch(_){}
 };
 const fields=['image_url','image_urls','illustration_url','thumbnail_url','cover_image_url','featured_image_url','diagram_url'];
 for(const key of fields){const value=lesson[key];if(Array.isArray(value))value.forEach(add);else if(value)add(value)}
 for(const raw of [lesson.content_en,lesson.content_ar]){
  if(!raw)continue;
  const source=String(raw),doc=new DOMParser().parseFromString(source,'text/html');
  doc.querySelectorAll('img,source,image,[style]').forEach(el=>{
   for(const attr of ['src','href','xlink:href','data-src','data-original','data-lazy-src'])add(el.getAttribute(attr));
   for(const attr of ['srcset','data-srcset'])(el.getAttribute(attr)||'').split(',').forEach(part=>add(part.trim().split(/\s+/)[0]));
   const style=el.getAttribute('style')||'';
   for(const match of style.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi))add(match[2]);
  });
  for(const match of source.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g))add(match[1]);
  for(const match of source.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi))add(match[2]);
 }
 // Also inspect the FINAL rendered lesson HTML. Some clinical photographs are injected
 // by renderLectureContentWithIllustration() and do not exist in the raw database fields.
 try{
  const rendered=renderLectureContentWithIllustration(lesson);
  const renderedDoc=new DOMParser().parseFromString(String(rendered||''),'text/html');
  renderedDoc.querySelectorAll('img,source,image,video,[style]').forEach(el=>{
   for(const attr of ['src','href','xlink:href','data-src','data-original','data-original-src','data-lazy-src','poster'])add(el.getAttribute(attr));
   for(const attr of ['srcset','data-srcset'])(el.getAttribute(attr)||'').split(',').forEach(part=>add(part.trim().split(/\s+/)[0]));
   const style=el.getAttribute('style')||'';
   for(const match of style.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi))add(match[2]);
  });
 }catch(error){console.warn('Could not inspect rendered lesson images:',error)}
 if(!urls.size)return {cached:0,failed:0,total:0};
 const cache=await caches.open(OFFLINE_MEDIA_CACHE),db=await openOfflineDB();
 let cached=0,failed=0;
 try{
  for(const source of urls){
   const local=new URL('./__offline_media__/'+offlineMediaHash(source),location.href).href;
   if(await cache.match(local)){offlineMediaMap.set(source,local);cached++;continue}
   try{
    let response;
    try{response=await fetch(source,{mode:'cors',credentials:'omit'})}
    catch(_){response=await fetch(source,{mode:'no-cors',credentials:'omit'})}
    if(response.type!=='opaque'&&!response.ok)throw new Error('HTTP '+response.status);
    await cache.put(local,response.clone());
    offlineMediaMap.set(source,local);cached++;
   }catch(error){failed++;console.warn('Lesson image could not be cached:',source,error)}
  }
  const records=[...urls].filter(source=>offlineMediaMap.has(source)).map(source=>({source_url:source,local_url:offlineMediaMap.get(source),cached_at:new Date().toISOString()}));
  await new Promise((resolve,reject)=>{
   const tx=db.transaction('media_map','readwrite'),store=tx.objectStore('media_map');
   records.forEach(record=>store.put(record));
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }finally{db.close()}
 return {cached,failed,total:urls.size,complete:failed===0};
}
function localizeOfflineMediaUrl(raw){
 try{const key=new URL(String(raw||''),location.href).href;return offlineMediaMap.get(key)||raw}catch(_){return raw}
}
function localizeOfflineMediaMarkup(markup){
 if(!markup||!offlineMediaMap.size)return String(markup||'');
 try{
  const doc=new DOMParser().parseFromString(String(markup),'text/html');
  doc.querySelectorAll('img,source,image,video,[style]').forEach(el=>{
   for(const attr of ['src','href','xlink:href','data-src','data-original','data-lazy-src','poster']){
    const raw=el.getAttribute(attr);if(raw){const local=localizeOfflineMediaUrl(raw);if(local&&local!==raw)el.setAttribute(attr,local)}
   }
   for(const attr of ['srcset','data-srcset']){
    const raw=el.getAttribute(attr);if(raw)el.setAttribute(attr,raw.split(',').map(part=>{const bits=part.trim().split(/\s+/);if(bits[0])bits[0]=localizeOfflineMediaUrl(bits[0]);return bits.join(' ')}).join(', '));
   }
   const style=el.getAttribute('style')||'';
   if(style.includes('url('))el.setAttribute('style',style.replace(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi,(match,quote,url)=>{const local=localizeOfflineMediaUrl(url);return local&&local!==url?'url('+quote+local+quote+')':match}));
  });
  return doc.body.innerHTML;
 }catch(_){return String(markup||'')}
}
function renderLectureDeck(slides){
 const pages=slides.map((s,i)=>'<section class="lecture-slide'+(i===0?' active':'')+'" data-slide="'+i+'" aria-hidden="'+(i!==0)+'"><div class="slide-content" dir="ltr" lang="en">'+localizeOfflineMediaMarkup(s.join(''))+'</div></section>').join('');
 return '<section class="lecture-deck" id="lectureDeck" aria-label="Lecture slides"><div class="slide-stage" id="slideStage">'+pages+'</div><div class="slide-controls"><button type="button" id="slidePrev" class="secondary" disabled>السابق</button><span id="slideCounter" aria-live="polite">1 / '+slides.length+'</span><button type="button" id="slideNext" class="primary" '+(slides.length===1?'disabled':'')+'>التالي</button></div><div class="slide-progress"><span id="slideProgress" style="width:'+(100/slides.length)+'%"></span></div></section>';
}
function initLectureDeck(){
 const deck=document.getElementById('lectureDeck');if(!deck)return;
 const slides=[...deck.querySelectorAll('.lecture-slide')];if(!slides.length)return;
 let index=0;
 const prev=deck.querySelector('#slidePrev'),next=deck.querySelector('#slideNext');
 const counter=deck.querySelector('#slideCounter'),progress=deck.querySelector('#slideProgress');
 const paint=()=>{
  slides.forEach((s,i)=>{s.classList.toggle('active',i===index);s.setAttribute('aria-hidden',String(i!==index))});
  if(counter)counter.textContent=(index+1)+' / '+slides.length;
  if(prev)prev.disabled=index===0;
  if(next)next.disabled=index===slides.length-1;
  if(progress)progress.style.width=((index+1)/slides.length*100)+'%';
 };
 const move=d=>{index=Math.max(0,Math.min(slides.length-1,index+d));paint()};
 prev?.addEventListener('click',()=>move(-1));
 next?.addEventListener('click',()=>move(1));
 deck.tabIndex=0;
 deck.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}});
 let startX=null;
 deck.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});
 deck.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>55)move(dx<0?1:-1);startX=null},{passive:true});
 paint();
}

function referenceUrl(ref){if(typeof ref==='object'&&ref){if(ref.file_path)return '';return first(ref,['url','doi','link','href'])}return ''}
function refLabel(ref){return typeof ref==='object'?first(ref,['title','name','citation'],'مرجع علمي'):String(ref)}
const ACADEMY_READABLE_REFERENCE_IDS=new Set(['423c98e5-8bf4-4ef1-ba66-32e5f0787934','4380825f-f67e-479b-8661-1a0c12ab76bf','d490838f-d39e-42f8-8bbc-0317d9757d3d']);
function isAcademyReadableReference(ref){if(!ref||String(ref.academy_readability||'').toLowerCase()!=='available')return false;const storedPdf=!!ref.file_path&&String(ref.file_name||'').toLowerCase().endsWith('.pdf')&&['free_full_text','free_pdf_download'].includes(String(ref.access_type||'').toLowerCase());const approvedExternalPdf=ACADEMY_READABLE_REFERENCE_IDS.has(String(ref.id))&&ACADEMY_PDF_PROXY_IDS.has(String(ref.id))&&/^https?:\/\//i.test(referenceUrl(ref))&&/\.pdf(?:$|[?#])/i.test(referenceUrl(ref));return storedPdf||approvedExternalPdf}
function academyReadabilityLabel(ref){return isAcademyReadableReference(ref)?'📗 مراجع متاحة':'🔒 مراجع غير متاحة'}
function isAcademyPdfReference(ref){return !!ref&&(!!ref.file_path||String(ref.access_type||'').toLowerCase()==='free_pdf_download'||/\.pdf(?:$|[?#])/i.test(referenceUrl(ref)));}
const ACADEMY_PDF_PROXY_IDS=new Set(['d490838f-d39e-42f8-8bbc-0317d9757d3d','4380825f-f67e-479b-8661-1a0c12ab76bf','423c98e5-8bf4-4ef1-ba66-32e5f0787934','643738e1-0c9e-4d9d-b8a7-eff81ab0ed11','39ef5221-6c72-42ab-adc7-ab4a302b0b38','a213fba9-af1b-4c0d-a96d-2ad7f04e9e0d','1f3c5546-2933-45f0-a4e4-f0493a918d1b','3b50e04a-1994-4b48-8eea-e2cd60cfc33e','ba700f4e-172f-49ee-afab-95b6378daf56','33a06d40-563d-41fc-b7a8-8f9a4302a038','13ed22b5-2dd8-48dd-bee4-9369a9b2a073','93d0339e-a089-465e-a86c-f6afc31058dd','bcfae4b3-a6c7-4f71-a0e2-826f3b63c861','c732bd34-6599-41a9-bef0-3bd70bedc2a2','8647bec5-6d6c-40ab-8c8a-fffdf49dab57','6fc000c5-f086-41e9-a856-b0606021bd79','6bbfbe27-2fd1-4cec-9d45-88223960cff8']);
function academyReferenceProxyUrl(ref,download=false){
 if(!ref||!ACADEMY_PDF_PROXY_IDS.has(String(ref.id)))return referenceUrl(ref);
 return SUPABASE_URL+'/functions/v1/academy-reference-proxy?id='+encodeURIComponent(String(ref.id))+(download?'&download=1':'');
}
function referenceLink(ref){return isAcademyReadableReference(ref)?'<button type="button" class="primary reference-open-button" onclick="openAcademyReference(\''+esc(ref.id)+'\')">📖 اقرأ المرجع كاملاً داخل الأكاديمية</button>':''}
function findAcademyReference(id){return (DB.reference_catalog||[]).find(x=>String(x.id)===String(id))}
async function academyPdfSignedUrl(path){
 if(!session?.access_token)throw Error('يجب تسجيل الدخول لعرض ملفات المحاضرات.');
 const safe=String(path||'').split('/').map(encodeURIComponent).join('/');
 const response=await authorizedFetch(SUPABASE_URL+'/storage/v1/object/sign/academy-references/'+safe,{method:'POST',headers:authHeaders(),body:JSON.stringify({expiresIn:120})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.signedURL)throw Error(data.message||data.error||'تعذر الوصول الآمن إلى ملف PDF. تحقق من إعدادات الحاوية الخاصة وسياسات الوصول.');
 return data.signedURL.startsWith('http')?data.signedURL:SUPABASE_URL+data.signedURL;
}

/* Save readable Library PDFs into the existing offline media cache.
   The local URL is stable and remains valid after the signed Supabase URL expires. */
async function cacheOfflineReferenceFiles(references=DB?.reference_catalog||[]){
 if(!navigator.onLine||!window.caches||!Array.isArray(references))return {cached:0,failed:0};
 const cache=await caches.open(OFFLINE_MEDIA_CACHE);let cached=0,failed=0,changed=false;
 for(const ref of references){
  if(!isAcademyReadableReference(ref))continue;
  const external=referenceUrl(ref),isExternalPdf=isAcademyPdfReference(ref);
  if(!ref.file_path&&!isExternalPdf)continue;
  try{
   const key=String(ref.id||ref.file_path||external);
   const localUrl=new URL('./__offline_references__/'+offlineMediaHash(key),location.href).href;
   let stored=await cache.match(localUrl);
   if(stored){
    const bytes=await stored.arrayBuffer();
    const signature=new TextDecoder().decode(new Uint8Array(bytes,0,Math.min(5,bytes.byteLength)));
    if(signature==='%PDF-'){
     if(ref.offline_file_url!==localUrl){ref.offline_file_url=localUrl;changed=true}
     cached++;continue;
    }
    await cache.delete(localUrl);
   }
   const source=ref.file_path?await academyPdfSignedUrl(ref.file_path):(isExternalPdf?academyReferenceProxyUrl(ref):external);
   const response=await fetch(source,{mode:'cors',credentials:'omit',cache:'no-store'});
   if(response.type==='opaque')throw Error('The PDF response is opaque and cannot be verified or read offline.');
   if(!response.ok)throw Error('HTTP '+response.status);
   const bytes=await response.arrayBuffer();
   if(!bytes.byteLength)throw Error('The returned file is empty.');
   const signature=new TextDecoder().decode(new Uint8Array(bytes,0,Math.min(5,bytes.byteLength)));
   if(signature!=='%PDF-')throw Error('The returned file does not contain a valid PDF signature.');
   await cache.put(localUrl,new Response(bytes,{status:200,headers:{'Content-Type':'application/pdf','Content-Length':String(bytes.byteLength),'X-Academy-Reference-Id':String(ref.id||'')}}));
   ref.offline_file_url=localUrl;cached++;changed=true;
  }catch(error){failed++;console.warn('Could not cache Library PDF for offline reading:',ref.title,error.message)}
 }
 if(changed){await saveOfflineCurriculum(DB);try{localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}catch(_){}}
 return {cached,failed};
}
/* Archive complete PMC and NCBI Bookshelf XML payloads for true offline reading. */
function academyTextReferenceEndpoint(ref){
 const url=String(referenceUrl(ref)||'');
 const pmc=url.match(/PMC\d+/i);
 const book=url.match(/books\/(NBK\d+)/i);
 if(pmc)return SUPABASE_URL+'/functions/v1/academy-reference-proxy?pmcid='+encodeURIComponent(pmc[0].toUpperCase())+'&format=xml';
 if(book)return SUPABASE_URL+'/functions/v1/academy-reference-proxy?bookid='+encodeURIComponent(book[1].toUpperCase())+'&format=bookxml';
 return '';
}
function academyReferenceCacheKey(ref,kind='text'){
 return new URL('./__offline_references_'+kind+'__/'+offlineMediaHash(String(ref.id)),location.href).href;
}
let academyFullSyncPromise=null;
async function startFullOfflineSync(){
 if(!navigator.onLine||dataSource!=='supabase'||!Array.isArray(DB?.lessons)||!DB.lessons.length)return null;
 if(academyFullSyncPromise)return academyFullSyncPromise;
 academyFullSyncPromise=(async()=>{
  const initial=await readFullSyncReport()||{};
  await saveFullSyncReport({...initial,complete:false,images_sync_status:'downloading',sync_started_at:new Date().toISOString()});
  try{if(navigator.storage?.persist)await navigator.storage.persist()}catch(error){console.info('Persistent offline storage was not granted:',error?.message||error)}
  let images={cached:0,failed:0,total:0},pdfs={cached:0,failed:0},texts={cached:0,failed:0,skipped:0};
  try{images=await cacheWikimediaLessonImages()}catch(error){images.failed=1;console.error('Bulk lesson media sync failed:',error)}
  try{
   if(session?.access_token)pdfs=await cacheOfflineReferenceFiles();
   else pdfs={cached:0,failed:0,skipped:(DB.reference_catalog||[]).filter(r=>r.file_path).length};
  }catch(error){pdfs.failed=1;console.error('Offline PDF sync failed:',error)}
  try{texts=await cacheOfflineTextReferences()}catch(error){texts.failed=1;console.error('Offline full-text sync failed:',error)}
  try{await saveOfflineCurriculum(DB)}catch(error){console.warn('Could not save final offline catalogue:',error)}
  const referenceTotal=(DB.reference_catalog||[]).filter(isAcademyReadableReference).length;
  const complete=images.failed===0&&pdfs.failed===0&&texts.failed===0&&pdfs.skipped===0;
  const report=await saveFullSyncReport({
   departments:DB.departments.length,topics:DB.curriculum_topic_count,lessons:DB.lessons.length,
   questions:initial.questions||0,questions_lessons:initial.questions_lessons||0,
   references:referenceTotal,images_cached:images.cached,images_total:images.total,images_failed:images.failed,
   reference_files_cached:pdfs.cached,reference_files_failed:pdfs.failed,
   reference_text_cached:texts.cached,reference_text_failed:texts.failed,
   images_sync_status:images.failed?'partial':'complete',complete,synced_at:new Date().toISOString()
  });
  console.info('HAKIM full offline sync report:',report);
  return report;
 })().catch(async error=>{
  console.error('HAKIM full offline sync failed:',error);
  await saveFullSyncReport({complete:false,images_sync_status:'failed',last_error:String(error?.message||error)}).catch(()=>{});
  throw error;
 }).finally(()=>{academyFullSyncPromise=null;refreshOfflineSyncBadge()});
 return academyFullSyncPromise;
}
async function cacheOfflineTextReferences(references=DB?.reference_catalog||[]){
 if(!navigator.onLine||!window.caches||!Array.isArray(references))return {cached:0,failed:0,skipped:0};
 const cache=await caches.open('alhakim-academy-reference-text-v2');
 let cached=0,failed=0,skipped=0;
 for(const ref of references){
  if(!isAcademyReadableReference(ref))continue;
  if(isAcademyPdfReference(ref)){skipped++;continue}
  const endpoint=academyTextReferenceEndpoint(ref);
  if(!endpoint){failed++;console.warn('Readable full-text reference has no supported offline source:',ref.title);continue}
  const key=academyReferenceCacheKey(ref,'text');
  try{
   if(await cache.match(key)){ref.offline_text_url=key;cached++;continue}
   const response=await fetch(endpoint,{method:'GET',headers:{'Accept':'application/xml,text/xml'},cache:'no-store'});
   if(!response.ok)throw Error('HTTP '+response.status);
   const type=String(response.headers.get('content-type')||'').toLowerCase();
   if(!type.includes('xml')&&!type.includes('text'))throw Error('Unexpected content type: '+type);
   const body=await response.text();
   if(!body||body.length<500||/<html[\s>]/i.test(body)||/<parsererror/i.test(body))throw Error('The source did not return complete XML text.');
   await cache.put(key,new Response(body,{status:200,headers:{'Content-Type':'application/xml; charset=utf-8','X-Academy-Reference-Id':String(ref.id)}}));
   ref.offline_text_url=key;cached++;
  }catch(error){failed++;console.warn('Could not archive offline full text:',ref.title,error.message)}
 }
 return {cached,failed,skipped};
}
async function loadPdfJs(){
 if(window.pdfjsLib)return window.pdfjsLib;
 if(!window.hakimPdfJsPromise)window.hakimPdfJsPromise=(async()=>{
  const cdns=[
   {module:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs',worker:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'},
   {module:'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs',worker:'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs'},
   {module:'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.min.mjs',worker:'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs'}
  ];
  let lastError;
  for(const cdn of cdns){try{const mod=await import(cdn.module);mod.GlobalWorkerOptions.workerSrc=cdn.worker;window.pdfjsLib=mod;return mod}catch(error){lastError=error;console.warn('PDF.js CDN unavailable:',cdn.module,error?.message)}}
  throw new Error('تعذر تحميل مكتبة قارئ PDF من مصادرها البديلة: '+(lastError?.message||'Network error'));
 })();
 return window.hakimPdfJsPromise;
}
async function drawAcademyPdf(path,title,externalPdfUrl,offlineFileUrl,sourceFallbackUrl,referenceId){
 const host=document.getElementById('academyPdfViewer');if(!host)return;
 if(host.dataset.pdfObjectUrl){try{URL.revokeObjectURL(host.dataset.pdfObjectUrl)}catch(_){}delete host.dataset.pdfObjectUrl}
 const cacheKey=offlineFileUrl||(referenceId?new URL('./__offline_references__/'+offlineMediaHash(String(referenceId)),location.href).href:'');
 const showNativePdf=url=>{
  host.innerHTML='<div class="pdf-reader-toolbar"><span>قارئ PDF الأصلي</span><a class="secondary" href="'+esc(url)+'" target="_blank" rel="noopener">فتح في عارض PDF</a></div><iframe title="'+esc(title||'PDF')+'" src="'+esc(url)+'" type="application/pdf" style="display:block;width:100%;height:82vh;min-height:620px;border:0;background:#fff" loading="eager"></iframe>';
 };
 if(!navigator.onLine){
  if(cacheKey&&window.caches){
   try{
    const cache=await caches.open(OFFLINE_MEDIA_CACHE),stored=await cache.match(cacheKey);
    if(stored){
     const bytes=await stored.arrayBuffer();
     if(!bytes.byteLength)throw Error('النسخة المحلية من ملف PDF فارغة.');
     const signature=new TextDecoder().decode(new Uint8Array(bytes,0,Math.min(5,bytes.byteLength)));
     if(signature!=='%PDF-')throw Error('النسخة المحلية ليست ملف PDF صالحاً.');
     const blobUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
     host.dataset.pdfObjectUrl=blobUrl;showNativePdf(blobUrl);return;
    }
   }catch(error){console.warn('Offline PDF cache lookup failed:',error)}
  }
  host.innerHTML='<div class="notice">هذا الملف لم تتم مزامنته على هذا الجهاز بعد. افتح المرجع مرة واحدة مع الاتصال بالإنترنت لحفظه محلياً.</div>';return;
 }
 host.innerHTML='<div class="notice">جارٍ جلب ملف PDF الأصلي وتجهيزه للعرض...</div>';
 try{
  let pdfBytes=null;
  if(cacheKey&&window.caches){
   try{
    const cache=await caches.open(OFFLINE_MEDIA_CACHE),stored=await cache.match(cacheKey);
    if(stored){pdfBytes=await stored.arrayBuffer();const sig=new TextDecoder().decode(new Uint8Array(pdfBytes,0,Math.min(5,pdfBytes.byteLength)));if(sig!=='%PDF-'){pdfBytes=null;await cache.delete(cacheKey)}}
   }catch(error){console.warn('Cached PDF read failed; trying secure cloud fetch:',error)}
  }
  if(!pdfBytes&&path){
   if(!session?.access_token)throw Error('يجب تسجيل الدخول لقراءة هذا المرجع.');
   const safe=String(path).split('/').map(encodeURIComponent).join('/');
   const response=await authorizedFetch(SUPABASE_URL+'/storage/v1/object/academy-references/'+safe,{
    method:'GET',headers:{Accept:'application/pdf,application/octet-stream;q=0.9'}
   });
   if(!response.ok){const detail=await response.text().catch(()=> '');throw Error('تعذر جلب ملف المرجع من التخزين (HTTP '+response.status+'). '+detail.slice(0,180))}
   const contentType=String(response.headers.get('content-type')||'').toLowerCase();
   const blob=await response.blob();
   if(!blob.size)throw Error('وصل ملف PDF فارغ من التخزين.');
   pdfBytes=await blob.arrayBuffer();
   const signature=new TextDecoder().decode(new Uint8Array(pdfBytes,0,Math.min(5,pdfBytes.byteLength)));
   if(signature!=='%PDF-')throw Error('الملف الموجود في التخزين لا يحمل ترويسة PDF صحيحة ('+contentType+').');
   if(cacheKey&&window.caches){
    const cache=await caches.open(OFFLINE_MEDIA_CACHE);
    await cache.put(cacheKey,new Response(pdfBytes.slice(0),{status:200,headers:{'Content-Type':'application/pdf','Content-Length':String(pdfBytes.byteLength),'X-Academy-Reference-Id':String(referenceId||'')}}));
    if(offlineFileUrl!==cacheKey&&referenceId){
     const ref=findAcademyReference(referenceId);if(ref)ref.offline_file_url=cacheKey;
     try{await saveOfflineCurriculum(DB);localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}catch(cacheError){console.warn('PDF saved locally but catalogue update failed:',cacheError)}
    }
   }
  }
  if(!pdfBytes&&externalPdfUrl){
   const response=await fetch(externalPdfUrl,{mode:'cors',credentials:'omit',cache:'no-store'});
   if(!response.ok)throw Error('تعذر جلب المرجع من المصدر (HTTP '+response.status+').');
   const blob=await response.blob();pdfBytes=await blob.arrayBuffer();
   const signature=new TextDecoder().decode(new Uint8Array(pdfBytes,0,Math.min(5,pdfBytes.byteLength)));
   if(signature!=='%PDF-')throw Error('المصدر لم يُرجع ملف PDF صالحاً.');
   if(cacheKey&&window.caches)await (await caches.open(OFFLINE_MEDIA_CACHE)).put(cacheKey,new Response(pdfBytes.slice(0),{headers:{'Content-Type':'application/pdf'}}));
  }
  if(!pdfBytes)throw Error('لم يتم العثور على ملف PDF صالح لهذا المرجع.');
  const signature=new TextDecoder().decode(new Uint8Array(pdfBytes,0,Math.min(5,pdfBytes.byteLength)));
  if(signature!=='%PDF-')throw Error('البيانات المستلمة ليست ملف PDF صالحاً.');
  const pdfBlob=new Blob([pdfBytes],{type:'application/pdf'});
  const objectUrl=URL.createObjectURL(pdfBlob);
  host.dataset.pdfObjectUrl=objectUrl;
  showNativePdf(objectUrl);
 }catch(error){
  console.error('Academy native PDF reader failed:',error);
  host.innerHTML='<div class="notice pdf-error">تعذر عرض ملف PDF الأصلي داخل الأكاديمية: '+esc(error?.message||'خطأ غير معروف')+'. أعد المحاولة عند توفر الاتصال أو أبلغ إدارة الأكاديمية عن المرجع.</div>';
 }
}
async function drawAcademyTextReference(ref){
 const host=document.getElementById('academyTextReader');if(!host)return;
 host.innerHTML='<div class="notice">جارٍ جلب النص الكامل من مستودع النصوص العلمية المفتوحة...</div>';
 try{
  const sourceUrl=String(referenceUrl(ref)||'');
  const pmcidMatch=sourceUrl.match(/PMC\d+/i);
  const bookMatch=sourceUrl.match(/books\/(NBK\d+)/i);
  if(!pmcidMatch&&!bookMatch)throw Error('لا يوجد معرّف نص كامل صالح لهذا المرجع.');
  const endpoint=pmcidMatch
   ?'https://upmluemrhkadcffcsuzt.supabase.co/functions/v1/academy-reference-proxy?pmcid='+encodeURIComponent(pmcidMatch[0].toUpperCase())+'&format=xml'
   :'https://upmluemrhkadcffcsuzt.supabase.co/functions/v1/academy-reference-proxy?bookid='+encodeURIComponent(bookMatch[1].toUpperCase())+'&format=bookxml';
  const textCache=('caches' in window)?await caches.open('alhakim-academy-reference-text-v2'):null;
  const localTextKey=academyReferenceCacheKey(ref,'text');
  let response=textCache?(await textCache.match(localTextKey)||await textCache.match(endpoint)):null;
  if(!response){
   if(!navigator.onLine)throw Error('هذا النص لم تتم مزامنته بعد للقراءة دون إنترنت. افتحه مرة واحدة مع الاتصال ليُحفظ محلياً.');
   response=await fetch(endpoint,{method:'GET',headers:{'Accept':'application/xml,text/xml'},cache:'force-cache'});
   if(!response.ok)throw Error('HTTP '+response.status);
   if(textCache)await textCache.put(endpoint,response.clone());
  }
  const xmlText=await response.text();
  const doc=new DOMParser().parseFromString(xmlText,'application/xml');
  if(doc.querySelector('parsererror'))throw Error('تعذر قراءة ملف النص العلمي.');
  const articleTitle=doc.getElementsByTagName('article-title')[0]?.textContent?.trim()||doc.getElementsByTagName('book-title')[0]?.textContent?.trim()||doc.getElementsByTagName('chapter-title')[0]?.textContent?.trim()||ref.title||'Full text';
  const root=document.createElement('article');root.className='academy-text-article';
  const heading=document.createElement('h2');heading.textContent=articleTitle;root.appendChild(heading);
  const makeBlock=(label,items)=>{
   if(!items.length)return;
   const section=document.createElement('section');
   const h=document.createElement('h3');h.textContent=label;section.appendChild(h);
   for(const value of items){const p=document.createElement('p');p.textContent=value;section.appendChild(p)}
   root.appendChild(section);
  };
  const abstract=doc.getElementsByTagName('abstract')[0];
  const abstractText=abstract?Array.from(abstract.getElementsByTagName('p')).map(x=>x.textContent.trim()).filter(Boolean):[];
  makeBlock('Abstract',abstractText);
  const body=doc.getElementsByTagName('body')[0]||doc.getElementsByTagName('book-body')[0]||doc.getElementsByTagName('book-part')[0]||doc.documentElement;
  if(body){
   const walk=(node)=>{
    Array.from(node.children||[]).forEach(child=>{
     const name=(child.localName||child.tagName||'').toLowerCase();
     if(name==='sec'||name==='book-part'||name==='chapter'||name==='section'){
      const title=Array.from(child.children||[]).find(x=>['title','chapter-title','book-part-title'].includes((x.localName||'').toLowerCase()));
      if(title&&title.textContent.trim()){const h=document.createElement('h3');h.textContent=title.textContent.trim();root.appendChild(h)}
      walk(child);
     }else if(name==='p'){
      const value=child.textContent.trim();if(value){const p=document.createElement('p');p.textContent=value;root.appendChild(p)}
     }else if(name==='list'){
      const ul=document.createElement('ul');
      Array.from(child.children||[]).filter(x=>['list-item','item'].includes((x.localName||'').toLowerCase())).forEach(item=>{
       const li=document.createElement('li');li.textContent=item.textContent.trim();ul.appendChild(li);
      });
      if(ul.children.length)root.appendChild(ul);
     }else if(name==='fig'){
      const caption=Array.from(child.children||[]).find(x=>(x.localName||'').toLowerCase()==='caption');
      if(caption){const p=document.createElement('p');p.textContent='Figure: '+caption.textContent.trim();root.appendChild(p)}
     }else if(name!=='title'&&name!=='chapter-title'&&name!=='book-part-title'){
      walk(child);
     }
    });
   };
   walk(body);
  }
  if(root.children.length<=1)throw Error('لم يعثر مصدر النص على محتوى كامل قابل للعرض.');
  root.style.cssText='background:#fff;color:#182230;padding:18px;border-radius:12px;line-height:1.85;overflow-wrap:anywhere';
  root.querySelectorAll('h2').forEach(x=>x.style.cssText='font-size:1.35rem;line-height:1.5;margin:0 0 18px');
  root.querySelectorAll('h3').forEach(x=>x.style.cssText='font-size:1.08rem;margin:22px 0 8px;padding-bottom:6px;border-bottom:1px solid #dce3eb');
  root.querySelectorAll('p,li').forEach(x=>x.style.cssText='font-size:1rem;line-height:1.85;margin:8px 0;white-space:pre-wrap');
  host.replaceChildren(root);
 }catch(error){
  host.innerHTML='<div class="notice pdf-error">تعذر عرض النص الكامل داخل القارئ: '+esc(error?.message||'خطأ غير معروف')+'. لم يتم تحويلك إلى أي موقع خارجي. أعد المحاولة عند توفر الاتصال بالإنترنت أو أبلغ إدارة الأكاديمية عن المرجع.</div>';
 }
}
async function openAcademyReference(id){
 const ref=findAcademyReference(id);if(!isAcademyReadableReference(ref)){alert('هذا المرجع غير متاح للقراءة الكاملة حالياً، لذلك لا يظهر ضمن مكتبة الطالب.');return;}
 const external=referenceUrl(ref),hasPdf=!!ref.file_path,isPdf=isAcademyPdfReference(ref),isPmc=/\/articles\/PMC\d+|\/pmc\/articles\/PMC\d+/i.test(external),source=external.startsWith('http');
 const viewerUrl=isPdf?academyReferenceProxyUrl(ref):external;
 const details='<div class="reference-meta"><p><b>Authors:</b> '+esc(ref.authors||'Not specified')+'</p><p><b>Year:</b> '+esc(ref.publication_year||'Not specified')+'</p><p><b>Publisher:</b> '+esc(ref.publisher||'Not specified')+'</p></div>';
 let content='';
 if(hasPdf)content='<div class="reference-reader-wrap"><div class="reference-reader-heading"><b>قارئ PDF الآمن — PDF.js</b><span>رابط مؤقت بعد التحقق من جلسة الطالب.</span></div><div id="academyPdfViewer" class="academy-pdf-viewer" oncontextmenu="return false"></div></div>';
 else if(source&&isPdf)content='<div class="reference-reader-wrap"><div class="reference-reader-heading"><b>قارئ PDF داخل الأكاديمية — PDF.js</b><span>يُعرض المرجع هنا دون فتح المتصفح الخارجي.</span></div><div id="academyPdfViewer" class="academy-pdf-viewer" oncontextmenu="return false"></div></div>';
 else if(source&&(isPmc||/\/books\/NBK\d+/i.test(external)))content='<div class="reference-reader-wrap"><div class="reference-reader-heading"><b>قارئ النص الكامل داخل الأكاديمية</b><span>يتم عرض النص العلمي من خدمة النصوص المفتوحة.</span></div><div id="academyTextReader" class="academy-text-reader"><div class="notice">جارٍ تجهيز النص الكامل...</div></div></div>';
 else if(source&&!navigator.onLine)content='<div class="notice">بيانات المرجع والملخص محفوظة داخل المكتبة، لكن صفحة الناشر الكاملة تحتاج إلى اتصال بالإنترنت.</div>'+(ref.abstract?'<section class="reference-abstract"><h3>الملخص المحفوظ — Abstract</h3><p>'+esc(ref.abstract)+'</p></section>':'');
 else if(source)content='<div class="notice">هذا المصدر لا يدعم حالياً القراءة الداخلية الكاملة؛ لذلك لن نعرض رابطاً خارجياً أو نحتسبه ضمن المراجع المتاحة. '+(ref.abstract?'<section class="reference-abstract"><h3>الملخص المحفوظ — Abstract</h3><p>'+esc(ref.abstract)+'</p></section>':'')+'</div>';
 else content='<div class="notice">لا يوجد ملف PDF مرفق بهذا المرجع حالياً.</div>';
 pageShell(refLabel(ref),'عرض المرجع داخل أكاديمية الحكيم','<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderLibrary()">العودة إلى المراجع</button>'+(source&&isPdf?'<button type="button" class="secondary" onclick="downloadAcademyReference(\''+esc(ref.id)+'\')">⬇ تحميل المرجع</button>':'')+'</div>'+details+content+'</div>');
 if(hasPdf)await drawAcademyPdf(ref.file_path,refLabel(ref),'',ref.offline_file_url,'',ref.id);
 else if(source&&isPdf)await drawAcademyPdf('',refLabel(ref),viewerUrl,ref.offline_file_url,external,ref.id);
 else if(source&&(isPmc||/\/books\/NBK\d+/i.test(external)))await drawAcademyTextReference(ref);
}
async function downloadAcademyReference(id){
 const ref=findAcademyReference(id);
 if(!isAcademyReadableReference(ref)){alert('هذا المرجع غير مصنف كمرجع متاح داخل الأكاديمية.');return}
 try{
  let url=referenceUrl(ref);
  if(ref.file_path)url=await academyPdfSignedUrl(ref.file_path);
  if(!url){alert('لا يوجد ملف قابل للتنزيل لهذا المرجع.');return}
  // External publisher PDFs may reject cross-origin fetch (CORS). Open the official PDF
  // directly so the browser's native PDF viewer can save it without a failed fetch.
  if(!ref.file_path){
   const downloadUrl=academyReferenceProxyUrl(ref,true);
   const a=document.createElement('a');a.href=downloadUrl;a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();return;
  }
  const response=await fetch(url);
  if(!response.ok)throw Error('تعذر تنزيل الملف ('+response.status+').');
  const blob=await response.blob();
  const safeName=String(ref.title||'academy-reference').replace(/[^\p{L}\p{N}\-_ ]/gu,'').trim().replace(/\s+/g,'-').slice(0,90)||'academy-reference';
  const objectUrl=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=objectUrl;a.download=safeName+'.pdf';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(objectUrl),1500);
 }catch(error){alert('تعذر تنزيل ملف PDF من داخل الأكاديمية: '+(error?.message||'خطأ غير معروف')+'. لم يتم فتح أي موقع خارجي.')}
}
function renderLibrary(view='home'){
 window.libraryView=view;
 const allRefs=(DB.reference_catalog||[]).filter(r=>r.status!=='archived'&&r.status!=='draft');
 const researchTypes=['research_article','systematic_review','previous_study'];
 const paperTypes=['scientific_paper'];
 const referenceTypes=['book','clinical_reference','clinical_guideline'];
 const refsOnly=allRefs.filter(r=>referenceTypes.includes(String(r.resource_type||'')));
 const research=allRefs.filter(r=>researchTypes.includes(String(r.resource_type||'')));
 const papers=allRefs.filter(r=>paperTypes.includes(String(r.resource_type||'')));
 const sortRefs=list=>list.slice().sort((a,b)=>String(b.publication_year||'').localeCompare(String(a.publication_year||''))||refLabel(a).localeCompare(refLabel(b)));
 const card=(icon,title,count,desc,action)=>'<button type="button" class="library-category-card" onclick="'+action+'"><span class="library-category-icon">'+icon+'</span><b>'+title+'</b><strong>'+count+'</strong><small>'+desc+'</small><span class="card-arrow">استعراض المحتوى ←</span></button>';
 const back='<button type="button" class="home-return" onclick="renderLibrary(\'home\')">← العودة إلى المكتبة</button>';
 if(view==='home'){
  const body='<div class="library-category-grid">'+
   card('📚','المراجع',refsOnly.length,'كتب ومراجع سريرية وإرشادات علمية',"renderLibrary('references')")+
   card('🔬','الأبحاث العلمية',research.length,'بحوث منشورة ومراجعات منهجية',"renderLibrary('research')")+
   card('📄','الأوراق العلمية',papers.length,'أوراق علمية منشورة',"renderLibrary('papers')")+
   '</div>';
  return pageShell('المكتبة العلمية | Scientific Library','مصادر أكاديمية مصنفة في أقسام مستقلة لتسهيل الوصول والقراءة.',body);
 }
 if(view==='references'){
  const available=refsOnly.filter(isAcademyReadableReference),unavailable=refsOnly.filter(r=>!isAcademyReadableReference(r));
  return pageShell('المراجع','اختر نوع الوصول إلى المراجع العلمية.',back+'<div class="library-category-grid">'+
   card('📗','المراجع المتاحة',available.length,'تُفتح مباشرة داخل الأكاديمية مع خيار تحميل',"renderLibrary('available')")+
   card('🔒','المراجع غير المتاحة',unavailable.length,'تظهر بيانات المرجع ورابط موقعه الرسمي',"renderLibrary('unavailable')")+
   '</div>');
 }
 let title='',list=[];
 if(view==='available'){title='المراجع المتاحة';list=refsOnly.filter(isAcademyReadableReference)}
 else if(view==='unavailable'){title='المراجع غير المتاحة';list=refsOnly.filter(r=>!isAcademyReadableReference(r))}
 else if(view==='research'){title='الأبحاث العلمية';list=research}
 else if(view==='papers'){title='الأوراق العلمية';list=papers}
 else {title='المكتبة العلمية';list=allRefs}
 list=sortRefs(list);
 const term=String(window.librarySearchTerm||'').toLowerCase().trim();
 if(term)list=list.filter(r=>[r.title,r.authors,r.journal,r.publisher,r.doi,...(r.keywords||[])].join(' ').toLowerCase().includes(term));
 const cards=list.map(r=>{
  const url=referenceUrl(r),readable=isAcademyReadableReference(r);
  const access=String(r.access_license||r.access_type||'حالة الوصول غير محددة');
  let action='';
  const downloadable=!!r.file_path||isAcademyPdfReference(r);
  if(view==='available'){
   action=referenceLink(r)+(downloadable?'<button type="button" class="secondary reference-open-button" onclick="downloadAcademyReference(\''+esc(r.id)+'\')">⬇ تحميل PDF</button>':'');
  }else if(view==='unavailable'){
   action=url?'<a class="secondary reference-open-button" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">🌐 الموقع الرسمي للناشر ↗</a>':'<span class="notice">لا يوجد رابط رسمي مسجل لهذا المرجع.</span>';
  }else if(readable){
   action=referenceLink(r)+(downloadable?'<button type="button" class="secondary reference-open-button" onclick="downloadAcademyReference(\''+esc(r.id)+'\')">⬇ تحميل PDF</button>':'');
  }else{
   action=url?'<a class="secondary reference-open-button" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">فتح المصدر الرسمي ↗</a>':'<span class="notice">لا يوجد رابط مصدر مسجل.</span>';
  }
  return '<article class="reference-card"><span class="tag">'+esc(referenceTypeLabel(r.resource_type))+'</span><h3>'+esc(refLabel(r))+'</h3><p><b>المؤلفون:</b> '+esc(first(r,['authors'],'غير محدد'))+'</p><p><b>سنة النشر:</b> '+esc(first(r,['publication_year'],'غير محدد'))+'</p><p><b>المجلة/الناشر:</b> '+esc(first(r,['journal','publisher'],'غير محدد'))+'</p>'+(r.abstract?'<p>'+esc(r.abstract)+'</p>':'')+(r.doi?'<p><b>DOI:</b> '+esc(r.doi)+'</p>':'')+'<p class="reference-access"><b>الوصول:</b> '+esc(access)+'</p><div class="library-reference-actions">'+action+'</div></article>';
 }).join('');
 const filters='<div class="library-filters"><input id="librarySearch" type="search" placeholder="ابحث بالعنوان أو المؤلف أو DOI" value="'+esc(window.librarySearchTerm||'')+'" oninput="filterScientificLibrary()"></div>';
 return pageShell(title,'عدد المواد: '+list.length+'.',back+filters+'<div class="reference-grid">'+(cards||'<div class="notice">لا توجد مواد في هذا القسم حالياً.</div>')+'</div>');
}
function filterScientificLibrary(){window.librarySearchTerm=document.getElementById('librarySearch')?.value||'';renderLibrary(window.libraryView||'home')}

/* Lecture narration controls: browser-native speech synthesis. */
const lectureNarrators=new Map();
function lectureAudioText(raw){
 const doc=new DOMParser().parseFromString(String(raw||''),'text/html');
 return (doc.body.textContent||'').replace(/https?:\/\/\S+/g,' ').replace(/\s+/g,' ').trim();
}
function lectureAudioPanel(lang,raw){
 const text=lectureAudioText(raw),label=lang==='ar'?'الشرح العربي':'المحاضرة الإنجليزية';
 if(!text)return '';
 if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return '';
 const id='lectureAudio_'+lang;
 return '<section class="lecture-audio-compact" id="'+id+'" data-lang="'+lang+'"><button type="button" class="lecture-audio-icon" data-audio="toggle" aria-label="إظهار أدوات الصوت" title="الاستماع إلى '+label+'">🔊</button><div class="lecture-audio-popover" hidden><b>'+label+'</b><span class="lecture-audio-state" id="'+id+'_state">جاهز</span><div class="lecture-audio-actions"><button type="button" data-audio="play" aria-label="تشغيل" title="تشغيل">▶</button><button type="button" data-audio="pause" aria-label="إيقاف مؤقت" title="إيقاف مؤقت">Ⅱ</button><button type="button" data-audio="resume" aria-label="متابعة" title="متابعة">⏵</button><button type="button" data-audio="stop" aria-label="إيقاف" title="إيقاف">■</button><button type="button" data-audio="back" aria-label="الجملة السابقة" title="الجملة السابقة">↶</button><button type="button" data-audio="next" aria-label="الجملة التالية" title="الجملة التالية">↷</button></div><label class="lecture-audio-speed">سرعة القراءة <select data-audio="rate"><option value="0.75">بطيئة جداً</option><option value="0.8">بطيئة</option><option value="0.85" selected>طبيعية وواضحة</option><option value="0.9">متوسطة</option><option value="1">عادية</option></select></label><div class="lecture-audio-progress"><span id="'+id+'_progress"></span></div><small id="'+id+'_position">جاهز</small></div></section>';
}
function initLectureAudio(){
 document.querySelectorAll('.lecture-audio-compact:not(.unavailable)').forEach(panel=>{
  const lang=panel.dataset.lang,id=panel.id,source=lang==='ar'?window.currentLectureAudio?.ar:window.currentLectureAudio?.en;
  if(!source)return;
  const sentences=source.split(/(?<=[.!?؟。])\s+/u).map(x=>x.trim()).filter(Boolean);
  const state=document.getElementById(id+'_state'),position=document.getElementById(id+'_position'),progress=document.getElementById(id+'_progress');
  let index=0,rate=0.85,active=false;
  const stop=()=>{speechSynthesis.cancel();active=false};
  const paint=message=>{if(state)state.textContent=message;if(position)position.textContent='الجملة '+(active?Math.min(index+1,sentences.length):index)+' من '+sentences.length;if(progress)progress.style.width=(sentences.length?index/sentences.length*100:0)+'%'};
  const speak=()=>{
   if(index>=sentences.length){active=false;paint('اكتملت المحاضرة');if(progress)progress.style.width='100%';return}
   speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(sentences[index]);utterance.lang=lang==='ar'?'ar':'en';utterance.rate=rate;utterance.pitch=1;utterance.volume=1;
   const voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(lang==='ar'?'ar':'en'));const voice=voices.find(v=>/natural|neural|google|microsoft/i.test(v.name))||voices.find(v=>v.default)||voices[0];if(voice)utterance.voice=voice;
   utterance.onstart=()=>paint('جاري التشغيل');
   utterance.onend=()=>{if(!active)return;index++;if(index<sentences.length)speak();else{active=false;paint('اكتملت المحاضرة');if(progress)progress.style.width='100%'}};
   utterance.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted'){active=false;paint('تعذر تشغيل الصوت')}};
   speechSynthesis.speak(utterance);
  };
  panel.addEventListener('click',e=>{
   const button=e.target.closest('button[data-audio]');if(!button)return;
   if(button.dataset.audio==='toggle'){const pop=panel.querySelector('.lecture-audio-popover');pop.hidden=!pop.hidden;button.setAttribute('aria-expanded',String(!pop.hidden));return;}
   switch(button.dataset.audio){
    case 'play':index=0;active=true;speak();break;
    case 'pause':if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();paint('إيقاف مؤقت')}break;
    case 'resume':if(speechSynthesis.paused){active=true;speechSynthesis.resume();paint('جاري التشغيل')}else if(!speechSynthesis.speaking){active=true;speak()}break;
    case 'stop':stop();index=0;paint('تم الإيقاف');if(progress)progress.style.width='0%';break;
    case 'next':if(index<sentences.length-1){index++;active=true;speak()}break;
    case 'back':index=Math.max(0,index-1);active=true;speak();break;
   }
  });
  panel.querySelector('[data-audio="rate"]').addEventListener('change',e=>{rate=Number(e.target.value)||1;if(active&&!speechSynthesis.paused)speak()});
  lectureNarrators.set(lang,{stop});paint('جاهز للتشغيل');
 });
}

function lectureIllustration(l){
 const map={
  GEO:['./assets/geometrical-optics/geo-refraction-snell.svg','Refraction of light — schematic'],
  VIS:['./assets/visual-optics/vis-refractive-errors.svg','Refractive states and retinal focal plane'],
  REF:['./assets/clinical-refraction/ref-subjective-phoropter.svg','Phoropter and subjective refraction'],
  CL:['./assets/contact-lenses/cl-pre-fit-assessment.svg','Contact lens pre-fitting assessment'],
  PED:['./assets/pediatric-optometry/ped-amblyopia-development.svg','Visual development and amblyopia'],
  OD:['./assets/ocular-diseases/od-red-eye-triage.svg','Red-eye clinical triage'],
  DO:['./assets/dispensing-optics/do-lens-verification.svg','Lens verification with a lensmeter'],
  EPH:['./assets/ocular-pharmacology/eph-topical-delivery.svg','Topical ophthalmic drug delivery'],
  ANP:['./assets/anatomy-physiology/anp-001-illustration.svg','Anatomy and physiology illustration'],
  BV:['./assets/binocular-vision/binocular-vision-levels.svg','Binocular vision schematic'],
  CO:['./assets/clinical-optometry/clinical-examination-flow.svg','Clinical examination workflow'],
  LV:['./assets/low-vision/functional-vision-assessment.svg','Functional vision assessment']
 };
 const specific={
  'ANP-COR-001':['./assets/anatomy-physiology/anp-cornea-layers.svg','Corneal layers and transparency'],
  'VIS-MYO-001':['./assets/visual-optics/vis-myopia-focus.svg','Myopic retinal focus and minus-lens correction'],
  'BV-ACC-001':['./assets/binocular-vision/bv-accommodation.svg','Accommodation mechanism — Helmholtz model'],
  'CL-PRE-001':['./assets/contact-lenses/cl-pre-fitting-map.svg','Contact lens pre-fitting assessment pathway'],
  'PED-AMB-001':['./assets/pediatric-optometry/ped-amblyopia-causes.svg','Common amblyogenic factors'],
  'OD-RED-001':['./assets/ocular-diseases/od-red-eye-redflags.svg','Red-eye triage: urgent warning signs'],
  'LV-LOW-001':['./assets/low-vision/lv-functional-goals.svg','Functional low-vision assessment goals'],
  'DO-LENS-001':['./assets/dispensing-optics/do-lens-designs.svg','Single-vision, bifocal and progressive lens designs'],
  'EPH-PRINC-001':['./assets/ocular-pharmacology/eph-ocular-routes.svg','Common ocular drug delivery routes'],

  'GEO-LIGHT-001':['./assets/geometrical-optics/geo-refraction-snell.svg','Light refraction and ray behaviour'],
  'GEO-REFL-001':['./assets/geometrical-optics/geo-reflection-plane-mirror.svg','Reflection at a plane mirror'],
  'GEO-N-001':['./assets/geometrical-optics/geo-refractive-index.svg','Refractive index and light speed'],
  'GEO-TIR-001':['./assets/geometrical-optics/geo-total-internal-reflection.svg','Critical angle and total internal reflection'],
  'GEO-MIR-001':['./assets/geometrical-optics/geo-spherical-mirrors.svg','Spherical mirror terminology'],
  'GEO-LENS-001':['./assets/geometrical-optics/geo-thin-lenses.svg','Converging thin lens ray behaviour'],
  'ANP-VP-001':['./assets/anatomy-physiology/anp-visual-pathway.svg','Retino-geniculo-cortical visual pathway'],
  'GEO-REF-001':['./assets/geometrical-optics/geo-snell-law-refraction.svg',"Snell's law: incident and refracted rays"],
  'REF-SUB-001':['./assets/clinical-refraction/ref-subjective-sequence.svg','Structured subjective refraction sequence'],
  'CO-EXAM-001':['./assets/clinical-optometry/co-comprehensive-exam-pathway.svg','Comprehensive eye examination pathway']
 };
 const dept=String(l?.department_code||'').toUpperCase();
 const contextual=lectureContextualIllustrations(l);
 const item=contextual.length?[contextual[0][1],contextual[0][2]]:(specific[String(l?.code||'').toUpperCase()]||specific[String(l?.id||'')]||map[dept]||(['EINS'].includes(dept)?['./assets/clinical-optometry/slit-lamp-biomicroscope.svg','Ophthalmic instruments and examination']:['./assets/clinical-optometry/co-comprehensive-exam-pathway.svg','Clinical optometry assessment pathway']));
 if(!item)return '';
 return '<figure class="lecture-illustration" style="margin:24px auto;max-width:900px;text-align:center"><img class="lesson-real-photo" src="'+esc(academyImageSource(item[0]))+'" alt="'+esc(item[1])+'" loading="eager" style="display:block;width:100%;height:auto;max-height:520px;object-fit:contain;border:1px solid #d5e1ea;border-radius:16px;background:#f7fafc" onerror="this.closest(\'figure\').hidden=true"><figcaption style="margin-top:8px;color:var(--muted,#587080);font-size:.92rem">'+esc(item[1])+' · HAKIM OPTICS ACADEMY</figcaption></figure>';
}
function focusedDeviceGallery(l){
 const galleries={
  BV:[['../binocular-vision/synoptophore.svg','Synoptophore'],['../binocular-vision/prism-bar.svg','Prism bar']],
  PED:[['../pediatric-optometry/paediatric-acuity-chart.svg','Paediatric acuity charts']],
  LV:[['../low-vision/electronic-magnifier.svg','Electronic video magnifier'],['../low-vision/distance-telescope.svg','Distance telescope']],
  CL:[['../contact-lenses/fluorescein-pattern.svg','Fluorescein fit assessment']],
  OD:[['../ocular-diseases/fluorescein-examination.svg','Fluorescein corneal examination']],
  REF:[['../clinical-refraction/jackson-cross-cylinder.svg','Jackson cross-cylinder']]
 };
 const rows=galleries[String(l?.department_code||'').toUpperCase()];
 if(!rows)return '';
 return '<section class="focused-device-gallery" style="margin:24px 0"><h2>Clinical Instruments and Assessment — الأجهزة ووسائل الفحص</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px">'+rows.map(x=>'<figure style="margin:0;padding:10px;border:1px solid #d5e1ea;border-radius:14px;background:#fff"><img loading="eager" src="./assets/'+x[0].replace(/^\.\.\//,'')+'" alt="'+esc(x[1])+'" style="width:100%;height:auto;display:block" onerror="this.closest(\'figure\').hidden=true"><figcaption style="text-align:center;font-weight:600;margin-top:6px">'+esc(x[1])+'</figcaption></figure>').join('')+'</div></section>';
}
function clinicalDeviceGallery(){
 const items=[
  ['slit-lamp.svg','Slit-lamp biomicroscope'],['retinoscope.svg','Streak retinoscope'],['autorefractor.svg','Autorefractor'],['phoropter.svg','Phoropter'],['keratometer.svg','Keratometer'],['corneal-topographer.svg','Corneal topographer'],['lensmeter.svg','Lensmeter / focimeter'],['direct-ophthalmoscope.svg','Direct ophthalmoscope'],['tonometer.svg','Applanation tonometer'],['oct.svg','Optical coherence tomography'],['visual-field-analyser.svg','Automated perimeter'],['trial-frame.svg','Trial frame and lens set']
 ];
 return '<section class="clinical-device-gallery"><h2>Clinical Instruments — الأجهزة السريرية</h2><p>Original educational schematics. Instrument design and controls vary by manufacturer.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">'+items.map(x=>'<figure style="margin:0;padding:10px;border:1px solid #d5e1ea;border-radius:14px;background:#fff"><img loading="eager" src="./assets/clinical-optometry/'+x[0]+'" alt="'+esc(x[1])+'" style="width:100%;height:auto;display:block" onerror="this.closest(\'figure\').hidden=true"><figcaption style="text-align:center;font-weight:600;margin-top:6px">'+esc(x[1])+'</figcaption></figure>').join('')+'</div></section>';
}

function lectureContextualFigure(src,alt){
 return '<figure class="lecture-illustration contextual-lecture-figure" style="margin:20px auto;max-width:860px;text-align:center"><img class="lesson-real-photo" src="'+esc(academyImageSource(src))+'" alt="'+esc(alt)+'" loading="eager" style="display:block;width:100%;height:auto;max-height:460px;object-fit:contain;border:1px solid #d5e1ea;border-radius:14px;background:#f7fafc" onerror="this.closest(\'figure\').hidden=true"><figcaption style="margin-top:7px;color:var(--muted,#587080);font-size:.9rem">'+esc(alt)+' · HAKIM OPTICS ACADEMY</figcaption></figure>';
}
function insertContextualFigure(body,pattern,src,alt){
 // Match against the complete paragraph text, not an individual text node.
 // This remains reliable when key terms are wrapped in <b>, <em> or other inline tags.
 let re;try{re=new RegExp(pattern,'i')}catch(_){return false}
 const paragraphs=[...body.querySelectorAll('p')];
 const paragraph=paragraphs.find(p=>re.test(p.textContent||''));
 if(!paragraph)return false;
 const holder=body.ownerDocument.createElement('div');
 holder.innerHTML=lectureContextualFigure(src,alt);
 const figure=holder.firstElementChild;if(!figure)return false;
 paragraph.after(figure);
 return true;
}
function lectureContextualIllustrations(l){
 const map={"GEO-007-L01":[["Rectilinear propagation states[^.]*\\.","./assets/geometrical-optics/geo-light-rays.svg","Straight-line propagation of light rays"],["An extended source may produce[^.]*\\.","./assets/geometrical-optics/geo-wavefront-rays.svg","Ray paths and wavefront representation"]],"GEO-017-L01":[["Lens geometry links physical shape[^.]*\\.","./assets/geometrical-optics/geo-thin-lenses.svg","Convex and concave lens geometry"],["Surface descriptions require[^.]*\\.","./assets/geometrical-optics/geo-thin-lenses.svg","Lens surface curvature and optical form"]],"GEO-018-L01":[["Lens power is[^.]*\\.","./assets/geometrical-optics/geo-lens-power.svg","Lens power and focal length"],["The dioptre is[^.]*\\.","./assets/geometrical-optics/geo-lens-power.svg","Dioptric measurement of lens power"]],"GEO-019-L01":[["An optical image forms[^.]*\\.","./assets/geometrical-optics/geo-lens-image-formation.svg","Image formation by a thin lens"],["A ray parallel to the principal axis[^.]*\\.","./assets/geometrical-optics/geo-lens-image-formation.svg","Principal rays used to locate a lens image"]],"GEO-040-L01":[["An optical fibre is a flexible dielectric waveguide[^.]*\\.","./assets/geometrical-optics/geo-fibre-optics.svg","Core, cladding and guided light in an optical fibre"],["Guidance by total internal reflection requires[^.]*\\.","./assets/geometrical-optics/geo-total-internal-reflection.svg","Total internal reflection at the core-cladding boundary"]],"ANP-COR-001":[["The classical layers are[^.]*\\.","./assets/anatomy-physiology/anp-cornea-layers.svg","Five classical layers of the cornea"],["Corneal transparency depends[^.]*\\.","./assets/clinical-optometry/tear-film-layers.svg","Tear film and optical surface factors"],["Assessment may include[^.]*\\.","./assets/clinical-optometry/slit-lamp-biomicroscope.svg","Slit-lamp examination of the anterior segment"]],"GEO-014-L01":[["Dispersion of light occurs[^.]*\\.","./assets/geometrical-optics/geo-dispersion-prism.svg","Dispersion of white light through a prism"]],"GEO-REF-001":[["Snell's law is[^.]*\\.","./assets/geometrical-optics/geo-snell-law-refraction.svg","Snell's law and the normal"],["Light entering a higher-index medium[^.]*\\.","./assets/geometrical-optics/geo-refractive-index.svg","Refractive index and bending of light"],["Total internal reflection requires[^.]*\\.","./assets/geometrical-optics/geo-total-internal-reflection.svg","Conditions for total internal reflection"],["Refractive index varies with wavelength[^.]*\\.","./assets/geometrical-optics/geo-dispersion-prism.svg","Dispersion of white light by a prism"]],"VIS-MYO-001":[["Myopia is a refractive state[^.]*\\.","./assets/visual-optics/vis-myopia-focus.svg","Myopic focal point in front of the retina"],["A minus \\(diverging\\) lens[^.]*\\.","./assets/visual-optics/vis-refractive-errors.svg","Refractive error correction with spectacle lenses"],["High or progressive myopia[^.]*\\.","./assets/clinical-optometry/retinal-disorders-assessment.svg","Ocular health assessment in progressive myopia"]],"REF-SUB-001":[["A typical process includes[^.]*\\.","./assets/clinical-refraction/ref-subjective-sequence.svg","Sequence of subjective refraction"],["Jackson cross-cylinder may assist[^.]*\\.","./assets/clinical-refraction/jackson-cross-cylinder.svg","Jackson cross-cylinder for astigmatic refinement"],["Autorefraction is a starting point[^.]*\\.","./assets/clinical-optometry/autorefractor.svg","Autorefraction as an objective starting point"]],"BV-ACC-001":[["In the conventional Helmholtz model[^.]*\\.","./assets/binocular-vision/bv-accommodation.svg","Accommodation: ciliary muscle and crystalline lens"],["Assessment may include[^.]*\\.","./assets/binocular-vision/accommodative-insufficiency.svg","Accommodative assessment and insufficiency pattern"],["facility is the ability to stimulate and relax accommodation repeatedly[^.]*\\.","./assets/binocular-vision/accommodative-infacility.svg","Accommodative facility testing with plus and minus lens flippers"]],"CL-PRE-001":[["History includes[^.]*\\.","./assets/contact-lenses/cl-pre-fitting-map.svg","Contact lens history and suitability pathway"],["Examination may include[^.]*\\.","./assets/contact-lenses/fluorescein-pattern.svg","Fluorescein pattern assessment of lens fit"],["Teach hand hygiene[^.]*\\.","./assets/contact-lenses/cl-contact-lens-safety.svg","Contact lens hygiene and safety counselling"]],"PED-AMB-001":[["Common amblyogenic factors include[^.]*\\.","./assets/pediatric-optometry/ped-amblyopia-causes.svg","Amblyogenic factors"],["Assessment is age-appropriate[^.]*\\.","./assets/pediatric-optometry/paediatric-acuity-chart.svg","Age-appropriate paediatric visual acuity assessment"],["Management is cause- and age-dependent[^.]*\\.","./assets/pediatric-optometry/ped-amblyopia-treatment.svg","Amblyopia management sequence"]],"OD-RED-001":[["Causes range from[^.]*\\.","./assets/ocular-diseases/od-red-eye-triage.svg","Differential approach to red eye"],["Red flags include[^.]*\\.","./assets/ocular-diseases/od-red-eye-action-pathway.svg","Red-eye urgency and referral pathway"],["Assessment may include[^.]*\\.","./assets/ocular-diseases/fluorescein-examination.svg","Fluorescein and slit-lamp corneal assessment"]],"LV-LOW-001":[["Functional assessment examines[^.]*\\.","./assets/low-vision/lv-functional-goals.svg","Functional goals in low-vision assessment"],["Assessment may include[^.]*\\.","./assets/low-vision/lv-magnification-principle.svg","Magnification and working-distance factors in low vision"],["Rehabilitation is individualized[^.]*\\.","./assets/low-vision/electronic-magnifier.svg","Electronic magnification for rehabilitation"]],"DO-LENS-001":[["Lens design includes[^.]*\\.","./assets/dispensing-optics/do-lens-designs.svg","Single-vision, bifocal and progressive lens designs"],["Higher-index materials may[^.]*\\.","./assets/geometrical-optics/geo-refractive-index.svg","Refractive index and lens material choice"],["Material properties include[^.]*\\.","./assets/dispensing-optics/do-abbe-chromatic-aberration.svg","Abbe value and chromatic aberration in spectacle materials"],["Verify lens power[^.]*\\.","./assets/dispensing-optics/do-lens-verification.svg","Lens verification using a lensmeter"]],"CO-EXAM-001":[["A general workflow includes[^.]*\\.","./assets/clinical-optometry/co-comprehensive-exam-pathway.svg","Comprehensive eye examination sequence"],["objective and subjective refraction[^.]*\\.","./assets/clinical-optometry/refraction-instruments.svg","Objective and subjective refraction instruments"],["anterior segment examination[^.]*\\.","./assets/clinical-optometry/slit-lamp-biomicroscope.svg","Slit-lamp biomicroscopy"],["posterior segment and visual field assessment[^.]*\\.","./assets/clinical-optometry/direct-ophthalmoscope.svg","Posterior segment assessment with direct ophthalmoscopy"],["posterior segment and visual field assessment[^.]*\\.","./assets/clinical-optometry/visual-field-analyser.svg","Automated visual-field assessment"]],"ANP-VP-001":[["Ganglion-cell axons form the optic nerve[^.]*\\.","./assets/anatomy-physiology/anp-visual-pathway.svg","Retinal output and optic nerve"],["At the optic chiasm[^.]*\\.","./assets/clinical-optometry/neuro-visual-pathway.svg","Optic chiasm fibre arrangement"],["Broad localization principles include[^.]*\\.","./assets/anatomy-physiology/anp-visual-field-lesion-map.svg","Visual field patterns and lesion localization"]],"EPH-PRINC-001":[["Ophthalmic medicines may be administered[^.]*\\.","./assets/ocular-pharmacology/eph-ocular-routes.svg","Routes of ocular drug administration"],["Topical delivery is convenient[^.]*\\.","./assets/ocular-pharmacology/eph-topical-delivery.svg","Topical ocular drug delivery and barriers"],["Some topical drugs can produce systemic effects[^.]*\\.","./assets/clinical-optometry/medication-ocular-effects.svg","Potential systemic and ocular medication effects"]],"GEO-LIGHT-001":[["Visible light is only a small part[^.]*\\.","./assets/geometrical-optics/geo-light-spectrum.svg","Visible light within the electromagnetic spectrum"],["A light ray is an idealised line[^.]*\\.","./assets/geometrical-optics/geo-light-rays.svg","Ray and beam models"],["A wavefront joins points[^.]*\\.","./assets/geometrical-optics/geo-wavefront-rays.svg","Wavefronts and ray direction in an optical medium"]],"GEO-REFL-001":[["Specular reflection occurs[^.]*\\.","./assets/geometrical-optics/geo-reflection-plane-mirror.svg","Specular reflection at a plane mirror"],["A plane mirror forms[^.]*\\.","./assets/geometrical-optics/geo-plane-mirror-image.svg","Virtual image formation by a plane mirror"],["Diffuse reflection occurs[^.]*\\.","./assets/geometrical-optics/geo-specular-diffuse.svg","Comparison of specular and diffuse reflection"]],"GEO-N-001":[["The absolute refractive index[^.]*\\.","./assets/geometrical-optics/geo-refractive-index.svg","Absolute refractive index and light speed"],["At an interface, Snell's law[^.]*\\.","./assets/geometrical-optics/geo-snell-law-refraction.svg","Refractive index and Snell's law"],["For light passing from medium 1 to medium 2[^.]*\\.","./assets/geometrical-optics/geo-refractive-speed.svg","Relative refractive index and the speed ratio"]],"GEO-TIR-001":[["For n₁ > n₂[^.]*\\.","./assets/geometrical-optics/geo-total-internal-reflection.svg","Critical angle derivation and ray path"],["Total internal reflection is used[^.]*\\.","./assets/geometrical-optics/geo-fibre-optics.svg","Total internal reflection in an optical fibre"],["The angle of incidence for which the refracted ray[^.]*\\.","./assets/geometrical-optics/geo-critical-angle.svg","Critical angle and the limiting refracted ray"]],"GEO-MIR-001":[["A concave mirror has[^.]*\\.","./assets/geometrical-optics/geo-spherical-mirrors.svg","Concave and convex spherical mirrors"],["A concave mirror can form[^.]*\\.","./assets/geometrical-optics/geo-mirror-image-formation.svg","Image formation by spherical mirrors"],["The principal focus \\(F\\) is the point[^.]*\\.","./assets/geometrical-optics/geo-mirror-principal-rays.svg","Principal focus and ray construction for a concave mirror"]],"GEO-LENS-001":[["A positive \\(converging\\) lens[^.]*\\.","./assets/geometrical-optics/geo-thin-lenses.svg","Converging and diverging thin lenses"],["A positive lens can produce[^.]*\\.","./assets/geometrical-optics/geo-lens-image-formation.svg","Image formation by a thin lens"],["The lens power in air is P = 1/f[^.]*\\.","./assets/geometrical-optics/geo-lens-power.svg","Lens power, focal length and the dioptre"]]};
 const aliases={
  'GEO-004-L01':'GEO-LIGHT-001','GEO-006-L01':'GEO-LIGHT-001',
  'GEO-008-L01':'GEO-REFL-001','GEO-009-L01':'GEO-REFL-001',
  'GEO-010-L01':'GEO-MIR-001','GEO-011-L01':'GEO-REF-001',
  'GEO-012-L01':'GEO-N-001','GEO-013-L01':'GEO-TIR-001',
  'GEO-014-L01':'GEO-REF-001','GEO-016-L01':'GEO-LENS-001',
  'ANP-007-L01':'ANP-COR-001','ANP-019-L01':'ANP-VP-001',
  'BV-027-L01':'BV-ACC-001',
  'REF-011-L01':'REF-SUB-001',
  'CL-030-L01':'CL-PRE-001',
  'PED-018-L01':'PED-AMB-001',
  'DO-041-L01':'OD-RED-001',
  'LV-005-L01':'LV-LOW-001',
  'OD-011-L01':'DO-LENS-001',
  'CO-002-L01':'CO-EXAM-001',
  'EPH-036-L01':'EPH-PRINC-001'
 };
 const code=String(l?.code||'').toUpperCase();
 return map[code]||map[aliases[code]]||map[String(l?.id||'')]||[];
}

function bindAcademyImageFallbacks(root=document){
 root.querySelectorAll('img[src]').forEach(img=>{
  if(img.dataset.academyFallbackBound)return;
  img.dataset.academyFallbackBound='1';
  const appBase=new URL('./',location.href);
  const resolveFallback=()=>{
   let original=img.getAttribute('data-original-src')||'';
   // If a project-site asset URL fails, retry the identical repository asset from
   // GitHub's raw host. This is an online fallback; the local asset remains primary
   // so the Service Worker can still serve it offline.
   if(/^\.?\/?assets\//i.test(original)){
    const relative=original.replace(/^\.\//,'');
    original='https://raw.githubusercontent.com/log27250/Alhakim-Optics-Academy/main/'+relative.split('/').map(x=>encodeURIComponent(x)).join('/');
   }
   if(!original){
    try{
     const current=new URL(img.getAttribute('src')||'',location.href);
     if(current.pathname.includes('/__offline_media__/')){
      for(const [source,local] of offlineMediaMap){
       try{if(new URL(local,location.href).href===current.href){original=source;break}}catch(_){}
      }
     }else if(current.origin===location.origin&&current.pathname.startsWith(appBase.pathname)){
      const relative=current.pathname.slice(appBase.pathname.length);
      original='https://raw.githubusercontent.com/log27250/Alhakim-Optics-Academy/main/'+relative.split('/').map(x=>encodeURIComponent(decodeURIComponent(x))).join('/');
     }
    }catch(_){}
   }
   return original;
  };
  const fallback=()=>{
   if(img.dataset.academyFallbackTried){img.classList.add('lesson-image-unavailable');return}
   img.dataset.academyFallbackTried='1';
   const fallbackUrl=resolveFallback();
   if(fallbackUrl){
    const current=img.getAttribute('src')||'';
    if(current!==fallbackUrl){img.src=fallbackUrl;return}
   }
   img.classList.add('lesson-image-unavailable');
  };
  img.addEventListener('error',fallback);
  // Images can fail before this function binds the listener because the lesson
  // HTML is inserted before the fallback pass. Handle already-failed images too.
  if(img.complete&&img.naturalWidth===0)fallback();
 });
}
function renderLectureContentWithIllustration(l){
 const enHtml=renderLectureMarkdown(String(l.content_en||''),false);
 const hasInlineArabic=/\*\*الشرح بالعربي:\*\*/.test(String(l.content_en||''))||(/^(?:CL|PED)-/.test(String(l.code||''))&&/[\u0600-\u06FF]/.test(String(l.content_en||'')));
 // Contact Lens and Pediatric Optometry lessons pair Arabic explanations with English
 // paragraphs inside content_en. Do not append the separate legacy Arabic copy again.
 const arHtml=hasInlineArabic?'':renderLectureMarkdown(String(l.content_ar||''),true);
 const enDoc=new DOMParser().parseFromString(enHtml,'text/html');
 const arDoc=new DOMParser().parseFromString(arHtml,'text/html');
 const enBody=enDoc.querySelector('.lecture-body'),arBody=arDoc.querySelector('.lecture-body');
 const doc=document.implementation.createHTMLDocument('');
 const body=doc.createElement('div');body.className='lecture-body lecture-bilingual';body.dir='ltr';body.lang='en';
 if(enBody)for(const node of [...enBody.childNodes])body.appendChild(doc.importNode(node,true));
 if(arBody&&arBody.childNodes.length){
  const heading=doc.createElement('h2');heading.className='lecture-h2';heading.dir='rtl';heading.lang='ar';heading.textContent='الشرح باللغة العربية';body.appendChild(heading);
  for(const node of [...arBody.childNodes])body.appendChild(doc.importNode(node,true));
 }
 if(!body.childNodes.length){const p=doc.createElement('p');p.textContent='Lecture content is not available.';body.appendChild(p)}
 // Rewrite every supported image source in the detached lesson document before rendering.
 // This is essential because the page-level cache pass cannot reach this not-yet-attached DOM.
 const localizeLessonSource=raw=>{try{const source=new URL(String(raw||'').trim(),location.href).href;return offlineMediaMap.get(source)||raw}catch(_){return raw}};
 body.querySelectorAll('img[src],source[src],image[href],image[xlink\\:href]').forEach(el=>{
  for(const attr of ['src','href','xlink:href']){
   const raw=el.getAttribute(attr);
   if(raw){const local=localizeLessonSource(raw);if(local&&local!==raw)el.setAttribute(attr,local)}
  }
 });
 body.querySelectorAll('img[srcset],source[srcset]').forEach(el=>{
  const raw=el.getAttribute('srcset');if(!raw)return;
  const rewritten=raw.split(',').map(candidate=>{
   const parts=candidate.trim().split(/\s+/);if(!parts[0])return candidate;
   const local=localizeLessonSource(parts[0]);return [local,...parts.slice(1)].join(' ');
  }).join(', ');
  el.setAttribute('srcset',rewritten);
 });
 body.querySelectorAll('[style]').forEach(el=>{
  const style=el.getAttribute('style');if(!style||!style.includes('url('))return;
  el.setAttribute('style',style.replace(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi,(match,quote,url)=>{
   const local=localizeLessonSource(url);return local&&local!==url?'url('+quote+local+quote+')':match;
  }));
 });
 // The same Oculus direct-ophthalmoscope stock photo was copied into unrelated anatomy and indirect-ophthalmoscopy lessons.
 if(!['DO-016-L01','EINS-001-L01'].includes(String(l.code||''))){
  body.querySelectorAll('img[src]').forEach(img=>{
   if(/Oculus_Ophthalmoscope\.JPG/i.test(img.getAttribute('src')||'')){
    const figure=img.closest('figure');if(figure)figure.remove();else img.remove();
   }
  });
 }
 // Remove duplicate copies of the exact same image within one lesson, keeping the first contextual occurrence.
 const seenLessonImages=new Set();
 body.querySelectorAll('img[src]').forEach(img=>{
  const raw=(img.getAttribute('src')||'').trim();
  if(!raw)return;
  let key=raw.replace(/[?#].*$/,'');
  try{
   const u=new URL(key,location.href);
   if(/(?:commons\.wikimedia\.org|upload\.wikimedia\.org)$/i.test(u.hostname)){
    const decoded=decodeURIComponent(u.pathname);
    const fileMatch=decoded.match(/(?:File:|Special:FilePath\/|\/thumb\/[^/]+\/[^/]+\/)([^/]+?)(?:\/\d+px-[^/]+)?$/i);
    if(fileMatch)key='commons-file:'+fileMatch[1].toLowerCase();
   }else if(u.hostname==='raw.githubusercontent.com'){
    key=u.pathname.toLowerCase();
   }
  }catch(_){}
  if(seenLessonImages.has(key)){
   const figure=img.closest('figure');
   if(figure)figure.remove();else img.remove();
  }else seenLessonImages.add(key);
 });
 // Place one copy of each contextual diagram after its matching explanatory paragraph.
 const contextualSources=new Set();
 for(const [pattern,src,alt] of lectureContextualIllustrations(l)){
  const key=String(src||'').replace(/[?#].*$/,'').toLowerCase();
  if(!key||contextualSources.has(key))continue;
  if(insertContextualFigure(body,pattern,src,alt))contextualSources.add(key);
 }
 return body.outerHTML;
}
async function showLesson(id){const l=DB.lessons.find(x=>String(x.id)===String(id));await loadOfflineMediaMap();if(!l||!canViewLesson(l)){pageShell('المحاضرة غير متاحة','هذا المحتوى ما زال قيد المراجعة العلمية.','<div class="notice">المحاضرات غير المنشورة متاحة لفريق الإدارة فقط.</div>');return;}if(navigator.onLine){try{await cacheLessonImagesOffline(l)}catch(e){console.warn('Could not cache lesson images for offline use:',e)}}const objectives=Array.isArray(l.learning_objectives)?l.learning_objectives.join(' · '):l.learning_objectives;const refs=Array.isArray(l.reference_titles)?l.reference_titles:[];let completion='';if(session&&isUuid(l.id)&&l.status==='published'){let done=false;try{const rows=await rest('academy_lesson_completions',`select=lesson_id&user_id=eq.${encodeURIComponent(session.user.id)}&lesson_id=eq.${encodeURIComponent(l.id)}`);done=rows.length>0}catch(e){}completion=done?'<div class="notice">✓ تم تسجيل إكمال هذا الدرس في حسابك.</div>':`<button class="primary" onclick="completeLesson('${esc(l.id)}')">تم إكمال الدرس</button><p class="muted">اضغط بعد الانتهاء من دراسة محتوى الدرس لتسجيل إنجازه.</p>`}else if(!session){completion='<div class="notice">سجّل الدخول لتسجيل إكمال الدرس وحفظ تقدمك.</div>'}else{completion='<div class="notice">هذا المحتوى محلي أو غير منشور في قاعدة البيانات؛ لا يُحتسب ضمن شروط الشهادة حتى يُنشر كسجل درس في قاعدة الأكاديمية.</div>'}const hasInlineArabic=/\*\*الشرح بالعربي:\*\*/.test(String(l.content_en||''))||(/^(?:CL|PED)-/.test(String(l.code||''))&&/[\u0600-\u06FF]/.test(String(l.content_en||'')));
 const lectureHtml=renderLectureContentWithIllustration(l);
 const slides=buildLectureSlides(lectureHtml);
 pageShell(l.title_en,departmentName(l.department_code),'<button class="home-return lecture-back" onclick="showDepartment(\''+esc(l.department_code)+'\')" aria-label="العودة إلى القسم">← <span>العودة إلى القسم</span></button><article class="lesson-detail lecture-fullscreen"><header class="lecture-cover"><div class="eyebrow">HAKIM OPTICS ACADEMY · LECTURE</div><h1>'+esc(l.title_en)+'</h1><h2>'+esc(l.title_ar||'')+'</h2><p><b>Department:</b> '+esc(departmentName(l.department_code))+' · <b>Level:</b> '+esc(l.level||'Undergraduate Optometry')+'</p></header><section class="lecture-objectives"><h2>LEARNING OBJECTIVES – أهداف المحاضرة</h2>'+(Array.isArray(l.learning_objectives)?'<ul>'+l.learning_objectives.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+esc(objectives)+'</p>')+'</section>'+lectureAudioPanel('en',l.content_en)+(hasInlineArabic?'':lectureAudioPanel('ar',l.content_ar))+'<div class="lecture-audio-note">تشغيل، إيقاف مؤقت، متابعة، إيقاف، تنقل جملة إلى الأمام أو الخلف، والتحكم في سرعة القراءة.</div>'+renderLectureDeck(slides)+'<section class="lecture-after"><h3>أسئلة المحاضرة</h3><button class="primary" onclick="showQuiz(\''+esc(l.id)+'\')">ابدأ أسئلة المحاضرة</button><h3>تسجيل إكمال الدرس</h3>'+completion+'<h3>Suggested References</h3><div class="reference-list">'+(refs.map(referenceLink).join('')||'<p>لم تُربط مراجع مباشرة بهذه المحاضرة بعد.</p>')+'</div></section></article>');
 bindAcademyImageFallbacks(document.getElementById('app')||document);window.currentLectureAudio={en:lectureAudioText(l.content_en),ar:hasInlineArabic?'':lectureAudioText(l.content_ar)};initLectureDeck();initLectureAudio();}
const OFFLINE_COMPLETION_KEY='alhakim_offline_lesson_completions_v1';
function getOfflineCompletions(){try{return JSON.parse(localStorage.getItem(OFFLINE_COMPLETION_KEY)||'[]')}catch(_){return []}}
function saveOfflineCompletion(id){const rows=getOfflineCompletions();if(!rows.some(x=>String(x.lesson_id)===String(id)))rows.push({lesson_id:String(id),queued_at:new Date().toISOString()});localStorage.setItem(OFFLINE_COMPLETION_KEY,JSON.stringify(rows))}
async function syncOfflineCompletions(){if(!navigator.onLine||!session?.access_token)return;const rows=getOfflineCompletions();if(!rows.length)return;const remaining=[];for(const item of rows){try{await rpc('academy_mark_lesson_complete',{p_lesson_id:item.lesson_id})}catch(e){remaining.push(item)}}localStorage.setItem(OFFLINE_COMPLETION_KEY,JSON.stringify(remaining));if(rows.length!==remaining.length)connection()}
async function completeLesson(id){if(!session){alert('سجّل الدخول أولاً.');return}if(!navigator.onLine){saveOfflineCompletion(id);alert('تم حفظ إكمال الدرس على هذا الجهاز. ستتم مزامنته تلقائياً عند عودة الإنترنت.');const l=DB.lessons.find(x=>x.id===id);if(l)showDepartment(l.department_code);return}try{const r=await rpc('academy_mark_lesson_complete',{p_lesson_id:id});alert(r.message||'تم تسجيل إكمال الدرس');const l=DB.lessons.find(x=>x.id===id);if(l)showDepartment(l.department_code)}catch(e){if(e instanceof TypeError||!navigator.onLine){saveOfflineCompletion(id);alert('تعذر الاتصال بالخادم؛ حُفظ إكمال الدرس محلياً وسيتم إرساله عند عودة الإنترنت.')}else alert(e.message)}}
async function buildOfflineDepartmentExam(code){
 const lessons=(DB?.lessons||[]).filter(l=>String(l.department_code)===String(code)&&canViewLesson(l));
 const banks=await Promise.all(lessons.map(l=>readOfflineQuestionBank(l.id)));
 const pool=banks.flat().filter(q=>Array.isArray(q.options)&&q.options.some(o=>o.is_correct===true));
 if(pool.length<5)throw Error('لم يتم حفظ عدد كافٍ من أسئلة هذا القسم على الجهاز. افتح الأكاديمية بالإنترنت وانتظر اكتمال المزامنة.');
 const shuffled=pool.slice();
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 const questions=shuffled.slice(0,Math.min(20,shuffled.length)).map(q=>({id:q.id,question:q.question,options:q.options.map(o=>({id:o.id,label:o.text,is_correct:o.is_correct===true}))}));
 return {offline_local:true,attempt_id:'offline-'+Date.now(),department_code:code,exam_title_en:'Offline Practice Exam',exam_title_ar:'اختبار تدريبي دون اتصال — لا يصدر شهادة',total_questions:questions.length,pass_mark:70,questions};
}
async function startDepartmentExam(code){
 try{
  if(!navigator.onLine){renderDepartmentExam(await buildOfflineDepartmentExam(code));return}
  const isFinal=['REF','BV'].includes(code);
  const exam=isFinal?await rpc('academy_start_final_exam',{p_department_code:code}):await rpc('academy_start_exam',{p_department_code:code,p_question_count:20});
  renderDepartmentExam(exam);
 }catch(e){alert(e.message)}
}
function renderDepartmentExam(exam){const questions=exam.questions||[];window.activeAcademyExam=exam;pageShell(exam.exam_title_en||('الامتحان الشامل · '+exam.department_code),exam.exam_title_ar||(`عدد الأسئلة: ${exam.total_questions} · درجة النجاح: ${exam.pass_mark}%`), `<form id="departmentExamForm" class="content-card">${questions.map((q,i)=>{const opts=Array.isArray(q.options)?q.options:[];return `<section class="question exam-question"><b>${i+1}. ${esc(q.question)}</b>${opts.map((o,j)=>{const val=typeof o==='object'?String(o.value??o.id??o.label??j):String(o);const label=typeof o==='object'?String(o.label??o.text??val):String(o);return `<label class="exam-option"><input type="radio" name="q_${esc(q.id)}" value="${esc(val)}" required><span>${esc(label)}</span></label>`}).join('')}</section>`}).join('')}<button class="primary" type="submit">تسليم الامتحان وتصحيح الإجابات</button><button class="secondary" type="button" onclick="showDepartment('${esc(exam.department_code)}')">إلغاء والعودة للقسم</button><p id="examMessage" class="form-message"></p></form>`);document.getElementById('departmentExamForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,answers={};questions.forEach(q=>{const selected=form.querySelector(`input[name="q_${CSS.escape(q.id)}"]:checked`);if(selected)answers[q.id]=selected.value});const msg=document.getElementById('examMessage');msg.textContent='جارٍ التصحيح…';try{if(exam.offline_local){
    const correct=questions.filter(q=>{const selected=answers[q.id];return q.options.some(o=>String(o.value??o.id??o.label??'')===String(selected)&&o.is_correct===true)}).length;
    const score=Math.round((correct/Math.max(1,questions.length))*100);
    pageShell('نتيجة الاختبار التدريبي دون اتصال',score>=exam.pass_mark?'اجتزت الاختبار التدريبي.':'يمكنك إعادة المحاولة بعد مراجعة المحاضرات.',`<div class="content-card"><h2>${score>=exam.pass_mark?'ناجح في الاختبار التدريبي ✓':'لم تحقق درجة النجاح بعد'}</h2><p>النتيجة: <b>${score}%</b></p><p>الإجابات الصحيحة: ${correct} من ${questions.length}</p><p class="notice">هذه نتيجة تدريبية محفوظة على الجهاز فقط. لا تُرسل إلى الإدارة ولا تصدر عنها شهادة. يلزم الاتصال بالإنترنت لإجراء الامتحان الرسمي وتسجيل النتيجة.</p><button class="secondary" onclick="showDepartment('${esc(exam.department_code)}')">العودة إلى القسم</button></div>`);
    return;
   }
   const result=await rpc('academy_submit_exam',{p_attempt_id:exam.attempt_id,p_answers:answers});renderExamResult(result,exam.department_code)}catch(err){msg.textContent=err.message}}}
function renderExamResult(result,code){const passed=!!result.passed;const cert=result.certificate_number;let certificate='';if(passed&&result.verification_token){const verifyUrl=`${location.origin}${location.pathname}?verify=${encodeURIComponent(result.verification_token)}`;certificate=`<section class="certificate-preview" id="certificate"><div class="certificate-inner"><span class="eyebrow">ALHAKIM OPTICS ACADEMY</span><h2>Certificate of Department Completion</h2><h3>شهادة إتمام قسم علمي</h3><p>تشهد أكاديمية الحكيم للبصريات بأن</p><h2>${esc(session?.user?.user_metadata?.full_name||session?.user?.user_metadata?.name||'الطالب')}</h2><p>قد أتم متطلبات القسم العلمي</p><h2>${esc(code)}</h2><p>بنتيجة ${esc(result.score)}%</p><p>رقم الشهادة: ${esc(cert)}</p><p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar')}</p><img class="certificate-qr" alt="QR verification" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}"><p class="certificate-note">امسح الرمز للتحقق من صحة الشهادة. هذه شهادة إتمام تعليمية صادرة عن الأكاديمية وليست مؤهلاً جامعياً أو ترخيصاً مهنياً.</p></div></section><button class="primary" onclick="window.print()">طباعة / حفظ الشهادة PDF</button><p><a href="${esc(verifyUrl)}" target="_blank" rel="noopener">صفحة التحقق من الشهادة</a></p>`}pageShell('نتيجة الامتحان',passed?'تهانينا، اجتزت الامتحان الشامل.':'لم تحقق درجة النجاح المطلوبة؛ يمكنك إعادة المحاولة.',`<div class="content-card"><h2>${passed?'ناجح ✓':'لم تنجح بعد'}</h2><p>النتيجة: <b>${esc(result.score)}%</b></p><p>الإجابات الصحيحة: ${esc(result.correct_answers)} من ${esc(result.total_questions)}</p><p>درجة النجاح: 70%</p>${certificate}<button class="secondary" onclick="showDepartment('${esc(code)}')">العودة إلى القسم</button></div>`)}
async function verifyCertificate(token){try{const result=await fetch(`${SUPABASE_URL}/rest/v1/rpc/academy_verify_certificate`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify({p_token:token})}).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.message||'تعذر التحقق');return b});pageShell('التحقق من الشهادة','التحقق الإلكتروني من شهادة أكاديمية الحكيم.',`<div class="content-card"><h2>${result.found?(result.valid?'شهادة صحيحة ومعتمدة ✓':'الشهادة ملغاة'):'لم يتم العثور على الشهادة'}</h2>${result.found?`<p>الاسم: ${esc(result.student_name)}</p><p>القسم: ${esc(result.department_code)}</p><p>النتيجة: ${esc(result.score)}%</p><p>رقم الشهادة: ${esc(result.certificate_number)}</p><p>تاريخ الإصدار: ${esc(new Date(result.issued_at).toLocaleDateString())}</p>`:''}</div>`)}catch(e){pageShell('التحقق من الشهادة','تعذر التحقق.',`<div class="notice">${esc(e.message)}</div>`)}}
async function showQuiz(id){
 const l=DB.lessons.find(x=>String(x.id)===String(id));if(!l)return;
 pageShell('أسئلة المحاضرة: '+l.title_en,'جارٍ تجهيز بنك الأسئلة…','<div class="notice">يتم التحقق من النسخة المحفوظة على هذا الجهاز.</div>');
 let qs=null,offline=false;
 if(navigator.onLine){try{qs=await publicRpc('academy_get_lesson_questions',{p_lesson_id:id});await saveOfflineQuestionBanks([{lesson_id:String(id),questions:qs,synced_at:new Date().toISOString()}])}catch(e){console.warn('Using offline practice questions:',e.message)}}
 if(!Array.isArray(qs)){qs=await readOfflineQuestionBank(id);offline=true}
 if(!Array.isArray(qs)){pageShell('بنك الأسئلة غير متاح',l.title_en,'<div class="notice">لم يتم تنزيل بنك أسئلة هذه المحاضرة على هذا الجهاز بعد. اتصل بالإنترنت وافتح الأكاديمية مرة واحدة لتنزيل المحتوى.</div><button class="secondary" onclick="showLesson(\''+esc(id)+'\')">العودة إلى المحاضرة</button>');return}
 pageShell('بنك أسئلة: '+l.title_en,`عدد الأسئلة: ${qs.length}${offline?' · نسخة محفوظة دون اتصال':''}`,`
  <div class="content-card">
   ${offline?'<div class="notice">أنت دون اتصال. يمكنك مراجعة الأسئلة والخيارات، أما تصحيح الإجابات وشرحها فيتطلب الاتصال بالخادم.</div>':''}
   ${qs.map((q,i)=>`<section class="question practice-question" id="practice-${q.id}">
     <b>${i+1}. ${esc(q.question)}</b>
     <div class="practice-options">${(q.options||[]).map(o=>`<button type="button" class="option" data-option-id="${esc(o.id)}" onclick="checkLessonAnswer('${esc(q.id)}','${esc(o.id)}',this)">${esc(o.text)}</button>`).join('')}</div>
     <div class="explanation" hidden></div>
    </section>`).join('')||'<div class="notice">لا توجد أسئلة منشورة لهذه المحاضرة حتى الآن.</div>'}
   <button class="secondary" onclick="showLesson('${esc(id)}')">العودة إلى المحاضرة</button>
  </div>`);
}
async function checkLessonAnswer(questionId,optionId,button){
 const box=button.closest('.practice-question');if(!box||box.dataset.answered==='1')return;
 box.dataset.answered='1';const buttons=[...box.querySelectorAll('.option')];buttons.forEach(b=>b.disabled=true);
 try{
  let result=null;
  if(!navigator.onLine){
   let q=null;for(const bank of offlineQuestionBanks.values()){q=(bank||[]).find(item=>String(item.id)===String(questionId));if(q)break}
   if(!q)throw Error('بيانات التصحيح غير محفوظة على هذا الجهاز. أعد المزامنة بالإنترنت.');
   const correct=q.options?.find(o=>o.is_correct===true);
   const selected=q.options?.find(o=>String(o.id)===String(optionId));
   if(!correct||!selected)throw Error('مفتاح التصحيح غير متاح في النسخة المحلية.');
   result={is_correct:selected.is_correct===true,correct_answer:correct.text,explanation_en:q.explanation_en||'',explanation_ar:q.explanation_ar||''};
  }else{
   result=await publicRpc('academy_check_lesson_answer',{p_question_id:questionId,p_option_id:optionId});
  }
  const chosen=buttons.find(b=>b.dataset.optionId===optionId);
  if(result.is_correct){chosen?.classList.add('correct')}else{chosen?.classList.add('wrong');const correct=buttons.find(b=>b.textContent.trim()===String(result.correct_answer||'').trim());correct?.classList.add('correct')}
  const ex=box.querySelector('.explanation');ex.hidden=false;
  ex.innerHTML=`<b>${result.is_correct?'إجابة صحيحة ✓':'إجابة غير صحيحة ✗'}</b><p>الإجابة الصحيحة: ${esc(result.correct_answer)}</p><p>${esc(result.explanation_en||'')}</p>${result.explanation_ar?`<p dir="rtl">${esc(result.explanation_ar)}</p>`:''}`;
 }catch(e){box.dataset.answered='0';buttons.forEach(b=>b.disabled=false);const ex=box.querySelector('.explanation');ex.hidden=false;ex.textContent=e.message}
}async function renderProgress(){if(!session){pageShell('تقدمي الدراسي','سجّل الدخول لمزامنة إنجازاتك.',`<div class="notice">يلزم تسجيل الدخول لعرض تقدمك السحابي.</div><button class="primary" onclick="showPage('accounts')">تسجيل الدخول</button>`);return}try{const rows=await rest('academy_lesson_completions',`select=lesson_id,completed_at&user_id=eq.${encodeURIComponent(session.user.id)}&order=completed_at.desc`);const ids=new Set(rows.map(x=>String(x.lesson_id)));const completed=DB.lessons.filter(l=>ids.has(l.id));pageShell('تقدمي الدراسي','إنجازات الدروس المسجلة في حسابك على الأكاديمية.',`<div class="content-card"><h3>الدروس المكتملة: ${rows.length}</h3><p>${completed.map(l=>esc(l.title_en)).join('، ')||'لم تسجل إكمال أي درس بعد.'}</p><small>يتم تسجيل الدرس عند الضغط على زر إكمال الدرس، وليس بمجرد فتحه.</small></div>`)}catch(e){pageShell('تقدمي الدراسي','تعذر تحميل التقدم.',`<div class="notice">${esc(e.message)}</div>`)}}
function search(queryOverride=null,targetId=null){
 const input=document.getElementById('globalSearch'),headerInput=document.getElementById('headerSearch');
 const q=String(queryOverride!==null?queryOverride:(input?.value||headerInput?.value||'')).trim();
 const box=document.getElementById(targetId||(document.activeElement===headerInput?'headerSearchResults':'searchResults'));
 if(!box)return;if(!q){box.innerHTML='';box.hidden=true;return}
 const norm=v=>String(v??'').toLocaleLowerCase().normalize('NFKD').replace(/[ً-ٰٟـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const nq=norm(q);if(!nq){box.innerHTML='';box.hidden=true;return}
 const searchable=v=>{if(v==null)return '';if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);if(Array.isArray(v))return v.map(searchable).join(' ');if(typeof v==='object')return Object.values(v).map(searchable).join(' ');return ''};
 const results=[],seen=new Set();
 const add=(type,id,label,sub,record)=>{const key=type+':'+id;if(seen.has(key))return;if(!norm(searchable(record)+' '+label).includes(nq))return;seen.add(key);results.push({type,id,label,sub,rank:norm(label).startsWith(nq)?0:1})};
 (DB?.departments||[]).forEach(d=>add('department',d.code,d.name_en+' — '+d.name_ar,'قسم علمي · '+d.code,d));
 (DB?.departments||[]).forEach(d=>(d.curriculum_topics||[]).filter(t=>t.is_published!==false).forEach(t=>{const title=typeof t==='string'?t:(t.title_en||t.title_ar||t.code||'موضوع');const ar=typeof t==='string'?'':(t.title_ar||'');const id=typeof t==='string'?t:(t.id||t.code||title);add('topic',String(id),title+(ar?' — '+ar:''),'موضوع · '+d.name_en,t)}));
 (DB?.lessons||[]).forEach(l=>{if(String(l.status||'published').toLowerCase()!=='published'&&!isAdmin())return;add('lesson',l.id,l.title_en||l.title_ar||'محاضرة','محاضرة · '+departmentName(l.department_code),l)});
 (HOME_COURSES||[]).forEach(c=>add('course',c.id,c.title_ar||c.title_en||'دورة','دورة تدريبية',c));
 (DB?.reference_catalog||[]).forEach(r=>add('reference',r.id,r.title||'مرجع علمي','مرجع علمي',r));
 results.sort((a,b)=>a.rank-b.rank||a.label.localeCompare(b.label));
 box.innerHTML=results.length?results.slice(0,40).map(r=>'<button type="button" class="result search-result" data-search-type="'+esc(r.type)+'" data-search-id="'+esc(r.id)+'"><b>'+esc(r.label)+'</b><small>'+esc(r.sub)+'</small></button>').join(''):'<div class="result">لا توجد نتائج مطابقة في محتوى الأكاديمية.</div>';box.hidden=false;
 box.querySelectorAll('[data-search-type]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.searchType,id=btn.dataset.searchId;box.innerHTML='';box.hidden=true;if(type==='department')showDepartment(id);else if(type==='lesson')showLesson(id);else if(type==='topic'){const dept=(DB?.departments||[]).find(d=>(d.curriculum_topics||[]).some(t=>String(typeof t==='string'?t:(t.id||t.code||t.title_en||t.title_ar))===id));const topic=dept?.curriculum_topics?.find(t=>String(typeof t==='string'?t:(t.id||t.code||t.title_en||t.title_ar))===id);const lesson=(DB?.lessons||[]).find(l=>String(l.topic_id)===id&&String(l.status||'published').toLowerCase()==='published');if(lesson)showLesson(lesson.id);else if(dept)searchTopic(typeof topic==='string'?topic:(topic?.title_en||topic?.title_ar||id),dept.code)}else if(type==='course')showCourse(id);else if(type==='reference')showPage('library')}));
}
async function signIn(email,password){
 const normalized=String(email||'').trim().toLowerCase();
 const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify({email:normalized,password})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.msg||data.message||data.error_description||'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.');
 session=data;localStorage.setItem('hakim_auth_session',JSON.stringify(data));
 await loadProfile();
 if(isAdmin()){
  const gate=document.getElementById('welcomeOverlay');if(gate)gate.classList.add('hidden');
  document.body.classList.remove('portal-gate-open');
  renderAdmin();
 }
 return data;
}
async function signUpStudent(name,email,password){
 const normalized=String(email||'').trim().toLowerCase();
 if(normalized===ACADEMY_ADMIN_EMAIL)throw Error('هذا البريد مخصص لإدارة الأكاديمية ولا يمكن تسجيله من نموذج إنشاء حساب طالب.');
 if(String(name||'').trim().length<3)throw Error('أدخل الاسم الكامل.');
 if(String(password||'').length<8)throw Error('كلمة المرور يجب ألا تقل عن 8 أحرف.');
 const r=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify({email:normalized,password,user_metadata:{full_name:String(name).trim()}})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.msg||data.message||data.error_description||'تعذر إنشاء الحساب.');
 if(data.access_token){session=data;localStorage.setItem('hakim_auth_session',JSON.stringify(data));await loadProfile();return 'تم إنشاء الحساب وتسجيل الدخول بنجاح.'}
 return 'تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده، ثم سجّل الدخول من الأكاديمية.';
}
async function loadProfile(){
 if(!session){profile=null;syncAdminNavigation();return}
 const email=String(session.user?.email||'').trim().toLowerCase();
 let admin=false;
 if(email===ACADEMY_ADMIN_EMAIL){try{admin=(await rpc('is_academy_admin'))===true}catch(e){console.error('Admin role verification failed:',e);admin=false}}
 profile={role:admin?'admin':'student',is_admin:admin,display_name:session.user?.user_metadata?.full_name||session.user?.user_metadata?.name||''};
 syncAdminNavigation();return profile;
}
function signOut(){session=null;profile=null;syncAdminNavigation();localStorage.removeItem('hakim_auth_session');showPage('accounts')}
function renderAccounts(){
 const user=session?.user;
 const formMarkup=`<div class="auth-card"><div class="auth-tabs"><button type="button" class="primary" id="showLoginTab">تسجيل الدخول</button><button type="button" class="secondary" id="showSignupTab">إنشاء حساب طالب</button></div>
 <form id="loginForm"><h3>تسجيل الدخول</h3><label>البريد الإلكتروني<input type="email" id="loginEmail" required autocomplete="username"></label><label>كلمة المرور<input type="password" id="loginPassword" required autocomplete="current-password"></label><button class="primary" type="submit">دخول</button><p id="authMessage" class="form-message" aria-live="polite"></p></form>
 <form id="signupForm" hidden><h3>إنشاء حساب طالب جديد</h3><label>الاسم الكامل<input type="text" id="signupName" required minlength="3" autocomplete="name"></label><label>البريد الإلكتروني<input type="email" id="signupEmail" required autocomplete="email"></label><label>كلمة المرور (8 أحرف على الأقل)<input type="password" id="signupPassword" required minlength="8" autocomplete="new-password"></label><button class="primary" type="submit">إنشاء الحساب</button><p id="signupMessage" class="form-message" aria-live="polite"></p></form>
 <div class="notice">حساب الإدارة محصور في البريد المعتمد للأكاديمية. إنشاء الحسابات العامة يمنح صلاحية طالب فقط.</div></div>`;
 pageShell('الحسابات','سجّل الدخول أو أنشئ حساب طالب جديداً من داخل الأكاديمية.',user?`<div class="content-card"><h3>الحساب الحالي</h3><p>${esc(user.email)}</p><p>الدور: ${isAdmin()?'مدير الأكاديمية':'طالب'}</p>${!isAdmin()?'<button class="primary" style="width:100%;margin:10px 0" onclick="renderMyStudentPerformance()">📊 فتح لوحة الطالب — Student Dashboard</button>':''}<label>الاسم الكامل كما سيظهر في الشهادة<input id="studentFullName" value="${esc(user.user_metadata?.full_name||user.user_metadata?.name||'')}" placeholder="اكتب الاسم الكامل"></label><button class="primary" onclick="saveStudentName()">حفظ الاسم</button>${!isAdmin()?'<button class="primary" onclick="renderMyStudentPerformance()">📊 لوحة الطالب — Student Dashboard</button>':''}<button class="secondary" onclick="signOut()">تسجيل الخروج</button><p id="profileMsg" class="form-message"></p></div>`:formMarkup);
 const lf=document.getElementById('loginForm'),sf=document.getElementById('signupForm');
 const loginTab=document.getElementById('showLoginTab'),signupTab=document.getElementById('showSignupTab');
 if(loginTab&&signupTab){loginTab.onclick=()=>{lf.hidden=false;sf.hidden=true};signupTab.onclick=()=>{lf.hidden=true;sf.hidden=false}}
 if(lf)lf.onsubmit=async e=>{e.preventDefault();const m=document.getElementById('authMessage');m.textContent='جارٍ التحقق من الحساب…';try{await signIn(document.getElementById('loginEmail').value,document.getElementById('loginPassword').value);if(isAdmin()){const gate=document.getElementById('welcomeOverlay');if(gate)gate.classList.add('hidden');document.body.classList.remove('portal-gate-open');renderAdmin()}else{renderAccounts()}syncAdminNavigation()}catch(err){m.textContent=err.message}};
 if(sf)sf.onsubmit=async e=>{e.preventDefault();const m=document.getElementById('signupMessage');m.textContent='جارٍ إنشاء الحساب…';try{m.textContent=await signUpStudent(document.getElementById('signupName').value,document.getElementById('signupEmail').value,document.getElementById('signupPassword').value);if(session){renderAccounts();syncAdminNavigation()}}catch(err){m.textContent=err.message}};
}
async function saveStudentName(){const name=document.getElementById('studentFullName').value.trim();const msg=document.getElementById('profileMsg');if(name.length<4){msg.textContent='أدخل الاسم الكامل.';return}try{const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',headers:authHeaders(),body:JSON.stringify({data:{...session.user.user_metadata,full_name:name}})});const body=await r.json();if(!r.ok)throw Error(body.message||'تعذر حفظ الاسم');session.user=body;if(session.refresh_token){const rr=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});if(rr.ok)session=await rr.json()}localStorage.setItem('hakim_auth_session',JSON.stringify(session));msg.textContent='تم حفظ الاسم بنجاح. يمكنك الآن دخول الامتحان وإصدار الشهادة باسمك.'}catch(e){msg.textContent=e.message}}
function adminGuard(){return isAdmin()}
async function renderAdmin(){
 if(!session){pageShell('نافذة الإدارة','تسجيل الدخول بحساب إداري مطلوب.',`<div class="notice">يرجى تسجيل الدخول بحساب الإدارة.</div><button class="primary" onclick="showPage('accounts')">فتح الحسابات</button>`);return}
 if(!adminGuard()){pageShell('نافذة الإدارة','هذه النافذة مخصصة لإدارة الأكاديمية.',`<div class="notice">تعذر التحقق من صلاحية الإدارة. أعد تسجيل الدخول بعد تحديث الصفحة.</div><button class="secondary" onclick="signOut()">تسجيل الخروج</button>`);return}
 let stats={questions:0,certificates:0,attempts:0};
 try{[stats.questions,stats.certificates,stats.attempts]=await Promise.all(['academy_exam_questions','academy_certificates','academy_exam_attempts'].map(async t=>(await rest(t,'select=id')).length))}catch(e){}
 pageShell('نافذة إدارة الأكاديمية','مرحباً بك في لوحة تحكم أكاديمية الحكيم. اختر المجال الذي تريد إدارته.',`
 <div class="admin-grid">
  <button class="quick-card" onclick="adminReferences()"><b>إدارة المكتبة العلمية</b><small>إضافة وتعديل الكتب والأبحاث والدراسات والأوراق العلمية وربطها بالمحاضرات.</small></button>\n  <button class="quick-card" onclick="adminReferenceUploadSettings()"><b>إعدادات المكتبة ورفع المراجع من الهاتف</b><small>رفع ملفات PDF متعددة مباشرة من الهاتف وإضافتها إلى المكتبة.</small></button>
  <button class="quick-card" onclick="adminHomepageSettings()"><b>إدارة الواجهة الرئيسية</b><small>الشعار، الصور، بيانات المؤسس، النصوص، الألوان والاختصارات.</small></button>
  <button class="quick-card" onclick="adminCourses()"><b>إدارة الدورات</b><small>عرض الدورات المنشورة ومراجعة بياناتها.</small></button>
  <button class="quick-card" onclick="adminSubscriptions()"><b>إدارة الاشتراكات</b><small>متابعة اشتراكات الطلاب وحالاتها.</small></button><button class="quick-card" onclick="adminPaymentMethods()"><b>إعدادات وسائل الدفع</b><small>إضافة وتعديل وإيقاف وسائل الدفع وحساباتها.</small></button>
  <button class="quick-card" onclick="adminStudentPerformance()"><b>لوحة أداء الطلاب — Student Performance Dashboard</b><small>متابعة إنجازات الطلاب ونتائج الاختبارات والنشاط التعليمي على مستوى الأكاديمية.</small></button>
  <button class="quick-card" onclick="adminAccounts()"><b>إدارة الحسابات</b><small>عرض حسابات الطلاب المسجلة في الأكاديمية.</small></button>
  <button class="quick-card" onclick="adminInstructors()"><b>إدارة المحاضرين</b><small>عرض حسابات المحاضرين المسجلين وصلاحياتهم التعليمية.</small></button>
  <button class="quick-card" onclick="adminCertificates()"><b>إدارة الشهادات</b><small>عرض الشهادات الصادرة وإلغاء الشهادة عند الحاجة.</small></button>
  <button class="quick-card" onclick="adminQuestionForm()"><b>بنك الأسئلة</b><small>إضافة سؤال امتحان موثق إلى القسم العلمي.</small></button>
  <button class="quick-card" onclick="adminAttempts()"><b>نتائج الامتحانات</b><small>متابعة محاولات الطلاب ونتائجهم.</small></button>
 </div>
 <div class="stats"><div class="stat"><b>${stats.questions}</b><small>سؤالاً في البنك</small></div><div class="stat"><b>${stats.attempts}</b><small>محاولة امتحان</small></div><div class="stat"><b>${stats.certificates}</b><small>شهادة صادرة</small></div></div>
 <div class="notice">تظل الدروس والموضوعات الأساسية متاحة مجاناً. إدارة الاشتراكات تخص الدورات والشهادات فقط.</div>`);
}


async function purgeRemovedOfflineReferenceAssets(previousReferences=[],currentReferences=[]){
 if(!window.caches)return;
 const keep=new Set((currentReferences||[]).map(r=>String(r.id)));
 const removed=(previousReferences||[]).filter(r=>!keep.has(String(r.id)));
 if(!removed.length)return;
 try{
  const textCache=await caches.open('alhakim-academy-reference-text-v2');
  for(const ref of removed)await textCache.delete(academyReferenceCacheKey(ref,'text'));
  const mediaCache=await caches.open(OFFLINE_MEDIA_CACHE);
  for(const ref of removed){
   if(isAcademyPdfReference(ref)){
    const key=new URL('./__offline_references__/'+offlineMediaHash(String(ref.id)),location.href).href;
    await mediaCache.delete(key);
   }
  }
 }catch(error){console.warn('Could not purge removed offline reference files:',error)}
}
function adminReferenceUploadSettings(){
 if(!adminGuard())return;
 pageShell('إعدادات المكتبة ورفع المراجع','ارفع ملف PDF من ملفات الهاتف أو الكمبيوتر. بعد الحفظ والتحقق، يُحفظ محلياً ليُفتح داخل الأكاديمية دون إنترنت.',`
 <div class="content-card">
  <div class="admin-actions"><button class="secondary" onclick="adminReferences()">العودة إلى المكتبة</button></div>
  <div class="notice">اختر ملف PDF من جهازك. الحد الأقصى الحالي 50 ميغابايت لكل ملف. بعد اكتمال الحفظ والمزامنة المحلية يصبح المرجع متاحاً للقراءة دون إنترنت على هذا الجهاز.</div>
  <form id="referenceUploadSettingsForm" onsubmit="uploadReferenceBatch(event)">
   <label>ملف PDF من الهاتف أو الكمبيوتر *
    <input id="referenceBatchFiles" type="file" accept="application/pdf,.pdf" multiple required>
   </label>
   <label>مكان حفظ المرجع في المكتبة *
    <select id="referenceBatchType" required>
     <option value="clinical_reference">مرجع متاح</option>
     <option value="research_article">بحث</option>
     <option value="scientific_paper">ورقة علمية</option>
    </select>
   </label>
   <label>لغة الملفات
    <select id="referenceBatchLanguage"><option value="en">English</option><option value="ar">العربية</option><option value="multi">متعددة اللغات</option></select>
   </label>
   <label>ملاحظة الترخيص وحقوق الاستخدام
    <input id="referenceBatchLicense" maxlength="300" placeholder="مثال: Open Access — CC BY 4.0">
   </label>
   <p class="muted">هذه الخاصية متاحة لحساب مالك الأكاديمية فقط. ارفع الملفات التي تملك حق استخدامها وإتاحتها.</p>
   <div class="admin-actions"><button class="primary" type="submit" id="referenceBatchSubmit">حفظ المرجع في المكتبة وعلى هذا الجهاز</button></div>
   <p id="referenceBatchStatus" class="form-message" aria-live="polite"></p>
  </form>
 </div>`);
}
async function verifyUploadedPdfFile(file){
 const head=new Uint8Array(await file.slice(0,1024).arrayBuffer());
 if(!new TextDecoder().decode(head).includes('%PDF-'))throw Error('الملف لا يحتوي على ترويسة PDF صحيحة.');
 const pdfjs=await loadPdfJs();
 const data=new Uint8Array(await file.arrayBuffer());
 const task=pdfjs.getDocument({data});
 let pdf;
 try{
  pdf=await task.promise;
  if(!pdf.numPages)throw Error('ملف PDF لا يحتوي على صفحات قابلة للعرض.');
  return pdf.numPages;
 }finally{
  try{await pdf?.destroy()}catch(_){}
  try{await task.destroy()}catch(_){}
 }
}
async function uploadReferenceBatch(event){
 event.preventDefault();
 if(!adminGuard()){alert('رفع المراجع متاح لحساب مالك الأكاديمية فقط.');return}
 const input=document.getElementById('referenceBatchFiles');
 const files=Array.from(input?.files||[]);
 const status=document.getElementById('referenceBatchStatus');
 const button=document.getElementById('referenceBatchSubmit');
 if(!files.length){if(status)status.textContent='اختر ملف PDF واحداً على الأقل من ملفات الجهاز.';return}
 const maxBytes=50*1024*1024;
 const invalid=files.find(file=>{
  const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
  return !isPdf||file.size>maxBytes||file.size===0;
 });
 if(invalid){
  if(status)status.textContent='الملف '+invalid.name+' غير صالح أو يتجاوز الحد الحالي (50 ميغابايت).';
  return;
 }
 if(!confirm('تأكيد حفظ '+files.length+' ملف PDF في مكتبة الأكاديمية؟ سيتم حفظ نسخة محلية للعمل دون إنترنت على هذا الجهاز.'))return;
 const type=document.getElementById('referenceBatchType').value;
 const language=document.getElementById('referenceBatchLanguage').value;
 const license=document.getElementById('referenceBatchLicense').value.trim();
 button.disabled=true;
 let done=0;
 const failed=[];
 try{
  for(let i=0;i<files.length;i++){
   const file=files[i];
   let storagePath='';
   let savedId='';
   let localCacheKey='';
   try{
    if(status)status.textContent='فحص ملف PDF '+(i+1)+' من '+files.length+': '+file.name;
    const verifiedPages=await verifyUploadedPdfFile(file);
    const safeName=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^\.+/,'').slice(-100)||'reference.pdf';
    storagePath='uploads/'+Date.now()+'-'+i+'-'+safeName;
    if(status)status.textContent='الملف سليم ('+verifiedPages+' صفحة). جارٍ رفعه إلى المكتبة…';
    const upload=await fetch(SUPABASE_URL+'/storage/v1/object/academy-references/'+storagePath,{
     method:'POST',
     headers:{apikey:SUPABASE_ANON_JWT,Authorization:'Bearer '+session.access_token,'Content-Type':'application/pdf','x-upsert':'false'},
     body:file
    });
    const uploadBody=await upload.json().catch(()=>({}));
    if(!upload.ok)throw Error(uploadBody.message||uploadBody.error||'فشل رفع '+file.name);
    const title=file.name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').trim()||file.name;
    const payload={
     title,resource_type:type,language,access_type:'free_pdf_download',access_license:license||null,
     status:'published',academy_readability:'available',file_path:storagePath,file_name:file.name,
     file_size:file.size,pdf_updated_at:new Date().toISOString(),updated_at:new Date().toISOString(),keywords:[]
    };
    const saved=await authorizedFetch(SUPABASE_URL+'/rest/v1/references',{
     method:'POST',
     headers:{...authHeaders(),'Content-Type':'application/json','Prefer':'return=representation'},
     body:JSON.stringify(payload)
    });
    const savedBody=await saved.json().catch(()=>({}));
    if(!saved.ok)throw Error(savedBody.message||savedBody.details||'رُفع الملف لكن تعذر إنشاء سجل المرجع '+file.name);
    const savedRef=Array.isArray(savedBody)?savedBody[0]:savedBody;
    if(!savedRef?.id)throw Error('لم تُرجع قاعدة البيانات معرّف المرجع بعد الحفظ.');
    savedId=String(savedRef.id);
    if(!window.caches)throw Error('المتصفح لا يدعم حفظ ملفات PDF محلياً؛ لم نعتبر المرجع جاهزاً للعمل دون إنترنت.');
    localCacheKey=new URL('./__offline_references__/'+offlineMediaHash(savedId),location.href).href;
    const mediaCache=await caches.open(OFFLINE_MEDIA_CACHE);
    await mediaCache.put(localCacheKey,new Response(file,{status:200,headers:{'Content-Type':'application/pdf','Content-Length':String(file.size),'X-Academy-Reference-Id':savedId}}));
    const offlineRef={...savedRef,offline_file_url:localCacheKey};
    DB.reference_catalog=Array.isArray(DB.reference_catalog)?DB.reference_catalog:[];
    DB.reference_catalog=DB.reference_catalog.filter(ref=>String(ref.id)!==savedId);
    DB.reference_catalog.unshift(offlineRef);
    await saveOfflineCurriculum(DB);
    try{localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}catch(_){}
    done++;
    if(status)status.textContent='تم حفظ '+done+' من '+files.length+' ملفاً، مع نسخة محلية تعمل دون إنترنت: '+file.name;
   }catch(fileError){
    if(savedId){
     try{await authorizedFetch(SUPABASE_URL+'/rest/v1/references?id=eq.'+encodeURIComponent(savedId),{method:'DELETE',headers:authHeaders()})}catch(_){}
    }
    if(localCacheKey&&window.caches){try{const cache=await caches.open(OFFLINE_MEDIA_CACHE);await cache.delete(localCacheKey)}catch(_){}}
    if(storagePath){
     try{await fetch(SUPABASE_URL+'/storage/v1/object/academy-references/'+storagePath,{method:'DELETE',headers:{apikey:SUPABASE_ANON_JWT,Authorization:'Bearer '+session.access_token}})}catch(_){}
    }
    failed.push(file.name+': '+(fileError.message||'تعذر الحفظ'));
   }
  }
  try{await saveOfflineCurriculum(DB);try{localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}catch(_){}}catch(cacheError){failed.push('تعذر تثبيت فهرس المكتبة محلياً: '+cacheError.message)}
  if(status){
   status.textContent=done===files.length
    ?'اكتمل الحفظ بنجاح. '+done+' ملف PDF محفوظ داخل المكتبة وعلى هذا الجهاز ويمكن فتحه دون إنترنت.'
    :'تم حفظ '+done+' ملفاً. '+(failed.length?'تعذر حفظ: '+failed.join(' | '):'');
  }
  if(done)await loadContent();
  adminReferences();
 }finally{
  if(button)button.disabled=false;
 }
}
async function adminReferences(){
 if(!adminGuard())return;
 try{
  const refs=await restAll('references','select=*&order=updated_at.desc.nullslast,publication_year.desc');
  const lessons=DB.lessons||[];
  pageShell('إدارة المكتبة العلمية','إضافة وتحرير الكتب والأبحاث والدراسات والإرشادات وربطها بالمحاضرات.',`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button><button class="primary" onclick="adminReferenceUploadSettings()">إعدادات المكتبة ورفع المراجع من الهاتف</button><button class="secondary" onclick="adminReferenceForm()">＋ إضافة بيانات مرجع</button></div><div class="notice">أضف بيانات ببليوغرافية دقيقة وروابط المصدر الأصلي. لا ترفع أو تعِد توزيع الكتب المحمية بحقوق النشر.</div><div class="library-admin-list">${refs.map(r=>`<article class="reference-card"><div class="admin-actions"><span class="tag">${esc(referenceTypeLabel(r.resource_type))}</span><span class="tag">${esc(r.status||'published')}</span><span class="tag">${esc(academyReadabilityLabel(r))}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.authors||'')} · ${esc(r.publication_year||'')} · ${esc(r.journal||r.publisher||'')}</p><p>${esc(r.doi||'')}</p><div class="admin-actions"><button class="secondary" onclick="adminReferenceForm('${esc(r.id)}')">تعديل</button><button class="secondary" onclick="toggleReferenceArchive('${esc(r.id)}','${esc(r.status||'published')}')">${r.status==='archived'?'إعادة نشر':'أرشفة'}</button><button class="secondary" onclick="adminReferenceLinks('${esc(r.id)}')">ربط بمحاضرة</button></div></article>`).join('')||'<p>لا توجد مواد علمية بعد.</p>'}</div></div>`);
 }catch(e){pageShell('إدارة المكتبة العلمية','تعذر تحميل المكتبة.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">رجوع</button>`)}
}
function referenceTypeLabel(type){return ({book:'📚 كتاب علمي',clinical_reference:'📖 مرجع سريري',research_article:'🔬 بحوث',scientific_paper:'📄 أوراق علمية',previous_study:'📊 دراسات',clinical_guideline:'📋 إرشادات سريرية',systematic_review:'🧾 مراجعات منهجية'})[type]||'📚 مادة علمية'}
function adminReferenceForm(id=''){
 if(!adminGuard())return;
 const r=id?(DB.reference_catalog||[]).find(x=>String(x.id)===String(id)):null;
 const value=(k,d='')=>esc(r?.[k]??d);
 const types=[['book','كتاب علمي'],['clinical_reference','مرجع سريري'],['research_article','بحث علمي'],['scientific_paper','ورقة علمية'],['previous_study','دراسة سابقة'],['clinical_guideline','إرشاد سريري'],['systematic_review','مراجعة منهجية']];
 const accesses=[['external_link','رابط خارجي'],['free_full_text','قراءة كاملة مجانية'],['free_pdf_download','PDF مجاني مسموح بتنزيله'],['free_publisher_read','قراءة مجانية لدى الناشر'],['subscription_required','يتطلب اشتراكاً'],['purchase_required','يتطلب شراء الكتاب'],['abstract_only','الملخص فقط']];
 pageShell(id?'تعديل مادة في المكتبة':'إضافة مادة إلى المكتبة','أدخل بيانات المصدر كما وردت في المنشور الأصلي.',`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="adminReferences()">العودة للمكتبة</button></div><form id="libraryItemForm" onsubmit="saveLibraryItem(event,'${esc(id)}')">
 <label>عنوان المادة *<input required name="title" value="${value('title')}" maxlength="500"></label>
 <label>نوع المادة<select name="resource_type">${types.map(([v,t])=>`<option value="${v}" ${(r?.resource_type||'book')===v?'selected':''}>${t}</option>`).join('')}</select></label>
 <label>المؤلفون<input name="authors" value="${value('authors')}" placeholder="Author names"></label>
 <label>سنة النشر<input name="publication_year" type="number" min="1800" max="2100" value="${value('publication_year')}"></label>
 <label>المجلة العلمية<input name="journal" value="${value('journal')}"></label>
 <label>الناشر<input name="publisher" value="${value('publisher')}"></label>
 <label>DOI<input name="doi" value="${value('doi')}" placeholder="10.xxxx/xxxxx"></label>
 <label>رابط المصدر الرسمي<input name="url" type="url" value="${value('url')}" placeholder="https://..."></label>
 <label>الملخص العلمي<textarea name="abstract" rows="5">${value('abstract')}</textarea></label>
 <label>الكلمات المفتاحية (افصل بينها بفاصلة)<input name="keywords" value="${value('keywords')}" placeholder="optometry, retina, glaucoma"></label>
 <label>لغة المادة<select name="language"><option value="en" ${value('language','en')==='en'?'selected':''}>English</option><option value="ar" ${value('language')==='ar'?'selected':''}>العربية</option><option value="multi" ${value('language')==='multi'?'selected':''}>متعددة اللغات</option></select></label>
 <label>طريقة الوصول<select name="access_type">${accesses.map(([v,t])=>`<option value="${v}" ${(r?.access_type||'external_link')===v?'selected':''}>${t}</option>`).join('')}</select></label>
 <label>الترخيص وحقوق الاستخدام<input name="access_license" value="${value('access_license')}" placeholder="مثال: CC BY 4.0 أو رابط الناشر فقط"></label>
 <label>حالة المادة<select name="status"><option value="draft" ${value('status','published')==='draft'?'selected':''}>مسودة</option><option value="published" ${value('status','published')==='published'?'selected':''}>منشور</option><option value="archived" ${value('status')==='archived'?'selected':''}>مؤرشف</option></select></label>
 <div class="admin-actions"><button class="primary" type="submit">حفظ المادة</button><button class="secondary" type="button" onclick="adminReferences()">إلغاء</button></div></form></div>`);
}
async function saveLibraryItem(event,id){
 event.preventDefault();if(!adminGuard())return;
 const form=event.currentTarget,fd=new FormData(form),v=Object.fromEntries(fd.entries());
 const payload={title:v.title.trim(),resource_type:v.resource_type,authors:v.authors.trim()||null,publication_year:v.publication_year?Number(v.publication_year):null,journal:v.journal.trim()||null,publisher:v.publisher.trim()||null,doi:v.doi.trim()||null,url:v.url.trim()||null,abstract:v.abstract.trim()||null,keywords:v.keywords.split(',').map(x=>x.trim()).filter(Boolean),language:v.language,access_type:v.access_type,access_license:v.access_license.trim()||null,status:v.status,updated_at:new Date().toISOString()};
 try{
  const url=SUPABASE_URL+'/rest/v1/references'+(id?'?id=eq.'+encodeURIComponent(id):'');
  const res=await authorizedFetch(url,{method:id?'PATCH':'POST',headers:{...authHeaders(),'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(payload)});
  const body=await res.json().catch(()=>[]);
  if(!res.ok)throw Error(body.message||body.details||'تعذر حفظ المادة');
  alert(id?'تم تحديث المادة بنجاح.':'تمت إضافة المادة إلى المكتبة بنجاح.');
  await loadContent();adminReferences();
 }catch(e){alert(e.message||'حدث خطأ أثناء الحفظ.')}
}
async function toggleReferenceArchive(id,status){
 if(!adminGuard())return;const next=status==='archived'?'published':'archived';
 if(!confirm(next==='archived'?'أرشفة المادة؟ ستختفي من فهرس الطلاب دون حذفها.':'إعادة نشر المادة؟'))return;
 try{const r=await authorizedFetch(SUPABASE_URL+'/rest/v1/references?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...authHeaders(),'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({status:next,updated_at:new Date().toISOString()})});if(!r.ok)throw Error('تعذر تحديث حالة المادة');await loadContent();adminReferences()}catch(e){alert(e.message)}
}
async function adminReferenceLinks(id){
 if(!adminGuard())return;
 try{
  const [refs,links]=await Promise.all([rest('references','select=id,title&id=eq.'+encodeURIComponent(id)),rest('lesson_references','select=lesson_id,reference_id&reference_id=eq.'+encodeURIComponent(id))]);
  const linked=new Set(links.map(x=>String(x.lesson_id)));
  const lessons=DB.lessons||[];
  pageShell('ربط المادة بالمحاضرات',esc(refs[0]?.title||'مادة علمية'),`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="adminReferences()">العودة للمكتبة</button></div><p>حدد المحاضرات التي تريد إظهار هذا المصدر ضمن مراجعها.</p><div class="library-link-list">${lessons.map(l=>`<label class="library-link-row"><input type="checkbox" value="${esc(l.id)}" ${linked.has(String(l.id))?'checked':''}><span>${esc(l.title_en||l.title_ar||'محاضرة')}</span></label>`).join('')}</div><button class="primary" onclick="saveReferenceLinks('${esc(id)}')">حفظ الروابط</button></div>`);
 }catch(e){pageShell('ربط المادة بالمحاضرات','تعذر تحميل الروابط.',`<div class="notice">${esc(e.message)}</div>`)}
}
async function saveReferenceLinks(id){
 if(!adminGuard())return;
 const selected=[...document.querySelectorAll('.library-link-row input:checked')].map(x=>x.value);
 try{
  const del=await authorizedFetch(SUPABASE_URL+'/rest/v1/lesson_references?reference_id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{...authHeaders(),'Prefer':'return=minimal'}});
  if(!del.ok)throw Error('تعذر تحديث روابط المحاضرات');
  if(selected.length){const ins=await authorizedFetch(SUPABASE_URL+'/rest/v1/lesson_references',{method:'POST',headers:{...authHeaders(),'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(selected.map(lesson_id=>({lesson_id,reference_id:id})))});if(!ins.ok)throw Error('تم حذف الروابط السابقة لكن تعذرت إضافة الروابط الجديدة. أعد تحديدها وحاول مجدداً.')}
  alert('تم حفظ ربط المادة بالمحاضرات.');await loadContent();adminReferences();
 }catch(e){alert(e.message||'تعذر حفظ الروابط.')}
}
async function uploadReferencePdf(id){
 if(!adminGuard())return;
 const input=document.getElementById('refpdf_'+id),license=document.getElementById('reflicense_'+id),file=input?.files?.[0];
 if(!file){alert('اختر ملف PDF أولاً.');return}
 if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name)){alert('الملف يجب أن يكون بصيغة PDF.');return}
 if(file.size>50*1024*1024){alert('الحد الأقصى لحجم الملف 50 ميجابايت.');return}
 if(!confirm('تأكيد رفع هذا الملف؟ يجب أن تكون لديك صلاحية قانونية لإتاحته للطلاب.'))return;
 const safeName=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^\.+/,'').slice(-100)||'reference.pdf';
 const path=id+'/'+Date.now()+'-'+safeName;
 const btn=input.closest('article')?.querySelector('button');if(btn){btn.disabled=true;btn.textContent='جارٍ الرفع…'}
 try{
  const res=await fetch(SUPABASE_URL+'/storage/v1/object/academy-references/'+path,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,Authorization:'Bearer '+session.access_token,'Content-Type':'application/pdf','x-upsert':'false'},body:file});
  const body=await res.json().catch(()=>({}));if(!res.ok)throw Error(body.message||body.error||'فشل رفع ملف PDF');
  const update=await authorizedFetch(SUPABASE_URL+'/rest/v1/references?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...authHeaders(),'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({file_path:path,file_name:file.name,file_size:file.size,access_license:(license?.value||'').trim(),pdf_updated_at:new Date().toISOString()})});
  if(!update.ok){const err=await update.json().catch(()=>({}));throw Error(err.message||'تم رفع الملف لكن تعذر ربطه بسجل المرجع. أعد المحاولة أو تواصل مع الإدارة.')}
  alert('تم رفع ملف PDF وربطه بالمرجع بنجاح.');await loadContent();adminReferences();
 }catch(e){alert(e.message||'حدث خطأ أثناء رفع الملف.')}
 finally{if(btn){btn.disabled=false;btn.textContent='رفع وربط ملف PDF'}}
}
async function adminCourses(){
 if(!adminGuard())return;
 try{
  const rows=await rest('courses','select=*&order=created_at.desc');
  pageShell('إدارة الدورات','أضف دورة جديدة أو راجع بيانات الدورات وحالة النشر.',`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button><button class="primary" type="button" onclick="adminCourseForm()">＋ إضافة دورة</button></div>${rows.map(c=>`<article class="result"><b>${esc(c.title_ar||c.title_en||'دورة دون عنوان')}</b><small>${esc(c.title_en||'')} · ${esc(c.price??'')} ${esc(c.currency||'')} · ${c.is_published?'منشورة':'مسودة'}</small><p>${esc(c.description_en||'')}</p><div class="admin-actions"><button class="secondary" onclick="adminCourseContent('${esc(c.id)}')">إدارة الوحدات والمحاضرات</button><button class="secondary" onclick="toggleCoursePublish('${esc(c.id)}',${!c.is_published})">${c.is_published?'إيقاف النشر':'نشر الدورة'}</button><button class="secondary" type="button" onclick="deleteCourse('${esc(c.id)}','${esc(c.title_ar||c.title_en||'هذه الدورة')}')">حذف الدورة</button></div></article>`).join('')||'<p>لا توجد دورات مسجلة حالياً.</p>'}</div>`);
 }catch(e){pageShell('إدارة الدورات','تعذر تحميل الدورات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminCourseContent(courseId){
 if(!adminGuard())return;
 try{
  const course=(await rest('courses','select=id,title_en,title_ar&id=eq.'+encodeURIComponent(courseId)))[0];
  const modules=await rest('course_modules','select=*&course_id=eq.'+encodeURIComponent(courseId)+'&order=display_order.asc');
  const lessons=await rest('course_lessons','select=*&order=display_order.asc');
  const byModule=new Map();lessons.forEach(l=>{if(!byModule.has(String(l.module_id)))byModule.set(String(l.module_id),[]);byModule.get(String(l.module_id)).push(l)});
  pageShell('محتوى الدورة: '+(course?.title_en||''),'أضف الوحدات ثم أضف المحاضرات داخل كل وحدة. يدعم المحتوى الإنجليزي والشرح العربي.',`<div class="content-card"><div class="admin-actions"><button class="primary" onclick="adminAddCourseModule('${esc(courseId)}')">＋ إضافة وحدة</button><button class="secondary" onclick="adminCourses()">رجوع للدورات</button></div>${modules.map(m=>`<section class="result"><h3>${esc(m.title_en)}</h3><p dir="rtl">${esc(m.title_ar||'')}</p><button class="secondary" onclick="adminAddCourseLesson('${esc(m.id)}','${esc(courseId)}')">＋ إضافة محاضرة لهذه الوحدة</button>${(byModule.get(String(m.id))||[]).map(l=>`<article class="lesson-card"><b>${esc(l.title_en)}</b><p dir="rtl">${esc(l.title_ar||'')}</p><small>${esc((l.content_en||'').slice(0,150))}</small></article>`).join('')||'<p>لا توجد محاضرات في هذه الوحدة.</p>'}</section>`).join('')||'<div class="notice">لم تتم إضافة وحدات لهذه الدورة بعد.</div>'}</div>`);
 }catch(e){pageShell('إدارة محتوى الدورة','تعذر تحميل المحتوى.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="adminCourses()">عودة</button>`)}
}
async function adminAddCourseModule(courseId){
 if(!adminGuard())return;
 pageShell('إضافة وحدة للدورة','أدخل اسم الوحدة باللغتين.',`<form id="acmForm" class="content-card"><label>اسم الوحدة بالإنجليزية<input id="acm_en" required></label><label>اسم الوحدة بالعربية<input id="acm_ar"></label><label>ترتيب العرض<input id="acm_order" type="number" value="0"></label><button class="primary">حفظ الوحدة</button><button type="button" class="secondary" onclick="adminCourseContent('${esc(courseId)}')">إلغاء</button><p id="acm_msg" class="form-message"></p></form>`);
 document.getElementById('acmForm').onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('acm_msg');try{const r=await fetch(SUPABASE_URL+'/rest/v1/course_modules',{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify({course_id:courseId,title_en:document.getElementById('acm_en').value.trim(),title_ar:document.getElementById('acm_ar').value.trim()||null,display_order:Number(document.getElementById('acm_order').value)||0})});const b=await r.json().catch(()=>({}));if(!r.ok)throw Error(b.message||b.details||'تعذر حفظ الوحدة');adminCourseContent(courseId)}catch(err){msg.textContent=err.message}}
}
async function adminAddCourseLesson(moduleId,courseId){
 if(!adminGuard())return;
 pageShell('إضافة محاضرة للدورة','أدخل النص الإنجليزي والشرح العربي. ستظهر المحاضرة للطلاب المشتركين في الدورة.',`<form id="aclForm" class="content-card"><label>عنوان المحاضرة بالإنجليزية<input id="acl_en" required></label><label>العنوان بالعربية<input id="acl_ar"></label><label>المحتوى بالإنجليزية<textarea id="acl_content_en" rows="8"></textarea></label><label>الشرح بالعربية<textarea id="acl_content_ar" rows="8"></textarea></label><label>ترتيب العرض<input id="acl_order" type="number" value="0"></label><button class="primary">حفظ المحاضرة</button><button type="button" class="secondary" onclick="adminCourseContent('${esc(courseId)}')">إلغاء</button><p id="acl_msg" class="form-message"></p></form>`);
 document.getElementById('aclForm').onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('acl_msg');try{const r=await fetch(SUPABASE_URL+'/rest/v1/course_lessons',{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify({module_id:moduleId,title_en:document.getElementById('acl_en').value.trim(),title_ar:document.getElementById('acl_ar').value.trim()||null,content_en:document.getElementById('acl_content_en').value.trim()||null,content_ar:document.getElementById('acl_content_ar').value.trim()||null,display_order:Number(document.getElementById('acl_order').value)||0})});const b=await r.json().catch(()=>({}));if(!r.ok)throw Error(b.message||b.details||'تعذر حفظ المحاضرة');adminCourseContent(courseId)}catch(err){msg.textContent=err.message}}
}
async function adminCourseForm(){
 if(!adminGuard())return;
 pageShell('إضافة دورة','أدخل بيانات الدورة ثم احفظها كمسودة أو انشرها.',`<form id="adminCourseForm" class="content-card">
 <label>اسم الدورة بالإنجليزية<input id="ac_title_en" required></label>
 <label>اسم الدورة بالعربية<input id="ac_title_ar"></label>
 <label>الوصف بالإنجليزية<textarea id="ac_desc_en"></textarea></label>
 <label>الوصف بالعربية<textarea id="ac_desc_ar"></textarea></label>
 <label>السعر<input id="ac_price" type="number" min="0" step="0.01" value="0" required></label>
 <label>العملة<input id="ac_currency" value="USD" required></label>
 <div class="admin-actions"><button class="primary" type="submit" data-publish="false">حفظ كمسودة</button><button class="secondary" type="submit" data-publish="true">حفظ ونشر</button><button class="secondary" type="button" onclick="adminCourses()">إلغاء</button></div><p id="ac_msg" class="form-message"></p></form>`);
 document.getElementById('adminCourseForm').onsubmit=async e=>{e.preventDefault();if(!adminGuard())return;const publish=e.submitter?.dataset.publish==='true';const msg=document.getElementById('ac_msg');msg.textContent='جارٍ حفظ الدورة…';const payload={title_en:document.getElementById('ac_title_en').value.trim(),title_ar:document.getElementById('ac_title_ar').value.trim()||null,description_en:document.getElementById('ac_desc_en').value.trim()||null,description_ar:document.getElementById('ac_desc_ar').value.trim()||null,price:Number(document.getElementById('ac_price').value),currency:document.getElementById('ac_currency').value.trim().toUpperCase(),is_published:publish};try{const res=await authorizedFetch(SUPABASE_URL+'/rest/v1/courses',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});const body=await res.json().catch(()=>[]);if(!res.ok)throw Error(body.message||body.details||'تعذر حفظ الدورة');msg.textContent='تم حفظ الدورة بنجاح.';adminCourses()}catch(err){msg.textContent=err.message}}
}
async function deleteCourse(id,title){
 if(!adminGuard())return;
 if(!confirm('هل تريد حذف الدورة "'+title+'"؟ لن يسمح بالحذف إذا كانت هناك اشتراكات طلاب أو شهادات مرتبطة بها.'))return;
 try{
  const [enrollments,certificates]=await Promise.all([
   rest('course_enrollments','select=id&course_id=eq.'+encodeURIComponent(id)),
   rest('certificates','select=id&course_id=eq.'+encodeURIComponent(id))
  ]);
  if(enrollments.length||certificates.length){alert('لا يمكن حذف هذه الدورة لأنها مرتبطة بسجلات طلاب أو شهادات ('+enrollments.length+' تسجيل، '+certificates.length+' شهادة). أوقف نشرها بدلاً من حذفها حتى لا تضيع سجلات الطلاب.');return}
  const response=await authorizedFetch(SUPABASE_URL+'/rest/v1/courses?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{Prefer:'return=representation'}});
  const body=await response.json().catch(()=>[]);
  if(!response.ok)throw Error(body.message||body.details||'تعذر حذف الدورة');
  if(!Array.isArray(body)||!body.length)throw Error('لم يتم حذف الدورة. تحقق من صلاحية الحذف في قاعدة البيانات.');
  alert('تم حذف الدورة بنجاح.');adminCourses();
 }catch(e){alert('تعذر حذف الدورة: '+e.message)}
}
async function toggleCoursePublish(id,publish){
 if(!adminGuard())return;
 if(!confirm(publish?'نشر هذه الدورة للطلاب؟':'إيقاف نشر هذه الدورة؟'))return;
 try{const r=await fetch(SUPABASE_URL+'/rest/v1/courses?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...authHeaders(),Prefer:'return=minimal'},body:JSON.stringify({is_published:publish})});if(!r.ok){const b=await r.json().catch(()=>({}));throw Error(b.message||'تعذر تحديث الدورة')}adminCourses()}catch(e){alert(e.message)}
}
async function adminSubscriptions(){
 if(!adminGuard())return;
 try{
  const [subs,users,plans,payments,enrollments]=await Promise.all([
   rest('subscriptions','select=*&order=created_at.desc'),
   rest('profiles','select=id,full_name,email'),
   optionalTable('subscription_plans','select=id,name,duration_days,price,currency'),
   optionalTable('payments','select=id,user_id,subscription_id,amount,currency,payment_method,payment_reference,status,created_at,course_id,proof_path,payer_name,receipt_file_name&order=created_at.desc'),
   optionalTable('course_enrollments','select=id,user_id,course_id,subscription_id,status,enrolled_at')
  ]);
  const um=new Map(users.map(x=>[String(x.id),x])),pm=new Map((plans||[]).map(x=>[String(x.id),x]));
  const payMap=new Map();(payments||[]).forEach(p=>{if(p.subscription_id){if(!payMap.has(String(p.subscription_id)))payMap.set(String(p.subscription_id),[]);payMap.get(String(p.subscription_id)).push(p)}});
  const em=new Map();(enrollments||[]).forEach(e=>{if(e.subscription_id){if(!em.has(String(e.subscription_id)))em.set(String(e.subscription_id),[]);em.get(String(e.subscription_id)).push(e)}});
  pageShell('إدارة الاشتراكات','راجع الطلبات والمدفوعات وفعّل الاشتراك بعد التأكد من استلام المبلغ فعلياً.',`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button></div>${subs.map(x=>{const u=um.get(String(x.user_id)),p=pm.get(String(x.plan_id)),ps=payMap.get(String(x.id))||[],es=em.get(String(x.id))||[];return `<article class="result"><b>${esc(u?.full_name||'طالب دون اسم')} — ${esc(x.status||'pending')}</b><small>${esc(u?.email||x.user_id)} · الخطة: ${esc(p?.name||x.plan_id||'غير محددة')} (${esc(p?.duration_days||'?')} يوم)</small><small>البداية: ${esc(x.starts_at||'—')} · الانتهاء: ${esc(x.expires_at||'—')}</small>${ps.map(v=>`<div class="notice">الدفع: ${esc(v.amount)} ${esc(v.currency||'')} · ${esc(v.payment_method||'')} · المحوّل: ${esc(v.payer_name||'—')} · مرجع: ${esc(v.payment_reference||'—')} · الحالة: <b>${esc(v.status||'pending')}</b> ${v.proof_path?'<button class="text-btn" onclick="adminViewPaymentProof(\''+esc(v.id)+'\')">عرض الإيصال</button>':''} <button class="text-btn" onclick="setPaymentStatus(\''+esc(v.id)+'\',\'confirmed\')">تأكيد استلام المبلغ</button> <button class="text-btn" onclick="setPaymentStatus(\''+esc(v.id)+'\',\'rejected\')">رفض الدفع</button></div>`).join('')||'<small>لا يوجد سجل دفع مرتبط.</small>'}<small>الدورات المرتبطة: ${es.length}</small><div class="admin-actions"><button class="secondary" onclick="adminAssignCourse('${esc(x.user_id)}','${esc(x.id)}')">إضافة دورة للمشترك</button><button class="secondary" onclick="adminSetSubscription('${esc(x.id)}','active')">تفعيل الاشتراك</button><button class="secondary" onclick="adminSetSubscription('${esc(x.id)}','cancelled')">إلغاء الاشتراك</button><button class="secondary" onclick="adminExtendSubscription('${esc(x.id)}','${esc(x.expires_at||'')}')">تمديد المدة</button></div></article>`}).join('')||'<p>لا توجد اشتراكات مسجلة.</p>'}</div>`);
 }catch(e){pageShell('إدارة الاشتراكات','تعذر تحميل الاشتراكات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminViewPaymentProof(id){
 if(!adminGuard())return;
 try{
  const p=(await rest('payments','select=proof_path,receipt_file_name&id=eq.'+encodeURIComponent(id)))[0];if(!p||!p.proof_path)throw Error('لا يوجد إيصال.');
  const r=await authorizedFetch(SUPABASE_URL+'/storage/v1/object/sign/academy-payment-proofs/'+p.proof_path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:300})});
  const b=await r.json().catch(()=>({}));if(!r.ok)throw Error(b.message||'تعذر فتح الإيصال.');
  window.open(SUPABASE_URL+'/storage/v1'+b.signedURL,'_blank','noopener');
 }catch(e){alert(e.message)}
}
async function setPaymentStatus(id,status){
 if(!adminGuard())return;
 const next=status==='confirmed'?'confirmed':'rejected';
 if(!confirm(next==='confirmed'?'تأكيد استلام المبلغ وتفعيل الدورة؟':'رفض الدفع وإلغاء طلب الدورة؟'))return;
 try{
  const p=(await rest('payments','select=id,subscription_id,course_id& id=eq.'.replace(' ','')+encodeURIComponent(id)))[0];if(!p)throw Error('طلب الدفع غير موجود.');
  const r=await authorizedFetch(SUPABASE_URL+'/rest/v1/payments?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:next})});if(!r.ok){const b=await r.json().catch(()=>({}));throw Error(b.message||'تعذر تحديث الدفع.')}
  if(p.subscription_id){
   const subPatch=next==='confirmed'?{status:'active',starts_at:new Date().toISOString(),expires_at:new Date(Date.now()+365*86400000).toISOString()}:{status:'cancelled'};
   const sr=await authorizedFetch(SUPABASE_URL+'/rest/v1/subscriptions?id=eq.'+encodeURIComponent(p.subscription_id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(subPatch)});if(!sr.ok)throw Error('تم تحديث الدفع لكن تعذر تحديث الاشتراك.');
   if(p.course_id){const er=await authorizedFetch(SUPABASE_URL+'/rest/v1/course_enrollments?subscription_id=eq.'+encodeURIComponent(p.subscription_id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:next==='confirmed'?'active':'cancelled'})});if(!er.ok)throw Error('تعذر تحديث حالة الالتحاق.')}
  }
  adminSubscriptions();
 }catch(e){alert(e.message)}
}
async function adminSetSubscription(id,status){
 if(!adminGuard()||!confirm(status==='active'?'تفعيل الاشتراك؟ تأكد من الدفع قبل الموافقة.':'إلغاء هذا الاشتراك؟'))return;
 try{
  let patch={status};
  if(status==='active'){
   const sub=(await rest('subscriptions','select=id,plan_id& id=eq.'.replace(' ','')+encodeURIComponent(id)))[0];
   let days=30;if(sub?.plan_id){const plans=await optionalTable('subscription_plans','select=id,duration_days&id=eq.'+encodeURIComponent(sub.plan_id));if(plans?.[0]?.duration_days)days=Number(plans[0].duration_days)}
   const start=new Date();const end=new Date(start.getTime()+days*86400000);patch={status,starts_at:start.toISOString(),expires_at:end.toISOString()};
  }
  const r=await fetch(SUPABASE_URL+'/rest/v1/subscriptions?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...authHeaders(),Prefer:'return=minimal'},body:JSON.stringify(patch)});if(!r.ok){const b=await r.json().catch(()=>({}));throw Error(b.message||'تعذر تحديث الاشتراك')}adminSubscriptions()
 }catch(e){alert(e.message)}
}
async function adminAssignCourse(userId,subscriptionId){
 if(!adminGuard())return;
 try{
  const [courses,enrollments]=await Promise.all([rest('courses','select=id,title_en,title_ar&is_published=eq.true&order=title_en.asc'),rest('course_enrollments','select=course_id&subscription_id=eq.'+encodeURIComponent(subscriptionId))]);
  const enrolled=new Set(enrollments.map(x=>String(x.course_id)));
  const choices=courses.filter(c=>!enrolled.has(String(c.id)));
  pageShell('إضافة دورة للمشترك','اختر الدورة التي سيُمنح هذا المشترك حق الوصول إليها.',`<form id="assignCourseForm" class="content-card"><label>الدورة<select id="assign_course" required><option value="">اختر دورة</option>${choices.map(c=>`<option value="${esc(c.id)}">${esc(c.title_ar||c.title_en)}</option>`).join('')}</select></label><div class="notice">يجب تفعيل الاشتراك وتأكيد الدفع أولاً. سيتم تسجيل الالتحاق بحالة active.</div><button class="primary" ${choices.length?'':'disabled'}>إضافة الدورة</button><button type="button" class="secondary" onclick="adminSubscriptions()">رجوع</button><p id="assign_msg" class="form-message"></p></form>`);
  document.getElementById('assignCourseForm').onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('assign_msg');try{const active=(await rest('subscriptions','select=status,expires_at&id=eq.'+encodeURIComponent(subscriptionId)))[0];if(active?.status!=='active'||!active.expires_at||new Date(active.expires_at)<=new Date())throw Error('فعّل الاشتراك وتأكد من صلاحيته قبل إضافة الدورة.');const r=await fetch(SUPABASE_URL+'/rest/v1/course_enrollments',{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify({user_id:userId,course_id:document.getElementById('assign_course').value,subscription_id:subscriptionId,status:'active'})});const b=await r.json().catch(()=>({}));if(!r.ok)throw Error(b.message||b.details||'تعذر إضافة الدورة');adminSubscriptions()}catch(err){msg.textContent=err.message}}
 }catch(e){pageShell('إضافة دورة للمشترك','تعذر تحميل الدورات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="adminSubscriptions()">عودة</button>`)}
}
async function adminExtendSubscription(id,current){
 if(!adminGuard())return;const initial=current?new Date(current):new Date();const date=prompt('أدخل تاريخ الانتهاء الجديد (YYYY-MM-DD):',initial.toISOString().slice(0,10));if(!date)return;if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)||isNaN(Date.parse(date))){alert('صيغة التاريخ غير صحيحة');return}
 try{const r=await fetch(SUPABASE_URL+'/rest/v1/subscriptions?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{...authHeaders(),Prefer:'return=minimal'},body:JSON.stringify({expires_at:new Date(date+'T23:59:59Z').toISOString(),status:'active'})});if(!r.ok){const b=await r.json().catch(()=>({}));throw Error(b.message||'تعذر تمديد الاشتراك')}adminSubscriptions()}catch(e){alert(e.message)}
}
async function adminAccounts(){
 if(!adminGuard())return;
 try{
  const [users,roles,subs]=await Promise.all([rest('profiles','select=id,full_name,email,created_at&order=created_at.desc'),rest('admin_roles','select=user_id,role,created_at'),optionalTable('subscriptions','select=user_id,status,expires_at')]);
  const roleMap=new Map();roles.forEach(r=>{if(!roleMap.has(String(r.user_id)))roleMap.set(String(r.user_id),[]);roleMap.get(String(r.user_id)).push(r.role)});
  const subMap=new Map();(subs||[]).forEach(x=>{if(!subMap.has(String(x.user_id)))subMap.set(String(x.user_id),[]);subMap.get(String(x.user_id)).push(x)});
  pageShell('إدارة الحسابات','قائمة الحسابات المسجلة مع تصنيف الطالب والمحاضر وحالة الاشتراك.',`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button><input id="accountFilter" placeholder="ابحث بالاسم أو البريد الإلكتروني"></div><div id="accountRows">${users.map(u=>{const rs=roleMap.get(String(u.id))||[],ss=subMap.get(String(u.id))||[];return `<article class="result account-row" data-search="${esc((u.full_name||'')+' '+(u.email||''))}"><b>${esc(u.full_name||'حساب دون اسم')}</b><small>${esc(u.email||'')} · ${rs.includes('instructor')?'محاضر':'طالب'} ${rs.length?' · '+esc(rs.join(', ')):''}</small><small>التسجيل: ${esc(u.created_at||'')} · الاشتراكات: ${ss.length?ss.map(x=>esc(x.status)+' حتى '+esc(x.expires_at||'—')).join(' / '):'لا يوجد'}</small><small>معرّف الحساب: ${esc(u.id)}</small></article>`}).join('')||'<p>لا توجد حسابات مسجلة.</p>'}</div></div>`);
  document.getElementById('accountFilter').oninput=e=>{const v=e.target.value.toLowerCase();document.querySelectorAll('.account-row').forEach(x=>x.hidden=!x.dataset.search.toLowerCase().includes(v))};
 }catch(e){pageShell('إدارة الحسابات','تعذر تحميل الحسابات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminInstructors(){
 if(!adminGuard())return;
 try{
  const [roles,users]=await Promise.all([rest('admin_roles','select=id,user_id,role,created_at&role=eq.instructor&order=created_at.desc'),rest('profiles','select=id,full_name,email,created_at')]);
  const byId=new Map(users.map(u=>[String(u.id),u]));
  const rows=roles.map(r=>({role:r,user:byId.get(String(r.user_id))}));
  pageShell('إدارة المحاضرين','إدارة صلاحية المحاضر للحسابات المسجلة مسبقاً.',`<div class="content-card"><div class="admin-actions"><button class="primary" onclick="adminInstructorForm()">＋ إضافة محاضر</button><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button></div>${rows.map(x=>`<article class="result"><b>${esc(x.user?.full_name||'محاضر دون اسم')}</b><small>${esc(x.user?.email||x.role.user_id)} · ${esc(x.role.created_at||'')}</small><small>معرّف الحساب: ${esc(x.role.user_id)}</small><button class="text-btn" onclick="removeInstructor('${esc(x.role.id)}')">سحب صلاحية المحاضر</button></article>`).join('')||'<p>لا يوجد محاضرون مسجلون حالياً.</p>'}</div>`);
 }catch(e){pageShell('إدارة المحاضرين','تعذر تحميل القائمة.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminInstructorForm(){
 if(!adminGuard())return;
 try{const [users,roles]=await Promise.all([rest('profiles','select=id,full_name,email&order=full_name.asc'),rest('admin_roles','select=user_id&role=eq.instructor')]);const existing=new Set(roles.map(x=>String(x.user_id)));const candidates=users.filter(u=>!existing.has(String(u.id)));
 pageShell('إضافة محاضر','اختر حساباً موجوداً لمنحه صلاحية المحاضر. لا يتم إنشاء حساب دخول جديد هنا.',`<form id="instructorGrantForm" class="content-card"><label>الحساب<select id="ig_user" required><option value="">اختر الحساب</option>${candidates.map(u=>`<option value="${esc(u.id)}">${esc(u.full_name||'بدون اسم')} — ${esc(u.email||u.id)}</option>`).join('')}</select></label><div class="notice">إذا لم يظهر الشخص هنا، يجب أن ينشئ حساباً في الأكاديمية أولاً.</div><button class="primary" type="submit" ${candidates.length?'':'disabled'}>منح صلاحية المحاضر</button><button class="secondary" type="button" onclick="adminInstructors()">رجوع</button><p id="ig_msg" class="form-message"></p></form>`);
 document.getElementById('instructorGrantForm').onsubmit=async e=>{e.preventDefault();if(!adminGuard())return;const uid=document.getElementById('ig_user').value;const msg=document.getElementById('ig_msg');try{const res=await fetch(SUPABASE_URL+'/rest/v1/admin_roles',{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify({user_id:uid,role:'instructor'})});const b=await res.json().catch(()=>({}));if(!res.ok)throw Error(b.message||b.details||'تعذر منح الصلاحية');adminInstructors()}catch(err){msg.textContent=err.message}}
 }catch(e){pageShell('إضافة محاضر','تعذر تحميل الحسابات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="adminInstructors()">رجوع</button>`)}
}
async function removeInstructor(roleId){
 if(!adminGuard()||!confirm('هل تريد سحب صلاحية المحاضر من هذا الحساب؟'))return;
 try{const res=await fetch(SUPABASE_URL+'/rest/v1/admin_roles?id=eq.'+encodeURIComponent(roleId)+'&role=eq.instructor',{method:'DELETE',headers:{...authHeaders(),Prefer:'return=minimal'}});if(!res.ok){const b=await res.json().catch(()=>({}));throw Error(b.message||'تعذر سحب الصلاحية')}adminInstructors()}catch(e){alert(e.message)}
}
async function adminHomepageSettings(useDefaults=false){
 if(!adminGuard())return;
 if(useDefaults)HOME_SETTINGS={...HOME_DEFAULTS};else await loadHomepageSettings();
 const s={...HOME_DEFAULTS,...HOME_SETTINGS};
 pageShell('إعدادات الواجهة الرئيسية','تحكم في تصميم الصفحة الرئيسية ومحتواها. التغييرات تُنشر للطلاب بعد الحفظ.',`
 <form id="homepageSettingsForm" class="content-card homepage-admin-form">
  <h3>الهوية وصورة المؤسس</h3>
  <label>رابط شعار الأكاديمية<input id="hs_logo" value="${esc(s.logo_url)}" placeholder="https://..."><input type="file" id="hs_logo_file" accept="image/png,image/jpeg,image/webp"></label>
  <label>رابط صورة المؤسس<input id="hs_founder_photo" value="${esc(s.founder_photo_url)}" placeholder="https://..."><input type="file" id="hs_founder_file" accept="image/png,image/jpeg,image/webp"></label>
  <label>اسم المؤسس<input id="hs_founder_name" value="${esc(s.founder_name)}"></label>
  <label>المؤهل والجامعة<input id="hs_founder_title" value="${esc(s.founder_title)}"></label>
  <h3>إحصائيات بوابة الدخول</h3>
  <label>عدد الموضوعات العلمية<input id="hs_topic_count" type="number" min="0" step="1" value="${esc(s.topic_count??650)}"></label>
  <label>عدد المراجع العلمية<input id="hs_reference_count" type="number" min="0" step="1" value="${esc(s.reference_count??30)}"></label>
  <p class="muted">تظهر هذه الأعداد في الشريط السفلي لبوابة الدخول. أدخل العدد المعتمد الذي تريد عرضه للزوار.</p>
  <h3>البانر الرئيسي</h3>
  <label>عنوان الترحيب<input id="hs_welcome_title" value="${esc(s.welcome_title)}"></label>
  <label>النص الترحيبي<input id="hs_welcome_subtitle" value="${esc(s.welcome_subtitle)}"></label>
  <label>رابط صورة البانر<input id="hs_hero_image" value="${esc(s.hero_image_url)}"><input type="file" id="hs_hero_file" accept="image/png,image/jpeg,image/webp"></label>
  <label>صورة بطاقة الأكاديمية<input id="hs_academy_image" value="${esc(s.academy_card_image_url)}"><input type="file" id="hs_academy_file" accept="image/png,image/jpeg,image/webp"></label>
  <h3>ألوان الواجهة</h3><div class="homepage-color-grid">
   <label>لون الخلفية<input type="color" id="hs_bg" value="${esc(s.background_color)}"></label>
   <label>اللون الأساسي<input type="color" id="hs_primary" value="${esc(s.primary_color)}"></label>
   <label>اللون الذهبي<input type="color" id="hs_accent" value="${esc(s.accent_color)}"></label>
  </div>
  <h3>إظهار وإخفاء مكونات الواجهة</h3><div class="homepage-toggle-grid">
   <label><input type="checkbox" id="hs_show_founder" ${s.show_founder!==false?'checked':''}> منطقة المؤسس</label>
   <label><input type="checkbox" id="hs_show_articles" ${s.show_articles!==false?'checked':''}> المقالات والبحوث</label>
   <label><input type="checkbox" id="hs_show_courses" ${s.show_courses!==false?'checked':''}> الدورات المميزة</label>
   <label><input type="checkbox" id="hs_show_academy" ${s.show_academy_card!==false?'checked':''}> بطاقة الأكاديمية</label>
  </div>
  <h3>اختيار وترتيب الدورات المميزة</h3><p class="muted">أدخل معرّفات الدورات المنشورة في JSON array بالترتيب المطلوب. اتركها [] لعرض أحدث ثلاث دورات تلقائياً.</p><textarea id="hs_featured_courses" rows="4" dir="ltr">${esc(JSON.stringify(s.featured_course_ids||[],null,2))}</textarea>
  <h3>المقالات والبحوث (JSON)</h3><p class="muted">كل مقال: title و image و description. يمكن إضافة أو حذف عناصر.</p>
  <textarea id="hs_articles" rows="9" dir="ltr">${esc(JSON.stringify(s.articles||[],null,2))}</textarea>
  <h3>الاختصارات الرئيسية (JSON)</h3><p class="muted">الصفحة يجب أن تكون: departments أو library أو courses أو progress أو permanent.</p>
  <textarea id="hs_quick_links" rows="8" dir="ltr">${esc(JSON.stringify(s.quick_links||HOME_DEFAULTS.quick_links,null,2))}</textarea>
  <div class="homepage-admin-actions"><button type="submit" class="primary">حفظ ونشر الإعدادات</button><button type="button" class="secondary" id="hs_preview">معاينة</button><button type="button" class="secondary" id="hs_reset">استعادة الإعدادات الافتراضية</button></div>
  <p id="hs_message" class="form-message"></p>
 </form>`);
 const form=document.getElementById('homepageSettingsForm');
 const uploadMap=[['hs_logo_file','hs_logo'],['hs_founder_file','hs_founder_photo'],['hs_hero_file','hs_hero_image'],['hs_academy_file','hs_academy_image']];
 uploadMap.forEach(([fileId,urlId])=>{const input=document.getElementById(fileId);input?.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;const msg=document.getElementById('hs_message');if(file.size>5*1024*1024){msg.textContent='حجم الصورة يجب ألا يتجاوز 5 ميجابايت.';input.value='';return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){msg.textContent='الصيغ المدعومة: JPG وPNG وWebP.';input.value='';return}msg.textContent='جارٍ رفع الصورة…';try{const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';const path=Date.now()+'-'+crypto.randomUUID()+'.'+ext;const res=await fetch(SUPABASE_URL+'/storage/v1/object/academy-homepage/'+path,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,Authorization:'Bearer '+session.access_token,'Content-Type':file.type,'x-upsert':'false'},body:file});const body=await res.json().catch(()=>({}));if(!res.ok)throw Error(body.message||body.error||'تعذر رفع الصورة');document.getElementById(urlId).value=SUPABASE_URL+'/storage/v1/object/public/academy-homepage/'+path;msg.textContent='تم رفع الصورة. اضغط حفظ ونشر لتطبيقها على الواجهة.'}catch(err){msg.textContent=err.message}})});
 const read=()=>{
  let articles,links,featured;
  try{featured=JSON.parse(document.getElementById('hs_featured_courses').value);if(!Array.isArray(featured))throw Error('معرفات الدورات يجب أن تكون قائمة JSON')}catch(e){throw Error('صيغة الدورات المميزة غير صحيحة: '+e.message)}
  try{articles=JSON.parse(document.getElementById('hs_articles').value);if(!Array.isArray(articles))throw Error('المقالات يجب أن تكون قائمة JSON')}catch(e){throw Error('صيغة المقالات غير صحيحة: '+e.message)}
  try{links=JSON.parse(document.getElementById('hs_quick_links').value);if(!Array.isArray(links))throw Error('الاختصارات يجب أن تكون قائمة JSON')}catch(e){throw Error('صيغة الاختصارات غير صحيحة: '+e.message)}
  return {...HOME_DEFAULTS,logo_url:document.getElementById('hs_logo').value.trim(),founder_photo_url:document.getElementById('hs_founder_photo').value.trim(),founder_name:document.getElementById('hs_founder_name').value.trim(),founder_title:document.getElementById('hs_founder_title').value.trim(),topic_count:Math.max(0,Math.floor(Number(document.getElementById('hs_topic_count').value)||0)),reference_count:Math.max(0,Math.floor(Number(document.getElementById('hs_reference_count').value)||0)),welcome_title:document.getElementById('hs_welcome_title').value.trim(),welcome_subtitle:document.getElementById('hs_welcome_subtitle').value.trim(),hero_image_url:document.getElementById('hs_hero_image').value.trim(),academy_card_image_url:document.getElementById('hs_academy_image').value.trim(),background_color:document.getElementById('hs_bg').value,primary_color:document.getElementById('hs_primary').value,accent_color:document.getElementById('hs_accent').value,show_founder:document.getElementById('hs_show_founder').checked,show_articles:document.getElementById('hs_show_articles').checked,show_courses:document.getElementById('hs_show_courses').checked,show_academy_card:document.getElementById('hs_show_academy').checked,featured_course_ids:featured,articles,quick_links:links};
 };
 document.getElementById('hs_preview').onclick=()=>{try{HOME_SETTINGS=read();applyWelcomePortalSettings();renderHome()}catch(e){document.getElementById('hs_message').textContent=e.message}};
 document.getElementById('hs_reset').onclick=()=>{if(!confirm('استعادة التصميم الافتراضي؟ لن يتم الحفظ إلا بعد الضغط على حفظ ونشر.'))return;HOME_SETTINGS={...HOME_DEFAULTS};adminHomepageSettings(true)};
 form.onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('hs_message');msg.textContent='جارٍ حفظ الإعدادات…';try{const settings=read();const r=await fetch(`${SUPABASE_URL}/rest/v1/academy_homepage_settings`,{method:'POST',headers:{...authHeaders(),Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({id:1,settings,updated_by:session.user.id,updated_at:new Date().toISOString()})});const body=await r.json().catch(()=>[]);if(!r.ok)throw Error(body.message||body.details||'تعذر حفظ الإعدادات');HOME_SETTINGS=settings;await saveOfflineHomepageSettings(settings);applyWelcomePortalSettings();renderHome();msg.textContent='تم حفظ ونشر إعدادات الواجهة بنجاح، وحُفظت هوية المؤسس محلياً للعمل دون إنترنت.';}catch(err){msg.textContent=err.message}};
}
function adminQuestionForm(){if(!adminGuard())return;pageShell('إضافة سؤال للامتحان','أدخل سؤالاً موثقاً وحدد أربعة خيارات والإجابة الصحيحة.',`<form id="questionForm" class="content-card"><label>القسم<select id="qDept">${DB.departments.map(d=>`<option value="${esc(d.code)}">${esc(d.code)} — ${esc(d.name_en)}</option>`).join('')}</select></label><label>نص السؤال<textarea id="qStem" required></textarea></label>${[0,1,2,3].map(i=>`<label>الخيار ${i+1}<input id="qOpt${i}" required></label>`).join('')}<label>رمز الإجابة الصحيحة<select id="qCorrect"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label><label>التفسير العلمي<textarea id="qExplain"></textarea></label><label>المستوى<select id="qDifficulty"><option>basic</option><option selected>intermediate</option><option>advanced</option></select></label><button class="primary">حفظ السؤال</button><p id="qMsg" class="form-message"></p></form>`);document.getElementById('questionForm').onsubmit=async e=>{e.preventDefault();const options=['A','B','C','D'].map((v,i)=>({value:v,label:document.getElementById('qOpt'+i).value.trim()}));try{const r=await fetch(`${SUPABASE_URL}/rest/v1/academy_exam_questions`,{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify({department_code:document.getElementById('qDept').value,question_text:document.getElementById('qStem').value.trim(),options,correct_option:document.getElementById('qCorrect').value,explanation:document.getElementById('qExplain').value.trim(),difficulty:document.getElementById('qDifficulty').value,is_active:true})});if(!r.ok){const b=await r.json();throw Error(b.message||'تعذر حفظ السؤال')}document.getElementById('qMsg').textContent='تم حفظ السؤال.';e.target.reset()}catch(err){document.getElementById('qMsg').textContent=err.message}}}
async function adminCertificates(){
 if(!adminGuard())return;
 try{const rows=await rest('academy_certificates','select=*&order=issued_at.desc');pageShell('الشهادات الصادرة','سجل الشهادات وإمكانية التحقق منها أو إلغائها.',`<div class="content-card"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button>${rows.map(c=>`<article class="result"><b>${esc(c.student_name)}</b><small>${esc(c.certificate_number)} · ${esc(c.department_code)} · ${esc(c.score)}%</small><small>تاريخ الإصدار: ${esc(c.issued_at||'')} · الحالة: ${esc(c.status)}</small><small>رمز التحقق: ${esc(c.verification_token)}</small>${c.status==='valid'?`<button class="text-btn" onclick="revokeCertificate('${esc(c.id)}')">إلغاء الشهادة</button>`:''}</article>`).join('')||'<p>لا توجد شهادات بعد.</p>'}</div>`)}catch(e){pageShell('الشهادات الصادرة','تعذر تحميل الشهادات.',`<div class="notice">${esc(e.message)}</div>`)}
}
async function issueCertificate(attemptId){
 if(!adminGuard()||!confirm('إصدار شهادة لهذا الطالب؟ سيتم السماح فقط لمحاولة مكتملة وناجحة ولم تصدر لها شهادة من قبل.'))return;
 try{await rpc('academy_issue_certificate',{p_attempt_id:attemptId});alert('تم إصدار الشهادة بنجاح.');adminAttempts()}catch(e){alert(e.message)}
}
async function revokeCertificate(id){const reason=prompt('سبب إلغاء الشهادة:');if(!reason)return;try{await rpc('academy_revoke_certificate',{p_certificate_id:id,p_reason:reason});adminCertificates()}catch(e){alert(e.message)}}
async function adminAttempts(){
 if(!adminGuard())return;
 try{
  const [rows,users,certs]=await Promise.all([rest('academy_exam_attempts','select=id,user_id,department_code,score,correct_answers,total_questions,passed,status,started_at,submitted_at&order=started_at.desc'),rest('profiles','select=id,full_name,email'),rest('academy_certificates','select=id,exam_attempt_id,certificate_number')]);
  const um=new Map(users.map(u=>[String(u.id),u])),cm=new Map(certs.map(c=>[String(c.exam_attempt_id),c]));
  pageShell('نتائج الامتحانات','نتائج الطلاب، حالة النجاح، والشهادات الصادرة. الشهادة متاحة فقط للمحاولة المكتملة والناجحة.',`<div class="content-card"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button>${rows.map(a=>{const u=um.get(String(a.user_id)),c=cm.get(String(a.id)),done=['submitted','completed','finished'].includes(String(a.status||'').toLowerCase());return `<article class="result"><b>${esc(u?.full_name||'طالب دون اسم')} — ${esc(a.department_code)}</b><small>${esc(u?.email||a.user_id)}</small><small>النتيجة: ${esc(a.score??'—')}% · ${esc(a.correct_answers??'—')} / ${esc(a.total_questions)} · ${a.passed?'ناجح':'غير ناجح'} · ${esc(a.status)}</small><small>التسليم: ${esc(a.submitted_at||'لم يتم التسليم')}</small>${c?`<div class="notice">صدرت الشهادة: ${esc(c.certificate_number)}</div>`:a.passed&&done?`<button class="primary" onclick="issueCertificate('${esc(a.id)}')">إصدار شهادة النجاح</button>`:''}</article>`}).join('')||'<p>لا توجد محاولات امتحان.</p>'}</div>`);
 }catch(e){pageShell('نتائج الامتحانات','تعذر تحميل النتائج.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function renderCourses(){try{const rows=await rest('courses','select=*&is_published=eq.true&order=created_at.desc');pageShell('الدورات التدريبية','الدورات المنشورة في الأكاديمية.',`<div class="course-grid">${rows.map(c=>`<article class="course-card"><span class="tag">${esc(c.currency||'Course')} · ${esc(c.price??'')}</span><h3>${esc(c.title_en)}</h3><p>${esc(c.description_en||'')}</p><p dir="rtl">${esc(c.description_ar||'')}</p><button class="secondary" onclick="showCourse('${esc(c.id)}')">تفاصيل الدورة</button></article>`).join('')||'<div class="notice">لا توجد دورات منشورة حالياً.</div>'}</div>`)}catch(e){pageShell('الدورات التدريبية','تعذر تحميل الدورات.',`<div class="notice">${esc(e.message)}</div>`)}}
async function showCourse(id){try{const rows=await rest('course_modules',`select=*&course_id=eq.${encodeURIComponent(id)}&order=display_order.asc`);const course=(await rest('courses',`select=*&id=eq.${encodeURIComponent(id)}`))[0];const access=session?await rest('course_enrollments','select=id,status&user_id=eq.'+encodeURIComponent(session.user.id)+'&course_id=eq.'+encodeURIComponent(id)):[];const hasAccess=access.some(x=>x.status==='active');const modules=hasAccess?await Promise.all(rows.map(async m=>({ ...m,lessons:await rest('course_lessons',`select=*&module_id=eq.${encodeURIComponent(m.id)}&order=display_order.asc`)}))):[];pageShell(course?.title_en||'تفاصيل الدورة',course?.description_en||'',`<div class="content-card"><div class="notice">السعر: <b>${esc(course?.price??0)} ${esc(course?.currency||'')}</b></div>${session?'<button class="primary" onclick="startCourseCheckout(\''+esc(id)+'\')">الاشتراك في الدورة</button>':'<button class="primary" onclick="showPage(\'accounts\')">سجّل الدخول للاشتراك</button>'}${hasAccess?modules.map(m=>`<section><h3>${esc(m.title_en)}</h3>${m.lessons.map(l=>`<article class="lesson-card"><h4>${esc(l.title_en)}</h4><div class="content-en">${esc(l.content_en||'')}</div><div class="content-ar">${esc(l.content_ar||'')}</div></article>`).join('')}</section>`).join(''):'<div class="notice">محتوى الدورة متاح للمشتركين بعد تأكيد الدفع. استخدم زر الاشتراك لإرسال طلبك.</div>'}</div>`)}catch(e){pageShell('تفاصيل الدورة','تعذر تحميل محتوى الدورة.',`<div class="notice">${esc(e.message)}</div>`)}}
async function renderSubscriptions(){try{if(!session){pageShell('الاشتراكات','سجّل الدخول لمراجعة اشتراكاتك.',`<button class="primary" onclick="showPage('accounts')">تسجيل الدخول</button>`);return}const [subs,plans]=await Promise.all([rest('subscriptions',`select=*&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc`),rest('subscription_plans','select=*&is_active=eq.true&order=price.asc')]);const byId=new Map(plans.map(p=>[p.id,p]));pageShell('اشتراكاتي','خطط الاشتراك وحالة اشتراكك الحالي. الدروس الأساسية متاحة مجاناً؛ الاشتراك خاص بالدورات والشهادات.',`<div class="content-card"><h3>الخطط المتاحة</h3>${plans.map(p=>`<article class="result"><b>${esc(p.name)}</b><small>${esc(p.duration_days)} يوم · ${esc(p.price)} ${esc(p.currency)}</small></article>`).join('')||'<p>لا توجد خطط مفعّلة حالياً.</p>'}<h3>سجل اشتراكاتك</h3>${subs.map(s=>{const p=byId.get(s.plan_id);return `<article class="result"><b>${esc(p?.name||'خطة غير متاحة')}</b><small>${esc(s.status)} · ينتهي: ${esc(s.expires_at||'غير محدد')}</small></article>`}).join('')||'<p>لا توجد اشتراكات مسجلة في حسابك.</p>'}</div>`)}catch(e){pageShell('الاشتراكات','تعذر تحميل بيانات الاشتراك.',`<div class="notice">${esc(e.message)}</div>`)}}

async function adminPaymentMethods(){
 if(!adminGuard())return;
 try{
  const rows=await rest('academy_payment_methods','select=*&order=display_order.asc,created_at.asc');
  let html='<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة للإدارة</button><button class="primary" onclick="paymentMethodForm()">＋ إضافة وسيلة دفع</button></div>';
  rows.forEach(m=>{html+='<article class="result"><b>'+esc(m.method_name)+'</b><small>'+esc(m.account_name||'')+' · '+esc(m.account_number||'')+'</small><p>'+esc(m.instructions||'')+'</p><small>'+(m.is_active?'مفعّلة للطلاب':'موقوفة')+'</small><div class="admin-actions"><button class="secondary" onclick="paymentMethodForm(\''+m.id+'\')">تعديل</button><button class="secondary" onclick="togglePaymentMethod(\''+m.id+'\','+(!m.is_active)+')">'+(m.is_active?'إيقاف':'تفعيل')+'</button><button class="secondary" onclick="deletePaymentMethod(\''+m.id+'\')">حذف</button></div></article>'});
  if(!rows.length)html+='<p>لم تضف وسائل دفع بعد.</p>';html+='</div>';
  pageShell('إعدادات وسائل الدفع','أضف وسائل الدفع وعدّل بيانات الحساب أو أوقف الوسيلة مؤقتاً.',html);
 }catch(e){pageShell('إعدادات وسائل الدفع','تعذر تحميل وسائل الدفع.','<div class="notice">'+esc(e.message)+'</div>')}
}
async function paymentMethodForm(id){
 if(!adminGuard())return;let m={method_name:'',account_name:'',account_number:'',instructions:'',display_order:0,is_active:true};
 if(id){try{m=(await rest('academy_payment_methods','select=*&id=eq.'+encodeURIComponent(id)))[0]||m}catch(e){alert(e.message);return}}
 const html='<form id="paymentMethodForm" class="content-card"><label>اسم وسيلة الدفع<input id="pm_name" required value="'+esc(m.method_name)+'" placeholder="Bankak / Fawry / تحويل بنكي"></label><label>اسم صاحب الحساب<input id="pm_owner" value="'+esc(m.account_name||'')+'"></label><label>رقم الحساب أو الهاتف<input id="pm_number" value="'+esc(m.account_number||'')+'"></label><label>تعليمات الدفع<textarea id="pm_instructions" rows="4">'+esc(m.instructions||'')+'</textarea></label><label>ترتيب العرض<input id="pm_order" type="number" value="'+(Number(m.display_order)||0)+'"></label><label><input id="pm_active" type="checkbox" '+(m.is_active?'checked':'')+'> إظهار الوسيلة للطلاب</label><div class="admin-actions"><button class="primary">حفظ</button><button type="button" class="secondary" onclick="adminPaymentMethods()">إلغاء</button></div><p id="pm_msg" class="form-message"></p></form>';
 pageShell(id?'تعديل وسيلة الدفع':'إضافة وسيلة دفع','أدخل اسم الوسيلة وبيانات التحويل والتعليمات التي ستظهر للطلاب.',html);
 document.getElementById('paymentMethodForm').onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('pm_msg');const payload={method_name:document.getElementById('pm_name').value.trim(),account_name:document.getElementById('pm_owner').value.trim()||null,account_number:document.getElementById('pm_number').value.trim()||null,instructions:document.getElementById('pm_instructions').value.trim()||null,display_order:Number(document.getElementById('pm_order').value)||0,is_active:document.getElementById('pm_active').checked};try{const url=SUPABASE_URL+'/rest/v1/academy_payment_methods'+(id?'?id=eq.'+encodeURIComponent(id):'');const r=await authorizedFetch(url,{method:id?'PATCH':'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!r.ok){const b=await r.json().catch(()=>({}));throw Error(b.message||b.details||'تعذر حفظ وسيلة الدفع')}adminPaymentMethods()}catch(err){msg.textContent=err.message}}
}
async function togglePaymentMethod(id,active){if(!adminGuard())return;try{const r=await authorizedFetch(SUPABASE_URL+'/rest/v1/academy_payment_methods?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({is_active:active})});if(!r.ok)throw Error('تعذر تحديث الوسيلة');adminPaymentMethods()}catch(e){alert(e.message)}}
async function deletePaymentMethod(id){if(!adminGuard()||!confirm('حذف وسيلة الدفع نهائياً؟'))return;try{const r=await authorizedFetch(SUPABASE_URL+'/rest/v1/academy_payment_methods?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw Error('تعذر حذف الوسيلة');adminPaymentMethods()}catch(e){alert(e.message)}}

function connection(){const el=document.getElementById('connectionState');if(el)el.textContent=(navigator.onLine?'● متصل':'● دون اتصال')+' · '+(dataSource==='supabase'?'بيانات سحابية':'بيانات محلية')}
try{const saved=localStorage.getItem('hakim_auth_session');if(saved)session=JSON.parse(saved)}catch(e){session=null}
document.addEventListener('click',event=>{const account=event.target.closest('#accountBtn, .home-notices button[aria-label="حسابي"]');if(account){event.preventDefault();event.stopImmediatePropagation();showPage('accounts')}},true);
function setupPWAInstall(){
 const button=document.getElementById('installAppButton');if(!button)return;
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
 const hide=()=>{button.hidden=true};if(standalone()){hide();return}button.hidden=false;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;button.textContent='تثبيت التطبيق';button.hidden=false});
 window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;hide();alert('تم تثبيت أكاديمية الحكيم بنجاح.')});
 button.addEventListener('click',async()=>{if(standalone()){hide();return}if(deferredInstallPrompt){deferredInstallPrompt.prompt();const choice=await deferredInstallPrompt.userChoice;if(choice?.outcome==='accepted')hide();deferredInstallPrompt=null;return}const ua=navigator.userAgent||'';if(/iphone|ipad|ipod/i.test(ua)){alert('لتثبيت الأكاديمية على iPhone أو iPad: اضغط زر المشاركة في Safari، ثم اختر إضافة إلى الشاشة الرئيسية ثم اضغط إضافة.')}else{alert('لتثبيت الأكاديمية: افتح قائمة المتصفح ⋮ ثم اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية. إذا لم يظهر الخيار، افتح الرابط باستخدام Chrome وتأكد من اتصالك بالإنترنت.')}});
}
setupPWAInstall();
window.addEventListener('online',()=>{connection();loadContent().catch(e=>console.warn('Full online resync deferred:',e.message));syncOfflineCompletions().catch(e=>console.warn('Offline progress sync deferred:',e.message))});
window.addEventListener('offline',connection);
syncAdminNavigation();document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='admin'&&!isAdmin())return;showPage(b.dataset.page)}));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.go)));document.getElementById('homeLink').onclick=e=>{e.preventDefault();renderHome()};document.getElementById('accountBtn').onclick=()=>showPage('accounts');const hs=document.getElementById('headerSearch'),hsb=document.getElementById('headerSearchBtn');if(hsb)hsb.onclick=()=>search(hs?.value||'','headerSearchResults');if(hs){hs.addEventListener('input',()=>search(hs.value,'headerSearchResults'));hs.addEventListener('keydown',e=>{if(e.key==='Enter')search(hs.value,'headerSearchResults')})}window.addEventListener('online',()=>{connection();syncOfflineCompletions()});window.addEventListener('offline',connection);
const overlay=document.getElementById('welcomeOverlay');if(overlay){const close=()=>{overlay.classList.add('hidden');document.body.classList.remove('portal-gate-open')};overlay.classList.remove('hidden');document.body.classList.add('portal-gate-open');const startBtn=document.getElementById('welcomeStart'),loginBtn=document.getElementById('welcomeLogin'),skipBtn=document.getElementById('welcomeClose');if(startBtn)startBtn.onclick=close;if(skipBtn)skipBtn.onclick=close;if(loginBtn)loginBtn.onclick=()=>{close();showPage('accounts')}}
loadContent().then(async()=>{await loadHomepageSettings();applyWelcomePortalSettings();refreshOfflineSyncBadge();await loadProfile();if(isAdmin()){const gate=document.getElementById('welcomeOverlay');if(gate)gate.classList.add('hidden');document.body.classList.remove('portal-gate-open');renderAdmin()}else{renderHome()}await syncOfflineCompletions();const token=new URLSearchParams(location.search).get('verify');if(token&&!isAdmin())await verifyCertificate(token);/* Image archiving is started after loadContent renders the current curriculum. */}).catch(e=>{main.innerHTML=`<div class="content-card"><h2>تعذر تحميل المحتوى</h2><p>${esc(e.message)}</p></div>`;console.error(e)});
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await registration.update().catch(e=>console.info('Service worker update check deferred:',e.message));navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!sessionStorage.getItem('hakim_sw_controller_reload')){sessionStorage.setItem('hakim_sw_controller_reload','1');location.reload()}});setTimeout(()=>sessionStorage.removeItem('hakim_sw_controller_reload'),2500)}catch(e){console.error('Academy service worker registration failed:',e)}});


async function startCourseCheckout(courseId){
 if(!session||!session.user||!session.user.id){showPage('accounts');return}
 try{
  const result=await Promise.all([
   rest('courses','select=*&id=eq.'+encodeURIComponent(courseId)+'&is_published=eq.true'),
   rest('academy_payment_methods','select=*&is_active=eq.true&order=display_order.asc'),
   rest('course_enrollments','select=id,status&user_id=eq.'+encodeURIComponent(session.user.id)+'&course_id=eq.'+encodeURIComponent(courseId))
  ]);
  const course=result[0][0],methods=result[1],enrolled=result[2];
  if(!course)throw Error('الدورة غير متاحة.');
  if(enrolled.some(x=>x.status==='active'))throw Error('أنت مسجل بالفعل في هذه الدورة.');
  if(enrolled.some(x=>x.status==='pending'))throw Error('لديك طلب قيد المراجعة لهذه الدورة.');
  if(!methods.length)throw Error('لا توجد وسيلة دفع مفعلة حالياً.');
  let html='<form id="coursePayForm" class="content-card"><h3>'+esc(course.title_ar||course.title_en)+'</h3><p>المبلغ: <b>'+esc(course.price||0)+' '+esc(course.currency||'')+'</b></p><label>وسيلة الدفع<select id="payMethod">'+methods.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.method_name)+'</option>').join('')+'</select></label><div id="payDetails" class="notice"></div><label>اسم صاحب التحويل<input id="payerName" required maxlength="150"></label><label>رقم العملية / مرجع التحويل<input id="payReference" required maxlength="150"></label><label>إيصال الدفع (صورة أو PDF، حد 5MB)<input id="payProof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></label><button class="primary" id="paySubmit">إرسال الطلب</button><button type="button" class="secondary" onclick="showCourse(\''+esc(courseId)+'\')">رجوع</button><p id="payMessage" class="form-message"></p></form>';
  pageShell('طلب الاشتراك','أكمل بيانات التحويل وأرفق الإيصال.',html);
  const sel=document.getElementById('payMethod'),details=document.getElementById('payDetails');
  function showDetails(){const m=methods.find(x=>String(x.id)===sel.value);details.innerHTML='<b>'+esc(m.method_name)+'</b><br>صاحب الحساب: '+esc(m.account_name||'—')+'<br>رقم الحساب: '+esc(m.account_number||'—')+'<br>'+esc(m.instructions||'')}
  sel.onchange=showDetails;showDetails();
  document.getElementById('coursePayForm').onsubmit=async function(e){
   e.preventDefault();const button=document.getElementById('paySubmit'),msg=document.getElementById('payMessage');button.disabled=true;msg.textContent='جارٍ إرسال الطلب...';
   try{
    const file=document.getElementById('payProof').files[0];if(!file)throw Error('أرفق الإيصال.');
    const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'};if(!types[file.type])throw Error('نوع الملف غير مسموح.');if(file.size>5242880)throw Error('حجم الملف أكبر من 5MB.');
    const path=session.user.id+'/'+crypto.randomUUID()+'.'+types[file.type];
    const upload=await fetch(SUPABASE_URL+'/storage/v1/object/academy-payment-proofs/'+path,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,Authorization:'Bearer '+session.access_token,'Content-Type':file.type},body:file});
    if(!upload.ok){const b=await upload.json().catch(()=>({}));throw Error(b.message||'فشل رفع الإيصال.')}
    const subRes=await authorizedFetch(SUPABASE_URL+'/rest/v1/subscriptions',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:session.user.id,plan_id:null,status:'pending'})});
    const subBody=await subRes.json().catch(()=>[]);if(!subRes.ok||!subBody[0])throw Error(subBody.message||'فشل إنشاء طلب الاشتراك.');
    const subId=subBody[0].id;
    const enrollRes=await authorizedFetch(SUPABASE_URL+'/rest/v1/course_enrollments',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:session.user.id,course_id:courseId,subscription_id:subId,status:'pending'})});
    const enrollBody=await enrollRes.json().catch(()=>({}));if(!enrollRes.ok)throw Error(enrollBody.message||'فشل تسجيل طلب الدورة.');
    const method=methods.find(x=>String(x.id)===sel.value);
    const payRes=await authorizedFetch(SUPABASE_URL+'/rest/v1/payments',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:session.user.id,subscription_id:subId,course_id:courseId,amount:Number(course.price||0),currency:course.currency||'USD',payment_method:method.method_name,payment_reference:document.getElementById('payReference').value.trim(),payer_name:document.getElementById('payerName').value.trim(),proof_path:path,receipt_file_name:file.name,status:'pending'})});
    const payBody=await payRes.json().catch(()=>({}));if(!payRes.ok)throw Error(payBody.message||'فشل حفظ طلب الدفع.');
    pageShell('تم إرسال الطلب','طلبك قيد المراجعة.', '<div class="notice">استلمنا طلب الاشتراك وإيصال الدفع. سيتم تفعيل الدورة بعد مراجعة التحويل.</div><button class="primary" onclick="myCourseRequests()">متابعة طلباتي</button>');
   }catch(err){msg.textContent=err.message;button.disabled=false}
  };
 }catch(err){pageShell('طلب الاشتراك','تعذر بدء الطلب.','<div class="notice">'+esc(err.message)+'</div>')}
}
async function myCourseRequests(){
 if(!session||!session.user){showPage('accounts');return}
 try{
  const rows=await rest('course_enrollments','select=*&user_id=eq.'+encodeURIComponent(session.user.id)+'&order=enrolled_at.desc');
  const courses=await rest('courses','select=id,title_en,title_ar');
  const map=new Map(courses.map(c=>[String(c.id),c.title_ar||c.title_en]));
  pageShell('طلباتي في الدورات','حالة طلبات الاشتراك.', '<div class="content-card">'+(rows.map(x=>'<article class="result"><b>'+esc(map.get(String(x.course_id))||'دورة')+'</b><small>الحالة: '+esc(x.status||'pending')+'</small></article>').join('')||'<p>لا توجد طلبات.</p>')+'</div>');
 }catch(e){pageShell('طلباتي','تعذر تحميل الطلبات.','<div class="notice">'+esc(e.message)+'</div>')}
}

async function adminStudentPerformance(page=1,query=''){
 if(!adminGuard())return;
 const perPage=25,offset=(Math.max(1,page)-1)*perPage;
 const q=String(query||'').trim();
 try{
  const [profiles,completions,attempts]=await Promise.all([
   rest('profiles','select=id,full_name,email,created_at&order=created_at.desc&limit=1000'),
   rest('academy_lesson_completions','select=user_id,lesson_id,completed_at&order=completed_at.desc&limit=10000'),
   rest('academy_exam_attempts','select=user_id,total_questions,correct_answers,score,submitted_at,status&order=submitted_at.desc&limit=10000')
  ]);
  const all=profiles||[],done=completions||[],exam=attempts||[];
  const byUser=new Map();
  for(const p of all)byUser.set(String(p.id),{...p,lessons:new Set(),attempts:0,correct:0,questions:0,latest:null,scoreSum:0,scoreCount:0});
  for(const x of done){const u=byUser.get(String(x.user_id));if(u){u.lessons.add(String(x.lesson_id));if(x.completed_at&&(!u.latest||x.completed_at>u.latest))u.latest=x.completed_at;}}
  for(const x of exam){const u=byUser.get(String(x.user_id));if(u){u.attempts++;u.correct+=Number(x.correct_answers||0);u.questions+=Number(x.total_questions||0);if(x.score!==null&&x.score!==undefined){u.scoreSum+=Number(x.score);u.scoreCount++;}if(x.submitted_at&&(!u.latest||x.submitted_at>u.latest))u.latest=x.submitted_at;}}
  const students=[...byUser.values()].map(u=>({...u,accuracy:u.questions?Math.round(u.correct/u.questions*100):null,average:u.scoreCount?Math.round(u.scoreSum/u.scoreCount):null}));
  const activeCutoff=Date.now()-30*86400000;
  const active=students.filter(s=>s.latest&&new Date(s.latest).getTime()>=activeCutoff).length;
  const avg=students.filter(s=>s.accuracy!==null);
  const academyAccuracy=avg.length?Math.round(avg.reduce((n,s)=>n+s.accuracy,0)/avg.length):null;
  const filtered=students.filter(s=>!q||String(s.full_name||'').toLowerCase().includes(q.toLowerCase())||String(s.email||'').toLowerCase().includes(q.toLowerCase()));
  const pageCount=Math.max(1,Math.ceil(filtered.length/perPage)),current=Math.min(Math.max(1,page),pageCount),shown=filtered.slice((current-1)*perPage,current*perPage);
  const stat=(n,label)=>'<div class="stat"><b>'+n+'</b><small>'+label+'</small></div>';
  pageShell('لوحة أداء الطلاب','Student Performance Dashboard — لوحة إدارية لمتابعة أداء جميع الطلاب.',`
   <div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة إلى نافذة الإدارة</button></div>
   <div class="stats">${stat(students.length,'حساب طالب ضمن أول 1,000 حساب محمّل')}${stat(active,'نشط خلال آخر 30 يوماً')}${stat(academyAccuracy===null?'—':academyAccuracy+'%','متوسط دقة الإجابات للطلاب ذوي محاولات مسجلة')}${stat(exam.length,'محاولة امتحان محمّلة')}</div>
   <div class="notice">تُعرض بيانات الطلاب المسجلة فعلياً فقط. النشاط محسوب من آخر إكمال درس أو تسليم امتحان. لا يعني غياب السجل أن الطالب ضعيف الأداء.</div>
   <label for="adminStudentSearch">البحث باسم الطالب أو البريد الإلكتروني</label><input id="adminStudentSearch" type="search" value="${esc(q)}" placeholder="ابحث عن طالب..." onkeydown="if(event.key==='Enter')adminStudentPerformance(1,this.value)">
   <button class="primary" onclick="adminStudentPerformance(1,document.getElementById('adminStudentSearch').value)">بحث</button>
   <div class="table-wrap"><table class="data-table"><thead><tr><th>الطالب</th><th>تاريخ التسجيل</th><th>الدروس المكتملة</th><th>محاولات الامتحان</th><th>دقة الإجابات</th><th>آخر نشاط</th></tr></thead><tbody>
   ${shown.map(s=>'<tr><td><b>'+esc(s.full_name||'Student')+'</b><br><small>'+esc(s.email||'')+'</small></td><td>'+esc(s.created_at?new Date(s.created_at).toLocaleDateString():'—')+'</td><td>'+s.lessons.size+'</td><td>'+s.attempts+'</td><td>'+(s.accuracy===null?'—':s.accuracy+'%')+'</td><td>'+esc(s.latest?new Date(s.latest).toLocaleDateString():'لا يوجد نشاط مسجل')+'</td></tr>').join('')||'<tr><td colspan="6">لا توجد نتائج مطابقة.</td></tr>'}
   </tbody></table></div>
   <div class="admin-actions"><button class="secondary" ${current<=1?'disabled':''} onclick="adminStudentPerformance(${current-1},document.getElementById('adminStudentSearch').value)">السابق</button><span>صفحة ${current} من ${pageCount} — ${filtered.length} طالباً</span><button class="secondary" ${current>=pageCount?'disabled':''} onclick="adminStudentPerformance(${current+1},document.getElementById('adminStudentSearch').value)">التالي</button></div>
   <small>ملاحظة تقنية: تُحمّل الواجهة حالياً حتى 1,000 حساب و10,000 سجل إكمال و10,000 محاولة في كل طلب؛ يلزم الانتقال إلى تجميع خادمي وصفحات قاعدة بيانات عند تجاوز هذه الحدود.</small>
   </div>`);
 }catch(e){pageShell('لوحة أداء الطلاب','تعذر تحميل إحصاءات الطلاب.',`<div class="content-card"><div class="notice">${esc(e.message||String(e))}</div><button class="secondary" onclick="renderAdmin()">العودة إلى الإدارة</button></div>`);}
}

async function renderMyStudentPerformance(){
 if(!session?.user?.id){showPage('accounts');return}
 const uid=encodeURIComponent(session.user.id);
 pageShell('لوحة أدائي الدراسي','My Student Dashboard',`<div id="myStudentStats" class="content-card"><p>جارٍ تحميل بياناتك التعليمية…</p><p dir="rtl">يتم الآن تحميل تقدمك ونتائجك المحفوظة.</p></div>`);
 try{
  const [done,attempts]=await Promise.all([
   rest('academy_lesson_completions',`select=lesson_id,completed_at&user_id=eq.${uid}&order=completed_at.desc`),
   rest('academy_exam_attempts',`select=department_code,total_questions,correct_answers,score,passed,submitted_at,status&user_id=eq.${uid}&order=submitted_at.desc&limit=100`)
  ]);
  const lessons=[...new Set((done||[]).map(x=>String(x.lesson_id)))].length;
  const exams=attempts||[],submitted=exams.filter(x=>x.submitted_at||x.status==='submitted');
  const questions=submitted.reduce((n,x)=>n+Number(x.total_questions||0),0),correct=submitted.reduce((n,x)=>n+Number(x.correct_answers||0),0);
  const accuracy=questions?Math.round(correct/questions*100):null;
  const average=submitted.length?Math.round(submitted.reduce((n,x)=>n+Number(x.score??0),0)/submitted.length):null;
  const rows=submitted.slice(0,10).map(x=>'<tr><td>'+esc(x.department_code||'—')+'</td><td>'+Number(x.total_questions||0)+'</td><td>'+Number(x.correct_answers||0)+'</td><td>'+esc(x.score===null||x.score===undefined?'—':x.score+'%')+'</td><td>'+((x.passed===true)?'ناجح':(x.passed===false?'لم يجتز':'—'))+'</td><td>'+esc(x.submitted_at?new Date(x.submitted_at).toLocaleDateString():'—')+'</td></tr>').join('');
  const target=document.getElementById('myStudentStats');if(!target)return;
  target.innerHTML=`<div class="stats"><div class="stat"><b>${lessons}</b><small>الدروس المكتملة</small></div><div class="stat"><b>${submitted.length}</b><small>الامتحانات المكتملة</small></div><div class="stat"><b>${accuracy===null?'—':accuracy+'%'}</b><small>دقة الإجابات</small></div><div class="stat"><b>${average===null?'—':average+'%'}</b><small>متوسط درجات الامتحانات</small></div></div>
  <h3 dir="ltr" class="clinical-en">My examination history</h3><h3 dir="rtl" class="clinical-ar">سجل امتحاناتي</h3>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>القسم</th><th>الأسئلة</th><th>الصحيحة</th><th>الدرجة</th><th>النتيجة</th><th>التاريخ</th></tr></thead><tbody>${rows||'<tr><td colspan="6">لم تسجل أي امتحانات مكتملة بعد.</td></tr>'}</tbody></table></div>
  <p dir="ltr" class="clinical-en">Only records saved under your account are shown here. Your learning data is private to your account.</p><p dir="rtl" class="clinical-ar">تعرض هذه اللوحة السجلات المحفوظة في حسابك فقط، ولا يستطيع الطلاب الآخرون الاطلاع على تقدمك أو نتائجك.</p>
  <button class="secondary" onclick="showPage('accounts')">العودة إلى حسابي</button>`;
 }catch(e){const t=document.getElementById('myStudentStats');if(t)t.innerHTML='<div class="notice">تعذر تحميل بياناتك: '+esc(e.message||String(e))+'</div><button class="secondary" onclick="renderMyStudentPerformance()">إعادة المحاولة</button>'}
}


/* Persistent academy-wide language switch (Arabic/English). Scientific lesson
   bodies are intentionally left in their authored bilingual form. */
const ACADEMY_UI_TRANSLATIONS={
 'أكاديمية الحكيم لعلوم البصريات':'Alhakim Optics Academy',
 'بوابتك نحو التميز والاحتراف في علوم البصريات':'Your gateway to excellence in optometry',
 'منصة تعليمية إلكترونية متكاملة':'An integrated digital learning platform',
 'تعلّم .. تدرب .. اختبر معلوماتك .. وحقق أهدافك':'Learn · Practice · Test your knowledge · Achieve your goals',
 'تعلم بمرونة':'Flexible Learning',
 'محاضرات علمية منظمة في أي وقت ومن أي مكان':'Organized scientific lectures, anytime and anywhere',
 'اختبر معلوماتك':'Test Your Knowledge',
 'اختبارات تفاعلية وبنوك أسئلة للتدريب':'Interactive tests and question banks',
 'احصل على شهاداتك':'Earn Certificates',
 'تابع إنجازك وأكمل الدورات التعليمية':'Track your progress and complete courses',
 '🎓 استكشف الأكاديمية ←':'🎓 Explore the Academy ←',
 '♙ تسجيل الدخول / إنشاء حساب ←':'♙ Sign In / Create Account ←',
 'بإشراف وتأسيس':'Founded and supervised by',
 'بكالوريوس الشرف علوم البصريات — جامعة غرب كردفان':'BSc (Hons) Optometry — University of West Kordofan',
 'دعم فني':'Technical Support','ومساعدة مستمرة':'Ongoing assistance',
 'متوافق مع':'Compatible with','جميع الأجهزة':'All devices',
 'تعليم آمن':'Secure Learning','ومحتوى منظم':'Organized content',
 'مرجعاً علمياً':'Scientific references','موضوعاً علمياً':'Scientific topics',
 'معاً .. نصنع مستقبلاً أفضل في مجال البصريات':'Together, we build a better future in optometry',
 'العلم نور.. والبصريات رسالة إنسانية':'Knowledge is light · Optometry is a humanitarian mission',
 'تخطي شاشة الترحيب':'Skip Welcome Screen',
 'مرحباً بك في':'Welcome to',
 'منصة تعليمية متخصصة لعلوم البصريات، تجمع المنهج العلمي والدروس والاختبارات والتدريب السريري في مساحة واحدة.':'A specialized optometry learning platform bringing together scientific curricula, lessons, assessments, and clinical training.',
 'استكشف الأقسام العلمية ←':'Explore Departments ←',
 'الأقسام العلمية':'Academic Departments','المحاضرات':'Lectures',
 'جميع المحاضرات المنشورة في الأقسام العلمية.':'All published lectures across academic departments.',
 'اختر قسماً لاستعراض موضوعاته ومحاضراته.':'Choose a department to explore its topics and lectures.',
 'ابحث عن دورات، مصادر، أو طلب...':'Search courses, references, or requests...',
 'بحث':'Search','عرض الكل ←':'View All ←',
 'ماذا تريد أن تتعلم اليوم؟':'What would you like to learn today?',
 'ابدأ رحلتك التعليمية الآن ←':'Start Your Learning Journey ←',
 'الأكاديمية':'Academy','المقالات والبحوث':'Articles & Research',
 'الدورات المميزة':'Featured Courses','تفاصيل الدورة':'Course Details',
 'ابدأ رحلتك التعليمية الآن.':'Start your learning journey now.',
 'بنك الأسئلة':'Question Bank','اختر المحاضرة لعرض أسئلتها المنشورة من قاعدة البيانات.':'Choose a lecture to view its published questions.',
 'العودة إلى الأقسام':'Back to Departments','العودة إلى القسم':'Back to Department',
 'العودة للواجهة الرئيسية':'Back to Home','ابدأ أسئلة المحاضرة':'Start Lecture Quiz',
 'تسجيل الدخول':'Sign In','إنشاء حساب':'Create Account',
 'حسابي':'My Account','لوحة الطالب':'Student Dashboard',
 'الإشعارات':'Notifications','تم إكمال الدرس':'Lesson Completed',
 'لا توجد محاضرات مسجلة حالياً.':'No lectures are currently available.',
 'الرئيسية':'Home','الرئيسية الأكاديمية':'Academy Home','المصادر العلمية':'Scientific References',
 'الامتحانات':'Examinations','الاختبارات':'Quizzes','تقدمك الدراسي':'Your Learning Progress',
 'الدورات':'Courses','طلباتي في الدورات':'My Course Requests','حالة طلبات الاشتراك.':'Course enrollment request status.',
 'العودة إلى حسابي':'Back to My Account','إعادة المحاولة':'Try Again','السابق':'Previous','التالي':'Next',
 'الطالب':'Student','تاريخ التسجيل':'Registration Date','الدروس المكتملة':'Completed Lessons',
 'محاولات الامتحان':'Exam Attempts','دقة الإجابات':'Answer Accuracy','آخر نشاط':'Last Activity',
 'لا توجد نتائج مطابقة.':'No matching results.','لا يوجد نشاط مسجل':'No activity recorded',
 'لم تسجل أي امتحانات مكتملة بعد.':'No completed exams have been recorded yet.',
 'ناجح':'Passed','لم يجتز':'Not Passed','النتيجة':'Result','الدرجة':'Score','التاريخ':'Date',
 'الأسئلة':'Questions','الصحيحة':'Correct','بحث عن طالب...':'Search for a student...',
 'البحث باسم الطالب أو البريد الإلكتروني':'Search by student name or email',
 'العودة إلى نافذة الإدارة':'Back to Administration','لوحة أداء الطلاب':'Student Performance Dashboard',
 'لوحة أدائي الدراسي':'My Learning Dashboard','سجل امتحاناتي':'My Exam History',
 'جارٍ تحميل بياناتك التعليمية…':'Loading your learning data…',
 'تعذر تحميل بياناتك: ':'Unable to load your data: ',
 'تثبيت التطبيق':'Install App','تثبيت الأكاديمية':'Install Academy',
 'بحث في الأكاديمية':'Search the academy','جارٍ التحميل':'Loading',
 'ماذا تريد أن تتعلم اليوم؟':'What would you like to learn today?',
 'منصة تعليمية متخصصة لعلوم البصريات، تجمع المنهج العلمي والدروس والاختبارات والتدريب السريري في مساحة واحدة.':'A specialized optometry learning platform bringing together scientific curricula, lessons, assessments, and clinical training.',
 'منشور':'Published','مسودة للمراجعة العلمية':'Pending Scientific Review',
 'الامتحان النهائي للقسم':'Department Final Exam',
 'ابدأ الامتحان':'Start Exam','درجة النجاح':'Passing Score',
 'تسليم الامتحان وتصحيح الإجابات':'Submit Exam & Grade Answers',
 'إلغاء والعودة للقسم':'Cancel and Return to Department',
 'مراجع المحاضرة':'Lecture References','المراجع':'References',
 'اللغة':'Language',
 'بوابتك المتكاملة':'Your complete gateway',
 'لعلوم البصريات':'to Optometry',
 'تعلّم علم البصريات بمنهجية واضحة، واستكشف المحاضرات والمراجع العلمية، وطوّر مهاراتك من خلال التدريب والاختبارات التفاعلية.':'Learn optometry through a structured approach. Explore lectures and scientific references, and develop your skills through interactive practice and assessments.',
 'استكشف الأكاديمية':'Explore the Academy',
 'تسجيل الدخول / إنشاء حساب':'Sign In / Create Account',
 'دخول الطلاب':'Student Login',
 'تعليم متخصص في علوم البصريات':'Specialized Optometry Education',
 'كل ما تحتاجه في مكان واحد':'Everything you need in one place',
 'الأقسام العلمية':'Academic Departments',
 'المكتبة العلمية':'Scientific Library',
 'بنك الأسئلة':'Question Bank',
 'الدورات والشهادات':'Courses & Certificates',
 'مراجع متاحة وأبحاث وأوراق علمية':'Available references, research and scientific papers',
 'تعلّم دون اتصال':'Learn Offline',
 'تعمل الدروس والمكتبة دون اتصال بعد فتح الأكاديمية أول مرة. تسجيل الحساب والاشتراكات يتطلبان الإنترنت.':'Lessons and the library work offline after the first visit. Account access and subscriptions require an internet connection.'
};
const ACADEMY_UI_REVERSE=Object.fromEntries(Object.entries(ACADEMY_UI_TRANSLATIONS).map(([a,b])=>[b,a]));
let academyLanguage=localStorage.getItem('hakim_academy_language')==='en'?'en':'ar';
function translateAcademyUi(root=document){
 const dict=academyLanguage==='en'?ACADEMY_UI_TRANSLATIONS:ACADEMY_UI_REVERSE;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
  if(!node.nodeValue||!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;
  const p=node.parentElement;if(!p||p.closest('.lecture-body,.lecture-audio-panel,script,style,textarea,code,pre,[data-no-translate]'))return NodeFilter.FILTER_REJECT;
  return NodeFilter.FILTER_ACCEPT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const lead=n.nodeValue.match(/^\\s*/)?.[0]||'',tail=n.nodeValue.match(/\\s*$/)?.[0]||'',key=n.nodeValue.trim();if(dict[key])n.nodeValue=lead+dict[key]+tail});
 root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach(el=>['placeholder','aria-label','title'].forEach(attr=>{const v=el.getAttribute(attr);if(v&&dict[v])el.setAttribute(attr,dict[v])}));
}
function setAcademyLanguage(lang){
 academyLanguage=lang==='en'?'en':'ar';
 localStorage.setItem('hakim_academy_language',academyLanguage);
 document.documentElement.lang=academyLanguage;
 document.documentElement.dir=academyLanguage==='ar'?'rtl':'ltr';
 document.body.classList.toggle('academy-language-en',academyLanguage==='en');
 document.querySelectorAll('[data-academy-language]').forEach(btn=>btn.classList.toggle('active',btn.dataset.academyLanguage===academyLanguage));
 const ar=document.getElementById('portalLangAr'),en=document.getElementById('portalLangEn');
 if(ar)ar.classList.toggle('active',academyLanguage==='ar');
 if(en)en.classList.toggle('active',academyLanguage==='en');
 translateAcademyUi(document.body);
}
document.addEventListener('click',e=>{
 const languageButton=e.target.closest('[data-academy-language]');
 if(languageButton){e.preventDefault();setAcademyLanguage(languageButton.dataset.academyLanguage)}
 if(e.target.closest('#portalLangAr')){e.preventDefault();setAcademyLanguage('ar')}
 if(e.target.closest('#portalLangEn')){e.preventDefault();setAcademyLanguage('en')}
});
const academyLanguageObserver=new MutationObserver(records=>{if(academyLanguage!=='en')return;records.forEach(r=>{if(r.type==='childList')r.addedNodes.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE)translateAcademyUi(n);else if(n.nodeType===Node.TEXT_NODE){const dict=ACADEMY_UI_TRANSLATIONS,k=n.nodeValue.trim();if(dict[k])n.nodeValue=n.nodeValue.replace(k,dict[k])}});else if(r.type==='characterData'){const k=r.target.nodeValue.trim();if(ACADEMY_UI_TRANSLATIONS[k])r.target.nodeValue=r.target.nodeValue.replace(k,ACADEMY_UI_TRANSLATIONS[k])}})});
academyLanguageObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
setAcademyLanguage(academyLanguage);
