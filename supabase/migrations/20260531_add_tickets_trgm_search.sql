-- Enable the pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram indexes for high-performance global search on ticket fields
CREATE INDEX IF NOT EXISTS tickets_subject_trgm_idx ON public.tickets USING gin (subject gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tickets_description_trgm_idx ON public.tickets USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tickets_category_trgm_idx ON public.tickets USING gin (category gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tickets_status_trgm_idx ON public.tickets USING gin (status gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tickets_assigned_team_trgm_idx ON public.tickets USING gin (assigned_team gin_trgm_ops);
