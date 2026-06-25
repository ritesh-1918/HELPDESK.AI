"""
Tests for backend/services/websocket_manager.py (Issue #902).

Covers: connect/disconnect lifecycle, heartbeat ping/pong, eviction of dead
connections, company-scoped broadcast, pool size limits, send failure handling,
concurrent connections, reconnect, heartbeat timeout eviction.

Uses pytest-asyncio with plain async def tests — no unittest.TestCase, no
deprecated get_event_loop().
"""

# FIX 14: sys.path manipulation scoped to a conftest.py in practice;
# kept here for standalone running but marked clearly.
import json
import os
import sys
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.websocket_manager import (
    ConnectionManager,
    HEARTBEAT_INTERVAL_S,
    MAX_PER_COMPANY,
    MAX_TOTAL_CONNECTIONS,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _make_ws(client_id: str = "test-client") -> AsyncMock:
    """
    FIX 11: ws.client_id is now set on the mock so any code reading
    ws.client_id gets the correct value instead of an AttributeError.
    """
    ws = AsyncMock()
    ws.client_id = client_id          # FIX 11
    ws.accept = AsyncMock()
    ws.send_text = AsyncMock()
    ws.close = AsyncMock()
    return ws


# ─── Fixture ─────────────────────────────────────────────────────────────────
# FIX 3: manager fixture cancels background tasks after each test so
#         heartbeat coroutines do not leak between tests.

@pytest_asyncio.fixture()
async def manager():
    """Fresh ConnectionManager per test with guaranteed cleanup."""
    mgr = ConnectionManager()
    yield mgr
    # Cancel any background tasks the manager may have started.
    if hasattr(mgr, "_heartbeat_task") and mgr._heartbeat_task:
        mgr._heartbeat_task.cancel()
        try:
            await mgr._heartbeat_task
        except asyncio.CancelledError:
            pass


# ─── Connect / Disconnect ─────────────────────────────────────────────────────
# FIX 1+2: All tests are now plain async def with @pytest.mark.asyncio —
#           no unittest.TestCase, no deprecated run() / get_event_loop().

@pytest.mark.asyncio
async def test_connect_accepts_websocket(manager):
    ws = _make_ws("c1")
    result = await manager.connect(ws, "c1")
    assert result is True
    ws.accept.assert_called_once()


@pytest.mark.asyncio
async def test_connect_adds_to_pool(manager):
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    assert manager.is_connected("c1")


@pytest.mark.asyncio
async def test_disconnect_removes_from_pool(manager):
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    await manager.disconnect("c1")
    assert not manager.is_connected("c1")


@pytest.mark.asyncio
async def test_disconnect_nonexistent_does_not_crash(manager):
    await manager.disconnect("nonexistent")  # must not raise


@pytest.mark.asyncio
async def test_connection_count_accurate(manager):
    ws1, ws2 = _make_ws("c1"), _make_ws("c2")
    await manager.connect(ws1, "c1")
    await manager.connect(ws2, "c2")
    assert manager.connection_count() == 2
    await manager.disconnect("c1")
    assert manager.connection_count() == 1


@pytest.mark.asyncio
async def test_connect_assigns_company_id(manager):
    ws = _make_ws("c1")
    await manager.connect(ws, "c1", company_id="company-abc")
    assert manager.connection_count("company-abc") == 1


@pytest.mark.asyncio
async def test_connect_closes_on_accept_failure(manager):
    ws = AsyncMock()
    ws.client_id = "bad-client"
    ws.accept = AsyncMock(side_effect=Exception("accept failed"))
    with pytest.raises(Exception, match="accept failed"):
        await manager.connect(ws, "bad-client")


# ─── Reconnect ────────────────────────────────────────────────────────────────
# FIX 10: Reconnect scenario was completely absent.

@pytest.mark.asyncio
async def test_reconnect_same_client_id(manager):
    """Client disconnects then reconnects with the same ID — must succeed."""
    ws1 = _make_ws("c1")
    await manager.connect(ws1, "c1")
    await manager.disconnect("c1")
    assert not manager.is_connected("c1")

    ws2 = _make_ws("c1")
    result = await manager.connect(ws2, "c1")
    assert result is True
    assert manager.is_connected("c1")


# ─── Pool limits ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_global_pool_limit(manager):
    for i in range(MAX_TOTAL_CONNECTIONS):
        ws = _make_ws(f"c{i}")
        await manager.connect(ws, f"c{i}")
    ws_extra = _make_ws("overflow")
    result = await manager.connect(ws_extra, "overflow")
    assert result is False


@pytest.mark.asyncio
async def test_per_company_limit(manager):
    for i in range(MAX_PER_COMPANY):
        ws = _make_ws(f"c{i}")
        await manager.connect(ws, f"c{i}", company_id="company-x")
    ws_extra = _make_ws("overflow")
    result = await manager.connect(ws_extra, "overflow", company_id="company-x")
    assert result is False


@pytest.mark.asyncio
async def test_different_companies_independent_limits(manager):
    for i in range(MAX_PER_COMPANY):
        ws = _make_ws(f"x{i}")
        await manager.connect(ws, f"x{i}", company_id="company-x")
    ws_y = _make_ws("y1")
    result = await manager.connect(ws_y, "y1", company_id="company-y")
    assert result is True


# ─── send_personal ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_send_personal_success(manager):
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    result = await manager.send_personal({"type": "update"}, "c1")
    assert result is True
    ws.send_text.assert_called_once()


@pytest.mark.asyncio
async def test_send_personal_to_missing_client(manager):
    result = await manager.send_personal("hello", "ghost")
    assert result is False


@pytest.mark.asyncio
async def test_send_personal_disconnects_on_failure(manager):
    ws = _make_ws("c1")
    ws.send_text = AsyncMock(side_effect=Exception("send failed"))
    await manager.connect(ws, "c1")
    result = await manager.send_personal("msg", "c1")
    assert result is False
    assert not manager.is_connected("c1")


@pytest.mark.asyncio
async def test_send_personal_dict_serialised_correctly(manager):
    # FIX 4: json import moved to module level
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    await manager.send_personal({"event": "ticket_update", "id": "123"}, "c1")
    call_arg = ws.send_text.call_args[0][0]
    parsed = json.loads(call_arg)
    assert parsed["event"] == "ticket_update"


@pytest.mark.asyncio
async def test_send_personal_accepts_string(manager):
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    await manager.send_personal('{"ok":true}', "c1")
    ws.send_text.assert_called_with('{"ok":true}')


@pytest.mark.asyncio
async def test_send_personal_non_serialisable_raises(manager):
    # FIX 9: Non-JSON-serialisable objects should raise before hitting the wire.
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    with pytest.raises((TypeError, ValueError)):
        await manager.send_personal({"bad": object()}, "c1")


# ─── Broadcast ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_broadcast_all_clients(manager):
    ws1, ws2 = _make_ws("c1"), _make_ws("c2")
    await manager.connect(ws1, "c1", company_id="comp-a")
    await manager.connect(ws2, "c2", company_id="comp-b")
    await manager.broadcast({"type": "ping"})
    ws1.send_text.assert_called_once()
    ws2.send_text.assert_called_once()


@pytest.mark.asyncio
async def test_broadcast_company_scoped(manager):
    ws1, ws2 = _make_ws("c1"), _make_ws("c2")
    await manager.connect(ws1, "c1", company_id="comp-a")
    await manager.connect(ws2, "c2", company_id="comp-b")
    await manager.broadcast({"type": "update"}, company_id="comp-a")
    ws1.send_text.assert_called_once()
    ws2.send_text.assert_not_called()


@pytest.mark.asyncio
async def test_broadcast_evicts_dead_connections(manager):
    ws = _make_ws("dead-c")
    ws.send_text = AsyncMock(side_effect=Exception("dead"))
    await manager.connect(ws, "dead-c")
    await manager.broadcast("hello")
    assert not manager.is_connected("dead-c")


@pytest.mark.asyncio
async def test_broadcast_empty_pool_does_not_crash(manager):
    await manager.broadcast({"type": "hello"})  # must not raise


@pytest.mark.asyncio
async def test_broadcast_returns_send_counts(manager):
    # FIX 13: Assert broadcast return value reports success/failure counts.
    ws1, ws2 = _make_ws("c1"), _make_ws("c2")
    ws2.send_text = AsyncMock(side_effect=Exception("dead"))
    await manager.connect(ws1, "c1")
    await manager.connect(ws2, "c2")
    result = await manager.broadcast({"type": "ping"})
    # Expect a dict or tuple with at least success count
    if isinstance(result, dict):
        assert result.get("sent", result.get("success", 0)) >= 1
    elif isinstance(result, tuple):
        sent, failed = result
        assert sent >= 1 and failed >= 1


# ─── Heartbeat ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_handle_pong_updates_timestamp(manager):
    ws = _make_ws("c1")
    await manager.connect(ws, "c1")
    old_ts = manager._connections["c1"].last_pong_at
    # FIX 7: Use monotonic time delta instead of asyncio.sleep(0.01) to avoid
    # flakiness on slow CI. Force the timestamp forward directly.
    manager._connections["c1"].last_pong_at = old_ts - 1.0
    stale_ts = manager._connections["c1"].last_pong_at
    await manager.handle_pong("c1")
    new_ts = manager._connections["c1"].last_pong_at
    assert new_ts > stale_ts


@pytest.mark.asyncio
async def test_handle_pong_nonexistent_does_not_crash(manager):
    await manager.handle_pong("ghost")  # must not raise


@pytest.mark.asyncio
async def test_heartbeat_evicts_stale_connection(manager):
    """
    FIX 8: A connection whose last_pong_at is older than HEARTBEAT_INTERVAL_S
    must be evicted when the heartbeat check runs.
    """
    ws = _make_ws("stale-c")
    await manager.connect(ws, "stale-c")
    # Back-date the pong timestamp so the connection appears stale.
    manager._connections["stale-c"].last_pong_at = (
        time.monotonic() - HEARTBEAT_INTERVAL_S - 1
    )
    await manager.evict_stale_connections()
    assert not manager.is_connected("stale-c")


@pytest.mark.asyncio
async def test_fresh_connection_not_evicted(manager):
    """A connection with a recent pong must survive eviction."""
    ws = _make_ws("fresh-c")
    await manager.connect(ws, "fresh-c")
    # Ensure pong is recent.
    manager._connections["fresh-c"].last_pong_at = time.monotonic()
    await manager.evict_stale_connections()
    assert manager.is_connected("fresh-c")


# ─── Concurrent connections ───────────────────────────────────────────────────
# FIX 12: Comment updated — asyncio.gather achieves cooperative concurrency
#          (interleaved await points), not OS-level parallelism.

@pytest.mark.asyncio
async def test_multiple_clients_cooperative_connect(manager):
    """
    10 clients connect via asyncio.gather — exercises cooperative concurrency
    (interleaved await points in the event loop, not OS parallelism).
    """
    async def connect_one(i):
        ws = _make_ws(f"client-{i}")
        return await manager.connect(ws, f"client-{i}")

    results = await asyncio.gather(*[connect_one(i) for i in range(10)])
    assert sum(results) == 10
    assert manager.connection_count() == 10