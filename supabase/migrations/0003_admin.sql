-- Run this manually in the Supabase SQL editor.
-- After running, manually set your own account's is_admin to true
-- in the Table Editor (no in-app UI does this, by design).

alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.reports add column if not exists status text default 'open';
alter table public.contact_messages add column if not exists status text default 'open';
