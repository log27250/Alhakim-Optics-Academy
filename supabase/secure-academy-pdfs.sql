-- HAKIM OPTICS ACADEMY: secure PDF storage
-- Review before running in Supabase SQL Editor. Existing files and metadata are preserved.
update storage.buckets set public = false where id = 'academy-references';
drop policy if exists "academy_reference_authenticated_read" on storage.objects;
create policy "academy_reference_authenticated_read"
on storage.objects for select to authenticated
using (bucket_id = 'academy-references');
