"""
Realtime agent messaging over WebSockets (issue #3899).

A lightweight connection hub routes messages between concurrently connected
agent sockets. The controller loop (``agent_socket_handler``) owns the
receive/dispatch cycle and is exercised by the integration tests in
``backend/tests/test_websocket_integration.py``.

Protocol (client -> server):
    {"type": "send", "to": "<agent_id>", "content": "..."}   private message
    {"type": "broadcast", "content": "..."}                  to all agents
    {"type": "ping"}                                          -> {"type": "pong"}

Server -> client:
    {"type": "connected", ...}          on accept
    {"type": "message", from, to, ...}  routed message
    {"type": "delivered", ...}          ack to sender
    {"type": "error", "detail": ...}    malformed/invalid payloads
"""

import asyncio
import datetime
import json

from fastapi import WebSocket, WebSocketDisconnect

ALLOWED_MESSAGE_TYPES = {"send", "broadcast", "ping"}


def _now_utc() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"


class WebSocketHub:
    """Tracks per-agent websocket connections and routes messages."""

    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    @property
    def connected_agents(self) -> list[str]:
        return [agent for agent, conns in self._connections.items() if conns]

    async def connect(self, agent_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(agent_id, set()).add(websocket)
        await self._send(websocket, {"type": "connected", "agent_id": agent_id})

    async def disconnect(self, agent_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            conns = self._connections.get(agent_id)
            if conns:
                conns.discard(websocket)
                if not conns:
                    self._connections.pop(agent_id, None)

    async def send_to_agent(self, agent_id: str, message: dict) -> None:
        for websocket in list(self._connections.get(agent_id, ())):
            await self._send(websocket, message)

    async def broadcast(self, message: dict) -> None:
        targets = {ws for conns in self._connections.values() for ws in conns}
        for websocket in list(targets):
            await self._send(websocket, message)

    @staticmethod
    async def _send(websocket: WebSocket, message: dict) -> None:
        await websocket.send_text(json.dumps(message, default=str))


async def agent_socket_handler(hub: WebSocketHub, websocket: WebSocket, agent_id: str) -> None:
    """
    Websocket controller loop for a single agent connection.

    Accepts the socket, routes incoming ``send``/``broadcast`` messages to the
    appropriate recipients, answers ``ping`` probes, and cleans up on
    disconnect so dead connections never linger in the hub.
    """
    await hub.connect(agent_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                await hub.send_to_agent(agent_id, {"type": "error", "detail": "Invalid JSON payload"})
                continue

            msg_type = payload.get("type")
            if msg_type == "send":
                target = payload.get("to")
                content = payload.get("content")
                if not target or content is None:
                    await hub.send_to_agent(
                        agent_id, {"type": "error", "detail": "Missing 'to' or 'content' for send"}
                    )
                    continue
                outbound = {
                    "type": "message",
                    "from": agent_id,
                    "to": target,
                    "content": content,
                    "timestamp": _now_utc(),
                }
                await hub.send_to_agent(target, outbound)
                await hub.send_to_agent(agent_id, {"type": "delivered", "to": target})
            elif msg_type == "broadcast":
                outbound = {
                    "type": "message",
                    "from": agent_id,
                    "content": payload.get("content"),
                    "timestamp": _now_utc(),
                }
                await hub.broadcast(outbound)
            elif msg_type == "ping":
                await hub.send_to_agent(agent_id, {"type": "pong"})
            else:
                await hub.send_to_agent(
                    agent_id, {"type": "error", "detail": f"Unknown message type: {msg_type}"}
                )
    except WebSocketDisconnect:
        await hub.disconnect(agent_id, websocket)
