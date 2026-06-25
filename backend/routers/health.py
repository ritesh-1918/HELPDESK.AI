from fastapi import APIRouter
from backend.schemas import HealthResponse, ReadinessResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Return the backend liveness status."""
    return HealthResponse(status="ok", message="Backend system operational.")

@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check():
    """Return the backend readiness state, including database availability."""
    from backend.database import supabase
    db_status = "ok" if supabase else "unavailable"
    return ReadinessResponse(status="ready", db_status=db_status, ai_status="ready")
