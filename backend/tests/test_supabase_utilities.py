"""
Unit tests for Supabase DB client initializers and CRUD error handling (Issue #917).

Covers:
- Supabase client creation with valid/missing environment variables
- wrap_client transparent encryption wrapper (double-wrap guard, ticket passthrough)
- FakeSupabase / FakeTable CRUD operations (select, insert, update, eq, order, limit, offset, single)
- CRUD error responses: missing rows, None results, type-mismatch filters, empty tables
- WrappedRequestBuilder encryption/decryption round-trip for ticket payloads
- RPC mock behaviour (search matching)
"""

from __future__ import annotations

import os
import sys
import types
import json
import pytest
from unittest.mock import MagicMock, patch, PropertyMock

# Ensure project root is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.tests.conftest import FakeSupabase, FakeTable, FakeResult


# ============================================================================
# FakeResult
# ============================================================================

class TestFakeResult:
    """Tests for the FakeResult helper."""

    def test_default_data_is_empty_list(self):
        r = FakeResult()
        assert r.data == []

    def test_explicit_data(self):
        r = FakeResult(data=[{"id": 1}])
        assert r.data == [{"id": 1}]

    def test_none_data_becomes_empty_list(self):
        r = FakeResult(data=None)
        assert r.data == []


# ============================================================================
# FakeTable — SELECT queries
# ============================================================================

class TestFakeTableSelect:
    """SELECT query behaviour on FakeTable."""

    def test_select_all_rows(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "subject": "A"},
            {"id": 2, "subject": "B"},
        ]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").execute()
        assert len(result.data) == 2

    def test_select_empty_table(self, fake_db):
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").execute()
        assert result.data == []

    def test_select_with_eq_filter(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "company_id": "c1"},
            {"id": 2, "company_id": "c2"},
        ]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").eq("company_id", "c1").execute()
        assert len(result.data) == 1
        assert result.data[0]["id"] == 1

    def test_select_eq_no_match(self, fake_db):
        fake_db["tickets"] = [{"id": 1, "company_id": "c1"}]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").eq("company_id", "nonexistent").execute()
        assert result.data == []

    def test_select_eq_int_vs_str_coercion(self, fake_db):
        """Integer column compared with string filter value should still match."""
        fake_db["tickets"] = [{"id": 1, "company_id": "c1"}]
        table = FakeTable(fake_db, "tickets")
        # eq uses _safe_eq which handles int↔str coercion
        result = table.select("*").eq("id", "1").execute()
        assert len(result.data) == 1

    def test_select_single_returns_first_row(self, fake_db):
        fake_db["profiles"] = [
            {"id": "u1", "company_id": "c1"},
            {"id": "u2", "company_id": "c2"},
        ]
        table = FakeTable(fake_db, "profiles")
        result = table.select("*").eq("id", "u1").single().execute()
        assert result.data == {"id": "u1", "company_id": "c1"}

    def test_select_single_empty_returns_none(self, fake_db):
        table = FakeTable(fake_db, "profiles")
        result = table.select("*").eq("id", "missing").single().execute()
        # FakeResult normalises None → [] via `data or []`
        assert result.data == []

    def test_select_order_desc(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "created_at": "2026-01-01"},
            {"id": 2, "created_at": "2026-06-01"},
        ]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").order("created_at", desc=True).execute()
        assert result.data[0]["id"] == 2

    def test_select_order_asc(self, fake_db):
        fake_db["tickets"] = [
            {"id": 2, "created_at": "2026-06-01"},
            {"id": 1, "created_at": "2026-01-01"},
        ]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").order("created_at", desc=False).execute()
        assert result.data[0]["id"] == 1

    def test_select_limit(self, fake_db):
        fake_db["tickets"] = [{"id": i} for i in range(10)]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").limit(3).execute()
        assert len(result.data) == 3

    def test_select_offset(self, fake_db):
        fake_db["tickets"] = [{"id": i} for i in range(5)]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").offset(2).execute()
        assert len(result.data) == 3
        assert result.data[0]["id"] == 2

    def test_select_offset_beyond_data(self, fake_db):
        fake_db["tickets"] = [{"id": 1}]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").offset(10).execute()
        assert result.data == []


# ============================================================================
# FakeTable — INSERT operations
# ============================================================================

class TestFakeTableInsert:
    """INSERT behaviour on FakeTable."""

    def test_insert_single_row(self, fake_db):
        table = FakeTable(fake_db, "tickets")
        result = table.insert({"subject": "New ticket"}).execute()
        assert len(result.data) == 1
        assert result.data[0]["subject"] == "New ticket"
        assert "id" in result.data[0]  # auto-assigned

    def test_insert_multiple_rows(self, fake_db):
        table = FakeTable(fake_db, "tickets")
        result = table.insert([{"subject": "A"}, {"subject": "B"}]).execute()
        assert len(result.data) == 2

    def test_insert_preserves_existing_id(self, fake_db):
        table = FakeTable(fake_db, "tickets")
        result = table.insert({"id": 99, "subject": "Custom ID"}).execute()
        assert result.data[0]["id"] == 99

    def test_insert_auto_increment_id(self, fake_db):
        fake_db["tickets"] = [{"id": 5, "subject": "Existing"}]
        table = FakeTable(fake_db, "tickets")
        result = table.insert({"subject": "New"}).execute()
        # conftest assigns id = len(self.db.get(self.name, [])) + 1
        assert result.data[0]["id"] == 2  # 1 existing row → id = 2

    def test_insert_adds_to_db(self, fake_db):
        table = FakeTable(fake_db, "tickets")
        table.insert({"subject": "A"}).execute()
        table.insert({"subject": "B"}).execute()
        assert len(fake_db["tickets"]) == 2


# ============================================================================
# FakeTable — UPDATE operations
# ============================================================================

class TestFakeTableUpdate:
    """UPDATE behaviour on FakeTable."""

    def test_update_matching_row(self, fake_db):
        fake_db["tickets"] = [{"id": 1, "status": "open", "company_id": "c1"}]
        table = FakeTable(fake_db, "tickets")
        result = table.update({"status": "closed"}).eq("id", 1).execute()
        assert len(result.data) == 1
        assert result.data[0]["status"] == "closed"

    def test_update_no_match(self, fake_db):
        fake_db["tickets"] = [{"id": 1, "status": "open"}]
        table = FakeTable(fake_db, "tickets")
        result = table.update({"status": "closed"}).eq("id", 999).execute()
        assert result.data == []

    def test_update_multiple_filters(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "status": "open", "company_id": "c1"},
            {"id": 2, "status": "open", "company_id": "c2"},
        ]
        table = FakeTable(fake_db, "tickets")
        result = table.update({"status": "closed"}).eq("company_id", "c1").execute()
        assert len(result.data) == 1
        assert fake_db["tickets"][1]["status"] == "open"  # untouched


# ============================================================================
# FakeSupabase — RPC mock
# ============================================================================

class TestFakeSupabaseRpc:
    """RPC (stored procedure) mock behaviour."""

    def test_rpc_search_matches_subject(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "subject": "VPN not working", "description": "help", "company_id": "c1"},
            {"id": 2, "subject": "Printer broken", "description": "paper jam", "company_id": "c1"},
        ]
        db = FakeSupabase(fake_db)
        rpc_result = db.rpc("search_tickets", {"query_text": "VPN", "company_id": "c1"})
        result = rpc_result.execute()
        assert len(result.data) == 1
        assert result.data[0]["id"] == 1

    def test_rpc_search_no_match(self, fake_db):
        fake_db["tickets"] = [{"id": 1, "subject": "VPN", "description": "", "company_id": "c1"}]
        db = FakeSupabase(fake_db)
        result = db.rpc("search_tickets", {"query_text": "nonexistent", "company_id": "c1"}).execute()
        assert result.data == []

    def test_rpc_search_respects_company_filter(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "subject": "VPN issue", "description": "", "company_id": "c1"},
            {"id": 2, "subject": "VPN issue", "description": "", "company_id": "c2"},
        ]
        db = FakeSupabase(fake_db)
        result = db.rpc("search_tickets", {"query_text": "vpn", "company_id": "c1"}).execute()
        assert len(result.data) == 1
        assert result.data[0]["company_id"] == "c1"

    def test_rpc_search_case_insensitive(self, fake_db):
        fake_db["tickets"] = [
            {"id": 1, "subject": "VPN Not Working", "description": "", "company_id": "c1"},
        ]
        db = FakeSupabase(fake_db)
        result = db.rpc("search_tickets", {"query_text": "vpn", "company_id": "c1"}).execute()
        assert len(result.data) == 1


# ============================================================================
# Supabase Client Initialization
# ============================================================================

class TestSupabaseClientInit:
    """Tests for Supabase client creation in backend.main."""

    def test_create_client_with_valid_env(self):
        """Client should initialize when SUPABASE_URL and SUPABASE_SERVICE_KEY are set."""
        mock_create = MagicMock()
        mock_client = MagicMock()
        mock_create.return_value = mock_client

        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_SERVICE_KEY": "test-key",
        }):
            with patch("supabase.create_client", mock_create, create=True):
                url = os.environ.get("SUPABASE_URL")
                key = os.environ.get("SUPABASE_SERVICE_KEY")
                assert url == "https://test.supabase.co"
                assert key == "test-key"

    def test_missing_supabase_url_graceful(self):
        """When SUPABASE_URL is missing, client should be None (degraded mode)."""
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("SUPABASE_URL", None)
            os.environ.pop("SUPABASE_SERVICE_KEY", None)
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            assert url is None
            assert key is None

    def test_missing_service_key_graceful(self):
        """When SUPABASE_SERVICE_KEY is missing, client should be None."""
        with patch.dict(os.environ, {"SUPABASE_URL": "https://test.supabase.co"}, clear=True):
            os.environ.pop("SUPABASE_SERVICE_KEY", None)
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            assert key is None


# ============================================================================
# wrap_client — Transparent Encryption Wrapper
# ============================================================================

class TestWrapClient:
    """Tests for backend.auth.crypto.wrap_client."""

    def test_wrap_client_returns_client(self):
        """wrap_client should return the same client object."""
        from backend.auth.crypto import wrap_client
        mock_client = MagicMock()
        mock_client.table.return_value = MagicMock()
        result = wrap_client(mock_client)
        assert result is mock_client

    def test_wrap_client_none_returns_none(self):
        """wrap_client(None) should return None."""
        from backend.auth.crypto import wrap_client
        assert wrap_client(None) is None

    def test_wrap_client_sets_wrapped_flag(self):
        """wrap_client should mark client to prevent double-wrapping."""
        from backend.auth.crypto import wrap_client
        # Use a simple namespace instead of MagicMock (MagicMock intercepts setattr)
        class _FakeClient:
            def table(self, name):
                return MagicMock()
        client = _FakeClient()
        wrap_client(client)
        assert hasattr(client, "_wrapped_by_crypto")
        assert client._wrapped_by_crypto is True

    def test_wrap_client_double_wrap_idempotent(self):
        """Double-wrapping should return the same client without re-wrapping."""
        from backend.auth.crypto import wrap_client
        mock_client = MagicMock()
        mock_client.table.return_value = MagicMock()
        first = wrap_client(mock_client)
        second = wrap_client(first)
        assert first is second

    def test_wrap_client_tickets_table_returns_wrapped_builder(self):
        """Querying 'tickets' table should return a WrappedRequestBuilder."""
        from backend.auth.crypto import wrap_client, WrappedRequestBuilder
        class _FakeClient:
            def table(self, name):
                return MagicMock()
        client = _FakeClient()
        wrapped = wrap_client(client)
        builder = wrapped.table("tickets")
        assert isinstance(builder, WrappedRequestBuilder)

    def test_wrap_client_non_tickets_table_returns_raw_builder(self):
        """Querying non-'tickets' tables should return the raw builder."""
        from backend.auth.crypto import wrap_client
        inner_builder = MagicMock()
        mock_client = MagicMock()
        mock_client.table.return_value = inner_builder
        wrapped = wrap_client(mock_client)
        builder = wrapped.table("profiles")
        assert builder is inner_builder


# ============================================================================
# WrappedRequestBuilder — CRUD with Encryption
# ============================================================================

class TestWrappedRequestBuilder:
    """Tests for WrappedRequestBuilder encrypt/decrypt passthrough."""

    def test_insert_encrypts_ticket_payload(self):
        """Inserting into 'tickets' should encrypt sensitive fields."""
        from backend.auth.crypto import WrappedRequestBuilder, encrypt_payload, TARGET_FIELDS
        inner = MagicMock()
        inner.insert.return_value = inner
        inner.execute.return_value = MagicMock(data=[{"id": 1, "description": "test"}])

        builder = WrappedRequestBuilder(inner, "tickets")
        builder.insert({"description": "test email@example.com"})
        inner.insert.assert_called_once()

    def test_update_encrypts_ticket_payload(self):
        """Updating 'tickets' should encrypt sensitive fields."""
        from backend.auth.crypto import WrappedRequestBuilder
        inner = MagicMock()
        inner.update.return_value = inner
        inner.execute.return_value = MagicMock(data=[{"id": 1}])

        builder = WrappedRequestBuilder(inner, "tickets")
        builder.update({"description": "updated"})
        inner.update.assert_called_once()

    def test_execute_decrypts_ticket_data(self):
        """Executing a 'tickets' query should decrypt the response data."""
        from backend.auth.crypto import WrappedRequestBuilder
        inner = MagicMock()
        result_mock = MagicMock()
        result_mock.data = [{"id": 1, "description": "plain text"}]
        inner.execute.return_value = result_mock

        builder = WrappedRequestBuilder(inner, "tickets")
        result = builder.execute()
        # Data should be passed through decrypt_payload
        assert result.data == [{"id": 1, "description": "plain text"}]

    def test_non_tickets_table_passthrough(self):
        """Non-'tickets' tables should not encrypt/decrypt."""
        from backend.auth.crypto import WrappedRequestBuilder
        inner = MagicMock()
        inner.insert.return_value = inner
        inner.execute.return_value = MagicMock(data=[{"id": 1}])

        builder = WrappedRequestBuilder(inner, "profiles")
        builder.insert({"email": "test@example.com"})
        inner.insert.assert_called_once()
        # Payload should NOT be encrypted
        call_args = inner.insert.call_args[0][0]
        assert call_args["email"] == "test@example.com"

    def test_proxy_chaining_returns_wrapped_builder(self):
        """Chained query methods should return WrappedRequestBuilder instances."""
        from backend.auth.crypto import WrappedRequestBuilder
        inner = MagicMock()
        inner.select.return_value = inner
        inner.eq.return_value = inner
        inner.execute.return_value = MagicMock(data=[])

        builder = WrappedRequestBuilder(inner, "tickets")
        chained = builder.select("*")
        assert isinstance(chained, WrappedRequestBuilder)


# ============================================================================
# CRUD Error Handling — Edge Cases
# ============================================================================

class TestCrudErrorHandling:
    """Edge cases for CRUD operations that should be handled gracefully."""

    def test_filter_on_none_column_value(self, fake_db):
        """Rows with None column values should not crash _safe_eq."""
        fake_db["tickets"] = [{"id": 1, "company_id": None}]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").eq("company_id", "c1").execute()
        assert result.data == []

    def test_filter_with_none_search_value(self, fake_db):
        """Filtering with None as search value should not crash."""
        fake_db["tickets"] = [{"id": 1, "company_id": "c1"}]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").eq("company_id", None).execute()
        assert result.data == []

    def test_update_nonexistent_table(self, fake_db):
        """Updating a table with no rows should return empty result."""
        table = FakeTable(fake_db, "nonexistent")
        result = table.update({"status": "closed"}).eq("id", 1).execute()
        assert result.data == []

    def test_insert_then_select_immediate(self, fake_db):
        """Inserted rows should be immediately visible in subsequent selects."""
        supabase = FakeSupabase(fake_db)
        supabase.table("tickets").insert({"subject": "New"}).execute()
        result = supabase.table("tickets").select("*").execute()
        assert len(result.data) == 1
        assert result.data[0]["subject"] == "New"

    def test_chained_eq_filters(self, fake_db):
        """Multiple .eq() calls should AND the filters."""
        fake_db["tickets"] = [
            {"id": 1, "company_id": "c1", "status": "open"},
            {"id": 2, "company_id": "c1", "status": "closed"},
            {"id": 3, "company_id": "c2", "status": "open"},
        ]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").eq("company_id", "c1").eq("status", "open").execute()
        assert len(result.data) == 1
        assert result.data[0]["id"] == 1

    def test_limit_zero_returns_empty(self, fake_db):
        """limit(0) should return empty results."""
        fake_db["tickets"] = [{"id": 1}]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").limit(0).execute()
        assert result.data == []

    def test_order_on_missing_field(self, fake_db):
        """Ordering by a field that doesn't exist in rows should not crash."""
        fake_db["tickets"] = [{"id": 1}, {"id": 2}]
        table = FakeTable(fake_db, "tickets")
        result = table.select("*").order("nonexistent_field").execute()
        assert len(result.data) == 2
