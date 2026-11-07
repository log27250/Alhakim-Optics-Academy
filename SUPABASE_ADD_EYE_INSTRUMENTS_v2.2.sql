-- HAKIM OPTICS ACADEMY v2.2 | Add ONLY department 13: Eye Instruments (45 topics)
-- Existing Research Methodology (department 14) is intentionally untouched.
-- Safe re-run: existing department/topic codes are not duplicated.
BEGIN;

INSERT INTO public.departments (code, name_en, name_ar, description_en, description_ar, display_order, is_published)
VALUES ('EINS', 'Eye Instruments', 'أجهزة العيون', 'Ophthalmic instruments: optical principles, operation, calibration, clinical applications and safety.', 'دراسة أجهزة العيون ومبادئها البصرية وتشغيلها ومعايرتها وتطبيقاتها السريرية والسلامة.', 13, true)
ON CONFLICT (code) DO NOTHING;

WITH dep AS (SELECT id FROM public.departments WHERE code = 'EINS'),
topics(code,title_en,title_ar,display_order) AS (VALUES
  ('EINS-001', 'Fundamentals of Ophthalmic Instruments', 'أساسيات أجهزة طب العيون', 1),
  ('EINS-002', 'Optical Principles of Ophthalmic Instruments', 'المبادئ البصرية لأجهزة العيون', 2),
  ('EINS-003', 'Instrument Components, Calibration and Maintenance', 'مكونات الأجهزة والمعايرة والصيانة', 3),
  ('EINS-004', 'Visual Acuity Charts and Testing Systems', 'لوحات وأنظمة قياس حدة الإبصار', 4),
  ('EINS-005', 'Trial Lens Set and Trial Frame', 'صندوق العدسات التجريبية وإطار التجربة', 5),
  ('EINS-006', 'Lensmeter (Focimeter): Principles and Use', 'مقياس العدسات: المبادئ والاستخدام', 6),
  ('EINS-007', 'Manual and Automated Refractometers', 'أجهزة قياس الانكسار اليدوية والآلية', 7),
  ('EINS-008', 'Retinoscope: Types and Operating Principles', 'الرتينوسكوب: الأنواع ومبادئ التشغيل', 8),
  ('EINS-009', 'Keratometer: Principles and Clinical Applications', 'جهاز قياس تحدب القرنية وتطبيقاته', 9),
  ('EINS-010', 'Corneal Topography and Tomography Systems', 'أجهزة طبوغرافيا وتصوير مقطع القرنية', 10),
  ('EINS-011', 'Autokeratometry and Combined Refraction Systems', 'قياس تحدب القرنية الآلي وأجهزة القياس المدمجة', 11),
  ('EINS-012', 'Phoropter: Design and Clinical Use', 'الفوروبتر: التصميم والاستخدام السريري', 12),
  ('EINS-013', 'Near Vision Testing Instruments', 'أجهزة فحص الرؤية القريبة', 13),
  ('EINS-014', 'Pupillometer and Pupil Assessment Devices', 'أجهزة قياس الحدقة وتقييمها', 14),
  ('EINS-015', 'PD Meter: Monocular and Binocular Measurements', 'جهاز قياس المسافة بين الحدقتين', 15),
  ('EINS-016', 'Slit-Lamp Biomicroscope: Construction and Optics', 'المصباح الشقي: التركيب والبصريات', 16),
  ('EINS-017', 'Slit-Lamp Examination Techniques', 'تقنيات الفحص بالمصباح الشقي', 17),
  ('EINS-018', 'Applanation Tonometers', 'أجهزة قياس ضغط العين بالتسطح', 18),
  ('EINS-019', 'Non-Contact Tonometers', 'أجهزة قياس ضغط العين دون تماس', 19),
  ('EINS-020', 'Indentation and Rebound Tonometers', 'أجهزة قياس ضغط العين بالانغمار والارتداد', 20),
  ('EINS-021', 'Ophthalmoscopes: Direct and Indirect', 'مناظير قاع العين المباشرة وغير المباشرة', 21),
  ('EINS-022', 'Fundus Cameras and Retinal Imaging', 'كاميرات قاع العين وتصوير الشبكية', 22),
  ('EINS-023', 'Optical Coherence Tomography (OCT)', 'التصوير المقطعي للتماسك البصري', 23),
  ('EINS-024', 'OCT Angiography and Retinal Vascular Imaging', 'تصوير الأوعية بالـOCT وتصوير أوعية الشبكية', 24),
  ('EINS-025', 'Visual Field Analyzers and Perimeters', 'أجهزة قياس المجال البصري', 25),
  ('EINS-026', 'Amsler Grid and Central Visual Field Assessment', 'شبكة أمسلر وتقييم المجال البصري المركزي', 26),
  ('EINS-027', 'Colour Vision Testing Instruments', 'أجهزة فحص رؤية الألوان', 27),
  ('EINS-028', 'Contrast Sensitivity Testing Devices', 'أجهزة فحص حساسية التباين', 28),
  ('EINS-029', 'Potential Acuity Meter and Laser Interferometry', 'مقياس حدة الإبصار المحتملة والتداخل الليزري', 29),
  ('EINS-030', 'Pachymeters: Ultrasound and Optical', 'أجهزة قياس سماكة القرنية بالموجات فوق الصوتية والضوء', 30),
  ('EINS-031', 'Specular Microscopy and Endothelial Imaging', 'الفحص المجهري الانعكاسي وتصوير بطانة القرنية', 31),
  ('EINS-032', 'Anterior Segment Imaging Systems', 'أنظمة تصوير الجزء الأمامي للعين', 32),
  ('EINS-033', 'Ultrasound A-Scan and Biometry', 'الموجات فوق الصوتية A-scan والقياسات الحيوية', 33),
  ('EINS-034', 'Ultrasound B-Scan and Ocular Echography', 'الموجات فوق الصوتية B-scan وتصوير العين', 34),
  ('EINS-035', 'Optical Biometry and Intraocular Lens Calculation Devices', 'القياسات الحيوية البصرية وأجهزة حساب العدسات داخل العين', 35),
  ('EINS-036', 'OCT-Based and Optical Axial Length Measurement', 'قياس طول المحور البصري باستخدام OCT والأنظمة الضوئية', 36),
  ('EINS-037', 'Gonioscopy Lenses and Diagnostic Contact Lenses', 'عدسات تنظير الزاوية والعدسات اللاصقة التشخيصية', 37),
  ('EINS-038', 'Fundus and Retinal Examination Lenses', 'عدسات فحص قاع العين والشبكية', 38),
  ('EINS-039', 'Prism Bars and Strabismus Measurement Tools', 'قضبان المنشور وأدوات قياس الحول', 39),
  ('EINS-040', 'Synoptophore and Orthoptic Instruments', 'السينوبتوفور وأجهزة تقويم البصر', 40),
  ('EINS-041', 'Hess Screen, Lees Screen and Diplopia Charts', 'شاشة هس وشاشة ليز ومخططات ازدواج الرؤية', 41),
  ('EINS-042', 'Electrophysiology Instruments: ERG, VEP and EOG', 'أجهزة الفسيولوجيا الكهربائية: ERG وVEP وEOG', 42),
  ('EINS-043', 'Ocular Photography and Imaging Documentation', 'التصوير العيني وتوثيق الصور', 43),
  ('EINS-044', 'Portable and Handheld Ophthalmic Devices', 'أجهزة العيون المحمولة واليدوية', 44),
  ('EINS-045', 'Instrument Selection, Quality Control and Clinical Safety', 'اختيار الأجهزة وضبط الجودة والسلامة السريرية', 45)
)
INSERT INTO public.topics (department_id, code, title_en, title_ar, display_order, is_published)
SELECT dep.id, topics.code, topics.title_en, topics.title_ar, topics.display_order, true
FROM dep CROSS JOIN topics
ON CONFLICT (code) DO NOTHING;

COMMIT;

-- Verification: expected one department and 45 topics.
SELECT d.code, d.name_en, d.display_order, COUNT(t.id) AS topic_count
FROM public.departments d LEFT JOIN public.topics t ON t.department_id = d.id
WHERE d.code = 'EINS' GROUP BY d.code, d.name_en, d.display_order;