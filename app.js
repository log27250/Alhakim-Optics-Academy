/**
 * HAKIM OPTICS ACADEMY
 * Main Application Script
 * Version 7.0 - Supabase Connected Architecture
 */

"use strict";

/* =========================================================
   1. SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL = "https://upmluemrhkadcffcsuzt.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_k0VCQgULXGy_qnjvfyQkjg_M9x43HVc";

let supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === "function") {
    try {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    } catch (error) {
        console.error("Supabase initialization error:", error);
    }
}

/* =========================================================
   2. APPLICATION STATE
========================================================= */

let currentDepartment = null;
let currentLesson = null;

let currentUser = null;
let isAcademyAdmin = false;

let connectionStatus = "checking";
let remoteContentLoaded = false;

const main = document.getElementById("main");

/* =========================================================
   3. SAFE HELPERS
========================================================= */

const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

function safeJSON(key, fallback = {}) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn("Local storage parsing error:", error);
        return fallback;
    }
}

function saveLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Local storage save error:", error);
    }
}

function notify(message) {
    alert(message);
}

/* =========================================================
   4. LOCAL FALLBACK CONTENT
   These departments are fallback navigation data.
   They are not automatically treated as approved content.
========================================================= */

const FALLBACK_DEPARTMENTS = [
    {
        code: "ANP",
        name_ar: "تشريح ووظائف أعضاء العين",
        name_en: "Ocular Anatomy and Physiology",
        curriculum_topics: [
            "Anatomy of the Eye",
            "Cornea",
            "Crystalline Lens",
            "Retina",
            "Visual Pathway"
        ]
    },
    {
        code: "GEO",
        name_ar: "البصريات الهندسية والفيزيائية",
        name_en: "Geometrical and Physical Optics",
        curriculum_topics: [
            "Light",
            "Reflection",
            "Refraction",
            "Prisms",
            "Optical Aberrations"
        ]
    },
    {
        code: "VIS",
        name_ar: "علوم الرؤية",
        name_en: "Vision Science",
        curriculum_topics: [
            "Visual Acuity",
            "Visual Perception",
            "Contrast Sensitivity",
            "Color Vision",
            "Visual Development"
        ]
    },
    {
        code: "REF",
        name_ar: "الانكسار السريري",
        name_en: "Clinical Refraction",
        curriculum_topics: [
            "Emmetropia",
            "Myopia",
            "Hypermetropia",
            "Astigmatism",
            "Presbyopia",
            "Retinoscopy",
            "Subjective Refraction"
        ]
    },
    {
        code: "BV",
        name_ar: "الرؤية الثنائية والحول",
        name_en: "Binocular Vision and Strabismus",
        curriculum_topics: [
            "Heterophoria",
            "Strabismus",
            "Vergence",
            "Accommodation",
            "Stereopsis",
            "Amblyopia"
        ]
    },
    {
        code: "CL",
        name_ar: "العدسات اللاصقة",
        name_en: "Contact Lenses",
        curriculum_topics: [
            "Soft Contact Lenses",
            "Rigid Gas Permeable Lenses",
            "Toric Contact Lenses",
            "Keratoconus",
            "Contact Lens Complications"
        ]
    },
    {
        code: "PED",
        name_ar: "بصريات الأطفال",
        name_en: "Pediatric Optometry",
        curriculum_topics: [
            "Pediatric Eye Examination",
            "Refractive Errors in Children",
            "Amblyopia",
            "Childhood Strabismus"
        ]
    },
    {
        code: "OD",
        name_ar: "أمراض العين",
        name_en: "Ocular Disease",
        curriculum_topics: [
            "Glaucoma",
            "Cataract",
            "Retinal Diseases",
            "Corneal Diseases",
            "Uveitis"
        ]
    },
    {
        code: "EPH",
        name_ar: "الصيدلة العينية",
        name_en: "Ocular Pharmacology",
        curriculum_topics: [
            "Mydriatics",
            "Cycloplegics",
            "Anti-glaucoma Drugs",
            "Ocular Antibiotics"
        ]
    },
    {
        code: "LV",
        name_ar: "ضعف البصر وإعادة التأهيل",
        name_en: "Low Vision and Rehabilitation",
        curriculum_topics: [
            "Low Vision Assessment",
            "Magnification",
            "Low Vision Devices",
            "Visual Rehabilitation"
        ]
    },
    {
        code: "DO",
        name_ar: "أجهزة البصريات والتشخيص",
        name_en: "Diagnostic Optometry",
        curriculum_topics: [
            "Autorefractometry",
            "OCT",
            "Visual Field Testing",
            "Corneal Topography",
            "Pachymetry"
        ]
    },
    {
        code: "CO",
        name_ar: "البصريات المجتمعية",
        name_en: "Community Optometry",
        curriculum_topics: [
            "Community Eye Health",
            "Vision Screening",
            "Public Health",
            "Preventable Blindness"
        ]
    }
];

/* =========================================================
   5. MAIN DATABASE OBJECT
========================================================= */

let DB = {
    academy_name: "Alhakim Optics Academy",

    founder: "Dr. Logman Babiker Elsheikh Mohamed",

    department_count: 12,

    curriculum_topic_count: 231,

    departments: FALLBACK_DEPARTMENTS.map(department => ({
        ...department,
        topics: []
    })),

    lessons: [],

    reference_catalog: [],

    questions: []
};

/* =========================================================
   6. CONNECTION STATUS
========================================================= */

function updateConnectionState() {

    const state = document.getElementById("connectionState");

    if (!navigator.onLine) {

        connectionStatus = "offline";

    } else if (supabaseClient && remoteContentLoaded) {

        connectionStatus = "connected";

    } else if (supabaseClient) {

        connectionStatus = "connecting";

    } else {

        connectionStatus = "unavailable";
    }

    if (!state) return;

    const labels = {
        connected: "● متصل بقاعدة البيانات",
        connecting: "● جارٍ الاتصال...",
        offline: "● وضع عدم الاتصال",
        unavailable: "● الاتصال السحابي غير متاح",
        checking: "● جارٍ الفحص..."
    };

    state.textContent = labels[connectionStatus] || labels.checking;

    state.style.color =
        connectionStatus === "connected" ? "#26804a" :
        connectionStatus === "offline" ? "#d9a52d" :
        "#777";
}

window.addEventListener("online", () => {
    updateConnectionState();
    loadContent();
});

window.addEventListener("offline", updateConnectionState);

/* =========================================================
   7. SUPABASE CONNECTION TEST
========================================================= */

async function testSupabaseConnection() {

    if (!supabaseClient) {
        return {
            connected: false,
            error: "Supabase client is unavailable."
        };
    }

    try {

        const { error } = await supabaseClient
            .from("departments")
            .select("id")
            .limit(1);

        if (error) {
            return {
                connected: false,
                error: error.message
            };
        }

        return {
            connected: true,
            error: null
        };

    } catch (error) {

        return {
            connected: false,
            error: error.message
        };
    }
}

/* =========================================================
   8. LOAD DEPARTMENTS
========================================================= */

async function loadDepartments() {

    const { data, error } = await supabaseClient
        .from("departments")
        .select(`
            id,
            code,
            name_en,
            name_ar,
            description_en,
            description_ar,
            display_order,
            is_published
        `)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return false;
    }

    DB.departments = data.map(department => {

        const fallback = FALLBACK_DEPARTMENTS.find(
            item => item.code === department.code
        );

        return {
            id: department.id,
            code: department.code,

            name_en: department.name_en,
            name_ar: department.name_ar,

            description_en: department.description_en,
            description_ar: department.description_ar,

            display_order: department.display_order,

            curriculum_topics:
                fallback ? fallback.curriculum_topics : [],

            topics: []
        };
    });

    return true;
}

/* =========================================================
   9. LOAD TOPICS
========================================================= */

async function loadTopics() {

    const { data, error } = await supabaseClient
        .from("topics")
        .select(`
            id,
            department_id,
            code,
            title_en,
            title_ar,
            description_en,
            description_ar,
            display_order,
            is_published
        `)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

    if (error) {
        throw error;
    }

    if (!data) return;

    DB.departments.forEach(department => {

        department.topics = data.filter(
            topic => topic.department_id === department.id
        );
    });
}

/* =========================================================
   10. LOAD PUBLISHED LESSONS
========================================================= */

async function loadLessons() {

    const { data, error } = await supabaseClient
        .from("lessons")
        .select(`
            id,
            topic_id,
            code,
            title_en,
            title_ar,
            level,
            content_en,
            content_ar,
            learning_objectives,
            status,
            is_free,
            display_order,
            created_at,
            updated_at
        `)
        .eq("status", "published")
        .eq("is_free", true)
        .order("display_order", { ascending: true });

    if (error) {
        throw error;
    }

    if (!data) return;

    DB.lessons = data.map(lesson => {

        let department = DB.departments.find(d =>
            d.topics.some(t => t.id === lesson.topic_id)
        );

        const topic = department
            ? department.topics.find(t => t.id === lesson.topic_id)
            : null;

        return {

            id: lesson.id,

            code: lesson.code,

            topic_id: lesson.topic_id,

            topic_title_en: topic?.title_en || "",

            topic_title_ar: topic?.title_ar || "",

            department_code: department?.code || "",

            title_en: lesson.title_en,

            title_ar: lesson.title_ar,

            level: lesson.level || "Undergraduate Optometry",

            status: lesson.status,

            review_required: false,

            learning_objectives:
                lesson.learning_objectives || [],

            content_en: lesson.content_en || "",

            content_ar: lesson.content_ar || "",

            display_order: lesson.display_order,

            self_assessment: [],

            reference_titles: []
        };
    });
}

/* =========================================================
   11. LOAD REFERENCES
========================================================= */

async function loadReferences() {

    const { data, error } = await supabaseClient
        .from("references")
        .select(`
            id,
            title,
            authors,
            publication_year,
            publisher,
            url
        `)
        .order("title", { ascending: true });

    if (error) {
        throw error;
    }

    DB.reference_catalog = data || [];
}

/* =========================================================
   12. LOCAL CONTENT
========================================================= */

function loadLocalContent() {

    const localLessons = safeJSON(
        "alhakim_custom_lessons",
        []
    );

    if (!Array.isArray(localLessons)) return;

    localLessons.forEach(localLesson => {

        const exists = DB.lessons.some(
            lesson => String(lesson.id) === String(localLesson.id)
        );

        if (!exists) {

            DB.lessons.push({
                ...localLesson,

                status: localLesson.status || "draft",

                review_required: true,

                source: "local"
            });
        }
    });
}

/* =========================================================
   13. LOAD APPLICATION CONTENT
========================================================= */

async function loadContent() {

    updateConnectionState();

    if (supabaseClient && navigator.onLine) {

        const connection = await testSupabaseConnection();

        if (connection.connected) {

            try {

                await loadDepartments();

                await loadTopics();

                await loadLessons();

                await loadReferences();

                remoteContentLoaded = true;

                console.log("Academy content loaded from Supabase.");

            } catch (error) {

                console.error(
                    "Supabase content loading error:",
                    error
                );

                remoteContentLoaded = false;
            }

        } else {

            remoteContentLoaded = false;

            console.warn(
                "Supabase connection failed:",
                connection.error
            );
        }
    }

    loadLocalContent();

    updateConnectionState();

    renderHome();
}

/* =========================================================
   14. DEPARTMENT HELPERS
========================================================= */

function departmentName(code) {

    const department = DB.departments.find(
        d => d.code === code
    );

    if (!department) return code || "";

    return `${department.name_ar} (${department.name_en})`;
}

function getDepartmentTopics(department) {

    if (department.topics && department.topics.length) {

        return department.topics;
    }

    return (department.curriculum_topics || []).map(
        (title, index) => ({
            id: null,
            title_en: title,
            title_ar: "",
            display_order: index
        })
    );
}

/* =========================================================
   15. HOME PAGE
========================================================= */

function renderHome() {

    if (!main) return;

    main.innerHTML = `

        <section class="hero">

            <div class="hero-copy">

                <span class="eyebrow">
                    INTERACTIVE OPTOMETRY LEARNING
                </span>

                <h1>
                    مرحباً بك في
                    <br>
                    <em>Alhakim Optics Academy</em>
                </h1>

                <p>
                    منصة تعليمية متخصصة لعلوم البصريات،
                    تجمع المنهج العلمي والدروس والاختبارات
                    والتدريب السريري في مساحة واحدة.
                </p>

                <button class="primary"
                    onclick="showPage('departments')">

                    استكشف الأقسام العلمية ←

                </button>

                <div class="founder-line">

                    تأسيس وإشراف:
                    <b>د. لقمان بابكر الشيخ</b>

                    <small>
                        بكالوريوس علوم البصريات
                        — جامعة غرب كردفان
                    </small>

                </div>

            </div>

            <div class="hero-logo">

                <img src="./alhakim-logo.png"
                     alt="Alhakim Optics Academy">

            </div>

        </section>


        <section class="search-panel">

            <div>

                <span class="eyebrow">
                    ACADEMY SEARCH
                </span>

                <h2>
                    ماذا تريد أن تتعلم اليوم؟
                </h2>

                <p>
                    ابحث بالإنجليزية أو العربية
                    في الأقسام والموضوعات والدروس المتاحة.
                </p>

            </div>

            <div class="search-box">

                <input
                    id="globalSearch"
                    placeholder="مثال: Myopia أو Retinoscopy أو قصر النظر"
                    autocomplete="off">

                <button id="searchBtn">
                    بحث
                </button>

            </div>

            <div id="searchResults"
                 class="search-results">
            </div>

        </section>


        <section class="section">

            <div class="section-heading">

                <div>

                    <span class="eyebrow">
                        LEARNING AREAS
                    </span>

                    <h2>
                        الأقسام العلمية
                    </h2>

                </div>

                <button class="text-btn"
                    onclick="showPage('departments')">

                    عرض الكل ←

                </button>

            </div>

            <div id="featuredDepartments"
                 class="department-grid">
            </div>

        </section>


        <section class="stats"
                 id="stats">
        </section>

    `;

    const featured = document.getElementById(
        "featuredDepartments"
    );

    if (featured) {

        featured.innerHTML = DB.departments.map(
            (department, index) => {

                const topics = getDepartmentTopics(department);

                return `

                    <article class="dept-card"
                        onclick="showDepartment('${esc(department.code)}')">

                        <div class="dept-num">

                            DEPARTMENT
                            ${String(index + 1).padStart(2, "0")}
                            · ${esc(department.code)}

                        </div>

                        <h3>
                            ${esc(department.name_en)}
                        </h3>

                        <p>
                            ${esc(department.name_ar)}
                        </p>

                        <small>
                            ${topics.length} موضوعاً
                        </small>

                    </article>

                `;

            }
        ).join("");
    }

    const stats = document.getElementById("stats");

    if (stats) {

        const topicCount = DB.departments.reduce(
            (total, department) =>
                total + getDepartmentTopics(department).length,
            0
        );

        stats.innerHTML = `

            <div class="stat">

                <b>${DB.departments.length}</b>

                <small>
                    قسماً علمياً
                </small>

            </div>

            <div class="stat">

                <b>${topicCount || DB.curriculum_topic_count}</b>

                <small>
                    موضوعاً في خريطة المنهج
                </small>

            </div>

            <div class="stat">

                <b>${DB.lessons.length}</b>

                <small>
                    درساً متاحاً
                </small>

            </div>

        `;
    }

    setupSearchListeners();
}

/* =========================================================
   16. PAGE SHELL
========================================================= */

function pageShell(title, description, body) {

    if (!main) return;

    main.innerHTML = `

        <div class="section-heading">

            <div>

                <span class="eyebrow">
                    ALHAKIM OPTICS ACADEMY
                </span>

                <h2>${esc(title)}</h2>

                <p>${esc(description || "")}</p>

            </div>

            <button class="text-btn"
                onclick="showPage('home')">

                الرئيسية ←

            </button>

        </div>

        ${body}

    `;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   17. PAGE NAVIGATION
========================================================= */

function showPage(page) {

    document.querySelectorAll(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });

    if (page === "home") {

        renderHome();
        return;
    }

    if (page === "departments") {

        pageShell(
            "الأقسام العلمية",
            "استعرض التخصصات والأقسام العلمية في أكاديمية الحكيم.",
            `

                <div class="department-grid">

                    ${DB.departments.map(
                        department => `

                            <article class="dept-card"
                                onclick="showDepartment('${esc(department.code)}')">

                                <div class="dept-num">
                                    ${esc(department.code)}
                                </div>

                                <h3>
                                    ${esc(department.name_en)}
                                </h3>

                                <p>
                                    ${esc(department.name_ar)}
                                </p>

                                <small>
                                    ${getDepartmentTopics(department).length}
                                    موضوعاً
                                </small>

                            </article>

                        `
                    ).join("")}

                </div>

            `
        );

    }

    else if (page === "lessons") {

        pageShell(
            "الدروس المكتوبة",
            "الدروس المنشورة والمتاحة للقراءة في الأكاديمية.",
            lessonList(DB.lessons)
        );

    }

    else if (page === "permanent") {

        pageShell(
            "بنك الأسئلة والتدريب",
            "مساحة التدريب والتقييم في علوم البصريات.",
            `

                <div class="notice">

                    بنك الأسئلة المستقل قيد التجهيز والربط.
                    ستظهر الأسئلة المنشورة عندما يتم تفعيل
                    واجهة بنك الأسئلة وصلاحيات قراءتها.

                </div>

            `
        );

    }

    else if (page === "library") {

        renderLibrary();

    }

    else if (page === "progress") {

        renderProgress();

    }

    else if (page === "admin") {

        renderAdminDashboard();

    }
}

/* =========================================================
   18. LESSON LIST
========================================================= */

function lessonList(lessons) {

    if (!lessons || lessons.length === 0) {

        return `

            <div class="content-card">

                لا توجد دروس منشورة متاحة حالياً.

            </div>

        `;
    }

    return `

        <div class="content-card">

            ${lessons.map(lesson => `

                <div class="result"
                    onclick="showLesson('${esc(lesson.id)}')">

                    <b>
                        ${esc(lesson.title_en)}
                    </b>

                    <br>

                    <small>

                        ${esc(departmentName(lesson.department_code))}

                        ·

                        ${esc(lesson.level || "Optometry")}

                    </small>

                </div>

            `).join("")}

        </div>

    `;
}

/* =========================================================
   19. DEPARTMENT PAGE
========================================================= */

function showDepartment(code) {

    currentDepartment = code;

    const department = DB.departments.find(
        item => item.code === code
    );

    if (!department) return;

    const topics = getDepartmentTopics(department);

    const lessons = DB.lessons.filter(
        lesson => lesson.department_code === code
    );

    pageShell(
        department.name_en,
        department.name_ar,
        `

            <div class="content-card">

                <span class="tag">
                    ${esc(code)}
                </span>

                <h3>
                    موضوعات المنهج (${topics.length})
                </h3>

                <div class="topic-list"
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                        margin:15px 0;
                    ">

                    ${topics.map(topic => {

                        const title =
                            topic.title_en ||
                            topic.title_ar ||
                            "";

                        return `

                            <span class="tag"
                                style="
                                    cursor:pointer;
                                    background:#edf3f9;
                                    color:var(--navy);
                                    padding:6px 12px;
                                "
                                onclick="searchTopic('${esc(title)}','${esc(code)}')">

                                ${esc(title)}

                            </span>

                        `;

                    }).join("")}

                </div>

                <h3 style="margin-top:25px;">

                    الدروس المنشورة (${lessons.length})

                </h3>

                ${lessonList(lessons)}

            </div>

        `
    );
}

/* =========================================================
   20. TOPIC SEARCH
========================================================= */

function searchTopic(topic, code) {

    const department = DB.departments.find(
        item => item.code === code
    );

    if (!department) return;

    const found = DB.lessons.filter(lesson => {

        const title = (
            lesson.title_en + " " +
            lesson.title_ar + " " +
            lesson.topic_title_en + " " +
            lesson.topic_title_ar
        ).toLowerCase();

        return (
            lesson.department_code === code &&
            title.includes(String(topic).toLowerCase())
        );
    });

    if (found.length > 0) {

        showLesson(found[0].id);
        return;
    }

    pageShell(
        topic,
        "موضوع ضمن المنهج العلمي.",
        `

            <div class="content-card">

                <div class="notice">

                    هذا الموضوع موجود ضمن خريطة المنهج،
                    ولا توجد له محاضرة منشورة متاحة حالياً.

                </div>

                <p>

                    <b>القسم العلمي:</b>

                    ${esc(departmentName(code))}

                </p>

                <button class="text-btn"
                    onclick="showDepartment('${esc(code)}')">

                    العودة للقسم ←

                </button>

            </div>

        `
    );
}

/* =========================================================
   21. LESSON VIEW
========================================================= */

async function showLesson(id) {

    const lesson = DB.lessons.find(
        item => String(item.id) === String(id)
    );

    if (!lesson) return;

    currentLesson = lesson;

    const progress = safeJSON(
        "alhakim_progress",
        {}
    );

    progress[id] = true;

    saveLocal(
        "alhakim_progress",
        progress
    );

    let objectivesHTML = "";

    if (Array.isArray(lesson.learning_objectives)) {

        objectivesHTML = `

            <ul>

                ${lesson.learning_objectives.map(
                    objective => `
                        <li>${esc(objective)}</li>
                    `
                ).join("")}

            </ul>

        `;

    } else {

        objectivesHTML = `
            <p>${esc(lesson.learning_objectives)}</p>
        `;
    }

    const references = lesson.reference_titles || [];

    pageShell(
        lesson.title_en,
        departmentName(lesson.department_code),
        `

            <article class="content-card">

                <div style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-bottom:12px;
                ">

                    <span class="tag">

                        المستوى:
                        ${esc(lesson.level)}

                    </span>

                    <span class="tag">

                        الحالة:
                        ${esc(lesson.status)}

                    </span>

                </div>


                ${lesson.review_required ? `

                    <div class="notice">

                        هذا المحتوى المحلي قيد المراجعة العلمية،
                        ولم يحصل على اعتماد علمي نهائي.

                    </div>

                ` : `

                    <div class="notice">

                        محتوى منشور في المنصة.

                    </div>

                `}


                <div style="
                    margin:15px 0;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                ">

                    <button class="primary"
                        onclick="playAudioText('en')">

                        🔊 الاستماع بالإنجليزية

                    </button>

                    <button class="primary"
                        onclick="playAudioText('ar')"
                        style="background:var(--navy);color:white;">

                        🔊 الاستماع بالعربية

                    </button>

                </div>


                <h3>
                    Learning Objectives
                </h3>

                ${objectivesHTML}


                <h3>
                    Scientific Content (English)
                </h3>

                <div class="content-en"
                    id="lessonTextEn">

                    ${esc(lesson.content_en)}

                </div>


                <h3>
                    الشرح باللغة العربية
                </h3>

                <div class="content-ar"
                    id="lessonTextAr">

                    ${esc(lesson.content_ar)}

                </div>


                <h3>
                    Self-Assessment
                </h3>

                <button class="primary"
                    onclick="showQuiz('${esc(lesson.id)}')">

                    ابدأ التقييم الذاتي ←

                </button>


                <h3 style="margin-top:25px;">

                    Suggested References

                </h3>

                <ul>

                    ${references.map(reference => `
                        <li>${esc(reference)}</li>
                    `).join("")}

                </ul>


                <div style="margin-top:20px;">

                    <button class="text-btn"
                        onclick="showPage('lessons')">

                        ← العودة لقائمة الدروس

                    </button>

                </div>

            </article>

        `
    );
}

/* =========================================================
   22. AUDIO READER
========================================================= */

function playAudioText(lang) {

    if (!("speechSynthesis" in window)) {

        notify("متصفحك لا يدعم القراءة الصوتية.");

        return;
    }

    const textElement = document.getElementById(
        lang === "en" ? "lessonTextEn" : "lessonTextAr"
    );

    if (!textElement) return;

    const text = textElement.innerText.trim();

    if (!text) {

        notify("لا يوجد محتوى صوتي في هذه اللغة.");

        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = lang === "en" ? "en-US" : "ar-SA";

    utterance.rate = 0.95;

    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

function stopAudio() {

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

    }
}

/* =========================================================
   23. LOCAL SELF-ASSESSMENT
========================================================= */

function showQuiz(id) {

    const lesson = DB.lessons.find(
        item => String(item.id) === String(id)
    );

    if (
        !lesson ||
        !lesson.self_assessment ||
        lesson.self_assessment.length === 0
    ) {

        pageShell(
            "اختبار الدرس",
            "الأسئلة غير متاحة حالياً.",
            `

                <div class="content-card">

                    <p>

                        لا توجد أسئلة تقييم ذاتي مرفقة
                        بهذا الدرس حالياً.

                    </p>

                    <button class="text-btn"
                        onclick="showLesson('${esc(id)}')">

                        العودة للدرس ←

                    </button>

                </div>

            `
        );

        return;
    }

    pageShell(
        "اختبار وتدريب: " + lesson.title_en,
        "أجب عن الأسئلة التالية.",
        `

            <div class="content-card">

                ${lesson.self_assessment.map((question, index) => `

                    <div class="question"
                        id="q${index}"
                        style="
                            margin-bottom:20px;
                            padding:15px;
                            border:1px solid #e1e8ef;
                            border-radius:10px;
                        ">

                        <b>

                            السؤال ${index + 1}:

                            ${esc(question.stem)}

                        </b>

                        <div style="margin-top:10px;">

                            ${(question.options || []).map(option => `

                                <button class="option"
                                    data-answer="${esc(option)}"
                                    onclick="answerQuestion(${index}, this)">

                                    ${esc(option)}

                                </button>

                            `).join("")}

                        </div>

                        <div class="explanation"
                            hidden
                            style="margin-top:10px;font-weight:bold;">
                        </div>

                        <div class="answer-explain"
                            hidden
                            style="margin-top:5px;color:var(--muted);">

                            ${esc(question.explanation || "")}

                        </div>

                    </div>

                `).join("")}

                <button class="text-btn"
                    onclick="showLesson('${esc(id)}')">

                    ← العودة للدرس

                </button>

            </div>

        `
    );
}

function answerQuestion(index, button) {

    const questionElement = document.getElementById(
        "q" + index
    );

    if (!questionElement || button.disabled) return;

    const lesson = currentLesson;

    if (!lesson) return;

    const question = lesson.self_assessment[index];

    if (!question) return;

    const selected = button.dataset.answer;

    const correct = question.answer;

    questionElement.querySelectorAll(".option").forEach(
        optionButton => {

            optionButton.disabled = true;

            if (optionButton.dataset.answer === correct) {

                optionButton.classList.add("correct");

            } else if (
                optionButton.dataset.answer === selected
            ) {

                optionButton.classList.add("wrong");

            }
        }
    );

    const explanation = questionElement.querySelector(
        ".explanation"
    );

    const explanationText = questionElement.querySelector(
        ".answer-explain"
    );

    const isCorrect = selected === correct;

    explanation.hidden = false;

    explanation.style.color = isCorrect ? "#21965a" : "#d44";

    explanation.textContent = isCorrect
        ? "✓ إجابة صحيحة."
        : "✕ إجابة غير صحيحة. الإجابة الصحيحة: " + correct;

    explanation.textContent += " " + (
        explanationText?.textContent || ""
    );
}

/* =========================================================
   24. LIBRARY
========================================================= */

function renderLibrary() {

    const references = DB.reference_catalog || [];

    if (!references.length) {

        pageShell(
            "المكتبة العلمية",
            "المراجع العلمية والتوثيق الأكاديمي.",
            `

                <div class="content-card">

                    لا توجد مراجع مسجلة في قاعدة البيانات حالياً.

                </div>

            `
        );

        return;
    }

    pageShell(
        "المكتبة العلمية",
        "المراجع العلمية والتوثيق الأكاديمي.",
        `

            <div class="content-card">

                ${references.map(reference => `

                    <div style="
                        margin-bottom:20px;
                        border-bottom:1px solid #edf1f5;
                        padding-bottom:12px;
                    ">

                        <h3>
                            ${esc(reference.title)}
                        </h3>

                        <p>

                            ${esc(reference.authors || "")}

                            ${reference.publication_year
                                ? " · " + esc(reference.publication_year)
                                : ""}

                        </p>

                        <p>

                            ${esc(reference.publisher || "")}

                        </p>

                        ${reference.url ? `

                            <a href="${esc(reference.url)}"
                               target="_blank"
                               rel="noopener noreferrer">

                                فتح المرجع

                            </a>

                        ` : ""}

                    </div>

                `).join("")}

            </div>

        `
    );
}

/* =========================================================
   25. STUDENT PROGRESS
========================================================= */

function renderProgress() {

    const progress = safeJSON(
        "alhakim_progress",
        {}
    );

    const openedKeys = Object.keys(progress);

    const lessonNames = openedKeys.map(id => {

        const lesson = DB.lessons.find(
            item => String(item.id) === String(id)
        );

        return lesson
            ? lesson.title_en
            : id;

    });

    pageShell(
        "تقدمي الدراسي",
        "متابعة الدروس التي استعرضتها على هذا الجهاز.",
        `

            <div class="content-card">

                <h3>

                    الدروس التي استعرضتها:

                    ${openedKeys.length}

                </h3>

                <p>

                    ${lessonNames.map(esc).join("، ") ||
                    "لم تبدأ استعراض أي درس بعد."}

                </p>

                <br>

                <button class="primary"
                    onclick="clearLocalProgress()">

                    مسح سجل هذا الجهاز

                </button>

            </div>

        `
    );
}

function clearLocalProgress() {

    if (!confirm("هل تريد مسح سجل التقدم المحلي؟")) {
        return;
    }

    localStorage.removeItem("alhakim_progress");

    renderProgress();
}

/* =========================================================
   26. AUTHENTICATION CHECK
========================================================= */

async function checkCurrentUser() {

    currentUser = null;

    isAcademyAdmin = false;

    if (!supabaseClient) return;

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error || !data || !data.user) {

            return;
        }

        currentUser = data.user;

        const { data: roles, error: roleError } =
            await supabaseClient
                .from("admin_roles")
                .select("role")
                .eq("user_id", currentUser.id);

        if (roleError) {

            console.warn(
                "Admin role check failed:",
                roleError.message
            );

            return;
        }

        const allowedRoles = [
            "super_admin",
            "editor",
            "instructor"
        ];

        isAcademyAdmin = Array.isArray(roles) &&
            roles.some(item =>
                allowedRoles.includes(item.role)
            );

    } catch (error) {

        console.error("Authentication check error:", error);

    }
}

/* =========================================================
   27. ADMIN DASHBOARD - PROTECTED
========================================================= */

async function renderAdminDashboard() {

    pageShell(
        "لوحة الإدارة",
        "منطقة إدارة أكاديمية الحكيم.",
        `

            <div class="content-card">

                <div id="adminContent">

                    جارٍ التحقق من صلاحيات الحساب...

                </div>

            </div>

        `
    );

    const container = document.getElementById(
        "adminContent"
    );

    if (!container) return;

    await checkCurrentUser();

    if (!currentUser) {

        container.innerHTML = `

            <div class="notice">

                يجب تسجيل الدخول أولاً للوصول إلى لوحة الإدارة.

            </div>

            <p>

                نظام تسجيل الدخول والإدارة يحتاج إلى
                استكمال واجهة المصادقة الخاصة بالأكاديمية.

            </p>

        `;

        return;
    }

    if (!isAcademyAdmin) {

        container.innerHTML = `

            <div class="notice">

                هذا الحساب لا يملك صلاحيات إدارة الأكاديمية.

            </div>

        `;

        return;
    }

    container.innerHTML = `

        <h3>
            مرحباً بك في لوحة الإدارة
        </h3>

        <p>
            ${esc(currentUser.email)}
        </p>

        <div class="notice">

            تم التحقق من صلاحيات الحساب.

            <br>

            وظائف إدارة المحتوى والاشتراكات
            تحتاج إلى ربط عملياتها الآمنة
            بسياسات قاعدة البيانات قبل تفعيلها.

        </div>

        <button class="primary"
            onclick="loadContent()">

            تحديث محتوى الأكاديمية

        </button>

    `;
}

/* =========================================================
   28. GLOBAL SEARCH
========================================================= */

function executeSearch() {

    const input = document.getElementById(
        "globalSearch"
    );

    const box = document.getElementById(
        "searchResults"
    );

    if (!input || !box) return;

    const query = input.value.trim().toLowerCase();

    if (!query) {

        box.innerHTML = "";

        return;
    }

    const results = [];

    DB.departments.forEach(department => {

        const departmentText = (
            department.name_en + " " +
            department.name_ar
        ).toLowerCase();

        if (departmentText.includes(query)) {

            results.push({

                label:
                    department.name_en +
                    " — " +
                    department.name_ar,

                sub: "قسم علمي",

                type: "department",

                code: department.code

            });
        }

        getDepartmentTopics(department).forEach(topic => {

            const title = topic.title_en || topic.title_ar || "";

            if (title.toLowerCase().includes(query)) {

                results.push({

                    label: title,

                    sub: "موضوع في " + department.name_en,

                    type: "topic",

                    code: department.code

                });
            }
        });
    });

    DB.lessons.forEach(lesson => {

        const content = (

            lesson.title_en + " " +
            lesson.title_ar + " " +
            lesson.content_en + " " +
            lesson.content_ar

        ).toLowerCase();

        if (content.includes(query)) {

            results.push({

                label: lesson.title_en,

                sub: "درس علمي",

                type: "lesson",

                id: lesson.id

            });
        }
    });

    if (!results.length) {

        box.innerHTML = `

            <div class="result">

                لا توجد نتائج مطابقة لبحثك.

            </div>

        `;

        return;
    }

    box.innerHTML = results.slice(0, 30).map(result => {

        let action = "";

        if (result.type === "department") {

            action = `showDepartment('${esc(result.code)}')`;

        } else if (result.type === "topic") {

            action = `searchTopic('${esc(result.label)}','${esc(result.code)}')`;

        } else if (result.type === "lesson") {

            action = `showLesson('${esc(result.id)}')`;

        }

        return `

            <div class="result"
                onclick="${action}">

                <b>
                    ${esc(result.label)}
                </b>

                <br>

                <small>
                    ${esc(result.sub)}
                </small>

            </div>

        `;

    }).join("");
}

/* =========================================================
   29. SEARCH LISTENERS
========================================================= */

function setupSearchListeners() {

    const button = document.getElementById(
        "searchBtn"
    );

    const input = document.getElementById(
        "globalSearch"
    );

    if (button) {

        button.onclick = executeSearch;

    }

    if (input) {

        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                executeSearch();

            }

        });
    }
}

/* =========================================================
   30. INITIALIZE APPLICATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    document.querySelectorAll("[data-page]").forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.page);

            const sidebar = document.getElementById(
                "sidebar"
            );

            if (sidebar) {

                sidebar.classList.remove("open");

            }

        });

    });


    document.querySelectorAll("[data-go]").forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.go;

            if (page) {

                showPage(page);

            }

        });

    });


    const menuButton = document.getElementById(
        "menuBtn"
    );

    if (menuButton) {

        menuButton.onclick = () => {

            const sidebar = document.getElementById(
                "sidebar"
            );

            if (sidebar) {

                sidebar.classList.toggle("open");

            }

        };

    }


    const homeLink = document.getElementById(
        "homeLink"
    );

    if (homeLink) {

        homeLink.onclick = event => {

            event.preventDefault();

            showPage("home");

        };

    }


    const overlay = document.getElementById(
        "welcomeOverlay"
    );

    const closeWelcome = () => {

        if (overlay) {

            overlay.classList.add("hidden");

        }

        sessionStorage.setItem(
            "alhakim_welcomed",
            "1"
        );

    };


    if (sessionStorage.getItem("alhakim_welcomed")) {

        if (overlay) {

            overlay.classList.add("hidden");

        }

    }


    const welcomeStart = document.getElementById(
        "welcomeStart"
    );

    const welcomeClose = document.getElementById(
        "welcomeClose"
    );

    if (welcomeStart) {

        welcomeStart.onclick = closeWelcome;

    }

    if (welcomeClose) {

        welcomeClose.onclick = closeWelcome;

    }


    updateConnectionState();

    await loadContent();


    if ("serviceWorker" in navigator) {

        window.addEventListener("load", () => {

            navigator.serviceWorker.register("./sw.js")
                .catch(error => {

                    console.warn(
                        "Service Worker registration failed:",
                        error
                    );

                });

        });

    }

});


/* =========================================================
   31. AUTH STATE LISTENER
========================================================= */

if (supabaseClient) {

    supabaseClient.auth.onAuthStateChange(
        async () => {

            await checkCurrentUser();

        }
    );

}
