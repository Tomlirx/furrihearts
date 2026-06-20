-- Receipts contain payment/financial info and must not be publicly readable.
-- Drop the public SELECT policy from 0007 -- reads now happen exclusively via
-- short-lived signed URLs generated server-side by the admin (service-role)
-- client (app/actions/admin.ts), which bypasses storage RLS entirely, so no
-- SELECT policy is needed or wanted here. The bucket must also be set to
-- "Private" (not Public) in the Supabase dashboard -- a Public bucket serves
-- every object via an unauthenticated URL that bypasses RLS altogether,
-- regardless of any policy on storage.objects.
drop policy if exists "Boost receipts are publicly readable" on storage.objects;
