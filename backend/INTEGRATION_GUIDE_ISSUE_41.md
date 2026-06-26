# Issue #41: Automated Ticket Auto-Close and Notification Routing Integration Guide

This guide provides step-by-step instructions to integrate the auto-close cron job and notification routing middleware into the HELPDESK.AI backend.

## Overview

Two new features are being introduced:

1. **Auto-Close Service** (`backend/services/auto_close_service.py`): A scheduled background job that automatically closes resolved tickets after a configurable inactivity period.
2. **Notification Routing Middleware** (`backend/services/notification_routing.py`): A centralized gating layer for all notifications, respecting company-level preferences.

## Part 1: Database Schema Updates

### Step 1.1 — Run Migrations

Execute the two new migration files in Supabase to set up the required database schema:

```bash
# Migration 1: Create system_settings table
supabase migration up

# Verify the system_settings table was created
supabase db pull
```

**Migration files to run:**
- `supabase/migrations/20260531_add_company_settings.sql` — Creates system_settings table with RLS policies
- `supabase/migrations/20260531_update_tickets_auto_close.sql` — Adds auto-close columns to tickets table

- **What gets created:**
- `system_settings` table with columns: `ai_confidence_threshold`, `duplicate_sensitivity`, `enable_auto_resolve`, `auto_close_enabled`, `auto_close_days`, `email_notifications`, `admin_alerts`, `digest_frequency`
- `closed_at` and `auto_closed` columns on tickets table
- Indexes on tickets(status, updated_at) and tickets(auto_closed, closed_at)

### Step 1.2 — Seed Company Settings

After migrations run, populate default settings for all existing companies:

```bash
cd backend
python scripts/seed_company_settings.py
```

This script creates a default system_settings record for each company in the database with:
- `auto_close_enabled: true`
- `auto_close_days: 7` (default 7-day inactivity before auto-close)
- `email_notifications: true`
- `admin_alerts: true`
- `digest_frequency: 'daily'`

## Part 2: Backend Integration

### Step 2.1 — Add Required Dependencies

Update `backend/requirements.txt`:

```
apscheduler>=3.10.0
```

Then install:

```bash
cd backend
pip install -r requirements.txt
```

### Step 2.2 — Update main.py

Add the following imports at the top of `backend/main.py`:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from backend.services.auto_close_service import AutoCloseService
from backend.services.notification_routing import NotificationRoutingMiddleware
```

Initialize the services after line 160-180 (after app initialization):

```python
# Initialize background services
auto_close_service = AutoCloseService.load()
notification_routing = NotificationRoutingMiddleware.load()
```

Update the lifespan context manager to register the cron job (example around line 180-200):

```python
@app.on_event("startup")
async def startup():
    # Initialize scheduler
    scheduler = AsyncIOScheduler()
    
    # Register auto-close job
    auto_close_service = AutoCloseService.load()
    cron_schedule = os.getenv("AUTO_CLOSE_CRON_SCHEDULE", "0 2 * * *")  # 2 AM UTC daily
    
    scheduler.add_job(
        auto_close_service.run,
        "cron",
        **parse_cron(cron_schedule),
        id="auto_close_job",
        name="Ticket Auto-Close Job",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info(f"Auto-close cron job registered with schedule: {cron_schedule}")

@app.on_event("shutdown")
async def shutdown():
    # Cleanup scheduler if needed
    pass
```

Note: You may need to implement a simple cron parser or use APScheduler's built-in utilities. A simple example:

```python
def parse_cron(cron_string: str) -> dict:
    """Parse cron string to APScheduler kwargs."""
    # Simple parser for "0 2 * * *" format (minute hour day month weekday)
    parts = cron_string.split()
    if len(parts) != 5:
        raise ValueError("Invalid cron format")
    return {
        "minute": parts[0] if parts[0] != "*" else None,
        "hour": parts[1] if parts[1] != "*" else None,
        "day": parts[2] if parts[2] != "*" else None,
        "month": parts[3] if parts[3] != "*" else None,
        "day_of_week": parts[4] if parts[4] != "*" else None,
    }
```

### Step 2.3 — Add Environment Variables

Add the following to `backend/.env`:

```bash
# Auto-Close Configuration
AUTO_CLOSE_ENABLED=true
AUTO_CLOSE_DAYS=7
AUTO_CLOSE_CRON_SCHEDULE=0 2 * * *

# Notification Routing Configuration
NOTIFICATION_ROUTING_LOG_LEVEL=info
```

**Variable Descriptions:**
- `AUTO_CLOSE_ENABLED` (bool): Enable/disable the auto-close feature globally
- `AUTO_CLOSE_DAYS` (int): Default number of days before a resolved ticket is auto-closed (can be overridden per company in DB)
- `AUTO_CLOSE_CRON_SCHEDULE` (cron string): Schedule for auto-close job (default: "0 2 * * *" = 2 AM UTC daily)
- `NOTIFICATION_ROUTING_LOG_LEVEL` (string): Logging level for notification routing (debug, info, warning)

## Part 3: Notification Routing Integration

### Step 3.1 — Update Email-Notifier Edge Function

In `supabase/functions/email-notifier/index.ts`, add notification routing gating:

```typescript
import { NotificationRoutingMiddleware } from "../services/notification_routing.py";

export async function sendDailyDigest(companyId: string, userEmails: string[]) {
  const routing = NotificationRoutingMiddleware.load();
  
  if (!routing.should_send_email_notification(companyId, "daily_digest")) {
    console.log(`Digest email skipped for company ${companyId}: notifications disabled`);
    return { status: "skipped" };
  }
  
  // Send email...
}
```

### Step 3.2 — Update Admin Alert Handlers

Before sending any admin escalation alert:

```python
from backend.services.notification_routing import NotificationRoutingMiddleware

routing = NotificationRoutingMiddleware.load()

if routing.should_send_admin_alert(company_id):
    # Send admin alert email/push
    send_admin_alert(...)
else:
    logger.info(f"Admin alert skipped for company {company_id}")
```

### Step 3.3 — Settings Cache Invalidation

When company settings are updated via an admin API endpoint:

```python
from backend.services.notification_routing import NotificationRoutingMiddleware

routing = NotificationRoutingMiddleware.load()
routing.invalidate_cache(company_id)
```

## Part 4: Monitoring & Debugging

### Manual Testing

Test the auto-close service without running the cron job:

```bash
# In Python shell or debug script
from backend.services.auto_close_service import AutoCloseService

service = AutoCloseService.load()

# See what tickets would be closed (test mode)
tickets = service.test_query()
print(f"Sample resolved tickets: {tickets}")

# Actually run the job
stats = service.run()
print(f"Job results: {stats}")
```

### Log Patterns to Look For

**Auto-Close Service:**
```
[AutoCloseService] ... - Starting auto-close job...
[AutoCloseService] ... - Found 42 resolved tickets
[AutoCloseService] ... - Closed ticket abc-123 for company xyz-456
[AutoCloseService] ... - Auto-close job completed. Closed: 5, Skipped: 10, Errors: 0
```

**Notification Routing:**
```
[NotificationRouting] ... - Notification sent | company=xyz | type=daily_digest
[NotificationRouting] ... - Notification skipped | company=xyz | type=admin_alert | reason=admin_alerts_disabled
```

### Debugging Endpoints (Optional)

Add optional endpoints for admin debugging (not in production):

```python
@app.get("/admin/auto-close-stats")
async def get_auto_close_stats():
    """Return statistics about recent auto-closes."""
    # Query tickets with auto_closed=true from last 7 days
    pass

@app.post("/admin/test-auto-close")
async def test_auto_close_manual():
    """Manually trigger auto-close job for testing."""
    if os.getenv("ENV") != "development":
        raise HTTPException(status_code=403, detail="Only available in development")
    service = AutoCloseService.load()
    stats = service.run()
    return stats
```

## Part 5: Deployment Checklist

Before deploying to production:

- [ ] All migrations have run successfully in target environment
- [ ] `seed_company_settings.py` has been executed (creates `system_settings` records)
- [ ] Environment variables are set correctly in `.env` file
- [ ] APScheduler is installed in production requirements
- [ ] Backend startup logs show "Auto-close cron job registered"
- [ ] Test manual run: `service.run()` completes without errors
- [ ] Test notification gating: Call `should_send_email_notification()` and verify it returns correct bool
- [ ] Verify no system_settings records are missing (should equal number of companies)
- [ ] Set up log monitoring/alerts for `[AutoCloseService]` and `[NotificationRouting]` ERROR level

## Part 6: Common Issues & Troubleshooting

### Issue: "Failed to fetch system settings"
**Cause:** `system_settings` table doesn't exist or RLS policies are blocking access
**Solution:**
1. Verify migrations ran: `SELECT COUNT(*) FROM system_settings;`
2. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'system_settings';`
3. Ensure service role key has permissions

### Issue: Auto-close job doesn't run on schedule
**Cause:** APScheduler not properly initialized or cron schedule is invalid
**Solution:**
1. Check backend logs for "Auto-close cron job registered" message
2. Verify cron schedule format: "minute hour day month weekday"
3. Ensure backend is actually running (not in development with auto-reload conflicts)

### Issue: Tickets not closing even though they're old
**Cause:** `auto_close_enabled=false` for that company or `updated_at` is recent
**Solution:**
1. Check system_settings: `SELECT auto_close_enabled, auto_close_days FROM system_settings WHERE company_id = 'xyz';`
2. Check ticket timestamps: `SELECT id, updated_at, created_at FROM tickets WHERE status='resolved' LIMIT 1;`
3. Run manual test: `service.run()` and check logs

## Part 7: Future Enhancements

Potential improvements for future iterations:

1. **Dashboard**: Add admin UI to view/manage per-company auto-close and notification settings
2. **Webhooks**: Send webhook events when tickets are auto-closed
3. **Metrics**: Collect metrics on auto-closed ticket counts for analytics
4. **Dry-run Mode**: Add `--dry-run` flag to see what would be closed without making changes
5. **Selective Re-open**: Allow users to manually re-open recently auto-closed tickets with a grace period
6. **Custom Reasons**: Track reason for closing (manual, auto-close, resolved by AI, etc.) in a separate column
