-- Ticket email notification queue and delivery audit tables.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT jsonb_build_object(
    'email_enabled', true,
    'ticket_created', true,
    'ticket_assigned', true,
    'ticket_updated', true,
    'ticket_resolved', true,
    'new_comment', true
);

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    channel text NOT NULL DEFAULT 'email',
    event_type text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    ticket_id text,
    user_id text,
    company_id text,
    recipient_email text NOT NULL,
    recipient_name text,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    attempts integer NOT NULL DEFAULT 0,
    last_error text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT notifications_channel_check CHECK (channel IN ('email')),
    CONSTRAINT notifications_status_check CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
    CONSTRAINT notifications_event_type_check CHECK (
        event_type IN ('ticket_created', 'ticket_assigned', 'ticket_updated', 'ticket_resolved', 'new_comment')
    )
);

ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_status_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_status_check
CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped'));

CREATE TABLE IF NOT EXISTS email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id uuid,
    ticket_id text,
    user_id text,
    recipient_email text NOT NULL,
    provider text,
    provider_message_id text,
    status text NOT NULL,
    error text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'email_logs_notification_id_fkey'
          AND conrelid = 'email_logs'::regclass
    ) THEN
        ALTER TABLE email_logs
        ADD CONSTRAINT email_logs_notification_id_fkey
        FOREIGN KEY (notification_id)
        REFERENCES notifications(id)
        ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email logs" ON email_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_notifications_pending_email
    ON notifications(status, channel, created_at)
    WHERE status = 'pending' AND channel = 'email';

CREATE INDEX IF NOT EXISTS idx_notifications_ticket_id
    ON notifications(ticket_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_notification_id
    ON email_logs(notification_id);

CREATE OR REPLACE FUNCTION claim_pending_email_notifications(batch_limit integer DEFAULT 25)
RETURNS SETOF notifications
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE notifications
    SET status = 'processing',
        updated_at = now()
    WHERE id IN (
        SELECT id
        FROM notifications
        WHERE channel = 'email'
          AND status = 'pending'
        ORDER BY created_at
        LIMIT GREATEST(batch_limit, 0)
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
$$;

REVOKE EXECUTE ON FUNCTION claim_pending_email_notifications(integer) FROM PUBLIC, anon, authenticated;
GRANT ALL ON notifications TO service_role;
GRANT ALL ON email_logs TO service_role;
GRANT EXECUTE ON FUNCTION claim_pending_email_notifications(integer) TO service_role;
