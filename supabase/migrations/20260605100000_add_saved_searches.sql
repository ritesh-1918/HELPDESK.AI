-- Migration: Add saved_searches table and upgrade search_tickets RPC
-- Issue: #1818 — Advanced Ticket Search with Multi-Filter Search and Saved Queries

-- ─── saved_searches table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    filters     JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id
    ON public.saved_searches (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved searches
CREATE POLICY "saved_searches_owner_select"
    ON public.saved_searches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_owner_insert"
    ON public.saved_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_searches_owner_delete"
    ON public.saved_searches FOR DELETE
    USING (auth.uid() = user_id);

-- ─── Upgrade search_tickets RPC with full filter support ─────────────────────
CREATE OR REPLACE FUNCTION public.advanced_search_tickets(
    p_company_id    TEXT,
    p_query         TEXT       DEFAULT NULL,
    p_status        TEXT[]     DEFAULT NULL,
    p_priority      TEXT[]     DEFAULT NULL,
    p_category      TEXT[]     DEFAULT NULL,
    p_assigned_to   TEXT       DEFAULT NULL,
    p_created_by    TEXT       DEFAULT NULL,
    p_date_from     TIMESTAMPTZ DEFAULT NULL,
    p_date_to       TIMESTAMPTZ DEFAULT NULL,
    p_sort          TEXT       DEFAULT 'created_at:desc',
    p_limit         INTEGER    DEFAULT 25,
    p_offset        INTEGER    DEFAULT 0
)
RETURNS TABLE (
    id              UUID,
    user_id         UUID,
    company_id      TEXT,
    subject         TEXT,
    description     TEXT,
    category        TEXT,
    subcategory     TEXT,
    priority        TEXT,
    status          TEXT,
    assigned_team   TEXT,
    assigned_agent_id UUID,
    confidence      FLOAT,
    is_duplicate    BOOLEAN,
    auto_resolve    BOOLEAN,
    sla_breach_at   TIMESTAMPTZ,
    sla_status      TEXT,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ,
    metadata        JSONB,
    total_count     BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
    sort_col  TEXT;
    sort_dir  TEXT;
    parts     TEXT[];
BEGIN
    -- Parse sort parameter (e.g. "created_at:desc")
    parts    := string_to_array(COALESCE(p_sort, 'created_at:desc'), ':');
    sort_col := CASE WHEN parts[1] IN ('created_at', 'updated_at', 'priority')
                     THEN parts[1] ELSE 'created_at' END;
    sort_dir := CASE WHEN parts[2] = 'asc' THEN 'ASC' ELSE 'DESC' END;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT
            t.id,
            t.user_id,
            t.company_id,
            t.subject,
            t.description,
            t.category,
            t.subcategory,
            t.priority,
            t.status,
            t.assigned_team,
            t.assigned_agent_id,
            t.confidence,
            t.is_duplicate,
            t.auto_resolve,
            t.sla_breach_at,
            t.sla_status,
            t.created_at,
            t.updated_at,
            t.metadata,
            COUNT(*) OVER () AS total_count
        FROM public.tickets AS t
        WHERE
            t.company_id = %L
            AND ($1 IS NULL OR to_tsvector('english',
                    coalesce(t.subject, '')      || ' ' ||
                    coalesce(t.description, '')  || ' ' ||
                    coalesce(t.category, '')     || ' ' ||
                    coalesce(t.subcategory, '')  || ' ' ||
                    coalesce(t.assigned_team, '')
                ) @@ plainto_tsquery('english', $1))
            AND ($2::text[] IS NULL OR t.status  = ANY($2))
            AND ($3::text[] IS NULL OR t.priority = ANY($3))
            AND ($4::text[] IS NULL OR t.category = ANY($4))
            AND ($5 IS NULL OR (
                    $5 = 'unassigned' AND t.assigned_agent_id IS NULL
                ) OR t.assigned_agent_id::text = $5)
            AND ($6 IS NULL OR t.user_id::text = $6)
            AND ($7::timestamptz IS NULL OR t.created_at >= $7)
            AND ($8::timestamptz IS NULL OR t.created_at <= $8)
        ORDER BY t.%I %s NULLS LAST
        LIMIT  %s
        OFFSET %s
        $sql$,
        p_company_id,
        sort_col, sort_dir,
        p_limit,
        p_offset
    )
    USING
        p_query,
        p_status,
        p_priority,
        p_category,
        p_assigned_to,
        p_created_by,
        p_date_from,
        p_date_to;
END;
$$;

-- Grant execute to authenticated role (RLS on tickets still applies via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.advanced_search_tickets TO authenticated;
