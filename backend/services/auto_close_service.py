"""
Auto-Close Service: Scheduled background job to automatically close resolved tickets
after a company-configured inactivity period.

Features:
- Configurable per-company auto-close settings
- Respects company-specific auto_close_days setting (default: 7 days)
- Only processes tickets in "resolved" status
- Tracks auto-closed tickets separately for auditing
- Full logging and error handling
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List

from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[AutoCloseService] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


class AutoCloseService:
    """Background service for automatically closing resolved tickets."""

    def __init__(self):
        """Initialize the auto-close service with Supabase client."""
        self.supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.enabled = os.getenv("AUTO_CLOSE_ENABLED", "true").lower() == "true"
        self.default_auto_close_days = int(os.getenv("AUTO_CLOSE_DAYS", "7"))
        self.cron_schedule = os.getenv("AUTO_CLOSE_CRON_SCHEDULE", "0 2 * * *")  # 2 AM UTC daily

    def get_system_settings(self, company_id: str) -> Dict:
        """
        Fetch company's auto-close settings from database.
        
        Args:
            company_id: UUID of the company
            
        Returns:
            Dict with auto_close_days and auto_close_enabled settings.
            Falls back to defaults if system_settings not found.
        """
        try:
            response = self.supabase.table("system_settings").select(
                "auto_close_days, auto_close_enabled"
            ).eq("company_id", company_id).single().execute()
            
            if response.data:
                return {
                    "auto_close_days": response.data.get("auto_close_days", self.default_auto_close_days),
                    "auto_close_enabled": response.data.get("auto_close_enabled", True)
                }
        except Exception as e:
            logger.warning(f"Could not fetch settings for company {company_id}: {str(e)}. Using defaults.")
        
        # Fall back to defaults
        return {
            "auto_close_days": self.default_auto_close_days,
            "auto_close_enabled": True
        }

# NOTE: Method renamed to `get_system_settings` to match schema; underlying DB table is `system_settings`.

    def _close_ticket(self, ticket_id: str, company_id: str, stats: Dict) -> bool:
        """
        Update a ticket's status to closed and set auto_closed flag.
        
        Args:
            ticket_id: UUID of ticket to close
            company_id: UUID of ticket's company
            stats: Statistics dict to track success/failure
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.supabase.table("tickets").update({
                "status": "closed",
                "auto_closed": True,
                "closed_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", ticket_id).eq("company_id", company_id).execute()
            
            stats["closed_count"] += 1
            logger.info(f"Closed ticket {ticket_id} for company {company_id}")
            return True
        except Exception as e:
            stats["error_count"] += 1
            logger.error(f"Failed to close ticket {ticket_id}: {str(e)}")
            return False

    def run(self) -> Dict:
        """
        Execute the auto-close job.
        
        Process:
        1. Fetch all resolved tickets
        2. Group by company_id
        3. For each company, check auto-close settings
        4. Close tickets older than auto_close_days
        5. Log results and return statistics
        
        Returns:
            Dict with statistics on processed/closed/error tickets
        """
        if not self.enabled:
            logger.info("Auto-close service is disabled.")
            return {"status": "disabled"}

        stats = {
            "processed_count": 0,
            "closed_count": 0,
            "error_count": 0,
            "skipped_count": 0
        }

        try:
            logger.info("Starting auto-close job...")

            # Fetch all resolved tickets
            response = self.supabase.table("tickets").select(
                "id, company_id, status, updated_at"
            ).eq("status", "resolved").execute()

            resolved_tickets = response.data if response.data else []
            stats["processed_count"] = len(resolved_tickets)
            logger.info(f"Found {len(resolved_tickets)} resolved tickets")

            # Group by company
            company_tickets: Dict[str, List] = {}
            for ticket in resolved_tickets:
                company_id = ticket.get("company_id")
                if company_id not in company_tickets:
                    company_tickets[company_id] = []
                company_tickets[company_id].append(ticket)

            # Process each company's tickets
            for company_id, tickets in company_tickets.items():
                try:
                    settings = self.get_system_settings(company_id)

                    if not settings["auto_close_enabled"]:
                        logger.info(f"Auto-close disabled for company {company_id}, skipping {len(tickets)} tickets")
                        stats["skipped_count"] += len(tickets)
                        continue

                    auto_close_days = settings["auto_close_days"]
                    cutoff_date = datetime.now(timezone.utc) - timedelta(days=auto_close_days)

                    # Filter tickets older than cutoff
                    for ticket in tickets:
                        try:
                            updated_at_str = ticket.get("updated_at")
                            if not updated_at_str:
                                logger.warning(f"Ticket {ticket['id']} missing updated_at, skipping")
                                continue

                            # Parse ISO format timestamp
                            updated_at = datetime.fromisoformat(updated_at_str.replace("Z", "+00:00"))

                            if updated_at < cutoff_date:
                                self._close_ticket(ticket["id"], company_id, stats)
                            else:
                                stats["skipped_count"] += 1

                        except ValueError as e:
                            logger.error(f"Invalid timestamp for ticket {ticket['id']}: {str(e)}")
                            stats["error_count"] += 1

                except Exception as e:
                    logger.error(f"Error processing company {company_id}: {str(e)}")
                    stats["error_count"] += len(tickets)

            logger.info(
                f"Auto-close job completed. Closed: {stats['closed_count']}, "
                f"Skipped: {stats['skipped_count']}, Errors: {stats['error_count']}"
            )
            return stats

        except Exception as e:
            logger.error(f"Fatal error in auto-close job: {str(e)}")
            stats["error_count"] += 1
            return stats

    def test_query(self) -> List:
        """
        Debug utility: show resolved tickets that would be affected without making changes.
        
        Returns:
            List of resolved tickets with company info
        """
        try:
            response = self.supabase.table("tickets").select(
                "id, company_id, status, updated_at, title"
            ).eq("status", "resolved").limit(10).execute()

            tickets = response.data if response.data else []
            logger.info(f"Found {len(tickets)} resolved tickets (sample)")
            return tickets

        except Exception as e:
            logger.error(f"Error in test_query: {str(e)}")
            return []


# Singleton instance
_instance: Optional[AutoCloseService] = None


def load():
    """Load and return singleton instance of AutoCloseService."""
    global _instance
    if _instance is None:
        _instance = AutoCloseService()
        logger.info(f"AutoCloseService loaded. Schedule: {_instance.cron_schedule}")
    return _instance


def get_instance() -> Optional[AutoCloseService]:
    """Get the singleton instance if already loaded."""
    return _instance
