"""
SLA Breach Prediction API Router

Provides endpoints for SLA breach prediction and proactive alerting.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from backend.auth.tenant_middleware import security_manager
from backend.database import supabase
from backend.services.sla_breach_predictor import (
    SLABreachPredictor,
    RiskLevel,
    create_predictor
)
from backend.services.proactive_alert_service import (
    ProactiveAlertService,
    create_alert_service
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sla-prediction", tags=["SLA Prediction"])


# Request/Response Models

class PredictionResponse(BaseModel):
    """Response model for breach prediction."""
    ticket_id: str
    probability: float = Field(..., ge=0.0, le=1.0, description="Breach probability (0-1)")
    risk_level: str = Field(..., description="Risk level classification")
    time_to_breach_minutes: int = Field(..., description="Minutes until SLA breach")
    contributing_factors: list[str] = Field(..., description="Factors contributing to risk")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score")
    recommended_actions: list[str] = Field(..., description="Recommended actions")
    breach_status: str = Field(..., description="Current breach status")
    factor_breakdown: dict = Field(default={}, description="Detailed factor analysis")


class AtRiskTicketsResponse(BaseModel):
    """Response model for at-risk tickets list."""
    tickets: list[dict]
    total_count: int
    risk_distribution: dict
    scan_timestamp: str


class AlertScanRequest(BaseModel):
    """Request model for triggering alert scan."""
    min_risk_level: str = Field(default="medium", description="Minimum risk level to alert on")
    send_notifications: bool = Field(default=True, description="Whether to send notifications")


class AlertScanResponse(BaseModel):
    """Response model for alert scan results."""
    success: bool
    scanned_tickets: int
    alerts_sent: int
    alerts_skipped: int
    escalations_triggered: int
    timestamp: str


# Endpoints

@router.get("/predict/{ticket_id}", response_model=PredictionResponse)
async def predict_ticket_breach(
    ticket_id: str,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Predict SLA breach probability for a specific ticket.
    
    Returns comprehensive risk analysis including:
    - Breach probability (0-1)
    - Risk level classification
    - Contributing factors
    - Recommended actions
    - Confidence score
    """
    try:
        company_id = user.get("company_id")
        
        # Verify ticket access
        security_manager.verify_resource_ownership("tickets", ticket_id, user)
        
        # Get ticket data
        if not supabase:
            raise HTTPException(status_code=503, detail="Database not available")
        
        ticket_result = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
        ticket = ticket_result.data
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Create predictor and run prediction
        predictor = create_predictor(supabase)
        prediction = predictor.predict_breach_probability(ticket)
        
        return PredictionResponse(
            ticket_id=ticket_id,
            probability=prediction["probability"],
            risk_level=prediction["risk_level"].value,
            time_to_breach_minutes=prediction.get("time_to_breach_minutes", 0),
            contributing_factors=prediction.get("contributing_factors", []),
            confidence=prediction.get("confidence", 0.5),
            recommended_actions=prediction.get("recommended_actions", []),
            breach_status=prediction.get("breach_status", "unknown"),
            factor_breakdown=prediction.get("factor_breakdown", {})
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting breach for ticket {ticket_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/at-risk", response_model=AtRiskTicketsResponse)
async def get_at_risk_tickets(
    min_risk_level: str = Query(default="medium", description="Minimum risk level filter"),
    limit: int = Query(default=50, ge=1, le=200, description="Maximum tickets to return"),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Get all tickets at risk of breaching SLA for the user's company.
    
    Query Parameters:
    - min_risk_level: Minimum risk level (safe, low, medium, high, critical)
    - limit: Maximum number of tickets to return (1-200)
    
    Returns list of at-risk tickets with predictions, sorted by risk level.
    """
    try:
        company_id = user.get("company_id")
        
        if not company_id:
            raise HTTPException(status_code=403, detail="User not associated with a company")
        
        # Validate risk level
        try:
            risk_level = RiskLevel(min_risk_level.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid risk_level. Must be one of: {', '.join([r.value for r in RiskLevel])}"
            )
        
        # Create predictor and get at-risk tickets
        predictor = create_predictor(supabase)
        at_risk_tickets = predictor.get_at_risk_tickets(company_id, risk_level)
        
        # Limit results
        at_risk_tickets = at_risk_tickets[:limit]
        
        # Calculate risk distribution
        risk_distribution = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "safe": 0
        }
        
        for ticket in at_risk_tickets:
            pred_risk = ticket["prediction"]["risk_level"].value
            risk_distribution[pred_risk] = risk_distribution.get(pred_risk, 0) + 1
        
        from datetime import datetime, timezone
        
        return AtRiskTicketsResponse(
            tickets=at_risk_tickets,
            total_count=len(at_risk_tickets),
            risk_distribution=risk_distribution,
            scan_timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting at-risk tickets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/scan-and-alert", response_model=AlertScanResponse)
async def scan_and_send_alerts(
    request: AlertScanRequest,
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Scan tickets for SLA breach risk and send proactive alerts.
    
    This endpoint:
    1. Scans all active tickets for the company
    2. Predicts breach probability for each
    3. Sends alerts through configured channels (Slack, email, in-app)
    4. Triggers automatic escalation for critical risks
    
    Requires admin or agent role.
    """
    try:
        company_id = user.get("company_id")
        role = user.get("role", "user")
        
        # Only admins and agents can trigger alert scans
        if role not in ["admin", "agent", "master_admin"]:
            raise HTTPException(
                status_code=403,
                detail="Only admins and agents can trigger alert scans"
            )
        
        if not company_id:
            raise HTTPException(status_code=403, detail="User not associated with a company")
        
        # Validate risk level
        try:
            min_risk = RiskLevel(request.min_risk_level.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid min_risk_level. Must be one of: {', '.join([r.value for r in RiskLevel])}"
            )
        
        # Create alert service and run scan
        alert_service = create_alert_service(supabase)
        result = await alert_service.scan_and_alert(company_id, min_risk)
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Scan failed"))
        
        return AlertScanResponse(
            success=result["success"],
            scanned_tickets=result["scanned_tickets"],
            alerts_sent=result["alerts_sent"],
            alerts_skipped=result["alerts_skipped"],
            escalations_triggered=result["escalations_triggered"],
            timestamp=result["timestamp"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in scan_and_alert: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/alert-history")
async def get_alert_history(
    limit: int = Query(default=50, ge=1, le=200, description="Maximum alerts to return"),
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Get history of SLA prediction alerts for the company.
    
    Returns chronological list of alerts sent, including:
    - Ticket information
    - Risk level at time of alert
    - Channels used
    - Timestamp
    """
    try:
        company_id = user.get("company_id")
        
        if not company_id:
            raise HTTPException(status_code=403, detail="User not associated with a company")
        
        alert_service = create_alert_service(supabase)
        history = alert_service.get_alert_history(company_id, limit)
        
        return {
            "alerts": history,
            "total_count": len(history)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting alert history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    user: dict = Depends(security_manager.get_current_user_profile)
):
    """
    Get SLA prediction dashboard statistics.
    
    Returns:
    - Total at-risk tickets by risk level
    - Average breach probability
    - Trending patterns
    - Top contributing factors
    """
    try:
        company_id = user.get("company_id")
        
        if not company_id:
            raise HTTPException(status_code=403, detail="User not associated with a company")
        
        predictor = create_predictor(supabase)
        
        # Get all at-risk tickets (medium and above)
        at_risk_tickets = predictor.get_at_risk_tickets(company_id, RiskLevel.MEDIUM)
        
        # Calculate statistics
        risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "safe": 0}
        total_probability = 0.0
        factor_frequency = {}
        
        for ticket in at_risk_tickets:
            pred = ticket["prediction"]
            risk_level = pred["risk_level"].value
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
            total_probability += pred["probability"]
            
            # Count factor frequency
            for factor in pred.get("contributing_factors", []):
                factor_frequency[factor] = factor_frequency.get(factor, 0) + 1
        
        avg_probability = total_probability / len(at_risk_tickets) if at_risk_tickets else 0.0
        
        # Top factors
        top_factors = sorted(
            factor_frequency.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        return {
            "total_at_risk": len(at_risk_tickets),
            "risk_distribution": risk_counts,
            "average_breach_probability": round(avg_probability, 3),
            "top_contributing_factors": [
                {"factor": factor, "count": count}
                for factor, count in top_factors
            ],
            "requires_immediate_attention": risk_counts["critical"],
            "requires_monitoring": risk_counts["high"] + risk_counts["medium"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
