import asyncio
import json
import datetime
import psutil
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from backend.auth_cookie import get_current_user

router = APIRouter(prefix="/ws", tags=["metrics"])

def get_server_metrics() -> dict:
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()
    return {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "cpu": {
            "percent": cpu,
            "count": psutil.cpu_count(),
        },
        "memory": {
            "total_mb": round(mem.total / 1024 / 1024, 1),
            "used_mb": round(mem.used / 1024 / 1024, 1),
            "percent": mem.percent,
        },
        "disk": {
            "total_gb": round(disk.total / 1024 / 1024 / 1024, 1),
            "used_gb": round(disk.used / 1024 / 1024 / 1024, 1),
            "percent": disk.percent,
        },
        "network": {
            "bytes_sent_mb": round(net.bytes_sent / 1024 / 1024, 2),
            "bytes_recv_mb": round(net.bytes_recv / 1024 / 1024, 2),
        },
        "status": "healthy" if cpu < 85 and mem.percent < 90 else "degraded",
    }

@router.websocket("/metrics")
async def metrics_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            metrics = get_server_metrics()
            await websocket.send_text(json.dumps(metrics))
            await asyncio.sleep(2)  # emit every 2 seconds
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close(code=1011)