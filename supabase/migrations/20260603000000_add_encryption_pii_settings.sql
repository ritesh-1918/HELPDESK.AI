-- Add encryption and PII redaction toggle columns to system_settings
-- Part of bounty #632: AES-256-GCM Payload Encryption and PII Redaction

ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS enable_encryption BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_pii_redaction BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN system_settings.enable_encryption IS 'When true, AES-256-GCM encryption is applied to sensitive ticket fields (contact_email, description, raw_text) before database storage';
COMMENT ON COLUMN system_settings.enable_pii_redaction IS 'When true, PII (emails, phone numbers, SSNs, API keys, credit cards) is automatically redacted from ticket data before backup';
