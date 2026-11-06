/**
 * HAKIM OPTICS ACADEMY - Main Application Script
 * Developer / Founder: Dr. Logman Babiker Elsheikh Mohamed
 * Version: 3.0 (Supabase & GitHub Pages Integration)
 */

// تهيئة اتصال Supabase باستخدام المفتاح العام المعتمد
const SUPABASE_URL = "https://your-supabase-project.supabase.co"; // استبدل برابط مشروعك الفعلي عند الحاجة
const SUPABASE_ANON_KEY = "Sb_publishable_k0VCQgULXGy_qnjvfyQkjg_M9x43HVc";
let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let DB = null;
let currentDepartment = null;
let currentLesson = null;
const CONTENT_URL = "./HAKIM_OPTICS_ACADEMY_COMPLETE_CONTENT_MASTER_v1.json";
const main = document.getElementById("main");

// Helper to escape HTML and prevent XSS
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Load JSON Content Master from Root
async function loadContent() {
    try {
        let response = await fetch(CONTENT_URL);
        if (!response.ok) throw new Error("HTTP error! status: " + response.status);
        DB = await response.json();
        localStorage.setItem("alhakim_content_cache", JSON.stringify(DB));
    } catch (error) {
        let saved = localStorage.getItem("alhakim_content_cache");
        if (saved) {
            DB = JSON.parse(saved);
        } else {
            throw error;
        }
    }
    renderHome();
}

function departmentName(code) {
    if (!DB || !DB.departments) return code;
    let dept = DB.departments.find(d => d.code === code);
    return dept ? (dept.name_ar + " (" + dept.name_en + ")") : code;
}

// Render Home Page dynamically
function renderHome() {
    if (!DB) return;
    const feat = document.getElementById("featuredDepartments");
    if (feat) {
        feat.innerHTML = DB.departments.slice(0, 6).map((d, i) => `
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
            <div class="stat"><b>${DB.department_count || DB.departments.length}</b><small>قسم علمي</small></div>
            <div class="stat"><b>${DB.curriculum_topic_count || 231}</b><small>موضوعاً في المنهج</small></div>
            <div class="stat"><b>${DB.lessons.length}</b><small>درساً مكتوباً حالياً</small></div>
        `;
    }
}

// Page Shell wrapper for consistent design
function pageShell(title, desc, body) {
    main.innerHTML = `
        <div class="section-heading">
            <div>
                <span class="eyebrow">ALHAKIM OPTICS ACADEMY</span>
                <h2>${esc(title)}</h2>
                <p>${esc(desc || "")}</p>
            </div>
            <button class="text-btn" onclick="renderHome()">الرئيسية ←</button>
        </div>
        ${body}
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Router & Page Switcher
function showPage(page) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
    
    if (page === "home") {
        main.innerHTML = `
            <section class="hero">
                <div class="hero-copy">
                    <span class="eyebrow">INTERACTIVE OPTOMETRY LEARNING</span>
                    <h1>مرحباً بك في<br><em>Alhakim Optics Academy</em></h1>
                    <p>منصة تعليمية متخصصة لعلوم البصريات، تجمع المنهج العلمي والدروس والاختبارات والتدريب السريري في مساحة واحدة.</p>
                    <button class="primary" data-go="departments" onclick="showPage('departments')">استكشف الأقسام العلمية ←</button>
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
                    <div><span class="eyebrow">LEARNING AREAS</span><h2>الأقسام العلمية</h2></div>
                    <button class="text-btn" onclick="showPage('departments')">عرض الكل ←</button>
                </div>
                <div id="featuredDepartments" class="department-grid"><p>جارٍ تحميل المنهج...</p></div>
            </section>
            <section class="stats" id="stats"></section>
        `;
        renderHome();
        setupSearchListeners();
        return;
    }

    if (!DB) return;

    if (page === "departments") {
        pageShell("الأقسام العلمية", "اختر قسماً لاستعراض موضوعاته ومناهجه التفصيلية.", `
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
        pageShell("الدروس المكتوبة", "الدروس المتاحة حالياً. جميع الدروس تحمل حالة مسودة حتى إتمام المراجعة العلمية.", lessonList(DB.lessons));
    } else if (page === "permanent") {
        pageShell("تدريب الأسئلة وبنك الاختبارات", "تدرب على أسئلة التقييم الذاتي المرتبطة بالدروس المتاحة لتعزيز فهمك الإكلينيكي.", `
            <div class="notice">هذه نسخة أولية من بنك الأسئلة؛ عدد الأسئلة محدود بما هو موجود في الدروس المكتوبة حالياً.</div>
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
        pageShell("تقدمي الدراسي", "يُحفظ تقدمك ودروسك المفتوحة على هذا الجهاز محلياً (ومزامنتها سحابياً).", `
            <div class="content-card">
                <h3>الدروس التي فتحتها واستعرضتها: ${openedKeys.length} من ${DB.lessons.length}</h3>
                <p>${openedKeys.map(id => esc(DB.lessons.find(l => l.id === id)?.title_en || id)).join("، ") || "لم تبدأ استعراض أي درس بعد."}</p>
                <br>
                <button class="primary" onclick="localStorage.removeItem('alhakim_progress');showPage('progress')">مسح سجل هذا الجهاز</button>
            </div>
        `);
    }
}

// Generate Lesson Lists HTML
function lessonList(lessons, quizOnly = false) {
    if (!lessons || lessons.length === 0) return '<div class="content-card">لا توجد دروس متاحة حالياً في هذا القسم.</div>';
    return `
        <div class="content-card">
            ${lessons.map(l => `
                <div class="result" onclick="${quizOnly ? `showQuiz('${l.id}')` : `showLesson('${l.id}')`}">
                    <b>${esc(l.title_en)}</b><br>
                    <small>${esc(departmentName(l.department_code))} · المستوى: ${esc(l.level)} · ${l.review_required ? "مسودة للمراجعة العلمية" : "معتمد"}</small>
                </div>
            `).join("")}
        </div>
    `;
}

// Show Department Details & Topics
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

// Search Topic Action
function searchTopic(topic, code) {
    let found = DB.lessons.filter(l => l.department_code === code && l.title_en.toLowerCase().includes(topic.toLowerCase()));
    if (found.length > 0) {
        showLesson(found[0].id);
    } else {
        pageShell(topic, "موضوع ضمن المنهج العلمي.", `
            <div class="content-card">
                <div class="notice">هذا الموضوع موجود في خريطة المنهج التفصيلية للأكاديمية، لكن لم يُكتب له درس تفصيلي مستقل بعد في هذه النسخة.</div>
                <p><b>القسم العلمي:</b> ${esc(departmentName(code))}</p>
                <button class="text-btn" onclick="showDepartment('${code}')">العودة للقسم ←</button>
            </div>
        `);
    }
}

// Show Specific Lesson Content with Audio TTS support & Supabase Sync
async function showLesson(id) {
    let l = DB.lessons.find(x => x.id === id);
    if (!l) return;
    currentLesson = l;
    
    let p = JSON.parse(localStorage.getItem("alhakim_progress") || "{}");
    p[id] = true;
    localStorage.setItem("alhakim_progress", JSON.stringify(p));

    // مزامنة التقدم سحابياً إذا كان Supabase متاحاً والمتصل مسجلاً
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
            console.log("Offline or sync pending", e);
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
            
            <div class="notice">مسودة تعليمية تتطلب مراجعة علمية والتحقق من المراجع قبل الاعتماد السريري أو النشر النهائي.</div>
            
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
            <ul>${l.reference_titles.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
            
            <div style="margin-top:20px;">
                <button class="text-btn" onclick="showPage('lessons')">← العودة لقائمة الدروس</button>
            </div>
        </article>
    `);
}

// Text-to-Speech Helper Function
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

// Show Quiz & Interactive Assessment
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

// Answer Evaluation
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

// Global Search Logic
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

// Network Online/Offline Status Indicator
function updateConnectionState() {
    let state = document.getElementById("connectionState");
    if (state) {
        state.textContent = navigator.onLine ? "● متصل" : "● وضع عدم الاتصال";
        state.style.color = navigator.onLine ? "#26804a" : "#d9a52d";
    }
}
window.addEventListener("online", updateConnectionState);
window.addEventListener("offline", updateConnectionState);

// Event Listeners for Navigation & Welcome Overlay
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

    // Welcome Overlay Robust Handlers
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
    loadContent().catch(err => {
        console.error(err);
        if (main) {
            main.innerHTML = '<div class="content-card"><h2>تعذر تحميل المحتوى العلمي</h2><p>تأكد من وجود ملف JSON في المجلد الرئيسي ثم أعد تحميل الصفحة.</p></div>';
        }
    });

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").catch(err => console.log("SW registration failed: ", err));
        });
    }
});
