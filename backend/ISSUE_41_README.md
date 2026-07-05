# Issue #41: Quick Start Guide

## What's New?

This release implements two major features:

1. **Automated Ticket Auto-Close Cron Job** — Automatically close resolved tickets after a configurable inactivity period
2. **Notification Routing Middleware** — Centralized gating for email, push, and admin notifications based on company settings

## Quick Start (5 Steps)

### 1. Run Database Migrations

```bash
# Apply schema changes to Supabase
supabase migration up
```

This creates:
- `system_settings` table (stores per-company system configuration and notification preferences)
- `closed_at` and `auto_closed` columns on tickets table
- Performance indexes

### 2. Seed Initial Company Settings

```bash
cd backend
python scripts/seed_company_settings.py
```

Creates default settings for all existing companies:
- Auto-close enabled, 7-day inactivity threshold
- `email_notifications` enabled
- `admin_alerts` enabled

### 3. Install Dependencies

```bash
cd backend
pip install apscheduler>=3.10.0
```

### 4. Configure Environment Variables

Add to `backend/.env`:

```bash
AUTO_CLOSE_ENABLED=true
AUTO_CLOSE_DAYS=7
AUTO_CLOSE_CRON_SCHEDULE=0 2 * * *
NOTIFICATION_ROUTING_LOG_LEVEL=info
```

### 5. Restart Backend

Backend will automatically:
- Load auto-close service
- Register cron job on startup
- Initialize notification routing middleware

## How It Works

### Auto-Close Flow

```
Every Day at 2 AM UTC
    ↓
Query all tickets with status="resolved"
    ↓
For each company:
  1. Get auto_close_days setting (default: 7)
  2. Find tickets not updated in X days
  3. Update status → "closed", set auto_closed=true, closed_at=NOW()
    ↓
Log results: "Closed 5, Skipped 10, Errors 0"
```

### Notification Routing Flow

```
Before sending notification (digest, alert, push):
        ↓
Check system_settings:
    - `email_notifications`? → allow/deny email/digest
    - `admin_alerts`? → allow/deny admin escalation
    - `digest_frequency`? → daily/weekly/disabled
    ↓
Log decision: sent / skipped / error
    ↓
Proceed or skip notification
```

## Files Created

| File | Purpose |
|------|---------|
| `backend/services/auto_close_service.py` | Background job service for auto-closing tickets |
| `backend/services/notification_routing.py` | Middleware for notification gating |
| `supabase/migrations/20260531_add_company_settings.sql` | Database schema: system_settings table |
| `supabase/migrations/20260531_update_tickets_auto_close.sql` | Database schema: auto-close columns on tickets |
| `backend/scripts/seed_company_settings.py` | Script to initialize default system settings |
| `backend/INTEGRATION_GUIDE_ISSUE_41.md` | Full integration instructions |
| `backend/ISSUE_41_README.md` | This file |

## Usage Examples

### Trigger Auto-Close Manually (Testing)

```python
from backend.services.auto_close_service import AutoCloseService

service = AutoCloseService.load()
stats = service.run()
# Returns: {"processed_count": 42, "closed_count": 5, "skipped_count": 10, "error_count": 0}
```

### Check Notification Settings Before Sending

```python
from backend.services.notification_routing import NotificationRoutingMiddleware, NotificationType

routing = NotificationRoutingMiddleware.load()

# Before sending daily digest email
if routing.should_send_email_notification(company_id, NotificationType.DAILY_DIGEST):
    send_email(...)

# Before sending admin alert
if routing.should_send_admin_alert(company_id):
    send_admin_notification(...)
```

### Update Company Settings

```python
# After updating company settings in database
routing = NotificationRoutingMiddleware.load()
routing.invalidate_cache(company_id)  # Clear cached settings
```

## Logs to Watch

Backend logs will show:

```
[AutoCloseService] ... - Starting auto-close job...
[AutoCloseService] ... - Found 42 resolved tickets
[AutoCloseService] ... - Closed ticket abc-123 for company xyz
[AutoCloseService] ... - Auto-close job completed. Closed: 5, Skipped: 10, Errors: 0
```

```
[NotificationRouting] ... - Notification sent | company=xyz | type=daily_digest
[NotificationRouting] ... - Notification skipped | company=abc | reason=admin_alerts_disabled
```

## Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTO_CLOSE_ENABLED` | `true` | Enable/disable auto-close feature |
| `AUTO_CLOSE_DAYS` | `7` | Default days before auto-close (overridable per company) |
| `AUTO_CLOSE_CRON_SCHEDULE` | `0 2 * * *` | Cron schedule for job (2 AM UTC daily) |
| `NOTIFICATION_ROUTING_LOG_LEVEL` | `info` | Logging level (debug, info, warning) |

### System Settings (Database)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `company_id` | UUID | (unique) | Company identifier (unique)
| `ai_confidence_threshold` | float | `0.80` | Threshold for AI confidence
| `duplicate_sensitivity` | float | `0.85` | Duplicate detection sensitivity
| `enable_auto_resolve` | bool | `false` | Allow AI auto-resolve suggestions
| `auto_close_enabled` | bool | `true` | Enable auto-close for this company |
| `auto_close_days` | int | `7` | Days of inactivity before closing |
| `email_notifications` | bool | `true` | Allow email notifications |
| `admin_alerts` | bool | `true` | Allow admin alerts |
| `digest_frequency` | enum | `daily` | Email digest frequency (daily, weekly, disabled) |

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Auto-close job not running | APScheduler not started or invalid cron | Check backend logs, verify cron format |
| Tickets not closing | `auto_close_enabled=false` for company | Update system_settings table |
| Notifications still sending when disabled | Cache not invalidated | Call `routing.invalidate_cache(company_id)` |
| Missing system_settings records | Didn't run seed script | Run `python scripts/seed_company_settings.py` |

## Next Steps

1. See [INTEGRATION_GUIDE_ISSUE_41.md](./INTEGRATION_GUIDE_ISSUE_41.md) for detailed integration steps
2. Review [auto_close_service.py](./services/auto_close_service.py) for auto-close logic
3. Review [notification_routing.py](./services/notification_routing.py) for notification gating
4. Test manually in development environment
5. Deploy to staging for QA verification
6. Deploy to production following deployment checklist

## Support

For questions or issues:
1. Check logs for error messages
2. Review INTEGRATION_GUIDE_ISSUE_41.md troubleshooting section
3. Test manually with provided examples
4. Check database schema is correct: `SELECT * FROM system_settings LIMIT 1;`
