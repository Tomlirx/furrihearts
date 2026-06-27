-- Remove all pets owned by lirixuan@gmail.com, plus related applications,
-- messages, listing_boosts, and saved_pets.

-- =========================================================================
-- PART 1 — DRY RUN (read-only, run this first)
-- =========================================================================

select id, email, first_name, last_name
from public.profiles
where email = 'lirixuan@gmail.com';

with target_user as (
  select id from public.profiles where email = 'lirixuan@gmail.com'
),
target_pets as (
  select id from public.pets where rescuer_id in (select id from target_user)
)
select id, name, status, review_status, created_at
from public.pets
where id in (select id from target_pets)
order by created_at;

with target_user as (
  select id from public.profiles where email = 'lirixuan@gmail.com'
),
target_pets as (
  select id from public.pets where rescuer_id in (select id from target_user)
)
select 'listing_boosts' as table_name, count(*) as row_count
from public.listing_boosts where pet_id in (select id from target_pets)
union all
select 'messages (about these pets)', count(*)
from public.messages where pet_id in (select id from target_pets)
union all
select 'applications (for these pets)', count(*)
from public.applications where pet_id in (select id from target_pets)
union all
select 'saved_pets (for these pets)', count(*)
from public.saved_pets where pet_id in (select id from target_pets)
union all
select 'pets (to delete)', count(*)
from target_pets;

-- =========================================================================
-- PART 2 — DELETE (run only after reviewing PART 1)
-- =========================================================================

with target_user as (
  select id from public.profiles where email = 'lirixuan@gmail.com'
),
target_pets as (
  select id from public.pets where rescuer_id in (select id from target_user)
)
delete from public.listing_boosts where pet_id in (select id from target_pets);

with target_user as (
  select id from public.profiles where email = 'lirixuan@gmail.com'
),
target_pets as (
  select id from public.pets where rescuer_id in (select id from target_user)
)
delete from public.messages where pet_id in (select id from target_pets);

with target_user as (
  select id from public.profiles where email = 'lirixuan@gmail.com'
),
target_pets as (
  select id from public.pets where rescuer_id in (select id from target_user)
)
delete from public.applications where pet_id in (select id from target_pets);

with target_user as (
  select id from public.profiles where email = 'lirixuan@gmail.com'
),
target_pets as (
  select id from public.pets where rescuer_id in (select id from target_user)
)
delete from public.saved_pets where pet_id in (select id from target_pets);

delete from public.pets
where rescuer_id in (select id from public.profiles where email = 'lirixuan@gmail.com');

-- =========================================================================
-- PART 3 — VERIFY (should return 0)
-- =========================================================================

select count(*) as remaining_pets_for_user
from public.pets
where rescuer_id in (select id from public.profiles where email = 'lirixuan@gmail.com');
