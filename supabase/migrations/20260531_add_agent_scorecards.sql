-- Migration: Agent Performance Scorecard
-- Issue #774

-- Add performance columns to profiles/agents table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS performance_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS performance_updated_at TIMESTAMPTZ;

-- Scorecard cache table (avoids recomputing on every page load)
CREATE TABLE IF NOT EXISTS agent_scorecards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  resolution_rate FLOAT DEFAULT 0.0,
  avg_resolution_hours FLOAT DEFAULT 0.0,
  sla_compliance FLOAT DEFAULT 0.0,
  ticket_volume INTEGER DEFAULT 0,
  performance_score FLOAT DEFAULT 0.0,
  ai_coaching_tip TEXT DEFAULT '',
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id)
);

CREATE INDEX IF NOT EXISTS idx_scorecards_company
ON agent_scorecards(company_id);

CREATE INDEX IF NOT EXISTS idx_scorecards_score
ON agent_scorecards(performance_score DESC);
