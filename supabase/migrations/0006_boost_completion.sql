-- Completes the boost review loop: lets a rescuer attach proof of payment
-- (QR-code transfer + receipt upload) and records who reviewed a request
-- and when, for audit purposes.
alter table public.listing_boosts add column if not exists receipt_url text;
alter table public.listing_boosts add column if not exists reviewed_by uuid references auth.users(id);
alter table public.listing_boosts add column if not exists reviewed_at timestamptz;
