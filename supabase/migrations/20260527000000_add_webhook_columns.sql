-- Add Slack and Microsoft Teams webhook URL columns to system_settings
-- Supports Issue #175: Slack & Teams webhook integration for critical ticket alerts

ALTER TABLE system_settings
    ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS teams_webhook_url TEXT DEFAULT '';
