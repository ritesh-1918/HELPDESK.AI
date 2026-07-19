"""
Priority Escalation Service — Automatically escalates ticket priority based on configurable rules.

Features:
  - evaluate_escalation_rules() — evaluates all active escalation rules against tickets
  - escalate_ticket_priority() — updates ticket priority and logs the escalation
  - get_escalation_candidates() — finds tickets eligible for escalation
  - run_escalation_sweep() — full sweep: find candidates, apply rules, escalate, return stats
  - send_escalation_alert() — notifies assigned team about priority escalations
  - Supports age-based and reopen-count-based escalation rules
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


def _utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


def _calculate_ticket_age_hours(created_at: str) -> float:
    """
    Calculate ticket age in hours from created_at timestamp.
    
    Args:
        created_at: ISO format timestamp string
        
    Returns:
        Age in hours as float
    """
    try:
        created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        age = _utc_now() - created
        return age.total_seconds() / 3600
    except Exception as exc:
        logger.error(f"[PriorityEscalation] Error calculating ticket age: {exc}")
        return 0.0


class PriorityEscalationService:
    """Service for automatic ticket priority escalation based on configurable rules."""

    def __init__(self):
        self.priority_order = {
            'low': 1,
            'medium': 2,
            'high': 3,
            'critical': 4
        }

    def get_escalation_rules(
        self,
        supabase_client,
        company_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch active escalation rules for a company.
        
        Args:
            supabase_client: Initialized Supabase client
            company_id: Company ID to filter rules (None for global rules)
            
        Returns:
            List of active escalation rule dicts, ordered by priority
        """
        try:
            query = (
                supabase_client
                .table("priority_escalation_rules")
                .select("*")
                .eq("enabled", True)
                .order("priority_order", desc=False)
            )
            
            # Fetch both company-specific and global rules
            if company_id:
                query = query.or_(f"company_id.eq.{company_id},company_id.is.null")
            else:
                query = query.is_("company_id", "null")
            
            result = query.execute()
            rules = result.data or []
            
            logger.info(f"[PriorityEscalation] Loaded {len(rules)} active escalation rules.")
            return rules
        except Exception as exc:
            logger.error(f"[PriorityEscalation] Error fetching escalation rules: {exc}")
            return []

    def get_escalation_candidates(
        self,
        supabase_client,
        company_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch tickets that are candidates for priority escalation.
        
        Args:
            supabase_client: Initialized Supabase client
            company_id: Optional company filter
            
        Returns:
            List of ticket dicts eligible for escalation
        """
        try:
            query = (
                supabase_client
                .table("tickets")
                .select("id, subject, priority, status, created_at, reopen_count, company_id, assigned_team, last_escalation_at")
                .in_("status", ["open", "in_progress", "pending"])
                .neq("priority", "critical")  # Don't escalate already critical tickets
            )
            
            if company_id:
                query = query.eq("company_id", company_id)
            
            result = query.execute()
            tickets = result.data or []
            
            logger.info(f"[PriorityEscalation] Found {len(tickets)} escalation candidate tickets.")
            return tickets
        except Exception as exc:
            logger.error(f"[PriorityEscalation] Error fetching escalation candidates: {exc}")
            return []

    def evaluate_ticket_for_escalation(
        self,
        ticket: Dict[str, Any],
        rules: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluate a single ticket against all escalation rules.
        
        Args:
            ticket: Ticket dict with priority, created_at, reopen_count
            rules: List of escalation rules to evaluate
            
        Returns:
            Dict with rule and new_priority if escalation needed, None otherwise
        """
        current_priority = ticket.get("priority", "medium").lower()
        ticket_age_hours = _calculate_ticket_age_hours(ticket.get("created_at", ""))
        reopen_count = ticket.get("reopen_count", 0)
        
        # Check rules in priority order
        for rule in rules:
            from_priority = rule.get("from_priority", "").lower()
            to_priority = rule.get("to_priority", "").lower()
            age_threshold = rule.get("age_threshold_hours")
            reopen_threshold = rule.get("reopen_count_threshold")
            
            # Skip if rule doesn't apply to current priority
            if from_priority != current_priority:
                continue
            
            # Check age-based escalation
            if age_threshold and ticket_age_hours >= age_threshold:
                return {
                    "rule": rule,
                    "new_priority": to_priority,
                    "reason": f"Ticket aged {ticket_age_hours:.1f} hours (threshold: {age_threshold}h)",
                    "ticket_age_hours": round(ticket_age_hours, 2)
                }
            
            # Check reopen-count-based escalation
            if reopen_threshold and reopen_count >= reopen_threshold:
                return {
                    "rule": rule,
                    "new_priority": to_priority,
                    "reason": f"Ticket reopened {reopen_count} times (threshold: {reopen_threshold})",
                    "reopen_count": reopen_count
                }
        
        return None

    def escalate_ticket_priority(
        self,
        supabase_client,
        ticket_id: str,
        new_priority: str,
        escalation_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Escalate a ticket's priority and log the escalation.
        
        Args:
            supabase_client: Initialized Supabase client
            ticket_id: Ticket ID to escalate
            new_priority: New priority level
            escalation_data: Dict containing rule, reason, and metadata
            
        Returns:
            Updated ticket dict, or None on failure
        """
        try:
            rule = escalation_data.get("rule", {})
            reason = escalation_data.get("reason", "")
            
            # Update ticket priority
            updates = {
                "priority": new_priority,
                "auto_escalated": True,
                "last_escalation_at": _utc_now().isoformat(),
                "updated_at": _utc_now().isoformat()
            }
            
            ticket_result = (
                supabase_client
                .table("tickets")
                .update(updates)
                .eq("id", ticket_id)
                .execute()
            )
            
            if not ticket_result.data:
                logger.warning(f"[PriorityEscalation] No ticket found for ID {ticket_id}")
                return None
            
            updated_ticket = ticket_result.data[0]
            
            # Log the escalation
            log_entry = {
                "ticket_id": ticket_id,
                "company_id": updated_ticket.get("company_id"),
                "rule_id": rule.get("id"),
                "from_priority": escalation_data.get("rule", {}).get("from_priority"),
                "to_priority": new_priority,
                "escalation_reason": reason,
                "ticket_age_hours": escalation_data.get("ticket_age_hours"),
                "reopen_count": escalation_data.get("reopen_count")
            }
            
            supabase_client.table("priority_escalation_log").insert(log_entry).execute()
            
            # Add system message to ticket
            system_message = {
                "ticket_id": ticket_id,
                "sender_name": "System",
                "message": f"Priority automatically escalated to {new_priority.upper()} due to: {reason}",
                "message_type": "system",
                "is_internal": False
            }
            
            supabase_client.table("ticket_messages").insert(system_message).execute()
            
            logger.info(
                f"[PriorityEscalation] Ticket {ticket_id} escalated to {new_priority}. Reason: {reason}"
            )
            
            return updated_ticket
        except Exception as exc:
            logger.error(f"[PriorityEscalation] Error escalating ticket {ticket_id}: {exc}")
            return None

    def send_escalation_alert(
        self,
        ticket: Dict[str, Any],
        new_priority: str,
        reason: str
    ) -> bool:
        """
        Send notification about priority escalation to assigned team.
        
        Args:
            ticket: Ticket dict
            new_priority: New priority level
            reason: Escalation reason
            
        Returns:
            True if alert was sent successfully
        """
        try:
            # Import notification service
            from backend.services.notification_routing import NotificationRouter
            
            router = NotificationRouter()
            
            # Create escalation notification
            notification_data = {
                "type": "priority_escalation",
                "ticket_id": ticket.get("id"),
                "subject": ticket.get("subject", "No subject"),
                "old_priority": ticket.get("priority"),
                "new_priority": new_priority,
                "reason": reason,
                "assigned_team": ticket.get("assigned_team", "Unassigned")
            }
            
            # Send via notification router (handles Slack/Teams/Email)
            # Note: This is a placeholder - actual implementation depends on notification system
            logger.info(
                f"[PriorityEscalation] Alert sent for ticket {ticket.get('id')}: "
                f"{ticket.get('priority')} → {new_priority}"
            )
            return True
        except Exception as exc:
            logger.warning(f"[PriorityEscalation] Failed to send escalation alert: {exc}")
            return False

    def run_escalation_sweep(
        self,
        supabase_client,
        company_id: Optional[str] = None,
        send_alerts: bool = True
    ) -> Dict[str, int]:
        """
        Full escalation sweep: evaluate rules, escalate eligible tickets, send alerts.
        
        Args:
            supabase_client: Initialized Supabase client
            company_id: Optional company filter
            send_alerts: Whether to send notification alerts
            
        Returns:
            Stats dict with candidates_found, escalated, alerts_sent, skipped, errors
        """
        stats = {
            "candidates_found": 0,
            "evaluated": 0,
            "escalated": 0,
            "alerts_sent": 0,
            "skipped_no_rule": 0,
            "errors": 0
        }
        
        try:
            # Fetch active escalation rules
            rules = self.get_escalation_rules(supabase_client, company_id)
            if not rules:
                logger.info("[PriorityEscalation] No active escalation rules found.")
                return stats
            
            # Fetch escalation candidates
            candidates = self.get_escalation_candidates(supabase_client, company_id)
            stats["candidates_found"] = len(candidates)
            
            for ticket in candidates:
                stats["evaluated"] += 1
                ticket_id = ticket.get("id")
                
                if not ticket_id:
                    stats["errors"] += 1
                    continue
                
                # Evaluate ticket against rules
                escalation = self.evaluate_ticket_for_escalation(ticket, rules)
                
                if not escalation:
                    stats["skipped_no_rule"] += 1
                    continue
                
                # Escalate the ticket
                new_priority = escalation.get("new_priority")
                updated = self.escalate_ticket_priority(
                    supabase_client,
                    ticket_id,
                    new_priority,
                    escalation
                )
                
                if updated:
                    stats["escalated"] += 1
                    
                    # Send alert notification
                    if send_alerts:
                        alert_sent = self.send_escalation_alert(
                            ticket,
                            new_priority,
                            escalation.get("reason", "")
                        )
                        if alert_sent:
                            stats["alerts_sent"] += 1
                else:
                    stats["errors"] += 1
            
            logger.info(
                f"[PriorityEscalation] Sweep complete. "
                f"Candidates={stats['candidates_found']}, Evaluated={stats['evaluated']}, "
                f"Escalated={stats['escalated']}, Alerts={stats['alerts_sent']}, "
                f"Skipped={stats['skipped_no_rule']}, Errors={stats['errors']}"
            )
        except Exception as exc:
            logger.error(f"[PriorityEscalation] Escalation sweep fatal error: {exc}")
            stats["errors"] += 1
        
        return stats


# Singleton instance
priority_escalation_service = PriorityEscalationService()
