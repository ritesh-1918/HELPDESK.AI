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


def seed_company_settings():
    """Main function to seed company settings for all companies."""
    
    # Initialize Supabase client
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    
    logger.info("Starting company settings seed script...")
    
    try:
        # Step 1: Get all unique companies from tickets table
        logger.info("Fetching all unique companies from tickets table...")
        
        companies_response = supabase.table("tickets").select(
            "company_id", count="exact"
        ).execute()
        
        if not companies_response.data:
            logger.warning("No tickets found. Database may be empty.")
            return {"status": "no_tickets", "created_count": 0}
        
        # Extract unique company IDs
        companies = {}
        for ticket in companies_response.data:
            company_id = ticket.get("company_id")
            if company_id and company_id not in companies:
                companies[company_id] = True
        
        unique_companies = list(companies.keys())
        logger.info(f"Found {len(unique_companies)} unique companies")
        
        # Step 2: Get existing system_settings to avoid duplicates
        logger.info("Fetching existing system_settings...")
        
        existing_response = supabase.table("system_settings").select(
            "company_id"
        ).execute()
        
        existing_companies = set()
        if existing_response.data:
            for setting in existing_response.data:
                existing_companies.add(setting.get("company_id"))
        
        logger.info(f"Found {len(existing_companies)} existing system_settings")
        
        # Step 3: Determine which companies need settings created
        companies_to_create = [c for c in unique_companies if c not in existing_companies]
        logger.info(f"Need to create settings for {len(companies_to_create)} companies")
        
        if not companies_to_create:
            logger.info("All companies already have settings. Nothing to do.")
            return {"status": "complete", "created_count": 0}
        
        # Step 4: Create default settings for each company
        created_count = 0
        error_count = 0
        
        for company_id in companies_to_create:
            try:
                # Create default settings record
                supabase.table("system_settings").insert({
                    "company_id": company_id,
                    "auto_close_enabled": True,
                    "auto_close_days": 7,
                    "email_notifications": True,
                    "admin_alerts": True,
                    "digest_frequency": "daily"
                }).execute()
                
                created_count += 1
                logger.debug(f"Created settings for company {company_id}")
                
            except Exception as e:
                error_count += 1
                logger.error(f"Failed to create settings for company {company_id}: {str(e)}")
        
        # Step 5: Verify results
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
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    
    try:
        # Get counts
        companies_response = supabase.table("tickets").select(
            "company_id", count="exact"
        ).execute()
        
        settings_response = supabase.table("system_settings").select(
            "company_id", count="exact"
        ).execute()
        
        companies_count = len(set(t["company_id"] for t in companies_response.data if t.get("company_id")))
        settings_count = len(set(s["company_id"] for s in settings_response.data if s.get("company_id")))
        
        logger.info(f"Verification: {companies_count} unique companies, {settings_count} system_settings")
        
        if companies_count == settings_count:
            logger.info("✓ Verification passed: All companies have settings!")
            return True
        else:
            logger.warning(f"✗ Verification failed: {companies_count - settings_count} companies missing settings")
            return False
    
    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        return False


if __name__ == "__main__":
    # Run seed
    result = seed_company_settings()
    
    # Verify
    verified = verify_seed()
    
    # Exit with appropriate code
    if verified and result.get("status") in ["success", "complete"]:
        logger.info("Seed script completed successfully!")
        sys.exit(0)
    else:
        logger.error("Seed script completed with issues")
        sys.exit(1)
