-- HAKIM OPTICS ACADEMY: secure PDF storage
-- Makes the academy reference bucket private while preserving existing files and metadata.
-- Authenticated academy users can read PDFs; only existing admin policies permit upload/update/delete.

update storage.buckets
set public = false
where id = 'academy-references';

drop policy if exists "Public read academy reference PDFs" on storage.objects;
drop policy if exists "academy_reference_authenticated_read" on storage.objects;

create policy "academy_reference_authenticated_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'academy-references');
