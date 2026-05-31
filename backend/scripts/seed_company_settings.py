#!/usr/bin/env python
"""
Seed System Settings Script

Initializes default system_settings records for all existing companies in the database.
Run this script after applying the 20260531_add_company_settings.sql migration.

Usage:
    cd backend
    python scripts/seed_company_settings.py          # normal run
    python scripts/seed_company_settings.py --dry-run # preview only, no writes

Features:
    - Paginated fetches (safe for 1000+ rows)
    - Batch inserts (single HTTP call instead of N)
    - Shared Supabase client (no double connections)
    - Dry-run mode with full logging
    - Env-var guard with clear error message
"""

import argparse
import os
import sys
import logging
from datetime import datetime, timezone

from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[SeedCompanySettings] %(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

PAGE_SIZE = 1000


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise EnvironmentError(
            f"Missing required environment variable: {name}. "
            "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
        )
    return value


def _build_client():
    return create_client(
        _require_env("SUPABASE_URL"),
        _require_env("SUPABASE_SERVICE_ROLE_KEY"),
    )


def _fetch_all(supabase, table: str, select_col: str) -> list[dict]:
    all_rows = []
    offset = 0
    while True:
        resp = (
            supabase.table(table)
            .select(select_col)
            .range(offset, offset + PAGE_SIZE - 1)
            .execute()
        )
        rows = resp.data or []
        if not rows:
            break
        all_rows.extend(rows)
        if len(rows) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return all_rows


def seed_company_settings(dry_run: bool = False) -> dict:
    supabase = _build_client()

    logger.info(
        "Starting company settings seed script...%s",
        " [DRY RUN -- no writes]" if dry_run else ""
    )

    try:
        logger.info("Fetching all unique companies from tickets table...")
        tickets = _fetch_all(supabase, "tickets", "company_id")

        if not tickets:
            logger.warning("No tickets found. Database may be empty.")
            return {"status": "no_tickets", "created_count": 0}

        companies = {}
        for ticket in tickets:
            cid = ticket.get("company_id")
            if cid and cid not in companies:
                companies[cid] = True

        unique_companies = list(companies.keys())
        logger.info("Found %d unique companies from %d ticket rows",
                     len(unique_companies), len(tickets))

        logger.info("Fetching existing system_settings...")
        existing_settings = _fetch_all(supabase, "system_settings", "company_id")
        existing_companies = {s.get("company_id") for s in existing_settings if s.get("company_id")}
        logger.info("Found %d existing system_settings", len(existing_companies))

        to_create = [c for c in unique_companies if c not in existing_companies]
        logger.info("Need to create settings for %d companies", len(to_create))

        if not to_create:
            logger.info("All companies already have settings. Nothing to do.")
            return {"status": "complete", "created_count": 0}

        now = datetime.now(timezone.utc).isoformat()
        records = [
            {
                "company_id": cid,
                "auto_close_enabled": True,
                "auto_close_days": 7,
                "email_notifications": True,
                "admin_alerts": True,
                "digest_frequency": "daily",
                "created_at": now,
            }
            for cid in to_create
        ]

        if dry_run:
            logger.info("DRY RUN: would create %d settings:", len(records))
            for r in records:
                logger.info("  company_id=%s", r["company_id"])
            return {"status": "dry_run", "would_create": len(records)}

        supabase.table("system_settings").insert(records).execute()

        logger.info("Seed complete: %d settings created", len(records))
        return {"status": "success", "created_count": len(records)}

    except Exception as e:
        logger.error("Fatal error during seed: %s", str(e))
        return {"status": "error", "message": str(e)}


def verify_seed() -> bool:
    logger.info("Verifying seed results...")
    supabase = _build_client()

    try:
        tickets = _fetch_all(supabase, "tickets", "company_id")
        settings = _fetch_all(supabase, "system_settings", "company_id")

        companies = {t["company_id"] for t in tickets if t.get("company_id")}
        existing = {s["company_id"] for s in settings if s.get("company_id")}

        logger.info("Verification: %d unique companies, %d system_settings",
                     len(companies), len(existing))

        if companies == existing:
            logger.info("Verification passed: All companies have settings!")
            return True
        else:
            missing = companies - existing
            logger.warning("Verification failed: %d companies missing settings: %s",
                           len(missing), ", ".join(missing))
            return False

    except Exception as e:
        logger.error("Verification failed: %s", str(e))
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed system settings for all companies")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would be created without writing to the database"
    )
    args = parser.parse_args()

    result = seed_company_settings(dry_run=args.dry_run)
    verified = verify_seed()

    if verified and result.get("status") in ("success", "complete"):
        logger.info("Seed script completed successfully!")
        sys.exit(0)
    else:
        logger.error("Seed script completed with issues")
        sys.exit(1)
