-- Migration: Add WebSocket and Live Chat Support
-- This migration creates tables and indexes needed for real-time features

-- ============================================================================
-- 1. Ticket Chat Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ticket_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient chat history retrieval
CREATE INDEX IF NOT EXISTS idx_chat_messages_ticket_created 
    ON ticket_chat_messages(ticket_id, created_at DESC);

-- Index for company-scoped queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_company 
    ON ticket_chat_messages(company_id);

-- ============================================================================
-- 2. Message Read Receipts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES ticket_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Index for checking read status
CREATE INDEX IF NOT EXISTS idx_read_receipts_message 
    ON message_read_receipts(message_id);

-- ============================================================================
-- 3. WebSocket Connection Log (Optional - for analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS websocket_connection_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disconnected_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    user_agent TEXT,
    ip_address INET
);

-- Index for connection analytics
CREATE INDEX IF NOT EXISTS idx_ws_log_company_connected 
    ON websocket_connection_log(company_id, connected_at DESC);

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on chat messages
ALTER TABLE ticket_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read chat messages for tickets in their company
CREATE POLICY chat_messages_read_policy ON ticket_chat_messages
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can insert chat messages for tickets in their company
CREATE POLICY chat_messages_insert_policy ON ticket_chat_messages
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Enable RLS on read receipts
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own read receipts
CREATE POLICY read_receipts_read_policy ON message_read_receipts
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Users can insert their own read receipts
CREATE POLICY read_receipts_insert_policy ON message_read_receipts
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Enable RLS on connection log
ALTER TABLE websocket_connection_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own connection logs
CREATE POLICY ws_log_read_policy ON websocket_connection_log
    FOR SELECT
    USING (user_id = auth.uid());

-- ============================================================================
-- 5. Functions for Real-Time Triggers
-- ============================================================================

-- Function to notify on ticket updates
CREATE OR REPLACE FUNCTION notify_ticket_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify via pg_notify for real-time updates
    PERFORM pg_notify(
        'ticket_updates',
        json_build_object(
            'ticket_id', NEW.id,
            'company_id', NEW.company_id,
            'action', TG_OP,
            'timestamp', NOW()
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on ticket updates
DROP TRIGGER IF EXISTS ticket_update_notify ON tickets;
CREATE TRIGGER ticket_update_notify
    AFTER INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION notify_ticket_update();

-- Function to notify on new chat messages
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'chat_messages',
        json_build_object(
            'ticket_id', NEW.ticket_id,
            'company_id', NEW.company_id,
            'message_id', NEW.id,
            'user_id', NEW.user_id,
            'user_name', NEW.user_name,
            'timestamp', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on new chat messages
CREATE TRIGGER chat_message_notify
    AFTER INSERT ON ticket_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_chat_message();

-- ============================================================================
-- 6. Helper Views
-- ============================================================================

-- View: Unread message counts per user
CREATE OR REPLACE VIEW unread_message_counts AS
SELECT 
    tm.ticket_id,
    p.id as user_id,
    COUNT(tm.id) as unread_count
FROM ticket_chat_messages tm
CROSS JOIN profiles p
LEFT JOIN message_read_receipts rr ON (tm.id = rr.message_id AND rr.user_id = p.id)
WHERE tm.company_id = p.company_id
  AND tm.user_id != p.id
  AND rr.id IS NULL
GROUP BY tm.ticket_id, p.id;

-- ============================================================================
-- 7. Comments
-- ============================================================================

COMMENT ON TABLE ticket_chat_messages IS 'Stores real-time chat messages for tickets';
COMMENT ON TABLE message_read_receipts IS 'Tracks which users have read which messages';
COMMENT ON TABLE websocket_connection_log IS 'Logs WebSocket connections for analytics';
COMMENT ON FUNCTION notify_ticket_update() IS 'Sends pg_notify event on ticket updates';
COMMENT ON FUNCTION notify_chat_message() IS 'Sends pg_notify event on new chat messages';
