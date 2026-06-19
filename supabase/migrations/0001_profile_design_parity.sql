-- Run this manually in the Supabase SQL editor.
-- Purely additive — safe to run any time, but the app code that consumes
-- these columns/tables should already be deployed first (same
-- deploy-then-migrate discipline as the earlier role-merge migration).

-- profiles: rescuer/adopter profile content (all nullable/defaulted, no backfill needed)
alter table public.profiles
  add column if not exists location text,
  add column if not exists bio text,
  add column if not exists specialities text[] default '{}',
  add column if not exists serving_areas text[] default '{}',
  add column if not exists response_time text,
  add column if not exists show_email boolean default true,
  add column if not exists show_phone boolean default true,
  add column if not exists show_whatsapp boolean default true,
  add column if not exists is_id_verified boolean default false;

-- pets: boost/featured support + rescuer-customized questionnaire
alter table public.pets
  add column if not exists featured_until timestamptz,
  add column if not exists questionnaire_config jsonb default '{"optional": [], "custom": null}'::jsonb;

-- applications: answers to rescuer-chosen optional/custom questions
alter table public.applications
  add column if not exists extra_answers jsonb default '{}'::jsonb;

-- saved pets (replaces guest-only local storage for logged-in users)
create table if not exists public.saved_pets (
  user_id uuid references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, pet_id)
);

-- follow a rescuer (adopter "Rescuers I Follow")
create table if not exists public.rescuer_follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  rescuer_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, rescuer_id)
);

-- generic report (listing / rescuer / adopter)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  details text,
  created_at timestamptz default now()
);

-- boost listing requests (manual-verification model, no real payment gateway)
create table if not exists public.listing_boosts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade,
  tier text not null,
  days int not null,
  price numeric not null,
  status text not null default 'pending_verification',
  created_at timestamptz default now()
);

-- contact form submissions from /contact
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text,
  message text not null,
  created_at timestamptz default now()
);

-- adopter <-> rescuer direct messages (200-word limit enforced in app code)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
