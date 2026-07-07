-- Migration: Add tags array to tickets table
-- Issue #404 — Smart Ticket Tagging System

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_tickets_tags_gin
ON tickets USING GIN(tags);

CREATE OR REPLACE FUNCTION get_popular_tags(p_company_id TEXT, p_limit INT DEFAULT 20)
RETURNS TABLE(tag TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT unnested_tag AS tag, COUNT(*) AS count
  FROM (
    SELECT unnest(tags) AS unnested_tag
    FROM tickets
    WHERE company_id = p_company_id
      AND tags IS NOT NULL
      AND array_length(tags, 1) > 0
  ) sub
  GROUP BY unnested_tag
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
