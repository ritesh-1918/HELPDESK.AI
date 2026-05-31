#!/usr/bin/env python
# NOTE: Filename contains `company_settings`. The script now seeds `system_settings` records
# (columns: `email_notifications`, `admin_alerts`, etc.). Filename was kept for backwards compatibility.
"""
Seed System Settings Script

Initializes default system_settings records for all existing companies in the database.
Run this script after applying the 20260531_add_company_settings.sql migration.

Usage:
    cd backend
    python scripts/seed_company_settings.py

This script:
- Queries unique companies from tickets table
- Creates default system_settings record for each
- Sets default values:
    - auto_close_enabled: true
    - auto_close_days: 7
    - email_notifications: true
    - admin_alerts: true
    - digest_frequency: 'daily'
"""

import os
import sys
import logging
from datetime import datetime, timezone

from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[SeedCompanySettings] %(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


DEFAULT_SETTINGS = {
    "auto_close_enabled": True,
    "auto_close_days": 7,
    "email_notifications": True,
    "admin_alerts": True,
    "digest_frequency": "daily",
}

PAGE_SIZE = 1000


def _fetch_all_paginated(table: str, columns: str, page_size: int = PAGE_SIZE):
    """Fetch all rows from a table with pagination to avoid silent truncation."""
    all_rows = []
    offset = 0
    while True:
        resp = supabase.table(table).select(columns).range(offset, offset + page_size - 1).execute()
        if not resp.data:
            break
        all_rows.extend(resp.data)
        if len(resp.data) < page_size:
            break
        offset += page_size
    return all_rows


def seed_company_settings(*, dry_run: bool = False):
    """Main function to seed company settings for all companies."""
    
    logger.info(f"Starting company settings seed script... (dry_run={dry_run})")
    
    try:
        # Step 1: Get all unique companies from tickets table (paginated)
        logger.info("Fetching all unique companies from tickets table (paginated)...")
        
        all_tickets = _fetch_all_paginated("tickets", "company_id")
        
        if not all_tickets:
            logger.warning("No tickets found. Database may be empty.")
            return {"status": "no_tickets", "created_count": 0}
        
        unique_companies = list(dict.fromkeys(t.get("company_id") for t in all_tickets if t.get("company_id")))
        logger.info(f"Found {len(unique_companies)} unique companies")
        
        # Step 2: Get existing system_settings to avoid duplicates (paginated)
        logger.info("Fetching existing system_settings (paginated)...")
        
        existing_settings = _fetch_all_paginated("system_settings", "company_id")
        existing_companies = {s.get("company_id") for s in existing_settings if s.get("company_id")}
        
        logger.info(f"Found {len(existing_companies)} existing system_settings")
        
        # Step 3: Determine which companies need settings created
        companies_to_create = [c for c in unique_companies if c not in existing_companies]
        logger.info(f"Need to create settings for {len(companies_to_create)} companies")
        
        if not companies_to_create:
            logger.info("All companies already have settings. Nothing to do.")
            return {"status": "complete", "created_count": 0}
        
        # Step 4: Build batch of records
        records_to_insert = [
            {"company_id": c, **DEFAULT_SETTINGS} for c in companies_to_create
        ]
        
        created_count = 0
        error_count = 0
        
        if dry_run:
            logger.info(f"[DRY-RUN] Would create {len(records_to_insert)} system_settings records")
            for rec in records_to_insert:
                logger.info(f"  [DRY-RUN] company_id={rec['company_id']}")
            return {"status": "dry_run", "would_create": len(records_to_insert)}
        
        # Step 5: Batch insert in chunks
        BATCH_SIZE = 100
        for i in range(0, len(records_to_insert), BATCH_SIZE):
            batch = records_to_insert[i:i + BATCH_SIZE]
            try:
                supabase.table("system_settings").insert(batch).execute()
                created_count += len(batch)
                logger.debug(f"Inserted batch of {len(batch)} records ({i + len(batch)}/{len(records_to_insert)})")
            except Exception as e:
                error_count += len(batch)
                logger.error(f"Failed to insert batch starting at index {i}: {str(e)}")
        
        logger.info(f"Seed complete: {created_count} created, {error_count} errors")
        
        if error_count == 0:
            logger.info("All company settings successfully created!")
            return {"status": "success", "created_count": created_count}
        else:
            logger.warning(f"Seed completed with {error_count} errors")
            return {"status": "partial", "created_count": created_count, "error_count": error_count}
    
    except Exception as e:
        logger.error(f"Fatal error during seed: {str(e)}")
        return {"status": "error", "message": str(e)}


def verify_seed():
    """Verify that seed was successful."""
    
    logger.info("Verifying seed results...")
    
    try:
        all_tickets = _fetch_all_paginated("tickets", "company_id")
        all_settings = _fetch_all_paginated("system_settings", "company_id")
        
        companies_ids = {t.get("company_id") for t in all_tickets if t.get("company_id")}
        settings_ids = {s.get("company_id") for s in all_settings if s.get("company_id")}
        
        logger.info(f"Verification: {len(companies_ids)} unique companies, {len(settings_ids)} system_settings")
        
        missing = companies_ids - settings_ids
        if not missing:
            logger.info("✓ Verification passed: All companies have settings!")
            return True
        else:
            logger.warning(f"✗ Verification failed: {len(missing)} companies missing settings: {missing}")
            return False
    
    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        return False


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    
    result = seed_company_settings(dry_run=dry_run)
    
    if dry_run:
        logger.info("Dry-run complete. Pass --dry-run to preview, omit to execute.")
        sys.exit(0)
    
    verified = verify_seed()
    
    if verified and result.get("status") in ["success", "complete"]:
        logger.info("Seed script completed successfully!")
        sys.exit(0)
    else:
        logger.error("Seed script completed with issues")
        sys.exit(1)
