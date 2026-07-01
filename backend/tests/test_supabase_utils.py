"""
Tests for backend/services/supabase_utils.py
Covers all 6 functions: get_ticket, create_ticket, update_ticket,
get_profile, get_system_settings, list_tickets.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch

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


def _mock_client():
    """Build a fluent mock Supabase client."""
    client = MagicMock()
    return client


def _chain(data=None, raise_exc=None):
    """
    Return a callable chain builder.
    Each call in the chain returns the same builder until .execute() is called.
    """
    result = MagicMock()
    result.data = data

    builder = MagicMock()
    builder.select.return_value = builder
    builder.insert.return_value = builder
    builder.update.return_value = builder
    builder.eq.return_value = builder
    builder.order.return_value = builder
    builder.range.return_value = builder
    builder.single.return_value = builder

    if raise_exc:
        builder.execute.side_effect = raise_exc
    else:
        builder.execute.return_value = result

    return builder, result


# ---------------------------------------------------------------------------
# get_ticket tests
# ---------------------------------------------------------------------------

class TestGetTicket(unittest.TestCase):
    def test_returns_ticket_on_success(self):
        client = _mock_client()
        b, res = _chain(data={"id": "abc", "subject": "Network issue"})
        client.table.return_value = b
        result = get_ticket(client, "abc")
        self.assertEqual(result["id"], "abc")

    def test_returns_none_when_data_is_none(self):
        client = _mock_client()
        b, res = _chain(data=None)
        client.table.return_value = b
        result = get_ticket(client, "missing-id")
        self.assertIsNone(result)

    def test_returns_none_on_db_exception(self):
        client = _mock_client()
        b, _ = _chain(raise_exc=Exception("DB error"))
        client.table.return_value = b
        result = get_ticket(client, "bad-id")
        self.assertIsNone(result)

    def test_calls_correct_table(self):
        client = _mock_client()
        b, _ = _chain(data={"id": "x"})
        client.table.return_value = b
        get_ticket(client, "x")
        client.table.assert_called_with("tickets")

    def test_filters_by_ticket_id(self):
        client = _mock_client()
        b, _ = _chain(data={"id": "ticket-123"})
        client.table.return_value = b
        get_ticket(client, "ticket-123")
        b.eq.assert_called_with("id", "ticket-123")

    def test_uses_single_on_query(self):
        client = _mock_client()
        b, _ = _chain(data={"id": "t1"})
        client.table.return_value = b
        get_ticket(client, "t1")
        b.single.assert_called_once()


# ---------------------------------------------------------------------------
# create_ticket tests
# ---------------------------------------------------------------------------

class TestCreateTicket(unittest.TestCase):
    def test_returns_created_ticket(self):
        client = _mock_client()
        b, res = _chain(data=[{"id": "new-t", "subject": "Test"}])
        client.table.return_value = b
        result = create_ticket(client, {"subject": "Test"})
        self.assertEqual(result["id"], "new-t")

    def test_returns_empty_dict_when_no_data(self):
        client = _mock_client()
        b, _ = _chain(data=None)
        client.table.return_value = b
        result = create_ticket(client, {"subject": "Test"})
        self.assertEqual(result, {})

    def test_returns_empty_dict_on_exception(self):
        client = _mock_client()
        b, _ = _chain(raise_exc=Exception("Insert failed"))
        client.table.return_value = b
        result = create_ticket(client, {"subject": "Bad"})
        self.assertEqual(result, {})

    def test_passes_data_to_insert(self):
        client = _mock_client()
        b, _ = _chain(data=[{"id": "t2"}])
        client.table.return_value = b
        create_ticket(client, {"subject": "Hi", "priority": "High"})
        b.insert.assert_called_with({"subject": "Hi", "priority": "High"})

    def test_returns_first_element_of_list(self):
        client = _mock_client()
        b, res = _chain(data=[{"id": "first"}, {"id": "second"}])
        client.table.return_value = b
        result = create_ticket(client, {})
        self.assertEqual(result["id"], "first")


# ---------------------------------------------------------------------------
# update_ticket tests
# ---------------------------------------------------------------------------

class TestUpdateTicket(unittest.TestCase):
    def test_returns_updated_ticket(self):
        client = _mock_client()
        b, res = _chain(data=[{"id": "t1", "status": "closed"}])
        client.table.return_value = b
        result = update_ticket(client, "t1", {"status": "closed"})
        self.assertEqual(result["status"], "closed")

    def test_returns_empty_dict_when_no_data(self):
        client = _mock_client()
        b, _ = _chain(data=None)
        client.table.return_value = b
        result = update_ticket(client, "t1", {"status": "closed"})
        self.assertEqual(result, {})

    def test_returns_empty_dict_on_exception(self):
        client = _mock_client()
        b, _ = _chain(raise_exc=Exception("Update failed"))
        client.table.return_value = b
        result = update_ticket(client, "bad-id", {})
        self.assertEqual(result, {})

    def test_partial_update_applied(self):
        client = _mock_client()
        b, _ = _chain(data=[{"id": "t1", "status": "resolved", "priority": "High"}])
        client.table.return_value = b
        result = update_ticket(client, "t1", {"status": "resolved"})
        # Only status was sent in update; priority comes back from DB
        b.update.assert_called_with({"status": "resolved"})

    def test_filters_by_ticket_id(self):
        client = _mock_client()
        b, _ = _chain(data=[{"id": "t99"}])
        client.table.return_value = b
        update_ticket(client, "t99", {"priority": "Low"})
        b.eq.assert_called_with("id", "t99")


# ---------------------------------------------------------------------------
# get_profile tests
# ---------------------------------------------------------------------------

class TestGetProfile(unittest.TestCase):
    def test_returns_profile_on_success(self):
        client = _mock_client()
        b, res = _chain(data={"id": "u1", "full_name": "Alice"})
        client.table.return_value = b
        result = get_profile(client, "u1")
        self.assertEqual(result["full_name"], "Alice")

    def test_returns_none_when_not_found(self):
        client = _mock_client()
        b, _ = _chain(data=None)
        client.table.return_value = b
        result = get_profile(client, "u-missing")
        self.assertIsNone(result)

    def test_returns_none_on_exception(self):
        client = _mock_client()
        b, _ = _chain(raise_exc=Exception("Auth error"))
        client.table.return_value = b
        result = get_profile(client, "bad-user")
        self.assertIsNone(result)

    def test_uses_profiles_table(self):
        client = _mock_client()
        b, _ = _chain(data={"id": "u2"})
        client.table.return_value = b
        get_profile(client, "u2")
        client.table.assert_called_with("profiles")

    def test_filters_by_user_id(self):
        client = _mock_client()
        b, _ = _chain(data={"id": "u3"})
        client.table.return_value = b
        get_profile(client, "u3")
        b.eq.assert_called_with("id", "u3")


# ---------------------------------------------------------------------------
# get_system_settings tests
# ---------------------------------------------------------------------------

class TestGetSystemSettings(unittest.TestCase):
    def test_returns_defaults_when_client_none(self):
        result = get_system_settings(None, "company-1")
        self.assertEqual(result["ai_confidence_threshold"], _SETTINGS_DEFAULTS["ai_confidence_threshold"])

    def test_returns_defaults_when_company_id_none(self):
        result = get_system_settings(MagicMock(), None)
        self.assertEqual(result["duplicate_sensitivity"], _SETTINGS_DEFAULTS["duplicate_sensitivity"])

    def test_merges_db_values_with_defaults(self):
        client = _mock_client()
        b, res = _chain(data={"company_id": "c1", "ai_confidence_threshold": 0.70})
        client.table.return_value = b
        result = get_system_settings(client, "c1")
        self.assertEqual(result["ai_confidence_threshold"], 0.70)
        # Default for others still present
        self.assertIn("enable_auto_resolve", result)

    def test_falls_back_to_defaults_on_exception(self):
        client = _mock_client()
        b, _ = _chain(raise_exc=Exception("DB error"))
        client.table.return_value = b
        result = get_system_settings(client, "c2")
        self.assertEqual(result, dict(_SETTINGS_DEFAULTS))

    def test_returns_dict_always(self):
        result = get_system_settings(None, None)
        self.assertIsInstance(result, dict)

    def test_default_enable_auto_resolve_is_false(self):
        result = get_system_settings(None, "any")
        self.assertFalse(result["enable_auto_resolve"])

    def test_db_values_override_defaults(self):
        client = _mock_client()
        b, _ = _chain(data={"auto_close_days": 14, "enable_auto_resolve": True})
        client.table.return_value = b
        result = get_system_settings(client, "c3")
        self.assertEqual(result["auto_close_days"], 14)
        self.assertTrue(result["enable_auto_resolve"])


# ---------------------------------------------------------------------------
# list_tickets tests
# ---------------------------------------------------------------------------

class TestListTickets(unittest.TestCase):
    def test_returns_list_of_tickets(self):
        client = _mock_client()
        b, res = _chain(data=[{"id": "t1"}, {"id": "t2"}])
        client.table.return_value = b
        result = list_tickets(client, "company-1")
        self.assertEqual(len(result), 2)

    def test_returns_empty_list_when_no_data(self):
        client = _mock_client()
        b, _ = _chain(data=None)
        client.table.return_value = b
        result = list_tickets(client, "company-1")
        self.assertEqual(result, [])

    def test_returns_empty_list_on_exception(self):
        client = _mock_client()
        b, _ = _chain(raise_exc=Exception("Query failed"))
        client.table.return_value = b
        result = list_tickets(client, "bad-company")
        self.assertEqual(result, [])

    def test_filters_by_company_id(self):
        client = _mock_client()
        b, _ = _chain(data=[])
        client.table.return_value = b
        list_tickets(client, "company-abc")
        b.eq.assert_called_with("company_id", "company-abc")

    def test_default_limit_is_50(self):
        client = _mock_client()
        b, _ = _chain(data=[])
        client.table.return_value = b
        list_tickets(client, "company-1")
        b.range.assert_called_with(0, 49)

    def test_pagination_offset(self):
        client = _mock_client()
        b, _ = _chain(data=[])
        client.table.return_value = b
        list_tickets(client, "company-1", limit=10, offset=20)
        b.range.assert_called_with(20, 29)

    def test_custom_limit(self):
        client = _mock_client()
        b, _ = _chain(data=[{"id": "t1"}])
        client.table.return_value = b
        list_tickets(client, "company-1", limit=5, offset=0)
        b.range.assert_called_with(0, 4)

    def test_orders_by_created_at_desc(self):
        client = _mock_client()
        b, _ = _chain(data=[])
        client.table.return_value = b
        list_tickets(client, "company-1")
        b.order.assert_called_with("created_at", desc=True)


if __name__ == "__main__":
    unittest.main()
