# Tenant Isolation & API Security Framework

HelpDesk.AI is built as a multi-tenant Software-as-a-Service (SaaS) platform. This document describes how the platform enforces organizational boundaries to prevent cross-tenant data leakage and outlines the automated audit tools.

---

## 🏛️ Tenant Isolation Architecture

Tenant isolation in HelpDesk.AI is enforced across two complementary layers:

```
[ Frontend Client ]
       │  (Requests include Authorization JWT Bearer Token)
       ▼
[ FastAPI API Gateway ]  ◄─── Tenant Context Verification Middleware (Python)
       │  (Validates claims & resolves tenant boundaries)
       ▼
[ Supabase Database ]    ◄─── Row Level Security (RLS) Policies (PostgreSQL)
```

1. **Row Level Security (RLS) Layer**: Supabase tables have RLS enabled. Policies ensure that when direct DB access is made, rows are filtered by the authenticated user's `company_id`.
2. **API Context Verification Layer**: The FastAPI backend acts as a gateway and accesses Supabase using the elevated `service_role` key (bypassing DB-level RLS). Therefore, the backend enforces strict tenant checking before executing database queries.

---

## 🔒 Centralized Security Middleware

The backend uses `TenantSecurityManager` (`backend/auth/tenant_middleware.py`) to enforce tenant context. It has two main tasks:

### 1. Context Spoofing Prevention (`verify_tenant_access`)
For endpoints accepting a target `company_id` parameter (e.g. `/tickets/save`, `/tickets`), the middleware extracts the caller's JWT token, resolves their profile from Supabase, and ensures the caller belongs to that company:
- Standard users and admins are locked to their own `company_id`.
- `master_admin` can bypass validation to manage multiple organizations.

### 2. IDOR Protection (`verify_resource_ownership`)
For endpoints fetching resources by ID (e.g. `/tickets/{ticket_id}`, `/users/{user_id}`, `/attachments/{ticket_id}`), the middleware verifies that the resource's `company_id` matches the caller's `company_id`. Any unauthorized direct reference is rejected with `403 Forbidden`.

---

## 🚀 Running Automated Audits

HelpDesk.AI includes a continuous security audit framework to validate RLS policies, detect IDOR, and check for tenant leakage.

### Local Execution (Mock Mode)
To run the automated security checks locally without requiring live Supabase credentials:
```powershell
python -m pytest backend/tests/test_tenant_isolation.py -v
```

### CI/CD Pipeline
The security suite is integrated with GitHub Actions (`.github/workflows/security-audit.yml`). It runs automatically on every pull request and push to the `main` branch to guarantee new updates do not break isolation boundaries.

### Dashboard & Reports
Authorized administrators can run audits and download reports directly from the API:
- **Dashboard Summary**: `GET /api/security/audit` returns real-time metrics (passed/failed policies, leakage risk status).
- **Downloadable Report**: `GET /api/security/report` returns a downloadable markdown compliance audit report.
