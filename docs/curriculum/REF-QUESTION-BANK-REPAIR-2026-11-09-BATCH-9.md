# REF Question Bank Completion — Batch 9

Date: 2026-11-09  
Project: HAKIM OPTICS ACADEMY  
Department: Refraction (REF)

## Scope

Completed question-bank coverage for the 14 previously uncovered lessons:

- REF-002 — History Taking in Refraction
- REF-003 — Preliminary Visual Assessment
- REF-004 — Distance Visual Acuity Testing
- REF-005 — Near Visual Acuity Testing
- REF-006 — Objective Refraction
- REF-007 — Retinoscopy Principles
- REF-008 — Static Retinoscopy
- REF-009 — Dynamic Retinoscopy
- REF-010 — Autorefraction
- REF-011 — Subjective Refraction
- REF-012 — Fogging Techniques
- REF-013 — Jackson Cross Cylinder
- REF-014 — Astigmatism Refinement
- REF-015 — Binocular Balance in Refraction

## Delivered

- 14 lessons covered.
- 10 published single-choice questions per lesson.
- 140 new questions.
- 4 bilingual answer options per question.
- 560 answer options.
- English and Arabic question stems.
- English and Arabic explanations.
- Exactly one correct option per question.

## Database verification

Each of the 14 lessons was checked individually after insertion:

- 10 published questions.
- 40 answer options.
- 10 questions with exactly one correct option.
- 0 answer options missing Arabic text.

Department totals after this batch:

- 45 published REF lessons.
- 450 published REF questions.
- 1,800 answer options.

The public question-options view was also checked and returns 1,800 REF options while omitting the correctness flag from its public projection.

## Security remediation

The nine public backup tables were secured without deleting or modifying their backup rows:

- RLS enabled on all nine backup tables.
- All table privileges revoked from PUBLIC, anon and authenticated.
- No client-facing policies were added to backup tables; they are retained for owner-level recovery only.
- Verified that anon/authenticated/PUBLIC have no SELECT privilege on those backup tables.

The public_question_options view was changed to use security_invoker=true. A SELECT policy was added to question_options so clients can read options only when the associated question is published. The view continues to expose option text and ordering, not the is_correct field. The public view was verified to return the expected published REF option rows.

## Remaining security-advisor findings

The post-change Supabase security advisor no longer reports the SECURITY DEFINER view finding. It still reports SECURITY DEFINER RPC functions callable by anon/authenticated, and leaked-password protection is disabled. These were not changed in this batch because their intended authorization and application dependencies require function-by-function review; blanket revocation could break lesson checks, exams, certificates or signup flows.

RLS-enabled backup tables without policies may continue to appear as INFO findings. This is intentional: the tables are not meant to be available to client roles.

## Validation limitation

The checks above confirm database publication structure, counts, bilingual option presence, one correct option per question, and the intended access controls. They do not replace specialist peer review of all clinical wording and answer keys, nor do they constitute a full application/browser regression test.
