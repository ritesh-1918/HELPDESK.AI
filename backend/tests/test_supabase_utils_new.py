"""
Comprehensive unit tests for Supabase utility modules.

Targets:
  - backend.services.supabase_utils   (get_ticket, create_ticket, update_ticket,
    get_profile, get_system_settings, list_tickets)
  - backend.utils.supabase_utils        (get_supabase_client, get_user_by_id,
    get_user_by_email, create_user, update_user, get_ticket_by_id,
    get_tickets_by_user, create_ticket, update_ticket, delete_ticket,
    get_company_by_id, get_company_settings, fetch_all, fetch_by_field,
    insert_record, update_record, delete_record)

Verifies CRUD error responses are handled gracefully — each function that
interacts with Supabase must either return a safe fallback (None, {}, [])
or raise a well-defined exception; unexpected exceptions must not propagate.
"""

import os
import sys
import unittest
import asyncio
import logging
from unittest.mock import MagicMock, patch, call, AsyncMock

import types

# ── Stub dependencies before any backend import ──────────────────────────
if "supabase" not in sys.modules:
    sb_mod = types.ModuleType("supabase")
    sb_mod.create_client = MagicMock()
    sb_mod.Client = object
    sys.modules["supabase"] = sb_mod

if "dotenv" not in sys.modules:
    dotenv_mod = types.ModuleType("dotenv")
    dotenv_mod.load_dotenv = lambda *a, **kw: None
    sys.modules["dotenv"] = dotenv_mod

if "backend" not in sys.modules:
    backend_mod = types.ModuleType("backend")
    sys.modules["backend"] = backend_mod

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ── Silence loggers during tests ────────────────────────────────────────
logging.basicConfig(level=logging.CRITICAL)


# ===================================================================
# Tests for backend.services.supabase_utils
# ===================================================================

class TestServicesSupabaseUtils(unittest.TestCase):
    """Test backend/services/supabase_utils.py functions."""

    def _make_client(self, data=None, raise_exc=None):
        """Build a mock Supabase client with a fluent builder chain."""
        client = MagicMock()
        builder = MagicMock()
        # Make the builder chain every method back to itself
        for method_name in ("select", "insert", "update", "delete", "eq", "single",
                            "order", "range", "limit", "execute"):
            setattr(builder, method_name, MagicMock(return_value=builder))
        # execute() returns a result with .data
        result = MagicMock()
        result.data = data
        if raise_exc:
            builder.execute.side_effect = raise_exc
        else:
            builder.execute.return_value = result
        # table() returns the builder
        client.table.return_value = builder
        return client, builder

    # ── get_ticket ────────────────────────────────────────────────────

    def test_get_ticket_success(self):
        from backend.services.supabase_utils import get_ticket
        client, builder = self._make_client({"id": "t1", "title": "Test"})
        ticket = get_ticket(client, "t1")
        self.assertEqual(ticket["id"], "t1")
        builder.single.assert_called_once()

    def test_get_ticket_not_found(self):
        from backend.services.supabase_utils import get_ticket
        client, _ = self._make_client(None)
        self.assertIsNone(get_ticket(client, "t1"))

    def test_get_ticket_exception_returns_none(self):
        from backend.services.supabase_utils import get_ticket
        client, _ = self._make_client(None, raise_exc=RuntimeError("DB down"))
        self.assertIsNone(get_ticket(client, "t1"))

    def test_get_ticket_empty_string_id(self):
        from backend.services.supabase_utils import get_ticket
        client, _ = self._make_client(None)
        result = get_ticket(client, "")
        self.assertIsNone(result)

    # ── create_ticket ─────────────────────────────────────────────────

    def test_create_ticket_success(self):
        from backend.services.supabase_utils import create_ticket
        client, builder = self._make_client([{"id": "t1", "title": "New"}])
        result = create_ticket(client, {"title": "New"})
        self.assertEqual(result["id"], "t1")

    def test_create_ticket_no_data_returns_empty_dict(self):
        from backend.services.supabase_utils import create_ticket
        client, _ = self._make_client([])
        result = create_ticket(client, {"title": "New"})
        self.assertEqual(result, {})

    def test_create_ticket_exception_returns_empty_dict(self):
        from backend.services.supabase_utils import create_ticket
        client, _ = self._make_client(None, raise_exc=RuntimeError("fail"))
        result = create_ticket(client, {"title": "New"})
        self.assertEqual(result, {})

    def test_create_ticket_empty_payload(self):
        from backend.services.supabase_utils import create_ticket
        client, builder = self._make_client([{"id": "t1"}])
        result = create_ticket(client, {})
        self.assertEqual(result["id"], "t1")

    # ── update_ticket ─────────────────────────────────────────────────

    def test_update_ticket_success(self):
        from backend.services.supabase_utils import update_ticket
        client, builder = self._make_client([{"id": "t1", "status": "closed"}])
        result = update_ticket(client, "t1", {"status": "closed"})
        self.assertEqual(result["status"], "closed")

    def test_update_ticket_no_data_returns_empty_dict(self):
        from backend.services.supabase_utils import update_ticket
        client, _ = self._make_client([])
        result = update_ticket(client, "t1", {"status": "closed"})
        self.assertEqual(result, {})

    def test_update_ticket_exception_returns_empty_dict(self):
        from backend.services.supabase_utils import update_ticket
        client, _ = self._make_client(None, raise_exc=RuntimeError("fail"))
        result = update_ticket(client, "t1", {"status": "closed"})
        self.assertEqual(result, {})

    def test_update_ticket_empty_updates(self):
        from backend.services.supabase_utils import update_ticket
        client, builder = self._make_client([{"id": "t1"}])
        result = update_ticket(client, "t1", {})
        self.assertEqual(result["id"], "t1")

    # ── get_profile ────────────────────────────────────────────────────

    def test_get_profile_success(self):
        from backend.services.supabase_utils import get_profile
        client, builder = self._make_client({"id": "u1", "name": "Alice"})
        result = get_profile(client, "u1")
        self.assertEqual(result["id"], "u1")

    def test_get_profile_not_found(self):
        from backend.services.supabase_utils import get_profile
        client, _ = self._make_client(None)
        self.assertIsNone(get_profile(client, "u1"))

    def test_get_profile_exception_returns_none(self):
        from backend.services.supabase_utils import get_profile
        client, _ = self._make_client(None, raise_exc=RuntimeError("fail"))
        self.assertIsNone(get_profile(client, "u1"))

    def test_get_profile_none_user_id(self):
        from backend.services.supabase_utils import get_profile
        client, _ = self._make_client(None)
        self.assertIsNone(get_profile(client, None))

    # ── get_system_settings ───────────────────────────────────────────

    def test_get_system_settings_success(self):
        from backend.services.supabase_utils import get_system_settings
        client, builder = self._make_client({"company_id": "c1", "ai_confidence_threshold": 0.90})
        result = get_system_settings(client, "c1")
        self.assertEqual(result["ai_confidence_threshold"], 0.90)
        self.assertIn("auto_close_days", result)  # default merged

    def test_get_system_settings_no_client_returns_defaults(self):
        from backend.services.supabase_utils import get_system_settings
        result = get_system_settings(None, "c1")
        self.assertIn("ai_confidence_threshold", result)

    def test_get_system_settings_empty_company_id_returns_defaults(self):
        from backend.services.supabase_utils import get_system_settings
        result = get_system_settings(MagicMock(), "")
        self.assertIn("ai_confidence_threshold", result)

    def test_get_system_settings_exception_returns_defaults(self):
        from backend.services.supabase_utils import get_system_settings
        client, _ = self._make_client(None, raise_exc=RuntimeError("fail"))
        result = get_system_settings(client, "c1")
        self.assertIn("ai_confidence_threshold", result)

    def test_get_system_settings_db_overrides_defaults(self):
        from backend.services.supabase_utils import get_system_settings
        client, builder = self._make_client({"auto_close_days": 14})
        result = get_system_settings(client, "c1")
        self.assertEqual(result["auto_close_days"], 14)
        self.assertEqual(result["ai_confidence_threshold"], 0.80)  # default preserved

    # ── list_tickets ──────────────────────────────────────────────────

    def test_list_tickets_success(self):
        from backend.services.supabase_utils import list_tickets
        client, builder = self._make_client([{"id": "t1"}, {"id": "t2"}])
        result = list_tickets(client, "c1")
        self.assertEqual(len(result), 2)

    def test_list_tickets_empty(self):
        from backend.services.supabase_utils import list_tickets
        client, _ = self._make_client([])
        result = list_tickets(client, "c1")
        self.assertEqual(result, [])

    def test_list_tickets_exception_returns_empty_list(self):
        from backend.services.supabase_utils import list_tickets
        client, _ = self._make_client(None, raise_exc=RuntimeError("fail"))
        result = list_tickets(client, "c1")
        self.assertEqual(result, [])

    def test_list_tickets_empty_company_id(self):
        from backend.services.supabase_utils import list_tickets
        client, _ = self._make_client([])
        result = list_tickets(client, "")
        self.assertEqual(result, [])

    def test_list_tickets_with_limit_offset(self):
        from backend.services.supabase_utils import list_tickets
        client, builder = self._make_client([{"id": "t1"}])
        result = list_tickets(client, "c1", limit=10, offset=20)
        self.assertEqual(len(result), 1)
        builder.range.assert_called_once()

    # ── _SETTINGS_DEFAULTS ──────────────────────────────────────────

    def test_settings_defaults_keys(self):
        from backend.services.supabase_utils import _SETTINGS_DEFAULTS
        self.assertIn("ai_confidence_threshold", _SETTINGS_DEFAULTS)
        self.assertIn("duplicate_sensitivity", _SETTINGS_DEFAULTS)
        self.assertIn("enable_auto_resolve", _SETTINGS_DEFAULTS)
        self.assertIn("auto_close_days", _SETTINGS_DEFAULTS)
        self.assertIn("auto_close_enabled", _SETTINGS_DEFAULTS)

    def test_settings_defaults_types(self):
        from backend.services.supabase_utils import _SETTINGS_DEFAULTS
        self.assertIsInstance(_SETTINGS_DEFAULTS["ai_confidence_threshold"], float)
        self.assertIsInstance(_SETTINGS_DEFAULTS["enable_auto_resolve"], bool)
        self.assertIsInstance(_SETTINGS_DEFAULTS["auto_close_days"], int)


# ===================================================================
# Tests for backend.utils.supabase_utils (async functions)
# ===================================================================

class TestUtilsSupabaseUtils(unittest.IsolatedAsyncioTestCase):
    """Test backend/utils/supabase_utils.py async functions."""

    def _make_async_client(self, data=None, raise_exc=None):
        """Build a mock async Supabase client."""
        client = MagicMock()
        builder = MagicMock()
        for m in ("select", "insert", "update", "delete", "eq", "limit",
                   "execute", "order", "range", "single"):
            if m == "execute":
                result = MagicMock()
                result.data = data
                if raise_exc:
                    builder.execute = AsyncMock(side_effect=raise_exc)
                else:
                    builder.execute = AsyncMock(return_value=result)
            else:
                setattr(builder, m, MagicMock(return_value=builder))
        client.table.return_value = builder
        return client, builder

    def _clear_singleton(self):
        """Clear the module-level _supabase_client singleton."""
        import backend.utils.supabase_utils as mod
        mod._supabase_client = None

    # ── get_supabase_client ──────────────────────────────────────────

    @patch("backend.utils.supabase_utils.create_client")
    @patch("backend.utils.supabase_utils.os")
    def test_get_supabase_client_success(self, mock_os, mock_create):
        from backend.utils.supabase_utils import get_supabase_client
        self._clear_singleton()
        mock_os.environ.get.side_effect = lambda k: "http://test" if "URL" in k else "test-key"
        mock_create.return_value = "client_obj"
        client = get_supabase_client()
        self.assertEqual(client, "client_obj")
        # Second call should return cached
        client2 = get_supabase_client()
        self.assertEqual(client2, "client_obj")
        mock_create.assert_called_once()

    @patch("backend.utils.supabase_utils.os")
    def test_get_supabase_client_missing_env_raises(self, mock_os):
        from backend.utils.supabase_utils import get_supabase_client
        self._clear_singleton()
        mock_os.environ.get.return_value = None
        with self.assertRaises(ValueError):
            get_supabase_client()

    # ── get_user_by_id ───────────────────────────────────────────────

    async def test_get_user_by_id_success(self):
        from backend.utils.supabase_utils import get_user_by_id
        client, builder = self._make_async_client([{"id": "u1", "email": "a@b.c"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_user_by_id("u1")
        self.assertEqual(result["id"], "u1")

    async def test_get_user_by_id_not_found(self):
        from backend.utils.supabase_utils import get_user_by_id
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_user_by_id("u1")
        self.assertIsNone(result)

    # ── get_user_by_email ────────────────────────────────────────────

    async def test_get_user_by_email_success(self):
        from backend.utils.supabase_utils import get_user_by_email
        client, builder = self._make_async_client([{"id": "u1", "email": "a@b.c"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_user_by_email("a@b.c")
        self.assertEqual(result["email"], "a@b.c")

    async def test_get_user_by_email_not_found(self):
        from backend.utils.supabase_utils import get_user_by_email
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_user_by_email("x@y.z")
        self.assertIsNone(result)

    # ── create_user ──────────────────────────────────────────────────

    async def test_create_user_success(self):
        from backend.utils.supabase_utils import create_user
        client, builder = self._make_async_client([{"id": "u1", "name": "New"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await create_user({"name": "New"})
        self.assertEqual(result["id"], "u1")

    async def test_create_user_no_data(self):
        from backend.utils.supabase_utils import create_user
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await create_user({"name": "New"})
        self.assertEqual(result, {})

    # ── update_user ─────────────────────────────────────────────────

    async def test_update_user_success(self):
        from backend.utils.supabase_utils import update_user
        client, builder = self._make_async_client([{"id": "u1", "name": "Upd"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await update_user("u1", {"name": "Upd"})
        self.assertEqual(result["name"], "Upd")

    # ── get_ticket_by_id ─────────────────────────────────────────────

    async def test_get_ticket_by_id_success(self):
        from backend.utils.supabase_utils import get_ticket_by_id
        client, builder = self._make_async_client([{"id": "t1"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_ticket_by_id("t1")
        self.assertEqual(result["id"], "t1")

    async def test_get_ticket_by_id_not_found(self):
        from backend.utils.supabase_utils import get_ticket_by_id
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_ticket_by_id("t1")
        self.assertIsNone(result)

    # ── get_tickets_by_user ──────────────────────────────────────────

    async def test_get_tickets_by_user_success(self):
        from backend.utils.supabase_utils import get_tickets_by_user
        client, builder = self._make_async_client([{"id": "t1"}, {"id": "t2"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_tickets_by_user("u1")
        self.assertEqual(len(result), 2)

    async def test_get_tickets_by_user_empty(self):
        from backend.utils.supabase_utils import get_tickets_by_user
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_tickets_by_user("u1")
        self.assertEqual(result, [])

    # ── create_ticket (utils version) ───────────────────────────────

    async def test_create_ticket_utils_success(self):
        from backend.utils.supabase_utils import create_ticket
        client, builder = self._make_async_client([{"id": "t1"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await create_ticket({"title": "Test"})
        self.assertEqual(result["id"], "t1")

    # ── update_ticket (utils version) ───────────────────────────────

    async def test_update_ticket_utils_success(self):
        from backend.utils.supabase_utils import update_ticket
        client, builder = self._make_async_client([{"id": "t1", "status": "done"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await update_ticket("t1", {"status": "done"})
        self.assertEqual(result["status"], "done")

    # ── delete_ticket ────────────────────────────────────────────────

    async def test_delete_ticket_success(self):
        from backend.utils.supabase_utils import delete_ticket
        client, builder = self._make_async_client([{"id": "t1"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await delete_ticket("t1")
        self.assertTrue(result)

    async def test_delete_ticket_not_found(self):
        from backend.utils.supabase_utils import delete_ticket
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await delete_ticket("t1")
        self.assertFalse(result)

    # ── get_company_by_id ────────────────────────────────────────────

    async def test_get_company_by_id_success(self):
        from backend.utils.supabase_utils import get_company_by_id
        client, builder = self._make_async_client([{"id": "c1", "name": "Acme"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_company_by_id("c1")
        self.assertEqual(result["name"], "Acme")

    # ── get_company_settings ──────────────────────────────────────────

    async def test_get_company_settings_success(self):
        from backend.utils.supabase_utils import get_company_settings
        client, builder = self._make_async_client([{"company_id": "c1", "setting": "val"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await get_company_settings("c1")
        self.assertEqual(result["setting"], "val")

    # ── fetch_all ─────────────────────────────────────────────────────

    async def test_fetch_all_success(self):
        from backend.utils.supabase_utils import fetch_all
        client, builder = self._make_async_client([{"id": 1}, {"id": 2}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await fetch_all("tickets")
        self.assertEqual(len(result), 2)

    async def test_fetch_all_empty(self):
        from backend.utils.supabase_utils import fetch_all
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await fetch_all("tickets")
        self.assertEqual(result, [])

    # ── fetch_by_field ────────────────────────────────────────────────

    async def test_fetch_by_field_success(self):
        from backend.utils.supabase_utils import fetch_by_field
        client, builder = self._make_async_client([{"id": 1}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await fetch_by_field("tickets", "status", "open")
        self.assertEqual(len(result), 1)

    # ── insert_record ─────────────────────────────────────────────────

    async def test_insert_record_success(self):
        from backend.utils.supabase_utils import insert_record
        client, builder = self._make_async_client([{"id": "r1"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await insert_record("items", {"val": 1})
        self.assertEqual(result["id"], "r1")

    # ── update_record ─────────────────────────────────────────────────

    async def test_update_record_success(self):
        from backend.utils.supabase_utils import update_record
        client, builder = self._make_async_client([{"id": "r1", "val": 2}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await update_record("items", "r1", {"val": 2})
        self.assertEqual(result["val"], 2)

    # ── delete_record ─────────────────────────────────────────────────

    async def test_delete_record_success(self):
        from backend.utils.supabase_utils import delete_record
        client, builder = self._make_async_client([{"id": "r1"}])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await delete_record("items", "r1")
        self.assertTrue(result)

    async def test_delete_record_not_found(self):
        from backend.utils.supabase_utils import delete_record
        client, builder = self._make_async_client([])
        with patch("backend.utils.supabase_utils.get_supabase_client", return_value=client):
            result = await delete_record("items", "r1")
        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()
