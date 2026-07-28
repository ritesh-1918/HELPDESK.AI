"""
Response Time Estimator API Routes — AI-Powered SLA Breach Prediction
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from backend.auth_cookie import get_current_user
from backend.services.rate_limit_config import limiter



from backend.limiter import limiter
from backend.services.response_time_estimator import (
    estimate_response_time,
    generate_estimation_summary,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/estimator", tags=["estimator"])


class EstimateRequest(BaseModel):
    priority: str = Field(default="medium", pattern="^(critical|high|medium|low)$")
    team_workload: int = Field(..., ge=0)
    team_size: int = Field(default=1, ge=1)
    category: Optional[str] = None
    historical_avg_hours: Optional[float] = Field(default=None, gt=0)


@router.post("/estimate")
@limiter.limit("20/minute")
async def estimate(request: Request, body: EstimateRequest, user: dict = Depends(get_current_user)):
    """Estimate response time and predict SLA breach risk."""
    try:
        estimation = estimate_response_time(
            priority=body.priority,
            team_workload=body.team_workload,
            team_size=body.team_size,
            category=body.category,
            historical_avg_hours=body.historical_avg_hours,
        )
        summary = generate_estimation_summary(estimation)

        return {
            "success": True,
            "data": {
                "estimation": estimation,
                "summary": summary,
            },
        }
    except Exception as e:
        logger.error("Response time estimation failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Estimation failed. Please try again later.")


@router.get("/sla-targets")
async def get_sla_targets(user: dict = Depends(get_current_user)):
    """Get SLA targets for all priority levels."""
    from backend.services.response_time_estimator import SLA_TARGETS

    return {"success": True, "data": SLA_TARGETS}
