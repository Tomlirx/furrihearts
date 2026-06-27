-- One-time UAT-prep cleanup: remove rows whose owning account no longer exists.
--
-- Note: public.profiles.id has `references auth.users(id) on delete cascade`,
-- so a profile can never outlive its auth.users row — deleting a test account
-- in Supabase Auth always takes the profile with it automatically. That means
-- the real risk isn't orphaned *profiles*, it's rows in pets/applications/
-- messages/saved_pets/rescuer_follows/reports/listing_boosts that still point
-- at a profile (or pet) id that's since been deleted — possible if those
-- tables don't have an enforced FK + cascade back to profiles/pets.
--
-- Run PART 1 first and review the output. Only run PART 2 once you're happy
-- with what PART 1 shows. Safe to re-run — every delete is a no-op if there's
-- nothing left to match.

-- =========================================================================
-- PART 1 — DRY RUN (read-only, run this first)
-- =========================================================================

-- Sanity check: should always be 0 rows, given the cascade FK above.
select id, first_name, last_name, email, updated_at
from public.profiles
where id not in (select id from auth.users);

-- The real check: rows whose referenced profile/pet id no longer exists.
select 'pets (rescuer no longer exists)' as table_name, count(*) as row_count
from public.pets where rescuer_id not in (select id from public.profiles)
union all
select 'applications (applicant no longer exists)', count(*)
from public.applications where applicant_id not in (select id from public.profiles)
union all
select 'applications (pet no longer exists)', count(*)
from public.applications where pet_id is not null and pet_id not in (select id from public.pets)
union all
select 'messages (sender no longer exists)', count(*)
from public.messages where sender_id not in (select id from public.profiles)
union all
select 'messages (recipient no longer exists)', count(*)
from public.messages where recipient_id not in (select id from public.profiles)
union all
select 'messages (pet no longer exists)', count(*)
from public.messages where pet_id is not null and pet_id not in (select id from public.pets)
union all
select 'saved_pets (user no longer exists)', count(*)
from public.saved_pets where user_id not in (select id from public.profiles)
union all
select 'saved_pets (pet no longer exists)', count(*)
from public.saved_pets where pet_id not in (select id from public.pets)
union all
select 'rescuer_follows (follower no longer exists)', count(*)
from public.rescuer_follows where follower_id not in (select id from public.profiles)
union all
select 'rescuer_follows (rescuer no longer exists)', count(*)
from public.rescuer_follows where rescuer_id not in (select id from public.profiles)
union all
select 'reports (reporter no longer exists)', count(*)
from public.reports where reporter_id is not null and reporter_id not in (select id from public.profiles)
union all
select 'listing_boosts (pet no longer exists)', count(*)
from public.listing_boosts where pet_id not in (select id from public.pets);

-- =========================================================================
-- PART 2 — DELETE (run only after reviewing PART 1; edit/remove lines for
-- any table that came back 0 in PART 1, or that doesn't apply)
-- =========================================================================

-- begin;  -- uncomment to run inside an explicit transaction you can roll back

delete from public.listing_boosts
where pet_id not in (select id from public.pets);

delete from public.messages
where sender_id not in (select id from public.profiles)
   or recipient_id not in (select id from public.profiles)
   or (pet_id is not null and pet_id not in (select id from public.pets));

delete from public.applications
where applicant_id not in (select id from public.profiles)
   or (pet_id is not null and pet_id not in (select id from public.pets));

delete from public.saved_pets
where user_id not in (select id from public.profiles)
   or pet_id not in (select id from public.pets);

delete from public.rescuer_follows
where follower_id not in (select id from public.profiles)
   or rescuer_id not in (select id from public.profiles);

delete from public.reports
where reporter_id is not null and reporter_id not in (select id from public.profiles);

delete from public.pets
where rescuer_id not in (select id from public.profiles);

-- commit;  -- uncomment along with the begin; above if you wrapped this in a transaction

-- =========================================================================
-- PART 3 — VERIFY (re-run the PART 1 union-all query; every row_count should be 0)
-- =========================================================================
