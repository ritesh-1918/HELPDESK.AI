"""
Proactive Alert Service for SLA Breach Predictions

Monitors predicted SLA breaches and sends proactive alerts before they occur.
Integrates with notification systems (Slack, Teams, Email) and escalation workflows.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from enum import Enum

from backend.services.sla_breach_predictor import SLABreachPredictor, RiskLevel

logger = logging.getLogger(__name__)


class AlertChannel(str, Enum):
    """Available alert channels."""
    EMAIL = "email"
    SLACK = "slack"
    TEAMS = "teams"
    WEBHOOK = "webhook"
    IN_APP = "in_app"


class ProactiveAlertService:
    """
    Monitors tickets for SLA breach risk and sends proactive alerts.
    
    Features:
    - Periodic scanning of at-risk tickets
    - Alert deduplication (don't spam same alert)
    - Escalation integration
    - Multi-channel notifications
    - Alert history tracking
    """
    
    def __init__(self, supabase_client=None, predictor: Optional[SLABreachPredictor] = None):
        self.supabase = supabase_client
        self.predictor = predictor or SLABreachPredictor(supabase_client)
        
        # Track sent alerts to avoid duplicates
        self._sent_alerts = {}  # ticket_id -> {risk_level, timestamp}
        self.ALERT_COOLDOWN_MINUTES = 60  # Don't re-alert within 60 minutes
    
    async def scan_and_alert(
        self, company_id: str, min_risk_level: RiskLevel = RiskLevel.MEDIUM
    ) -> Dict[str, Any]:
        """
        Scan all tickets for a company and send alerts for at-risk tickets.
        
        Args:
            company_id: Company ID to scan
            min_risk_level: Minimum risk level to trigger alerts
        
        Returns:
            Dict with scan results and alert counts
        """
        try:
            # Get at-risk tickets
            at_risk_tickets = self.predictor.get_at_risk_tickets(company_id, min_risk_level)
            
            alerts_sent = 0
            alerts_skipped = 0
            escalations_triggered = 0
            
            for ticket_data in at_risk_tickets:
                ticket_id = ticket_data["id"]
                prediction = ticket_data["prediction"]
                risk_level = prediction["risk_level"]
                
                # Check if we should send alert
                if self._should_send_alert(ticket_id, risk_level):
                    # Send alert
                    alert_result = await self._send_alert(ticket_data, prediction)
                    
                    if alert_result["success"]:
                        alerts_sent += 1
                        
                        # Log alert
                        await self._log_alert(ticket_data, prediction, alert_result)
                        
                        # Mark as sent
                        self._sent_alerts[ticket_id] = {
                            "risk_level": risk_level,
                            "timestamp": datetime.now(timezone.utc)
                        }
                        
                        # Trigger escalation if critical
                        if risk_level == RiskLevel.CRITICAL:
                            await self._trigger_escalation(ticket_data)
                            escalations_triggered += 1
                else:
                    alerts_skipped += 1
            
            return {
                "success": True,
                "scanned_tickets": len(at_risk_tickets),
                "alerts_sent": alerts_sent,
                "alerts_skipped": alerts_skipped,
                "escalations_triggered": escalations_triggered,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error in scan_and_alert: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
    
    def _should_send_alert(self, ticket_id: str, current_risk_level: RiskLevel) -> bool:
        """
        Check if we should send an alert for this ticket.
        
        Returns False if:
        - Alert was sent recently (within cooldown period)
        - Risk level hasn't increased since last alert
        """
        if ticket_id not in self._sent_alerts:
            return True
        
        last_alert = self._sent_alerts[ticket_id]
        last_timestamp = last_alert["timestamp"]
        last_risk_level = last_alert["risk_level"]
        
        # Check cooldown
        elapsed_minutes = (datetime.now(timezone.utc) - last_timestamp).total_seconds() / 60
        if elapsed_minutes < self.ALERT_COOLDOWN_MINUTES:
            # Only send if risk increased
            risk_rankings = ["safe", "low", "medium", "high", "critical"]
            current_rank = risk_rankings.index(current_risk_level.value)
            last_rank = risk_rankings.index(last_risk_level.value)
            
            return current_rank > last_rank
        
        return True
    
    async def _send_alert(
        self, ticket_data: Dict[str, Any], prediction: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send proactive alert through configured channels.
        """
        ticket_id = ticket_data["id"]
        subject = ticket_data.get("subject", "No subject")
        risk_level = prediction["risk_level"]
        probability = prediction["probability"]
        time_to_breach = prediction.get("time_to_breach_minutes", 0)
        
        # Build alert message
        alert_message = self._build_alert_message(ticket_data, prediction)
        
        channels_used = []
        errors = []
        
        # Send to in-app notifications
        try:
            await self._send_in_app_notification(ticket_data, alert_message)
            channels_used.append("in_app")
        except Exception as e:
            logger.error(f"Failed to send in-app notification: {e}")
            errors.append(f"in_app: {str(e)}")
        
        # Send to Slack if configured
        try:
            if await self._send_slack_alert(ticket_data, alert_message):
                channels_used.append("slack")
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {e}")
            errors.append(f"slack: {str(e)}")
        
        # Send to Teams if configured
        try:
            if await self._send_teams_alert(ticket_data, alert_message):
                channels_used.append("teams")
        except Exception as e:
            logger.error(f"Failed to send Teams alert: {e}")
            errors.append(f"teams: {str(e)}")
        
        # Send email for critical alerts
        if risk_level == RiskLevel.CRITICAL:
            try:
                await self._send_email_alert(ticket_data, alert_message)
                channels_used.append("email")
            except Exception as e:
                logger.error(f"Failed to send email alert: {e}")
                errors.append(f"email: {str(e)}")
        
        return {
            "success": len(channels_used) > 0,
            "channels": channels_used,
            "errors": errors
        }
    
    def _build_alert_message(
        self, ticket_data: Dict[str, Any], prediction: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build structured alert message."""
        ticket_id = ticket_data["id"]
        subject = ticket_data.get("subject", "No subject")
        priority = ticket_data.get("priority", "medium")
        risk_level = prediction["risk_level"]
        probability = prediction["probability"]
        time_to_breach = prediction.get("time_to_breach_minutes", 0)
        factors = prediction.get("contributing_factors", [])
        recommendations = prediction.get("recommended_actions", [])
        
        # Format time remaining
        if time_to_breach < 60:
            time_str = f"{time_to_breach} minutes"
        elif time_to_breach < 1440:
            time_str = f"{time_to_breach // 60} hours"
        else:
            time_str = f"{time_to_breach // 1440} days"
        
        return {
            "ticket_id": ticket_id,
            "subject": subject,
            "priority": priority,
            "risk_level": risk_level.value,
            "breach_probability": f"{int(probability * 100)}%",
            "time_to_breach": time_str,
            "contributing_factors": factors,
            "recommended_actions": recommendations,
            "alert_level": "🔴 CRITICAL" if risk_level == RiskLevel.CRITICAL else
                          "🟠 HIGH" if risk_level == RiskLevel.HIGH else
                          "🟡 MEDIUM",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def _send_in_app_notification(
        self, ticket_data: Dict[str, Any], alert_message: Dict[str, Any]
    ) -> bool:
        """Send in-app notification."""
        if not self.supabase:
            return False
        
        try:
            notification_data = {
                "type": "sla_breach_prediction",
                "ticket_id": ticket_data["id"],
                "company_id": ticket_data["company_id"],
                "assigned_to": ticket_data.get("assigned_to"),
                "title": f"SLA Breach Risk: {alert_message['alert_level']}",
                "message": f"Ticket #{ticket_data['id'][-8:]}: {ticket_data.get('subject', 'No subject')}",
                "risk_level": alert_message["risk_level"],
                "probability": alert_message["breach_probability"],
                "time_to_breach": alert_message["time_to_breach"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "read": False
            }
            
            self.supabase.table("notifications").insert(notification_data).execute()
            return True
        
        except Exception as e:
            logger.error(f"Error sending in-app notification: {e}")
            return False
    
    async def _send_slack_alert(
        self, ticket_data: Dict[str, Any], alert_message: Dict[str, Any]
    ) -> bool:
        """Send alert to Slack."""
        # Import Slack service if available
        try:
            from backend.services.slack_notifier import send_slack_alert, is_slack_enabled
            
            if not is_slack_enabled():
                return False
            
            # Build Slack-formatted message
            slack_payload = {
                "ticket_id": ticket_data["id"],
                "subject": ticket_data.get("subject"),
                "priority": ticket_data.get("priority"),
                "alert_type": "SLA Breach Prediction",
                "risk_level": alert_message["risk_level"],
                "details": alert_message
            }
            
            return send_slack_alert(slack_payload)
        
        except ImportError:
            logger.debug("Slack integration not available")
            return False
    
    async def _send_teams_alert(
        self, ticket_data: Dict[str, Any], alert_message: Dict[str, Any]
    ) -> bool:
        """Send alert to Microsoft Teams."""
        # Placeholder for Teams integration
        logger.debug("Teams integration not yet implemented")
        return False
    
    async def _send_email_alert(
        self, ticket_data: Dict[str, Any], alert_message: Dict[str, Any]
    ) -> bool:
        """Send email alert for critical tickets."""
        # Placeholder for email integration
        logger.debug("Email integration not yet implemented")
        return False
    
    async def _log_alert(
        self, ticket_data: Dict[str, Any], prediction: Dict[str, Any], alert_result: Dict[str, Any]
    ) -> None:
        """Log alert to database for tracking."""
        if not self.supabase:
            return
        
        try:
            log_data = {
                "ticket_id": ticket_data["id"],
                "company_id": ticket_data["company_id"],
                "risk_level": prediction["risk_level"].value,
                "breach_probability": prediction["probability"],
                "time_to_breach_minutes": prediction.get("time_to_breach_minutes"),
                "channels_used": alert_result.get("channels", []),
                "alert_sent_at": datetime.now(timezone.utc).isoformat(),
                "contributing_factors": prediction.get("contributing_factors", []),
                "recommended_actions": prediction.get("recommended_actions", [])
            }
            
            self.supabase.table("sla_prediction_alerts").insert(log_data).execute()
        
        except Exception as e:
            logger.error(f"Error logging alert: {e}")
    
    async def _trigger_escalation(self, ticket_data: Dict[str, Any]) -> bool:
        """Trigger automatic escalation for critical risk tickets."""
        if not self.supabase:
            return False
        
        try:
            # Check if already escalated
            if ticket_data.get("escalated"):
                return False
            
            # Import escalation service
            from backend.services.sla_escalation_service import SLAEscalationService
            
            escalation_service = SLAEscalationService()
            ticket_id = ticket_data["id"]
            assigned_team = ticket_data.get("assigned_team", "General Support")
            
            # Escalate ticket
            result = escalation_service.escalate_ticket(
                self.supabase, ticket_id, assigned_team
            )
            
            logger.info(f"Auto-escalated ticket {ticket_id} due to critical SLA risk")
            return result.get("success", False)
        
        except Exception as e:
            logger.error(f"Error triggering escalation: {e}")
            return False
    
    def get_alert_history(
        self, company_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get alert history for a company."""
        if not self.supabase:
            return []
        
        try:
            result = self.supabase.table("sla_prediction_alerts").select(
                "*"
            ).eq("company_id", company_id).order(
                "alert_sent_at", desc=True
            ).limit(limit).execute()
            
            return result.data or []
        
        except Exception as e:
            logger.error(f"Error getting alert history: {e}")
            return []


def create_alert_service(supabase_client=None) -> ProactiveAlertService:
    """Factory function to create a proactive alert service instance."""
    return ProactiveAlertService(supabase_client)
