-- Create ticket_ratings table for CSAT (Customer Satisfaction) scores
CREATE TABLE IF NOT EXISTS ticket_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    company_id TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    agent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ticket_id, user_id)
);

-- Index for fast lookups by ticket
CREATE INDEX IF NOT EXISTS idx_ticket_ratings_ticket_id ON ticket_ratings(ticket_id);

-- Index for company-level aggregation
CREATE INDEX IF NOT EXISTS idx_ticket_ratings_company_id ON ticket_ratings(company_id);

-- Index for agent-level CSAT queries
CREATE INDEX IF NOT EXISTS idx_ticket_ratings_agent_id ON ticket_ratings(agent_id);

-- RLS: Users can only see/insert ratings for their own company
ALTER TABLE ticket_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings for their company"
    ON ticket_ratings FOR SELECT
    USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id'));

CREATE POLICY "Users can insert ratings for their company"
    ON ticket_ratings FOR INSERT
    WITH CHECK (
        company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')
        AND user_id = auth.uid()
    );
