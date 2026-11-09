# VIS Question Bank Repair — 2026-11-09

## Scope
Replaced the malformed objective-recall template questions in lessons VIS-031-L01 through VIS-036-L01 with original, topic-specific multiple-choice assessment items.

## Lessons repaired
- VIS-031-L01 — Visual Attention
- VIS-032-L01 — Visual Recognition and Object Perception
- VIS-033-L01 — Motion Perception
- VIS-034-L01 — Depth Perception
- VIS-035-L01 — Monocular Cues to Depth
- VIS-036-L01 — Binocular Depth Perception

## Database changes
For each of the six lessons:
- Removed the 10 previously published template questions and their answer options.
- Inserted 10 newly authored, concept-focused English questions.
- Added four answer options per question.
- Set exactly one correct option per question.
- Added an English explanation for each correct answer.
- Kept Arabic question and explanation fields empty, with option_ar matching option_en, as required by the academy's current assessment language policy.
- Kept all replacement questions published.

## Verification
A post-write database query confirmed, for each lesson:
- 10 published questions
- 40 answer options
- 10 correct options (exactly one per question)
- 10 English-only question/explanation records
- 0 remaining template questions matching “important learning outcome”
- 0 missing or short explanations under the validation threshold

Total repaired: 60 questions and 240 answer options.

## Scope and limitations
This commit records the database repair and its verification. The live lesson/question records are stored in the academy's Supabase database; this report does not duplicate the database content into static GitHub files. This is a structural and content-quality repair of the identified six-question-bank issue, not a claim of independent peer review of the full VIS curriculum.
