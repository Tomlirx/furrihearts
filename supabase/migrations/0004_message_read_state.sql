-- Adds read-state tracking to messages so the navbar can show an unread
-- "new message" badge for the logged-in user (ported from the original
-- static design's notification-bell component).

alter table public.messages add column if not exists read_at timestamptz;

-- Recipients need to be able to mark their own received messages as read.
-- (Existing select/insert policies from 0002_rls_policies.sql are untouched.)
drop policy if exists "Recipients can mark their messages read" on public.messages;
create policy "Recipients can mark their messages read" on public.messages for update using (
  auth.uid() = recipient_id
) with check (
  auth.uid() = recipient_id
);
