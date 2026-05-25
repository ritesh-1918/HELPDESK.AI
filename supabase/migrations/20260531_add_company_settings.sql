-- system_settings table: per-company AI and SLA configuration
-- Corrected migration: replaces the previous broken version
-- Fixes: uses profiles table for RLS (not user_companies), adds updated_at column, safe policy creation

-- Drop old table if it exists (fresh create with correct schema)
DROP TABLE IF EXISTS system_settings CASCADE;

-- Create the table
CREATE TABLE system_settings (
    company_id              UUID        UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ai_confidence_threshold FLOAT       NOT NULL DEFAULT 0.80,
    duplicate_sensitivity   FLOAT       NOT NULL DEFAULT 0.85,
    enable_auto_resolve     BOOLEAN     NOT NULL DEFAULT FALSE,
    auto_close_enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
    auto_close_days         INTEGER     NOT NULL DEFAULT 7,
    email_notifications     BOOLEAN     NOT NULL DEFAULT TRUE,
    admin_alerts            BOOLEAN     NOT NULL DEFAULT TRUE,
    digest_frequency        TEXT        NOT NULL DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly')),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- Create system_settings table for storing per-company system configuration

-- NOTE: migration filename contains 'add_company_settings'. The migration now creates
-- `system_settings` per the unified schema; filename unchanged for migration ordering.

CREATE TABLE IF NOT EXISTS system_settings (
    company_id            UUID PRIMARY KEY,
    ai_confidence_threshold FLOAT   DEFAULT 0.80,
    duplicate_sensitivity   FLOAT   DEFAULT 0.85,
    enable_auto_resolve     BOOLEAN DEFAULT FALSE,
    auto_close_enabled      BOOLEAN DEFAULT TRUE,
    auto_close_days         INTEGER DEFAULT 7,
    email_notifications     BOOLEAN DEFAULT TRUE,
    admin_alerts            BOOLEAN DEFAULT TRUE,
    digest_frequency        TEXT    DEFAULT 'daily',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins/agents in the same company can read and write their settings
-- Uses profiles table (not user_companies which doesn't exist)
CREATE POLICY "Company members can manage own settings" ON system_settings
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view own company settings" ON system_settings
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin', 'master_admin')
        )
    );

-- Admins can create and update settings for their own company from the dashboard.
CREATE POLICY "Admins can insert own company settings" ON system_settings
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin', 'master_admin')
        )
    );

CREATE POLICY "Admins can update own company settings" ON system_settings
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin', 'master_admin')
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin', 'master_admin')
        )
    );

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on modification
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_timestamp();

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_company_id ON system_settings(company_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;
