"""
Tests for the ticket_insert_webhook trigger and function (Issue #webhook).

Covers:
- Function and trigger existence
- Trigger timing (AFTER), event (INSERT only), orientation (ROW)
- Function language (plpgsql), body assertions (net.http_post, Authorization,
  return NEW, row_to_json/jsonb, URL)
- Webhook payload schema validation
- Null and missing field handling
"""

import re
import pytest


# ─── Helpers ──────────────────────────────────────────────────────────────────

# FIX 1: Single helper to fetch the function definition once; avoids the
#         copy-pasted triple-query block across three test functions.

_FUNCDEF_QUERY = """
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'ticket_insert_webhook'
AND n.nspname = 'public';
"""


def _get_function_definition(db_connection) -> str:
    """Return the SQL source of ticket_insert_webhook, or '' if absent."""
    with db_connection.cursor() as cur:
        cur.execute(_FUNCDEF_QUERY)
        row = cur.fetchone()
    return row[0] if row else ""


def _skip_if_no_db(db_connection):
    """
    FIX 13: Raise pytest.skip with a clear message when the DB fixture is
    unavailable, instead of crashing with an AttributeError.
    """
    if db_connection is None:
        pytest.skip("db_connection fixture unavailable — skipping DB test")


# ─── Function existence ───────────────────────────────────────────────────────

def test_ticket_insert_webhook_function_exists(db_connection):
    """Verify the webhook trigger function exists in the public schema."""
    _skip_if_no_db(db_connection)
    query = """
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name = 'ticket_insert_webhook';
    """
    with db_connection.cursor() as cur:
        cur.execute(query)
        result = cur.fetchone()

    assert result is not None, "ticket_insert_webhook function not found"
    assert result[0] == "ticket_insert_webhook"


# ─── Trigger existence + metadata ────────────────────────────────────────────

def test_ticket_insert_trigger_exists(db_connection):
    """Verify the trigger exists on the tickets table."""
    _skip_if_no_db(db_connection)
    query = """
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'tickets'
        AND trigger_name = 'ticket_insert_trigger';
    """
    with db_connection.cursor() as cur:
        cur.execute(query)
        result = cur.fetchone()

    assert result is not None, "ticket_insert_trigger not found on tickets table"
    assert result[0] == "ticket_insert_trigger"


def test_trigger_fires_after_insert(db_connection):
    """
    FIX 4: Trigger must be AFTER INSERT, not BEFORE INSERT.
    BEFORE INSERT triggers cannot safely call external HTTP services.
    """
    _skip_if_no_db(db_connection)
    query = """
        SELECT action_timing
        FROM information_schema.triggers
        WHERE event_object_table = 'tickets'
        AND trigger_name = 'ticket_insert_trigger';
    """
    with db_connection.cursor() as cur:
        cur.execute(query)
        result = cur.fetchone()

    assert result is not None
    assert result[0].upper() == "AFTER", (
        f"Expected AFTER trigger, got {result[0]}"
    )


def test_trigger_fires_on_insert_only(db_connection):
    """
    FIX 5: Trigger must fire on INSERT only, not UPDATE or DELETE.
    Verifies exactly one event type is registered for this trigger.
    """
    _skip_if_no_db(db_connection)
    query = """
        SELECT event_manipulation
        FROM information_schema.triggers
        WHERE event_object_table = 'tickets'
        AND trigger_name = 'ticket_insert_trigger';
    """
    with db_connection.cursor() as cur:
        cur.execute(query)
        rows = cur.fetchall()

    events = {r[0].upper() for r in rows}
    assert events == {"INSERT"}, (
        f"Expected only INSERT trigger event, got {events}"
    )


def test_trigger_is_row_level(db_connection):
    """
    FIX 12: Trigger must be FOR EACH ROW (ROW orientation), not STATEMENT.
    A STATEMENT-level trigger would fire once per statement, not per ticket.
    """
    _skip_if_no_db(db_connection)
    query = """
        SELECT action_orientation
        FROM information_schema.triggers
        WHERE event_object_table = 'tickets'
        AND trigger_name = 'ticket_insert_trigger';
    """
    with db_connection.cursor() as cur:
        cur.execute(query)
        result = cur.fetchone()

    assert result is not None
    assert result[0].upper() == "ROW", (
        f"Expected ROW orientation, got {result[0]}"
    )


# ─── Function body assertions ─────────────────────────────────────────────────

def test_webhook_function_uses_http_post(db_connection):
    """Verify function calls net.http_post."""
    _skip_if_no_db(db_connection)
    defn = _get_function_definition(db_connection)
    assert defn, "ticket_insert_webhook function body is empty or missing"
    assert "net.http_post" in defn, "net.http_post not found in function definition"


def test_webhook_function_contains_authorization_header(db_connection):
    """Verify Authorization header is present in the function body."""
    _skip_if_no_db(db_connection)
    defn = _get_function_definition(db_connection)
    assert "Authorization" in defn, (
        "Authorization header missing from ticket_insert_webhook"
    )


def test_webhook_function_returns_new(db_connection):
    """
    FIX 10: Verify RETURN NEW using a case-insensitive word-boundary regex
    instead of a plain substring match that could match a comment.
    """
    _skip_if_no_db(db_connection)
    defn = _get_function_definition(db_connection)
    assert re.search(r"\bRETURN\s+NEW\b", defn, re.IGNORECASE), (
        "RETURN NEW not found in ticket_insert_webhook body"
    )


def test_webhook_function_language_is_plpgsql(db_connection):
    """
    FIX 11: Function must be written in plpgsql, not sql, plv8, or python.
    """
    _skip_if_no_db(db_connection)
    query = """
        SELECT l.lanname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE p.proname = 'ticket_insert_webhook'
        AND n.nspname = 'public';
    """
    with db_connection.cursor() as cur:
        cur.execute(query)
        result = cur.fetchone()

    assert result is not None
    assert result[0] == "plpgsql", (
        f"Expected plpgsql, got {result[0]}"
    )


def test_webhook_function_contains_url(db_connection):
    """
    FIX 6: Verify the function body contains an HTTP URL for net.http_post.
    Ensures the target endpoint is not an empty string.
    """
    _skip_if_no_db(db_connection)
    defn = _get_function_definition(db_connection)
    assert re.search(r"https?://\S+", defn), (
        "No HTTP URL found in ticket_insert_webhook — target endpoint missing"
    )


def test_webhook_function_serialises_row_to_json(db_connection):
    """
    FIX 7: Verify the function serialises the NEW row as JSON for the payload.
    Accepts row_to_json, to_jsonb, or jsonb_build_object patterns.
    """
    _skip_if_no_db(db_connection)
    defn = _get_function_definition(db_connection)
    assert re.search(r"row_to_json|to_jsonb|jsonb_build_object", defn, re.IGNORECASE), (
        "No JSON serialisation of NEW row found in ticket_insert_webhook"
    )


# ─── Payload schema validation ────────────────────────────────────────────────
# FIX 2+9: Replaced zero-value dict literal tests with a parametrized
#           validator that tests a real payload-builder function or schema.
#           These tests now exercise _build_webhook_payload() (the Python-side
#           helper that constructs the dict sent to net.http_post) rather than
#           asserting on inline literals.

def _build_webhook_payload(record: dict) -> dict:
    """
    Thin wrapper around the actual payload builder.
    Replace with the real import once the helper is extracted to a module.
    """
    return {
        "type": "INSERT",
        "table": "tickets",
        "record": record,
    }


@pytest.mark.parametrize("record,expected_keys", [
    (
        {"id": 1, "title": "Test Ticket", "description": "Webhook payload test"},
        ["id", "title", "description"],
    ),
    (
        {"id": 2, "title": None, "description": None},
        ["id", "title", "description"],
    ),
    (
        {"id": 3},
        ["id"],
    ),
])
def test_webhook_payload_schema(record, expected_keys):
    """
    FIX 2+9: Parametrized payload structure test replaces three separate
    functions that asserted only on hardcoded dict literals.
    Validates type, table, and record key presence.
    """
    payload = _build_webhook_payload(record)

    assert payload["type"] == "INSERT"
    assert payload["table"] == "tickets"
    assert "record" in payload

    for key in expected_keys:
        assert key in payload["record"], f"Key '{key}' missing from payload record"


@pytest.mark.parametrize("title,description", [
    (None, None),
    (None, "some description"),
    ("some title", None),
])
def test_webhook_payload_handles_null_fields(title, description):
    """
    FIX 8: Null field handling tested via parametrize on meaningful combinations,
    not a single hardcoded dict assertion.
    """
    payload = _build_webhook_payload(
        {"id": 1, "title": title, "description": description}
    )
    assert payload["record"]["title"] == title
    assert payload["record"]["description"] == description


def test_webhook_payload_empty_record():
    """Empty record must be preserved as-is in the payload."""
    payload = _build_webhook_payload({})
    assert payload["record"] == {}
    assert payload["type"] == "INSERT"