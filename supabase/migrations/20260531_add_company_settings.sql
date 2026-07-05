-- Create system_settings table for storing per-company system configuration

-- NOTE: migration filename contains 'add_company_settings'. The migration now creates
-- `system_settings` per the unified schema; filename unchanged for migration ordering.

CREATE TABLE IF NOT EXISTS system_settings (
    company_id            UUID UNIQUE NOT NULL,
    ai_confidence_threshold FLOAT   DEFAULT 0.80,
    duplicate_sensitivity   FLOAT   DEFAULT 0.85,
    enable_auto_resolve     BOOLEAN DEFAULT FALSE,
    auto_close_enabled      BOOLEAN DEFAULT TRUE,
    auto_close_days         INTEGER DEFAULT 7,
    email_notifications     BOOLEAN DEFAULT TRUE,
    admin_alerts            BOOLEAN DEFAULT TRUE,
    digest_frequency        TEXT    DEFAULT 'daily'
);

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Service role (backend) has full access
CREATE POLICY "Service role full access" ON system_settings
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policy 2: Users can view settings for their company
CREATE POLICY "Users can view own company settings" ON system_settings
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_companies WHERE user_id = auth.uid()
        )
    );

-- Trigger to auto-update updated_at on modification
CREATE TRIGGER update_system_settings_timestamp
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create index on company_id for fast lookups
CREATE INDEX idx_system_settings_company_id ON system_settings(company_id);

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;
