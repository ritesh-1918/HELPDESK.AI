-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on ticket description and subject for fast trigram matching
CREATE INDEX IF NOT EXISTS idx_tickets_subject_trgm ON tickets USING gin (subject gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tickets_description_trgm ON tickets USING gin (description gin_trgm_ops);

-- Helper function: search tickets by subject/description with pg_trgm similarity
CREATE OR REPLACE FUNCTION search_tickets(
    search_query TEXT,
    result_limit INT DEFAULT 20,
    similarity_threshold FLOAT DEFAULT 0.2,
    _company_id TEXT DEFAULT NULL
)
RETURNS TABLE(
    id BIGINT,
    ticket_id TEXT,
    subject TEXT,
    description TEXT,
    category TEXT,
    subcategory TEXT,
    priority TEXT,
    status TEXT,
    assigned_team TEXT,
    company_id TEXT,
    created_at TIMESTAMPTZ,
    similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.ticket_id,
        t.subject,
        t.description,
        t.category,
        t.subcategory,
        t.priority,
        t.status,
        t.assigned_team,
        t.company_id,
        t.created_at,
        GREATEST(
            COALESCE(similarity(t.subject, search_query), 0),
            COALESCE(similarity(t.description, search_query), 0)
        ) AS similarity
    FROM tickets t
    WHERE
        (_company_id IS NULL OR t.company_id = _company_id)
        AND (
            t.subject % search_query
            OR t.description % search_query
            OR t.subject ILIKE '%' || search_query || '%'
            OR t.description ILIKE '%' || search_query || '%'
        )
    ORDER BY similarity DESC
    LIMIT result_limit;
END;
$$;
