-- Migration: Ticket Sentiment Analysis
-- Issue #775

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS sentiment_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS frustration_level TEXT DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS sentiment_signals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_escalated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sentiment_analyzed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tickets_frustration
ON tickets(frustration_level, company_id);

CREATE INDEX IF NOT EXISTS idx_tickets_auto_escalated
ON tickets(auto_escalated, company_id)
WHERE auto_escalated = true;