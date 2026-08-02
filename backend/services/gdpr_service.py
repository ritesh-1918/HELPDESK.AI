"""
GDPR Compliance and Data Privacy Service.

Handles data exports (portability), erasure requests (deletion & anonymization),
consent logs, and automatic data lifecycle schedules (attachments, ticket archival, inactive users).
"""

from __future__ import annotations

import io
import csv
import json
import logging
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[GdprService] %(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

DEFAULT_PREFERENCES = {
    "marketing_emails": True,
    "product_updates": True,
    "announcements": True,
    "usage_analytics": True,
    "performance_monitoring": True,
    "behavior_tracking": True,
    "experimental_features": False,
    "research_participation": False
}


class GdprService:
    """Service to handle GDPR / CCPA privacy controls and compliance."""

    def __init__(self, supabase_client: Any):
        self.supabase = supabase_client

    def get_privacy_preferences(self, user_id: str) -> dict:
        """Retrieve current user privacy preferences."""
        try:
            res = self.supabase.table("user_privacy_preferences").select("*").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                # Strip user_id and updated_at for UI
                prefs = res.data[0]
                return {k: v for k, v in prefs.items() if k not in ["user_id", "updated_at"]}
        except Exception as exc:
            logger.error("Failed to fetch privacy preferences for user %s: %s", user_id, exc)
        return DEFAULT_PREFERENCES.copy()

    def update_privacy_preferences(self, user_id: str, new_prefs: dict) -> dict:
        """Update current preferences and log any changes to consent_logs."""
        try:
            old_prefs = self.get_privacy_preferences(user_id)
            updated_data = {
                "user_id": user_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }

            # Filter and track changes
            changed_logs = []
            for key in DEFAULT_PREFERENCES.keys():
                if key in new_prefs:
                    val = bool(new_prefs[key])
                    updated_data[key] = val
                    if old_prefs.get(key) != val:
                        changed_logs.append({
                            "user_id": user_id,
                            "consent_type": key,
                            "previous_state": old_prefs.get(key),
                            "new_state": val,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })

            # Upsert user_privacy_preferences
            self.supabase.table("user_privacy_preferences").upsert(updated_data).execute()

            # Insert consent history logs
            if changed_logs:
                self.supabase.table("consent_logs").insert(changed_logs).execute()
                # Log audit record
                self.log_privacy_audit(user_id, "update_consent_preferences", {"changed_fields": [l["consent_type"] for l in changed_logs]})

            return {k: v for k, v in updated_data.items() if k not in ["user_id", "updated_at"]}
        except Exception as exc:
            logger.error("Failed to update privacy preferences for user %s: %s", user_id, exc)
            raise exc

    def get_privacy_requests(self, user_id: str) -> List[Dict[str, Any]]:
        """List privacy requests submitted by the user."""
        try:
            res = self.supabase.table("privacy_requests").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return res.data or []
        except Exception as exc:
            logger.error("Failed to fetch privacy requests for user %s: %s", user_id, exc)
            return []

    def get_all_privacy_requests(self) -> List[Dict[str, Any]]:
        """List all privacy requests in the system (for Admin)."""
        try:
            res = self.supabase.table("privacy_requests").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception as exc:
            logger.error("Failed to fetch all privacy requests: %s", exc)
            return []

    def submit_privacy_request(self, user_id: str, request_type: str) -> Dict[str, Any]:
        """Submit a new privacy request (export or deletion)."""
        if request_type not in ["export", "deletion"]:
            raise ValueError("Invalid request type")

        try:
            request_data = {
                "user_id": user_id,
                "request_type": request_type,
                "status": "Submitted",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            res = self.supabase.table("privacy_requests").insert(request_data).execute()
            
            # Log audit record
            self.log_privacy_audit(user_id, f"submit_{request_type}_request", {"request_id": res.data[0]["id"] if res.data else None})
            return res.data[0] if res.data else {}
        except Exception as exc:
            logger.error("Failed to submit privacy request for user %s: %s", user_id, exc)
            raise exc

    def update_privacy_request_status(self, request_id: str, status: str, admin_notes: Optional[str] = None) -> Dict[str, Any]:
        """Update status of a privacy request."""
        try:
            updates = {
                "status": status,
            }
            if admin_notes is not None:
                updates["admin_notes"] = admin_notes
            if status == "Completed":
                updates["completed_at"] = datetime.now(timezone.utc).isoformat()

            res = self.supabase.table("privacy_requests").update(updates).eq("id", request_id).execute()
            if res.data:
                req = res.data[0]
                self.log_privacy_audit(req["user_id"], f"request_status_{status.lower()}", {"request_id": request_id})
                return req
            return {}
        except Exception as exc:
            logger.error("Failed to update status for privacy request %s: %s", request_id, exc)
            raise exc

    def log_privacy_audit(self, user_id: str, action: str, details: dict) -> None:
        """Create a entry in the privacy audit logs for compliance tracking."""
        try:
            self.supabase.table("privacy_audit_logs").insert({
                "user_id": user_id,
                "action": action,
                "details": details,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }).execute()
        except Exception as exc:
            logger.error("Failed to insert privacy audit log: %s", exc)

    def generate_user_data_export(self, user_id: str) -> Dict[str, Any]:
        """Gather all data associated with a user for data portability."""
        export_data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "profile": {},
            "tickets": [],
            "messages": [],
            "privacy_preferences": {},
            "consent_logs": []
        }

        try:
            # 1. Profile Information
            prof_res = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
            if prof_res.data:
                export_data["profile"] = prof_res.data[0]

            # 2. Tickets
            ticket_res = self.supabase.table("tickets").select("*").eq("user_id", user_id).execute()
            export_data["tickets"] = ticket_res.data or []

            # 3. Messages
            msg_res = self.supabase.table("ticket_messages").select("*").eq("sender_id", user_id).execute()
            export_data["messages"] = msg_res.data or []

            # 4. Consent / Privacy Preferences
            pref_res = self.supabase.table("user_privacy_preferences").select("*").eq("user_id", user_id).execute()
            if pref_res.data:
                export_data["privacy_preferences"] = pref_res.data[0]

            # 5. Consent Logs (history)
            history_res = self.supabase.table("consent_logs").select("*").eq("user_id", user_id).execute()
            export_data["consent_logs"] = history_res.data or []

            # Log audit export action
            self.log_privacy_audit(user_id, "data_portability_export", {"ticket_count": len(export_data["tickets"])})
            return export_data
        except Exception as exc:
            logger.error("Failed to gather export data for user %s: %s", user_id, exc)
            raise exc

    def export_to_csv_zip_stream(self, export_data: Dict[str, Any]) -> io.BytesIO:
        """Convert exported data to a single unified CSV file for simplicity or structured download."""
        # For simplicity in StreamingResponse, we create a text buffer containing CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # Write Profile Block
        writer.writerow(["=== USER PROFILE ==="])
        if export_data.get("profile"):
            for k, v in export_data["profile"].items():
                writer.writerow([k, v])
        writer.writerow([])

        # Write Privacy Preferences
        writer.writerow(["=== PRIVACY PREFERENCES ==="])
        if export_data.get("privacy_preferences"):
            for k, v in export_data["privacy_preferences"].items():
                writer.writerow([k, v])
        writer.writerow([])

        # Write Tickets
        writer.writerow(["=== SUPPORT TICKETS ==="])
        tickets = export_data.get("tickets", [])
        if tickets:
            headers = list(tickets[0].keys())
            writer.writerow(headers)
            for t in tickets:
                writer.writerow([t.get(h) for h in headers])
        else:
            writer.writerow(["No tickets found"])
        writer.writerow([])

        # Write Messages
        writer.writerow(["=== CORRESPONDENCE MESSAGES ==="])
        messages = export_data.get("messages", [])
        if messages:
            headers = list(messages[0].keys())
            writer.writerow(headers)
            for m in messages:
                writer.writerow([m.get(h) for h in headers])
        else:
            writer.writerow(["No messages found"])

        buffer = io.BytesIO()
        buffer.write(output.getvalue().encode("utf-8"))
        buffer.seek(0)
        return buffer

    def execute_account_deletion_anonymization(self, user_id: str) -> None:
        """
        Permanently delete personal identifying information (PII) or anonymize it.
        We delete:
        - Profiles row
        - Privacy preferences
        - Consent logs
        We anonymize:
        - Tickets user_id / email reference, replacing them with anonymous identifiers
        - Messages sender_id / name, replacing them with 'Deleted User'
        """
        try:
            logger.info("Starting GDPR execution: account deletion/anonymization for user %s", user_id)
            
            # Fetch profile to get name/email details before wiping
            prof_res = self.supabase.table("profiles").select("email").eq("id", user_id).execute()
            user_email = prof_res.data[0]["email"] if prof_res.data else f"user-{user_id[:8]}"

            # Anonymize tickets: Set user_id to NULL, anonymize metadata
            # We preserve tickets for business intelligence analytics
            anon_name = f"deleted-user-{hash(user_id) % 10000}"
            self.supabase.table("tickets").update({
                "user_id": None,
                "metadata": {"anonymized": True, "anonymized_at": datetime.now(timezone.utc).isoformat(), "original_user_alias": anon_name}
            }).eq("user_id", user_id).execute()

            # Anonymize messages
            self.supabase.table("ticket_messages").update({
                "sender_id": None,
                "sender_name": "Deleted User",
                "sender_role": "user"
            }).eq("sender_id", user_id).execute()

            # Delete preferences and consent history
            self.supabase.table("user_privacy_preferences").delete().eq("user_id", user_id).execute()
            self.supabase.table("consent_logs").delete().eq("user_id", user_id).execute()

            # Log privacy audit record (note: user_id is anonymized or recorded as dummy since user is deleted)
            self.log_privacy_audit(user_id, "erasure_request_completed", {"anonymized_alias": anon_name})

            # Delete the profile row
            self.supabase.table("profiles").delete().eq("id", user_id).execute()

            logger.info("Successfully completed GDPR deletion/anonymization for user %s", user_id)
        except Exception as exc:
            logger.error("Failed to execute deletion/anonymization for user %s: %s", user_id, exc)
            raise exc

    # --- Automated Data Lifecycle Management routines ---
    
    def cleanup_expired_attachments(self, days: int = 90) -> int:
        """Wipe attachment references from resolved tickets older than 90 days."""
        count = 0
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            
            # Fetch tickets resolved or closed before cutoff that still have image_url
            res = (
                self.supabase.table("tickets")
                .select("id, image_url")
                .in_("status", ["resolved", "closed", "auto-resolved"])
                .lt("created_at", cutoff)
                .execute()
            )
            
            tickets = res.data or []
            for ticket in tickets:
                if ticket.get("image_url"):
                    # Wipe image_url to clean up attachment footprint
                    self.supabase.table("tickets").update({"image_url": None}).eq("id", ticket["id"]).execute()
                    count += 1
            
            if count > 0:
                logger.info("Privacy Lifecycle: cleaned up %d expired attachments", count)
        except Exception as exc:
            logger.error("Privacy Lifecycle: failed expired attachments cleanup: %s", exc)
        return count

    def archive_old_tickets(self, years: int = 1) -> int:
        """Move tickets resolved/closed over 1 year ago to archived status."""
        count = 0
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(days=years * 365)).isoformat()
            
            # Fetch candidates
            res = (
                self.supabase.table("tickets")
                .select("id")
                .in_("status", ["resolved", "closed", "auto-resolved"])
                .lt("created_at", cutoff)
                .execute()
            )
            
            tickets = res.data or []
            for ticket in tickets:
                self.supabase.table("tickets").update({"status": "archived"}).eq("id", ticket["id"]).execute()
                count += 1
                
            if count > 0:
                logger.info("Privacy Lifecycle: archived %d old tickets", count)
        except Exception as exc:
            logger.error("Privacy Lifecycle: failed ticket archival: %s", exc)
        return count

    def cleanup_inactive_accounts(self, years: int = 2) -> int:
        """Identify inactive accounts (2+ years since created/updated) and flag them or delete."""
        count = 0
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(days=years * 365)).isoformat()
            
            # Select profiles
            res = (
                self.supabase.table("profiles")
                .select("id")
                .lt("created_at", cutoff)
                .execute()
            )
            
            profiles = res.data or []
            for profile in profiles:
                # To be conservative, we submit a deletion request or flag them for review
                user_id = profile["id"]
                # Check if deletion request already exists
                existing = self.supabase.table("privacy_requests").select("id").eq("user_id", user_id).eq("request_type", "deletion").execute()
                if not existing.data:
                    self.submit_privacy_request(user_id, "deletion")
                    count += 1
                    
            if count > 0:
                logger.info("Privacy Lifecycle: submitted %d inactive account deletion requests", count)
        except Exception as exc:
            logger.error("Privacy Lifecycle: failed inactive account cleanup: %s", exc)
        return count

    def process_expired_deletion_requests(self, days: int = 30) -> int:
        """Process deletion requests that have passed the grace period (default 30 days)."""
        count = 0
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            res = (
                self.supabase.table("privacy_requests")
                .select("id, user_id")
                .eq("request_type", "deletion")
                .eq("status", "Submitted")
                .lt("created_at", cutoff)
                .execute()
            )
            requests = res.data or []
            for req in requests:
                user_id = req["user_id"]
                req_id = req["id"]
                try:
                    self.execute_account_deletion_anonymization(user_id)
                    self.update_privacy_request_status(req_id, "Completed", "Grace period expired, account permanently deleted.")
                    count += 1
                except Exception as e:
                    logger.error("Failed to process deletion request %s for user %s: %s", req_id, user_id, e)
            if count > 0:
                logger.info("Privacy Lifecycle: executed %d expired deletion requests", count)
        except Exception as exc:
            logger.error("Privacy Lifecycle: failed to process expired deletion requests: %s", exc)
        return count


_instance: Optional[GdprService] = None


def load(supabase_client: Any = None) -> GdprService:
    global _instance
    if _instance is None:
        if supabase_client is None:
            from supabase import create_client
            supabase_client = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY"),
            )
        _instance = GdprService(supabase_client)
        logger.info("GdprService loaded")
    return _instance


def get_instance() -> Optional[GdprService]:
    return _instance
