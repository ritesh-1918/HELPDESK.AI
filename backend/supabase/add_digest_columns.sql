-- Migration: Add weekly digest email columns to system_settings
-- Issue: #208 - AI-Generated Weekly Digest Email Report
--
-- Run this SQL in the Supabase SQL Editor to add the required columns.

-- Add digest configuration columns to system_settings table
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS weekly_digest_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS digest_recipients JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS digest_day TEXT DEFAULT 'monday';

-- Add comments for documentation
COMMENT ON COLUMN system_settings.weekly_digest_enabled IS 'Enable weekly digest email reports for administrators';
COMMENT ON COLUMN system_settings.digest_recipients IS 'JSON array of email addresses to receive the weekly digest';
COMMENT ON COLUMN system_settings.digest_day IS 'Day of the week to send the digest (monday-sunday)';
