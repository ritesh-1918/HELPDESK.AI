-- Add auto-close tracking columns to tickets table
-- These columns allow the auto-close service to track which tickets were automatically closed

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS auto_closed boolean DEFAULT false;

-- Create indexes for efficient auto-close job queries
-- Index 1: Find all resolved tickets efficiently
CREATE INDEX IF NOT EXISTS idx_tickets_status_updated_at ON tickets(status, updated_at DESC)
    WHERE status = 'resolved';

-- Index 2: Find recently auto-closed tickets
CREATE INDEX IF NOT EXISTS idx_tickets_auto_closed ON tickets(auto_closed, closed_at DESC)
    WHERE auto_closed = true;

-- Add comment for documentation
COMMENT ON COLUMN tickets.closed_at IS 'Timestamp when ticket was closed (auto-close or manual)';
COMMENT ON COLUMN tickets.auto_closed IS 'Flag indicating if ticket was auto-closed by the cron job';
