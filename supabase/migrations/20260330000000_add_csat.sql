ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS csat_rating INTEGER; ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS csat_comment TEXT;
