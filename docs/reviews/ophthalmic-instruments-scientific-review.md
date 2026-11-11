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
