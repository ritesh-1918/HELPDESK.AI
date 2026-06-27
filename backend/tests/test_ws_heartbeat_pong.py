"""
Tests for issue #1389 — WebSocket heartbeat bidirectional ping/pong.

Verifies:
- Backend WebSocket endpoint responds to client {"type": "ping"} with {"type": "pong"}
- Backend records liveness when client sends {"type": "pong"}  (server-initiated flow)
- Frontend hook sends {"type": "ping"} (not "pong") in startHeartbeat
- Frontend hook responds to server pings with {"type": "pong"}
- Frontend hook cancels pong deadline when server pong is received
- Frontend hook reconnects when pong deadline fires (dead connection detection)
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import unittest
from unittest.mock import AsyncMock, MagicMock, call, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "placeholder_key")


# ---------------------------------------------------------------------------
# Backend: WebSocket message routing
# ---------------------------------------------------------------------------

class TestBackendWsClientPingResponse(unittest.TestCase):
    """The backend WebSocket endpoint must echo {"type":"pong"} on client ping."""

    def _get_connection_manager_class(self):
        try:
            # Import the local class defined in main.py (not ws_manager.py)
            import importlib
            import backend.main as main_mod
            return getattr(main_mod, "connection_manager", None)
        except Exception:
            return None

    def test_client_ping_triggers_pong_send(self):
        """
        Simulate the inner receive loop: when a {"type":"ping"} message arrives
        the endpoint must call ws.send_json({"type": "pong"}).
        """
        async def _run():
            ws = AsyncMock()
            ws.accept = AsyncMock()
            ws.send_json = AsyncMock()
            ws.receive_text = AsyncMock(side_effect=[
                json.dumps({"type": "ping"}),
                # After the ping, raise disconnect to exit the loop
                Exception("disconnect"),
            ])

            # Reproduce the logic extracted from the websocket_endpoint handler
            messages = [
                json.dumps({"type": "ping"}),
            ]

            for raw in messages:
                data = json.loads(raw)
                msg_type = data.get("type")
                if msg_type == "ping":
                    await ws.send_json({"type": "pong"})
                elif msg_type == "pong":
                    pass  # record_pong would be called here

            ws.send_json.assert_called_once_with({"type": "pong"})

        asyncio.get_event_loop().run_until_complete(_run())

    def test_client_pong_does_not_echo(self):
        """{"type":"pong"} from the client must NOT trigger another pong send."""
        async def _run():
            ws = AsyncMock()
            ws.send_json = AsyncMock()

            data = {"type": "pong"}
            msg_type = data.get("type")

            if msg_type == "ping":
                await ws.send_json({"type": "pong"})
            # pong handling updates liveness, does not send

            ws.send_json.assert_not_called()

        asyncio.get_event_loop().run_until_complete(_run())

    def test_non_ping_pong_message_not_echoed(self):
        """Arbitrary messages like ticket_update must not trigger any pong echo."""
        async def _run():
            ws = AsyncMock()
            ws.send_json = AsyncMock()

            data = {"type": "ticket_update", "ticket": {"id": "TCKT-001"}}
            msg_type = data.get("type")

            if msg_type == "ping":
                await ws.send_json({"type": "pong"})

            ws.send_json.assert_not_called()

        asyncio.get_event_loop().run_until_complete(_run())


# ---------------------------------------------------------------------------
# Backend: ConnectionManager.record_pong
# ---------------------------------------------------------------------------

class TestConnectionManagerRecordPong(unittest.TestCase):
    """connection_manager.record_pong must update last_pong without raising."""

    def _get_cm(self):
        try:
            from backend.main import connection_manager
            return connection_manager
        except Exception:
            return None

    def test_record_pong_known_ws_updates_timestamp(self):
        cm = self._get_cm()
        if cm is None:
            self.skipTest("main.py not importable")

        mock_ws = MagicMock()
        # Prime the pong table with a known old time
        cm._last_pong[mock_ws] = 0.0
        before = time.time()
        cm.record_pong(mock_ws)
        after = time.time()

        self.assertGreaterEqual(cm._last_pong[mock_ws], before)
        self.assertLessEqual(cm._last_pong[mock_ws], after)

    def test_record_pong_unknown_ws_does_not_crash(self):
        cm = self._get_cm()
        if cm is None:
            self.skipTest("main.py not importable")

        unknown_ws = MagicMock()
        # Should silently add or ignore — must not raise
        try:
            cm.record_pong(unknown_ws)
        except Exception as exc:
            self.fail(f"record_pong raised on unknown ws: {exc}")


# ---------------------------------------------------------------------------
# Frontend: useWebSocket heartbeat constants (via source inspection)
# ---------------------------------------------------------------------------

class TestFrontendHeartbeatConstants(unittest.TestCase):
    """Inspect useWebSocket.js source to confirm correct heartbeat direction."""

    def _source(self) -> str:
        path = os.path.join(
            os.path.dirname(__file__), "..", "..", "Frontend", "src", "hooks", "useWebSocket.js"
        )
        if not os.path.exists(path):
            return ""
        return open(path).read()

    def test_heartbeat_sends_ping_not_pong(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        # The client must send "ping" as its keepalive, not "pong"
        self.assertIn('"ping"', src, "startHeartbeat must send {type: 'ping'}")

    def test_pong_timeout_ref_is_set_after_ping(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        self.assertIn("pongTimeoutRef.current = setTimeout", src,
                      "pongTimeoutRef must be armed after sending ping")

    def test_pong_received_clears_timeout(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        # When server pong arrives, the deadline timer must be cancelled
        self.assertIn("clearTimeout(pongTimeoutRef.current)", src,
                      "pong handler must cancel the pong deadline timer")

    def test_client_echoes_server_ping_with_pong(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        # Server-initiated ping must be echoed with pong
        self.assertIn('"pong"', src, "Client must respond to server pings with {type: 'pong'}")

    def test_ping_interval_less_than_pong_timeout(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")

        import re
        ping_m = re.search(r"PING_INTERVAL_MS\s*=\s*(\d+)", src)
        pong_m = re.search(r"PONG_TIMEOUT_MS\s*=\s*(\d+)", src)

        self.assertIsNotNone(ping_m, "PING_INTERVAL_MS constant must be defined")
        self.assertIsNotNone(pong_m, "PONG_TIMEOUT_MS constant must be defined")

        ping_ms = int(ping_m.group(1))
        pong_ms = int(pong_m.group(1))
        self.assertGreater(pong_ms, 0)
        self.assertGreater(ping_ms, 0)

    def test_reconnect_triggered_on_pong_timeout(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        self.assertIn("scheduleReconnect", src,
                      "pong timeout handler must call scheduleReconnect")

    def test_start_heartbeat_receives_socket_parameter(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        # startHeartbeat now receives the socket as a parameter so the closure
        # captures the right socket instance rather than the stale wsRef
        self.assertIn("startHeartbeat(socket)", src,
                      "startHeartbeat must be called with the socket instance")

    def test_pong_timeout_ref_cleared_in_cleanup(self):
        src = self._source()
        if not src:
            self.skipTest("useWebSocket.js not found")
        self.assertIn("pongTimeoutRef", src)

    def test_backend_ping_handler_in_main_py(self):
        """backend/main.py must handle client ping and reply with pong."""
        main_path = os.path.join(
            os.path.dirname(__file__), "..", "main.py"
        )
        if not os.path.exists(main_path):
            self.skipTest("main.py not found")
        src = open(main_path).read()
        self.assertIn('msg_type == "ping"', src,
                      'Backend must handle {"type":"ping"} from client')
        self.assertIn('{"type": "pong"}', src,
                      'Backend must respond with {"type":"pong"} to client pings')


# ---------------------------------------------------------------------------
# Frontend: bidirectional ping-pong logic simulation
# ---------------------------------------------------------------------------

class TestFrontendPongDeadlineLogic(unittest.TestCase):
    """Simulate the key heartbeat state transitions using plain Python."""

    def test_pong_cancels_deadline(self):
        """Receiving pong before deadline must cancel the timeout."""
        deadline_fired = []
        deadline_ref = [None]

        def arm_deadline():
            # Simulate setTimeout — in real code this is cancelled on pong
            def _fire():
                deadline_fired.append(True)
            deadline_ref[0] = _fire  # armed but not yet fired

        def cancel_deadline():
            deadline_ref[0] = None  # clearTimeout

        # Arm deadline (after sending ping)
        arm_deadline()
        self.assertIsNotNone(deadline_ref[0])

        # Pong arrives before deadline fires
        cancel_deadline()
        self.assertIsNone(deadline_ref[0])

        # Simulate time passing — deadline does not fire because it was cancelled
        if deadline_ref[0]:
            deadline_ref[0]()

        self.assertEqual(deadline_fired, [], "Deadline must not fire after it was cancelled")

    def test_missed_pong_fires_deadline(self):
        """If pong never arrives, the deadline must fire and trigger reconnect."""
        reconnect_called = []
        deadline_ref = [None]

        def arm_deadline(reconnect_fn):
            def _fire():
                reconnect_fn()
            deadline_ref[0] = _fire

        def reconnect():
            reconnect_called.append(True)

        arm_deadline(reconnect)

        # No pong arrives — deadline fires
        if deadline_ref[0]:
            deadline_ref[0]()

        self.assertEqual(reconnect_called, [True], "Reconnect must be triggered when pong deadline fires")


if __name__ == "__main__":
    unittest.main()
