-- Add digest preference to company_settings table
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS digest_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS digest_admin_email TEXT,
ADD COLUMN IF NOT EXISTS digest_last_sent TIMESTAMPTZ;

-- Index for quick lookup of opted-in companies
CREATE INDEX IF NOT EXISTS idx_company_digest_enabled
ON company_settings(digest_enabled)
WHERE digest_enabled = true;