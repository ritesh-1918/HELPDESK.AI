from fastapi import APIRouter
from backend.schemas import HealthResponse, ReadinessResponse
import os
import platform
import psutil

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

@router.get("/health/system")
async def system_health():
    """Return system-level metrics: CPU load average, memory usage, disk usage."""
    cpu_percent = psutil.cpu_percent(interval=1)
    cpu_count = psutil.cpu_count()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Load averages (fallback on Windows)
    try:
        load_avg = os.getloadavg()
    except (OSError, AttributeError):
        # Windows doesn't have os.getloadavg
        load_avg = (cpu_percent / 100.0, cpu_percent / 100.0, cpu_percent / 100.0)
    
    return {
        "status": "healthy",
        "metrics": {
            "cpu": {
                "percent": cpu_percent,
                "cores": cpu_count,
                "load_average": {
                    "1min": round(load_avg[0], 2),
                    "5min": round(load_avg[1], 2),
                    "15min": round(load_avg[2], 2)
                }
            },
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "used_gb": round(memory.used / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "percent": memory.percent
            },
            "disk": {
                "total_gb": round(disk.total / (1024**3), 2),
                "used_gb": round(disk.used / (1024**3), 2),
                "free_gb": round(disk.free / (1024**3), 2),
                "percent": disk.percent
            },
            "process": {
                "pid": os.getpid(),
                "memory_mb": round(psutil.Process().memory_info().rss / (1024**2), 2)
            }
        },
        "timestamp": time.time(),
        "platform": platform.platform()
    }
