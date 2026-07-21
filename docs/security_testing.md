# HelpDesk.AI — Multi-Tenant Isolation & Security Auditing Procedures

This document provides developers and security engineers with a detailed guide to HelpDesk.AI's automated tenant isolation model, context verification middleware, direct object reference checks, and validation procedures.

---

## 🛡️ 1. Multi-Tenant Isolation Architecture

HelpDesk.AI implements a secure SaaS trust model ensuring absolute data boundary isolation between enterprise customers (tenants).

```
[Incoming Request]
       │
       ▼
[TenantContextMiddleware] ──(Authentication & Spoofing Check)
       │
       ├───► [Decode JWT / Header Context]
       ├───► [Cached True Tenant Mappings] ──► (Mismatches? 403 Forbidden ❌)
       │
       ▼
[IDOR / Path Resource Guards] (e.g. /tickets/{id}, /users/{id})
       │
       ├───► [DB Row Ownership Cross-Check] ──► (Mismatches? 403 Forbidden ❌)
       │
       ▼
[Controller Route Handler] (Runs with Service Role elevated client)
```

1. **Service Role Elevated Bypass**: The FastAPI backend utilizes the Supabase `service_role` key to interact with the database, allowing high-performance administrative automation. Because this bypasses database-level Row-Level Security (RLS) for backend operations, the **FastAPI Middleware** acts as the primary logical boundary enforcing tenant checks.
2. **Context Spoofing Prevention**: The middleware decodes the user's unverified JWT structure, resolves their authentic `company_id` from the secure `profiles` database, and guarantees that any request headers (`X-Tenant-ID`) or query/body parameters (`company_id`) match the user's authentic company context.
3. **IDOR Prevention**: Path identifiers such as `ticket_id`, `user_id`, or `attachment_id` are automatically captured. The middleware queries their true database owner tenant, rejecting access with `403 Forbidden` if they belong to another company.

---

## ⚡ 2. Middleware Performance Optimization

To comply with the requirement of **< 100ms** latency overhead per request, the middleware implements:
- **In-Memory TTL Caches**: Cache user-to-company and ticket-to-company mappings for **10 seconds** to avoid redundant DB queries.
- **Latency Instrumentation**: Appends the header `X-Tenant-Isolation-Time-Ms` to every API response, showing the precise execution time of the middleware (typically **< 2ms** on cache hits and **< 15ms** on database queries).

---

## 🔍 3. Security Dashboard & Compliance Exports

To continuously verify the security posture of the platform, the backend exposes administrative routes:
- **`GET /security/dashboard`**: Returns real-time metrics showing tables audited, policies validated, active boundary failures, and a composite **Tenant Leakage Risk Score** (0-100%).
- **`GET /security/report`**: Generates a print-ready compliance audit document. Developers can request this in `json` or a styled, interactive `html` format by appending `?format=html`.

---

## 🧪 4. Security Testing Procedures

Continuous integration checks are integrated into the repository to prevent isolation regressions.

### Running Tests Locally

To execute the suite of 9 multi-tenant isolation, IDOR, spoofing, and performance tests locally:

```bash
# Navigate to the workspace root
cd c:/Users/ASUS/Desktop/repo

# Run unit tests via unittest
python -m unittest backend.tests.security.test_tenant_isolation
```

The test runner utilizes nested mock package systems to mock out heavy ML libraries (`torch`, `transformers`), allowing the suite to complete in **under 0.1 seconds**.

### Continuous Integration (CI/CD)

The GitHub Actions workflow in `.github/workflows/security-audit.yml` runs the test suite automatically on:
- Every push to the `gssoc` branch.
- Every pull request targeting the `main` or `gssoc` branches.

All tests must compile and pass cleanly before merging is permitted.
