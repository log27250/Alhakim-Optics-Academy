/**
 * HAKIM OPTICS ACADEMY - Main Application Script
 * Developer / Founder: Dr. Logman Babiker Elsheikh Mohamed
 * Version: 6.0 (Enterprise Full-Feature Architecture)
 */

const SUPABASE_URL = "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = "Sb_publishable_k0VCQgULXGy_qnjvfyQkjg_M9x43HVc";
let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// قاعدة البيانات الشاملة والمعاد ترتيبها علمياً (12 قسماً متكاملاً)
let DB = {
  "academy_name": "Alhakim Optics Academy",
  "founder": "Dr. Logman Babiker Elsheikh Mohamed",
  "department_count": 12,
  "curriculum_topic_count": 231,
  "departments": [
    {
      "code": "OPT-101",
      "name_ar": "بصريات الانكسار السريري",
      "name_en": "Clinical Refraction",
      "curriculum_topics": ["Hypermetropia", "Myopia", "Astigmatism", "Presbyopia", "Accommodation", "Retinoscopy", "Cycloplegic Refraction"]
    },
    {
      "code": "OPT-102",
      "name_ar": "الرؤية المزدوجة والحول",
      "name_en": "Binocular Vision & Strabismus",
      "curriculum_topics": ["Heterophoria", "Strabismus Evaluation", "Amblyopia", "Vergence System", "Accommodative Esotropia", "Stereopsis"]
    },
    {
      "code": "OPT-103",
      "name_ar": "العدسات اللاصقة والتطبيقات القرنية",
      "name_en": "Contact Lenses & Cornea",
      "curriculum_topics": ["Soft Contact Lenses", "RGP Lenses", "Toric Lenses", "Keratoconus Fitting", "Complications & Care"]
    },
    {
      "code": "OPT-104",
      "name_ar": "البصريات الفيزيائية والهندسية",
      "name_en": "Physical & Geometrical Optics",
      "curriculum_topics": ["Light Waves", "Prisms & Lenses", "Spherical Mirrors", "Optical Aberrations", "Vertex Distance"]
    },
    {
      "code": "OPT-105",
      "name_ar": "الأمراض العيانية والتشخيص السريري",
      "name_en": "Ocular Disease & Clinical Diagnosis",
      "curriculum_topics": ["Glaucoma Evaluation", "Cataract Classifications", "Retinal Disorders", "Corneal Ulcers", "Uveitis"]
    },
    {
      "code": "OPT-106",
      "name_ar": "بصريات الأطفال ورعاية الرؤية المنخفضة",
      "name_en": "Pediatric Optometry & Low Vision",
      "curriculum_topics": ["Pediatric Examination", "Low Vision Aids", "Vision Rehabilitation", "Cortical Visual Impairment"]
    },
    {
      "code": "OPT-107",
      "name_ar": "الأجهزة التشخيصية والتصوير الطبي",
      "name_en": "Diagnostic Instruments & Imaging",
      "curriculum_topics": ["Autorefractometer", "OCT Scanning", "Visual Fields Analyzer", "Topography", "Pachymetry"]
    },
    {
      "code": "OPT-108",
      "name_ar": "الصيدلة والأدوية العيونية",
      "name_en": "Ocular Pharmacology",
      "curriculum_topics": ["Cycloplegics & Mydriatics", "Anti-Glaucoma Drugs", "Anti-Infectives", "Ocular Anti-Inflammatories"]
    },
    {
      "code": "OPT-109",
      "name_ar": "البصريات المجتمعية والصحة العامة",
      "name_en": "Public Health & Community Optometry",
      "curriculum_topics": ["Screening Programs", "Epidemiology of Blindness", "Primary Eye Care", "Occupational Optometry"]
    },
    {
      "code": "OPT-110",
      "name_ar": "تشريح ووظائف أعضاء العين",
      "name_en": "Ocular Anatomy & Physiology",
      "curriculum_topics": ["Cornea & Anterior Segment", "Vitreous & Retina", "Extraocular Muscles", "Visual Pathway"]
    },
    {
      "code": "OPT-111",
      "name_ar": "البصريات البصرية وتنسيق الإطارات",
      "name_en": "Ophthalmic Dispensing & Optics",
      "curriculum_topics": ["Lens Materials", "Frame Measurements", "Centration & PD", "Prescription Verification"]
    },
    {
      "code": "OPT-112",
      "name_ar": "الجراحات الانكسارية والتقنيات الحديثة",
      "name_en": "Refractive Surgery & Advanced Tech",
      "curriculum_topics": ["LASIK & PRK", "ICL Implantation", "Presbyopia Surgical Options", "Complications Management"]
    }
  ],
  "lessons": [
    {
      "id": "hypermetropia-master",
      "department_code": "OPT-101",
      "title_en": "HYPERMETROPIA (HYPEROPIA)",
      "title_ar": "طول النظر (العيوب الانكسارية والأسس السريرية)",
      "level": "Undergraduate Optometry / Advanced Clinical Optometry",
      "status": "Approved",
      "review_required": false,
      "learning_objectives": [
        "Understand optical basis and etiology of hypermetropia",
        "Master classification into latent, manifest, facultative, and absolute",
        "Perform accurate objective and subjective clinical refraction"
      ],
      "content_en": "Hypermetropia, also known as hyperopia, is a common refractive error in which parallel rays of light entering the eye from infinity are focused behind the retina when accommodation is relaxed. It occurs when the refractive power of the eye is insufficient relative to its axial length. In a hypermetropic eye, accommodation may compensate for the refractive error by increasing the optical power of the crystalline lens.",
      "content_ar": "طول النظر (Hypermetropia) هو خطأ انكساري شائع تتبوأ فيه أشعة الضوء المتوازية القادمة من ما لا نهاية بؤرتها خلف الشبكية عندما يكون التكيف مسترخياً. يحدث عندما تكون القوة الانكسارية للعين غير كافية بالنسبة لطولها المحوري. يعوض التكيف هذا الخطأ جزئياً بزيادة قوة العدسة البلورية، مما يسبب أحياناً إجهاداً بصرياً (Asthenopia).",
      "self_assessment": [
        {
          "stem": "Hypermetropia is a refractive condition in which parallel rays focus:",
          "options": ["In front of the retina.", "Behind the retina.", "Directly on the retina.", "At the anterior chamber."],
          "answer": "Behind the retina.",
          "explanation": "In hypermetropia, parallel rays focus behind the retina due to insufficient optical power or short axial length."
        }
      ],
      "reference_titles": [
        "Benjamin, W. J. Borish's Clinical Refraction.",
        "Kanski's Clinical Ophthalmology."
      ]
    }
  ],
  "reference_catalog": [
    { "id": "ref-1", "title": "Borish's Clinical Refraction", "type": "Textbook", "scope": "Clinical Refraction & Optics" },
    { "id": "ref-2", "title": "Kanski's Clinical Ophthalmology", "type": "Reference", "scope": "Ocular Pathology & Clinical Signs" }
  ]
};

let currentDepartment = null;
let currentLesson = null;
const main = document.getElementById("main");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadContent() {
    try {
        let localCustomLessons = JSON.parse(localStorage.getItem("alhakim_custom_lessons") || "[]");
        if (localCustomLessons.length > 0) {
            DB.lessons = [...localCustomLessons, ...DB.lessons.filter(l => !localCustomLessons.some(c => c.id === l.id))];
        }
    } catch (e) {
        console.error("Load local lessons error:", e);
    }
    renderHome();
}

function departmentName(code) {
    if (!DB || !DB.departments) return code;
    let dept = DB.departments.find(d => d.code === code);
    return dept ? (dept.name_ar + " (" + dept.name_en + ")") : code;
}

// Render Professional Home Page
function renderHome() {
    if (!DB) return;
    main.innerHTML = `
        <section class="hero">
            <div class="hero-copy">
                <span class="eyebrow">INTERACTIVE OPTOMETRY LEARNING</span>
                <h1>مرحباً بك في<br><em>Alhakim Optics Academy</em></h1>
                <p>منصة تعليمية متخصصة لعلوم البصريات، تجمع المنهج العلمي والدروس والاختبارات والتدريب السريري في مساحة واحدة.</p>
                <button class="primary" onclick="showPage('departments')">استكشف الأقسام العلمية ←</button>
                <div class="founder-line">تأسيس وإشراف: <b>د. لقمان بابكر الشيخ</b><small>بكالوريوس علوم البصريات — جامعة غرب كردفان</small></div>
            </div>
            <div class="hero-logo"><img src="./alhakim-logo.png" alt="Alhakim Optics Academy"></div>
        </section>
        <section class="search-panel">
            <div>
                <span class="eyebrow">ACADEMY SEARCH</span>
                <h2>ماذا تريد أن تتعلم اليوم؟</h2>
                <p>ابحث بالإنجليزية أو العربية في الأقسام والموضوعات والدروس المتاحة.</p>
            </div>
            <div class="search-box">
                <input id="globalSearch" placeholder="مثال: Myopia أو Retinoscopy أو قصر النظر" autocomplete="off">
                <button id="searchBtn">بحث</button>
            </div>
            <div id="searchResults" class="search-results"></div>
        </section>
        <section class="section">
            <div class="section-heading">
                <div><span class="eyebrow">LEARNING AREAS</span><h2>الأقسام العلمية (12 قسماً)</h2></div>
                <button class="text-btn" onclick="showPage('departments')">عرض الكل ←</button>
            </div>
            <div id="featuredDepartments" class="department-grid"></div>
        </section>
        <section class="stats" id="stats"></section>
    `;

    const feat = document.getElementById("featuredDepartments");
    if (feat) {
        feat.innerHTML = DB.departments.map((d, i) => `
            <article class="dept-card" onclick="showDepartment('${d.code}')">
                <div class="dept-num">DEPARTMENT ${String(i + 1).padStart(2, "0")} · ${esc(d.code)}</div>
                <h3>${esc(d.name_en)}</h3>
                <p>${esc(d.name_ar)}</p>
                <small>${d.curriculum_topics.length} موضوعاً في المنهج</small>
            </article>
        `).join("");
    }
    
    const stats = document.getElementById("stats");
    if (stats) {
        stats.innerHTML = `
            <div class="stat"><b>${DB.departments.length}</b><small>قسم علمي معتمد</small></div>
            <div class="stat"><b>${DB.curriculum_topic_count || 231}</b><small>موضوعاً في المنهج</small></div>
            <div class="stat"><b>${DB.lessons.length}</b><small>درساً تفاعلياً متاحاً</small></div>
        `;
    }
    setupSearchListeners();
}

function pageShell(title, desc, body) {
    main.innerHTML = `
        <div class="section-heading">
            <div>
                <span class="eyebrow">ALHAKIM OPTICS ACADEMY</span>
                <h2>${esc(title)}</h2>
                <p>${esc(desc || "")}</p>
            </div>
            <button class="text-btn" onclick="showPage('home')">الرئيسية ←</button>
        </div>
        ${body}
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPage(page) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
    
    if (page === "home") {
        renderHome();
        return;
    }

    if (!DB) return;

    if (page === "departments") {
        pageShell("الأقسام العلمية", "استعرض الأقسام الـ 12 المعتمدة في المنهج الأكاديمي والسريري.", `
            <div class="department-grid">
                ${DB.departments.map((d, i) => `
                    <article class="dept-card" onclick="showDepartment('${d.code}')">
                        <div class="dept-num">DEPARTMENT ${String(i + 1).padStart(2, "0")}</div>
                        <h3>${esc(d.name_en)}</h3>
                        <p>${esc(d.name_ar)}</p>
                        <small>${d.curriculum_topics.length} موضوعاً</small>
                    </article>
                `).join("")}
            </div>
        `);
    } else if (page === "lessons") {
        pageShell("الدروس المكتوبة", "الدروس المتاحة حالياً في الأكاديمية بالصياغة الأكاديمية الموحدة.", lessonList(DB.lessons));
    } else if (page === "permanent") {
        pageShell("تدريب الأسئلة وبنك الاختبارات", "تدرب على أسئلة التقييم الذاتي المرتبطة بالدروس لتعزيز فهمك الإكلينيكي.", `
            <div class="notice">بنك الأسئلة التفاعلي لتقييم استيعاب المفاهيم البصرية والسريرية.</div>
            ${lessonList(DB.lessons, true)}
        `);
    } else if (page === "library") {
        pageShell("المراجع العلمية والتوثيق", "قائمة المراجع المقترحة لدعم التحقق العلمي والتوثيق الأكاديمي.", `
            <div class="content-card">
                ${DB.reference_catalog.map(x => `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #edf1f5; padding-bottom: 12px;">
                        <h3 style="margin: 0 0 5px 0;">${esc(x.title)}</h3>
                        <p style="margin: 0; color: var(--muted);"><b>التصنيف:</b> ${esc(x.type)} — ${esc(x.scope)}</p>
                    </div>
                `).join("")}
            </div>
        `);
    } else if (page === "progress") {
        let p = JSON.parse(localStorage.getItem("alhakim_progress") || "{}");
        let openedKeys = Object.keys(p);
        pageShell("تقدمي الدراسي", "يُحفظ تقدمك ودروسك المفتوحة على هذا الجهاز محلياً مع المزامنة السحابية.", `
            <div class="content-card">
                <h3>الدروس التي استعرضتها: ${openedKeys.length} من ${DB.lessons.length}</h3>
                <p>${openedKeys.map(id => esc(DB.lessons.find(l => l.id === id)?.title_en || id)).join("، ") || "لم تبدأ استعراض أي درس بعد."}</p>
                <br>
                <button class="primary" onclick="localStorage.removeItem('alhakim_progress');showPage('progress')">مسح سجل هذا الجهاز</button>
            </div>
        `);
    } else if (page === "admin") {
        renderAdminDashboard();
        return;
    }
}

function lessonList(lessons, quizOnly = false) {
    if (!lessons || lessons.length === 0) return '<div class="content-card">لا توجد دروس متاحة حالياً.</div>';
    return `
        <div class="content-card">
            ${lessons.map(l => `
                <div class="result" onclick="${quizOnly ? `showQuiz('${l.id}')` : `showLesson('${l.id}')`}">
                    <b>${esc(l.title_en)}</b><br>
                    <small>${esc(departmentName(l.department_code))} · المستوى: ${esc(l.level)} · ${l.review_required ? "قيد المراجعة" : "معتمد"}</small>
                </div>
            `).join("")}
        </div>
    `;
}

function showDepartment(code) {
    currentDepartment = code;
    let d = DB.departments.find(x => x.code === code);
    if (!d) return;
    let lessons = DB.lessons.filter(l => l.department_code === code);
    
    pageShell(d.name_en, d.name_ar, `
        <div class="content-card">
            <span class="tag">${esc(code)}</span>
            <h3>موضوعات المنهج (${d.curriculum_topics.length})</h3>
            <div class="topic-list" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0;">
                ${d.curriculum_topics.map(t => `<span class="tag" style="cursor:pointer; background:#edf3f9; color:var(--navy); padding:6px 12px;" onclick="searchTopic('${esc(t).replace(/'/g, "&#39;")}','${code}')">${esc(t)}</span>`).join("")}
            </div>
            <h3 style="margin-top:25px;">الدروس المكتوبة في هذا القسم (${lessons.length})</h3>
            ${lessonList(lessons)}
        </div>
    `);
}

function searchTopic(topic, code) {
    let found = DB.lessons.filter(l => l.department_code === code && l.title_en.toLowerCase().includes(topic.toLowerCase()));
    if (found.length > 0) {
        showLesson(found[0].id);
    } else {
        pageShell(topic, "موضوع ضمن المنهج العلمي.", `
            <div class="content-card">
                <div class="notice">هذا الموضوع موجود في خريطة المنهج التفصيلية للأكاديمية، وسيتم إضافته قريباً بالصياغة الأكاديمية الكاملة.</div>
                <p><b>القسم العلمي:</b> ${esc(departmentName(code))}</p>
                <button class="text-btn" onclick="showDepartment('${code}')">العودة للقسم ←</button>
            </div>
        `);
    }
}

async function showLesson(id) {
    let l = DB.lessons.find(x => x.id === id);
    if (!l) return;
    currentLesson = l;
    
    let p = JSON.parse(localStorage.getItem("alhakim_progress") || "{}");
    p[id] = true;
    localStorage.setItem("alhakim_progress", JSON.stringify(p));

    if (supabaseClient) {
        try {
            let { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                await supabaseClient.from('student_progress').upsert({
                    student_id: user.id,
                    lesson_id: id,
                    completed: true,
                    updated_at: new Date()
                }, { onConflict: 'student_id,lesson_id' });
            }
        } catch (e) {
            console.log("Offline mode sync pending", e);
        }
    }

    let objectivesHTML = "";
    if (Array.isArray(l.learning_objectives)) {
        objectivesHTML = `<ul>${l.learning_objectives.map(o => `<li>${esc(o)}</li>`).join("")}</ul>`;
    } else {
        objectivesHTML = `<p>${esc(l.learning_objectives)}</p>`;
    }

    pageShell(l.title_en, departmentName(l.department_code), `
        <article class="content-card">
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
                <span class="tag">المستوى: ${esc(l.level)}</span>
                <span class="tag">الحالة: ${esc(l.status)}</span>
            </div>
            
            <div class="notice">محتوى علمي معتمد لإدارة علوم البصريات والتدريب السريري — إشراف د. لقمان بابكر الشيخ.</div>
            
            <div style="margin: 15px 0; display:flex; gap:10px; flex-wrap:wrap;">
                <button class="primary" onclick="playAudioText('en')">🔊 الاستماع للشرح بالإنجليزية</button>
                <button class="primary" onclick="playAudioText('ar')" style="background:var(--navy); color:white;">🔊 الاستماع للشرح بالعربية</button>
            </div>

            <h3>Learning Objectives</h3>
            ${objectivesHTML}
            
            <h3>Scientific Content (English)</h3>
            <div class="content-en" id="lessonTextEn">${esc(l.content_en)}</div>
            
            <h3>الشرح باللغة العربية</h3>
            <div class="content-ar" id="lessonTextAr">${esc(l.content_ar)}</div>
            
            <h3>Self-Assessment</h3>
            <button class="primary" onclick="showQuiz('${l.id}')">ابدأ أسئلة وتقييم الدرس ←</button>
            
            <h3 style="margin-top:25px;">Suggested References</h3>
            <ul>${(l.reference_titles || []).map(r => `<li>${esc(r)}</li>`).join("")}</ul>
            
            <div style="margin-top:20px;">
                <button class="text-btn" onclick="showPage('lessons')">← العودة لقائمة الدروس</button>
            </div>
        </article>
    `);
}

function playAudioText(lang) {
    if (!('speechSynthesis' in window)) {
        alert("متصفحك لا يدعم خاصية القراءة الصوتية.");
        return;
    }
    window.speechSynthesis.cancel();
    let textElem = document.getElementById(lang === 'en' ? 'lessonTextEn' : 'lessonTextAr');
    if (!textElem) return;
    let utterance = new SpeechSynthesisUtterance(textElem.innerText);
    utterance.lang = lang === 'en' ? 'en-US' : 'ar-SA';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

function showQuiz(id) {
    let l = DB.lessons.find(x => x.id === id);
    if (!l || !l.self_assessment || l.self_assessment.length === 0) {
        pageShell("اختبار الدرس", "لا توجد أسئلة متوفرة لهذا الدرس حالياً.", `
            <div class="content-card">
                <p>عذراً، هذا الدرس لا يحتوي على بنك أسئلة مرفق حالياً.</p>
                <button class="text-btn" onclick="showLesson('${id}')">العودة للدرس ←</button>
            </div>
        `);
        return;
    }

    pageShell("اختبار وتدريب: " + l.title_en, "أجب عن الأسئلة التالية ثم اضغط لمعرفة التفسير العلمي.", `
        <div class="content-card">
            ${l.self_assessment.map((q, i) => `
                <div class="question" id="q${i}" style="margin-bottom:20px; padding:15px; border:1px solid #e1e8ef; border-radius:10px;">
                    <b>السؤال ${i + 1}: ${esc(q.stem)}</b>
                    <div style="margin-top:10px;">
                        ${(q.options && q.options.length > 0 ? q.options : ["True", "False"]).map(o => `
                            <button class="option" onclick="answerQuestion(${i}, '${esc(o).replace(/'/g, "&#39;")}', '${esc(q.answer).replace(/'/g, "&#39;")}')">${esc(o)}</button>
                        `).join("")}
                    </div>
                    <div class="explanation" hidden style="margin-top:10px; font-weight:bold;"></div>
                    <div class="answer-explain" hidden style="margin-top:5px; color:var(--muted);">${esc(q.explanation || "")}</div>
                </div>
            `).join("")}
            <button class="text-btn" onclick="showLesson('${id}')">← العودة للدرس</button>
        </div>
    `);
}

async function answerQuestion(i, choice, answer) {
    let qElem = document.getElementById("q" + i);
    if (!qElem) return;
    qElem.querySelectorAll(".option").forEach(b => {
        b.disabled = true;
        if (b.textContent.trim() === answer.trim()) {
            b.classList.add("correct");
        } else if (b.textContent.trim() === choice.trim()) {
            b.classList.add("wrong");
        }
    });
    let ex = qElem.querySelector(".explanation");
    let explainText = qElem.querySelector(".answer-explain").textContent;
    if (ex) {
        ex.hidden = false;
        let isCorrect = (choice.trim() === answer.trim());
        ex.style.color = isCorrect ? "#21965a" : "#d44";
        ex.textContent = (isCorrect ? "✓ إجابة صحيحة. " : "✕ إجابة غير صحيحة. الإجابة الصحيحة هي: " + answer + ". ") + explainText;
    }
}

// Enterprise Admin Dashboard with Subscriptions & Courses Management
async function renderAdminDashboard() {
    pageShell("لوحة تحكم المدير العام", "إدارة المنصة، الاشتراكات، ومتابعة الدورات والطلاب المسجلين سحابياً.", `
        <div class="content-card">
            <h3>إحصائيات النظام الحية (Supabase)</h3>
            <div id="adminStats" style="display: flex; gap: 15px; flex-wrap: wrap; margin: 15px 0;">
                <div class="stat" style="flex: 1; min-width: 140px; background: #f4f7fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <b id="statUsers" style="font-size: 24px; color: var(--navy);">...</b><br><small>المستخدمون المسجلون</small>
                </div>
                <div class="stat" style="flex: 1; min-width: 140px; background: #f4f7fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <b id="statProgress" style="font-size: 24px; color: var(--navy);">...</b><br><small>سجلات التقدم</small>
                </div>
                <div class="stat" style="flex: 1; min-width: 140px; background: #f4f7fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <b id="statCerts" style="font-size: 24px; color: var(--navy);">...</b><br><small>الشهادات المُصدرة</small>
                </div>
            </div>

            <div style="margin-top: 25px; padding: 15px; background: #edf3f9; border-radius: 8px;">
                <h3 style="margin-top:0;">إدارة الاشتراكات والدورات (Subscriptions & Courses Management)</h3>
                <p style="font-size: 13px; color: var(--muted);">تفعيل أو تعديل حالة الدورات التدريبية المتاحة للطلاب والاشتراكات السريرية.</p>
                <div id="adminSubsPanel" style="margin-top: 10px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px; background: white;">
                        <thead>
                            <tr style="border-bottom: 2px solid #ddd; background: #fafbfc;">
                                <th style="padding: 8px;">اسم الدورة / البرنامج</th>
                                <th style="padding: 8px;">التصنيف</th>
                                <th style="padding: 8px;">الحالة</th>
                                <th style="padding: 8px;">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 8px;"><b>دبلوم الانكسار السريري المتقدم</b></td>
                                <td style="padding: 8px;">Clinical Refraction</td>
                                <td style="padding: 8px;"><span class="tag" style="background:#21965a; color:white;">نشط / متاح</span></td>
                                <td style="padding: 8px;"><button class="text-btn" onclick="alert('تم تحديث حالة الدورة بنجاح')">تعديل</button></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;"><b>برنامج التدريب العملي في الحول والرؤية المزدوجة</b></td>
                                <td style="padding: 8px;">Binocular Vision</td>
                                <td style="padding: 8px;"><span class="tag" style="background:#21965a; color:white;">نشط / متاح</span></td>
                                <td style="padding: 8px;"><button class="text-btn" onclick="alert('تم تحديث حالة الدورة بنجاح')">تعديل</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="margin-top: 25px; padding: 15px; background: #f4f7fa; border-radius: 8px;">
                <h3 style="margin-top:0;">إضافة درس جديد للمنصة (بالصياغة الأكاديمية)</h3>
                <form id="addLessonForm" onsubmit="handleAddNewLesson(event)" style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" id="newLessonId" placeholder="معرف الدرس (مثل: opt-101)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <select id="newLessonDept" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="">اختر القسم العلمي</option>
                        ${DB.departments.map(d => `<option value="${d.code}">${d.name_ar} (${d.code})</option>`).join("")}
                    </select>
                    <input type="text" id="newLessonTitleEn" placeholder="عنوان الدرس بالإنجليزية (Title EN)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <textarea id="newLessonContentEn" placeholder="المحتوى العلمي بالإنجليزية" rows="3" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    <textarea id="newLessonContentAr" placeholder="الشرح باللغة العربية" rows="3" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    <button type="submit" class="primary" style="align-self: flex-start;">حفظ وإضافة الدرس</button>
                </form>
            </div>
            
            <h3 style="margin-top: 25px;">قائمة الملفات الشخصية المسجلة (Profiles)</h3>
            <div id="adminProfilesList" style="margin-top: 10px; overflow-x: auto;">
                <p>جارٍ جلب البيانات من قاعدة البيانات...</p>
            </div>
            
            <div style="margin-top: 25px;">
                <button class="primary" onclick="renderAdminDashboard()">🔄 تحديث البيانات الحية</button>
            </div>
        </div>
    `);

    if (!supabaseClient) {
        document.getElementById("adminProfilesList").innerHTML = "<div class='notice'>عذراً، الاتصال بقاعدة بيانات Supabase غير مفعل حالياً في المتصفح.</div>";
        return;
    }

    try {
        let { count: usersCount } = await supabaseClient.from('profiles').select('*', { count: 'exact', head: true });
        let { count: progCount } = await supabaseClient.from('student_progress').select('*', { count: 'exact', head: true });
        let { count: certsCount } = await supabaseClient.from('certificates').select('*', { count: 'exact', head: true });

        document.getElementById("statUsers").textContent = usersCount !== null ? usersCount : 0;
        document.getElementById("statProgress").textContent = progCount !== null ? progCount : 0;
        document.getElementById("statCerts").textContent = certsCount !== null ? certsCount : 0;

        let { data: profiles, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false }).limit(20);
        
        let listContainer = document.getElementById("adminProfilesList");
        if (error) {
            listContainer.innerHTML = `<p style="color: red;">خطأ أثناء جلب البيانات: ${esc(error.message)}</p>`;
            return;
        }

        if (!profiles || profiles.length === 0) {
            listContainer.innerHTML = "<p>لا توجد حسابات مسجلة حتى الآن في جدول Profiles.</p>";
            return;
        }

        listContainer.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px;">
                <thead>
                    <tr style="border-bottom: 2px solid #ddd; background: #fafbfc;">
                        <th style="padding: 10px;">الاسم الكامل</th>
                        <th style="padding: 10px;">الدور (Role)</th>
                        <th style="padding: 10px;">التخصص / المؤهل</th>
                        <th style="padding: 10px;">تاريخ الإنشاء</th>
                    </tr>
                </thead>
                <tbody>
                    ${profiles.map(p => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px;"><b>${esc(p.full_name || "بدون اسم")}</b></td>
                            <td style="padding: 10px;"><span class="tag">${esc(p.role || 'student')}</span></td>
                            <td style="padding: 10px;">${esc(p.qualification || "غير مسجل")}</td>
                            <td style="padding: 10px;"><small>${esc(new Date(p.created_at).toLocaleDateString())}</small></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } catch (err) {
        console.error("Admin fetch error:", err);
        document.getElementById("adminProfilesList").innerHTML = "<p style='color: red;'>حدث خطأ غير متوقع أثناء الاتصال بقاعدة البيانات.</p>";
    }
}

function handleAddNewLesson(e) {
    e.preventDefault();
    let newLesson = {
        id: document.getElementById("newLessonId").value.trim(),
        department_code: document.getElementById("newLessonDept").value,
        title_en: document.getElementById("newLessonTitleEn").value.trim(),
        content_en: document.getElementById("newLessonContentEn").value.trim(),
        content_ar: document.getElementById("newLessonContentAr").value.trim(),
        level: "Undergraduate Optometry",
        status: "Approved",
        review_required: false,
        learning_objectives: ["Understand core clinical optics concepts."],
        self_assessment: [],
        reference_titles: ["Alhakim Optics Clinical Guidelines"]
    };

    let localCustomLessons = JSON.parse(localStorage.getItem("alhakim_custom_lessons") || "[]");
    localCustomLessons.push(newLesson);
    localStorage.setItem("alhakim_custom_lessons", JSON.stringify(localCustomLessons));

    DB.lessons.unshift(newLesson);
    alert("تم إضافة الدرس بنجاح إلى المنصة!");
    renderAdminDashboard();
}

function executeSearch() {
    let inputElem = document.getElementById("globalSearch");
    if (!inputElem) return;
    let q = inputElem.value.trim().toLowerCase();
    let box = document.getElementById("searchResults");
    if (!box) return;

    if (!q) {
        box.innerHTML = "";
        return;
    }

    let results = [];
    DB.departments.forEach(d => {
        if ((d.name_en + " " + d.name_ar).toLowerCase().includes(q)) {
            results.push({ label: d.name_en + " — " + d.name_ar, sub: "قسم علمي", action: `showDepartment('${d.code}')` });
        }
        d.curriculum_topics.forEach(t => {
            if (t.toLowerCase().includes(q)) {
                results.push({ label: t, sub: "موضوع منهج في: " + d.name_en, action: `searchTopic('${t.replace(/'/g, "\\'")}','${d.code}')` });
            }
        });
    });

    DB.lessons.forEach(l => {
        if ((l.title_en + " " + l.content_en + " " + l.content_ar).toLowerCase().includes(q)) {
            results.push({ label: l.title_en, sub: "درس مكتوب · " + departmentName(l.department_code), action: `showLesson('${l.id}')` });
        }
    });

    box.innerHTML = results.length > 0 
        ? results.slice(0, 30).map(r => `<div class="result" onclick="${r.action}"><b>${esc(r.label)}</b><br><small>${esc(r.sub)}</small></div>`).join("")
        : "<div class='result'>لا توجد نتائج مطابقة لبحثك.</div>";
}

function setupSearchListeners() {
    let btn = document.getElementById("searchBtn");
    let input = document.getElementById("globalSearch");
    if (btn) btn.onclick = executeSearch;
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") executeSearch();
        });
    }
}

function updateConnectionState() {
    let state = document.getElementById("connectionState");
    if (state) {
        state.textContent = navigator.onLine ? "● متصل" : "● وضع عدم الاتصال";
        state.style.color = navigator.onLine ? "#26804a" : "#d9a52d";
    }
}
window.addEventListener("online", updateConnectionState);
window.addEventListener("offline", updateConnectionState);

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-page]").forEach(b => {
        b.addEventListener("click", () => {
            showPage(b.dataset.page);
            let sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.remove("open");
        });
    });

    document.querySelectorAll("[data-go]").forEach(b => {
        b.addEventListener("click", () => {
            let page = b.dataset.go;
            if (page) showPage(page);
        });
    });

    let menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.onclick = () => {
            let sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.toggle("open");
        };
    }

    let homeLink = document.getElementById("homeLink");
    if (homeLink) {
        homeLink.onclick = (e) => {
            e.preventDefault();
            showPage("home");
        };
    }

    const overlay = document.getElementById("welcomeOverlay");
    const closeWelcome = () => {
        if (overlay) overlay.classList.add("hidden");
        sessionStorage.setItem("alhakim_welcomed", "1");
    };

    if (sessionStorage.getItem("alhakim_welcomed")) {
        if (overlay) overlay.classList.add("hidden");
    }

    let welcomeStart = document.getElementById("welcomeStart");
    let welcomeClose = document.getElementById("welcomeClose");
    if (welcomeStart) welcomeStart.onclick = closeWelcome;
    if (welcomeClose) welcomeClose.onclick = closeWelcome;

    updateConnectionState();
    loadContent();

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").catch(err => console.log("SW registration failed: ", err));
        });
    }
});
