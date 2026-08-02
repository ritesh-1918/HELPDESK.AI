-- Migration: Comprehensive Row-Level Security Policies
-- Implements multi-tenant data isolation for Issue #3204

-- ============================================================================
-- 1. Enable RLS on all existing tables
-- ============================================================================

-- Tickets table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tickets_select_policy ON tickets
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY tickets_insert_policy ON tickets
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY tickets_update_policy ON tickets
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    ) WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        OR id = auth.uid()
    );

CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- 2. Create RLS for related tables
-- ============================================================================

-- Ticket Comments
ALTER TABLE IF EXISTS ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_comments_select_policy ON ticket_comments
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM tickets WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY ticket_comments_insert_policy ON ticket_comments
    FOR INSERT WITH CHECK (
        ticket_id IN (
            SELECT id FROM tickets WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Ticket Attachments
ALTER TABLE IF EXISTS ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_attachments_select_policy ON ticket_attachments
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM tickets WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Company Settings
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_settings_select_policy ON system_settings
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        OR company_id IS NULL  -- Global settings
    );

CREATE POLICY system_settings_update_policy ON system_settings
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
        AND (
            SELECT role FROM profiles WHERE id = auth.uid() AND company_id = system_settings.company_id
        ) IN ('admin', 'master_admin')
    );

-- ============================================================================
-- 3. Create helper functions for RLS enforcement
-- ============================================================================

-- Function to check if user has company access
CREATE OR REPLACE FUNCTION user_has_company_access(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND profiles.company_id = user_has_company_access.company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin role in company
CREATE OR REPLACE FUNCTION user_is_company_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns ticket
CREATE OR REPLACE FUNCTION user_owns_ticket(ticket_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM tickets t
        JOIN profiles p ON t.company_id = p.company_id
        WHERE t.id = ticket_id AND p.id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Audit tables for compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS rls_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    table_name TEXT,
    operation TEXT,  -- SELECT, INSERT, UPDATE, DELETE
    allowed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_rls_audit_user ON rls_audit_log(user_id, created_at DESC);

-- ============================================================================
-- 5. RLS Bypass for specific use cases
-- ============================================================================

-- Create a service role table for system operations
CREATE TABLE IF NOT EXISTS system_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: System role can bypass RLS for legitimate operations
-- This is handled in application code via service_role client

-- ============================================================================
-- 6. Comment on RLS policies
-- ============================================================================

COMMENT ON POLICY tickets_select_policy ON tickets IS 'Users can only see tickets from their company';
COMMENT ON POLICY tickets_insert_policy ON tickets IS 'Users can only create tickets in their company';
COMMENT ON POLICY profiles_select_policy ON profiles IS 'Users can see company profiles and own profile';
COMMENT ON FUNCTION user_has_company_access IS 'Check if user has access to company';
COMMENT ON FUNCTION user_is_company_admin IS 'Check if user is admin in their company';
COMMENT ON FUNCTION user_owns_ticket IS 'Check if user belongs to ticket company';
COMMENT ON TABLE rls_audit_log IS 'Audit trail for RLS policy enforcement';
