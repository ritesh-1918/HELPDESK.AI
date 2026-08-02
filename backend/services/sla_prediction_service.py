"""
AI-Powered SLA Breach Prediction Engine for HELPDESK.AI.
Predicts tickets at risk of breaching their SLA before the breach happens.
Resolves Issue #609.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from backend.sla_predictor import get_sla_estimate

logger = logging.getLogger(__name__)

# Valid priority values (must match sla_predictor._BASELINE_MINUTES keys)
_VALID_PRIORITIES = frozenset({"critical", "high", "medium", "low"})

class SLABreachPredictionService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    async def predict_risk(self, ticket_id: str) -> Dict[str, Any]:
        """
        Calculates the breach probability for a single ticket.
        """
        if not self.supabase:
            return {"error": "Database not connected"}

        try:
            # 1. Fetch ticket details
            res = self.supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
            ticket = res.data
            if not ticket:
                return {"error": "Ticket not found"}

            # 2. Validate priority
            priority = ticket.get("priority")
            if priority and str(priority).strip().lower() not in _VALID_PRIORITIES:
                return {"error": f"Invalid priority '{priority}'. Must be one of: {', '.join(sorted(_VALID_PRIORITIES))}"}

            # 3. Get estimate from SLA Predictor
            estimate = get_sla_estimate(ticket, self.supabase)
            
            # 4. Calculate Risk Level
            # Risk is 'High' if estimated resolution is > 90% of remaining SLA time.
            # Risk is 'Medium' if between 60% and 90%.
            
            sla_breach_at = ticket.get("sla_breach_at")
            risk_level = "Low"
            probability = 0.1

            if sla_breach_at:
                deadline = datetime.fromisoformat(str(sla_breach_at).replace("Z", "+00:00"))
                if deadline.tzinfo is None:
                    deadline = deadline.replace(tzinfo=timezone.utc)
                
                now = datetime.now(timezone.utc)
                time_remaining = (deadline - now).total_seconds() / 60
                
                if time_remaining <= 0:
                    risk_level = "BREACHED"
                    probability = 1.0
                else:
                    est_mins = estimate["estimated_minutes"]
                    ratio = est_mins / time_remaining
                    
                    probability = min(1.0, round(ratio, 2))
                    if ratio > 0.9:
                        risk_level = "High"
                    elif ratio > 0.6:
                        risk_level = "Medium"

            return {
                "ticket_id": ticket_id,
                "risk_level": risk_level,
                "breach_probability": probability,
                "estimated_resolution_minutes": estimate["estimated_minutes"],
                "factors": estimate["factors"],
                "prediction_confidence": estimate["metadata"]["confidence_score"]
            }

        except Exception as e:
            logger.error(f"SLA Prediction error: {e}")
            return {"error": str(e)}

    async def get_high_risk_tickets(self, company_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves a list of tickets for a company that are most at risk of breaching.
        """
        # 1. Get all active tickets
        res = self.supabase.table("tickets")\
            .select("id, subject, sla_breach_at, priority, category")\
            .eq("company_id", company_id)\
            .eq("sla_status", "ACTIVE")\
            .execute()
        
        active_tickets = res.data or []
        
        predictions = []
        for t in active_tickets:
            pred = await self.predict_risk(t["id"])
            if "error" not in pred and pred["risk_level"] in ["High", "Medium"]:
                predictions.append({**t, **pred})
        
        # Sort by probability descending
        return sorted(predictions, key=lambda x: x['breach_probability'], reverse=True)[:limit]
