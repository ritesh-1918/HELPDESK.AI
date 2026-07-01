
-- Notification Queue Table for Persistent Email Delivery
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- e.g., 'INSERT', 'OTP', 'MAGIC_LINK', etc.
    payload JSONB NOT NULL, -- All notification data (email, record, code, link, etc.)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'failed', 'sent')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    last_attempted_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_at ON notification_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_attempts ON notification_queue(attempts);

