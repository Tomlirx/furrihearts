-- Listing moderation: new listings are queued for Auditor review before going live.
-- review_status defaults to 'approved' so every existing live listing is grandfathered in;
-- only new rescuer-listing inserts explicitly set 'pending'.
alter table public.pets add column if not exists review_status text not null default 'approved'
  check (review_status in ('pending', 'approved', 'rejected'));

-- Permanent, auditor-curated Featured toggle — independent of the legacy paid-boost
-- featured_until system, which stays intact (hidden behind BOOST_ENABLED) for a future relaunch.
alter table public.pets add column if not exists is_featured boolean not null default false;

-- Auditor role: strictly separate from is_admin, granted from the Admin's steering board.
alter table public.profiles add column if not exists is_auditor boolean default false;
