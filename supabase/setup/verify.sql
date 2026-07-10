-- ============================================================================
-- FurriHearts — post-installation self-check (read-only)
-- ============================================================================
-- Run this in the SQL Editor after init.sql. Every row in the result should
-- show ok = true. A false row tells you which part of init.sql to re-run.
-- ============================================================================

with checks as (

  -- 1. All 11 application tables exist
  select 'tables: all 11 exist' as check,
         (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relkind = 'r'
            and c.relname in ('profiles','pets','applications','messages','messages_archive',
                              'saved_pets','rescuer_follows','reports','listing_boosts',
                              'contact_messages','state_rollouts','rate_limits','game_scores')) = 13 as ok

  -- 2. RLS enabled on every table (messages_archive + rate_limits + game_scores included)
  union all
  select 'rls: enabled on all 13 tables',
         (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity) >= 13

  -- 3. Policy counts match init.sql (28 public + 3 storage; the two permissive
  --    legacy INSERT policies were removed in migration 0016)
  union all
  select 'policies: 28 on public schema',
         (select count(*) from pg_policies where schemaname = 'public') = 28
  union all
  select 'policies: permissive legacy INSERT policies removed',
         not exists (select 1 from pg_policies where schemaname = 'public'
                     and policyname in ('Enable insert access for all users',
                                        'Allow public inserts for applications'))
  union all
  select 'policies: 3 on storage.objects',
         (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects') = 3

  -- 4. Functions
  union all
  select 'functions: all 7 exist',
         (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname in ('handle_new_user','sync_pet_status_on_app_update',
                              'protect_moderation_columns','set_application_status_changed_at',
                              'archive_ended_message_threads','enforce_application_transition',
                              'check_rate_limit')) = 7

  -- 5. Triggers
  union all
  select 'trigger: on_auth_user_created (auth.users)',
         exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid
                 join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'auth' and c.relname = 'users' and t.tgname = 'on_auth_user_created')
  union all
  select 'trigger: on_application_status_change',
         exists (select 1 from pg_trigger where tgname = 'on_application_status_change' and not tgisinternal)
  union all
  select 'trigger: trg_applications_status_changed',
         exists (select 1 from pg_trigger where tgname = 'trg_applications_status_changed' and not tgisinternal)
  union all
  select 'trigger: pets_protect_moderation',
         exists (select 1 from pg_trigger where tgname = 'pets_protect_moderation' and not tgisinternal)
  union all
  select 'trigger: enforce_application_transition',
         exists (select 1 from pg_trigger where tgname = 'enforce_application_transition' and not tgisinternal)
  union all
  select 'constraint: applications_status_check',
         exists (select 1 from pg_constraint where conname = 'applications_status_check')

  -- 6. Indexes
  union all
  select 'indexes: messaging + applications indexes exist',
         (select count(*) from pg_indexes where schemaname = 'public'
          and indexname in ('idx_messages_recipient_unread','idx_messages_recipient_created',
                            'idx_messages_sender_created','idx_applications_pet_created')) = 4

  -- 7. Storage buckets
  union all
  select 'storage: pet-photos bucket is PUBLIC',
         exists (select 1 from storage.buckets where id = 'pet-photos' and public)
  union all
  select 'storage: boost-receipts bucket is PRIVATE',
         exists (select 1 from storage.buckets where id = 'boost-receipts' and not public)
  union all
  select 'storage: pet-photos has size + mime limits (0017)',
         exists (select 1 from storage.buckets where id = 'pet-photos'
                 and file_size_limit is not null and allowed_mime_types is not null)
  union all
  select 'storage: anonymous upload policy removed (0017)',
         not exists (select 1 from pg_policies where schemaname = 'storage'
                     and tablename = 'objects' and policyname = 'Public Upload Access')

  -- 8. Seed data
  union all
  select 'seed: state_rollouts has all 16 states',
         (select count(*) from public.state_rollouts) = 16

  -- 9. Cron job
  union all
  select 'cron: archive-ended-messages scheduled',
         exists (select 1 from cron.job where jobname = 'archive-ended-messages' and active)

  -- 10. Extensions
  union all
  select 'extensions: pgcrypto + pg_cron installed',
         (select count(*) from pg_extension where extname in ('pgcrypto','pg_cron')) = 2
)
select * from checks order by ok, "check";
