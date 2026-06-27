"""
SLA Notification Service: Background service to check for SLA breaches
and send warnings/notifications to company admins.
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List
from supabase import create_client
from dotenv import load_dotenv

from backend.services import notification_routing

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[SLA-Notification-Service] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


class SLANotificationService:
    def __init__(self):
        self.supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.enabled = os.getenv("SLA_NOTIFICATIONS_ENABLED", "true").lower() == "true"
        self.warning_hours = int(os.getenv("SLA_WARNING_HOURS", "1"))  # Warn 1hr before breach
        self.check_interval = int(os.getenv("SLA_CHECK_INTERVAL_MINUTES", "5"))  # Check every 5 mins

    def get_sla_hours(self, priority: str) -> int:
        """Get SLA hours based on ticket priority."""
        priority = priority.lower()
        if priority == "critical":
            return 1
        elif priority == "high":
            return 4
        elif priority == "medium":
            return 24
        else:  # low/normal
            return 48

    def _send_notification(
        self,
        ticket_id: str,
        company_id: str,
        ticket_title: str,
        notification_type: str,
        stats: Dict
    ) -> bool:
        """Send in-app notification to company admins."""
        try:
            routing = notification_routing.get_instance()
            if not routing:
                routing = notification_routing.load()

            if not routing.should_send_admin_alert(company_id):
                logger.info(f"SLA notifications disabled for company {company_id}")
                stats["skipped_count"] += 1
                return False

            # Get company admin users
            admin_users = self.supabase.table("users").select("id").eq(
                "company_id", company_id
            ).eq("role", "admin").execute()

            if not admin_users.data:
                logger.warning(f"No admins found for company {company_id}")
                stats["skipped_count"] += 1
                return False

            # Generate notification message
            if notification_type == "warning":
                message = f"Ticket '{ticket_title}' is at risk of SLA breach in {self.warning_hours} hour(s)!"
            else:  # breach
                message = f"ALERT: Ticket '{ticket_title}' has breached its SLA!"

            # Insert notifications for all admins
            for admin in admin_users.data:
                try:
                    self.supabase.table("notifications").insert({
                        "ticket_id": ticket_id,
                        "company_id": company_id,
                        "user_id": admin["id"],
                        "type": "sla_" + notification_type,
                        "title": f"SLA {notification_type.capitalize()}",
                        "message": message,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "read": False
                    }).execute()
                except Exception as e:
                    logger.error(f"Failed to send notification to admin {admin['id']}: {e}")

            # Mark ticket with warning/breach flag
            if notification_type == "warning":
                self.supabase.table("tickets").update({
                    "sla_warning_sent": True,
                    "sla_warning_sent_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", ticket_id).eq("company_id", company_id).execute()
            else:
                self.supabase.table("tickets").update({
                    "sla_breached": True,
                    "sla_breached_at": datetime.now(timezone.utc).isoformat(),
                    "sla_breach_notification_sent": True
                }).eq("id", ticket_id).eq("company_id", company_id).execute()

            stats[f"{notification_type}_notifications_sent"] += 1
            logger.info(f"Sent SLA {notification_type} notifications for ticket {ticket_id}")
            return True

        except Exception as e:
            stats["error_count"] += 1
            logger.error(f"Failed to send notifications for ticket {ticket_id}: {e}")
            return False

    def run(self) -> Dict:
        """
        Execute SLA check:
        - Find at-risk tickets and send warnings
        - Find breached tickets and send alerts
        """
        if not self.enabled:
            logger.info("SLA Notification Service is disabled.")
            return {"status": "disabled"}

        stats = {
            "processed_count": 0,
            "warning_notifications_sent": 0,
            "breach_notifications_sent": 0,
            "skipped_count": 0,
            "error_count": 0
        }

        try:
            logger.info("Starting SLA check...")
            now = datetime.now(timezone.utc)

            # Get all open tickets
            response = self.supabase.table("tickets").select(
                "id, company_id, status, created_at, priority, title, "
                "sla_warning_sent, sla_breached, sla_breach_notification_sent"
            ).in_("status", ["open", "in_progress"]).execute()

            open_tickets = response.data if response.data else []
            stats["processed_count"] = len(open_tickets)
            logger.info(f"Found {len(open_tickets)} open tickets")

            # Process each ticket
            for ticket in open_tickets:
                try:
                    created_at_str = ticket.get("created_at")
                    if not created_at_str:
                        logger.warning(f"Ticket {ticket['id']} missing created_at, skipping")
                        stats["skipped_count"] += 1
                        continue

                    created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                    priority = ticket.get("priority", "normal")
                    sla_hours = self.get_sla_hours(priority)
                    sla_deadline = created_at + timedelta(hours=sla_hours)

                    time_until_breach = sla_deadline - now

                    # Check for breach first
                    if time_until_breach.total_seconds() <= 0:
                        if not ticket.get("sla_breach_notification_sent", False):
                            self._send_notification(
                                ticket["id"],
                                ticket["company_id"],
                                ticket.get("title", "Untitled Ticket"),
                                "breach",
                                stats
                            )
                        else:
                            stats["skipped_count"] += 1
                    # Check for warning
                    elif time_until_breach.total_seconds() <= self.warning_hours * 3600:
                        if not ticket.get("sla_warning_sent", False):
                            self._send_notification(
                                ticket["id"],
                                ticket["company_id"],
                                ticket.get("title", "Untitled Ticket"),
                                "warning",
                                stats
                            )
                        else:
                            stats["skipped_count"] += 1
                    else:
                        stats["skipped_count"] += 1

                except ValueError as e:
                    logger.error(f"Invalid timestamp for ticket {ticket['id']}: {e}")
                    stats["error_count"] += 1

            logger.info(
                f"SLA check completed. Warnings: {stats['warning_notifications_sent']}, "
                f"Breaches: {stats['breach_notifications_sent']}, "
                f"Skipped: {stats['skipped_count']}, Errors: {stats['error_count']}"
            )
            return stats

        except Exception as e:
            logger.error(f"Fatal error in SLA check: {e}")
            stats["error_count"] += 1
            return stats


# Singleton instance
_instance: Optional[SLANotificationService] = None


def load() -> SLANotificationService:
    global _instance
    if _instance is None:
        _instance = SLANotificationService()
        logger.info("SLA Notification Service loaded")
    return _instance


def get_instance() -> Optional[SLANotificationService]:
    return _instance
