-- Run this manually in the Supabase SQL editor.
--
-- Likely root cause of "I can't see pets I listed" on /browse and elsewhere:
-- if a table was ever created/touched via the Supabase dashboard Table
-- Editor, RLS is often enabled by default with zero policies attached —
-- which silently blocks ALL reads (even the owner's own rows) without
-- surfacing a visible error in the app. This adds the minimum policies
-- needed for the app to actually work: pets and profiles are publicly
-- readable (it's a public adoption listing site), writes are scoped to
-- the owning user, and applications/messages are scoped to the two
-- parties involved.
--
-- Safe to run multiple times — `drop policy if exists` before each create.

alter table public.pets enable row level security;
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;
alter table public.saved_pets enable row level security;
alter table public.rescuer_follows enable row level security;
alter table public.reports enable row level security;
alter table public.listing_boosts enable row level security;
alter table public.contact_messages enable row level security;

-- pets: anyone can browse; only the owning rescuer can create/edit their own
drop policy if exists "Pets are publicly readable" on public.pets;
create policy "Pets are publicly readable" on public.pets for select using (true);

drop policy if exists "Users can insert their own pets" on public.pets;
create policy "Users can insert their own pets" on public.pets for insert with check (auth.uid() = rescuer_id);

drop policy if exists "Owners can update their own pets" on public.pets;
create policy "Owners can update their own pets" on public.pets for update using (auth.uid() = rescuer_id);

-- profiles: public read (names/bios shown on pet cards and public profiles), self-write only
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable" on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- applications: visible to the applicant and the pet's rescuer; either can update status
drop policy if exists "Applicants and rescuers can view applications" on public.applications;
create policy "Applicants and rescuers can view applications" on public.applications for select using (
  auth.uid() = applicant_id
  or auth.uid() in (select rescuer_id from public.pets where pets.id = applications.pet_id)
);

drop policy if exists "Applicants can create applications" on public.applications;
create policy "Applicants can create applications" on public.applications for insert with check (auth.uid() = applicant_id);

drop policy if exists "Applicants and rescuers can update applications" on public.applications;
create policy "Applicants and rescuers can update applications" on public.applications for update using (
  auth.uid() = applicant_id
  or auth.uid() in (select rescuer_id from public.pets where pets.id = applications.pet_id)
);

-- messages: visible to sender and recipient only
drop policy if exists "Sender and recipient can view messages" on public.messages;
create policy "Sender and recipient can view messages" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = recipient_id
);

drop policy if exists "Users can send messages as themselves" on public.messages;
create policy "Users can send messages as themselves" on public.messages for insert with check (auth.uid() = sender_id);

-- saved_pets: a user manages only their own saved list
drop policy if exists "Users manage their own saved pets" on public.saved_pets;
create policy "Users manage their own saved pets" on public.saved_pets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- rescuer_follows: a user manages only their own follows; follow counts are publicly readable
drop policy if exists "Follows are publicly readable" on public.rescuer_follows;
create policy "Follows are publicly readable" on public.rescuer_follows for select using (true);

drop policy if exists "Users manage their own follows" on public.rescuer_follows;
create policy "Users manage their own follows" on public.rescuer_follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- reports: anyone (incl. anonymous) can file one; nobody can read them back via the app (admin-only via Supabase dashboard)
drop policy if exists "Anyone can file a report" on public.reports;
create policy "Anyone can file a report" on public.reports for insert with check (true);

-- listing_boosts: the pet's rescuer can create/view their own boost requests
drop policy if exists "Rescuers manage their own boosts" on public.listing_boosts;
create policy "Rescuers manage their own boosts" on public.listing_boosts for all using (
  auth.uid() in (select rescuer_id from public.pets where pets.id = listing_boosts.pet_id)
) with check (
  auth.uid() in (select rescuer_id from public.pets where pets.id = listing_boosts.pet_id)
);

-- contact_messages: anyone (incl. anonymous) can submit; nobody can read back via the app
drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message" on public.contact_messages for insert with check (true);
