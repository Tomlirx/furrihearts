-- ============================================================================
-- 0018 — Defensive CHECK constraints on pets fields
-- ============================================================================
-- The client validates these, but the DB had no bounds: a crafted request
-- could store a negative fee, an empty name, or an oversized description.
-- Bounds are generous (well above any real listing) so legitimate data is
-- unaffected. Verified against live data before adding. Idempotent.
-- ============================================================================

alter table public.pets drop constraint if exists pets_fee_check;
alter table public.pets add constraint pets_fee_check
  check (fee is null or (fee >= 0 and fee <= 1000000));

alter table public.pets drop constraint if exists pets_name_length_check;
alter table public.pets add constraint pets_name_length_check
  check (char_length(name) between 1 and 120);

alter table public.pets drop constraint if exists pets_description_length_check;
alter table public.pets add constraint pets_description_length_check
  check (description is null or char_length(description) <= 4000);

alter table public.pets drop constraint if exists pets_breed_length_check;
alter table public.pets add constraint pets_breed_length_check
  check (char_length(breed) between 1 and 120);
