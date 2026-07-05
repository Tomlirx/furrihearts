-- ============================================================================
-- 0016 — Application status guard (P0 security fix)
-- ============================================================================
-- Closes a critical hole: the applications UPDATE RLS policy let the APPLICANT
-- set any status, including 'approved'. Combined with the client-side status
-- write in manage-applications/my-applications and the AFTER trigger
-- sync_pet_status_on_app_update (which marks the pet adopted on 'approved'),
-- any logged-in user could self-approve and steal a pet, or repeatedly cancel
-- an approved application to grief the rescuer.
--
-- RLS WITH CHECK cannot reference OLD, so a state machine (who may make which
-- transition) is enforced with a BEFORE UPDATE trigger. RLS still governs row
-- visibility; the trigger governs allowed transitions — so even a direct
-- browser/database write is blocked.
--
-- Also removes the permissive legacy INSERT policies on pets/applications
-- (previously scoped to a separate task; consolidated here).
-- Idempotent: safe to re-run.
-- ============================================================================

-- ── 1. Status enum constraint ───────────────────────────────────────────────
-- Guard against garbage/unknown statuses. (Existing rows verified to be one of
-- these; adjust the cleanup below if a stray value ever appears.)
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications
  add constraint applications_status_check
  check (status in ('pending', 'approved', 'rejected', 'cancelled', 'closed'));

-- ── 2. Remove permissive legacy INSERT policies ─────────────────────────────
-- These 'with check (true)' policies let anyone insert rows with an arbitrary
-- rescuer_id/applicant_id. The stricter owner-scoped policies remain.
drop policy if exists "Enable insert access for all users" on public.pets;
drop policy if exists "Allow public inserts for applications" on public.applications;

-- ── 3. State-machine transition guard ───────────────────────────────────────
create or replace function public.enforce_application_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_applicant boolean;
  is_rescuer boolean;
begin
  -- Service role (admin panel, server-side maintenance) bypasses the machine.
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- Non-status edits are unaffected.
  if new.status is not distinct from old.status then
    return new;
  end if;

  is_applicant := (auth.uid() = old.applicant_id);
  is_rescuer := auth.uid() in (
    select rescuer_id from public.pets where pets.id = old.pet_id
  );

  -- Applicant: may only withdraw a still-pending application.
  if is_applicant then
    if old.status = 'pending' and new.status = 'cancelled' then
      return new;
    end if;
    raise exception 'Applicants may only withdraw a pending application (attempted % -> %)', old.status, new.status
      using errcode = 'check_violation';
  end if;

  -- Rescuer: may review a pending application, or reject/close an approved one.
  if is_rescuer then
    if (old.status = 'pending' and new.status in ('approved', 'rejected'))
       or (old.status = 'approved' and new.status in ('rejected', 'closed')) then
      return new;
    end if;
    raise exception 'Invalid status transition % -> % for this listing', old.status, new.status
      using errcode = 'check_violation';
  end if;

  raise exception 'Not authorized to change this application''s status'
    using errcode = 'insufficient_privilege';
end;
$$;

drop trigger if exists enforce_application_transition on public.applications;
create trigger enforce_application_transition
  before update on public.applications
  for each row execute function public.enforce_application_transition();
