-- Create weekly_digest_log table for tracking digest email sends
-- Prevents duplicate sends and provides audit trail

CREATE TABLE IF NOT EXISTS weekly_digest_log (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id      UUID NOT NULL,
    sent_at         TIMESTAMP WITH TIME ZONE DEFAULT now(),
    recipient_count INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE weekly_digest_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role (backend) has full access
CREATE POLICY "Service role full access" ON weekly_digest_log
    FOR ALL USING (auth.role() = 'service_role');

-- Index for fast lookups by company_id and sent_at (dedup check)
CREATE INDEX idx_weekly_digest_log_company_sent
    ON weekly_digest_log(company_id, sent_at DESC);

-- Add comment for documentation
COMMENT ON TABLE weekly_digest_log IS 'Tracks weekly digest email sends per company to prevent duplicates';
COMMENT ON COLUMN weekly_digest_log.company_id IS 'UUID of the company the digest was sent for';
COMMENT ON COLUMN weekly_digest_log.sent_at IS 'UTC timestamp when the digest was sent';
COMMENT ON COLUMN weekly_digest_log.recipient_count IS 'Number of admin recipients who received the digest';
