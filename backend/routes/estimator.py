"""
Response Time Estimator API Routes — AI-Powered SLA Breach Prediction
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.response_time_estimator import (
    estimate_response_time,
    generate_estimation_summary,
)

router = APIRouter(prefix="/api/estimator", tags=["estimator"])


class EstimateRequest(BaseModel):
    priority: str = Field(default="medium", pattern="^(critical|high|medium|low)$")
    team_workload: int = Field(default=0, ge=0)
    team_size: int = Field(default=1, ge=1)
    category: Optional[str] = None
    historical_avg_hours: Optional[float] = Field(default=None, gt=0)


@router.post("/estimate")
async def estimate(request: EstimateRequest):
    """Estimate response time and predict SLA breach risk."""
    try:
        estimation = estimate_response_time(
            priority=request.priority,
            team_workload=request.team_workload,
            team_size=request.team_size,
            category=request.category,
            historical_avg_hours=request.historical_avg_hours,
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
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")


@router.get("/sla-targets")
async def get_sla_targets():
    """Get SLA targets for all priority levels."""
    from services.response_time_estimator import SLA_TARGETS

    return {"success": True, "data": SLA_TARGETS}
