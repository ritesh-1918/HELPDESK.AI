# Priority Escalation Rules Engine

## Overview

The Priority Escalation Rules Engine automatically escalates ticket priorities based on configurable rules. This feature helps ensure that aging tickets or frequently reopened tickets get the attention they need.

## Features

### 1. **Configurable Escalation Rules**
- Define rules based on:
  - **Age threshold**: Escalate tickets that have been open for too long
  - **Reopen count threshold**: Escalate tickets that have been reopened multiple times
- Support for multiple rules per company
- Rule priority ordering for conflict resolution

### 2. **Automatic Priority Bumping**
- Low → Medium → High → Critical escalation paths
- Prevents priority downgrades (validation enforced)
- Tracks escalation history per ticket

### 3. **Audit Logging**
- Complete audit trail of all escalations
- Records:
  - Which rule triggered the escalation
  - Ticket age at escalation time
  - Reopen count
  - Escalation reason

### 4. **Scheduled Background Job**
- Runs hourly (configurable)
- Evaluates all open tickets against active rules
- Sends notifications when escalations occur

### 5. **Admin Management Interface**
- React-based admin page for rule management
- Create, edit, delete, enable/disable rules
- View escalation logs and statistics
- Manual escalation sweep trigger

## Database Schema

### Tables Created

#### `priority_escalation_rules`
Stores escalation rule definitions.

```sql
CREATE TABLE priority_escalation_rules (
    id uuid PRIMARY KEY,
    company_id uuid REFERENCES companies(id),
    rule_name text NOT NULL,
    rule_description text,
    from_priority text CHECK (from_priority IN ('low', 'medium', 'high', 'critical')),
    to_priority text CHECK (to_priority IN ('low', 'medium', 'high', 'critical')),
    age_threshold_hours integer,
    reopen_count_threshold integer,
    enabled boolean NOT NULL DEFAULT true,
    priority_order integer NOT NULL DEFAULT 0,
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz,
    updated_at timestamptz
);
```

#### `priority_escalation_log`
Audit log of all escalations.

```sql
CREATE TABLE priority_escalation_log (
    id uuid PRIMARY KEY,
    ticket_id uuid REFERENCES tickets(id),
    company_id uuid REFERENCES companies(id),
    rule_id uuid REFERENCES priority_escalation_rules(id),
    from_priority text,
    to_priority text,
    escalation_reason text,
    ticket_age_hours numeric(10,2),
    reopen_count integer,
    escalated_at timestamptz
);
```

#### New Ticket Columns
```sql
ALTER TABLE tickets ADD COLUMN reopen_count integer DEFAULT 0;
ALTER TABLE tickets ADD COLUMN last_escalation_at timestamptz;
ALTER TABLE tickets ADD COLUMN auto_escalated boolean DEFAULT false;
```

## API Endpoints

### List Escalation Rules
```http
GET /api/escalation/rules?company_id={companyId}
Authorization: Bearer {token}
```

### Create Escalation Rule
```http
POST /api/escalation/rules
Authorization: Bearer {token}
Content-Type: application/json

{
  "rule_name": "Low to Medium after 7 days",
  "rule_description": "Escalate low priority tickets to medium after 7 days",
  "from_priority": "low",
  "to_priority": "medium",
  "age_threshold_hours": 168,
  "reopen_count_threshold": null,
  "enabled": true,
  "priority_order": 1
}
```

### Update Escalation Rule
```http
PATCH /api/escalation/rules/{ruleId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": false
}
```

### Delete Escalation Rule
```http
DELETE /api/escalation/rules/{ruleId}
Authorization: Bearer {token}
```

### View Escalation Logs
```http
GET /api/escalation/logs?ticket_id={ticketId}&limit=50
Authorization: Bearer {token}
```

### Trigger Manual Escalation Sweep
```http
POST /api/escalation/sweep?send_alerts=true
Authorization: Bearer {token}
```

## Default Rules

The system ships with 6 default escalation rules:

1. **Low to Medium after 7 days** (168 hours)
2. **Medium to High after 3 days** (72 hours)
3. **High to Critical after 1 day** (24 hours)
4. **Reopen to Critical** (2+ reopens, from low)
5. **Reopen to Critical** (2+ reopens, from medium)
6. **Reopen to Critical** (2+ reopens, from high)

Companies can override these or create custom rules.

## Usage Examples

### Example 1: Age-Based Escalation
```javascript
// Create a rule to escalate low-priority tickets after 5 days
POST /api/escalation/rules
{
  "rule_name": "Stale Low Priority Tickets",
  "from_priority": "low",
  "to_priority": "medium",
  "age_threshold_hours": 120  // 5 days
}
```

### Example 2: Reopen-Based Escalation
```javascript
// Escalate tickets that keep getting reopened
POST /api/escalation/rules
{
  "rule_name": "Frequently Reopened Tickets",
  "from_priority": "medium",
  "to_priority": "critical",
  "reopen_count_threshold": 3
}
```

### Example 3: Combined Rule
```javascript
// Escalate if EITHER condition is met
POST /api/escalation/rules
{
  "rule_name": "Urgent Escalation",
  "from_priority": "high",
  "to_priority": "critical",
  "age_threshold_hours": 12,
  "reopen_count_threshold": 1
}
```

## Implementation Details

### Backend Service
- **File**: `backend/services/priority_escalation_service.py`
- **Class**: `PriorityEscalationService`
- **Key Methods**:
  - `run_escalation_sweep()`: Main sweep operation
  - `evaluate_ticket_for_escalation()`: Rule evaluation logic
  - `escalate_ticket_priority()`: Priority update and logging
  - `send_escalation_alert()`: Notification dispatch

### API Router
- **File**: `backend/routers/escalation.py`
- **Endpoints**: Full CRUD for rules + logs + manual sweep

### Frontend UI
- **File**: `Frontend/src/admin/pages/PriorityEscalationPage.jsx`
- **Features**:
  - Rule management (create, edit, delete, enable/disable)
  - Escalation logs viewer
  - Manual sweep trigger
  - Real-time statistics

### Database Migration
- **File**: `supabase/migrations/20260707000000_add_priority_escalation.sql`
- Creates tables, indexes, RLS policies, default rules

### Tests
- **File**: `backend/tests/test_priority_escalation_service.py`
- **Coverage**: 24 tests covering:
  - Rule evaluation logic
  - Age and reopen-based escalation
  - Priority ordering
  - Error handling
  - Sweep operations

## Security

- **Row-Level Security (RLS)** enabled on all tables
- Admins can only manage rules for their own company
- Service role has full access for background jobs
- Audit logs are read-only for non-admins

## Performance Considerations

- Indexes on:
  - `tickets(priority, created_at, status, reopen_count)`
  - `priority_escalation_log(ticket_id, escalated_at)`
  - `priority_escalation_rules(company_id, enabled, priority_order)`
- Escalation sweep queries are optimized
- Only evaluates open/in_progress/pending tickets
- Skips already-critical tickets

## Monitoring

The escalation sweep returns statistics:

```javascript
{
  "candidates_found": 150,      // Tickets evaluated
  "evaluated": 150,              // Actually processed
  "escalated": 12,               // Successfully escalated
  "alerts_sent": 12,             // Notifications sent
  "skipped_no_rule": 138,        // No matching rule
  "errors": 0                    // Failures
}
```

## Future Enhancements

Potential improvements:
- SLA integration (escalate based on SLA breach risk)
- Custom escalation paths (skip priority levels)
- Time-based rules (escalate during business hours only)
- De-escalation rules (reduce priority if resolved quickly)
- Machine learning-based priority prediction

## Related Issues

- Issue #3197: [FEATURE] Implement Dynamic Priority Escalation Rules Engine for Aging Tickets

## Files Changed

1. `supabase/migrations/20260707000000_add_priority_escalation.sql` (new)
2. `backend/services/priority_escalation_service.py` (new)
3. `backend/routers/escalation.py` (new)
4. `backend/tests/test_priority_escalation_service.py` (new)
5. `Frontend/src/admin/pages/PriorityEscalationPage.jsx` (new)
6. `main.py` (modified - added escalation router)
7. `docs/PRIORITY_ESCALATION_FEATURE.md` (new - this file)
