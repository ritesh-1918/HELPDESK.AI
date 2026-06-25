import csv
import io
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

class AuditQueryService:
    """Provides querying, compliance reporting, alerts, and verification for audit logs."""

    @staticmethod
    def filter_logs(
        supabase_client: Any,
        *,
        company_id: Optional[str] = None,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        status: Optional[str] = None,
        ip_address: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Query enterprise audit logs from Supabase with flexible filters."""
        if not supabase_client:
            logger.warning("Supabase client not initialized in AuditQueryService")
            return []

        try:
            query = supabase_client.table("enterprise_audit_logs").select("*").order("timestamp", desc=True)

            if company_id:
                query = query.eq("company_id", company_id)
            if user_id:
                query = query.eq("user_id", user_id)
            if action:
                query = query.eq("action", action)
            if status:
                query = query.eq("status", status)
            if ip_address:
                query = query.eq("ip_address", ip_address)
            if date_from:
                query = query.gte("timestamp", date_from)
            if date_to:
                query = query.lte("timestamp", date_to)

            query = query.range(offset, offset + limit - 1)
            response = query.execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error querying audit logs: {e}")
            return []

    @staticmethod
    def export_logs_csv(logs: List[Dict[str, Any]]) -> str:
        """Export audit logs as a CSV formatted string."""
        if not logs:
            return ""

        output = io.StringIO()
        headers = [
            "audit_id", "timestamp", "user_id", "company_id", "session_id", "request_id",
            "action", "resource_type", "resource_id", "operation_type", "status",
            "ip_address", "user_agent", "origin", "authentication_method", "reason"
        ]
        
        writer = csv.DictWriter(output, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for log in logs:
            # Flatten or format fields if necessary
            log_copy = log.copy()
            # Ensure UUID / ID key mapping
            if "id" in log_copy and "audit_id" not in log_copy:
                log_copy["audit_id"] = log_copy["id"]
            writer.writerow(log_copy)
            
        return output.getvalue()

    @staticmethod
    def export_logs_json(logs: List[Dict[str, Any]]) -> str:
        """Export audit logs as a JSON string."""
        return json.dumps(logs, default=str, indent=2)

    @staticmethod
    def generate_compliance_report(
        supabase_client: Any,
        report_type: str,
        company_id: str
    ) -> Dict[str, Any]:
        """Generate structured reports covering specific compliance standards."""
        report_type = report_type.upper()
        now = datetime.now(timezone.utc)
        
        # Load past 30 days of data for the report
        date_from = (now - timedelta(days=30)).isoformat()
        logs = AuditQueryService.filter_logs(
            supabase_client,
            company_id=company_id,
            date_from=date_from,
            limit=1000
        )
        
        report_meta = {
            "report_type": report_type,
            "company_id": company_id,
            "generated_at": now.isoformat(),
            "scope": "Last 30 Days",
            "total_events": len(logs)
        }

        if report_type == "SOC2":
            # Focus on auth, admin actions, alerts
            admin_actions = [l for l in logs if l.get("action") in ("update_settings", "assign_role", "revoke_role", "user_signup")]
            auth_actions = [l for l in logs if l.get("action") in ("user_login", "user_logout", "failed_login_attempt")]
            failures = [l for l in logs if l.get("status") == "failure" or l.get("action") == "failed_login_attempt"]
            
            return {
                "metadata": report_meta,
                "sections": {
                    "administrative_actions": {
                        "description": "Modifications to roles, settings, and new signups.",
                        "count": len(admin_actions),
                        "events": admin_actions[:10]
                    },
                    "authentication_events": {
                        "description": "User sessions and authentication patterns.",
                        "count": len(auth_actions),
                        "events": auth_actions[:10]
                    },
                    "security_failures": {
                        "description": "Failed operations and authentication abuse attempts.",
                        "count": len(failures),
                        "events": failures[:10]
                    }
                }
            }

        elif report_type == "HIPAA":
            # Focus on PHI access (viewing tickets, search)
            views = [l for l in logs if l.get("action") in ("view_ticket_detail", "view_tickets")]
            searches = [l for l in logs if l.get("action") == "search_tickets"]
            updates = [l for l in logs if l.get("operation_type") in ("update", "delete") and l.get("resource_type") == "ticket"]
            
            return {
                "metadata": report_meta,
                "sections": {
                    "data_access_history": {
                        "description": "Inquiries and views of ticket contents.",
                        "count": len(views),
                        "events": views[:10]
                    },
                    "search_operations": {
                        "description": "Searches executed within the system.",
                        "count": len(searches),
                        "events": searches[:10]
                    },
                    "data_modification_history": {
                        "description": "Creations and updates to patient/customer data records.",
                        "count": len(updates),
                        "events": updates[:10]
                    }
                }
            }

        elif report_type == "GDPR":
            # Focus on Right to Access/Erasure and data edits
            deletes = [l for l in logs if l.get("operation_type") == "delete"]
            updates = [l for l in logs if l.get("operation_type") == "update"]
            personal_views = [l for l in logs if l.get("action") in ("view_ticket_detail", "search_tickets")]

            return {
                "metadata": report_meta,
                "sections": {
                    "data_erasure_requests": {
                        "description": "Deletions and purging of user / ticket records.",
                        "count": len(deletes),
                        "events": deletes[:10]
                    },
                    "data_rectification_events": {
                        "description": "Edits and corrections of customer records.",
                        "count": len(updates),
                        "events": updates[:10]
                    },
                    "personal_data_access": {
                        "description": "Access trails containing personally identifiable information (PII).",
                        "count": len(personal_views),
                        "events": personal_views[:10]
                    }
                }
            }
            
        else: # Internal Security Review
            high_risk = [l for l in logs if l.get("action") in ("assign_role", "revoke_role", "failed_login_attempt") or l.get("operation_type") == "delete"]
            return {
                "metadata": report_meta,
                "sections": {
                    "privileged_and_high_risk_actions": {
                        "description": "High risk events requiring security review.",
                        "count": len(high_risk),
                        "events": high_risk[:25]
                    }
                }
            }

    @staticmethod
    def detect_security_alerts(
        supabase_client: Any,
        company_id: str
    ) -> List[Dict[str, Any]]:
        """Scan audit logs for the past 24 hours to dynamically detect anomalies."""
        alerts = []
        now = datetime.now(timezone.utc)
        since_time = (now - timedelta(hours=24)).isoformat()
        
        logs = AuditQueryService.filter_logs(
            supabase_client,
            company_id=company_id,
            date_from=since_time,
            limit=2000
        )

        # 1. Authentication Abuse (Repeated failed logins: >= 5 from same IP or user in 10 mins)
        failed_logins: Dict[str, List[datetime]] = {}
        for log in logs:
            if log.get("action") == "failed_login_attempt":
                ip = log.get("ip_address") or "unknown"
                ts = datetime.fromisoformat(log.get("timestamp").replace("Z", "+00:00"))
                failed_logins.setdefault(ip, []).append(ts)
                
        for ip, times in failed_logins.items():
            times.sort()
            # Sliding window check
            for i in range(len(times)):
                window_failures = [t for t in times[i:] if t - times[i] <= timedelta(minutes=10)]
                if len(window_failures) >= 5:
                    alerts.append({
                        "id": f"alert-auth-{ip}-{window_failures[0].timestamp()}",
                        "severity": "high",
                        "category": "Authentication Abuse",
                        "title": "Brute Force / Credential Stuffing Indicator",
                        "description": f"IP {ip} generated {len(window_failures)} failed logins within 10 minutes.",
                        "timestamp": window_failures[-1].isoformat(),
                        "details": {"ip_address": ip, "failures_count": len(window_failures)}
                    })
                    break

        # 2. Data Exfiltration (Bulk access: >= 20 ticket views in 5 minutes by one user)
        user_views: Dict[str, List[datetime]] = {}
        for log in logs:
            if log.get("action") == "view_ticket_detail" and log.get("user_id"):
                u_id = log.get("user_id")
                ts = datetime.fromisoformat(log.get("timestamp").replace("Z", "+00:00"))
                user_views.setdefault(u_id, []).append(ts)

        for u_id, times in user_views.items():
            times.sort()
            for i in range(len(times)):
                window_views = [t for t in times[i:] if t - times[i] <= timedelta(minutes=5)]
                if len(window_views) >= 20:
                    alerts.append({
                        "id": f"alert-exfil-{u_id}-{window_views[0].timestamp()}",
                        "severity": "medium",
                        "category": "Data Exfiltration",
                        "title": "Bulk Ticket Record Access",
                        "description": f"User {u_id} accessed {len(window_views)} tickets in under 5 minutes.",
                        "timestamp": window_views[-1].isoformat(),
                        "details": {"user_id": u_id, "views_count": len(window_views)}
                    })
                    break

        # 3. Privilege Abuse (Privilege escalation / Role modification spikes)
        role_changes = [l for l in logs if l.get("action") in ("assign_role", "revoke_role")]
        if len(role_changes) >= 3:
            alerts.append({
                "id": f"alert-priv-spike-{now.timestamp()}",
                "severity": "critical",
                "category": "Privilege Abuse",
                "title": "Spike in Role Configurations",
                "description": f"Detected {len(role_changes)} privilege assignment changes in the last 24 hours.",
                "timestamp": now.isoformat(),
                "details": {"role_changes_count": len(role_changes)}
            })

        # 4. Suspicious Access (After-hours admin actions between 10 PM and 6 AM company local time)
        for log in logs:
            action = log.get("action")
            is_admin_action = action in ("update_settings", "assign_role", "revoke_role")
            if is_admin_action:
                ts = datetime.fromisoformat(log.get("timestamp").replace("Z", "+00:00"))
                # Assuming UTC / standard hours
                hour = ts.hour
                if hour >= 22 or hour <= 6:
                    alerts.append({
                        "id": f"alert-access-{log.get('id')}",
                        "severity": "low",
                        "category": "Suspicious Access",
                        "title": "After-Hours Administrative Activity",
                        "description": f"Administrative action '{action}' performed after hours ({hour}:00 UTC) by user {log.get('user_id')}.",
                        "timestamp": ts.isoformat(),
                        "details": {"user_id": log.get("user_id"), "action": action, "hour": hour}
                    })

        return alerts

    @staticmethod
    def verify_integrity(supabase_client: Any) -> Dict[str, Any]:
        """Call database verification function to verify logs hashing chain."""
        if not supabase_client:
            return {"verified": False, "error": "Database offline"}
        try:
            res = supabase_client.rpc("verify_chain").execute()
            if res.data and len(res.data) > 0:
                verify_res = res.data[0]
                return {
                    "verified": bool(verify_res.get("verified", False)),
                    "tampered_audit_id": verify_res.get("tampered_audit_id")
                }
            return {"verified": True, "tampered_audit_id": None}
        except Exception as e:
            logger.error(f"Integrity check failed: {e}")
            return {"verified": False, "error": str(e)}
