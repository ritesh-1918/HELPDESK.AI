-- Add digest_enabled column to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS digest_enabled BOOLEAN DEFAULT false;
