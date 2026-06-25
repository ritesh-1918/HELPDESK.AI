-- Migration: Add RPC function for admin metrics using CTEs
-- This function computes analytics metrics in a single database pass using the composite indexes.

CREATE OR REPLACE FUNCTION get_admin_metrics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH volume AS (
      SELECT date_trunc('day', created_at) AS day, count(*) AS count
      FROM tickets
      WHERE company_id = p_company_id AND status IS NOT NULL
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 30
  ),
  sla AS (
      SELECT priority, sla_status, count(*) AS count
      FROM tickets
      WHERE company_id = p_company_id
      GROUP BY 1, 2
  ),
  categories AS (
      SELECT category, count(*) AS count
      FROM tickets
      WHERE company_id = p_company_id
      GROUP BY 1
  ),
  agents AS (
      SELECT assigned_team, count(*) AS open_tickets
      FROM tickets
      WHERE company_id = p_company_id AND status NOT IN ('closed', 'resolved')
      GROUP BY 1
  ),
  resolution AS (
      SELECT
        CASE
          WHEN extract(epoch from (closed_at - created_at))/3600 < 1 THEN '< 1h'
          WHEN extract(epoch from (closed_at - created_at))/3600 < 4 THEN '1-4h'
          WHEN extract(epoch from (closed_at - created_at))/3600 < 24 THEN '4-24h'
          ELSE '> 24h'
        END AS bucket,
        count(*) AS count
      FROM tickets
      WHERE company_id = p_company_id AND status IN ('closed', 'resolved') AND closed_at IS NOT NULL
      GROUP BY 1
  ),
  overview AS (
      SELECT status, count(*) AS count
      FROM tickets
      WHERE company_id = p_company_id
      GROUP BY 1
  )
  SELECT json_build_object(
      'volume', COALESCE((SELECT json_agg(row_to_json(volume)) FROM volume), '[]'::json),
      'sla', COALESCE((SELECT json_agg(row_to_json(sla)) FROM sla), '[]'::json),
      'categories', COALESCE((SELECT json_agg(row_to_json(categories)) FROM categories), '[]'::json),
      'agents', COALESCE((SELECT json_agg(row_to_json(agents)) FROM agents), '[]'::json),
      'resolution', COALESCE((SELECT json_agg(row_to_json(resolution)) FROM resolution), '[]'::json),
      'overview', COALESCE((SELECT json_agg(row_to_json(overview)) FROM overview), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
