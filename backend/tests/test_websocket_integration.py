"""
Integration tests for the websocket agent messaging controller (issue #3899).

Simulates multiple concurrent agent connections exchanging messages over a
WebSocket endpoint. The controller logic from ``backend/websocket_hub`` is
mounted on a lightweight app so the tests exercise the real routing loop
without loading the heavy AI models.

Run with:  python -m unittest backend.tests.test_websocket_integration -v
"""

import json
import time
import unittest

from fastapi import FastAPI, WebSocket
from fastapi.testclient import TestClient

from backend.websocket_hub import WebSocketHub, agent_socket_handler


def build_app() -> FastAPI:
    app = FastAPI()
    hub = WebSocketHub()

    @app.websocket("/ws/agents/{agent_id}")
    async def agent_ws(websocket: WebSocket, agent_id: str):
        await agent_socket_handler(hub, websocket, agent_id)

    app.state.hub = hub
    return app


class WebSocketIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = build_app()
        cls.hub = cls.app.state.hub

    def test_concurrent_agents_exchange_private_message(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                with client.websocket_connect("/ws/agents/agent-2") as ws2:
                    # Both sockets receive a "connected" ack.
                    self.assertEqual(json.loads(ws1.receive_text())["type"], "connected")
                    self.assertEqual(json.loads(ws2.receive_text())["type"], "connected")

                    # agent-1 sends a private message to agent-2.
                    ws1.send_text(json.dumps({"type": "send", "to": "agent-2", "content": "Ticket T-1 needs attention"}))

                    delivered = json.loads(ws2.receive_text())
                    self.assertEqual(delivered["type"], "message")
                    self.assertEqual(delivered["from"], "agent-1")
                    self.assertEqual(delivered["to"], "agent-2")
                    self.assertEqual(delivered["content"], "Ticket T-1 needs attention")
                    self.assertIn("timestamp", delivered)

                    ack = json.loads(ws1.receive_text())
                    self.assertEqual(ack["type"], "delivered")
                    self.assertEqual(ack["to"], "agent-2")

    def test_broadcast_reaches_all_concurrent_agents(self):
        with TestClient(self.app) as client:
            sockets = []
            for agent in ("agent-1", "agent-2", "agent-3"):
                sock = client.websocket_connect(f"/ws/agents/{agent}")
                sock.__enter__()
                sockets.append(sock)
            try:
                for sock in sockets:
                    json.loads(sock.receive_text())  # consume connect acks

                sockets[0].send_text(json.dumps({"type": "broadcast", "content": "maintenance window at 22:00"}))
                for sock in sockets[1:]:
                    msg = json.loads(sock.receive_text())
                    self.assertEqual(msg["type"], "message")
                    self.assertEqual(msg["content"], "maintenance window at 22:00")
            finally:
                for sock in sockets:
                    sock.__exit__(None, None, None)

    def test_offline_recipient_does_not_error_sender(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                json.loads(ws1.receive_text())  # connect ack
                ws1.send_text(json.dumps({"type": "send", "to": "nobody-here", "content": "hi"}))
                ack = json.loads(ws1.receive_text())
                self.assertEqual(ack["type"], "delivered")

    def test_ping_pong(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                json.loads(ws1.receive_text())
                ws1.send_text(json.dumps({"type": "ping"}))
                self.assertEqual(json.loads(ws1.receive_text())["type"], "pong")

    def test_invalid_json_gets_error_reply(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                json.loads(ws1.receive_text())
                ws1.send_text("not-json")
                error = json.loads(ws1.receive_text())
                self.assertEqual(error["type"], "error")
                self.assertIn("JSON", error["detail"])

    def test_unknown_message_type_gets_error_reply(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                json.loads(ws1.receive_text())
                ws1.send_text(json.dumps({"type": "explode"}))
                error = json.loads(ws1.receive_text())
                self.assertEqual(error["type"], "error")
                self.assertIn("Unknown message type", error["detail"])

    def test_missing_fields_gets_error_reply(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                json.loads(ws1.receive_text())
                ws1.send_text(json.dumps({"type": "send", "content": "no target"}))
                error = json.loads(ws1.receive_text())
                self.assertEqual(error["type"], "error")
                self.assertIn("Missing", error["detail"])

    def test_disconnect_removes_agent_from_hub(self):
        with TestClient(self.app) as client:
            with client.websocket_connect("/ws/agents/agent-1") as ws1:
                json.loads(ws1.receive_text())
                with client.websocket_connect("/ws/agents/agent-2") as ws2:
                    json.loads(ws2.receive_text())
                    self.assertIn("agent-1", self.hub.connected_agents)
                    self.assertIn("agent-2", self.hub.connected_agents)
            # Wait for the disconnect handler to clean up both sockets.
            deadline = time.time() + 3
            while time.time() < deadline and self.hub.connected_agents:
                time.sleep(0.05)
            self.assertEqual(self.hub.connected_agents, [])


if __name__ == "__main__":
    unittest.main()
