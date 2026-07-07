-- Alter system_settings table to add weekly digest email fields
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS digest_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS digest_admin_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS digest_last_sent TIMESTAMPTZ DEFAULT NULL;
