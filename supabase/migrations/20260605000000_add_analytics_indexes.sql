-- Migration: Add composite indexes to accelerate analytics queries
-- Issue: #1819 – Admin Analytics Dashboard
-- These indexes support the six GET /admin/analytics/* endpoints.

-- 1. Volume trend: daily count of created tickets filtered by company + date window
CREATE INDEX IF NOT EXISTS idx_tickets_analytics_volume
    ON tickets (company_id, created_at DESC)
    WHERE status IS NOT NULL;

-- 2. SLA compliance: breach status grouped by company + priority
CREATE INDEX IF NOT EXISTS idx_tickets_analytics_sla
    ON tickets (company_id, priority, sla_status);

-- 3. Category breakdown: category counts per company
CREATE INDEX IF NOT EXISTS idx_tickets_analytics_categories
    ON tickets (company_id, category);

-- 4. Agent / team workload: open-ticket count grouped by assigned_team
CREATE INDEX IF NOT EXISTS idx_tickets_analytics_agents
    ON tickets (company_id, assigned_team, status);

-- 5. Resolution time histogram: closed resolved tickets
CREATE INDEX IF NOT EXISTS idx_tickets_analytics_resolution
    ON tickets (company_id, status, closed_at)
    WHERE closed_at IS NOT NULL;

-- 6. Overview KPIs: status + sla_status sweep per company
CREATE INDEX IF NOT EXISTS idx_tickets_analytics_overview
    ON tickets (company_id, status, sla_status);

COMMENT ON INDEX idx_tickets_analytics_volume    IS 'Speeds up /admin/analytics/volume endpoint';
COMMENT ON INDEX idx_tickets_analytics_sla       IS 'Speeds up /admin/analytics/sla endpoint';
COMMENT ON INDEX idx_tickets_analytics_categories IS 'Speeds up /admin/analytics/categories endpoint';
COMMENT ON INDEX idx_tickets_analytics_agents    IS 'Speeds up /admin/analytics/agents endpoint';
COMMENT ON INDEX idx_tickets_analytics_resolution IS 'Speeds up /admin/analytics/resolution-time endpoint';
COMMENT ON INDEX idx_tickets_analytics_overview  IS 'Speeds up /admin/analytics/overview endpoint';
