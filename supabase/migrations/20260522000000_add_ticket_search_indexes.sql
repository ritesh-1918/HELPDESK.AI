-- Add optimized multi-tenant indexes and full-text search support for tickets

-- Composite index for tenant-safe sorting and pagination
CREATE INDEX IF NOT EXISTS idx_tickets_company_id_created_at ON public.tickets (company_id, created_at DESC);

-- Low-cardinality indexes for fast analytics filters
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON public.tickets (category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_team ON public.tickets (assigned_team);

-- Full-text search GIN index on searchable ticket text
CREATE INDEX IF NOT EXISTS idx_tickets_fts ON public.tickets USING GIN (
  to_tsvector('english',
    coalesce(subject, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(subcategory, '') || ' ' ||
    coalesce(assigned_team, '')
  )
);

-- Tenant-safe full-text search helper function
CREATE OR REPLACE FUNCTION public.search_tickets(
  query_text text,
  company_id text,
  limit_rows integer DEFAULT 50,
  offset_rows integer DEFAULT 0
)
RETURNS SETOF public.tickets
LANGUAGE sql STABLE
AS $$
  SELECT t.*
  FROM public.tickets AS t
  WHERE t.company_id = search_tickets.company_id
    AND (
      to_tsvector('english',
        coalesce(t.subject, '') || ' ' ||
        coalesce(t.description, '') || ' ' ||
        coalesce(t.category, '') || ' ' ||
        coalesce(t.subcategory, '') || ' ' ||
        coalesce(t.assigned_team, '')
      )
      @@ plainto_tsquery('english', query_text)
    )
  ORDER BY t.created_at DESC
  LIMIT limit_rows
  OFFSET offset_rows;
$$;
