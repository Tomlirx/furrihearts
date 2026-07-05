-- ============================================================================
-- 0017 — P1 security hardening: storage limits + rate limiting
-- ============================================================================
-- 1. Storage buckets had no size/mime limits and pet-photos allowed ANONYMOUS
--    uploads (policy checked only the bucket name). Anyone could fill storage
--    with arbitrary files. Restrict uploads to authenticated users and cap
--    size/mime at the bucket level (belt-and-suspenders with client checks).
-- 2. No rate limiting on message sending or the contact form. Add a small
--    fixed-window counter (rate_limits + check_rate_limit) used by the server
--    actions. Idempotent; safe to re-run.
-- ============================================================================

-- ── 1. Storage hardening ────────────────────────────────────────────────────

update storage.buckets
  set file_size_limit = 5242880,  -- 5 MB
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'pet-photos';

update storage.buckets
  set file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  where id = 'boost-receipts';

-- pet-photos: require login to upload (was anonymous). Public READ is unchanged.
drop policy if exists "Public Upload Access" on storage.objects;
drop policy if exists "Authenticated can upload pet photos" on storage.objects;
create policy "Authenticated can upload pet photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'pet-photos'::text);

-- ── 2. Rate limiting ────────────────────────────────────────────────────────

create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

-- RLS on with no policies: only the SECURITY DEFINER function below touches it;
-- direct PostgREST access from clients is blocked.
alter table public.rate_limits enable row level security;

-- Fixed-window limiter. Returns true when the call is ALLOWED (under the limit),
-- false when it should be blocked. The window resets once p_window has elapsed
-- since window_start. Callers pass a server-derived key (never user input).
create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  insert into public.rate_limits (key, window_start, count)
    values (p_key, now(), 1)
  on conflict (key) do update
    set count = case when rate_limits.window_start < now() - p_window then 1
                     else rate_limits.count + 1 end,
        window_start = case when rate_limits.window_start < now() - p_window then now()
                            else rate_limits.window_start end
  returning count, window_start into v_count, v_start;

  return v_count <= p_limit;
end;
$$;

-- The function is the gatekeeper; clients may call it but cannot read/reset the
-- table. Keys are derived server-side, so callers cannot forge another user's.
revoke all on function public.check_rate_limit(text, integer, interval) from public;
grant execute on function public.check_rate_limit(text, integer, interval) to anon, authenticated;
