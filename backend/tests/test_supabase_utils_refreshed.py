"""
Comprehensive unit tests for backend/services/supabase_utils.py — Issue #1137.

Covers areas complementary to the existing test_supabase_utils.py suite:
- get_ticket: None client, empty-string ID, data=None response, multi-field data
- create_ticket: empty payload, list response wrapping, partial field sets
- update_ticket: empty updates dict, ID mismatch (no rows updated), partial update
- get_profile: extra fields beyond id, None user_id
- get_system_settings: None client, empty company_id, partial override merges defaults,
  deep override of every default key, None company_id
- list_tickets: zero limit, large offset, empty company, exception path
- _SETTINGS_DEFAULTS: key presence, value types, default values
- Logger integration: warning emitted on exception paths
- Fluent chaining: correct table/method call sequences verified
"""

import os
import sys
import unittest
import logging
from unittest.mock import MagicMock, patch, call

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.supabase_utils import (
    get_ticket,
    create_ticket,
    update_ticket,
    get_profile,
    get_system_settings,
    list_tickets,
    _SETTINGS_DEFAULTS,
)


# ─── Mock builder helpers ────────────────────────────────────────────────────

class _ChainBuilder:
    """Fluent Supabase mock that records method calls and returns configured data."""

    def __init__(self, data=None, raise_exc=None):
        self._data = data
        self._raise_exc = raise_exc
        self._calls = []

    # Fluent chain methods
    def table(self, name):       self._calls.append(("table", name));         return self
    def select(self, *a):        self._calls.append(("select", a));           return self
    def insert(self, data):      self._calls.append(("insert", data));        return self
    def update(self, data):      self._calls.append(("update", data));        return self
    def eq(self, k, v):          self._calls.append(("eq", k, v));            return self
    def single(self):            self._calls.append(("single",));             return self
    def order(self, f, desc=False): self._calls.append(("order", f, desc));  return self
    def range(self, lo, hi):     self._calls.append(("range", lo, hi));      return self
    def limit(self, n):          self._calls.append(("limit", n));            return self

    def execute(self):
        self._calls.append(("execute",))
        if self._raise_exc:
            raise self._raise_exc
        result = MagicMock()
        result.data = self._data
        return result


def _client(data=None, raise_exc=None):
    """Return a fresh chain builder acting as a Supabase client."""
    return _ChainBuilder(data=data, raise_exc=raise_exc)


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — _SETTINGS_DEFAULTS: constant validation
# ═══════════════════════════════════════════════════════════════════════════════

class TestSettingsDefaults(unittest.TestCase):

    def test_is_a_dict(self):
        self.assertIsInstance(_SETTINGS_DEFAULTS, dict)

    def test_has_ai_confidence_threshold(self):
        self.assertIn("ai_confidence_threshold", _SETTINGS_DEFAULTS)

    def test_ai_confidence_threshold_is_float(self):
        self.assertIsInstance(_SETTINGS_DEFAULTS["ai_confidence_threshold"], float)

    def test_ai_confidence_threshold_is_between_0_and_1(self):
        v = _SETTINGS_DEFAULTS["ai_confidence_threshold"]
        self.assertGreater(v, 0.0)
        self.assertLessEqual(v, 1.0)

    def test_has_duplicate_sensitivity(self):
        self.assertIn("duplicate_sensitivity", _SETTINGS_DEFAULTS)

    def test_duplicate_sensitivity_is_float(self):
        self.assertIsInstance(_SETTINGS_DEFAULTS["duplicate_sensitivity"], float)

    def test_has_enable_auto_resolve(self):
        self.assertIn("enable_auto_resolve", _SETTINGS_DEFAULTS)

    def test_enable_auto_resolve_is_bool(self):
        self.assertIsInstance(_SETTINGS_DEFAULTS["enable_auto_resolve"], bool)

    def test_has_auto_close_days(self):
        self.assertIn("auto_close_days", _SETTINGS_DEFAULTS)

    def test_auto_close_days_is_positive_int(self):
        v = _SETTINGS_DEFAULTS["auto_close_days"]
        self.assertIsInstance(v, int)
        self.assertGreater(v, 0)

    def test_has_auto_close_enabled(self):
        self.assertIn("auto_close_enabled", _SETTINGS_DEFAULTS)

    def test_auto_close_enabled_is_bool(self):
        self.assertIsInstance(_SETTINGS_DEFAULTS["auto_close_enabled"], bool)

    def test_defaults_are_not_mutated_across_calls(self):
        s1 = get_system_settings(None, None)
        s1["ai_confidence_threshold"] = 9999.0
        s2 = get_system_settings(None, None)
        self.assertNotEqual(s2["ai_confidence_threshold"], 9999.0)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — get_ticket
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetTicket(unittest.TestCase):

    def test_returns_ticket_dict_on_success(self):
        ticket = {"id": "abc-123", "status": "Open", "title": "VPN down"}
        result = get_ticket(_client(data=ticket), "abc-123")
        self.assertEqual(result, ticket)

    def test_returns_none_when_no_data(self):
        result = get_ticket(_client(data=None), "abc-123")
        self.assertIsNone(result)

    def test_returns_none_on_exception(self):
        result = get_ticket(_client(raise_exc=RuntimeError("db error")), "abc-123")
        self.assertIsNone(result)

    def test_returns_none_on_connection_error(self):
        result = get_ticket(_client(raise_exc=ConnectionError("timeout")), "x")
        self.assertIsNone(result)

    def test_returns_none_when_data_is_empty_dict(self):
        result = get_ticket(_client(data={}), "x")
        self.assertIsNone(result)

    def test_ticket_with_multiple_fields_returned_intact(self):
        ticket = {
            "id": "t-999", "status": "Closed", "priority": "High",
            "category": "Network", "assigned_team": "Network Support",
        }
        result = get_ticket(_client(data=ticket), "t-999")
        self.assertEqual(result["priority"], "High")
        self.assertEqual(result["category"], "Network")

    def test_queries_tickets_table(self):
        c = _client(data={"id": "1"})
        get_ticket(c, "1")
        tables = [v for op, *v in c._calls if op == "table"]
        self.assertIn(["tickets"], tables)

    def test_filters_by_id(self):
        c = _client(data={"id": "uuid-42"})
        get_ticket(c, "uuid-42")
        eq_calls = [v for op, *v in c._calls if op == "eq"]
        self.assertIn(["id", "uuid-42"], eq_calls)

    def test_uses_single(self):
        c = _client(data={"id": "1"})
        get_ticket(c, "1")
        ops = [op for op, *_ in c._calls]
        self.assertIn("single", ops)

    def test_empty_string_id_still_calls_eq(self):
        c = _client(data=None)
        get_ticket(c, "")
        eq_calls = [v for op, *v in c._calls if op == "eq"]
        self.assertIn(["id", ""], eq_calls)


# ═══════════════════════════════════════════════════════════════════════════════
# 3 — create_ticket
# ═══════════════════════════════════════════════════════════════════════════════

class TestCreateTicket(unittest.TestCase):

    def test_returns_created_ticket_on_success(self):
        ticket = {"id": "new-1", "status": "Open"}
        result = create_ticket(_client(data=[ticket]), {"status": "Open"})
        self.assertEqual(result, ticket)

    def test_returns_empty_dict_on_exception(self):
        result = create_ticket(_client(raise_exc=RuntimeError("insert failed")), {})
        self.assertEqual(result, {})

    def test_returns_empty_dict_when_no_data_returned(self):
        result = create_ticket(_client(data=None), {"title": "Test"})
        self.assertEqual(result, {})

    def test_returns_empty_dict_when_data_is_empty_list(self):
        result = create_ticket(_client(data=[]), {"title": "Test"})
        self.assertEqual(result, {})

    def test_return_type_is_dict(self):
        result = create_ticket(_client(data=[{"id": "1"}]), {"id": "1"})
        self.assertIsInstance(result, dict)

    def test_insert_called_on_tickets_table(self):
        c = _client(data=[{"id": "1"}])
        create_ticket(c, {"title": "Issue"})
        tables = [v for op, *v in c._calls if op == "table"]
        self.assertIn(["tickets"], tables)

    def test_insert_called_with_payload(self):
        payload = {"title": "VPN Issue", "priority": "High"}
        c = _client(data=[{"id": "new"}])
        create_ticket(c, payload)
        insert_calls = [v for op, *v in c._calls if op == "insert"]
        self.assertTrue(any(payload in args for args in insert_calls))

    def test_partial_ticket_payload(self):
        result = create_ticket(_client(data=[{"id": "1", "status": "Open"}]),
                                {"status": "Open"})
        self.assertEqual(result["status"], "Open")

    def test_returns_first_element_of_list(self):
        data = [{"id": "first"}, {"id": "second"}]
        result = create_ticket(_client(data=data), {})
        self.assertEqual(result["id"], "first")


# ═══════════════════════════════════════════════════════════════════════════════
# 4 — update_ticket
# ═══════════════════════════════════════════════════════════════════════════════

class TestUpdateTicket(unittest.TestCase):

    def test_returns_updated_ticket_on_success(self):
        updated = {"id": "t-1", "status": "Closed"}
        result = update_ticket(_client(data=[updated]), "t-1", {"status": "Closed"})
        self.assertEqual(result, updated)

    def test_returns_empty_dict_on_exception(self):
        result = update_ticket(_client(raise_exc=RuntimeError("db error")), "t-1", {})
        self.assertEqual(result, {})

    def test_returns_empty_dict_when_no_data(self):
        result = update_ticket(_client(data=None), "t-1", {"status": "Closed"})
        self.assertEqual(result, {})

    def test_returns_empty_dict_when_data_is_empty_list(self):
        result = update_ticket(_client(data=[]), "t-1", {"status": "Closed"})
        self.assertEqual(result, {})

    def test_return_type_is_dict(self):
        result = update_ticket(_client(data=[{"id": "1"}]), "1", {})
        self.assertIsInstance(result, dict)

    def test_calls_update_on_tickets_table(self):
        c = _client(data=[{"id": "1"}])
        update_ticket(c, "1", {"status": "Resolved"})
        tables = [v for op, *v in c._calls if op == "table"]
        self.assertIn(["tickets"], tables)

    def test_filters_by_ticket_id(self):
        c = _client(data=[{"id": "t-42"}])
        update_ticket(c, "t-42", {"priority": "Low"})
        eq_calls = [v for op, *v in c._calls if op == "eq"]
        self.assertIn(["id", "t-42"], eq_calls)

    def test_returns_first_element_of_list(self):
        data = [{"id": "first", "status": "Closed"}, {"id": "second"}]
        result = update_ticket(_client(data=data), "first", {"status": "Closed"})
        self.assertEqual(result["id"], "first")

    def test_empty_updates_dict_still_calls_execute(self):
        c = _client(data=[{"id": "1"}])
        update_ticket(c, "1", {})
        ops = [op for op, *_ in c._calls]
        self.assertIn("execute", ops)

    def test_connection_error_returns_empty_dict(self):
        result = update_ticket(_client(raise_exc=ConnectionError("timeout")), "t-1", {})
        self.assertEqual(result, {})


# ═══════════════════════════════════════════════════════════════════════════════
# 5 — get_profile
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetProfile(unittest.TestCase):

    def test_returns_profile_dict_on_success(self):
        profile = {"id": "u-1", "name": "Alice", "role": "admin"}
        result = get_profile(_client(data=profile), "u-1")
        self.assertEqual(result, profile)

    def test_returns_none_when_no_data(self):
        result = get_profile(_client(data=None), "u-1")
        self.assertIsNone(result)

    def test_returns_none_on_exception(self):
        result = get_profile(_client(raise_exc=RuntimeError("no profile")), "u-1")
        self.assertIsNone(result)

    def test_returns_none_when_data_is_empty_dict(self):
        result = get_profile(_client(data={}), "u-1")
        self.assertIsNone(result)

    def test_queries_profiles_table(self):
        c = _client(data={"id": "u-1"})
        get_profile(c, "u-1")
        tables = [v for op, *v in c._calls if op == "table"]
        self.assertIn(["profiles"], tables)

    def test_filters_by_id(self):
        c = _client(data={"id": "u-99"})
        get_profile(c, "u-99")
        eq_calls = [v for op, *v in c._calls if op == "eq"]
        self.assertIn(["id", "u-99"], eq_calls)

    def test_uses_single(self):
        c = _client(data={"id": "u-1"})
        get_profile(c, "u-1")
        ops = [op for op, *_ in c._calls]
        self.assertIn("single", ops)

    def test_profile_with_extra_fields_returned_intact(self):
        profile = {"id": "u-2", "email": "a@b.com", "company_id": "c-1", "role": "user"}
        result = get_profile(_client(data=profile), "u-2")
        self.assertEqual(result["email"], "a@b.com")
        self.assertEqual(result["company_id"], "c-1")


# ═══════════════════════════════════════════════════════════════════════════════
# 6 — get_system_settings
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetSystemSettings(unittest.TestCase):

    def test_returns_defaults_when_client_is_none(self):
        result = get_system_settings(None, "c-1")
        for key in _SETTINGS_DEFAULTS:
            self.assertIn(key, result)

    def test_returns_defaults_when_company_id_is_none(self):
        result = get_system_settings(_client(data={"ai_confidence_threshold": 0.5}), None)
        self.assertEqual(result["ai_confidence_threshold"], _SETTINGS_DEFAULTS["ai_confidence_threshold"])

    def test_returns_defaults_when_company_id_is_empty_string(self):
        result = get_system_settings(_client(data={"ai_confidence_threshold": 0.5}), "")
        self.assertEqual(result["ai_confidence_threshold"], _SETTINGS_DEFAULTS["ai_confidence_threshold"])

    def test_returns_dict_on_success(self):
        result = get_system_settings(_client(data={"company_id": "c-1"}), "c-1")
        self.assertIsInstance(result, dict)

    def test_db_values_override_defaults(self):
        db_row = {"company_id": "c-1", "ai_confidence_threshold": 0.70}
        result = get_system_settings(_client(data=db_row), "c-1")
        self.assertEqual(result["ai_confidence_threshold"], 0.70)

    def test_missing_db_keys_fall_back_to_defaults(self):
        db_row = {"company_id": "c-1", "ai_confidence_threshold": 0.70}
        result = get_system_settings(_client(data=db_row), "c-1")
        self.assertEqual(result["auto_close_days"], _SETTINGS_DEFAULTS["auto_close_days"])

    def test_all_defaults_present_in_return(self):
        result = get_system_settings(_client(data=None), "c-1")
        for key in _SETTINGS_DEFAULTS:
            self.assertIn(key, result)

    def test_exception_falls_back_to_defaults(self):
        result = get_system_settings(_client(raise_exc=RuntimeError("db error")), "c-1")
        self.assertEqual(result, _SETTINGS_DEFAULTS)

    def test_full_db_row_overrides_all_defaults(self):
        db_row = {
            "company_id": "c-1",
            "ai_confidence_threshold": 0.50,
            "duplicate_sensitivity": 0.60,
            "enable_auto_resolve": True,
            "auto_close_days": 14,
            "auto_close_enabled": False,
        }
        result = get_system_settings(_client(data=db_row), "c-1")
        self.assertEqual(result["ai_confidence_threshold"], 0.50)
        self.assertEqual(result["auto_close_days"], 14)
        self.assertFalse(result["auto_close_enabled"])

    def test_queries_system_settings_table(self):
        c = _client(data={"company_id": "c-1"})
        get_system_settings(c, "c-1")
        tables = [v for op, *v in c._calls if op == "table"]
        self.assertIn(["system_settings"], tables)

    def test_filters_by_company_id(self):
        c = _client(data={"company_id": "c-99"})
        get_system_settings(c, "c-99")
        eq_calls = [v for op, *v in c._calls if op == "eq"]
        self.assertIn(["company_id", "c-99"], eq_calls)


# ═══════════════════════════════════════════════════════════════════════════════
# 7 — list_tickets
# ═══════════════════════════════════════════════════════════════════════════════

class TestListTickets(unittest.TestCase):

    def test_returns_list_on_success(self):
        tickets = [{"id": "1"}, {"id": "2"}]
        result = list_tickets(_client(data=tickets), "c-1")
        self.assertEqual(result, tickets)

    def test_returns_empty_list_on_exception(self):
        result = list_tickets(_client(raise_exc=RuntimeError("db error")), "c-1")
        self.assertEqual(result, [])

    def test_returns_empty_list_when_no_data(self):
        result = list_tickets(_client(data=None), "c-1")
        self.assertEqual(result, [])

    def test_returns_empty_list_when_data_empty(self):
        result = list_tickets(_client(data=[]), "c-1")
        self.assertEqual(result, [])

    def test_return_type_is_list(self):
        result = list_tickets(_client(data=[{"id": "1"}]), "c-1")
        self.assertIsInstance(result, list)

    def test_queries_tickets_table(self):
        c = _client(data=[])
        list_tickets(c, "c-1")
        tables = [v for op, *v in c._calls if op == "table"]
        self.assertIn(["tickets"], tables)

    def test_filters_by_company_id(self):
        c = _client(data=[])
        list_tickets(c, "c-abc")
        eq_calls = [v for op, *v in c._calls if op == "eq"]
        self.assertIn(["company_id", "c-abc"], eq_calls)

    def test_default_limit_and_offset(self):
        c = _client(data=[])
        list_tickets(c, "c-1")
        range_calls = [v for op, *v in c._calls if op == "range"]
        self.assertTrue(range_calls, "range() should be called for pagination")
        lo, hi = range_calls[0]
        self.assertEqual(lo, 0)
        self.assertEqual(hi, 49)

    def test_custom_offset(self):
        c = _client(data=[])
        list_tickets(c, "c-1", limit=10, offset=20)
        range_calls = [v for op, *v in c._calls if op == "range"]
        lo, hi = range_calls[0]
        self.assertEqual(lo, 20)
        self.assertEqual(hi, 29)

    def test_orders_by_created_at_desc(self):
        c = _client(data=[])
        list_tickets(c, "c-1")
        order_calls = [v for op, *v in c._calls if op == "order"]
        self.assertTrue(order_calls, "order() should be called")
        field, desc = order_calls[0]
        self.assertEqual(field, "created_at")
        self.assertTrue(desc)

    def test_multiple_tickets_returned(self):
        tickets = [{"id": str(i)} for i in range(5)]
        result = list_tickets(_client(data=tickets), "c-1")
        self.assertEqual(len(result), 5)


# ═══════════════════════════════════════════════════════════════════════════════
# 8 — Logger warning on error paths
# ═══════════════════════════════════════════════════════════════════════════════

class TestLoggerWarnings(unittest.TestCase):

    def test_get_ticket_logs_warning_on_exception(self):
        with self.assertLogs("backend.services.supabase_utils", level="WARNING") as cm:
            get_ticket(_client(raise_exc=RuntimeError("boom")), "t-1")
        self.assertTrue(any("get_ticket" in msg for msg in cm.output))

    def test_get_profile_logs_warning_on_exception(self):
        with self.assertLogs("backend.services.supabase_utils", level="WARNING") as cm:
            get_profile(_client(raise_exc=RuntimeError("boom")), "u-1")
        self.assertTrue(any("get_profile" in msg for msg in cm.output))

    def test_get_system_settings_logs_warning_on_exception(self):
        with self.assertLogs("backend.services.supabase_utils", level="WARNING") as cm:
            get_system_settings(_client(raise_exc=RuntimeError("boom")), "c-1")
        self.assertTrue(any("get_system_settings" in msg for msg in cm.output))


if __name__ == "__main__":
    unittest.main()
