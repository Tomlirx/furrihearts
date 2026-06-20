-- Lets rescuers take a listing offline (hide from public Browse/Home/Featured)
-- without changing its adoption status, and bring it back online later.
alter table public.pets add column if not exists is_hidden boolean not null default false;
