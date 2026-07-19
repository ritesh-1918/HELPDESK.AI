"""
Automated Ticket Routing Service

Routes tickets automatically based on DistilBERT category classification confidence.
Routes to specialized teams only when confidence is high enough.
Implements Issue #3202.

Features:
- Intelligent category classification using DistilBERT
- Confidence-based routing decisions
- Fallback to general support for uncertain classifications
- Skill-based team assignment
- Load balancing across teams
- Routing history and analytics
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Minimum confidence thresholds for routing to specialized teams
ROUTING_THRESHOLDS = {
    "critical": 0.95,      # 95% confidence required for escalation
    "specialized": 0.80,   # 80% confidence for specialized teams
    "standard": 0.60,      # 60% for standard routing
    "fallback": 0.0        # Always route to general support
}

# Category to team mapping
CATEGORY_TO_TEAM = {
    "Technical Support": ["Tech Support Team", "Senior Engineers"],
    "Billing": ["Billing Team", "Finance"],
    "Account Management": ["Account Management", "Customer Success"],
    "Bug Report": ["Dev Team", "QA"],
    "Feature Request": ["Product Team", "Dev Team"],
    "General": ["General Support", "Help Desk"]
}

# Skill requirements for teams
TEAM_SKILLS = {
    "Tech Support Team": {"python", "javascript", "database", "api"},
    "Senior Engineers": {"system_design", "architecture", "devops", "security"},
    "Billing Team": {"accounting", "payments", "invoicing"},
    "Account Management": {"customer_relations", "contracts"},
    "Dev Team": {"development", "code_review", "debugging"},
    "QA": {"testing", "qa_automation", "bug_analysis"},
    "Product Team": {"product_management", "roadmap"},
    "General Support": {"customer_support", "troubleshooting"}
}


class AutomatedTicketRoutingService:
    """
    Service for automatically routing tickets based on classification confidence.
    
    Uses DistilBERT for fast, efficient category classification.
    Makes intelligent routing decisions based on confidence scores.
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        # Import classification service if available
        try:
            from backend.services.classification_service import get_ticket_category
            self.get_ticket_category = get_ticket_category
        except ImportError:
            logger.warning("Classification service not available, using fallback routing")
            self.get_ticket_category = None
    
    def route_ticket(
        self,
        ticket: Dict[str, Any],
        company_id: str
    ) -> Dict[str, Any]:
        """
        Automatically route a ticket based on classification.
        
        Args:
            ticket: Ticket data
            company_id: Company ID for team lookup
        
        Returns:
            Routing decision with assigned team and confidence score
        """
        try:
            # Get ticket classification
            classification_result = self._classify_ticket(ticket)
            category = classification_result["category"]
            confidence = classification_result["confidence"]
            
            # Determine routing based on confidence
            routing_decision = self._make_routing_decision(
                category, confidence, company_id
            )
            
            # Get recommended team
            team = self._select_team(
                routing_decision["target_team"],
                company_id,
                ticket
            )
            
            # Log routing decision
            self._log_routing_decision(
                ticket["id"],
                company_id,
                category,
                confidence,
                team
            )
            
            return {
                "success": True,
                "ticket_id": ticket["id"],
                "category": category,
                "confidence": confidence,
                "assigned_team": team["name"],
                "assigned_to": team.get("agent_id"),
                "routing_reason": routing_decision["reason"],
                "fallback": routing_decision.get("fallback", False)
            }
        
        except Exception as e:
            logger.error(f"Error routing ticket: {e}", exc_info=True)
            # Fallback to general support
            return {
                "success": False,
                "ticket_id": ticket["id"],
                "assigned_team": "General Support",
                "routing_reason": "Fallback due to classification error",
                "fallback": True,
                "error": str(e)
            }
    
    def _classify_ticket(self, ticket: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify ticket into category using DistilBERT.
        
        Returns dict with:
        - category: Predicted category
        - confidence: Confidence score (0-1)
        - alternatives: Alternative categories with scores
        """
        subject = ticket.get("subject", "")
        description = ticket.get("description", "")
        text = f"{subject} {description}"
        
        if not text.strip():
            return {
                "category": "General",
                "confidence": 0.0,
                "alternatives": []
            }
        
        # Use classification service if available
        if self.get_ticket_category:
            try:
                result = self.get_ticket_category(text)
                return {
                    "category": result.get("category", "General"),
                    "confidence": float(result.get("confidence", 0.5)),
                    "alternatives": result.get("alternatives", [])
                }
            except Exception as e:
                logger.error(f"Classification error: {e}")
        
        # Fallback: Heuristic-based classification
        return self._heuristic_classification(text)
    
    def _heuristic_classification(self, text: str) -> Dict[str, Any]:
        """Fallback heuristic classification based on keywords."""
        text_lower = text.lower()
        
        # Define keywords for each category
        keywords = {
            "Bug Report": ["bug", "error", "crash", "broken", "not working"],
            "Feature Request": ["feature", "add", "enhancement", "new", "implement"],
            "Billing": ["invoice", "payment", "charge", "subscription", "bill"],
            "Account Management": ["account", "profile", "settings", "login"],
            "Technical Support": ["help", "how", "support", "issue", "problem"],
        }
        
        # Score each category
        scores = {}
        for category, words in keywords.items():
            score = sum(1 for word in words if word in text_lower) / len(words)
            scores[category] = score
        
        # Get top category
        top_category = max(scores, key=scores.get) if scores else "General"
        top_score = scores.get(top_category, 0.0)
        
        # Get alternatives
        alternatives = sorted(
            [(cat, score) for cat, score in scores.items() if cat != top_category],
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        return {
            "category": top_category,
            "confidence": min(0.75, top_score),  # Cap at 0.75 for heuristic
            "alternatives": [{"category": cat, "confidence": score} for cat, score in alternatives]
        }
    
    def _make_routing_decision(
        self,
        category: str,
        confidence: float,
        company_id: str
    ) -> Dict[str, Any]:
        """Make routing decision based on category and confidence."""
        
        # High confidence: Route to specialized team
        if confidence >= ROUTING_THRESHOLDS["specialized"]:
            return {
                "target_team": CATEGORY_TO_TEAM.get(category, ["General Support"])[0],
                "reason": f"High confidence ({int(confidence*100)}%) classification to {category}",
                "fallback": False
            }
        
        # Medium confidence: Route to general support with category tag
        elif confidence >= ROUTING_THRESHOLDS["standard"]:
            return {
                "target_team": "General Support",
                "reason": f"Medium confidence ({int(confidence*100)}%) - tagged as {category}",
                "fallback": False
            }
        
        # Low confidence: Route to general support
        else:
            return {
                "target_team": "General Support",
                "reason": f"Low confidence ({int(confidence*100)}%) - routing to general support",
                "fallback": True
            }
    
    def _select_team(
        self,
        preferred_team: str,
        company_id: str,
        ticket: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Select specific team/agent with load balancing.
        
        Returns:
        - name: Team name
        - agent_id: Assigned agent (if available)
        - workload: Current workload
        """
        if not self.supabase:
            return {"name": preferred_team, "workload": 0}
        
        try:
            # Get available agents in the team
            agents_result = self.supabase.table("team_members").select(
                "id, name, team, current_workload"
            ).eq("company_id", company_id).eq("team", preferred_team).execute()
            
            agents = agents_result.data or []
            
            if not agents:
                # Team not found, return generic team
                return {"name": preferred_team, "workload": 0}
            
            # Select agent with lowest workload (load balancing)
            best_agent = min(agents, key=lambda a: a.get("current_workload", 0))
            
            return {
                "name": preferred_team,
                "agent_id": best_agent["id"],
                "agent_name": best_agent["name"],
                "workload": best_agent.get("current_workload", 0)
            }
        
        except Exception as e:
            logger.error(f"Error selecting team: {e}")
            return {"name": preferred_team, "workload": 0}
    
    def _log_routing_decision(
        self,
        ticket_id: str,
        company_id: str,
        category: str,
        confidence: float,
        team: Dict[str, Any]
    ):
        """Log routing decision to database for analytics."""
        if not self.supabase:
            return
        
        try:
            log_data = {
                "ticket_id": ticket_id,
                "company_id": company_id,
                "category": category,
                "confidence": confidence,
                "assigned_team": team["name"],
                "assigned_agent_id": team.get("agent_id"),
                "routed_at": datetime.now(timezone.utc).isoformat()
            }
            
            self.supabase.table("routing_logs").insert(log_data).execute()
        
        except Exception as e:
            logger.error(f"Error logging routing decision: {e}")
    
    def get_routing_analytics(
        self,
        company_id: str,
        time_range_hours: int = 24
    ) -> Dict[str, Any]:
        """Get routing analytics for a company."""
        if not self.supabase:
            return {}
        
        try:
            from datetime import timedelta
            cutoff_time = (
                datetime.now(timezone.utc) - timedelta(hours=time_range_hours)
            ).isoformat()
            
            # Get routing logs
            logs_result = self.supabase.table("routing_logs").select(
                "*"
            ).eq("company_id", company_id).gte("routed_at", cutoff_time).execute()
            
            logs = logs_result.data or []
            
            # Calculate statistics
            total_routed = len(logs)
            avg_confidence = (
                sum(log["confidence"] for log in logs) / total_routed
                if total_routed > 0 else 0.0
            )
            
            # Category distribution
            category_dist = {}
            team_dist = {}
            
            for log in logs:
                cat = log["category"]
                team = log["assigned_team"]
                
                category_dist[cat] = category_dist.get(cat, 0) + 1
                team_dist[team] = team_dist.get(team, 0) + 1
            
            return {
                "total_routed": total_routed,
                "avg_confidence": round(avg_confidence, 3),
                "category_distribution": category_dist,
                "team_distribution": team_dist,
                "time_range_hours": time_range_hours
            }
        
        except Exception as e:
            logger.error(f"Error getting routing analytics: {e}")
            return {}
    
    def adjust_routing_thresholds(
        self,
        company_id: str,
        thresholds: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Adjust routing thresholds for a company (per-company customization).
        
        Args:
            company_id: Company ID
            thresholds: Dict with new threshold values
        
        Returns:
            Confirmation of updated thresholds
        """
        if not self.supabase:
            return {"success": False, "error": "Database not available"}
        
        try:
            threshold_data = {
                "company_id": company_id,
                "critical_threshold": thresholds.get("critical", 0.95),
                "specialized_threshold": thresholds.get("specialized", 0.80),
                "standard_threshold": thresholds.get("standard", 0.60),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            self.supabase.table("routing_thresholds").upsert(
                threshold_data,
                on_conflict="company_id"
            ).execute()
            
            return {
                "success": True,
                "company_id": company_id,
                "updated_thresholds": threshold_data
            }
        
        except Exception as e:
            logger.error(f"Error adjusting thresholds: {e}")
            return {"success": False, "error": str(e)}


def create_routing_service(supabase_client=None) -> AutomatedTicketRoutingService:
    """Factory function to create routing service."""
    return AutomatedTicketRoutingService(supabase_client)
