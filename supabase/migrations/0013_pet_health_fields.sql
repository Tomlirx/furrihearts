-- The listing form already lets a rescuer select these health/medical
-- checks, but the columns to store them never existed, so the selections
-- were silently dropped before reaching the database.
alter table public.pets
  add column if not exists is_parvo_tested boolean default false,
  add column if not exists is_giardia_tested boolean default false,
  add column if not exists is_fiv_tested boolean default false,
  add column if not exists is_felv_tested boolean default false,
  add column if not exists is_fcov_tested boolean default false,
  add column if not exists is_heartworm_tested boolean default false;
