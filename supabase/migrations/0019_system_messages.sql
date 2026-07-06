-- ============================================================================
-- 0019 — Flag system notifications so they are not repliable
-- ============================================================================
-- Listing approval/rejection notices (app/actions/auditor.ts, admin.ts) are
-- one-way system messages. When the reviewer is also the pet's rescuer, the
-- notice ends up with sender_id = recipient_id, so replying hit
-- "You cannot message yourself". Mark these as system messages and hide the
-- reply box for them. Idempotent.
-- ============================================================================

alter table public.messages add column if not exists is_system boolean not null default false;
