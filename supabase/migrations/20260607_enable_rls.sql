-- 20260607_enable_rls.sql
-- Security migration to enable Row Level Security (RLS) on all core public tables
-- This ensures that malicious actors cannot run arbitrary queries via the exposed Anon Key.

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;

-- 2. Define RLS Policies for "tickets"
-- Users can only view, insert, and update their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets" ON tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins and Master Admins can view/update all tickets
CREATE POLICY "Admins can view all tickets" ON tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master_admin')
        )
    );

CREATE POLICY "Admins can update all tickets" ON tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master_admin')
        )
    );

-- 3. Define RLS Policies for "profiles"
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles AS p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'master_admin')
        )
    );

-- 4. Define RLS Policies for "ticket_messages"
-- Users can view and insert messages only for tickets they own
CREATE POLICY "Users can view messages for own tickets" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_messages.ticket_id AND tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_messages.ticket_id AND tickets.user_id = auth.uid()
        )
    );

-- Admins can view and insert messages on any ticket
CREATE POLICY "Admins can view all messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master_admin')
        )
    );

CREATE POLICY "Admins can insert all messages" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master_admin')
        )
    );

-- 5. Define RLS Policies for "system_settings"
-- All authenticated users can view system settings (used for AI confidence thresholds, etc.)
CREATE POLICY "Authenticated users can view system settings" ON system_settings
    FOR SELECT USING (auth.role() = 'authenticated');
