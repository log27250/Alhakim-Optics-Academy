# ANP and GEO Integrated Bilingual Lecture Release
Date: 2026-11-08

## Release scope
The live Supabase lesson records for the first two academy departments were updated to present English teaching content and Arabic explanation in the same lesson content field.

### Department 1 — ANP: Anatomy and Physiology
- Total lessons: 45.
- Previously had separate Arabic lesson content: 22; merged into the integrated lesson content.
- Remaining lessons completed in this release: 23 (ANP-023-L01 through ANP-045-L01); Arabic explanations were added alongside the existing English content.
- Verified target: 45/45 lessons contain integrated bilingual content and have an empty separate Arabic content field.

### Department 2 — GEO: General Optics
- Total lessons: 45.
- All 45 lessons were merged into the integrated bilingual content format.
- Verified target: 45/45 lessons contain integrated bilingual content and have an empty separate Arabic content field.

## Content and data safeguards
- Existing English lesson content was preserved.
- Existing questions, answer options, and answer keys were not modified by this content update.
- A pre-change backup of the 90 ANP/GEO lesson rows was created in the live database as `public._backup_bilingual_anp_geo_20261108`.
- This release updates live Supabase lesson content. This report records the release; it is not a replacement for a database export or a full scientific peer-review sign-off.

## Verification
A post-update database check confirmed:
- ANP: 45 total lessons, 45 integrated, 0 with separate Arabic content remaining.
- GEO: 45 total lessons, 45 integrated, 0 with separate Arabic content remaining.

## Presentation rule
Each lesson is intended to keep English scientific instruction and Arabic explanation within one lesson/page, with headings and bullet points. The questions remain English-only in accordance with the academy's assessment format.
