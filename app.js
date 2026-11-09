/* HAKIM OPTICS ACADEMY v2.1 — public browser key only; never add service_role here. */
const SUPABASE_URL='https://upmluemrhkadcffcsuzt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_k0VCQgULXGy_qnjvfyQKkjg_M9x43HVc';
const SUPABASE_ANON_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbWx1ZW1yaGthZGNmZmNzdXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5MTMzNDIsImV4cCI6MjEwOTQ4OTM0Mn0.TjDwjDgRVqTyXyFM_TSAsJMyEMcra7N7F71cVi4z4MU';
const CONTENT_URL='./content/HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json';
let DB=null,dataSource='local',session=null,profile=null;
const main=document.getElementById('main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const first=(o,keys,f='')=>{for(const k of keys)if(o?.[k]!==undefined&&o[k]!==null&&o[k]!=='')return o[k];return f};
const authHeaders=()=>({apikey:SUPABASE_ANON_JWT,Authorization:`Bearer ${session?.access_token||SUPABASE_ANON_JWT}`,'Content-Type':'application/json'});
async function rest(table,query='select=*'){const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`,{headers:authHeaders()});if(!r.ok){const body=await r.json().catch(()=>({}));throw Error(`${table}: ${r.status} ${body.message||body.msg||body.error_description||body.error||''}`.trim())}return r.json()}
async function optionalTable(table,query='select=*'){try{return await rest(table,query)}catch(e){console.info('Optional table unavailable:',table,e.message);return null}}
function normalizeCloud(depts,topics,lessons){
 const topicById=new Map(topics.map(t=>[String(t.id),t]));
 const topicMap=new Map();
 for(const t of topics){const k=String(t.department_id||'');if(!topicMap.has(k))topicMap.set(k,[]);topicMap.get(k).push({id:String(t.id),code:t.code,title_en:String(first(t,['title_en','title_ar','code'],'Topic')),title_ar:String(first(t,['title_ar'],''))})}
 const deptById=new Map(depts.map(d=>[String(d.id),d]));
 const departments=depts.map(d=>{const id=String(d.id),code=String(d.code||id);return {...d,id,code,name_en:String(first(d,['name_en'],'Untitled department')),name_ar:String(first(d,['name_ar'],'')),curriculum_topics:topicMap.get(id)||[]}});
 const mapped=lessons.map(l=>{const topic=topicById.get(String(l.topic_id||''));const dept=topic?deptById.get(String(topic.department_id||'')):null;return {...l,id:String(l.id),department_code:String(dept?.code||''),title_en:String(first(l,['title_en'],'Untitled lesson')),learning_objectives:first(l,['learning_objectives'],[]),content_en:String(first(l,['content_en'],'')),content_ar:String(first(l,['content_ar'],'')),reference_titles:first(l,['reference_titles'],[]),self_assessment:first(l,['self_assessment','questions'],[]),review_required:String(l.status||'').toLowerCase()!=='published'}});
 return{departments,lessons:mapped,reference_catalog:[],department_count:departments.length,curriculum_topic_count:topics.length};
}
async function rpc(name,args={}){if(!session?.access_token)throw Error('سجّل الدخول أولاً لتنفيذ هذه العملية.');const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:authHeaders(),body:JSON.stringify(args)});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.message||body.details||body.hint||`فشل تنفيذ ${name} (${r.status})`);return body}
async function publicRpc(name,args={}){const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:SUPABASE_ANON_JWT,'Content-Type':'application/json'},body:JSON.stringify(args)});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.message||body.details||body.hint||`فشل تحميل الأسئلة (${r.status})`);return body}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))}
function isAdmin(){return profile?.is_admin===true||['admin','super_admin','editor','instructor'].includes(String(session?.user?.app_metadata?.role||'').toLowerCase())}
function canViewLesson(l){return isAdmin()||String(l?.status||'').toLowerCase()==='published'||(!l?.status&&!l?.review_required)}
function syncAdminNavigation(){document.querySelectorAll('[data-page="admin"]').forEach(b=>{b.hidden=!isAdmin();b.setAttribute('aria-hidden',String(!isAdmin()))})}
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
function homeButton(){return `<button class="home-return" onclick="renderHome()" aria-label="العودة للرئيسية">⌂ <span>الرئيسية</span></button>`}
function pageShell(title,desc,body){main.innerHTML=`${homeButton()}<div class="section-heading"><div><span class="eyebrow">ALHAKIM OPTICS ACADEMY</span><h2>${esc(title)}</h2><p>${esc(desc||'')}</p></div></div>${body}`;window.scrollTo({top:0,behavior:'smooth'})}
function renderHome(){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page==='home'));main.innerHTML=`<section class="hero hero-v2"><div class="hero-copy"><span class="eyebrow">LEARN OPTOMETRY · MASTER VISION</span><h1>مرحباً بك في<br><em>Alhakim Optics Academy</em></h1><p>منصة متخصصة للتعلم المنهجي في علوم البصريات، من الأساسيات العلمية إلى المهارات السريرية والتأهيل المهني.</p><div class="hero-actions"><button class="primary" onclick="showPage('departments')">استكشف المنهج العلمي ←</button><button class="secondary" onclick="showPage('departments')">تصفح المحاضرات</button></div><div class="founder-line">تأسيس وإشراف: <b>د. لقمان بابكر الشيخ</b><small>بكالوريوس علوم البصريات — جامعة غرب كردفان</small></div></div><div class="hero-logo"><img src="./assets/alhakim-logo.png" alt="شعار أكاديمية الحكيم"></div></section>
 <section class="welcome-strip"><div><b>ابدأ رحلتك التعليمية</b><span>اختر القسم أو افتح المحاضرات أو تدرب على الأسئلة.</span></div><button class="text-btn" onclick="showPage('lessons')">عرض المحاضرات ←</button></section>
 <section class="quick-grid"><button class="quick-card" onclick="showPage('departments')"><strong>▦</strong><b>الأقسام العلمية</b><small>استعرض خريطة المنهج</small></button><button class="quick-card" onclick="showPage('lessons')"><strong>▤</strong><b>محاضرات الأقسام</b><small>افتح المحاضرات من قسمها العلمي</small></button><button class="quick-card" onclick="showPage('permanent')"><strong>✎</strong><b>بنك الأسئلة</b><small>اختبر معلوماتك</small></button><button class="quick-card" onclick="showPage('courses')"><strong>▣</strong><b>الدورات التدريبية</b><small>برامج ودورات الأكاديمية</small></button></section>
 <section class="search-panel"><div><span class="eyebrow">ACADEMY SEARCH</span><h2>ماذا تريد أن تتعلم اليوم؟</h2><p>ابحث بالإنجليزية أو العربية في الأقسام والموضوعات والمحاضرات.</p></div><div class="search-box"><input id="globalSearch" placeholder="مثال: Myopia أو Retinoscopy أو قصر النظر" autocomplete="off"><button id="searchBtn">بحث</button></div><div id="searchResults" class="search-results"></div></section>
 <section class="section"><div class="section-heading"><div><span class="eyebrow">LEARNING AREAS</span><h2>الأقسام العلمية</h2></div><button class="text-btn" onclick="showPage('departments')">عرض الكل ←</button></div><div id="featuredDepartments" class="department-grid">${(DB?.departments||[]).slice(0,6).map(deptCard).join('')}</div></section><section class="stats" id="stats"></section><footer>© ALHAKIM OPTICS ACADEMY <span>منصة تعليمية مستقلة — لا تُعد بديلاً عن التدريب السريري أو الإرشادات المهنية.</span></footer>`;
 document.getElementById('stats').innerHTML=`<div class="stat"><b>${DB.department_count??DB.departments.length}</b><small>قسم علمي</small></div><div class="stat"><b>${DB.curriculum_topic_count??DB.departments.reduce((n,d)=>n+(d.curriculum_topics||[]).length,0)}</b><small>موضوعاً في المنهج</small></div><div class="stat"><b>${DB.lessons.length}</b><small>محاضرة/درس مكتوب</small></div>`;
 document.getElementById('searchBtn').onclick=search;document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')search()});window.scrollTo({top:0,behavior:'smooth'});}
function deptCard(d,i){return `<article class="dept-card" onclick="showDepartment('${esc(d.code)}')"><div class="dept-num">DEPARTMENT ${String(i+1).padStart(2,'0')} · ${esc(d.code)}</div><h3>${esc(d.name_en)}</h3><p>${esc(d.name_ar)}</p><small>${(d.curriculum_topics||[]).length} موضوعاً في المنهج</small></article>`}
function showPage(page){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));document.getElementById('sidebar').classList.remove('open');if(page==='home'){renderHome();return}
 if(page==='departments')pageShell('الأقسام العلمية','اختر قسماً لاستعراض موضوعاته ومحاضراته.',`<div class="department-grid">${DB.departments.map(deptCard).join('')}</div>`);
 if(page==='lessons')pageShell('المحاضرات','جميع المحاضرات المنشورة في الأقسام العلمية.',`<div class="content-card">${lessonList(DB.lessons,false)}</div>`);

 if(page==='permanent')pageShell('بنك الأسئلة','اختر المحاضرة لعرض أسئلتها المنشورة من قاعدة البيانات.',`<div class="notice">الأسئلة المعروضة هي الأسئلة المنشورة المرتبطة بكل محاضرة. الإجابة والتفسير يظهران بعد اختيارك.</div><div class="content-card">${lessonList(DB.lessons,true)}</div>`);
 if(page==='library')renderLibrary();if(page==='progress')renderProgress();if(page==='courses')renderCourses();if(page==='subscriptions')renderSubscriptions();if(page==='accounts')renderAccounts();if(page==='admin')renderAdmin();}
function lessonList(lessons,quizOnly=false){lessons=(lessons||[]).filter(canViewLesson);return `<div class="lesson-grid">${lessons.map(l=>`<article class="lesson-card" onclick="${quizOnly?`showQuiz('${esc(l.id)}')`:`showLesson('${esc(l.id)}')`}"><span class="tag">${esc(l.level||'Optometry')}</span><h3>${esc(l.title_en)}</h3><p>${esc(departmentName(l.department_code))}</p><small>${l.review_required?'مسودة للمراجعة العلمية':'منشور'}</small><span class="card-arrow">فتح المحاضرة ←</span></article>`).join('')||'<p>لا توجد محاضرات مسجلة حالياً.</p>'}</div>`}
async function showDepartment(code){
 const d=DB.departments.find(x=>x.code===code);if(!d)return;
 const ls=DB.lessons.filter(l=>l.department_code===code&&canViewLesson(l)&&String(l.status||'').toLowerCase()==='published');
 const examPanel=session
  ? `<div class="exam-progress"><h3>الامتحان النهائي للقسم</h3><p>بنك الامتحان يحتوي على أسئلة القسم المعتمدة. يمكنك بدء محاولة من 20 سؤالاً عشوائياً.</p><button class="primary" onclick="startDepartmentExam('${esc(code)}')">ابدأ الامتحان النهائي · 20 سؤالاً</button><small>درجة النجاح 70%. يلزم تسجيل الدخول لحفظ المحاولة والنتيجة.</small></div>`
  : `<div class="exam-progress"><h3>الامتحان النهائي للقسم</h3><p>سجّل الدخول أولاً لبدء الامتحان وحفظ نتيجتك.</p><button class="primary" onclick="showPage('accounts')">تسجيل الدخول</button></div>`;
 pageShell(d.name_en,d.name_ar,`
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
 if(/<(?:h[1-6]|p|div|ul|ol|li|table|blockquote|br)(?:\s|>|\/)/i.test(source))return renderLectureHtml(source,rtl);
 const lines=String(raw||'').replace(/\r/g,'').split('\n');let out='',list=null,table=[];
 const blockDir=text=>{const s=String(text||'').replace(/\*\*|__|\*|_|\`/g,'');const ar=(s.match(/[\u0600-\u06FF]/g)||[]).length;const en=(s.match(/[A-Za-z]/g)||[]).length;return ar>en?'rtl':'ltr'};
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
 if(!en)return ar||'لم يضف المحتوى العلمي بعد.';
 // Academy authoring standard: the English scientific lesson contains its
 // Arabic teaching explanations inline (as in Conjunctiva ANP-006).
 // Do not append content_ar as a separate translated summary or try to pair
 // unrelated paragraphs from two independently authored documents.
 const hasArabicExplanation=/شرح|التوضيح|بالعربي|بالعربية|الفهم|المعنى/.test(en)&&/[\u0600-\u06FF]/.test(en);
 if(hasArabicExplanation)return en;
 // Legacy records may store a complete English lesson and a separate Arabic
 // note. Keep the English source intact and add only a clearly labeled,
 // concise explanatory note when no inline Arabic teaching exists.
 if(ar)return en+'\n\n## Arabic Learning Notes – توضيحات للفهم\n\n'+ar;
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
 pageShell(l.title_en,departmentName(l.department_code),'<article class="lesson-detail lecture-fullscreen"><header class="lecture-cover"><div class="eyebrow">HAKIM OPTICS ACADEMY · LECTURE</div><h1>'+esc(l.title_en)+'</h1><h2>'+esc(l.title_ar||'')+'</h2><p><b>Department:</b> '+esc(departmentName(l.department_code))+' · <b>Level:</b> '+esc(l.level||'Undergraduate Optometry')+'</p></header><section class="lecture-objectives"><h2>LEARNING OBJECTIVES – أهداف المحاضرة</h2>'+(Array.isArray(l.learning_objectives)?'<ul>'+l.learning_objectives.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+esc(objectives)+'</p>')+'</section>'+renderLectureDeck(slides)+'<section class="lecture-after"><h3>Self-assessment</h3><button class="primary" onclick="showQuiz(\''+esc(l.id)+'\')">ابدأ أسئلة المحاضرة</button><h3>تسجيل إكمال الدرس</h3>'+completion+'<h3>Suggested References</h3><div class="reference-list">'+(refs.map(referenceLink).join('')||'<p>لم تُربط مراجع مباشرة بهذه المحاضرة بعد.</p>')+'</div></section></article>');
 initLectureDeck();}
async function completeLesson(id){try{const r=await rpc('academy_mark_lesson_complete',{p_lesson_id:id});alert(r.message||'تم تسجيل إكمال الدرس');const l=DB.lessons.find(x=>x.id===id);if(l)showDepartment(l.department_code)}catch(e){alert(e.message)}}
async function startDepartmentExam(code){try{const exam=await rpc('academy_start_exam',{p_department_code:code,p_question_count:20});renderDepartmentExam(exam)}catch(e){alert(e.message)}}
function renderDepartmentExam(exam){const questions=exam.questions||[];window.activeAcademyExam=exam;pageShell('الامتحان الشامل · '+exam.department_code,`عدد الأسئلة: ${exam.total_questions} · درجة النجاح: ${exam.pass_mark}%`, `<form id="departmentExamForm" class="content-card">${questions.map((q,i)=>{const opts=Array.isArray(q.options)?q.options:[];return `<section class="question exam-question"><b>${i+1}. ${esc(q.question)}</b>${opts.map((o,j)=>{const val=typeof o==='object'?String(o.value??o.id??o.label??j):String(o);const label=typeof o==='object'?String(o.label??o.text??val):String(o);return `<label class="exam-option"><input type="radio" name="q_${esc(q.id)}" value="${esc(val)}" required><span>${esc(label)}</span></label>`}).join('')}</section>`}).join('')}<button class="primary" type="submit">تسليم الامتحان وتصحيح الإجابات</button><button class="secondary" type="button" onclick="showDepartment('${esc(exam.department_code)}')">إلغاء والعودة للقسم</button><p id="examMessage" class="form-message"></p></form>`);document.getElementById('departmentExamForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,answers={};questions.forEach(q=>{const selected=form.querySelector(`input[name="q_${CSS.escape(q.id)}"]:checked`);if(selected)answers[q.id]=selected.value});const msg=document.getElementById('examMessage');msg.textContent='جارٍ التصحيح…';try{const result=await rpc('academy_submit_exam',{p_attempt_id:exam.attempt_id,p_answers:answers});renderExamResult(result,exam.department_code)}catch(err){msg.textContent=err.message}}}
function renderExamResult(result,code){const passed=!!result.passed;const cert=result.certificate_number;let certificate='';if(passed&&result.verification_token){const verifyUrl=`${location.origin}${location.pathname}?verify=${encodeURIComponent(result.verification_token)}`;certificate=`<section class="certificate-preview" id="certificate"><div class="certificate-inner"><span class="eyebrow">ALHAKIM OPTICS ACADEMY</span><h2>Certificate of Department Completion</h2><h3>شهادة إتمام قسم علمي</h3><p>تشهد أكاديمية الحكيم للبصريات بأن</p><h2>${esc(session?.user?.user_metadata?.full_name||session?.user?.user_metadata?.name||'الطالب')}</h2><p>قد أتم متطلبات القسم العلمي</p><h2>${esc(code)}</h2><p>بنتيجة ${esc(result.score)}%</p><p>رقم الشهادة: ${esc(cert)}</p><p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar')}</p><img class="certificate-qr" alt="QR verification" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}"><p class="certificate-note">امسح الرمز للتحقق من صحة الشهادة. هذه شهادة إتمام تعليمية صادرة عن الأكاديمية وليست مؤهلاً جامعياً أو ترخيصاً مهنياً.</p></div></section><button class="primary" onclick="window.print()">طباعة / حفظ الشهادة PDF</button><p><a href="${esc(verifyUrl)}" target="_blank" rel="noopener">صفحة التحقق من الشهادة</a></p>`}pageShell('نتيجة الامتحان',passed?'تهانينا، اجتزت الامتحان الشامل.':'لم تحقق درجة النجاح المطلوبة؛ يمكنك إعادة المحاولة.',`<div class="content-card"><h2>${passed?'ناجح ✓':'لم تنجح بعد'}</h2><p>النتيجة: <b>${esc(result.score)}%</b></p><p>الإجابات الصحيحة: ${esc(result.correct_answers)} من ${esc(result.total_questions)}</p><p>درجة النجاح: 70%</p>${certificate}<button class="secondary" onclick="showDepartment('${esc(code)}')">العودة إلى القسم</button></div>`)}
async function verifyCertificate(token){try{const result=await fetch(`${SUPABASE_URL}/rest/v1/rpc/academy_verify_certificate`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_token:token})}).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.message||'تعذر التحقق');return b});pageShell('التحقق من الشهادة','التحقق الإلكتروني من شهادة أكاديمية الحكيم.',`<div class="content-card"><h2>${result.found?(result.valid?'شهادة صحيحة ومعتمدة ✓':'الشهادة ملغاة'):'لم يتم العثور على الشهادة'}</h2>${result.found?`<p>الاسم: ${esc(result.student_name)}</p><p>القسم: ${esc(result.department_code)}</p><p>النتيجة: ${esc(result.score)}%</p><p>رقم الشهادة: ${esc(result.certificate_number)}</p><p>تاريخ الإصدار: ${esc(new Date(result.issued_at).toLocaleDateString())}</p>`:''}</div>`)}catch(e){pageShell('التحقق من الشهادة','تعذر التحقق.',`<div class="notice">${esc(e.message)}</div>`)}}
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
function search(){const input=document.getElementById('globalSearch');if(!input)return;const q=input.value.trim().toLowerCase(),box=document.getElementById('searchResults');if(!q){box.innerHTML='';return}const results=[];DB.departments.forEach(d=>{if((d.name_en+' '+d.name_ar).toLowerCase().includes(q))results.push({label:d.name_en+' — '+d.name_ar,sub:'قسم علمي',action:`showDepartment('${d.code}')`});(d.curriculum_topics||[]).forEach(t=>{if(t.toLowerCase().includes(q))results.push({label:t,sub:d.name_en,action:`searchTopic('${t.replace(/'/g,"\\'")}','${d.code}')`})})});DB.lessons.filter(canViewLesson).forEach(l=>{if((l.title_en+' '+l.content_en+' '+l.content_ar).toLowerCase().includes(q))results.push({label:l.title_en,sub:'محاضرة · '+departmentName(l.department_code),action:`showLesson('${l.id}')`})});box.innerHTML=results.length?results.slice(0,30).map(r=>`<button class="result search-result" onclick="${r.action}"><b>${esc(r.label)}</b><small>${esc(r.sub)}</small></button>`).join(''):'<div class="result">لا توجد نتائج مطابقة.</div>'}
async function signIn(email,password){const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});const data=await r.json();if(!r.ok)throw Error(data.msg||data.message||'تعذر تسجيل الدخول');session=data;localStorage.setItem('hakim_auth_session',JSON.stringify(data));await loadProfile();}
async function loadProfile(){if(!session){profile=null;syncAdminNavigation();return}let admin=false;try{admin=(await rpc('is_academy_admin'))===true}catch(e){admin=['admin','super_admin','editor','instructor'].includes(String(session.user?.app_metadata?.role||'').toLowerCase())}profile={role:admin?'admin':'student',is_admin:admin,display_name:session.user?.user_metadata?.full_name||session.user?.user_metadata?.name||''};syncAdminNavigation();return profile;}
function signOut(){session=null;profile=null;syncAdminNavigation();localStorage.removeItem('hakim_auth_session');showPage('accounts')}
function renderAccounts(){const user=session?.user;pageShell('الحسابات','إدارة جلسة الدخول واسم الطالب المستخدم في الشهادة.',user?`<div class="content-card"><h3>الحساب الحالي</h3><p>${esc(user.email)}</p><p>الدور: ${isAdmin()?'مدير الأكاديمية':'طالب'}</p><label>الاسم الكامل كما سيظهر في الشهادة<input id="studentFullName" value="${esc(user.user_metadata?.full_name||user.user_metadata?.name||'')}" placeholder="اكتب الاسم الكامل"></label><button class="primary" onclick="saveStudentName()">حفظ الاسم</button><button class="secondary" onclick="signOut()">تسجيل الخروج</button><p id="profileMsg" class="form-message"></p></div>`:`<div class="auth-card"><h3>تسجيل الدخول</h3><form id="loginForm"><label>البريد الإلكتروني<input type="email" id="loginEmail" required autocomplete="username"></label><label>كلمة المرور<input type="password" id="loginPassword" required autocomplete="current-password"></label><button class="primary" type="submit">دخول</button><p id="authMessage" class="form-message"></p></form><div class="notice">تسجيل الدخول عبر Supabase Auth. لا تنشئ حساباً إدارياً من الواجهة العامة.</div></div>`);const f=document.getElementById('loginForm');if(f)f.onsubmit=async e=>{e.preventDefault();const m=document.getElementById('authMessage');m.textContent='جارٍ التحقق…';try{await signIn(document.getElementById('loginEmail').value,document.getElementById('loginPassword').value);renderAccounts()}catch(err){m.textContent=err.message}}}
async function saveStudentName(){const name=document.getElementById('studentFullName').value.trim();const msg=document.getElementById('profileMsg');if(name.length<4){msg.textContent='أدخل الاسم الكامل.';return}try{const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',headers:authHeaders(),body:JSON.stringify({data:{...session.user.user_metadata,full_name:name}})});const body=await r.json();if(!r.ok)throw Error(body.message||'تعذر حفظ الاسم');session.user=body;if(session.refresh_token){const rr=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});if(rr.ok)session=await rr.json()}localStorage.setItem('hakim_auth_session',JSON.stringify(session));msg.textContent='تم حفظ الاسم بنجاح. يمكنك الآن دخول الامتحان وإصدار الشهادة باسمك.'}catch(e){msg.textContent=e.message}}
function adminGuard(){return isAdmin()}
async function renderAdmin(){if(!session){pageShell('نافذة الإدارة','تسجيل الدخول بحساب إداري مطلوب.',`<div class="notice">يرجى تسجيل الدخول بحساب الإدارة.</div><button class="primary" onclick="showPage('accounts')">فتح الحسابات</button>`);return}if(!adminGuard()){pageShell('نافذة الإدارة','هذه النافذة مخصصة لإدارة الأكاديمية.',`<div class="notice">لا يملك هذا الحساب دوراً إدارياً مسجلاً في قاعدة صلاحيات الأكاديمية. يلزم إضافته إلى admin_roles بدور super_admin أو editor أو instructor.</div>`);return}let stats={questions:0,certificates:0,attempts:0};try{[stats.questions,stats.certificates,stats.attempts]=await Promise.all(['academy_exam_questions','academy_certificates','academy_exam_attempts'].map(async t=>(await rest(t,'select=id')).length))}catch(e){}pageShell('لوحة الإدارة','إدارة بنك الأسئلة ومتابعة الشهادات ومحاولات الامتحان.',`<div class="admin-grid"><button class="quick-card" onclick="adminQuestionForm()"><b>إضافة سؤال امتحان</b><small>إضافة سؤال إلى بنك القسم العلمي</small></button><button class="quick-card" onclick="adminCertificates()"><b>الشهادات</b><small>عرض الشهادات الصادرة</small></button><button class="quick-card" onclick="adminAttempts()"><b>محاولات الامتحان</b><small>متابعة نتائج الطلاب</small></button></div><div class="stats"><div class="stat"><b>${stats.questions}</b><small>سؤالاً في البنك</small></div><div class="stat"><b>${stats.attempts}</b><small>محاولة امتحان</small></div><div class="stat"><b>${stats.certificates}</b><small>شهادة صادرة</small></div></div><div class="notice">لا تُفعّل الامتحانات لقسم إلا بعد إدخال العدد الكافي من الأسئلة ومراجعتها علمياً. لا توجد أسئلة افتراضية أو مولّدة تلقائياً.</div>`)}
function adminQuestionForm(){if(!adminGuard())return;pageShell('إضافة سؤال للامتحان','أدخل سؤالاً موثقاً وحدد أربعة خيارات والإجابة الصحيحة.',`<form id="questionForm" class="content-card"><label>القسم<select id="qDept">${DB.departments.map(d=>`<option value="${esc(d.code)}">${esc(d.code)} — ${esc(d.name_en)}</option>`).join('')}</select></label><label>نص السؤال<textarea id="qStem" required></textarea></label>${[0,1,2,3].map(i=>`<label>الخيار ${i+1}<input id="qOpt${i}" required></label>`).join('')}<label>رمز الإجابة الصحيحة<select id="qCorrect"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label><label>التفسير العلمي<textarea id="qExplain"></textarea></label><label>المستوى<select id="qDifficulty"><option>basic</option><option selected>intermediate</option><option>advanced</option></select></label><button class="primary">حفظ السؤال</button><p id="qMsg" class="form-message"></p></form>`);document.getElementById('questionForm').onsubmit=async e=>{e.preventDefault();const options=['A','B','C','D'].map((v,i)=>({value:v,label:document.getElementById('qOpt'+i).value.trim()}));try{const r=await fetch(`${SUPABASE_URL}/rest/v1/academy_exam_questions`,{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify({department_code:document.getElementById('qDept').value,question_text:document.getElementById('qStem').value.trim(),options,correct_option:document.getElementById('qCorrect').value,explanation:document.getElementById('qExplain').value.trim(),difficulty:document.getElementById('qDifficulty').value,is_active:true})});if(!r.ok){const b=await r.json();throw Error(b.message||'تعذر حفظ السؤال')}document.getElementById('qMsg').textContent='تم حفظ السؤال.';e.target.reset()}catch(err){document.getElementById('qMsg').textContent=err.message}}}
async function adminCertificates(){try{const rows=await rest('academy_certificates','select=*&order=issued_at.desc');pageShell('الشهادات الصادرة','سجل الشهادات.',`<div class="content-card">${rows.map(c=>`<article class="result"><b>${esc(c.student_name)}</b><small>${esc(c.certificate_number)} · ${esc(c.department_code)} · ${esc(c.score)}%</small><span>${esc(c.status)}</span>${c.status==='valid'?`<button class="text-btn" onclick="revokeCertificate('${esc(c.id)}')">إلغاء الشهادة</button>`:''}</article>`).join('')||'<p>لا توجد شهادات بعد.</p>'}</div>`)}catch(e){alert(e.message)}}
async function revokeCertificate(id){const reason=prompt('سبب إلغاء الشهادة:');if(!reason)return;try{await rpc('academy_revoke_certificate',{p_certificate_id:id,p_reason:reason});adminCertificates()}catch(e){alert(e.message)}}
async function adminAttempts(){try{const rows=await rest('academy_exam_attempts','select=id,user_id,department_code,score,passed,status,started_at,submitted_at&order=started_at.desc');pageShell('محاولات الامتحان','سجل محاولات الطلاب ونتائجها.',`<div class="content-card">${rows.map(a=>`<div class="result"><b>${esc(a.department_code)}</b><small>${esc(a.score??'لم تسلّم')}% · ${a.passed?'ناجح':'غير ناجح'} · ${esc(a.status)}</small><small>${esc(a.user_id)}</small></div>`).join('')||'<p>لا توجد محاولات.</p>'}</div>`)}catch(e){alert(e.message)}}
async function renderCourses(){try{const rows=await rest('courses','select=*&is_published=eq.true&order=created_at.desc');pageShell('الدورات التدريبية','الدورات المنشورة في الأكاديمية.',`<div class="course-grid">${rows.map(c=>`<article class="course-card"><span class="tag">${esc(c.currency||'Course')} · ${esc(c.price??'')}</span><h3>${esc(c.title_en)}</h3><p>${esc(c.description_en||'')}</p><p dir="rtl">${esc(c.description_ar||'')}</p><button class="secondary" onclick="showCourse('${esc(c.id)}')">تفاصيل الدورة</button></article>`).join('')||'<div class="notice">لا توجد دورات منشورة حالياً.</div>'}</div>`)}catch(e){pageShell('الدورات التدريبية','تعذر تحميل الدورات.',`<div class="notice">${esc(e.message)}</div>`)}}
async function showCourse(id){try{const rows=await rest('course_modules',`select=*&course_id=eq.${encodeURIComponent(id)}&order=display_order.asc`);const course=(await rest('courses',`select=*&id=eq.${encodeURIComponent(id)}`))[0];const modules=await Promise.all(rows.map(async m=>({ ...m,lessons:await rest('course_lessons',`select=*&module_id=eq.${encodeURIComponent(m.id)}&order=display_order.asc`)})));pageShell(course?.title_en||'تفاصيل الدورة',course?.description_en||'',`<div class="content-card">${modules.map(m=>`<section><h3>${esc(m.title_en)}</h3>${m.lessons.map(l=>`<article class="lesson-card"><h4>${esc(l.title_en)}</h4><div class="content-en">${esc(l.content_en||'')}</div><div class="content-ar">${esc(l.content_ar||'')}</div></article>`).join('')}</section>`).join('')||'<div class="notice">لم تضف وحدات لهذه الدورة بعد.</div>'}</div>`)}catch(e){pageShell('تفاصيل الدورة','تعذر تحميل محتوى الدورة.',`<div class="notice">${esc(e.message)}</div>`)}}
async function renderSubscriptions(){try{if(!session){pageShell('الاشتراكات','سجّل الدخول لمراجعة اشتراكاتك.',`<button class="primary" onclick="showPage('accounts')">تسجيل الدخول</button>`);return}const [subs,plans]=await Promise.all([rest('subscriptions',`select=*&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc`),rest('subscription_plans','select=*&is_active=eq.true&order=price.asc')]);const byId=new Map(plans.map(p=>[p.id,p]));pageShell('اشتراكاتي','خطط الاشتراك وحالة اشتراكك الحالي. الدروس الأساسية متاحة مجاناً؛ الاشتراك خاص بالدورات والشهادات.',`<div class="content-card"><h3>الخطط المتاحة</h3>${plans.map(p=>`<article class="result"><b>${esc(p.name)}</b><small>${esc(p.duration_days)} يوم · ${esc(p.price)} ${esc(p.currency)}</small></article>`).join('')||'<p>لا توجد خطط مفعّلة حالياً.</p>'}<h3>سجل اشتراكاتك</h3>${subs.map(s=>{const p=byId.get(s.plan_id);return `<article class="result"><b>${esc(p?.name||'خطة غير متاحة')}</b><small>${esc(s.status)} · ينتهي: ${esc(s.expires_at||'غير محدد')}</small></article>`}).join('')||'<p>لا توجد اشتراكات مسجلة في حسابك.</p>'}</div>`)}catch(e){pageShell('الاشتراكات','تعذر تحميل بيانات الاشتراك.',`<div class="notice">${esc(e.message)}</div>`)}}
function connection(){const el=document.getElementById('connectionState');if(el)el.textContent=(navigator.onLine?'● متصل':'● دون اتصال')+' · '+(dataSource==='supabase'?'بيانات سحابية':'بيانات محلية')}
try{const saved=localStorage.getItem('hakim_auth_session');if(saved)session=JSON.parse(saved)}catch(e){session=null}
syncAdminNavigation();document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='admin'&&!isAdmin())return;showPage(b.dataset.page)}));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.go)));document.getElementById('menuBtn').onclick=()=>document.getElementById('sidebar').classList.toggle('open');document.getElementById('homeLink').onclick=e=>{e.preventDefault();renderHome()};document.getElementById('accountBtn').onclick=()=>showPage('accounts');window.addEventListener('online',connection);window.addEventListener('offline',connection);
const overlay=document.getElementById('welcomeOverlay');if(overlay){if(sessionStorage.getItem('alhakim_welcomed'))overlay.classList.add('hidden');const close=()=>{overlay.classList.add('hidden');sessionStorage.setItem('alhakim_welcomed','1')};document.getElementById('welcomeStart').onclick=close;document.getElementById('welcomeClose').onclick=close}
loadContent().then(async()=>{await loadProfile();const token=new URLSearchParams(location.search).get('verify');if(token)await verifyCertificate(token)}).catch(e=>{main.innerHTML=`<div class="content-card"><h2>تعذر تحميل المحتوى</h2><p>${esc(e.message)}</p></div>`;console.error(e)});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
