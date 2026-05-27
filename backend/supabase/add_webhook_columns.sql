-- Migration: Add webhook integration columns to system_settings
-- Issue: #175 - Slack & Teams webhook integration for critical ticket alerts
--
-- Run this SQL in the Supabase SQL Editor to add the required columns.

-- Add webhook URL columns to system_settings table
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS teams_webhook_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS webhook_notifications_enabled BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN system_settings.slack_webhook_url IS 'Slack incoming webhook URL for critical ticket alerts';
COMMENT ON COLUMN system_settings.teams_webhook_url IS 'Microsoft Teams incoming webhook URL for critical ticket alerts';
COMMENT ON COLUMN system_settings.webhook_notifications_enabled IS 'Global toggle for webhook-based notifications';
