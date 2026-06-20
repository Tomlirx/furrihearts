-- Storage RLS policies for the boost-receipts bucket. The bucket itself must
-- still be created manually in the Supabase dashboard (Storage > New bucket,
-- name "boost-receipts") — this migration only adds the access policies,
-- same pattern needed for the existing pet-photos bucket.

drop policy if exists "Authenticated users can upload boost receipts" on storage.objects;
create policy "Authenticated users can upload boost receipts" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'boost-receipts');

drop policy if exists "Boost receipts are publicly readable" on storage.objects;
create policy "Boost receipts are publicly readable" on storage.objects
  for select using (bucket_id = 'boost-receipts');
