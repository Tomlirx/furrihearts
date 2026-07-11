-- ============================================================================
-- FurriHearts — database initialization for a NEW Supabase project
-- ============================================================================
-- Generated from a live-database introspection on 2026-07-04 (Postgres 17.6).
-- This script is the single entry point for a fresh environment: it recreates
-- every table, constraint, index, function, trigger, RLS policy, storage
-- policy, seed row and cron job that the production database actually has —
-- including objects that were created by hand in the dashboard and never made
-- it into supabase/migrations/ (see "DRIFT NOTES" below).
--
-- Usage: run the whole file once in the SQL Editor of a brand-new Supabase
-- project. It is idempotent (safe to re-run). Do NOT run it on the existing
-- production project — that one is already in this state; keep evolving it
-- with incremental files in supabase/migrations/ instead.
--
-- DRIFT NOTES (live objects that are NOT in supabase/migrations/):
--   1. Base tables profiles / pets / applications were created via the
--      dashboard — their full DDL exists only here.
--   2. handle_new_user() + trigger on_auth_user_created on auth.users:
--      profiles rows are auto-created on signup by the DATABASE, not the app
--      (the app's manual insert in app/actions/auth.ts is a redundant
--      fallback that no-ops on the primary-key conflict).
--   3. sync_pet_status_on_app_update() + trigger on applications: approving
--      an application marks the pet adopted and auto-rejects other pending
--      applications; cancelling makes the pet available again.
--   4. Several legacy/duplicate RLS policies exist (marked LEGACY below).
--      They are reproduced faithfully so the new environment behaves exactly
--      like production. The two permissive INSERT policies were removed in
--      migration 0016 and are no longer created here.
--   5. enforce_application_transition() + BEFORE UPDATE trigger (migration
--      0016): a status state machine — applicants may only withdraw a pending
--      application; only the pet's rescuer may approve/reject/close. Prevents
--      applicants from self-approving via a direct write.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists "uuid-ossp"; -- present in prod (not strictly required)
create extension if not exists pg_cron;    -- nightly message archival

-- ── Tables ──────────────────────────────────────────────────────────────────
-- Order matters: profiles → pets → applications → the rest.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  updated_at timestamptz,
  email text,
  name text,
  bio text,
  specialities text[] default '{}'::text[],
  serving_areas text[] default '{}'::text[],
  response_time text,
  show_email boolean default true,
  show_phone boolean default true,
  show_whatsapp boolean default true,
  is_id_verified boolean default false,
  location text,
  is_admin boolean default false,
  is_auditor boolean default false
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  breed text not null,
  age text not null,
  status text default 'available'::text,
  image_url text not null,
  description text,
  created_at timestamptz default timezone('utc'::text, now()),
  species text,
  location text,
  gender text,
  gallery text[],
  fee integer default 0,
  rescuer_id uuid references public.profiles(id) on delete cascade,
  adopter_id uuid references public.profiles(id) on delete set null,
  traits text[] default '{}'::text[],
  is_vaccinated boolean default false,
  is_dewormed boolean default false,
  is_neutered boolean default false,
  is_flea_treated boolean default false,
  is_potty_trained boolean default false,
  featured_until timestamptz,
  questionnaire_config jsonb default '{"custom": null, "optional": []}'::jsonb,
  is_hidden boolean not null default false,
  review_status text not null default 'approved'::text,
  is_featured boolean not null default false,
  is_parvo_tested boolean default false,
  is_giardia_tested boolean default false,
  is_fiv_tested boolean default false,
  is_felv_tested boolean default false,
  is_fcov_tested boolean default false,
  is_heartworm_tested boolean default false,
  is_strictly_indoor boolean default false,
  constraint pets_status_check check (status = any (array['available'::text, 'adopted'::text, 'pending'::text])),
  constraint pets_review_status_check check (review_status = any (array['pending'::text, 'approved'::text, 'rejected'::text])),
  -- Defensive field bounds (migration 0018).
  constraint pets_fee_check check (fee is null or (fee >= 0 and fee <= 1000000)),
  constraint pets_name_length_check check (char_length(name) between 1 and 120),
  constraint pets_description_length_check check (description is null or char_length(description) <= 4000),
  constraint pets_breed_length_check check (char_length(breed) between 1 and 120)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id),
  q1 text[],
  q2 text,
  q3 text,
  q4 text,
  q5 text,
  q6 text,
  q7 text,
  status text default 'pending'::text,
  created_at timestamptz default timezone('utc'::text, now()),
  applicant_id uuid references public.profiles(id) on delete cascade,
  extra_answers jsonb default '{}'::jsonb,
  status_changed_at timestamptz not null default now(),
  constraint applications_status_check check (status in ('pending', 'approved', 'rejected', 'cancelled', 'closed'))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  read_at timestamptz,
  is_system boolean not null default false -- one-way notices (0019); not repliable
);

create table if not exists public.saved_pets (
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, pet_id)
);

create table if not exists public.rescuer_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  rescuer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, rescuer_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  details text,
  created_at timestamptz default now(),
  status text default 'open'::text
);

create table if not exists public.listing_boosts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade,
  tier text not null,
  days integer not null,
  price numeric not null,
  status text not null default 'pending_verification'::text,
  created_at timestamptz default now(),
  receipt_url text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text,
  message text not null,
  created_at timestamptz default now(),
  status text default 'open'::text
);

create table if not exists public.state_rollouts (
  state_name text primary key,
  is_launched boolean not null default false,
  launched_at timestamptz
);

-- No foreign keys on the archive by design: it must survive deletion of the
-- profile/pet/application rows the live messages table cascades on.
create table if not exists public.messages_archive (
  id uuid primary key,
  sender_id uuid not null,
  recipient_id uuid not null,
  pet_id uuid,
  application_id uuid,
  content text not null,
  created_at timestamptz,
  read_at timestamptz,
  archived_at timestamptz not null default now()
);

-- Fixed-window rate limit counters (migration 0017). Written only by the
-- check_rate_limit() SECURITY DEFINER function below.
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

-- Mini-game best scores (migrations 0020–0022) — one row per player PER GAME
-- (Paw Match, Pet 2048). Public read (leaderboard); writes ONLY via the
-- submitGameScore server action (service role), so no insert/update policies.
create table if not exists public.game_scores (
  user_id uuid not null references public.profiles(id) on delete cascade,
  game text not null default 'paw-match',
  best_score integer not null check (best_score >= 0 and best_score <= 1000000),
  top_scores integer[] not null default '{}', -- player's 3 best results, desc (0021)
  games_played integer not null default 1 check (games_played >= 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, game),
  constraint game_scores_game_check check (game in ('paw-match', 'pet-2048', 'flappy-kitten', 'pet-tetris')),
  constraint game_scores_top_scores_max3 check (coalesce(array_length(top_scores, 1), 0) <= 3)
);

-- ── Indexes (beyond primary keys) ───────────────────────────────────────────

create index if not exists idx_applications_pet_created
  on public.applications (pet_id, created_at desc);
create index if not exists idx_game_scores_game_best
  on public.game_scores (game, best_score desc);
create index if not exists idx_messages_recipient_unread
  on public.messages (recipient_id) where read_at is null;
create index if not exists idx_messages_recipient_created
  on public.messages (recipient_id, created_at desc);
create index if not exists idx_messages_sender_created
  on public.messages (sender_id, created_at desc);

-- ── Functions ───────────────────────────────────────────────────────────────

-- Auto-create a profile row whenever an auth user is created (signup or OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;

-- Approving an application adopts the pet out and auto-rejects competing
-- pending applications; cancelling one puts the pet back on the market.
create or replace function public.sync_pet_status_on_app_update()
returns trigger
language plpgsql
security definer
as $$
begin
  raise notice 'Trigger fired for app ID: %, status: %', new.id, new.status;

  if new.status = 'approved' then
    update pets set status = 'adopted', adopter_id = new.applicant_id where id = new.pet_id;
    update applications set status = 'rejected'
    where pet_id = new.pet_id and id != new.id and status = 'pending';
  elsif new.status = 'cancelled' then
    update pets set status = 'available', adopter_id = null where id = new.pet_id;
  end if;

  return new;
end;
$$;

-- Only the service role (admin/auditor server actions) may change moderation
-- columns; everyone else's updates silently keep the old values.
create or replace function public.protect_moderation_columns()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.role() != 'service_role' then
    new.review_status := old.review_status;
    new.is_featured := old.is_featured;
  end if;
  return new;
end;
$$;

-- Retention clock for message archival starts when the status last changed.
create or replace function public.set_application_status_changed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end;
$$;

-- Moves whole conversations whose application has been terminal
-- (rejected/cancelled/closed) for `retention_days` into messages_archive.
create or replace function public.archive_ended_message_threads(retention_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  moved_count integer;
begin
  with candidates as (
    select m.id
    from public.messages m
    join lateral (
      select a.status, a.status_changed_at
      from public.applications a
      where a.pet_id = m.pet_id
        and a.applicant_id in (m.sender_id, m.recipient_id)
      order by a.created_at desc
      limit 1
    ) latest_app on true
    where m.pet_id is not null
      and latest_app.status in ('rejected', 'cancelled', 'closed')
      and latest_app.status_changed_at < now() - make_interval(days => retention_days)
  ),
  moved as (
    delete from public.messages m
    using candidates c
    where m.id = c.id
    returning m.id, m.sender_id, m.recipient_id, m.pet_id, m.application_id, m.content, m.created_at, m.read_at
  )
  insert into public.messages_archive (id, sender_id, recipient_id, pet_id, application_id, content, created_at, read_at)
  select id, sender_id, recipient_id, pet_id, application_id, content, created_at, read_at from moved;

  get diagnostics moved_count = row_count;
  return moved_count;
end;
$$;

revoke execute on function public.archive_ended_message_threads(integer) from public, anon, authenticated;

-- Fixed-window rate limiter (migration 0017). Returns true when ALLOWED.
-- Callers pass a server-derived key (never raw user input).
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

revoke all on function public.check_rate_limit(text, integer, interval) from public;
grant execute on function public.check_rate_limit(text, integer, interval) to anon, authenticated;

-- State machine for application status changes (added in 0016). RLS governs
-- who can see/update a row; this governs which transitions each party may make,
-- so a direct client/database write cannot self-approve or grief.
create or replace function public.enforce_application_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_applicant boolean;
  is_rescuer boolean;
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if new.status is not distinct from old.status then
    return new;
  end if;

  is_applicant := (auth.uid() = old.applicant_id);
  is_rescuer := auth.uid() in (select rescuer_id from public.pets where pets.id = old.pet_id);

  if is_applicant then
    if old.status = 'pending' and new.status = 'cancelled' then
      return new;
    end if;
    raise exception 'Applicants may only withdraw a pending application (attempted % -> %)', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if is_rescuer then
    if (old.status = 'pending' and new.status in ('approved', 'rejected'))
       or (old.status = 'approved' and new.status in ('rejected', 'closed')) then
      return new;
    end if;
    raise exception 'Invalid status transition % -> % for this listing', old.status, new.status
      using errcode = 'check_violation';
  end if;

  raise exception 'Not authorized to change this application''s status'
    using errcode = 'insufficient_privilege';
end;
$$;

-- ── Triggers ────────────────────────────────────────────────────────────────

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_application_status_change on public.applications;
create trigger on_application_status_change
  after update of status on public.applications
  for each row
  when (old.status is distinct from new.status)
  execute function public.sync_pet_status_on_app_update();

drop trigger if exists enforce_application_transition on public.applications;
create trigger enforce_application_transition
  before update on public.applications
  for each row execute function public.enforce_application_transition();

drop trigger if exists trg_applications_status_changed on public.applications;
create trigger trg_applications_status_changed
  before update on public.applications
  for each row execute function public.set_application_status_changed_at();

drop trigger if exists pets_protect_moderation on public.pets;
create trigger pets_protect_moderation
  before update on public.pets
  for each row execute function public.protect_moderation_columns();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- All policies below reproduce production exactly. Policies marked LEGACY are
-- older duplicates/permissive variants that remain active in production;
-- because policies are OR-ed, the permissive ones dominate. Kept for parity.

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;
alter table public.saved_pets enable row level security;
alter table public.rescuer_follows enable row level security;
alter table public.reports enable row level security;
alter table public.listing_boosts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.state_rollouts enable row level security;
alter table public.messages_archive enable row level security; -- no policies: admin-only
alter table public.rate_limits enable row level security; -- no policies: written only by check_rate_limit()
alter table public.game_scores enable row level security;

-- game_scores: public leaderboard; writes only via service role
drop policy if exists "Leaderboard is publicly readable" on public.game_scores;
create policy "Leaderboard is publicly readable" on public.game_scores for select using (true);

-- profiles
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id); -- LEGACY (subset of public read)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id); -- LEGACY duplicate
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id); -- LEGACY duplicate

-- pets
drop policy if exists "Pets are publicly readable" on public.pets;
create policy "Pets are publicly readable" on public.pets for select using (true);
drop policy if exists "Enable read access for all users" on public.pets;
create policy "Enable read access for all users" on public.pets for select using (true); -- LEGACY duplicate
drop policy if exists "Public can read pets" on public.pets;
create policy "Public can read pets" on public.pets for select using (true); -- LEGACY duplicate
drop policy if exists "Users can insert their own pets" on public.pets;
create policy "Users can insert their own pets" on public.pets for insert with check (auth.uid() = rescuer_id);
-- Removed in 0016: the permissive "Enable insert access for all users" (with check true).
drop policy if exists "Enable insert access for all users" on public.pets;
drop policy if exists "Owners can update their own pets" on public.pets;
create policy "Owners can update their own pets" on public.pets for update using (auth.uid() = rescuer_id);

-- applications
drop policy if exists "Applicants can view their own applications" on public.applications;
create policy "Applicants can view their own applications" on public.applications for select using (applicant_id = auth.uid());
drop policy if exists "Rescuers can view applications for their pets" on public.applications;
create policy "Rescuers can view applications for their pets" on public.applications for select
  using (pet_id in (select pets.id from pets where pets.rescuer_id = auth.uid()));
drop policy if exists "Applicants and rescuers can view applications" on public.applications;
create policy "Applicants and rescuers can view applications" on public.applications for select
  using ((auth.uid() = applicant_id) or (auth.uid() in (select pets.rescuer_id from pets where pets.id = applications.pet_id))); -- LEGACY (union of the two above)
drop policy if exists "Applicants can create applications" on public.applications;
create policy "Applicants can create applications" on public.applications for insert
  with check ((auth.uid() = applicant_id) and (not (auth.uid() in (select pets.rescuer_id from pets where pets.id = applications.pet_id))));
-- Removed in 0016: the permissive "Allow public inserts for applications" (with check true).
drop policy if exists "Allow public inserts for applications" on public.applications;
drop policy if exists "Applicants and rescuers can update applications" on public.applications;
create policy "Applicants and rescuers can update applications" on public.applications for update
  using ((auth.uid() = applicant_id) or (auth.uid() in (select pets.rescuer_id from pets where pets.id = applications.pet_id)));
drop policy if exists "Rescuers can update applications for their pets" on public.applications;
create policy "Rescuers can update applications for their pets" on public.applications for update
  using (pet_id in (select pets.id from pets where pets.rescuer_id = auth.uid())); -- LEGACY (subset of the one above)

-- messages
drop policy if exists "Sender and recipient can view messages" on public.messages;
create policy "Sender and recipient can view messages" on public.messages for select
  using ((auth.uid() = sender_id) or (auth.uid() = recipient_id));
drop policy if exists "Users can send messages as themselves" on public.messages;
create policy "Users can send messages as themselves" on public.messages for insert
  with check (auth.uid() = sender_id);
drop policy if exists "Recipients can mark their messages read" on public.messages;
create policy "Recipients can mark their messages read" on public.messages for update
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- saved_pets
drop policy if exists "Users manage their own saved pets" on public.saved_pets;
create policy "Users manage their own saved pets" on public.saved_pets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- rescuer_follows
drop policy if exists "Follows are publicly readable" on public.rescuer_follows;
create policy "Follows are publicly readable" on public.rescuer_follows for select using (true);
drop policy if exists "Users manage their own follows" on public.rescuer_follows;
create policy "Users manage their own follows" on public.rescuer_follows for all
  using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- reports (write-only for users; read via service role in admin panel)
drop policy if exists "Anyone can file a report" on public.reports;
create policy "Anyone can file a report" on public.reports for insert with check (true);

-- listing_boosts
drop policy if exists "Rescuers manage their own boosts" on public.listing_boosts;
create policy "Rescuers manage their own boosts" on public.listing_boosts for all
  using (auth.uid() in (select pets.rescuer_id from pets where pets.id = listing_boosts.pet_id))
  with check (auth.uid() in (select pets.rescuer_id from pets where pets.id = listing_boosts.pet_id));

-- contact_messages (write-only for users; read via service role in admin panel)
drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message" on public.contact_messages for insert with check (true);

-- state_rollouts (read-only for users; writes via service role in admin panel)
drop policy if exists "Anyone can read state rollouts" on public.state_rollouts;
create policy "Anyone can read state rollouts" on public.state_rollouts for select using (true);

-- ── Storage: buckets and policies ───────────────────────────────────────────
-- Creating buckets via SQL works in the Supabase SQL Editor; alternatively
-- create them in Dashboard → Storage (pet-photos = Public, boost-receipts =
-- Private) and keep only the policies below.

-- Size/mime limits added in migration 0017.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('boost-receipts', 'boost-receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public Read Access" on storage.objects;
create policy "Public Read Access" on storage.objects for select
  using (bucket_id = 'pet-photos'::text);
-- pet-photos uploads require login (tightened from anonymous in 0017).
drop policy if exists "Public Upload Access" on storage.objects;
drop policy if exists "Authenticated can upload pet photos" on storage.objects;
create policy "Authenticated can upload pet photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'pet-photos'::text);
drop policy if exists "Authenticated users can upload boost receipts" on storage.objects;
create policy "Authenticated users can upload boost receipts" on storage.objects for insert to authenticated
  with check (bucket_id = 'boost-receipts'::text);
-- boost-receipts has NO select policy: receipts are only readable through
-- short-lived signed URLs created by the service-role client (auditor panel).

-- ── Seed data: state_rollouts ───────────────────────────────────────────────
-- All 16 Malaysian states/territories. Launched flags mirror the production
-- snapshot of 2026-07-04; adjust per environment via /admin/locations.

insert into public.state_rollouts (state_name, is_launched) values
  ('Kuala Lumpur', true),
  ('Selangor', true),
  ('Penang', true),
  ('Johor', true),
  ('Melaka', true),
  ('Perak', false),
  ('Negeri Sembilan', false),
  ('Pahang', false),
  ('Terengganu', false),
  ('Kelantan', false),
  ('Kedah', false),
  ('Perlis', false),
  ('Sabah', false),
  ('Sarawak', false),
  ('Putrajaya', false),
  ('Labuan', false)
on conflict (state_name) do nothing;

update public.state_rollouts set launched_at = now() where is_launched and launched_at is null;

-- ── Scheduled jobs ──────────────────────────────────────────────────────────
-- Nightly message archival at 03:17 UTC.

do $$
begin
  perform cron.unschedule('archive-ended-messages');
exception when others then
  null; -- job didn't exist yet
end;
$$;

select cron.schedule(
  'archive-ended-messages',
  '17 3 * * *',
  $$select public.archive_ended_message_threads(90);$$
);

-- ============================================================================
-- Done. Now run supabase/setup/verify.sql to self-check the installation,
-- then continue with docs/INSTALL.md (auth configuration, app deployment).
-- ============================================================================
