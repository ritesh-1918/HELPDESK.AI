"""
Tests for transactional rollback behavior in POST /tickets/save (Issue #3212).

Asserts that if a step occurring AFTER the initial `tickets` row insert fails
(the duplicate/categorization indexing step, or the initial system message
insert), the ticket row is rolled back (deleted) rather than left as an
orphaned, inconsistent record - and the endpoint returns a 500 rather than a
partial success.
"""
import sys
import os
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import main
from main import app, get_current_user
from fastapi.testclient import TestClient

client = TestClient(app)

MOCK_USER = {
    "id": "test-user-id-123",
    "email": "test@example.com",
    "user_metadata": {
        "company_id": "test-company-id",
        "company": "Test Company",
        "role": "admin",
    },
}

VALID_TICKET_PAYLOAD = {
    "user_id": "test-user-id-123",
    "subject": "Printer not working",
    "description": "The office printer on floor 3 is jammed and will not print.",
    "category": "Hardware",
    "subcategory": "Printer",
    "priority": "medium",
    "assigned_team": "IT Support",
    "status": "open",
    "auto_resolve": False,
    "is_duplicate": False,
    "confidence": 0.92,
    "sla_breach_at": "2026-07-05T00:00:00Z",
    "metadata": {},
    "routing_confidence": 0.9,
}


def mock_get_current_user():
    return MOCK_USER


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


class FakeSupabaseChain:
    """
    Minimal fluent-chain fake for supabase-py's table().insert()/.select()/
    .delete().eq().execute() calls, configurable per table name so tests can
    simulate an insert into `tickets` succeeding while a later insert into
    `ticket_messages` (or the duplicate/categorization step) fails.
    """

    def __init__(self, table_name, responses, on_delete=None):
        self.table_name = table_name
        self._responses = responses
        self._on_delete = on_delete
        self._pending_op = None
        self._is_single = False

    def select(self, *a, **kw):
        self._pending_op = "select"
        return self

    def insert(self, payload, *a, **kw):
        self._pending_op = "insert"
        self._payload = payload
        return self

    def delete(self, *a, **kw):
        self._pending_op = "delete"
        return self

    def eq(self, *a, **kw):
        return self

    def single(self, *a, **kw):
        self._is_single = True
        return self

    def order(self, *a, **kw):
        return self

    def execute(self):
        if self._pending_op == "delete":
            if self._on_delete:
                self._on_delete(self.table_name)
            result = MagicMock()
            result.data = []
            return result

        response = self._responses.get(self.table_name)
        if isinstance(response, Exception):
            raise response

        data = response
        if self._is_single and isinstance(data, list):
            data = data[0] if data else None

        result = MagicMock()
        result.data = data
        return result


def make_fake_supabase(responses, on_delete=None):
    """responses: dict of table_name -> data (or an Exception instance to raise on execute())."""
    fake = MagicMock()

    def table_side_effect(table_name):
        return FakeSupabaseChain(table_name, responses, on_delete=on_delete)

    fake.table.side_effect = table_side_effect
    return fake


DEFAULT_PROFILE = [{"company_id": "test-company-id", "company": "Test Company"}]
DEFAULT_TICKET_INSERT_RESULT = [{"id": "ticket-abc-123", **VALID_TICKET_PAYLOAD}]


class TestTicketCreationRollback:
    """Covers compensating rollback when a post-insert step fails."""

    def test_happy_path_no_rollback(self):
        """Successful creation never touches delete()."""
        deleted_tables = []
        fake_supabase = make_fake_supabase(
            responses={
                "profiles": DEFAULT_PROFILE,
                "tickets": DEFAULT_TICKET_INSERT_RESULT,
                "ticket_messages": [{"id": "msg-1"}],
            },
            on_delete=lambda table: deleted_tables.append(table),
        )

        with patch("backend.routers.tickets.supabase", fake_supabase), \
             patch("backend.routers.tickets.duplicate_service") as fake_dup:
            fake_dup.add_ticket.return_value = None
            response = client.post(
                "/tickets/save",
                json=VALID_TICKET_PAYLOAD,
                headers={"Authorization": "Bearer test-token"},
            )

        assert response.status_code == 200
        assert response.json()["status"] == "success"
        assert deleted_tables == []

    def test_rollback_when_categorization_indexing_fails(self):
        """
        If the categorization/duplicate-indexing step raises, the ticket row
        that was already inserted must be rolled back (deleted), and the
        endpoint must return a 500 rather than a partial success.
        """
        deleted_tables = []
        fake_supabase = make_fake_supabase(
            responses={
                "profiles": DEFAULT_PROFILE,
                "tickets": DEFAULT_TICKET_INSERT_RESULT,
                "ticket_messages": [{"id": "msg-1"}],
            },
            on_delete=lambda table: deleted_tables.append(table),
        )

        with patch("backend.routers.tickets.supabase", fake_supabase), \
             patch("backend.routers.tickets.duplicate_service") as fake_dup:
            fake_dup.add_ticket.side_effect = RuntimeError("categorization model unavailable")
            response = client.post(
                "/tickets/save",
                json=VALID_TICKET_PAYLOAD,
                headers={"Authorization": "Bearer test-token"},
            )

        assert response.status_code == 500
        assert "roll" in response.json()["detail"].lower()
        assert deleted_tables == ["tickets"], (
            "Expected the orphaned ticket row to be rolled back via a delete() "
            "on the tickets table"
        )

    def test_rollback_when_system_message_insert_fails(self):
        """
        If writing the initial system diagnostic message fails after the
        ticket row was inserted, the ticket row must be rolled back too.
        """
        deleted_tables = []
        fake_supabase = make_fake_supabase(
            responses={
                "profiles": DEFAULT_PROFILE,
                "tickets": DEFAULT_TICKET_INSERT_RESULT,
                "ticket_messages": RuntimeError("db connection dropped"),
            },
            on_delete=lambda table: deleted_tables.append(table),
        )

        with patch("backend.routers.tickets.supabase", fake_supabase), \
             patch("backend.routers.tickets.duplicate_service") as fake_dup:
            fake_dup.add_ticket.return_value = None
            response = client.post(
                "/tickets/save",
                json=VALID_TICKET_PAYLOAD,
                headers={"Authorization": "Bearer test-token"},
            )

        assert response.status_code == 500
        assert deleted_tables == ["tickets"]

    def test_rollback_failure_is_logged_but_still_returns_500(self):
        """
        If the compensating delete() ITSELF fails (e.g. DB is genuinely down),
        the endpoint must still surface a 500 rather than crash uncaught -
        this is the worst case (an orphaned record persists) but the API
        contract must remain intact.
        """
        def raise_on_delete(table):
            raise RuntimeError("delete also failed")

        fake_supabase = make_fake_supabase(
            responses={
                "profiles": DEFAULT_PROFILE,
                "tickets": DEFAULT_TICKET_INSERT_RESULT,
                "ticket_messages": RuntimeError("db connection dropped"),
            },
            on_delete=raise_on_delete,
        )

        with patch("backend.routers.tickets.supabase", fake_supabase), \
             patch("backend.routers.tickets.duplicate_service") as fake_dup:
            fake_dup.add_ticket.return_value = None
            response = client.post(
                "/tickets/save",
                json=VALID_TICKET_PAYLOAD,
                headers={"Authorization": "Bearer test-token"},
            )

        assert response.status_code == 500

    def test_duplicate_text_empty_skips_indexing_without_rollback(self):
        """
        A ticket with no subject/description text should skip indexing
        gracefully (existing soft-skip behavior) and NOT trigger a rollback -
        this is a deliberate no-op, not a failure.
        """
        deleted_tables = []
        payload = {**VALID_TICKET_PAYLOAD, "subject": "", "description": ""}
        fake_supabase = make_fake_supabase(
            responses={
                "profiles": DEFAULT_PROFILE,
                "tickets": DEFAULT_TICKET_INSERT_RESULT,
                "ticket_messages": [{"id": "msg-1"}],
            },
            on_delete=lambda table: deleted_tables.append(table),
        )

        with patch("backend.routers.tickets.supabase", fake_supabase), \
             patch("backend.routers.tickets.duplicate_service") as fake_dup:
            response = client.post(
                "/tickets/save",
                json=payload,
                headers={"Authorization": "Bearer test-token"},
            )

        assert response.status_code == 200
        assert response.json()["duplicate_indexed"] is False
        assert deleted_tables == []
        fake_dup.add_ticket.assert_not_called()
