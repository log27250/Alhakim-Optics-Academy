/* HAKIM OPTICS ACADEMY v2.1 — public browser key only; never add service_role here. */
const SUPABASE_URL='https://upmluemrhkadcffcsuzt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_k0VCQgULXGy_qnjvfyQKkjg_M9x43HVc';
const SUPABASE_ANON_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbWx1ZW1yaGthZGNmZmNzdXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5MTMzNDIsImV4cCI6MjEwOTQ4OTM0Mn0.TjDwjDgRVqTyXyFM_TSAsJMyEMcra7N7F71cVi4z4MU';
const CONTENT_URL='./content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json';
let DB=null,dataSource='local',session=null,profile=null;
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
async function rest(table,query='select=*'){const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`,{headers:authHeaders()});if(!r.ok){const body=await r.json().catch(()=>({}));throw Error(`${table}: ${r.status} ${body.message||body.msg||body.error_description||body.error||''}`.trim())}return r.json()}
async function optionalTable(table,query='select=*'){try{return await rest(table,query)}catch(e){console.info('Optional table unavailable:',table,e.message);return null}}
function normalizeCloud(depts,topics,lessons){
 const topicById=new Map(topics.map(t=>[String(t.id),t]));
 const topicMap=new Map();
 for(const t of topics){const k=String(t.department_id||'');if(!topicMap.has(k))topicMap.set(k,[]);topicMap.get(k).push({id:String(t.id),code:t.code,title_en:String(first(t,['title_en','title_ar','code'],'Topic')),title_ar:String(first(t,['title_ar'],'')),description_en:String(t.description_en||''),description_ar:String(t.description_ar||''),is_published:t.is_published!==false})}
 const deptById=new Map(depts.map(d=>[String(d.id),d]));
 const departments=depts.map(d=>{const id=String(d.id),code=String(d.code||id);return {...d,id,code,name_en:String(first(d,['name_en'],'Untitled department')),name_ar:String(first(d,['name_ar'],'')),curriculum_topics:topicMap.get(id)||[]}});
 const mapped=lessons.map(l=>{const topic=topicById.get(String(l.topic_id||''));const dept=topic?deptById.get(String(topic.department_id||'')):null;return {...l,id:String(l.id),department_code:String(dept?.code||''),title_en:String(first(l,['title_en'],'Untitled lesson')),learning_objectives:first(l,['learning_objectives'],[]),content_en:String(first(l,['content_en'],'')),content_ar:String(first(l,['content_ar'],'')),reference_titles:first(l,['reference_titles'],[]),self_assessment:first(l,['self_assessment','questions'],[]),review_required:String(l.status||'').toLowerCase()!=='published'}});
 return{departments,lessons:mapped,reference_catalog:[],department_count:departments.length,curriculum_topic_count:topics.length};
}
async function rpc(name,args={}){if(!session?.access_token)throw Error('سجّل الدخول أولاً لتنفيذ هذه العملية.');const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:authHeaders(),body:JSON.stringify(args)});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.message||body.details||body.hint||`فشل تنفيذ ${name} (${r.status})`);return body}
async function publicRpc(name,args={}){const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify(args)});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.message||body.details||body.hint||`فشل تحميل الأسئلة (${r.status})`);return body}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))}
const ACADEMY_ADMIN_EMAIL='alhakimoptic@gmail.com';
function isAdminAccount(){return String(session?.user?.email||'').trim().toLowerCase()===ACADEMY_ADMIN_EMAIL}
function isAdmin(){return isAdminAccount()&&profile?.is_admin===true}
function canViewLesson(l){return isAdmin()||String(l?.status||'').toLowerCase()==='published'||(!l?.status&&!l?.review_required)}
function syncAdminNavigation(){const canEnter=isAdminAccount();document.querySelectorAll('[data-page="admin"]').forEach(b=>{b.hidden=!canEnter;b.setAttribute('aria-hidden',String(!canEnter))});let entry=document.getElementById('homeAdminEntry');const holder=document.querySelector('.academy-home');if(canEnter&&holder&&!entry){entry=document.createElement('button');entry.id='homeAdminEntry';entry.className='home-admin-entry';entry.type='button';entry.textContent='⚙ نافذة إدارة الأكاديمية';entry.onclick=()=>showPage('admin');holder.insertBefore(entry,holder.firstChild)}else if(!canEnter&&entry)entry.remove()}
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
   const refs=r.map(x=>({id:x.id,title:x.title,authors:x.authors,publication_year:x.publication_year,publisher:x.publisher,url:x.url}));
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

 if(page==='permanent')pageShell('بنك الأسئلة','اختر المحاضرة لعرض أسئلتها المنشورة من قاعدة البيانات.',`<div class="notice">الأسئلة المعروضة هي الأسئلة المنشورة المرتبطة بكل محاضرة. الإجابة والتفسير يظهران بعد اختيارك.</div><div class="content-card">${lessonList(DB.lessons,true)}</div>`);
 if(page==='library')renderLibrary();if(page==='progress')renderProgress();if(page==='courses')renderCourses();if(page==='subscriptions')renderSubscriptions();if(page==='accounts')renderAccounts();if(page==='admin')renderAdmin();}
function lessonList(lessons,quizOnly=false){lessons=(lessons||[]).filter(canViewLesson);return `<div class="lesson-grid">${lessons.map(l=>`<article class="lesson-card" onclick="${quizOnly?`showQuiz('${esc(l.id)}')`:`showLesson('${esc(l.id)}')`}"><span class="tag">${esc(l.level||'Optometry')}</span><h3>${esc(l.title_en)}</h3><p>${esc(departmentName(l.department_code))}</p><small>${l.review_required?'مسودة للمراجعة العلمية':'منشور'}</small><span class="card-arrow">فتح المحاضرة ←</span></article>`).join('')||'<p>لا توجد محاضرات مسجلة حالياً.</p>'}</div>`}
async function showDepartment(code){
 const d=DB.departments.find(x=>x.code===code);if(!d)return;
 const ls=DB.lessons.filter(l=>l.department_code===code&&canViewLesson(l)&&String(l.status||'').toLowerCase()==='published');
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
function inlineFormat(text){return esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');}
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
function referenceUrl(ref){if(typeof ref==='object'&&ref){return first(ref,['url','doi','link','href'])||`https://books.google.com/books?q=${encodeURIComponent(ref.title||ref.name||'optometry')}`}return `https://books.google.com/books?q=${encodeURIComponent(String(ref))}`}
function refLabel(ref){return typeof ref==='object'?first(ref,['title','name','citation'],'مرجع علمي'):String(ref)}
function referenceLink(ref){return `<a class="reference-link" href="${esc(referenceUrl(ref))}" target="_blank" rel="noopener noreferrer">${esc(refLabel(ref))} <span>فتح المرجع ↗</span></a>`}
function renderLibrary(){const refs=DB.reference_catalog||[];pageShell('المراجع العلمية','افتح المرجع أو انتقل إلى صفحة البحث عنه عند عدم توفر رابط مباشر.',`<div class="reference-grid">${refs.map(r=>`<article class="reference-card"><h3>${esc(refLabel(r))}</h3><p>${esc(first(r,['type'],'Reference'))} · ${esc(first(r,['scope','description'],''))}</p>${referenceLink(r)}</article>`).join('')||'<div class="notice">لا توجد مراجع مضافة بعد.</div>'}</div>`)}
async function showLesson(id){const l=DB.lessons.find(x=>String(x.id)===String(id));if(!l||!canViewLesson(l)){pageShell('المحاضرة غير متاحة','هذا المحتوى ما زال قيد المراجعة العلمية.','<div class="notice">المحاضرات غير المنشورة متاحة لفريق الإدارة فقط.</div>');return;}const objectives=Array.isArray(l.learning_objectives)?l.learning_objectives.join(' · '):l.learning_objectives;const refs=Array.isArray(l.reference_titles)?l.reference_titles:[];let completion='';if(session&&isUuid(l.id)&&l.status==='published'){let done=false;try{const rows=await rest('academy_lesson_completions',`select=lesson_id&user_id=eq.${encodeURIComponent(session.user.id)}&lesson_id=eq.${encodeURIComponent(l.id)}`);done=rows.length>0}catch(e){}completion=done?'<div class="notice">✓ تم تسجيل إكمال هذا الدرس في حسابك.</div>':`<button class="primary" onclick="completeLesson('${esc(l.id)}')">تم إكمال الدرس</button><p class="muted">اضغط بعد الانتهاء من دراسة محتوى الدرس لتسجيل إنجازه.</p>`}else if(!session){completion='<div class="notice">سجّل الدخول لتسجيل إكمال الدرس وحفظ تقدمك.</div>'}else{completion='<div class="notice">هذا المحتوى محلي أو غير منشور في قاعدة البيانات؛ لا يُحتسب ضمن شروط الشهادة حتى يُنشر كسجل درس في قاعدة الأكاديمية.</div>'}const lectureHtml=renderLectureMarkdown(buildIntegratedBilingualMarkdown(l.content_en,l.content_ar));
 const slides=buildLectureSlides(lectureHtml);
 pageShell(l.title_en,departmentName(l.department_code),'<button class="home-return lecture-back" onclick="showDepartment(\''+esc(l.department_code)+'\')" aria-label="العودة إلى القسم">← <span>العودة إلى القسم</span></button><article class="lesson-detail lecture-fullscreen"><header class="lecture-cover"><div class="eyebrow">HAKIM OPTICS ACADEMY · LECTURE</div><h1>'+esc(l.title_en)+'</h1><h2>'+esc(l.title_ar||'')+'</h2><p><b>Department:</b> '+esc(departmentName(l.department_code))+' · <b>Level:</b> '+esc(l.level||'Undergraduate Optometry')+'</p></header><section class="lecture-objectives"><h2>LEARNING OBJECTIVES – أهداف المحاضرة</h2>'+(Array.isArray(l.learning_objectives)?'<ul>'+l.learning_objectives.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+esc(objectives)+'</p>')+'</section>'+renderLectureDeck(slides)+'<section class="lecture-after"><h3>Self-assessment</h3><button class="primary" onclick="showQuiz(\''+esc(l.id)+'\')">ابدأ أسئلة المحاضرة</button><h3>تسجيل إكمال الدرس</h3>'+completion+'<h3>Suggested References</h3><div class="reference-list">'+(refs.map(referenceLink).join('')||'<p>لم تُربط مراجع مباشرة بهذه المحاضرة بعد.</p>')+'</div></section></article>');
 initLectureDeck();}
async function completeLesson(id){try{const r=await rpc('academy_mark_lesson_complete',{p_lesson_id:id});alert(r.message||'تم تسجيل إكمال الدرس');const l=DB.lessons.find(x=>x.id===id);if(l)showDepartment(l.department_code)}catch(e){alert(e.message)}}
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
  <button class="quick-card" onclick="adminHomepageSettings()"><b>إدارة الواجهة الرئيسية</b><small>الشعار، الصور، بيانات المؤسس، النصوص، الألوان والاختصارات.</small></button>
  <button class="quick-card" onclick="adminCourses()"><b>إدارة الدورات</b><small>عرض الدورات المنشورة ومراجعة بياناتها.</small></button>
  <button class="quick-card" onclick="adminSubscriptions()"><b>إدارة الاشتراكات</b><small>متابعة اشتراكات الطلاب وحالاتها.</small></button>
  <button class="quick-card" onclick="adminAccounts()"><b>إدارة الحسابات</b><small>عرض حسابات الطلاب المسجلة في الأكاديمية.</small></button>
  <button class="quick-card" onclick="adminInstructors()"><b>إدارة المحاضرين</b><small>عرض حسابات المحاضرين المسجلين وصلاحياتهم التعليمية.</small></button>
  <button class="quick-card" onclick="adminCertificates()"><b>إدارة الشهادات</b><small>عرض الشهادات الصادرة وإلغاء الشهادة عند الحاجة.</small></button>
  <button class="quick-card" onclick="adminQuestionForm()"><b>بنك الأسئلة</b><small>إضافة سؤال امتحان موثق إلى القسم العلمي.</small></button>
  <button class="quick-card" onclick="adminAttempts()"><b>نتائج الامتحانات</b><small>متابعة محاولات الطلاب ونتائجهم.</small></button>
 </div>
 <div class="stats"><div class="stat"><b>${stats.questions}</b><small>سؤالاً في البنك</small></div><div class="stat"><b>${stats.attempts}</b><small>محاولة امتحان</small></div><div class="stat"><b>${stats.certificates}</b><small>شهادة صادرة</small></div></div>
 <div class="notice">تظل الدروس والموضوعات الأساسية متاحة مجاناً. إدارة الاشتراكات تخص الدورات والشهادات فقط.</div>`);
}
async function adminCourses(){
 if(!adminGuard())return;
 try{const rows=await rest('courses','select=*&order=created_at.desc');pageShell('إدارة الدورات','جميع الدورات المسجلة وحالة النشر.',`<div class="content-card"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button>${rows.map(c=>`<article class="result"><b>${esc(c.title_ar||c.title_en||'دورة دون عنوان')}</b><small>${esc(c.title_en||'')} · ${esc(c.price??'')} ${esc(c.currency||'')} · ${c.is_published?'منشورة':'مسودة'}</small><p>${esc(c.description_en||'')}</p></article>`).join('')||'<p>لا توجد دورات مسجلة حالياً.</p>'}</div>`)}catch(e){pageShell('إدارة الدورات','تعذر تحميل الدورات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminSubscriptions(){
 if(!adminGuard())return;
 try{const rows=await rest('subscriptions','select=*&order=created_at.desc');pageShell('إدارة الاشتراكات','متابعة اشتراكات الطلاب وحالاتها.',`<div class="content-card"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button>${rows.map(s=>`<article class="result"><b>${esc(s.status||'غير محدد')}</b><small>الطالب: ${esc(s.user_id||'')} · الخطة: ${esc(s.plan_id||'')}</small><small>البداية: ${esc(s.created_at||'')} · الانتهاء: ${esc(s.expires_at||'')}</small></article>`).join('')||'<p>لا توجد اشتراكات مسجلة.</p>'}</div>`)}catch(e){pageShell('إدارة الاشتراكات','تعذر تحميل الاشتراكات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminAccounts(){
 if(!adminGuard())return;
 try{const rows=await rest('profiles','select=*&order=created_at.desc');pageShell('إدارة الحسابات','حسابات المستخدمين المسجلة في الأكاديمية.',`<div class="content-card"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button>${rows.map(u=>`<article class="result"><b>${esc(u.full_name||'طالب دون اسم')}</b><small>${esc(u.email||'')} · ${esc(u.role||'student')}</small><small>تاريخ التسجيل: ${esc(u.created_at||'')}</small></article>`).join('')||'<p>لا توجد حسابات مسجلة.</p>'}</div>`)}catch(e){pageShell('إدارة الحسابات','تعذر تحميل الحسابات.',`<div class="notice">${esc(e.message)}</div><button class="secondary" onclick="renderAdmin()">عودة</button>`)}
}
async function adminInstructors(){
 if(!adminGuard())return;
 try{
  const [roles,users]=await Promise.all([
   rest('admin_roles','select=id,user_id,role,created_at&role=eq.instructor&order=created_at.desc'),
   rest('profiles','select=id,full_name,email,created_at')
  ]);
  const byId=new Map(users.map(u=>[String(u.id),u]));
  const rows=roles.map(r=>({role:r,user:byId.get(String(r.user_id))}));
  pageShell('إدارة المحاضرين','قائمة الحسابات التي مُنحت دور المحاضر في الأكاديمية.',
   '<div class="content-card"><button class="secondary" onclick="renderAdmin()">العودة إلى لوحة الإدارة</button><div class="notice">تعرض هذه الصفحة المحاضرين الذين لديهم دور instructor في جدول الصلاحيات. إدارة منح وسحب الصلاحيات ستضاف بعد اعتماد آلية التعيين.</div>'+
   (rows.map(x=>'<article class="result"><b>'+esc(x.user?.full_name||'محاضر دون اسم')+'</b><small>'+esc(x.user?.email||x.role.user_id)+' · تاريخ منح الدور: '+esc(x.role.created_at||'غير محدد')+'</small><small>معرّف الحساب: '+esc(x.role.user_id)+'</small></article>').join('')||'<p>لا يوجد محاضرون مسجلون حالياً.</p>')+'</div>');
 }catch(e){pageShell('إدارة المحاضرين','تعذر تحميل قائمة المحاضرين.','<div class="notice">'+esc(e.message)+'</div><button class="secondary" onclick="renderAdmin()">عودة</button>')}
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
async function adminCertificates(){try{const rows=await rest('academy_certificates','select=*&order=issued_at.desc');pageShell('الشهادات الصادرة','سجل الشهادات.',`<div class="content-card">${rows.map(c=>`<article class="result"><b>${esc(c.student_name)}</b><small>${esc(c.certificate_number)} · ${esc(c.department_code)} · ${esc(c.score)}%</small><span>${esc(c.status)}</span>${c.status==='valid'?`<button class="text-btn" onclick="revokeCertificate('${esc(c.id)}')">إلغاء الشهادة</button>`:''}</article>`).join('')||'<p>لا توجد شهادات بعد.</p>'}</div>`)}catch(e){alert(e.message)}}
async function revokeCertificate(id){const reason=prompt('سبب إلغاء الشهادة:');if(!reason)return;try{await rpc('academy_revoke_certificate',{p_certificate_id:id,p_reason:reason});adminCertificates()}catch(e){alert(e.message)}}
async function adminAttempts(){try{const rows=await rest('academy_exam_attempts','select=id,user_id,department_code,score,passed,status,started_at,submitted_at&order=started_at.desc');pageShell('محاولات الامتحان','سجل محاولات الطلاب ونتائجها.',`<div class="content-card">${rows.map(a=>`<div class="result"><b>${esc(a.department_code)}</b><small>${esc(a.score??'لم تسلّم')}% · ${a.passed?'ناجح':'غير ناجح'} · ${esc(a.status)}</small><small>${esc(a.user_id)}</small></div>`).join('')||'<p>لا توجد محاولات.</p>'}</div>`)}catch(e){alert(e.message)}}
async function renderCourses(){try{const rows=await rest('courses','select=*&is_published=eq.true&order=created_at.desc');pageShell('الدورات التدريبية','الدورات المنشورة في الأكاديمية.',`<div class="course-grid">${rows.map(c=>`<article class="course-card"><span class="tag">${esc(c.currency||'Course')} · ${esc(c.price??'')}</span><h3>${esc(c.title_en)}</h3><p>${esc(c.description_en||'')}</p><p dir="rtl">${esc(c.description_ar||'')}</p><button class="secondary" onclick="showCourse('${esc(c.id)}')">تفاصيل الدورة</button></article>`).join('')||'<div class="notice">لا توجد دورات منشورة حالياً.</div>'}</div>`)}catch(e){pageShell('الدورات التدريبية','تعذر تحميل الدورات.',`<div class="notice">${esc(e.message)}</div>`)}}
async function showCourse(id){try{const rows=await rest('course_modules',`select=*&course_id=eq.${encodeURIComponent(id)}&order=display_order.asc`);const course=(await rest('courses',`select=*&id=eq.${encodeURIComponent(id)}`))[0];const modules=await Promise.all(rows.map(async m=>({ ...m,lessons:await rest('course_lessons',`select=*&module_id=eq.${encodeURIComponent(m.id)}&order=display_order.asc`)})));pageShell(course?.title_en||'تفاصيل الدورة',course?.description_en||'',`<div class="content-card">${modules.map(m=>`<section><h3>${esc(m.title_en)}</h3>${m.lessons.map(l=>`<article class="lesson-card"><h4>${esc(l.title_en)}</h4><div class="content-en">${esc(l.content_en||'')}</div><div class="content-ar">${esc(l.content_ar||'')}</div></article>`).join('')}</section>`).join('')||'<div class="notice">لم تضف وحدات لهذه الدورة بعد.</div>'}</div>`)}catch(e){pageShell('تفاصيل الدورة','تعذر تحميل محتوى الدورة.',`<div class="notice">${esc(e.message)}</div>`)}}
async function renderSubscriptions(){try{if(!session){pageShell('الاشتراكات','سجّل الدخول لمراجعة اشتراكاتك.',`<button class="primary" onclick="showPage('accounts')">تسجيل الدخول</button>`);return}const [subs,plans]=await Promise.all([rest('subscriptions',`select=*&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc`),rest('subscription_plans','select=*&is_active=eq.true&order=price.asc')]);const byId=new Map(plans.map(p=>[p.id,p]));pageShell('اشتراكاتي','خطط الاشتراك وحالة اشتراكك الحالي. الدروس الأساسية متاحة مجاناً؛ الاشتراك خاص بالدورات والشهادات.',`<div class="content-card"><h3>الخطط المتاحة</h3>${plans.map(p=>`<article class="result"><b>${esc(p.name)}</b><small>${esc(p.duration_days)} يوم · ${esc(p.price)} ${esc(p.currency)}</small></article>`).join('')||'<p>لا توجد خطط مفعّلة حالياً.</p>'}<h3>سجل اشتراكاتك</h3>${subs.map(s=>{const p=byId.get(s.plan_id);return `<article class="result"><b>${esc(p?.name||'خطة غير متاحة')}</b><small>${esc(s.status)} · ينتهي: ${esc(s.expires_at||'غير محدد')}</small></article>`}).join('')||'<p>لا توجد اشتراكات مسجلة في حسابك.</p>'}</div>`)}catch(e){pageShell('الاشتراكات','تعذر تحميل بيانات الاشتراك.',`<div class="notice">${esc(e.message)}</div>`)}}
function connection(){const el=document.getElementById('connectionState');if(el)el.textContent=(navigator.onLine?'● متصل':'● دون اتصال')+' · '+(dataSource==='supabase'?'بيانات سحابية':'بيانات محلية')}
try{const saved=localStorage.getItem('hakim_auth_session');if(saved)session=JSON.parse(saved)}catch(e){session=null}
document.addEventListener('click',event=>{const account=event.target.closest('#accountBtn, .home-notices button[aria-label="حسابي"]');if(account){event.preventDefault();event.stopImmediatePropagation();showPage('accounts')}},true);
syncAdminNavigation();document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='admin'&&!isAdminAccount())return;showPage(b.dataset.page)}));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.go)));document.getElementById('homeLink').onclick=e=>{e.preventDefault();renderHome()};document.getElementById('accountBtn').onclick=()=>showPage('accounts');const hs=document.getElementById('headerSearch'),hsb=document.getElementById('headerSearchBtn');if(hsb)hsb.onclick=()=>search(hs?.value||'','headerSearchResults');if(hs){hs.addEventListener('input',()=>search(hs.value,'headerSearchResults'));hs.addEventListener('keydown',e=>{if(e.key==='Enter')search(hs.value,'headerSearchResults')})}window.addEventListener('online',connection);window.addEventListener('offline',connection);
const overlay=document.getElementById('welcomeOverlay');if(overlay){if(sessionStorage.getItem('alhakim_welcomed'))overlay.classList.add('hidden');const close=()=>{overlay.classList.add('hidden');sessionStorage.setItem('alhakim_welcomed','1')};document.getElementById('welcomeStart').onclick=close;document.getElementById('welcomeClose').onclick=close}
loadContent().then(async()=>{await loadHomepageSettings();renderHome();await loadProfile();const token=new URLSearchParams(location.search).get('verify');if(token)await verifyCertificate(token)}).catch(e=>{main.innerHTML=`<div class="content-card"><h2>تعذر تحميل المحتوى</h2><p>${esc(e.message)}</p></div>`;console.error(e)});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
