# Tenant Isolation Security Audit Framework

> Resolves [Issue #1121](https://github.com/ritesh-1918/HELPDESK.AI/issues/1121) —
> Automated Tenant Isolation Security Audit Framework (Refreshed)

HelpDesk.AI is a multi-tenant SaaS platform. This framework automatically validates
that tenant boundaries are enforced across every layer of the stack — from database
RLS policies to API endpoints and request middleware.

---

## Architecture Overview

```
CI/CD Pipeline
      ↓
Tenant Isolation Tests   (backend/tests/test_tenant_isolation.py)
      ↓
Isolation Audit Engine   (backend/security/isolation_audit.py)
      ↓
  ┌────────────────────────────────────────┐
  │  1. RLS Policy Validation              │
  │  2. Cross-Tenant Access Testing        │
  │  3. IDOR Vulnerability Detection       │
  │  4. API Isolation Verification         │
  │  5. Middleware Validation (NEW)        │
  └────────────────────────────────────────┘
      ↓
Audit Report Generation  (Markdown + JSON)
```

---

## Components

| File | Purpose |
|------|---------|
| `backend/security/isolation_audit.py` | Core audit engine |
| `backend/auth/tenant_middleware.py` | `TenantSecurityManager` — per-request tenant validation |
| `backend/tests/test_tenant_isolation.py` | Integration tests — HTTP endpoint isolation |
| `backend/tests/security/test_isolation_audit.py` | Unit tests — audit engine logic |
| `.github/workflows/security-audit.yml` | CI workflow — runs on every PR |

---

## Running the Audit Locally

### Prerequisites

```bash
cd /path/to/HELPDESK.AI
source .venv/bin/activate
```

### Run all security tests

```bash
ALLOW_DEGRADED_STARTUP="1" REQUIRE_SUPABASE="false" \
  PYTHONPATH=.:./backend \
  python -m pytest backend/tests/test_tenant_isolation.py backend/tests/security/ -v
```

Expected output: **all tests pass**, no isolation failures.

### Run the audit engine directly (Python)

```python
from backend.security.isolation_audit import IsolationAuditEngine

engine = IsolationAuditEngine()          # offline / no DB needed
result = engine.run_full_audit()

print(f"Risk Score  : {result.risk_score:.1f}/100")
print(f"Leakage Risk: {result.leakage_risk}")
print(f"Tables      : {result.tables_audited} audited")

# Print Markdown report
print(engine.generate_report(result))

# Get JSON report
import json
print(json.dumps(engine.generate_json_report(result), indent=2))
```

---

## Audit Checks

### 1. RLS Policy Validation
Verifies that every tenant-sensitive table has a `company_id` column and
proper Row Level Security (RLS) policies are applied in Supabase.

**Tables checked:** `tickets`, `users`, `profiles`, `comments`, `attachments`,
`notifications`, `analytics`, `ticket_ratings`, `audit_logs`

### 2. Cross-Tenant Access Testing
When two or more `company_id` values are provided, verifies that querying one
tenant's data never returns rows belonging to another tenant.

**Expected:** Zero overlapping IDs across tenant boundaries.

### 3. IDOR Vulnerability Detection
Audits resource access patterns to detect Insecure Direct Object Reference risks:
- Sequential IDs (should use UUIDs)
- UUID manipulation
- Resource enumeration
- Direct URL manipulation

### 4. API Isolation Verification
Confirms that all tenant-scoped API endpoints:
- Require authentication via `Depends(get_current_user)`
- Enforce tenant scoping before returning data

**Endpoints checked:** `/tickets`, `/tickets/search`, `/users`, `/attachments`,
`/analytics`, `/api/scorecard`

### 5. Middleware Validation *(Issue #1121)*
Validates the `TenantSecurityManager` middleware layer:

| Check | Validates |
|-------|-----------|
| Manager presence | `TenantSecurityManager` is importable |
| `get_current_user_profile` | Authenticated user context dependency exists |
| `verify_resource_ownership` | Per-resource company_id enforcement exists |
| Context spoofing prevention | Invalid tokens are rejected with HTTP 401 |
| Missing context handling | Requests without tenant context are blocked |

---

## API Endpoints

### `GET /api/security/audit`
Run the full tenant isolation audit and receive a JSON report.

**Required role:** `admin`, `company_admin`, or `master_admin`

```bash
curl -H "Authorization: Bearer <token>" \
     https://<your-domain>/api/security/audit
```

**Response:**
```json
{
  "status": "success",
  "timestamp": "2026-06-05T...",
  "risk_score": 0.0,
  "leakage_risk": "Low",
  "summary": {
    "tables_audited": 9,
    "endpoints_audited": 6,
    "policies_passed": 9,
    "policies_failed": 0,
    "isolation_failures": 0,
    "total_findings": 32
  },
  "findings": [...]
}
```

### `GET /api/security/report`
Download the audit report as a Markdown file (for compliance reviews).

**Required role:** `admin`, `company_admin`, or `master_admin`

---

## Risk Score Interpretation

| Score | Leakage Risk | Action |
|-------|-------------|--------|
| 0 | Low | ✅ No action required |
| 1–19 | Low | ✅ Monitor |
| 20–49 | Medium | ⚠️ Review medium findings |
| 50–79 | High | 🔴 Immediate remediation needed |
| 80–100 | Critical | 🚨 Production incident — halt deployments |

---

## CI Integration

The security audit runs automatically on every PR targeting `main` or `gssoc`:

```yaml
# .github/workflows/security-audit.yml
- name: Run Tenant Isolation Security Tests
  run: python -m pytest backend/tests/test_tenant_isolation.py -v

- name: Run Isolation Audit Engine Tests
  run: python -m pytest backend/tests/security/ -v
```

PRs with isolation failures **must not be merged**.

---

## Compliance Coverage

| Standard | Requirement |
|----------|-------------|
| **HIPAA** | Patient data isolation between healthcare tenants |
| **GDPR** | Data separation between EU and non-EU organisations |
| **SOC 2** | Continuous monitoring and validation of access controls |

---

## Remediation Guidance

### RLS Not Enabled
```sql
-- Enable RLS on a table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Add tenant isolation policy
CREATE POLICY tenant_isolation ON tickets
  USING (company_id = auth.jwt() ->> 'company_id');
```

### IDOR Risk — Sequential IDs
```sql
-- Use UUID primary keys (already the default in HelpDesk.AI)
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

### Missing Middleware Validation
```python
# Always use the security manager dependency on protected routes
@app.get("/protected-resource")
async def my_endpoint(
    current_user: dict = Depends(security_manager.get_current_user_profile)
):
    ...
```

---

*HelpDesk.AI Tenant Isolation Security Audit Framework — Issue #1121*
