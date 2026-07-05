# WebSocket Server Metrics Dashboard
# Fixes #2970 - Real-time dashboard with WebSocket metrics pipeline

import asyncio
import json
import time
import psutil
from collections import deque
from typing import Set

try:
    import websockets
except ImportError:
    websockets = None

METRICS_HISTORY = deque(maxlen=60)  # 60 data points
CONNECTED_CLIENTS: Set = set()


def collect_metrics() -> dict:
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    return {
        "timestamp": time.time(),
        "cpu_pct": cpu,
        "mem_used_mb": round(mem.used / 1024 / 1024, 1),
        "mem_total_mb": round(mem.total / 1024 / 1024, 1),
        "mem_pct": mem.percent,
    }


async def metrics_broadcaster():
    while True:
        metrics = collect_metrics()
        METRICS_HISTORY.append(metrics)
        if CONNECTED_CLIENTS:
            msg = json.dumps(metrics)
            await asyncio.gather(
                *[ws.send(msg) for ws in CONNECTED_CLIENTS.copy()],
                return_exceptions=True
            )
        await asyncio.sleep(1)


async def ws_handler(websocket, path="/metrics"):
    CONNECTED_CLIENTS.add(websocket)
    try:
        # Send last 60s of history on connect
        await websocket.send(json.dumps({"history": list(METRICS_HISTORY)}))
        await websocket.wait_closed()
    finally:
        CONNECTED_CLIENTS.discard(websocket)


async def start_server(host="0.0.0.0", port=8765):
    if websockets is None:
        raise RuntimeError("pip install websockets psutil")
    async with websockets.serve(ws_handler, host, port):
        await asyncio.gather(metrics_broadcaster(), asyncio.Future())


if __name__ == "__main__":
    asyncio.run(start_server())
