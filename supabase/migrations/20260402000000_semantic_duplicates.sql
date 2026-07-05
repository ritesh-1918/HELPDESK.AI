-- Semantic Duplicate Detection — pgvector-powered ticket similarity search
-- Issue #74: AI-Driven Semantic Duplicate Ticket Detection with Vector Embeddings

-- =========================================================================
-- 1. Enable pgvector extension
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- =========================================================================
-- 2. Add vector column to tickets table
-- =========================================================================

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS description_vector vector(384);

-- Index for fast cosine similarity queries (IVFFlat is good for <100K rows)
CREATE INDEX IF NOT EXISTS idx_tickets_description_vector
  ON public.tickets
  USING ivfflat (description_vector vector_cosine_ops)
  WITH (lists = 100);

-- =========================================================================
-- 3. Similarity search RPC — company-scoped cosine similarity
-- =========================================================================

-- Drop existing if present
DROP FUNCTION IF EXISTS match_tickets;

CREATE OR REPLACE FUNCTION match_tickets(
    query_vector vector(384),
    match_threshold float DEFAULT 0.70,
    match_count int DEFAULT 5,
    tenant_company_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    ticket_id text,
    subject text,
    summary text,
    description text,
    priority text,
    status text,
    assigned_team text,
    company_id uuid,
    similarity float,
    created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.ticket_id,
        t.subject,
        t.summary,
        t.description,
        t.priority,
        t.status,
        t.assigned_team,
        t.company_id,
        1 - (t.description_vector <=> query_vector) AS similarity,
        t.created_at
    FROM public.tickets t
    WHERE
        t.description_vector IS NOT NULL
        AND (1 - (t.description_vector <=> query_vector)) > match_threshold
        AND (tenant_company_id IS NULL OR t.company_id = tenant_company_id)
        -- Exclude resolved/closed tickets from duplicate matching
        AND (t.status IS NULL OR (
            LOWER(t.status) NOT LIKE '%resolv%'
            AND LOWER(t.status) NOT LIKE '%closed%'
        ))
    ORDER BY t.description_vector <=> query_vector
    LIMIT match_count;
END;
$$;

-- =========================================================================
-- 4. System settings table for dynamic duplicate_sensitivity
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    description text DEFAULT '',
    updated_at timestamptz DEFAULT now()
);

-- Insert default duplicate sensitivity
INSERT INTO public.system_settings (key, value, description)
VALUES (
    'duplicate_detection',
    '{"sensitivity": 0.85, "enabled": true, "max_candidates": 5}'::jsonb,
    'Duplicate detection configuration: sensitivity (0.0-1.0), enabled, max_candidates'
)
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- 5. Add parent_ticket_id for linking duplicates
-- =========================================================================

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS parent_ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS is_potential_duplicate boolean DEFAULT false;

-- Index for finding duplicate chains
CREATE INDEX IF NOT EXISTS idx_tickets_parent_ticket_id ON public.tickets(parent_ticket_id);

-- =========================================================================
-- 6. RLS for system_settings
-- =========================================================================

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system settings" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Master admins can manage system settings" ON public.system_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'master_admin'
        )
    );

-- =========================================================================
-- 7. Grant permissions
-- =========================================================================

GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON TABLE public.system_settings TO authenticated;
GRANT ALL ON TABLE public.system_settings TO service_role;
