-- Message archival: once an application's lifecycle has ended
-- (rejected / cancelled / closed), its conversation is frozen (see
-- app/actions/messages.ts). 90 days after the status change, those messages
-- are moved out of the hot `messages` table into `messages_archive` so the
-- live table stays small as traffic grows. Archived messages are invisible
-- to the app (RLS with no policies) but remain queryable by admins for
-- audits or disputes.
--
-- Also adds the indexes the messaging queries rely on — the navbar now polls
-- unread messages every 60 seconds per logged-in user.

-- ── 1. Indexes for the hot messaging queries ────────────────────────────────

-- Unread badge poll: recipient_id + read_at is null (partial index stays tiny).
create index if not exists idx_messages_recipient_unread
  on public.messages (recipient_id) where read_at is null;

-- getInbox / getSentMessages: newest-first per user.
create index if not exists idx_messages_recipient_created
  on public.messages (recipient_id, created_at desc);
create index if not exists idx_messages_sender_created
  on public.messages (sender_id, created_at desc);

-- sendMessage guard + archival: latest application per pet.
create index if not exists idx_applications_pet_created
  on public.applications (pet_id, created_at desc);

-- ── 2. Track WHEN an application reached its current status ────────────────
-- The retention clock starts at the status change, not at application
-- creation. Existing rows start counting from this migration (conservative).

alter table public.applications
  add column if not exists status_changed_at timestamptz not null default now();

create or replace function public.set_application_status_changed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_applications_status_changed on public.applications;
create trigger trg_applications_status_changed
  before update on public.applications
  for each row execute function public.set_application_status_changed_at();

-- ── 3. Archive table ────────────────────────────────────────────────────────
-- Same columns as messages plus archived_at. Deliberately no foreign keys:
-- the archive must survive deletion of the profile/pet/application rows the
-- live table cascades on.

create table if not exists public.messages_archive (
  id uuid primary key,
  sender_id uuid not null,
  recipient_id uuid not null,
  pet_id uuid,
  application_id uuid,
  content text not null,
  created_at timestamptz,
  read_at timestamptz,
  archived_at timestamptz not null default now()
);

-- RLS on with no policies: nobody can read it through the API; only the
-- service role / SQL editor (admin) can.
alter table public.messages_archive enable row level security;

-- ── 4. Archival function ────────────────────────────────────────────────────
-- A message qualifies when the latest application between its two
-- participants for its pet is terminal and has been for `retention_days`.
-- Pet-less messages (pet_id is null) have no lifecycle and are never archived.
-- Returns the number of messages moved (visible in cron.job_run_details).

create or replace function public.archive_ended_message_threads(retention_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  moved_count integer;
begin
  with candidates as (
    select m.id
    from public.messages m
    join lateral (
      select a.status, a.status_changed_at
      from public.applications a
      where a.pet_id = m.pet_id
        and a.applicant_id in (m.sender_id, m.recipient_id)
      order by a.created_at desc
      limit 1
    ) latest_app on true
    where m.pet_id is not null
      and latest_app.status in ('rejected', 'cancelled', 'closed')
      and latest_app.status_changed_at < now() - make_interval(days => retention_days)
  ),
  moved as (
    delete from public.messages m
    using candidates c
    where m.id = c.id
    returning m.id, m.sender_id, m.recipient_id, m.pet_id, m.application_id, m.content, m.created_at, m.read_at
  )
  insert into public.messages_archive (id, sender_id, recipient_id, pet_id, application_id, content, created_at, read_at)
  select id, sender_id, recipient_id, pet_id, application_id, content, created_at, read_at from moved;

  get diagnostics moved_count = row_count;
  return moved_count;
end;
$$;

revoke execute on function public.archive_ended_message_threads(integer) from public, anon, authenticated;

-- ── 5. Nightly schedule via pg_cron (03:17 UTC) ─────────────────────────────
-- If pg_cron cannot be enabled here, enable it in the Supabase dashboard
-- (Database → Extensions → pg_cron) and re-run this block.

create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('archive-ended-messages');
exception when others then
  null; -- job didn't exist yet
end;
$$;

select cron.schedule(
  'archive-ended-messages',
  '17 3 * * *',
  $$select public.archive_ended_message_threads(90);$$
);
