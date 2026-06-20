-- Admin-managed state-by-state rollout: which Malaysian states/territories are
-- visible in location dropdowns. Public read (no sensitive data), writes only
-- via the service-role admin client.
create table if not exists public.state_rollouts (
  state_name text primary key,
  is_launched boolean not null default false,
  launched_at timestamptz
);

insert into public.state_rollouts (state_name, is_launched, launched_at)
values
  ('Kuala Lumpur', true, now()), ('Selangor', true, now()),
  ('Penang', true, now()), ('Johor', true, now()),
  ('Perak', false, null), ('Melaka', false, null), ('Negeri Sembilan', false, null),
  ('Pahang', false, null), ('Terengganu', false, null), ('Kelantan', false, null),
  ('Kedah', false, null), ('Perlis', false, null), ('Sabah', false, null),
  ('Sarawak', false, null), ('Putrajaya', false, null), ('Labuan', false, null)
on conflict (state_name) do nothing;

alter table public.state_rollouts enable row level security;

drop policy if exists "Anyone can read state rollouts" on public.state_rollouts;
create policy "Anyone can read state rollouts" on public.state_rollouts for select using (true);
