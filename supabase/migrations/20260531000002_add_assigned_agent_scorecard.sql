-- Migration: Add assigned_agent_id to tickets for per-agent scorecard queries
-- Issue #774: Real-Time Agent Performance Scorecard
-- This column links a ticket to the specific support agent who was assigned to resolve it.
-- It is nullable (existing tickets won't have this value).

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Index for fast per-agent scorecard queries
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_agent_id
    ON tickets(assigned_agent_id)
    WHERE assigned_agent_id IS NOT NULL;

-- Composite index for company-scoped agent queries (used by get_agent_metrics)
CREATE INDEX IF NOT EXISTS idx_tickets_company_agent
    ON tickets(company_id, assigned_agent_id, created_at DESC)
    WHERE assigned_agent_id IS NOT NULL;
