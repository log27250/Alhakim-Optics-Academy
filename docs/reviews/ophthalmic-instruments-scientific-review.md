# Scientific Review and Remediation — Ophthalmic Instruments (EINS)

**Review date:** 2026-11-11  
**Scope:** EINS-001 through EINS-045 in HAKIM OPTICS ACADEMY.  
**Assessment language requirement:** English-only question stems, options and explanations. Arabic assessment fields remain intentionally empty/null. Lesson teaching content is bilingual, with an English paragraph followed by an Arabic scientific explanation.

## 1. Verified inventory and structure

The latest independent Supabase audit confirms:
- 45 topics and 45 linked lessons.
- 450 questions (10 per topic).
- 1,800 options (4 per question).
- Exactly one correct option per question.
- Four distinct options and display positions 1–4 for every question.
- No duplicate question stems within a lesson.
- No Arabic text in English assessment stems or explanations, and no Arabic text in option_en.
- Arabic assessment fields are empty.
- No missing or short explanations were found by the current minimum-length check.
- All 45 lessons contain a references heading.
- All 45 lessons contain Arabic teaching text in addition to English. EINS-001–EINS-010 store the bilingual text inline in `content_en` with an empty `content_ar`; EINS-011–EINS-030 also contain Arabic within the primary content and have separate Arabic fields; EINS-031–EINS-045 were rebuilt with interleaved English/Arabic paragraphs and retain separate Arabic fields.

These checks establish structural integrity, not by themselves academic approval.

## 2. Supabase changes applied in this remediation pass

### A. Assessment language and content: EINS-011–EINS-030
The assessment bank for these 20 lessons was rewritten in English:
- 200 question stems were made instrument-specific.
- 800 answer-option records were rewritten, with four English choices and one correct answer per question.
- Explanations were expanded with lesson-specific clinical context.
- Arabic assessment fields remain null.

Topics include autokeratometry, phoropters, near-vision testing, pupillometry, PD measurement, slit-lamp design and techniques, applanation/non-contact/indentation/rebound tonometry, ophthalmoscopy, retinal photography, OCT, OCTA, perimetry, Amsler grid, colour vision, contrast sensitivity, potential acuity and pachymetry.

### B. Assessment content: EINS-041–EINS-045
- Rewrote the 50 question stems to match the relevant Hess/Lees, electrophysiology, ocular photography, portable-device and quality-control concepts.
- Reworked explanations so the rationale corresponds to the keyed answer.
- Replaced generic distractors with ophthalmic-instrument-related alternatives.

### C. Assessment content: EINS-031–EINS-040
- Rewrote 20 previously generic stems and their explanations to test the specific instrument workflow, limitations and clinical use.
- Retained the English-only assessment choices while continuing their scientific review.

### D. Foundational assessment audit: EINS-001–EINS-010
- Reviewed the keyed answers and explanations across the first 10 lessons.
- Corrected the calibration definition to distinguish calibration from adjustment.
- Corrected the visual-acuity item so inadequate occlusion and memorized optotypes are correctly described as causes of falsely improved monocular acuity.
- Clarified the distinction between magnification and resolution.

### E. Lesson presentation and references
- Rebuilt EINS-031–EINS-045 teaching content in a consistent bilingual sequence: English scientific paragraph followed by an Arabic explanatory paragraph.
- All lesson ranges contain bilingual teaching text, but storage/rendering conventions differ: EINS-001–EINS-010 are inline in `content_en`, EINS-011–EINS-030 also use separate Arabic fields, and EINS-031–EINS-045 use interleaved bilingual paragraphs plus separate Arabic fields.
- Added references to EINS-011–EINS-045, selected by topic:
  - Elliott DB. *Clinical Procedures in Primary Eye Care*. 5th ed. Elsevier; 2020.
  - Benjamin WJ, ed. *Borish’s Clinical Refraction*. 2nd ed. Butterworth-Heinemann/Elsevier; 2006.
  - American Academy of Ophthalmology, *Basic and Clinical Science Course 2026–2027*, relevant sections on Clinical Optics and Vision Rehabilitation, External Disease and Cornea, Glaucoma, Lens and Cataract, Retina and Vitreous, Neuro-Ophthalmology, and Pediatric Ophthalmology and Strabismus.
  - ISCEV standards for full-field ERG (2022), VEP (2025) and EOG (2017).
  - Peer-reviewed OCTA artifact references: Spaide RF, Fujimoto JG, Waheed NK. *Retina*. 2015;35(11):2163–2180. doi:10.1097/IAE.0000000000000765; and Anvari P et al. *J Ophthalmic Vis Res*. 2021;16(2):271–286. doi:10.18502/jovr.v16i2.9091.

## 3. Final department examination and additional audit findings

A final-examination question pool was inserted into `academy_exam_questions` for department code `EINS`:
- 110 active questions covering all 45 lessons.
- EINS-001–EINS-020 contribute 3 questions each; EINS-021–EINS-045 contribute 2 questions each.
- All 110 items have four options, a correct answer matching one option, English-only assessment text, and a non-short explanation.
- The items were assembled from the published lesson question bank.

A lesson-order audit found that EINS-001–EINS-020 all had `lessons.display_order=1`, despite their topics being ordered 1–20. This was corrected by setting each lesson's display_order to its linked topic's display_order. All 45 lessons now have sequential display_order values 1–45.

Additional distractor remediation completed:
- EINS-021–EINS-025 now have distinct, lesson-specific incorrect options; repeated distractor sets were removed.
- EINS-009 had two repeated incorrect-option texts; these were replaced with distinct, instrument-relevant distractors.
- EINS-023 contained one broad stem; it was rewritten to test review of a macular OCT thickness map. EINS-008's retinoscopy reflex-direction explanation was clarified in English and Arabic to state the far-point relationship for with, against and neutral reflexes.

The current audit still finds repeated distractor patterns in EINS-026–EINS-045. These must be remediated before academic approval.

## 4. Remaining work before academic sign-off

The section is **not yet approved**. The following work remains:
1. Complete a question-by-question scientific review of all 450 lesson-bank questions, including distractor plausibility and alignment with each lesson.
2. Replace repeated distractor patterns in EINS-026–EINS-045 and then re-run the complete repeated-option audit.
3. Standardize the bilingual lesson presentation/storage across all 45 lessons without losing the existing Arabic explanations embedded in EINS-001–EINS-010 or the separate Arabic content in EINS-011–EINS-030.
4. Verify that each reference supports the exact claims made in its lesson and add topic-specific standards or peer-reviewed sources where required. Relevant standards identified include ISO 15004-1:2020, ISO 10939:2017, ISO 16971-1:2024, ANSI Z80.10-2014, ANSI Z80.37-2017 and current ISCEV ERG/VEP/EOG standards.
5. Test the final examination and lesson rendering through the academy interface on mobile and desktop; review question distribution, answer-key display, scoring and attempt recording.

## 5. Approval criteria

Academic approval will be declared only when:
- Every lesson follows the approved Section 3 teaching format and correct lesson order.
- Every question has a precise, non-ambiguous stem tied to its lesson.
- All four options are distinct and clinically plausible, with exactly one defensible correct answer.
- Each explanation teaches why the answer is correct and addresses relevant limitations or common misconceptions.
- The assessment remains English-only.
- References are genuine, relevant and support the lesson content.
- Structural and scientific checks both pass.

## 6. Sign-off status

**IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**

The latest structural checks pass for all 45 lessons, 450 lesson-bank questions and 1,800 options. The 110-item final-examination pool passes its current structural and language checks. Lesson order has been corrected, and distractor remediation has been completed for EINS-009 and EINS-021–EINS-025. Academic approval remains blocked by repeated distractors in EINS-026–EINS-045, inconsistent bilingual content storage/presentation across lesson ranges, reference-to-claim verification, the full question-by-question scientific audit and live interface testing.

## Follow-up remediation update — 2026-11-11

### Completed in Supabase
- Rebuilt the three incorrect options for all 10 questions in each of EINS-026, EINS-027, EINS-028, EINS-029 and EINS-030.
- Verification confirms for each topic: 10 questions, 10 distinct distractor sets, zero repeated sets, exactly three incorrect options, exactly one correct option, and four distinct option positions.
- EINS-009 remains clear: 10 distinct distractor sets and zero repeated sets.

### Newly identified high-priority content issue
Review of EINS-031–EINS-045 shows the problem extends beyond repeated distractors. Many items use generic template stems (such as “Which clinical task is this instrument designed to support?” or “Which finding is most relevant to the clinical question?”), and some correct answers are reused across differently worded questions. These require question-level reconstruction and validation, not just distractor replacement. No changes were made to EINS-031–EINS-045 in this pass.

### Current status
IN PROGRESS — NOT YET ACADEMICALLY APPROVED.

Remaining work: reconstruct and scientifically review EINS-031–EINS-045 question-by-question; complete a full review of all 450 lesson-bank questions; validate the 110-question final exam; review lecture content and references; and test the learner interface.


## Progress update — EINS-031 question-bank rebuild

- Rebuilt all 10 questions in EINS-031 (Specular Microscopy and Endothelial Imaging) rather than merely replacing distractors.
- Replaced generic stems with topic-specific assessment of specular reflection, endothelial cell compensation, acquisition workflow, image limitations, polymegathism, endothelial cell density, pleomorphism, segmentation review, preoperative risk interpretation, and reporting.
- Replaced all 30 distractors with distinct topic-relevant alternatives; retained one correct option per question and aligned explanations to the revised stems.
- Supabase verification: 10 questions, 40 options, 10 correct options, 10 distinct stems, 30 distinct incorrect option texts, and zero Arabic assessment content.
- EINS-032–035 remain to be rebuilt and verified; EINS-031 is a completed question-bank repair only, not a claim of full scientific approval of the department.


## Progress update — EINS-032 question-bank rebuild

- Rebuilt all 10 EINS-032 questions with specific assessment of anterior-segment anatomy, Scheimpflug imaging, standardized acquisition, segmentation limitations, UBM, AS-OCT, serial measurement comparability, scan centration and clinical documentation.
- Replaced all 30 distractors with distinct, topic-relevant alternatives and aligned the explanations with each revised question.
- Supabase verification for EINS-032: 10 questions, 40 options, 10 correct options, 10 distinct stems, 30 distinct incorrect option texts and zero Arabic assessment content.
- EINS-031 and EINS-032 now pass these structural and content checks. EINS-033–045 remain in the question-rebuild queue; this does not constitute full department approval.


## Progress update — EINS-033–035 question rebuild and lesson illustrations

- Rebuilt all 10 questions in each of EINS-033 (A-scan), EINS-034 (B-scan), and EINS-035 (Optical Biometry / IOL Calculation): 30 revised question stems and explanations, with 90 distinct distractor texts.
- The revised assessment focuses on echo acquisition and axial-length measurement, contact versus immersion technique, posterior-segment B-scan interpretation and limitations, and optical biometry quality control and IOL formula inputs.
- Supabase checks for EINS-031–035: each topic has 10 questions and 40 options; each has 10 correct answers, 10 distinct stems, 30 distinct wrong-option texts, and zero Arabic assessment fields/text.
- Added five inline SVG educational figures directly into lesson HTML before each References and Further Reading section (EINS-031–035). Each figure combines a schematic of the relevant instrument or imaging modality with its key scientific concept. These are original schematic illustrations, not photographs of specific commercial device models.
- Supabase confirmed all five lesson records contain the SVG figure markup in the intended position before the references section.
- The rendering of inline SVG in the live academy UI still requires visual testing. EINS-036–045 and the broader scientific review remain outstanding; the department is not yet academically approved.


## Progress update — EINS-036–040 lesson illustrations and question-bank audit

- Added one original inline SVG schematic to each of EINS-036–040: optical axial-length acquisition, gonioscopy lens optical access, fundus condensing-lens image formation, prism deviation/base direction, and synoptophore dual-arm target presentation.
- Each SVG is inserted before the lesson's References and Further Reading list. A subsequent Supabase verification confirmed all five lesson records contain a closed figure element and SVG markup, the references heading is preserved, the figure precedes the references, and no stray replacement marker remains.
- These are explanatory schematics, not photographs of commercial instruments. Live rendering on mobile and desktop has not yet been tested.
- Existing question-bank structure for each of EINS-036–040 is 10 questions, 40 options and 10 correct options; assessment fields contain no Arabic text.
- Important quality finding: each of these five topics currently has only three distinct incorrect-option texts repeated across the 10 questions (rather than 30 distinct distractors). This is a substantive assessment-quality defect. It has not been fixed in this pass, and no claim is made that these question banks are ready for students.
- The lesson text and references were preserved while inserting the figures. Scientific review of the lesson claims, question-level reconstruction, distractor replacement, final-exam validation and live interface testing remain outstanding.

**Current status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Progress update — EINS-036–040 distractor remediation

- Replaced all 150 incorrect answer options across EINS-036–040 with topic-specific alternatives. The revised distractors cover optical biometry acquisition and signal interpretation; gonioscopy optics, lens handling and angle assessment; fundus lens image formation and examination technique; prism optics, base direction and measurement conditions; and synoptophore functions, setup and interpretation.
- Supabase verification for each of the five topics confirms 10 questions, 40 options, 10 keyed correct options, 10 distinct question stems, 30 distinct incorrect-option texts, and zero Arabic assessment text.
- This closes the repeated-distractor defect recorded in the previous progress update. It does not establish that every keyed answer and stem is scientifically optimal: several stems and correct-answer concepts remain repetitive or template-like and still require question-by-question reconstruction and expert review.
- The five inline SVG figures remain present before their references headings; rendering in the live learner interface remains untested.

**Current status: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Progress update — EINS-041 distractor remediation and illustration

- Replaced all 30 incorrect options across the 10 EINS-041 questions with individually tailored alternatives related to Hess/Lees dissociation, standardized test conditions, suppression and cooperation, chart interpretation, limitations, follow-up comparability, Hering's law and documentation.
- Supabase verification: 10 questions, 40 options, 10 correct options, 10 distinct stems, 40 distinct option texts, and zero Arabic option text.
- Added an inline SVG teaching schematic before the references heading. It illustrates separate red/green target presentation and an explicitly non-diagnostic gaze-position plot. This is a conceptual schematic, not a reproduction of a proprietary chart.
- Live rendering of this SVG in the learner interface has not yet been tested. EINS-042–045 still require the same question-level remediation and illustrations.

**Current status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Progress update — EINS-042 distractor remediation and illustration

- Replaced all 30 incorrect options across the 10 EINS-042 questions with electrophysiology-specific alternatives covering ERG/VEP/EOG distinctions, dark- and light-adapted ERG, electrode acquisition, artifacts, patient/protocol variables, pattern-reversal VEP, reproducibility, pediatric normative data and trace documentation.
- Supabase verification: 10 questions, 40 options, 10 correct options, 10 distinct stems, 40 distinct option texts and zero Arabic option text.
- Added an inline SVG schematic distinguishing retinal ERG responses, occipital VEP recordings and EOG standing-potential assessment. Supabase confirms the figure is present before the references heading.
- Live rendering remains untested. The stems and keyed answers have not yet undergone a full external expert review; this remediation addresses the repeated/unrelated distractor defect only.

**Current status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Progress update — EINS-043 distractor remediation and illustration

- Replaced all 30 incorrect options across EINS-043 with individually tailored alternatives covering ocular photography purpose, acquisition variables, patient/laterality verification, image artifacts, field-of-view limitations, serial-image metadata, immediate quality review, original-file retention, secure storage and correct patient-record linkage.
- Supabase verification: 10 questions, 40 options, 10 correct options, 10 distinct stems, 40 distinct option texts and zero Arabic option text.
- Added an inline SVG schematic for camera/optics, illumination and focus, ocular-field alignment, image review and secure metadata-based archiving. Supabase confirms the SVG is present before the references heading.
- The SVG is a conceptual workflow diagram, not a photograph of a specific commercial camera. Live learner-interface rendering remains untested; this remediation is not full academic sign-off.

**Current status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Progress update — EINS-044 distractor remediation and illustration

- Replaced all 30 incorrect options across EINS-044 with device-specific alternatives covering portable-use settings, stabilization and working distance, pre-use checks, motion/fixation/pressure artifacts, discordant results, device-dependent positioning, contact-surface infection control, traceable documentation and management of implausible readings.
- Supabase verification: 10 questions, 40 options, 10 correct options, 10 distinct stems, 40 distinct option texts and zero Arabic option text.
- Added an inline SVG with illustrative silhouettes of a portable slit lamp, handheld tonometer, direct ophthalmoscope and handheld autorefractor. It is explicitly labeled as schematic because designs and operating methods vary by model. Supabase confirms placement before the references heading.
- Live learner-interface rendering remains untested; this does not constitute full academic approval.

**Current status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Progress update — EINS-045 distractor remediation and illustration

- Replaced all 30 incorrect options across EINS-045 with individually tailored alternatives addressing instrument selection, validity and repeatability, measurement range, operator competence, routine calibration and functional checks, systematic versus random error, infection prevention, electrical safety, maintenance logs, implausible readings, validated use and reporting of limitations.
- Supabase verification: 10 questions, 40 options, 10 correct options, 10 distinct stems, 40 distinct option texts and zero Arabic option text.
- Added an inline SVG workflow covering pre-use checks, calibration/function verification, measurement, quality review, documentation and service/release. Supabase confirms the figure is present before the references heading.
- Live learner-interface rendering remains untested. EINS-045 distractor repetition is remediated, but the entire lesson and its stems/keyed answers still require question-by-question scientific review.

**Current status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**

## Consolidated progress — EINS-041–EINS-045

- Completed the repeated/unrelated distractor replacement for all five remaining topics: 150 incorrect options replaced.
- Added one original inline SVG schematic to each lesson EINS-041–EINS-045.
- Per-topic Supabase verification passed: 10 questions, 40 options, 10 keyed correct options, 10 distinct stems, 40 distinct option texts, zero Arabic option text, and SVG markup before the references heading.
- These results verify counts, uniqueness, English-only options and figure placement. They do not prove the SVG renders in the live app, nor do they constitute expert academic approval of every stem, keyed answer, explanation or lesson claim.
- Remaining department-level work includes full question-by-question review of all 450 items, final-exam content and UI validation, lesson/reference verification, bilingual presentation standardization and mobile/desktop rendering tests.

**Department sign-off remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Question-level audit — EINS-041–EINS-042 (2026-11-11)

### EINS-041 — Hess Screen, Lees Screen and Diplopia Charts
- Retrieved and reviewed all 10 stems, keyed answers, explanations and 40 options against the lesson's stated purpose, dissociation principle, acquisition conditions, subjective limitations, chart interpretation, Hering's law, repeatability and documentation.
- The sampled question set is aligned with the lesson and has one defensible keyed answer per item. Distractors are distinguishable and relevant; no stem or key change was justified in this pass.
- This is an internal content review, not external specialist sign-off.

### EINS-042 — ERG, VEP and EOG
- Retrieved and reviewed all 10 stems, keyed answers, explanations and 40 options against the lesson's distinction between retinal ERG, cortical VEP and EOG standing-potential assessment; adaptation protocols; electrode acquisition; artifacts; fixation and refractive clarity; reproducibility; age-appropriate norms; and trace documentation.
- Found a substantive duplication: two questions independently tested the same action for non-reproducible traces. Replaced the later duplicate with an EOG light-rise question and four EOG/ERG/VEP-specific options.
- The revised correct answer identifies the light rise as the increase in standing potential during light adaptation relative to the preceding dark trough. The explanation links the light-peak/dark-trough relationship to the Arden ratio and cautions that interpretation must follow the validated protocol and laboratory reference limits.
- Supabase read-back verified the revised stem, explanation and four options, with exactly one correct answer.
- The other nine items were retained; no unsupported edits were made.

### Scope and limitations
- This pass substantively reviewed EINS-041 and EINS-042 only. EINS-043–045 and EINS-001–040 still require the same question-level review.
- Structural counts and unique option text do not alone establish scientific validity. The final examination, lesson claims/references and live learner-interface rendering remain unvalidated.
- Department status remains **IN PROGRESS — NOT YET ACADEMICALLY APPROVED**.


## Question-level audit — EINS-043–EINS-045 (2026-11-11)

### EINS-043 — Ocular Photography and Imaging Documentation
- Reviewed all 10 stems, keyed answers and explanations against the lesson scope: photographic documentation, acquisition quality, identity/laterality, image artifacts, field-of-view limitations, serial-image metadata, immediate quality review, original-file retention, secure storage and record linkage.
- The keyed concepts were appropriate to the stems and the explanations were consistent. No question/key rewrite was justified in this pass.
- The four-choice structure and English-only assessment content were retained.

### EINS-044 — Portable and Handheld Ophthalmic Devices
- Reviewed all 10 stems, keyed answers and explanations.
- Identified one broad, low-specificity item that tested generic procedure explanation/documentation rather than a portable-device skill. Replaced it with a handheld slit-lamp technique question assessing stabilization, patient support, model-specific working distance and optical alignment.
- Replaced all four options and expanded the explanation to caution that handheld examination is movement-sensitive, device-specific instructions must be followed, and unintended ocular contact must be avoided.
- Supabase read-back confirmed the revised stem, rationale and one keyed answer.

### EINS-045 — Instrument Selection, Quality Control and Clinical Safety
- Reviewed all 10 stems, keyed answers and explanations against clinical selection, validity/repeatability, calibration, error types, infection prevention, electrical safety, maintenance records, implausible measurements, operator competence and reporting limitations.
- Refined the quality-assurance item to avoid implying that every ophthalmic instrument requires an identical daily check or calibration interval. The keyed answer now explicitly refers to manufacturer-specified calibration/maintenance, required instrument-specific functional checks and standardized procedures. The explanation states that intervals and checks are device-dependent.
- Other reviewed keys were retained; no unsupported changes were made.

### Structural verification after this pass
- EINS-043, EINS-044 and EINS-045 each retain 10 questions, 40 options and exactly 10 keyed correct options.
- The reviewed assessment set remains English-only. Full department structural audits and the 110-item final-exam review are still separate tasks.
- This internal review is not external specialist sign-off. Remaining work includes EINS-001–EINS-040 question-level review, final-exam question-level review, lesson/reference verification and live interface testing.

**Department status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Question-level audit — EINS-036–EINS-037 (2026-11-11)

- Retrieved all 20 question records, their 80 options, keyed-answer flags and explanations from Supabase.
- Found template-style stems and repeated correct-answer paragraphs that did not directly answer the question (for example, generic prompts about the instrument's “clinical task” paired with a broad lesson paragraph).
- Rewrote all 10 EINS-036 items to assess optical axial-length technologies, optical-path conversion, fixation/alignment, scan quality, media-opacity limitations, repeatability, IOL biometric inputs and documentation.
- Rewrote all 10 EINS-037 items to assess total internal reflection, gonioscopy lens optics and designs, controlled examination technique, inadvertent indentation, appositional versus synechial closure, imaging's complementary role and clinical documentation.
- Replaced the keyed correct option and explanation for every rewritten item so that each answer directly resolves its stem. Existing incorrect options were retained only where they remained clearly incorrect and distinct.
- Supabase read-back confirms for each topic: 10 questions, 40 options, 10 keyed correct options, 10 distinct stems and 40 distinct option texts.
- This is a substantive internal question-level repair, not independent external specialist approval. EINS-038–EINS-040 still require the same question-level audit; EINS-001–EINS-035 also remain in the full question-by-question review queue.

**Department status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Question-level audit — EINS-038–EINS-040 (2026-11-11)

- Retrieved the 30 question records, 120 options, correct-answer flags and explanations from Supabase.
- Found repeated generic prompt templates and repeated broad lesson-paragraph keys in the three topic banks.
- Rewrote 8 EINS-038 items to assess fundus-lens purpose, aerial inverted image formation, lens alignment, image-quality limitations, retinal field examination, troubleshooting, image orientation and clinical documentation.
- Rewrote 8 EINS-039 items to assess prism-dioptre definition, image displacement relative to prism base, prism-cover-test neutralization, differences between alternate and simultaneous testing, prism units, base-direction recording, standardized testing conditions and troubleshooting/documentation.
- Rewrote 8 EINS-040 items to assess separate-eye target presentation, grades of binocular function, instrument setup, limitations of instrument-induced dissociation, objective versus subjective angles, interpretation of fusion responses, pediatric cooperation and reporting.
- Updated the corresponding keyed options and explanations so each directly answers its revised stem.
- Supabase verification for EINS-038, EINS-039 and EINS-040 confirms 10 questions, 40 options, 10 correct options, 10 distinct stems and 40 distinct option texts per topic.
- The remaining two questions per topic were retained because their existing stems and answer rationales were already specific and clinically relevant.
- This internal review does not replace external specialist sign-off. The 35 earlier topics and the 110-question final examination still require full question-by-question review.

**Department status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Question-level screening — EINS-001–EINS-005 (2026-11-11)

- Retrieved the 50 lesson-bank questions, 200 options, correct-answer flags and explanations through the topic-to-question relationship in Supabase. Lesson records use codes with the `-L01` suffix; their linked topic codes are EINS-001–EINS-005.
- Screened the stems, keys and explanations for core conceptual accuracy and lesson alignment. The reviewed concepts include accuracy versus precision, calibration versus adjustment, infection control, optical reflection/refraction, OCT interferometry, magnification versus resolution, instrument components, visual-acuity notation and occlusion, logMAR, trial-lens powers, cylinder axis, prism action, centration and vertex distance.
- The reviewed keyed concepts and explanations were consistent with the intended introductory topics. No answer-key reversal or clearly incorrect scientific claim was identified in this screening pass, so no speculative database edits were made.
- This was a first-pass content screen, not a full distractor-quality or external specialist review. Some introductory distractors are noticeably weak or implausible and should be improved during the detailed assessment pass.
- EINS-006–EINS-045, the full distractor plausibility review of EINS-001–EINS-005, and the 110-question final examination remain to be completed.

**Department status remains: IN PROGRESS — NOT YET ACADEMICALLY APPROVED.**


## Final quality-control pass — 2026-11-11

### Database-wide structural verification
- The EINS lesson bank contains 45 topics with 10 questions each (450 questions total).
- Each of the 45 topics has 40 answer options and 10 keyed correct options (1,800 options total); each topic has 10 distinct question stems.
- All assessment text remains English-only in the inspected lesson-bank fields.
- The EINS final examination contains 110 active records. Structural checks confirm 110 distinct stems, four options per item, a matching correct-option value for every item, no missing keys, and no Arabic assessment text.
- Four short exam stems are concise recall prompts, not structural defects.
- The 110-item exam has 15 previously templated explanations containing a generic “relevant lesson point” wrapper. All 15 wrappers were removed and the explanations rewritten as direct clinical rationales.
- Twelve exam items with generic or misaligned stems were rewritten to match their keyed answer; three additional mismatched stems (gonioscopy clinical role, optical-biometry limitations, prism base direction) were also corrected. Read-back confirmed the updated wording.
- The final examination has not yet received a full independent subject-matter review of every distractor and clinical nuance.

### Lesson content and figures
- All 45 lessons contain substantive bilingual content in the stored lesson content; explicit reference headings are present in the sampled early lessons.
- Fifteen inline SVG educational schematics are present in EINS-031–EINS-045. No inline SVG was found in EINS-001–EINS-030 in this audit.
- SVG placement was previously verified before the references in EINS-036–EINS-045, but rendering has not been tested in the live student interface or across mobile/desktop clients.
- The lesson bank and examination remain structurally complete, but structural counts do not prove every scientific statement, citation, distractor or display behavior is correct.

### Remaining approval gates
1. Complete a question-by-question scientific and distractor review of EINS-001–EINS-035 (the earlier passes were partial screens or distractor repairs, not a complete academic audit).
2. Complete a full item-by-item scientific audit of all 110 final-exam questions, including every option and explanation.
3. Verify each lesson's references against the specific claims it supports; a bibliography alone is not evidence that every claim is sourced.
4. Add and verify appropriately placed instructional figures for EINS-001–EINS-030 if the department standard requires figures in every lesson.
5. Test lesson rendering, inline SVG, bilingual/RTL display and final-exam behavior in the live application on mobile and desktop.

**Approval decision: NOT FINALLY APPROVED.** The department is structurally populated and the listed database repairs are deployed, but academic approval is withheld until all five gates above are completed. This report records an internal quality-control review and is not external specialist accreditation.


## Remediation update — 2026-11-11 (references, illustrations and question-bank screening)

### Lesson references and source traceability
- Added a topic-specific supplementary reference section to EINS-001–EINS-030, retaining the existing bibliography and adding relevant textbooks, peer-reviewed foundational papers and/or instrument standards.
- Added explicit general instrument safety/quality references to EINS-044 and EINS-045, with a scope note that ISO 15004-1:2020 does not replace device-specific standards or manufacturer instructions.
- Checked ISO standard status and scope against the official ISO catalogue and FDA recognized-consensus-standards listings. Verified standards referenced include ISO 15004-1:2020, ISO 8596:2017 with Amendment 1:2019, ISO 8598-1:2014, ISO 10939:2017, ISO 10940:2009, ISO 10942:2022, ISO 10943:2023, ISO 10938:2016, ISO 8612:2009 and ISO 16971-1:2024. Where an individual standard landing-page identifier was not independently confirmed, the lesson links to the official ISO/TC 172/SC 7 catalogue rather than using a guessed direct URL.
- Added scope caveats where a standard's stated purpose is narrower than routine clinical practice (for example, ISO 8596:2017 is not a universal clinical acuity protocol).
- Supabase verification: all 45 EINS lessons have a reference heading, all 45 now contain reference identifiers/links or named standards, and bilingual inline teaching text remains present in all 45.
- This improves bibliographic traceability; it does not yet prove that every sentence-level clinical claim has been mapped to a supporting source. That claim-to-source verification remains an approval gate.

### Lesson illustrations
- Added 30 original topic-specific SVG schematics to EINS-001–EINS-030, inserted immediately before each lesson's References heading.
- Combined with the previously existing 15 illustrations in EINS-031–EINS-045, all 45 lessons now contain an inline SVG figure.
- Supabase verification: 45/45 lessons contain SVG markup; in 45/45 the SVG occurs before the references section. The figures are teaching schematics, not photographs or validated diagnostic images.
- Live rendering of the SVGs in the learner interface has not been tested on mobile or desktop.

### Lesson-bank question screening and repair
- Retrieved and screened all 50 question stems, keyed options and explanations in EINS-001–EINS-005, including all 200 answer options. No incorrect answer key was identified in this screening. The review noted that some introductory distractors are weak or implausible and need a separate quality pass.
- Retrieved and screened all 50 question stems, keyed options and explanations in EINS-006–EINS-010, including all 200 answer options. No clear key reversal was identified. Core checks included focimeter use, vertex power, progressive reference points, accommodation effects in autorefraction, working-distance subtraction in retinoscopy, keratometry limits and corneal topography/tomography distinctions.
- A database-wide question audit detected three remaining boilerplate explanation prefixes in EINS-031, EINS-036 and EINS-040. Rewrote the associated stems and explanations so that the questions now directly assess specular-microscopy image limitations, optical axial-length acquisition failure and the synoptophore's principal clinical role. Supabase read-back confirmed the revisions.
- Re-audit confirms 450 question-bank items, four distinct options per item, exactly one keyed correct answer per item, 450 distinct stems, no Arabic assessment text, no short explanations under the audit threshold and zero remaining boilerplate explanation wrappers.
- These database-wide checks do not substitute for a complete scientific review of every stem, distractor and explanation. The question-by-question review of EINS-011–EINS-045 and the detailed distractor plausibility review of EINS-001–EINS-010 remain outstanding.

### Final-exam screening
- Rechecked the 110 active EINS final-exam records: 110 distinct stems, four options per item, zero Arabic assessment text and zero remaining boilerplate explanation wrappers.
- A search for known generic stem templates returned no matches.
- The final examination has not yet been reviewed item-by-item against the source lessons for scientific correctness, distractor plausibility and explanation quality. This remains a required approval gate.

### Current verified status
- 45 lessons; 45/45 with references headings, source identifiers and inline SVG figures.
- 450 lesson-bank questions; 1,800 options; one correct answer per question; 450 distinct stems; no Arabic assessment text; no short or boilerplate explanations detected by the current audit.
- 110 active final-exam questions; 110 distinct stems; four options each; English-only; no boilerplate explanation wrappers.
- Live learner-interface testing, complete lesson claim-to-reference mapping, full scientific review of EINS-011–EINS-045 and all 110 final-exam items, and detailed distractor plausibility review remain outstanding.

**Approval decision remains: NOT FINALLY APPROVED.** The section has improved bibliographic coverage, complete illustration coverage and a clean structural audit, but these results are not a substitute for the remaining scientific and live-interface checks. No external specialist accreditation is claimed.


## Consolidated audit update — 2026-11-11

### Additional live database review
- Retrieved all 350 bank items in EINS-011–EINS-045 for inspection. The full result exceeded the tool's output limit, so this pass cannot be represented as a complete item-by-item human review. Spot inspection revealed some explanations that repeat a broad topic statement after the answer-specific rationale; this is a quality concern even where the keyed answer is correct.
- Rechecked the full question-bank table by topic. Every topic still contains 10 questions and 10 distinct explanation strings. Structural checks continue to show four options and one correct key per item. A prior audit reported 450 distinct stems and no Arabic assessment content.
- Removed the redundant leading “Correct answer: …” sentence from all 47 affected bank explanations and all 10 affected final-exam explanations. Read-back confirmed zero remaining explanation prefixes in either table. This is a wording cleanup, not a scientific validation.
- Rechecked the 110 active final-exam items: 110 distinct stems; four options; correct key present among options for all 110. The automated phrase scan identified 6 broad/generic stem patterns and 40 explanations under 100 characters. Length alone does not prove an explanation is inadequate, but these items need contextual review. The final-exam dataset also includes distractors that are sometimes unrelated in topic, reducing assessment quality.
- A direct inspection of final-exam records found at least one poor distractor set in which alternatives were unrelated instrument measurements, and several explanations that merely restate the correct option without a sufficient rationale. These must be rewritten during the complete assessment review.
- The question-bank audit found that EINS-001–010 and several later topics have short explanations; this should not be padded mechanically. Each explanation needs to explain the underlying optical/clinical principle and relevant limitation, and should be reviewed against the lesson and reference.

### Current release decision
**NOT FINALLY APPROVED — approval withheld.** Although the database structure, reference coverage, and inline illustration coverage have been checked, the full scientific review of all 450 bank questions and all 110 final-exam items has not been completed. The available SQL tool returns large result sets truncated beyond the output limit; therefore a claim that every question, option, key and explanation was reviewed would be inaccurate. In addition, learner-interface rendering on mobile and desktop has not been exercised in a live browser session. The remaining work requires reviewable batches with full records and live application testing, not a blanket database update.
