-- A rescuer should not be able to submit an adoption application for their
-- own listed pet. The insert policy only checked that the applicant matches
-- the logged-in user; it never compared against the pet's rescuer_id.
drop policy if exists "Applicants can create applications" on public.applications;
create policy "Applicants can create applications" on public.applications for insert with check (
  auth.uid() = applicant_id
  and auth.uid() not in (select rescuer_id from public.pets where pets.id = applications.pet_id)
);
