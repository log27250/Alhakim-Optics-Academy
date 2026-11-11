/* HAKIM OPTICS ACADEMY v2.1 — public browser key only; never add service_role here. */
const SUPABASE_URL='https://upmluemrhkadcffcsuzt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_k0VCQgULXGy_qnjvfyQKkjg_M9x43HVc';
const SUPABASE_ANON_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbWx1ZW1yaGthZGNmZmNzdXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5MTMzNDIsImV4cCI6MjEwOTQ4OTM0Mn0.TjDwjDgRVqTyXyFM_TSAsJMyEMcra7N7F71cVi4z4MU';
const CONTENT_URL='./content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json';
let DB=null,dataSource='local',session=null,profile=null,deferredInstallPrompt=null;
const HOME_DEFAULTS={
 logo_url:'./assets/alhakim-logo.png',
 founder_photo_url:'',
 founder_name:'د. لقمان بابكر الشيخ',
 founder_title:'بكالوريوس الشرف علوم البصريات — جامعة غرب كردفان',
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
  {label:'المراجع',icon:'▣',page:'library',visible:true},
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
async function rest(table,query='select=*'){const r=await authorizedFetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`,{headers:authHeaders()});if(!r.ok){const body=await r.json().catch(()=>({}));throw Error(`${table}: ${r.status} ${body.message||body.msg||body.error_description||body.error||''}`.trim())}return r.json()}
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
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))}
const ACADEMY_ADMIN_EMAIL='alhakimoptic@gmail.com';
function currentAccountEmail(){let email=session?.user?.email||session?.email||session?.user_metadata?.email||'';if(!email){try{const saved=JSON.parse(localStorage.getItem('hakim_auth_session')||'null');email=saved?.user?.email||saved?.email||''}catch(_){}}return String(email).trim().toLowerCase()}
function isAdminAccount(){return currentAccountEmail()===ACADEMY_ADMIN_EMAIL}
function isAdmin(){return isAdminAccount()&&profile?.is_admin===true}
function canViewLesson(l){return isAdmin()||String(l?.status||'').toLowerCase()==='published'||(!l?.status&&!l?.review_required)}
function syncAdminNavigation(){const canEnter=isAdmin();document.querySelectorAll('[data-page="admin"]').forEach(b=>{b.hidden=!canEnter;b.setAttribute('aria-hidden',String(!canEnter))});const top=document.getElementById('adminTopButton');if(top){top.hidden=!canEnter;top.onclick=()=>{if(!isAdmin())return;showPage('admin')}}const entry=document.getElementById('homeAdminEntry');if(entry)entry.remove()}
async function loadContent(){
 const empty={departments:[],lessons:[],reference_catalog:[],department_count:0,curriculum_topic_count:0};
 let local=empty, cloudError=null, topicError=null, lessonError=null;
 try{const cached=localStorage.getItem('alhakim_content_cache');if(cached)local=JSON.parse(cached)||empty}catch(e){console.warn('Invalid local curriculum cache:',e)}
 try{const r=await fetch(CONTENT_URL,{cache:'no-store'});if(r.ok){const bundled=await r.json();if(bundled&&Array.isArray(bundled.departments))local=bundled}}catch(e){console.info('Bundled curriculum unavailable; continuing with cloud data or saved cache.')}
 DB=local;dataSource='local';
 try{
  // Departments are the essential payload. Load them independently so a failure
  // in topics or lessons can never force the entire academy back to stale local data.
  const d=await rest('departments','select=*&order=display_order.asc,code.asc');
  if(!Array.isArray(d)||!d.length)throw Error('لم تصل بيانات الأقسام المنشورة من قاعدة البيانات.');
  let t=[],l=[];
  const results=await Promise.allSettled([
   rest('topics','select=*&order=display_order.asc'),
   rest('lessons','select=*&order=display_order.asc')
  ]);
  if(results[0].status==='fulfilled'&&Array.isArray(results[0].value))t=results[0].value;
  else topicError=results[0].reason?.message||'تعذر تحميل الموضوعات';
  if(results[1].status==='fulfilled'&&Array.isArray(results[1].value))l=results[1].value;
  else lessonError=results[1].reason?.message||'تعذر تحميل المحاضرات';
  const cloud=normalizeCloud(d,t,l);
  const merged=new Map((local.lessons||[]).map(x=>[String(x.id),x]));
  cloud.lessons.forEach(x=>merged.set(String(x.id),{...merged.get(String(x.id)),...x}));
  DB={...local,...cloud,lessons:[...merged.values()]};
  dataSource='supabase';
  const [r,lr]=await Promise.all([
   optionalTable('references','select=*&order=publication_year.desc'),
   optionalTable('lesson_references','select=lesson_id,reference_id')
  ]);
  if(Array.isArray(r)){
   const refs=r.map(x=>({id:x.id,title:x.title,authors:x.authors,publication_year:x.publication_year,publisher:x.publisher,url:x.url,file_path:x.file_path,file_name:x.file_name,file_size:x.file_size,access_license:x.access_license,pdf_updated_at:x.pdf_updated_at}));
   DB.reference_catalog=refs;
   if(Array.isArray(lr)){
    const refsById=new Map(refs.map(x=>[String(x.id),x])),byLesson=new Map();
    lr.forEach(x=>{const ref=refsById.get(String(x.reference_id));if(ref){if(!byLesson.has(String(x.lesson_id)))byLesson.set(String(x.lesson_id),[]);byLesson.get(String(x.lesson_id)).push(ref)}});
    DB.lessons.forEach(x=>{if(byLesson.has(String(x.id)))x.reference_titles=byLesson.get(String(x.id))});
   }
  }
  try{localStorage.setItem('alhakim_content_cache',JSON.stringify(DB))}catch(e){console.warn('Could not save curriculum cache:',e)}
 }catch(e){
  cloudError=e.message||String(e);
  console.error('Cloud departments load failed; using saved local curriculum:',cloudError);
 }
 renderHome();connection();
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
function departmentName(code){return DB.departments.find(d=>d.code===code)?.name_en||code||'General'}
function homeButton(){return `<button class="home-return" onclick="renderHome()" aria-label="العودة للواجهة الرئيسية">⌂ <span>العودة للواجهة الرئيسية</span></button>`}
function pageShell(title,desc,body){main.innerHTML=`${homeButton()}<div class="section-heading"><div><span class="eyebrow">ALHAKIM OPTICS ACADEMY</span><h2>${esc(title)}</h2><p>${esc(desc||'')}</p></div></div>${body}`;window.scrollTo({top:0,behavior:'smooth'})}
async function loadHomepageSettings(){
 try{const rows=await rest('academy_homepage_settings','select=settings&id=eq.1');if(rows?.[0]?.settings)HOME_SETTINGS={...HOME_DEFAULTS,...rows[0].settings}}
 catch(e){console.info('Homepage settings unavailable; using defaults:',e.message)}
 try{HOME_COURSES=await rest('courses','select=id,title_en,title_ar,description_en,price,currency,is_published&is_published=eq.true&order=created_at.desc')}catch(e){HOME_COURSES=[]}
}
function homeImage(url,alt,cls=''){return url?'<img class="'+cls+'" src="'+esc(url)+'" alt="'+esc(alt)+'" loading="lazy" onerror="this.style.display=\'none\'">':''}
function founderImage(url,name){return url?homeImage(url,name,'founder-photo'):'<div class="founder-photo founder-photo-placeholder" role="img" aria-label="صورة المؤسس غير مضافة بعد"><span>د. ل</span></div>'}
function renderHome(){
 document.body.classList.add('home-screen');
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));
 const s={...HOME_DEFAULTS,...HOME_SETTINGS};
 const headerLogo=document.querySelector('.topbar .brand img');if(headerLogo&&s.logo_url)headerLogo.src=s.logo_url;
 document.documentElement.style.setProperty('--home-bg',s.background_color||'#f3f6f7');
 document.documentElement.style.setProperty('--home-primary',s.primary_color||'#123c61');
 document.documentElement.style.setProperty('--home-accent',s.accent_color||'#d6b66c');
 const quick=(s.quick_links||HOME_DEFAULTS.quick_links).filter(x=>x.visible!==false).slice(0,4);
 main.innerHTML=`
 <div class="academy-home">
  <section class="home-top-search"><div class="home-search-title"><span>⌕</span><input id="globalSearch" placeholder="ابحث عن دورات، مصادر، أو طلب..." autocomplete="off"><button id="searchBtn" aria-label="بحث">⌕</button></div><div class="home-notices"><button aria-label="الإشعارات" title="الإشعارات">♧<i></i></button><button aria-label="حسابي" title="حسابي" onclick="showPage('accounts')">◉</button></div></section>
  <section class="home-identity-row">
   <div class="home-founder" ${s.show_founder===false?'hidden':''}>
    ${founderImage(s.founder_photo_url,s.founder_name)}
    <div><small>المؤسس: والعضو المنتدب</small><h2>${esc(s.founder_name)}</h2><p>${esc(s.founder_title)}</p></div>
   </div>
   <nav class="home-shortcuts">${quick.map((x,i)=>`<button onclick="showPage('${esc(x.page)}')"><span class="shortcut-number">${i+1}</span><span class="shortcut-icon">${esc(x.icon||'▣')}</span><b>${esc(x.label)}</b></button>`).join('')}</nav>
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
 window.scrollTo({top:0,behavior:'smooth'});
}
function deptCard(d,i){return `<article class="dept-card" onclick="showDepartment('${esc(d.code)}')"><div class="dept-num">DEPARTMENT ${String(i+1).padStart(2,'0')} · ${esc(d.code)}</div><h3>${esc(d.name_en)}</h3><p>${esc(d.name_ar)}</p><small>${(d.curriculum_topics||[]).length} موضوعاً في المنهج</small></article>`}
function showPage(page){document.body.classList.remove('home-screen');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));if(page==='home'){renderHome();return}
 if(page==='departments')pageShell('الأقسام العلمية','اختر قسماً لاستعراض موضوعاته ومحاضراته.',`<div class="department-grid">${DB.departments.map(deptCard).join('')}</div>`);
 if(page==='lessons')pageShell('المحاضرات','جميع المحاضرات المنشورة في الأقسام العلمية.',`<div class="content-card">${lessonList(DB.lessons,false)}</div>`);

 if(page==='clinical-cases'&&typeof renderClinicalCases==='function')renderClinicalCases();
 if(page==='permanent')pageShell('بنك الأسئلة','اختر المحاضرة لعرض أسئلتها المنشورة من قاعدة البيانات.',`<div class="notice">الأسئلة المعروضة هي الأسئلة المنشورة المرتبطة بكل محاضرة. الإجابة والتفسير يظهران بعد اختيارك.</div><div class="content-card">${lessonList(DB.lessons,true)}</div>`);
 if(page==='library')renderLibrary();if(page==='progress')renderProgress();if(page==='courses')renderCourses();if(page==='subscriptions')renderSubscriptions();if(page==='accounts')renderAccounts();if(page==='admin')renderAdmin();}
function lessonList(lessons,quizOnly=false){lessons=(lessons||[]).filter(canViewLesson);return `<div class="lesson-grid">${lessons.map(l=>`<article class="lesson-card" onclick="${quizOnly?`showQuiz('${esc(l.id)}')`:`showLesson('${esc(l.id)}')`}"><span class="tag">${esc(l.level||'Optometry')}</span><h3>${esc(l.title_en)}</h3><p>${esc(departmentName(l.department_code))}</p><small>${l.review_required?'مسودة للمراجعة العلمية':'منشور'}</small><span class="card-arrow">فتح المحاضرة ←</span></article>`).join('')||'<p>لا توجد محاضرات مسجلة حالياً.</p>'}</div>`}
async function showDepartment(code){
 const d=DB.departments.find(x=>x.code===code);if(!d)return;
 const topicOrder=new Map((d.curriculum_topics||[]).slice().sort((a,b)=>Number(a.display_order??0)-Number(b.display_order??0)).map((t,i)=>[String(t.id),i]));
 const ls=DB.lessons.filter(l=>l.department_code===code&&canViewLesson(l)&&String(l.status||'').toLowerCase()==='published').slice().sort((a,b)=>{
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
   <h3>بنك أسئلة المحاضرات</h3>
   ${lessonList(ls,true)}
   ${examPanel}
  </div>`);
}

function searchTopic(topic,code){const normalized=String(topic||'').trim().toLowerCase();const dept=DB.departments.find(d=>d.code===code);const item=(dept?.curriculum_topics||[]).find(t=>String(t.title_en||'').trim().toLowerCase()===normalized||String(t.code||'').trim().toLowerCase()===normalized);const found=DB.lessons.filter(l=>l.department_code===code&&((item&&String(l.topic_id)===String(item.id))||String(l.title_en||'').trim().toLowerCase()===normalized));if(found.length){showLesson(found[0].id);return}pageShell(topic,'موضوع ضمن خريطة المنهج العلمي.',`<div class="content-card"><div class="notice">هذا الموضوع موجود في المنهج، لكن لا توجد محاضرة مرتبطة به حالياً. لم نعد نبحث بالتشابه الجزئي في العناوين حتى لا نفتح محاضرة غير مطابقة.</div><p>القسم: ${esc(departmentName(code))}</p></div>`)}
function inlineFormat(text){return esc(text).replace(/!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)/g,'<img src="$2" alt="$1" loading="lazy" style="display:block;max-width:min(100%,760px);height:auto;margin:18px auto;border:1px solid #d5e1ea;border-radius:14px;cursor:zoom-in" onclick="this.style.transform=this.style.transform?\'\':\'scale(1.12)\';this.style.transformOrigin=\'center\'">').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\x60([^\x60]+)\x60/g,'<code>$1</code>');}
function renderLectureHtml(raw,rtl=false){
 const source=String(raw||'').replace(/\\n/g,'\n');
 const doc=new DOMParser().parseFromString(source,'text/html');
 const allowed=new Set(['H1','H2','H3','H4','P','UL','OL','LI','STRONG','B','EM','I','BR','HR','BLOCKQUOTE','TABLE','THEAD','TBODY','TR','TH','TD','SUB','SUP','CODE']);
 const renderNode=node=>{
  if(node.nodeType===Node.TEXT_NODE)return esc(node.nodeValue||'');
  if(node.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=node.tagName;
  const children=[...node.childNodes].map(renderNode).join('');
  if(!allowed.has(tag))return children;
  const textContent=node.textContent||'';
  const dir=(textContent.match(/[\u0600-\u06FF]/g)||[]).length>(textContent.match(/[A-Za-z]/g)||[]).length?'rtl':'ltr';
  const attrs=[' dir="'+dir+'"',' lang="'+(dir==='rtl'?'ar':'en')+'"'];
  if(tag==='H1'||tag==='H2')return '<h2 class="lecture-h2"'+attrs.join('')+'>'+children+'</h2>';
  if(tag==='H3')return '<h3 class="lecture-h3"'+attrs.join('')+'>'+children+'</h3>';
  if(tag==='H4')return '<h4'+attrs.join('')+'>'+children+'</h4>';
  if(tag==='BR'||tag==='HR')return '<'+tag.toLowerCase()+'>';
  return '<'+tag.toLowerCase()+(['P','LI','TH','TD','BLOCKQUOTE'].includes(tag)?attrs.join(''):'')+'>'+children+'</'+tag.toLowerCase()+'>';
 };
 return '<div class="lecture-body '+(rtl?'lecture-ar':'lecture-en')+'" dir="ltr" lang="en">'+[...doc.body.childNodes].map(renderNode).join('')+'</div>';
}
function renderLectureMarkdown(raw,rtl=false){
 const source=String(raw||'').trim();
 const hasMarkdownBlocks=/(^|\n)\s{0,3}#{1,4}\s|(^|\n)\s*[-*]\s/m.test(source);
 if(hasMarkdownBlocks&&/<(?:h[12]\b|hr\b)/i.test(source)){
  const normalized=source.replace(/<hr\s*\/?\s*>/gi,'\n---\n').replace(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]\s*>/gi,'\n## $1\n');
  return renderLectureMarkdown(normalized,rtl);
 }
 if(/<(?:h[1-6]|p|div|ul|ol|li|table|blockquote|br)(?:\s|>|\/)/i.test(source))return renderLectureHtml(source,rtl);
 const lines=source.replace(/\r/g,'').split('\n');let out='',list=null,table=[];
 const blockDir=text=>{const s=String(text||'').replace(/\\*\\*|__|\\*|_|\\`/g,'');const ar=(s.match(/[\\u0600-\\u06FF]/g)||[]).length;const en=(s.match(/[A-Za-z]/g)||[]).length;return ar>en?'rtl':'ltr'};
 const attrs=text=>{const d=blockDir(text);return ' dir="'+d+'" lang="'+(d==='rtl'?'ar':'en')+'" class="lecture-block-'+d+'"'};
 const closeList=()=>{if(list){out+=list==='ul'?'</ul>':'</ol>';list=null}};
 const flushTable=()=>{if(!table.length)return;out+='<div class="lecture-table-wrap"><table class="lecture-table">';table.forEach((row,i)=>{const cells=row.split('|').slice(1,-1).map(x=>x.trim());if(cells.every(x=>/^:?-{3,}:?$/.test(x)))return;out+=i===0?'<thead><tr>':'<tbody><tr>';cells.forEach(c=>out+=i===0?'<th'+attrs(c)+'>'+inlineFormat(c)+'</th>':'<td'+attrs(c)+'>'+inlineFormat(c)+'</td>');out+='</tr>'+(i===0?'</thead>':'')});out+='</tbody></table></div>';table=[]};
 for(const rawLine of lines){const line=rawLine.trim();if(!line){closeList();flushTable();continue}let m;
 if(line.startsWith('|')&&line.endsWith('|')){closeList();table.push(line);continue}else flushTable();
 if((m=line.match(/^(#{1,4})\s+(.+)$/))){closeList();const n=m[1].length;out+=n===1?'<h2 class="lecture-h2"'+attrs(m[2])+'>'+inlineFormat(m[2])+'</h2>':n===2?'<h3 class="lecture-h3"'+attrs(m[2])+'>'+inlineFormat(m[2])+'</h3>':'<h4'+attrs(m[2])+'>'+inlineFormat(m[2])+'</h4>';continue}
 if(/^---+$/.test(line)){closeList();out+='<hr>';continue}
 if((m=line.match(/^[-*]\s+(.+)$/))){if(list!=='ul'){closeList();out+='<ul>';list='ul'}out+='<li'+attrs(m[1])+'>'+inlineFormat(m[1])+'</li>';continue}
 if((m=line.match(/^\d+[.)]\s+(.+)$/))){if(list!=='ol'){closeList();out+='<ol>';list='ol'}out+='<li'+attrs(m[1])+'>'+inlineFormat(m[1])+'</li>';continue}
 if((m=line.match(/^>\s*(.+)$/))){closeList();out+='<blockquote'+attrs(m[1])+'>'+inlineFormat(m[1])+'</blockquote>';continue}
 closeList();out+='<p'+attrs(line)+'>'+inlineFormat(line)+'</p>';}
 closeList();flushTable();return '<div class="lecture-body '+(rtl?'lecture-ar':'lecture-en')+'" dir="ltr" lang="en">'+out+'</div>';
}
function buildIntegratedBilingualMarkdown(contentEn,contentAr){
 const en=String(contentEn||'').trim(),ar=String(contentAr||'').trim();
 if(!en)return en||'لم يضف المحتوى العلمي بعد.';
 // Legacy lessons sometimes place a complete Arabic explanation section at
 // the end. Reposition its numbered teaching sections immediately after the
 // corresponding English section, rather than rendering a detached Arabic block.
 const marker=/(?:^|\n)#{1,3}\s*(?:Arabic explanation|Arabic learning notes|الشرح العربي|الشرح باللغة العربية)[^\n]*\n/i;
 const match=marker.exec(en);
 if(match){
  const markerStart=match.index;
  const main=en.slice(0,markerStart).trim();
  const tail=en.slice(markerStart+match[0].length).trim();
  const arabicSections=[];
  const re=/(?:^|\n)##\s*(\d+)[.)]?\s*([^\n]*)\n/g;
  let m,starts=[];
  while((m=re.exec(tail))!==null)starts.push({index:m.index+(tail[m.index]==='\n'?1:0),number:Number(m[1]),title:m[2].trim(),end:re.lastIndex});
  for(let i=0;i<starts.length;i++){
   const x=starts[i],end=i+1<starts.length?starts[i+1].index:tail.length;
   const body=tail.slice(x.end,end).trim();
   if(body)arabicSections.push({number:x.number,body});
  }
  const lines=main.split('\n'),out=[];
  const headings=lines.map(line=>line.match(/^##\s+(\d+)[.)]?\s+(.+)$/)).filter(Boolean);
  const hasObjectives=!!headings.length&&/learning objectives|أهداف التعلم/i.test(headings[0][2]);
  let sectionNumber=null,sectionLines=[];
  const flushSection=()=>{
   if(sectionLines.length)out.push(sectionLines.join('\n'));
   if(sectionNumber!==null){
    const arabicNumber=hasObjectives?sectionNumber-1:sectionNumber;
    const note=arabicSections.find(x=>x.number===arabicNumber);
    if(note&&arabicNumber>0)out.push('**توضيح وشرح:**\n'+note.body);
   }
   sectionLines=[];
  };
  for(const line of lines){
   const h=line.match(/^##\s+(\d+)[.)]?\s+(.+)$/);
   if(h&&sectionLines.length){flushSection();sectionNumber=Number(h[1]);sectionLines=[line];}
   else{
    if(h)sectionNumber=Number(h[1]);
    sectionLines.push(line);
   }
  }
  flushSection();  return out.join('\n\n').trim();
 }
 // content_ar remains a separate source for language-specific audio; it is
 // deliberately not appended to the visible lecture as a detached translation.
 return en;
}
function buildLectureSlides(html){
 const doc=new DOMParser().parseFromString(html,'text/html');
 // renderLectureMarkdown wraps all lesson blocks in one .lecture-body element.
 // Split its children, not the wrapper itself, otherwise every lecture becomes one slide.
 const body=doc.querySelector('.lecture-body');
 const nodes=body?[...body.children]:[...doc.body.children],slides=[];
 const target=3000,hardLimit=4300;
 let page=[],size=0;
 const weightOf=node=>Math.max(45,(node.textContent||'').trim().length);
 const isHeading=node=>node.matches('h2.lecture-h2,h3.lecture-h3,h4');
 const emit=()=>{if(page.length){slides.push(page);page=[];size=0}};
 nodes.forEach((node,index)=>{
  const heading=isHeading(node),weight=weightOf(node);
  if(heading&&page.length&&size>target)emit();
  if(!heading&&page.length&&size+weight>target)emit();
  if(page.length&&size+weight>hardLimit)emit();
  page.push(node.outerHTML);size+=weight;
  if(isHeading(node)&&size>target&&nodes[index+1]&&isHeading(nodes[index+1]))emit();
 });
 emit();
 return slides.length?slides:[['<p>Lecture content is not available.</p>']];
}
function renderLectureDeck(slides){
 const pages=slides.map((s,i)=>'<section class="lecture-slide'+(i===0?' active':'')+'" data-slide="'+i+'" aria-hidden="'+(i!==0)+'"><div class="slide-content">'+s.join('')+'</div></section>').join('');
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
function referenceUrl(ref){if(typeof ref==='object'&&ref){if(ref.file_path)return SUPABASE_URL+'/storage/v1/object/public/academy-references/'+String(ref.file_path).split('/').map(encodeURIComponent).join('/');return first(ref,['url','doi','link','href'])}return ''}
function refLabel(ref){return typeof ref==='object'?first(ref,['title','name','citation'],'مرجع علمي'):String(ref)}
function isDirectReferencePdf(url){return /^https?:\/\//i.test(url||'')&&(/\.pdf(?:[?#].*)?$/i.test(url)||/\/storage\/v1\/object\/(?:public|sign)\//i.test(url))}
function referenceLink(ref){const id=esc(ref?.id||'');return `<div class="reference-actions"><button class="secondary" type="button" onclick="openAcademyReference('${id}')">فتح المرجع</button><button class="primary" type="button" onclick="downloadAcademyReference('${id}')">تحميل PDF</button></div>`}
function findAcademyReference(id){return (DB.reference_catalog||[]).find(x=>String(x.id)===String(id))}
function openAcademyReference(id){
 const ref=findAcademyReference(id);if(!ref)return;
 const url=referenceUrl(ref),pdf=isDirectReferencePdf(url),source=String(url||'').startsWith('http://')||String(url||'').startsWith('https://');
 const details='<div class="reference-meta"><p><b>Authors:</b> '+esc(ref.authors||'Not specified')+'</p><p><b>Year:</b> '+esc(ref.publication_year||'Not specified')+'</p><p><b>Publisher:</b> '+esc(ref.publisher||'Not specified')+'</p></div>';
 let content='';
 if(pdf){
  const viewerUrl=url+(url.includes('#')?'&':'#')+'toolbar=1&navpanes=0&view=FitH';
  content='<div class="reference-reader-wrap"><div class="reference-reader-heading"><b>قارئ PDF داخل الأكاديمية</b><span>إذا لم يظهر الملف على هاتفك، استخدم زر فتح الملف في نافذة مستقلة.</span></div><iframe class="reference-viewer" src="'+esc(viewerUrl)+'" title="'+esc(refLabel(ref))+'" loading="eager" allow="fullscreen"></iframe><div class="admin-actions"><a class="primary reference-source" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">فتح ملف PDF مباشرة ↗</a><button class="secondary" type="button" onclick="downloadAcademyReference(\''+esc(id)+'\')">تحميل PDF</button></div></div>';
 }else if(source){
  content='<div class="reference-reader-wrap"><div class="reference-reader-heading"><b>معاينة المرجع من موقع الناشر</b><span>تظهر المعاينة هنا إذا كان الناشر يسمح بالعرض داخل المواقع الأخرى.</span></div><iframe class="reference-viewer publisher-reference-viewer" src="'+esc(url)+'" title="'+esc(refLabel(ref))+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="notice">إذا لم تظهر صفحة الناشر داخل الإطار، فهذا بسبب قيود العرض التي يفرضها الموقع. لا تتوفر في سجل الأكاديمية حالياً نسخة PDF مباشرة لهذا المرجع، ولا يمكن تحويل صفحة الناشر إلى كتاب PDF أو تجاوز قيود الوصول.</div><p><a class="primary reference-source" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">فتح صفحة الناشر الرسمية ↗</a></p></div>';
 }else{content='<div class="notice">لا يوجد ملف PDF أو رابط ناشر مسجل لهذا المرجع حالياً.</div>'}
 pageShell(refLabel(ref),'فتح المرجع داخل أكاديمية الحكيم','<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderLibrary()">العودة إلى المراجع</button>'+(pdf?'<button class="primary" onclick="downloadAcademyReference(\''+esc(id)+'\')">تحميل PDF</button>':'')+'</div>'+details+content+'</div>');
}
async function downloadAcademyReference(id){const ref=findAcademyReference(id);if(!ref)return;const url=referenceUrl(ref);if(!isDirectReferencePdf(url)){alert('لا يوجد ملف PDF مباشر لهذا المرجع حالياً. الرابط المتوفر صفحة الناشر أو أن المرجع لا يحتوي على رابط. أضف ملف PDF مرخصاً/مفتوح الوصول إلى مكتبة الأكاديمية ليصبح التحميل مباشراً.');return}try{const response=await fetch(url);if(!response.ok)throw Error('تعذر تنزيل الملف.');const blob=await response.blob();if(!blob.size||(!blob.type.includes('pdf')&&!/\.pdf(?:[?#].*)?$/i.test(url)))throw Error('الرابط لا يعيد ملف PDF.');const objectUrl=URL.createObjectURL(blob);const link=document.createElement('a');link.href=objectUrl;link.download=(refLabel(ref).replace(/[\\/:*?"<>|]/g,'_').slice(0,90)||'reference')+'.pdf';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),60000)}catch(e){alert('تعذر التحميل المباشر من المصدر. قد يمنع المصدر التنزيل من داخل الأكاديمية؛ ارفع نسخة PDF مرخصة إلى مكتبة الأكاديمية لضمان التحميل.')}} 
function renderLibrary(){const refs=DB.reference_catalog||[];return pageShell('المراجع العلمية','المراجع التي تحتوي على ملف PDF فعلي يمكن فتحها داخل الأكاديمية وتحميلها مباشرة.',`<div class="reference-grid">${refs.map(r=>`<article class="reference-card"><h3>${esc(refLabel(r))}</h3><p>${esc(first(r,['authors'],'') )} · ${esc(first(r,['publication_year'],'') )} · ${esc(first(r,['publisher'],'') )}</p><small class="tag">${r.file_path?'PDF متاح داخل الأكاديمية':'بيانات مرجع — PDF غير مرفق'}</small>${referenceLink(r)}</article>`).join('')||'<div class="notice">لا توجد مراجع مضافة بعد.</div>'}</div>`)}

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
 const item=specific[String(l?.id||'')]||map[String(l?.department_code||'').toUpperCase()];
 if(!item)return '';
 return '<figure class="lecture-illustration" style="margin:24px auto;max-width:900px;text-align:center"><img src="'+item[0]+'" alt="'+esc(item[1])+'" loading="lazy" style="display:block;width:100%;height:auto;max-height:520px;object-fit:contain;border:1px solid #d5e1ea;border-radius:16px;background:#f7fafc" onerror="this.closest(\'figure\').hidden=true"><figcaption style="margin-top:8px;color:var(--muted,#587080);font-size:.92rem">'+esc(item[1])+' · HAKIM OPTICS ACADEMY</figcaption></figure>';
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
 return '<section class="focused-device-gallery" style="margin:24px 0"><h2>Clinical Instruments and Assessment — الأجهزة ووسائل الفحص</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px">'+rows.map(x=>'<figure style="margin:0;padding:10px;border:1px solid #d5e1ea;border-radius:14px;background:#fff"><img loading="lazy" src="./assets/'+x[0].replace(/^\.\.\//,'')+'" alt="'+esc(x[1])+'" style="width:100%;height:auto;display:block" onerror="this.closest(\'figure\').hidden=true"><figcaption style="text-align:center;font-weight:600;margin-top:6px">'+esc(x[1])+'</figcaption></figure>').join('')+'</div></section>';
}
function clinicalDeviceGallery(){
 const items=[
  ['slit-lamp.svg','Slit-lamp biomicroscope'],['retinoscope.svg','Streak retinoscope'],['autorefractor.svg','Autorefractor'],['phoropter.svg','Phoropter'],['keratometer.svg','Keratometer'],['corneal-topographer.svg','Corneal topographer'],['lensmeter.svg','Lensmeter / focimeter'],['direct-ophthalmoscope.svg','Direct ophthalmoscope'],['tonometer.svg','Applanation tonometer'],['oct.svg','Optical coherence tomography'],['visual-field-analyser.svg','Automated perimeter'],['trial-frame.svg','Trial frame and lens set']
 ];
 return '<section class="clinical-device-gallery"><h2>Clinical Instruments — الأجهزة السريرية</h2><p>Original educational schematics. Instrument design and controls vary by manufacturer.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">'+items.map(x=>'<figure style="margin:0;padding:10px;border:1px solid #d5e1ea;border-radius:14px;background:#fff"><img loading="lazy" src="./assets/clinical-optometry/'+x[0]+'" alt="'+esc(x[1])+'" style="width:100%;height:auto;display:block" onerror="this.closest(\'figure\').hidden=true"><figcaption style="text-align:center;font-weight:600;margin-top:6px">'+esc(x[1])+'</figcaption></figure>').join('')+'</div></section>';
}
function renderLectureContentWithIllustration(l){
 const raw=buildIntegratedBilingualMarkdown(l.content_en,l.content_ar);
 const html=renderLectureMarkdown(raw);
 const figure=lectureIllustration(l);
 if(!figure)return html;
 // Insert the trusted, lesson-mapped figure after the first teaching paragraph.
 // Work on the already-rendered DOM so headings, bilingual blocks, lists and
 // HTML-based lessons are never split or reparsed as independent fragments.
 const parser=new DOMParser();
 const doc=parser.parseFromString(html,'text/html');
 const body=doc.querySelector('.lecture-body');
 const figureDoc=parser.parseFromString(figure,'text/html');
 const figureNode=figureDoc.querySelector('figure');
 if(!body||!figureNode)return html;
 const firstParagraph=body.querySelector('p');
 if(firstParagraph)firstParagraph.after(figureNode);
 else{
  const firstHeading=body.querySelector('h2,h3,h4');
  if(firstHeading)firstHeading.after(figureNode);
  else body.prepend(figureNode);
 }
 return body.outerHTML;
}
async function showLesson(id){const l=DB.lessons.find(x=>String(x.id)===String(id));if(!l||!canViewLesson(l)){pageShell('المحاضرة غير متاحة','هذا المحتوى ما زال قيد المراجعة العلمية.','<div class="notice">المحاضرات غير المنشورة متاحة لفريق الإدارة فقط.</div>');return;}const objectives=Array.isArray(l.learning_objectives)?l.learning_objectives.join(' · '):l.learning_objectives;const refs=Array.isArray(l.reference_titles)?l.reference_titles:[];let completion='';if(session&&isUuid(l.id)&&l.status==='published'){let done=false;try{const rows=await rest('academy_lesson_completions',`select=lesson_id&user_id=eq.${encodeURIComponent(session.user.id)}&lesson_id=eq.${encodeURIComponent(l.id)}`);done=rows.length>0}catch(e){}completion=done?'<div class="notice">✓ تم تسجيل إكمال هذا الدرس في حسابك.</div>':`<button class="primary" onclick="completeLesson('${esc(l.id)}')">تم إكمال الدرس</button><p class="muted">اضغط بعد الانتهاء من دراسة محتوى الدرس لتسجيل إنجازه.</p>`}else if(!session){completion='<div class="notice">سجّل الدخول لتسجيل إكمال الدرس وحفظ تقدمك.</div>'}else{completion='<div class="notice">هذا المحتوى محلي أو غير منشور في قاعدة البيانات؛ لا يُحتسب ضمن شروط الشهادة حتى يُنشر كسجل درس في قاعدة الأكاديمية.</div>'}const lectureHtml=renderLectureContentWithIllustration(l);
 const slides=buildLectureSlides(lectureHtml);
 pageShell(l.title_en,departmentName(l.department_code),'<button class="home-return lecture-back" onclick="showDepartment(\''+esc(l.department_code)+'\')" aria-label="العودة إلى القسم">← <span>العودة إلى القسم</span></button><article class="lesson-detail lecture-fullscreen"><header class="lecture-cover"><div class="eyebrow">HAKIM OPTICS ACADEMY · LECTURE</div><h1>'+esc(l.title_en)+'</h1><h2>'+esc(l.title_ar||'')+'</h2><p><b>Department:</b> '+esc(departmentName(l.department_code))+' · <b>Level:</b> '+esc(l.level||'Undergraduate Optometry')+'</p></header><section class="lecture-objectives"><h2>LEARNING OBJECTIVES – أهداف المحاضرة</h2>'+(Array.isArray(l.learning_objectives)?'<ul>'+l.learning_objectives.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+esc(objectives)+'</p>')+'</section>'+(l.id==='CO-EXAM-001'?clinicalDeviceGallery():focusedDeviceGallery(l))+lectureAudioPanel('en',l.content_en)+lectureAudioPanel('ar',l.content_ar)+'<div class="lecture-audio-note">تشغيل، إيقاف مؤقت، متابعة، إيقاف، تنقل جملة إلى الأمام أو الخلف، والتحكم في سرعة القراءة.</div>'+renderLectureDeck(slides)+'<section class="lecture-after"><h3>Self-assessment</h3><button class="primary" onclick="showQuiz(\''+esc(l.id)+'\')">ابدأ أسئلة المحاضرة</button><h3>تسجيل إكمال الدرس</h3>'+completion+'<h3>Suggested References</h3><div class="reference-list">'+(refs.map(referenceLink).join('')||'<p>لم تُربط مراجع مباشرة بهذه المحاضرة بعد.</p>')+'</div></section></article>');
 window.currentLectureAudio={en:lectureAudioText(l.content_en),ar:lectureAudioText(l.content_ar)};initLectureDeck();initLectureAudio();}
const OFFLINE_COMPLETION_KEY='alhakim_offline_lesson_completions_v1';
function getOfflineCompletions(){try{return JSON.parse(localStorage.getItem(OFFLINE_COMPLETION_KEY)||'[]')}catch(_){return []}}
function saveOfflineCompletion(id){const rows=getOfflineCompletions();if(!rows.some(x=>String(x.lesson_id)===String(id)))rows.push({lesson_id:String(id),queued_at:new Date().toISOString()});localStorage.setItem(OFFLINE_COMPLETION_KEY,JSON.stringify(rows))}
async function syncOfflineCompletions(){if(!navigator.onLine||!session?.access_token)return;const rows=getOfflineCompletions();if(!rows.length)return;const remaining=[];for(const item of rows){try{await rpc('academy_mark_lesson_complete',{p_lesson_id:item.lesson_id})}catch(e){remaining.push(item)}}localStorage.setItem(OFFLINE_COMPLETION_KEY,JSON.stringify(remaining));if(rows.length!==remaining.length)connection()}
async function completeLesson(id){if(!session){alert('سجّل الدخول أولاً.');return}if(!navigator.onLine){saveOfflineCompletion(id);alert('تم حفظ إكمال الدرس على هذا الجهاز. ستتم مزامنته تلقائياً عند عودة الإنترنت.');const l=DB.lessons.find(x=>x.id===id);if(l)showDepartment(l.department_code);return}try{const r=await rpc('academy_mark_lesson_complete',{p_lesson_id:id});alert(r.message||'تم تسجيل إكمال الدرس');const l=DB.lessons.find(x=>x.id===id);if(l)showDepartment(l.department_code)}catch(e){if(e instanceof TypeError||!navigator.onLine){saveOfflineCompletion(id);alert('تعذر الاتصال بالخادم؛ حُفظ إكمال الدرس محلياً وسيتم إرساله عند عودة الإنترنت.')}else alert(e.message)}}
async function startDepartmentExam(code){try{const isFinal=['REF','BV'].includes(code);const exam=isFinal?await rpc('academy_start_final_exam',{p_department_code:code}):await rpc('academy_start_exam',{p_department_code:code,p_question_count:20});renderDepartmentExam(exam)}catch(e){alert(e.message)}}
function renderDepartmentExam(exam){const questions=exam.questions||[];window.activeAcademyExam=exam;pageShell(exam.exam_title_en||('الامتحان الشامل · '+exam.department_code),exam.exam_title_ar||(`عدد الأسئلة: ${exam.total_questions} · درجة النجاح: ${exam.pass_mark}%`), `<form id="departmentExamForm" class="content-card">${questions.map((q,i)=>{const opts=Array.isArray(q.options)?q.options:[];return `<section class="question exam-question"><b>${i+1}. ${esc(q.question)}</b>${opts.map((o,j)=>{const val=typeof o==='object'?String(o.value??o.id??o.label??j):String(o);const label=typeof o==='object'?String(o.label??o.text??val):String(o);return `<label class="exam-option"><input type="radio" name="q_${esc(q.id)}" value="${esc(val)}" required><span>${esc(label)}</span></label>`}).join('')}</section>`}).join('')}<button class="primary" type="submit">تسليم الامتحان وتصحيح الإجابات</button><button class="secondary" type="button" onclick="showDepartment('${esc(exam.department_code)}')">إلغاء والعودة للقسم</button><p id="examMessage" class="form-message"></p></form>`);document.getElementById('departmentExamForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,answers={};questions.forEach(q=>{const selected=form.querySelector(`input[name="q_${CSS.escape(q.id)}"]:checked`);if(selected)answers[q.id]=selected.value});const msg=document.getElementById('examMessage');msg.textContent='جارٍ التصحيح…';try{const result=await rpc('academy_submit_exam',{p_attempt_id:exam.attempt_id,p_answers:answers});renderExamResult(result,exam.department_code)}catch(err){msg.textContent=err.message}}}
function renderExamResult(result,code){const passed=!!result.passed;const cert=result.certificate_number;let certificate='';if(passed&&result.verification_token){const verifyUrl=`${location.origin}${location.pathname}?verify=${encodeURIComponent(result.verification_token)}`;certificate=`<section class="certificate-preview" id="certificate"><div class="certificate-inner"><span class="eyebrow">ALHAKIM OPTICS ACADEMY</span><h2>Certificate of Department Completion</h2><h3>شهادة إتمام قسم علمي</h3><p>تشهد أكاديمية الحكيم للبصريات بأن</p><h2>${esc(session?.user?.user_metadata?.full_name||session?.user?.user_metadata?.name||'الطالب')}</h2><p>قد أتم متطلبات القسم العلمي</p><h2>${esc(code)}</h2><p>بنتيجة ${esc(result.score)}%</p><p>رقم الشهادة: ${esc(cert)}</p><p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar')}</p><img class="certificate-qr" alt="QR verification" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}"><p class="certificate-note">امسح الرمز للتحقق من صحة الشهادة. هذه شهادة إتمام تعليمية صادرة عن الأكاديمية وليست مؤهلاً جامعياً أو ترخيصاً مهنياً.</p></div></section><button class="primary" onclick="window.print()">طباعة / حفظ الشهادة PDF</button><p><a href="${esc(verifyUrl)}" target="_blank" rel="noopener">صفحة التحقق من الشهادة</a></p>`}pageShell('نتيجة الامتحان',passed?'تهانينا، اجتزت الامتحان الشامل.':'لم تحقق درجة النجاح المطلوبة؛ يمكنك إعادة المحاولة.',`<div class="content-card"><h2>${passed?'ناجح ✓':'لم تنجح بعد'}</h2><p>النتيجة: <b>${esc(result.score)}%</b></p><p>الإجابات الصحيحة: ${esc(result.correct_answers)} من ${esc(result.total_questions)}</p><p>درجة النجاح: 70%</p>${certificate}<button class="secondary" onclick="showDepartment('${esc(code)}')">العودة إلى القسم</button></div>`)}
async function verifyCertificate(token){try{const result=await fetch(`${SUPABASE_URL}/rest/v1/rpc/academy_verify_certificate`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify({p_token:token})}).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.message||'تعذر التحقق');return b});pageShell('التحقق من الشهادة','التحقق الإلكتروني من شهادة أكاديمية الحكيم.',`<div class="content-card"><h2>${result.found?(result.valid?'شهادة صحيحة ومعتمدة ✓':'الشهادة ملغاة'):'لم يتم العثور على الشهادة'}</h2>${result.found?`<p>الاسم: ${esc(result.student_name)}</p><p>القسم: ${esc(result.department_code)}</p><p>النتيجة: ${esc(result.score)}%</p><p>رقم الشهادة: ${esc(result.certificate_number)}</p><p>تاريخ الإصدار: ${esc(new Date(result.issued_at).toLocaleDateString())}</p>`:''}</div>`)}catch(e){pageShell('التحقق من الشهادة','تعذر التحقق.',`<div class="notice">${esc(e.message)}</div>`)}}
async function showQuiz(id){
 const l=DB.lessons.find(x=>String(x.id)===String(id));if(!l)return;
 pageShell('بنك أسئلة: '+l.title_en,'جارٍ تحميل الأسئلة المنشورة من قاعدة البيانات…','<div class="notice">يتم تحميل الأسئلة والخيارات الآن.</div>');
 try{
  const qs=await publicRpc('academy_get_lesson_questions',{p_lesson_id:id});
  pageShell('بنك أسئلة: '+l.title_en,`عدد الأسئلة المنشورة: ${qs.length}`,`
   <div class="content-card">
    ${qs.map((q,i)=>`<section class="question practice-question" id="practice-${q.id}">
      <b>${i+1}. ${esc(q.question)}</b>
      <div class="practice-options">${(q.options||[]).map(o=>`<button type="button" class="option" data-option-id="${esc(o.id)}" onclick="checkLessonAnswer('${esc(q.id)}','${esc(o.id)}',this)">${esc(o.text)}</button>`).join('')}</div>
      <div class="explanation" hidden></div>
     </section>`).join('')||'<div class="notice">لا توجد أسئلة منشورة لهذه المحاضرة حتى الآن.</div>'}
    <button class="secondary" onclick="showLesson('${esc(id)}')">العودة إلى المحاضرة</button>
   </div>`);
 }catch(e){pageShell('تعذر تحميل بنك الأسئلة',l.title_en,`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="showDepartment('${esc(l.department_code)}')">العودة للقسم</button>`)}
}
async function checkLessonAnswer(questionId,optionId,button){
 const box=button.closest('.practice-question');if(!box||box.dataset.answered==='1')return;
 box.dataset.answered='1';const buttons=[...box.querySelectorAll('.option')];buttons.forEach(b=>b.disabled=true);
 try{
  const result=await publicRpc('academy_check_lesson_answer',{p_question_id:questionId,p_option_id:optionId});
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
 pageShell('الحسابات','سجّل الدخول أو أنشئ حساب طالب جديداً من داخل الأكاديمية.',user?`<div class="content-card"><h3>الحساب الحالي</h3><p>${esc(user.email)}</p><p>الدور: ${isAdmin()?'مدير الأكاديمية':'طالب'}</p><label>الاسم الكامل كما سيظهر في الشهادة<input id="studentFullName" value="${esc(user.user_metadata?.full_name||user.user_metadata?.name||'')}" placeholder="اكتب الاسم الكامل"></label><button class="primary" onclick="saveStudentName()">حفظ الاسم</button><button class="secondary" onclick="signOut()">تسجيل الخروج</button><p id="profileMsg" class="form-message"></p></div>`:formMarkup);
 const lf=document.getElementById('loginForm'),sf=document.getElementById('signupForm');
 const loginTab=document.getElementById('showLoginTab'),signupTab=document.getElementById('showSignupTab');
 if(loginTab&&signupTab){loginTab.onclick=()=>{lf.hidden=false;sf.hidden=true};signupTab.onclick=()=>{lf.hidden=true;sf.hidden=false}}
 if(lf)lf.onsubmit=async e=>{e.preventDefault();const m=document.getElementById('authMessage');m.textContent='جارٍ التحقق من الحساب…';try{await signIn(document.getElementById('loginEmail').value,document.getElementById('loginPassword').value);renderAccounts();renderHome();syncAdminNavigation()}catch(err){m.textContent=err.message}};
 if(sf)sf.onsubmit=async e=>{e.preventDefault();const m=document.getElementById('signupMessage');m.textContent='جارٍ إنشاء الحساب…';try{m.textContent=await signUpStudent(document.getElementById('signupName').value,document.getElementById('signupEmail').value,document.getElementById('signupPassword').value);if(session){renderAccounts();renderHome();syncAdminNavigation()}}catch(err){m.textContent=err.message}};
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
  <button class="quick-card" onclick="adminReferences()"><b>إدارة ملفات المراجع PDF</b><small>رفع ملفات PDF المرخّصة وربطها بالمراجع الموجودة.</small></button>
  <button class="quick-card" onclick="adminHomepageSettings()"><b>إدارة الواجهة الرئيسية</b><small>الشعار، الصور، بيانات المؤسس، النصوص، الألوان والاختصارات.</small></button>
  <button class="quick-card" onclick="adminCourses()"><b>إدارة الدورات</b><small>عرض الدورات المنشورة ومراجعة بياناتها.</small></button>
  <button class="quick-card" onclick="adminSubscriptions()"><b>إدارة الاشتراكات</b><small>متابعة اشتراكات الطلاب وحالاتها.</small></button><button class="quick-card" onclick="adminPaymentMethods()"><b>إعدادات وسائل الدفع</b><small>إضافة وتعديل وإيقاف وسائل الدفع وحساباتها.</small></button>
  <button class="quick-card" onclick="adminAccounts()"><b>إدارة الحسابات</b><small>عرض حسابات الطلاب المسجلة في الأكاديمية.</small></button>
  <button class="quick-card" onclick="adminInstructors()"><b>إدارة المحاضرين</b><small>عرض حسابات المحاضرين المسجلين وصلاحياتهم التعليمية.</small></button>
  <button class="quick-card" onclick="adminCertificates()"><b>إدارة الشهادات</b><small>عرض الشهادات الصادرة وإلغاء الشهادة عند الحاجة.</small></button>
  <button class="quick-card" onclick="adminQuestionForm()"><b>بنك الأسئلة</b><small>إضافة سؤال امتحان موثق إلى القسم العلمي.</small></button>
  <button class="quick-card" onclick="adminAttempts()"><b>نتائج الامتحانات</b><small>متابعة محاولات الطلاب ونتائجهم.</small></button>
 </div>
 <div class="stats"><div class="stat"><b>${stats.questions}</b><small>سؤالاً في البنك</small></div><div class="stat"><b>${stats.attempts}</b><small>محاولة امتحان</small></div><div class="stat"><b>${stats.certificates}</b><small>شهادة صادرة</small></div></div>
 <div class="notice">تظل الدروس والموضوعات الأساسية متاحة مجاناً. إدارة الاشتراكات تخص الدورات والشهادات فقط.</div>`);
}
async function adminReferences(){
 if(!adminGuard())return;
 try{
  const refs=await rest('references','select=*&order=publication_year.desc');
  pageShell('إدارة ملفات المراجع PDF','ارفع نسخة PDF تملك الأكاديمية حق توزيعها أو نسخة مفتوحة الوصول. الملف سيصبح متاحاً للفتح والتحميل داخل الأكاديمية.',`<div class="content-card"><div class="admin-actions"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button></div><div class="notice">ارفع ملفات PDF المرخّصة أو مفتوحة الوصول فقط. الحد الأقصى 50 ميجابايت لكل ملف. لا ترفع نسخاً غير مصرح بتوزيعها.</div><div class="reference-grid">${refs.map(r=>`<article class="reference-card"><h3>${esc(r.title)}</h3><p>${esc(r.authors||'')} · ${esc(r.publication_year||'')} · ${esc(r.publisher||'')}</p><p>${r.file_path?'<span class="tag">PDF مرفق: '+esc(r.file_name||'ملف PDF')+'</span>':'<span class="tag">لا يوجد PDF مرفق</span>'}</p><label>ملف PDF<input type="file" accept="application/pdf,.pdf" id="refpdf_${esc(r.id)}"></label><label>مصدر/ترخيص الإتاحة<input type="text" id="reflicense_${esc(r.id)}" value="${esc(r.access_license||'')}" placeholder="Open access / Publisher permission"></label><button class="primary" type="button" onclick="uploadReferencePdf('${esc(r.id)}')">رفع وربط ملف PDF</button></article>`).join('')||'<p>لا توجد مراجع في قاعدة البيانات.</p>'}</div></div>`);
 }catch(e){pageShell('إدارة ملفات المراجع PDF','تعذر تحميل قائمة المراجع.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">رجوع</button>`)}
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
  return {...HOME_DEFAULTS,logo_url:document.getElementById('hs_logo').value.trim(),founder_photo_url:document.getElementById('hs_founder_photo').value.trim(),founder_name:document.getElementById('hs_founder_name').value.trim(),founder_title:document.getElementById('hs_founder_title').value.trim(),welcome_title:document.getElementById('hs_welcome_title').value.trim(),welcome_subtitle:document.getElementById('hs_welcome_subtitle').value.trim(),hero_image_url:document.getElementById('hs_hero_image').value.trim(),academy_card_image_url:document.getElementById('hs_academy_image').value.trim(),background_color:document.getElementById('hs_bg').value,primary_color:document.getElementById('hs_primary').value,accent_color:document.getElementById('hs_accent').value,show_founder:document.getElementById('hs_show_founder').checked,show_articles:document.getElementById('hs_show_articles').checked,show_courses:document.getElementById('hs_show_courses').checked,show_academy_card:document.getElementById('hs_show_academy').checked,featured_course_ids:featured,articles,quick_links:links};
 };
 document.getElementById('hs_preview').onclick=()=>{try{HOME_SETTINGS=read();renderHome()}catch(e){document.getElementById('hs_message').textContent=e.message}};
 document.getElementById('hs_reset').onclick=()=>{if(!confirm('استعادة التصميم الافتراضي؟ لن يتم الحفظ إلا بعد الضغط على حفظ ونشر.'))return;HOME_SETTINGS={...HOME_DEFAULTS};adminHomepageSettings(true)};
 form.onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('hs_message');msg.textContent='جارٍ حفظ الإعدادات…';try{const settings=read();const r=await fetch(`${SUPABASE_URL}/rest/v1/academy_homepage_settings`,{method:'POST',headers:{...authHeaders(),Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({id:1,settings,updated_by:session.user.id,updated_at:new Date().toISOString()})});const body=await r.json().catch(()=>[]);if(!r.ok)throw Error(body.message||body.details||'تعذر حفظ الإعدادات');HOME_SETTINGS=settings;msg.textContent='تم حفظ ونشر إعدادات الواجهة بنجاح. ستظهر التغييرات لجميع الزوار.';}catch(err){msg.textContent=err.message}};
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
setupPWAInstall();syncAdminNavigation();document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='admin'&&!isAdmin())return;showPage(b.dataset.page)}));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.go)));document.getElementById('homeLink').onclick=e=>{e.preventDefault();renderHome()};document.getElementById('accountBtn').onclick=()=>showPage('accounts');const hs=document.getElementById('headerSearch'),hsb=document.getElementById('headerSearchBtn');if(hsb)hsb.onclick=()=>search(hs?.value||'','headerSearchResults');if(hs){hs.addEventListener('input',()=>search(hs.value,'headerSearchResults'));hs.addEventListener('keydown',e=>{if(e.key==='Enter')search(hs.value,'headerSearchResults')})}window.addEventListener('online',()=>{connection();syncOfflineCompletions()});window.addEventListener('offline',connection);
const overlay=document.getElementById('welcomeOverlay');if(overlay){if(sessionStorage.getItem('alhakim_welcomed'))overlay.classList.add('hidden');const close=()=>{overlay.classList.add('hidden');sessionStorage.setItem('alhakim_welcomed','1')};document.getElementById('welcomeStart').onclick=close;document.getElementById('welcomeClose').onclick=close}
loadContent().then(async()=>{await loadHomepageSettings();renderHome();await loadProfile();await syncOfflineCompletions();const token=new URLSearchParams(location.search).get('verify');if(token)await verifyCertificate(token)}).catch(e=>{main.innerHTML=`<div class="content-card"><h2>تعذر تحميل المحتوى</h2><p>${esc(e.message)}</p></div>`;console.error(e)});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));


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
