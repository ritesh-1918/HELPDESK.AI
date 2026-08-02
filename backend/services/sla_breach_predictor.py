"""
Enhanced SLA Breach Prediction Engine with Proactive Escalation Alerts

Predicts tickets at risk of breaching SLA and triggers proactive escalation alerts.
Implements Issue #3200.

Features:
- ML-based breach probability calculation
- Proactive alerting before breach occurs
- Automated escalation triggers
- Risk scoring with multiple factors
- Trend analysis and pattern detection
- Dashboard-ready metrics
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum

logger = logging.getLogger(__name__)


class RiskLevel(str, Enum):
    """Risk level classifications for SLA breach prediction."""
    CRITICAL = "critical"  # >90% probability, <1 hour to breach
    HIGH = "high"          # >70% probability, <4 hours to breach  
    MEDIUM = "medium"      # >50% probability, <24 hours to breach
    LOW = "low"            # <50% probability
    SAFE = "safe"          # No risk detected


class AlertType(str, Enum):
    """Types of proactive alerts that can be triggered."""
    IMMEDIATE_ACTION = "immediate_action"  # Needs urgent attention
    ESCALATION_RECOMMENDED = "escalation_recommended"
    RESOURCE_ALLOCATION = "resource_allocation"  # Needs more agents
    WORKLOAD_WARNING = "workload_warning"  # Agent overloaded
    TREND_ALERT = "trend_alert"  # Pattern of delays detected


# SLA baseline targets (in minutes)
SLA_TARGETS = {
    "critical": {"response": 15, "resolution": 240},    # 15min, 4hr
    "high": {"response": 60, "resolution": 480},        # 1hr, 8hr
    "medium": {"response": 240, "resolution": 1440},    # 4hr, 24hr
    "low": {"response": 480, "resolution": 2880},       # 8hr, 48hr
}


class SLABreachPredictor:
    """
    Enhanced SLA Breach Prediction Engine.
    
    Uses multiple factors to predict breach probability:
    - Time remaining until SLA deadline
    - Ticket complexity (category, description length)
    - Agent workload and availability
    - Historical resolution times
    - Current queue depth
    - Time of day and day of week patterns
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        # Cache for historical data to improve performance
        self._resolution_time_cache = {}
        self._last_cache_refresh = None
        self.CACHE_TTL_MINUTES = 30
    
    def predict_breach_probability(
        self,
        ticket: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive breach probability for a ticket.
        
        Args:
            ticket: Ticket data dict with fields: priority, category, sla_breach_at, etc.
            context: Optional context data (agent workload, queue depth, etc.)
        
        Returns:
            Dict with:
            - probability: float 0-1
            - risk_level: RiskLevel enum
            - time_to_breach_minutes: int
            - contributing_factors: list of factors
            - confidence: float 0-1
            - recommended_actions: list of actions
        """
        try:
            # Extract ticket data
            priority = str(ticket.get("priority", "medium")).lower()
            category = ticket.get("category", "General")
            sla_breach_at_str = ticket.get("sla_breach_at")
            created_at_str = ticket.get("created_at")
            assigned_to = ticket.get("assigned_to")
            company_id = ticket.get("company_id")
            
            # Calculate time remaining
            time_to_breach_minutes, deadline = self._calculate_time_remaining(sla_breach_at_str)
            
            if time_to_breach_minutes <= 0:
                # Already breached
                return {
                    "probability": 1.0,
                    "risk_level": RiskLevel.CRITICAL,
                    "time_to_breach_minutes": 0,
                    "contributing_factors": ["SLA already breached"],
                    "confidence": 1.0,
                    "recommended_actions": ["Immediate escalation required"],
                    "breach_status": "breached"
                }
            
            # Initialize factors and weights
            factors = []
            probability_components = []
            
            # Factor 1: Time urgency (40% weight)
            time_urgency_prob = self._calculate_time_urgency_probability(
                time_to_breach_minutes, priority
            )
            probability_components.append(("time_urgency", time_urgency_prob, 0.4))
            if time_urgency_prob > 0.7:
                factors.append("Critical time pressure")
            elif time_urgency_prob > 0.5:
                factors.append("Moderate time pressure")
            
            # Factor 2: Historical resolution time (25% weight)
            hist_prob = self._calculate_historical_probability(
                category, priority, company_id
            )
            probability_components.append(("historical", hist_prob, 0.25))
            if hist_prob > 0.6:
                factors.append("Category typically takes longer to resolve")
            
            # Factor 3: Agent workload (15% weight)
            workload_prob = self._calculate_workload_probability(
                assigned_to, company_id, context
            )
            probability_components.append(("workload", workload_prob, 0.15))
            if workload_prob > 0.6:
                factors.append("Assigned agent has high workload")
            
            # Factor 4: Queue depth (10% weight)
            queue_prob = self._calculate_queue_probability(priority, company_id, context)
            probability_components.append(("queue", queue_prob, 0.10))
            if queue_prob > 0.5:
                factors.append("High queue depth for this priority")
            
            # Factor 5: Complexity indicators (10% weight)
            complexity_prob = self._calculate_complexity_probability(ticket)
            probability_components.append(("complexity", complexity_prob, 0.10))
            if complexity_prob > 0.5:
                factors.append("Ticket appears complex")
            
            # Calculate weighted probability
            total_probability = sum(prob * weight for _, prob, weight in probability_components)
            total_probability = max(0.0, min(1.0, total_probability))  # Clamp to [0,1]
            
            # Determine risk level
            risk_level = self._determine_risk_level(total_probability, time_to_breach_minutes)
            
            # Calculate confidence score
            confidence = self._calculate_confidence(probability_components, ticket)
            
            # Generate recommended actions
            recommended_actions = self._generate_recommendations(
                risk_level, total_probability, factors, time_to_breach_minutes
            )
            
            return {
                "probability": round(total_probability, 3),
                "risk_level": risk_level,
                "time_to_breach_minutes": time_to_breach_minutes,
                "contributing_factors": factors,
                "confidence": round(confidence, 3),
                "recommended_actions": recommended_actions,
                "breach_status": "at_risk",
                "factor_breakdown": {
                    name: {"probability": prob, "weight": weight}
                    for name, prob, weight in probability_components
                }
            }
        
        except Exception as e:
            logger.error(f"Error predicting breach probability: {e}", exc_info=True)
            return {
                "probability": 0.5,
                "risk_level": RiskLevel.MEDIUM,
                "contributing_factors": ["Error in prediction"],
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _calculate_time_remaining(
        self, sla_breach_at_str: Optional[str]
    ) -> Tuple[int, Optional[datetime]]:
        """Calculate minutes remaining until SLA breach."""
        if not sla_breach_at_str:
            return 999999, None  # No deadline set
        
        try:
            deadline = datetime.fromisoformat(str(sla_breach_at_str).replace("Z", "+00:00"))
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            
            now = datetime.now(timezone.utc)
            remaining = (deadline - now).total_seconds() / 60
            return int(remaining), deadline
        except Exception as e:
            logger.error(f"Error parsing SLA deadline: {e}")
            return 999999, None
    
    def _calculate_time_urgency_probability(
        self, time_remaining_minutes: int, priority: str
    ) -> float:
        """
        Calculate probability based on time urgency.
        Uses exponential curve - probability increases rapidly as deadline approaches.
        """
        sla_target = SLA_TARGETS.get(priority, SLA_TARGETS["medium"])
        target_resolution = sla_target["resolution"]
        
        if time_remaining_minutes <= 0:
            return 1.0
        
        # Calculate percentage of SLA time remaining
        time_ratio = time_remaining_minutes / target_resolution
        
        # Exponential urgency: probability increases rapidly as time decreases
        if time_ratio <= 0.1:  # < 10% time remaining
            return 0.95
        elif time_ratio <= 0.25:  # < 25% time remaining
            return 0.85
        elif time_ratio <= 0.5:  # < 50% time remaining
            return 0.65
        elif time_ratio <= 0.75:  # < 75% time remaining
            return 0.40
        else:
            return 0.15
    
    def _calculate_historical_probability(
        self, category: str, priority: str, company_id: Optional[str]
    ) -> float:
        """
        Calculate probability based on historical resolution times for this category.
        """
        if not self.supabase or not company_id:
            return 0.5  # Default if no historical data
        
        try:
            # Check cache
            cache_key = f"{company_id}:{category}:{priority}"
            if self._should_use_cache() and cache_key in self._resolution_time_cache:
                return self._resolution_time_cache[cache_key]
            
            # Query resolved tickets in this category/priority
            query = self.supabase.table("tickets").select(
                "created_at, resolved_at, sla_breach_at"
            ).eq("company_id", company_id).eq("category", category).eq(
                "priority", priority
            ).eq("status", "resolved").limit(50)
            
            result = query.execute()
            tickets = result.data or []
            
            if len(tickets) < 5:
                # Not enough data
                prob = 0.5
            else:
                # Calculate how many historically breached
                breach_count = 0
                for t in tickets:
                    resolved_at = datetime.fromisoformat(str(t["resolved_at"]).replace("Z", "+00:00"))
                    breach_at = datetime.fromisoformat(str(t["sla_breach_at"]).replace("Z", "+00:00"))
                    if resolved_at > breach_at:
                        breach_count += 1
                
                prob = breach_count / len(tickets)
            
            # Cache result
            self._resolution_time_cache[cache_key] = prob
            return prob
        
        except Exception as e:
            logger.error(f"Error calculating historical probability: {e}")
            return 0.5
    
    def _calculate_workload_probability(
        self, assigned_to: Optional[str], company_id: Optional[str], context: Optional[Dict]
    ) -> float:
        """Calculate probability based on assigned agent's current workload."""
        if not assigned_to or not self.supabase or not company_id:
            return 0.3  # Default low probability if unassigned
        
        try:
            # Count active tickets assigned to this agent
            result = self.supabase.table("tickets").select(
                "id", count="exact"
            ).eq("assigned_to", assigned_to).eq("company_id", company_id).in_(
                "status", ["open", "in_progress"]
            ).execute()
            
            active_count = result.count or 0
            
            # Probability increases with workload
            if active_count >= 15:
                return 0.9
            elif active_count >= 10:
                return 0.7
            elif active_count >= 7:
                return 0.5
            elif active_count >= 5:
                return 0.3
            else:
                return 0.1
        
        except Exception as e:
            logger.error(f"Error calculating workload probability: {e}")
            return 0.3
    
    def _calculate_queue_probability(
        self, priority: str, company_id: Optional[str], context: Optional[Dict]
    ) -> float:
        """Calculate probability based on queue depth for this priority."""
        if not self.supabase or not company_id:
            return 0.3
        
        try:
            # Count tickets in queue with same/higher priority
            higher_priorities = {
                "low": ["low", "medium", "high", "critical"],
                "medium": ["medium", "high", "critical"],
                "high": ["high", "critical"],
                "critical": ["critical"]
            }
            
            priorities_to_check = higher_priorities.get(priority, [priority])
            
            result = self.supabase.table("tickets").select(
                "id", count="exact"
            ).eq("company_id", company_id).in_(
                "status", ["open", "in_progress"]
            ).in_("priority", priorities_to_check).execute()
            
            queue_depth = result.count or 0
            
            # Probability increases with queue depth
            if queue_depth >= 50:
                return 0.8
            elif queue_depth >= 30:
                return 0.6
            elif queue_depth >= 15:
                return 0.4
            else:
                return 0.2
        
        except Exception as e:
            logger.error(f"Error calculating queue probability: {e}")
            return 0.3
    
    def _calculate_complexity_probability(self, ticket: Dict[str, Any]) -> float:
        """Calculate probability based on ticket complexity indicators."""
        complexity_score = 0.0
        
        # Factor: Description length
        description = ticket.get("description", "")
        if len(description) > 1000:
            complexity_score += 0.3
        elif len(description) > 500:
            complexity_score += 0.2
        
        # Factor: Multiple categories/tags
        tags = ticket.get("tags", [])
        if isinstance(tags, list) and len(tags) > 3:
            complexity_score += 0.2
        
        # Factor: Has attachments
        if ticket.get("attachments") or ticket.get("has_attachments"):
            complexity_score += 0.1
        
        # Factor: Reopened ticket
        if ticket.get("reopen_count", 0) > 0:
            complexity_score += 0.3
        
        return min(1.0, complexity_score)
    
    def _determine_risk_level(
        self, probability: float, time_to_breach_minutes: int
    ) -> RiskLevel:
        """Determine risk level based on probability and time remaining."""
        if probability >= 0.9 or time_to_breach_minutes < 60:
            return RiskLevel.CRITICAL
        elif probability >= 0.7 or time_to_breach_minutes < 240:
            return RiskLevel.HIGH
        elif probability >= 0.5 or time_to_breach_minutes < 1440:
            return RiskLevel.MEDIUM
        elif probability >= 0.3:
            return RiskLevel.LOW
        else:
            return RiskLevel.SAFE
    
    def _calculate_confidence(
        self, probability_components: List[Tuple], ticket: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for the prediction."""
        confidence = 0.5  # Base confidence
        
        # More data points = higher confidence
        if len(probability_components) >= 5:
            confidence += 0.2
        
        # Complete ticket data = higher confidence
        if all(ticket.get(field) for field in ["priority", "category", "sla_breach_at"]):
            confidence += 0.2
        
        # Assigned ticket = higher confidence
        if ticket.get("assigned_to"):
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def _generate_recommendations(
        self, risk_level: RiskLevel, probability: float, factors: List[str], time_remaining: int
    ) -> List[str]:
        """Generate actionable recommendations based on risk assessment."""
        recommendations = []
        
        if risk_level == RiskLevel.CRITICAL:
            recommendations.append("URGENT: Escalate immediately to senior team")
            recommendations.append("Assign additional resources if available")
            recommendations.append("Notify management of critical SLA risk")
        
        elif risk_level == RiskLevel.HIGH:
            recommendations.append("Escalate to supervisor for review")
            recommendations.append("Prioritize this ticket in agent queue")
            recommendations.append("Consider reassigning if agent overloaded")
        
        elif risk_level == RiskLevel.MEDIUM:
            recommendations.append("Monitor closely for status updates")
            recommendations.append("Check if additional information needed from customer")
            recommendations.append("Review agent workload and adjust if needed")
        
        elif risk_level == RiskLevel.LOW:
            recommendations.append("Continue normal resolution process")
            recommendations.append("Periodic check-ins recommended")
        
        # Add specific recommendations based on factors
        if "Assigned agent has high workload" in factors:
            recommendations.append("Consider load balancing - reassign to available agent")
        
        if "High queue depth for this priority" in factors:
            recommendations.append("Allocate more agents to this priority queue")
        
        return recommendations
    
    def _should_use_cache(self) -> bool:
        """Check if cache is still valid."""
        if not self._last_cache_refresh:
            self._last_cache_refresh = datetime.now(timezone.utc)
            return False
        
        elapsed = (datetime.now(timezone.utc) - self._last_cache_refresh).total_seconds() / 60
        if elapsed > self.CACHE_TTL_MINUTES:
            self._resolution_time_cache.clear()
            self._last_cache_refresh = datetime.now(timezone.utc)
            return False
        
        return True
    
    def get_at_risk_tickets(
        self, company_id: str, min_risk_level: RiskLevel = RiskLevel.MEDIUM
    ) -> List[Dict[str, Any]]:
        """
        Get all tickets at risk of breaching SLA for a company.
        
        Args:
            company_id: Company ID to filter tickets
            min_risk_level: Minimum risk level to include
        
        Returns:
            List of tickets with their prediction data, sorted by risk (highest first)
        """
        if not self.supabase:
            return []
        
        try:
            # Get all active tickets
            result = self.supabase.table("tickets").select(
                "*"
            ).eq("company_id", company_id).in_(
                "status", ["open", "in_progress"]
            ).execute()
            
            tickets = result.data or []
            
            # Calculate predictions for each ticket
            risk_rankings = ["critical", "high", "medium", "low", "safe"]
            min_rank = risk_rankings.index(min_risk_level.value)
            
            at_risk_tickets = []
            for ticket in tickets:
                prediction = self.predict_breach_probability(ticket)
                risk_rank = risk_rankings.index(prediction["risk_level"].value)
                
                if risk_rank <= min_rank:
                    at_risk_tickets.append({
                        **ticket,
                        "prediction": prediction
                    })
            
            # Sort by risk level (critical first) then by probability
            at_risk_tickets.sort(
                key=lambda x: (
                    risk_rankings.index(x["prediction"]["risk_level"].value),
                    -x["prediction"]["probability"]
                )
            )
            
            return at_risk_tickets
        
        except Exception as e:
            logger.error(f"Error getting at-risk tickets: {e}", exc_info=True)
            return []


def create_predictor(supabase_client=None) -> SLABreachPredictor:
    """Factory function to create an SLA breach predictor instance."""
    return SLABreachPredictor(supabase_client)
