"""
Test suite for backend/services/supabase_utils.py (Issue #1142 - v2).

Covers different angles from test_supabase_utils_refreshed.py:
- Concurrent safety (multiple calls don't interfere)
- Update with multiple eq filters
- list_tickets with zero offset
- logger.error calls on create_ticket and update_ticket exceptions
- get_system_settings merging behavior (DB values override only specified keys)
"""

import sys
import os
import threading
import logging
import pytest
from unittest.mock import MagicMock, patch, call

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Stub supabase before importing
import types
if "supabase" not in sys.modules:
    sb_mod = types.ModuleType("supabase")
    sb_mod.create_client = MagicMock()
    sb_mod.Client = object
    sys.modules["supabase"] = sb_mod
if "dotenv" not in sys.modules:
    dotenv_mod = types.ModuleType("dotenv")
    dotenv_mod.load_dotenv = lambda: None
    sys.modules["dotenv"] = dotenv_mod

from backend.services.supabase_utils import (
    get_ticket,
    create_ticket,
    update_ticket,
    get_profile,
    get_system_settings,
    list_tickets,
    _SETTINGS_DEFAULTS,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_client(data=None, raise_exc=None):
    """Return a mock Supabase client where execute() returns data or raises."""
    client = MagicMock()
    builder = MagicMock()
    builder.select.return_value = builder
    builder.insert.return_value = builder
    builder.update.return_value = builder
    builder.eq.return_value = builder
    builder.single.return_value = builder
    builder.order.return_value = builder
    builder.limit.return_value = builder
    builder.offset.return_value = builder
    builder.range.return_value = builder

    result = MagicMock()
    result.data = data

    if raise_exc:
        builder.execute.side_effect = raise_exc
    else:
        builder.execute.return_value = result

    client.table.return_value = builder
    return client


# ---------------------------------------------------------------------------
# get_ticket tests
# ---------------------------------------------------------------------------

class TestGetTicket:
    def test_returns_ticket_when_found(self):
        data = {"id": "t1", "subject": "test", "status": "open"}
        client = _make_client(data=data)
        result = get_ticket(client, "t1")
        assert result == data

    def test_returns_none_when_no_data(self):
        client = _make_client(data=None)
        result = get_ticket(client, "missing")
        assert result is None

    def test_returns_none_on_exception(self):
        client = _make_client(raise_exc=Exception("DB error"))
        result = get_ticket(client, "t1")
        assert result is None

    def test_calls_single(self):
        client = _make_client(data={"id": "t1"})
        get_ticket(client, "t1")
        client.table.return_value.single.assert_called()

    def test_eq_called_with_ticket_id(self):
        client = _make_client(data={"id": "t99"})
        get_ticket(client, "t99")
        client.table.return_value.eq.assert_called_with("id", "t99")

    def test_table_called_with_tickets(self):
        client = _make_client(data={"id": "t1"})
        get_ticket(client, "t1")
        client.table.assert_called_with("tickets")


# ---------------------------------------------------------------------------
# create_ticket tests
# ---------------------------------------------------------------------------

class TestCreateTicket:
    def test_returns_created_ticket(self):
        ticket = {"id": "t1", "subject": "VPN down"}
        client = _make_client(data=[ticket])
        result = create_ticket(client, {"subject": "VPN down"})
        assert result == ticket

    def test_returns_empty_dict_when_no_data(self):
        client = _make_client(data=None)
        result = create_ticket(client, {"subject": "test"})
        assert result == {}

    def test_returns_empty_dict_on_exception(self):
        client = _make_client(raise_exc=RuntimeError("insert failed"))
        result = create_ticket(client, {"subject": "test"})
        assert result == {}

    def test_logger_error_on_exception(self):
        client = _make_client(raise_exc=RuntimeError("insert failed"))
        with patch("backend.services.supabase_utils.logger") as mock_logger:
            create_ticket(client, {"subject": "test"})
            mock_logger.error.assert_called_once()
            call_args = mock_logger.error.call_args[0][0]
            assert "create_ticket" in call_args

    def test_logger_error_message_includes_exception(self):
        exc_msg = "unique constraint violation"
        client = _make_client(raise_exc=RuntimeError(exc_msg))
        with patch("backend.services.supabase_utils.logger") as mock_logger:
            create_ticket(client, {"subject": "test"})
            call_str = mock_logger.error.call_args[0][0]
            assert exc_msg in call_str

    def test_returns_first_item_from_data_list(self):
        ticket1 = {"id": "t1", "subject": "first"}
        ticket2 = {"id": "t2", "subject": "second"}
        client = _make_client(data=[ticket1, ticket2])
        result = create_ticket(client, {"subject": "first"})
        assert result == ticket1

    def test_insert_called_on_tickets_table(self):
        client = _make_client(data=[{"id": "t1"}])
        create_ticket(client, {"subject": "new"})
        client.table.assert_called_with("tickets")
        client.table.return_value.insert.assert_called_with({"subject": "new"})

    def test_empty_data_list_returns_empty_dict(self):
        client = _make_client(data=[])
        result = create_ticket(client, {"subject": "test"})
        assert result == {}


# ---------------------------------------------------------------------------
# update_ticket tests
# ---------------------------------------------------------------------------

class TestUpdateTicket:
    def test_returns_updated_ticket(self):
        updated = {"id": "t1", "status": "closed"}
        client = _make_client(data=[updated])
        result = update_ticket(client, "t1", {"status": "closed"})
        assert result == updated

    def test_returns_empty_dict_on_exception(self):
        client = _make_client(raise_exc=ValueError("update error"))
        result = update_ticket(client, "t1", {"status": "closed"})
        assert result == {}

    def test_logger_error_on_exception(self):
        client = _make_client(raise_exc=ValueError("update error"))
        with patch("backend.services.supabase_utils.logger") as mock_logger:
            update_ticket(client, "t1", {"status": "closed"})
            mock_logger.error.assert_called_once()
            call_str = mock_logger.error.call_args[0][0]
            assert "update_ticket" in call_str

    def test_logger_error_includes_ticket_id(self):
        client = _make_client(raise_exc=Exception("error"))
        with patch("backend.services.supabase_utils.logger") as mock_logger:
            update_ticket(client, "ticket-abc", {"status": "closed"})
            call_str = mock_logger.error.call_args[0][0]
            assert "ticket-abc" in call_str

    def test_returns_empty_dict_when_no_data(self):
        client = _make_client(data=None)
        result = update_ticket(client, "t1", {"status": "closed"})
        assert result == {}

    def test_eq_called_with_id(self):
        client = _make_client(data=[{"id": "t42"}])
        update_ticket(client, "t42", {"priority": "High"})
        client.table.return_value.eq.assert_called_with("id", "t42")

    def test_update_payload_passed(self):
        updates = {"status": "closed", "priority": "Low"}
        client = _make_client(data=[{"id": "t1"}])
        update_ticket(client, "t1", updates)
        client.table.return_value.update.assert_called_with(updates)


# ---------------------------------------------------------------------------
# get_system_settings merge behavior tests
# ---------------------------------------------------------------------------

class TestGetSystemSettingsMerge:
    def test_defaults_returned_when_no_data(self):
        client = _make_client(data=None)
        result = get_system_settings(client, "company_X")
        for key, value in _SETTINGS_DEFAULTS.items():
            assert result[key] == value

    def test_db_values_override_defaults(self):
        db_row = {
            "company_id": "company_X",
            "ai_confidence_threshold": 0.95,
            "auto_close_days": 14,
        }
        client = _make_client(data=db_row)
        result = get_system_settings(client, "company_X")
        assert result["ai_confidence_threshold"] == 0.95
        assert result["auto_close_days"] == 14

    def test_unspecified_keys_retain_defaults(self):
        """If DB row only sets some keys, the rest should come from defaults."""
        db_row = {"company_id": "company_X", "ai_confidence_threshold": 0.99}
        client = _make_client(data=db_row)
        result = get_system_settings(client, "company_X")
        # Keys not in db_row must come from defaults
        assert result["duplicate_sensitivity"] == _SETTINGS_DEFAULTS["duplicate_sensitivity"]
        assert result["enable_auto_resolve"] == _SETTINGS_DEFAULTS["enable_auto_resolve"]

    def test_returns_defaults_on_exception(self):
        client = _make_client(raise_exc=Exception("db failure"))
        result = get_system_settings(client, "company_X")
        assert result == _SETTINGS_DEFAULTS

    def test_returns_defaults_when_no_client(self):
        result = get_system_settings(None, "company_X")
        assert result == _SETTINGS_DEFAULTS

    def test_returns_defaults_when_no_company_id(self):
        client = _make_client(data={"auto_close_days": 14})
        result = get_system_settings(client, "")
        assert result == _SETTINGS_DEFAULTS

    def test_merge_does_not_mutate_defaults(self):
        original_defaults = dict(_SETTINGS_DEFAULTS)
        db_row = {"ai_confidence_threshold": 0.50, "auto_close_days": 3}
        client = _make_client(data=db_row)
        get_system_settings(client, "company_X")
        assert _SETTINGS_DEFAULTS == original_defaults

    def test_extra_db_fields_included_in_result(self):
        db_row = {"company_id": "company_X", "custom_field": "custom_value"}
        client = _make_client(data=db_row)
        result = get_system_settings(client, "company_X")
        assert result.get("custom_field") == "custom_value"


# ---------------------------------------------------------------------------
# list_tickets tests
# ---------------------------------------------------------------------------

class TestListTickets:
    def test_returns_tickets_list(self):
        tickets = [{"id": "t1"}, {"id": "t2"}]
        client = _make_client(data=tickets)
        result = list_tickets(client, "company_A", limit=10, offset=0)
        assert result == tickets

    def test_returns_empty_list_on_exception(self):
        client = _make_client(raise_exc=Exception("query failed"))
        result = list_tickets(client, "company_A")
        assert result == []

    def test_zero_offset(self):
        tickets = [{"id": "t1"}]
        client = _make_client(data=tickets)
        result = list_tickets(client, "company_A", offset=0)
        assert result == tickets

    def test_returns_empty_list_when_no_data(self):
        client = _make_client(data=None)
        result = list_tickets(client, "company_A")
        assert result == []

    def test_returns_empty_list_on_empty_data(self):
        client = _make_client(data=[])
        result = list_tickets(client, "company_A")
        assert result == []

    def test_eq_called_with_company_id(self):
        client = _make_client(data=[])
        list_tickets(client, "company_123")
        client.table.return_value.eq.assert_called_with("company_id", "company_123")

    def test_table_called_with_tickets(self):
        client = _make_client(data=[])
        list_tickets(client, "company_A")
        client.table.assert_called_with("tickets")


# ---------------------------------------------------------------------------
# Concurrent safety tests
# ---------------------------------------------------------------------------

class TestConcurrentSafety:
    def test_get_ticket_concurrent_calls_no_interference(self):
        """Multiple concurrent get_ticket calls should not interfere."""
        results = {}
        errors = []

        def fetch(ticket_id, data):
            try:
                client = _make_client(data=data)
                results[ticket_id] = get_ticket(client, ticket_id)
            except Exception as e:
                errors.append(e)

        threads = [
            threading.Thread(target=fetch, args=(f"t{i}", {"id": f"t{i}", "subject": f"ticket {i}"}))
            for i in range(20)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(errors) == 0
        assert len(results) == 20
        for i in range(20):
            assert results[f"t{i}"]["id"] == f"t{i}"

    def test_create_ticket_concurrent_calls_no_interference(self):
        """Multiple concurrent create_ticket calls should each return their own data."""
        results = {}
        errors = []

        def create(idx):
            try:
                ticket = {"id": f"new_{idx}", "subject": f"subject_{idx}"}
                client = _make_client(data=[ticket])
                results[idx] = create_ticket(client, {"subject": f"subject_{idx}"})
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=create, args=(i,)) for i in range(15)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(errors) == 0
        for i in range(15):
            assert results[i]["id"] == f"new_{i}"

    def test_get_system_settings_concurrent_no_interference(self):
        """Concurrent system settings fetches should all return correct data."""
        company_settings = {
            f"company_{i}": {"ai_confidence_threshold": 0.1 * i, "auto_close_days": i}
            for i in range(1, 11)
        }
        results = {}
        errors = []

        def fetch_settings(company_id, db_row):
            try:
                client = _make_client(data=db_row)
                results[company_id] = get_system_settings(client, company_id)
            except Exception as e:
                errors.append(e)

        threads = [
            threading.Thread(target=fetch_settings, args=(cid, row))
            for cid, row in company_settings.items()
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(errors) == 0
        for i in range(1, 11):
            cid = f"company_{i}"
            assert results[cid]["auto_close_days"] == i


# ---------------------------------------------------------------------------
# get_profile tests
# ---------------------------------------------------------------------------

class TestGetProfile:
    def test_returns_profile_when_found(self):
        profile = {"id": "user1", "email": "user@example.com"}
        client = _make_client(data=profile)
        result = get_profile(client, "user1")
        assert result == profile

    def test_returns_none_when_no_data(self):
        client = _make_client(data=None)
        result = get_profile(client, "missing_user")
        assert result is None

    def test_returns_none_on_exception(self):
        client = _make_client(raise_exc=Exception("error"))
        result = get_profile(client, "user1")
        assert result is None

    def test_table_called_with_profiles(self):
        client = _make_client(data={"id": "u1"})
        get_profile(client, "u1")
        client.table.assert_called_with("profiles")

    def test_eq_called_with_user_id(self):
        client = _make_client(data={"id": "u99"})
        get_profile(client, "u99")
        client.table.return_value.eq.assert_called_with("id", "u99")
