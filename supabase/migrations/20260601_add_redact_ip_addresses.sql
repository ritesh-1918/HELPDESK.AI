-- Migration: Add redact_ip_addresses column to system_settings
-- This column controls whether IPv4 addresses are also redacted by the PII engine.

ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS redact_ip_addresses BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN system_settings.redact_ip_addresses IS
  'When true, IPv4 addresses are also redacted by the PII engine (requires enable_pii_redaction=true).';
