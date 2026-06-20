-- The pets UPDATE RLS policy only checks row ownership (auth.uid() = rescuer_id),
-- not which columns changed, so a rescuer could otherwise self-approve or
-- self-feature their own listing directly via the browser Supabase client,
-- bypassing the Auditor entirely. This trigger reverts those two columns to
-- their prior value unless the write comes from the service-role client
-- (i.e. through an Auditor server action in app/actions/auditor.ts).
create or replace function public.protect_moderation_columns()
returns trigger as $$
begin
  if auth.role() != 'service_role' then
    new.review_status := old.review_status;
    new.is_featured := old.is_featured;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists pets_protect_moderation on public.pets;
create trigger pets_protect_moderation before update on public.pets
  for each row execute function public.protect_moderation_columns();
