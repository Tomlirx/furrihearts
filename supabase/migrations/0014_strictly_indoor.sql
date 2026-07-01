-- Add strictly indoor flag to pets table
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS is_strictly_indoor boolean DEFAULT false;
