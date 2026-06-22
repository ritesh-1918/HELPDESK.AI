-- Add encrypted PII columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS address      TEXT,
  ADD COLUMN IF NOT EXISTS employee_id  TEXT,
  ADD COLUMN IF NOT EXISTS department   TEXT;

COMMENT ON COLUMN profiles.phone_number IS 'AES-256 GCM encrypted PII';
COMMENT ON COLUMN profiles.address      IS 'AES-256 GCM encrypted PII';
COMMENT ON COLUMN profiles.employee_id  IS 'AES-256 GCM encrypted PII';
COMMENT ON COLUMN profiles.department   IS 'AES-256 GCM encrypted PII';

CREATE TABLE IF NOT EXISTS encryption_audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT,
  organization_id  TEXT NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  operation_type   TEXT NOT NULL CHECK (operation_type IN ('ENCRYPT','DECRYPT','ROTATE','RE-ENCRYPT')),
  field_accessed   TEXT,
  key_version      INTEGER NOT NULL,
  request_source   TEXT,
  status           TEXT NOT NULL CHECK (status IN ('SUCCESS','FAILED')),
  error_message    TEXT
);

CREATE TABLE IF NOT EXISTS encryption_key_rotation_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  key_version  INTEGER NOT NULL,
  active_from  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL,
  retired_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);
