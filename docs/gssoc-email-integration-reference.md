# GSSoC Email Integration Reference Manual

This guide covers email integration setup and configuration for HELPDESK.AI notifications.

## Table of Contents

- [Overview](#overview)
- [Email Providers](#email-providers)
- [Configuration](#configuration)
- [Notification Types](#notification-types)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

HELPDESK.AI uses email notifications to keep users informed about ticket updates, digest summaries, and admin alerts. The notification routing middleware gates all emails based on company-level settings.

## Email Providers

### Supabase Auth Emails

For authentication-related emails (signup, password reset):
- Configured in Supabase Dashboard → Authentication → Email Templates
- Uses Supabase's built-in SMTP or custom SMTP

### Application Emails

For ticket notifications and digests:
- Uses environment-configured SMTP settings
- Supports any SMTP-compatible provider

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@helpdesk.ai

# Notification Settings
NOTIFICATION_ROUTING_LOG_LEVEL=info
```

### Company-Level Settings

Email notifications are controlled per-company in the `system_settings` table:

```sql
-- Enable/disable email notifications
UPDATE system_settings 
SET email_notifications = true 
WHERE company_id = 'your-company-uuid';

-- Set digest frequency (daily, weekly, disabled)
UPDATE system_settings 
SET digest_frequency = 'daily' 
WHERE company_id = 'your-company-uuid';

-- Enable/disable admin alerts
UPDATE system_settings 
SET admin_alerts = true 
WHERE company_id = 'your-company-uuid';
```

## Notification Types

| Type | Description | Frequency |
|------|-------------|-----------|
| `daily_digest` | Summary of ticket activity | Daily at configured time |
| `weekly_digest` | Weekly ticket summary | Weekly |
| `ticket_alert` | Individual ticket updates | Real-time |
| `admin_alert` | High-priority escalations | Real-time |
| `push_notification` | In-app notifications | Real-time |

## Testing

### Test Email Sending

```python
# Test SMTP connection
import smtplib

with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)
    server.sendmail(FROM_ADDR, TO_ADDR, test_message)
```

### Test Notification Routing

```python
from backend.services.notification_routing import load

middleware = load()
should_send = middleware.should_send_email_notification(
    company_id="test-company-id",
    notification_type=NotificationType.DAILY_DIGEST
)
print(f"Should send: {should_send}")
```

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `.env`
2. Verify `email_notifications` is `true` in `system_settings`
3. Check `NOTIFICATION_ROUTING_LOG_LEVEL` for debug output
4. Ensure SMTP port is not blocked by firewall

### Wrong Frequency

1. Check `digest_frequency` in `system_settings`
2. Valid values: `daily`, `weekly`, `disabled`
3. Invalidate cache after changes: `middleware.invalidate_cache(company_id)`

### Rate Limiting

- MyMemory API: 5000 words/day for translations
- SMTP providers have their own rate limits
- Consider queue-based sending for high volume
