# Enterprise-Grade Audit Logging Framework: Architecture & Reference

This document provides technical documentation for the Enterprise-Grade Audit Logging Framework implemented in HelpDesk.AI.

## Architecture Overview

The audit logging framework is built to provide maximum security, immutability, and accountability for all security-sensitive and business-critical operations in HelpDesk.AI. It operates on a multi-tiered architecture:

```
[Client / UI] ---> [FastAPI Backend] ---> [PostgreSQL / Supabase View] ---> [audit.logs Table]
                          |
                  (Audit Middleware)
                          |
             (Cryptographic Hashing Chain)
                          |
              (Immutable Trigger Guards)
```

1. **Request Interception (FastAPI Middleware)**: Every incoming request to an audit-sensitive endpoint is intercepted by `AuditLoggerMiddleware` (defined in `backend/middleware/audit_logger.py`).
2. **Context Collection**: The middleware gathers rich context including IP address, User-Agent, Origin, Session ID, and Authentication Method.
3. **Change Tracking**: For modifications (`PATCH`/`PUT`), the middleware fetches the resource state before the request executes (`old_value`) and after it succeeds (`new_value`) to record a precise diff.
4. **Asynchronous Execution**: Logs are written asynchronously using Python background tasks to ensure API response times remain strictly under 500ms.
5. **Database Immutability**: The target database table `audit.logs` has triggers that block `UPDATE` and `DELETE` queries, making it append-only.
6. **Chain-of-Custody Cryptography**: A database trigger generates a SHA-256 hash for each row, binding it to the hash of the previous record. This forms a blockchain-like tamper-evident ledger.

---

## Database Schema (`audit.logs`)

The table is defined in the `audit` schema to isolate sensitive security logs from general public application tables:

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `audit_id` | `uuid` | Primary Key. |
| `timestamp` | `timestamp with time zone` | Time of the event. |
| `user_id` | `uuid` | Reference to the user who executed the action. |
| `company_id` | `uuid` | Reference to the tenant/organization. |
| `session_id` | `text` | Current user session identifier. |
| `request_id` | `text` | Unique identifier for HTTP request correlation. |
| `action` | `text` | Action name (e.g., `user_login`, `create_ticket`). |
| `resource_type` | `text` | The resource being modified (e.g., `ticket`, `user`). |
| `resource_id` | `text` | ID of the specific resource. |
| `operation_type` | `text` | DB operation type (`create`, `read`, `update`, `delete`). |
| `status` | `text` | Outcome of the action (`success`, `failure`). |
| `old_value` | `jsonb` | State of the resource before modification. |
| `new_value` | `jsonb` | State of the resource after modification. |
| `ip_address` | `text` | Origin IP address of the request. |
| `user_agent` | `text` | User agent of the client. |
| `origin` | `text` | Origin header of the request. |
| `authentication_method` | `text` | e.g., `session_cookie` or `bearer_token`. |
| `hash` | `text` | SHA-256 hash of the current record + previous hash. |
| `previous_hash` | `text` | SHA-256 hash of the immediately preceding audit record. |

---

## Immutability & Archival Retention Procedures

Compliance standards (SOC 2, HIPAA, GDPR) mandate long-term data retention (typically 7 years) and strict storage isolation over time:

| Retention Phase | Age | Location | Access Controls |
| :--- | :--- | :--- | :--- |
| **Hot Storage** | 0 - 90 Days | Supabase Hot Database | Write-Only (Insert/Select, Updates/Deletes Blocked) |
| **Read-Only Storage** | 90 Days - 1 Year | Supabase Hot Database | Query Only |
| **Archived Storage** | 1 - 7 Years | Amazon S3 / Google Cloud / Azure Blob | Read-Only Cold Backup |

### Purging Expired Hot Records
To enforce this retention policy without violating database immutability constraints, the archival script `backend/scripts/audit_retention.py` calls the database function `audit.purge_expired_logs()`. This function activates a session-level bypass (`SET audit.allow_archival_delete = 'true'`) allowing the service role to safely delete records that have been uploaded to cold storage.

---

## Compliance Standards Mapping

### SOC 2 (Security & Confidentiality)
- Logs all administrative actions (settings changes, role modifications).
- Logs session creations (`user_login`, `user_logout`) and authentication failures (`failed_login_attempt`).
- Supports anomalous threat alerts for brute-force attacks and privilege escalation spikes.

### HIPAA (Privacy & Security Rule)
- Captures all reading and viewing of patient/customer tickets (`view_ticket_detail`, `view_tickets`).
- Logs the exact IP and User Agent associated with each PHI access event.

### GDPR (Accountability & Erasure)
- Tracks data correction and rectification events (`update_ticket`) preserving before/after JSON values.
- Logs data erasure and record purging requests (`delete_ticket`).
