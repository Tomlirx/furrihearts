-- Remove pet listings whose name starts with "test" (case-insensitive),
-- plus anything that depends on them, so they don't show up in UAT.

-- =========================================================================
-- PART 1 — DRY RUN (read-only, run this first)
-- =========================================================================

select id, name, rescuer_id, status, review_status, created_at
from public.pets
where name ilike 'test%'
order by created_at;

with target_pets as (
  select id from public.pets where name ilike 'test%'
)
select 'listing_boosts' as table_name, count(*) as row_count
from public.listing_boosts where pet_id in (select id from target_pets)
union all
select 'messages', count(*)
from public.messages where pet_id in (select id from target_pets)
union all
select 'applications', count(*)
from public.applications where pet_id in (select id from target_pets)
union all
select 'saved_pets', count(*)
from public.saved_pets where pet_id in (select id from target_pets)
union all
select 'pets (to delete)', count(*)
from target_pets;

-- =========================================================================
-- PART 2 — DELETE (run only after reviewing PART 1)
-- =========================================================================

with target_pets as (
  select id from public.pets where name ilike 'test%'
)
delete from public.listing_boosts where pet_id in (select id from target_pets);

with target_pets as (
  select id from public.pets where name ilike 'test%'
)
delete from public.messages where pet_id in (select id from target_pets);

with target_pets as (
  select id from public.pets where name ilike 'test%'
)
delete from public.applications where pet_id in (select id from target_pets);

with target_pets as (
  select id from public.pets where name ilike 'test%'
)
delete from public.saved_pets where pet_id in (select id from target_pets);

delete from public.pets where name ilike 'test%';

-- =========================================================================
-- PART 3 — VERIFY (should return 0)
-- =========================================================================

select count(*) as remaining_test_pets from public.pets where name ilike 'test%';
