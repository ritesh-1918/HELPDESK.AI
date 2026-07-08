#!/usr/bin/env python3
"""
Applies changes for GitHub issue #3374 (Missing Audit Logging for
Administrative and Tenant Management Actions). Run from the ROOT of your
HELPDESK.AI repo:

    python3 apply_admin_audit_logging.py

It edits:
  - backend/database.py            (fixes a blocking syntax error - prerequisite,
                                     backend/routers/admin.py imports supabase
                                     from this file and cannot import without it)
  - backend/middleware/audit_logger.py  (adds coverage for admin/profile
                                     mutation + privacy-approval routes)
  - main.py                        (wires up the existing, previously unwired
                                     AuditLoggerMiddleware)
"""

import sys
from pathlib import Path

ROOT = Path(".").resolve()


def replace_once(path: Path, old: str, new: str, label: str) -> bool:
    if not path.exists():
        print(f"[SKIP] {label}: file not found at {path}")
        return False
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count == 0:
        print(f"[FAIL] {label}: anchor text not found in {path}. No changes made for this edit.")
        return False
    if count > 1:
        print(f"[WARN] {label}: anchor text found {count} times in {path}; replacing the FIRST occurrence only.")
        text = text.replace(old, new, 1)
    else:
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")
    print(f"[OK]   {label}: applied to {path}")
    return True


def main():
    ok_count = 0
    total = 0

    # =================================================================
    # Prerequisite fix: backend/database.py has a blocking syntax error
    # (a `try:` block followed by a top-level `else:` with no `except`).
    # backend/routers/admin.py does `from backend.database import supabase`,
    # so admin.py - the very file with the endpoints this issue is about -
    # cannot import at all until this is fixed. Also fixes the underlying
    # bug: `create_client()` was never actually called even when
    # credentials WERE present.
    # =================================================================
    database_py = ROOT / "backend" / "database.py"

    total += 1
    ok_count += replace_once(
        database_py,
        old='''try:
    from supabase import create_client, Client
    from backend.config import settings
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_KEY
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
        supabase = None
else:
    logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")''',
        new='''supabase = None
try:
    from supabase import create_client, Client
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_KEY
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
    else:
        # NOTE (Issue #3374 prerequisite fix): this call was previously
        # missing entirely - the client was never created even when
        # credentials WERE present, and the preceding `try/else` (with no
        # `except`) was a SyntaxError that blocked this whole module -
        # and therefore backend/routers/admin.py, which imports `supabase`
        # from here - from importing at all.
        supabase = create_client(url, key)
except Exception as e:
    logger.exception("Failed to initialize Supabase client: %s", e)
    supabase = None''',
        label="database.py: fix blocking syntax error + never-calls-create_client bug",
    )

    # =================================================================
    # backend/middleware/audit_logger.py: add coverage for the
    # administrative/tenant-management routes this issue is about.
    # =================================================================
    audit_logger_py = ROOT / "backend" / "middleware" / "audit_logger.py"

    total += 1
    ok_count += replace_once(
        audit_logger_py,
        old='''        # Check for admin setting updates or other role actions
        elif path == "/ai/log_correction" and method == "POST":
            return True, "log_correction", "prediction", "update"
            
        return False, "", "", ""''',
        new='''        # Check for admin setting updates or other role actions
        elif path == "/ai/log_correction" and method == "POST":
            return True, "log_correction", "prediction", "update"

        # Issue #3374: administrative/tenant-management actions - profile
        # mutations cover admin user management and role/permission changes
        # (backend/routers/admin.py PATCH /api/profiles/{user_id} accepts a
        # `role` field per ProfileUpdate), and profile deletion.
        elif path.startswith("/api/profiles/") and method == "PATCH":
            return True, "update_profile", "profile", "update"
        elif path.startswith("/api/profiles/") and method == "DELETE":
            return True, "delete_profile", "profile", "delete"

        # Admin approval of a privacy/data-deletion request is itself a
        # privileged administrative action worth auditing.
        elif path.startswith("/api/admin/privacy/requests/") and path.endswith("/approve") and method == "POST":
            return True, "approve_privacy_request", "privacy_request", "update"

        return False, "", "", ""''',
        label="audit_logger.py: add admin profile mutation + privacy-approval coverage",
    )

    # =================================================================
    # main.py: wire up AuditLoggerMiddleware (existed, was never
    # registered with the app).
    # =================================================================
    main_py = ROOT / "main.py"

    total += 1
    ok_count += replace_once(
        main_py,
        old="""app.add_middleware(PayloadLimitMiddleware)
app.add_middleware(CSRFTokenMiddleware)
app.include_router(metrics_router.router)""",
        new="""app.add_middleware(PayloadLimitMiddleware)
app.add_middleware(CSRFTokenMiddleware)

# Issue #3374: this middleware already existed fully implemented but was
# never actually registered with the app - administrative/tenant-management
# actions (and auth, tickets, log_correction) were never being audit-logged
# as a result.
from backend.middleware.audit_logger import AuditLoggerMiddleware
app.add_middleware(AuditLoggerMiddleware)

app.include_router(metrics_router.router)""",
        label="main.py: wire up AuditLoggerMiddleware",
    )

    print()
    print(f"Applied {ok_count}/{total} changes successfully.")
    if ok_count != total:
        print("Some changes FAILED - see [FAIL] lines above.")
        sys.exit(1)
    else:
        print("All changes applied. Run `git status` and `git diff` to review before committing.")


if __name__ == "__main__":
    main()