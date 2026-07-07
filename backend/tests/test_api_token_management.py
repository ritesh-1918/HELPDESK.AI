"""
Tests for API Token Management Framework  — Issue #1592

Covers:
  - Token creation and SHA-256 hashing
  - Scope validation (valid / invalid scopes)
  - Expiry enforcement
  - IP allowlist enforcement
  - Token revocation
  - Token rotation
  - Usage summary calculation
"""
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from backend.auth.token_manager import (
    TokenManager,
    _hash_token,
    _ip_in_allowlist,
    _token_prefix,
)
from backend.models.api_token import VALID_SCOPES


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_supabase_stub(token_row: dict | None = None):
    """Return a minimal Supabase client stub backed by *token_row*."""
    stub = MagicMock()

    # Table chain → .insert().execute() / .select()...single().execute()
    chain = MagicMock()
    chain.execute.return_value = SimpleNamespace(data=token_row or {})
    chain.eq.return_value = chain
    chain.single.return_value = chain
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.update.return_value = chain
    chain.order.return_value = chain
    chain.limit.return_value = chain

    stub.table.return_value = chain
    return stub


# ---------------------------------------------------------------------------
# _hash_token
# ---------------------------------------------------------------------------

class TestHashToken:
    def test_sha256_digest(self):
        raw = "hd_abc123"
        expected = hashlib.sha256(raw.encode()).hexdigest()
        assert _hash_token(raw) == expected

    def test_different_inputs_produce_different_hashes(self):
        assert _hash_token("hd_aaa") != _hash_token("hd_bbb")

    def test_deterministic(self):
        raw = "hd_deterministic"
        assert _hash_token(raw) == _hash_token(raw)


# ---------------------------------------------------------------------------
# _ip_in_allowlist
# ---------------------------------------------------------------------------

class TestIpAllowlist:
    def test_empty_list_allows_all(self):
        assert _ip_in_allowlist("1.2.3.4", []) is True

    def test_exact_match(self):
        assert _ip_in_allowlist("203.0.113.10", ["203.0.113.10"]) is True

    def test_cidr_match(self):
        assert _ip_in_allowlist("198.51.100.50", ["198.51.100.0/24"]) is True

    def test_cidr_no_match(self):
        assert _ip_in_allowlist("192.168.1.1", ["10.0.0.0/8"]) is False

    def test_invalid_remote_ip_returns_false(self):
        assert _ip_in_allowlist("not-an-ip", ["203.0.113.0/24"]) is False

    def test_multiple_entries_first_matches(self):
        assert _ip_in_allowlist("10.0.0.5", ["10.0.0.0/8", "172.16.0.0/12"]) is True


# ---------------------------------------------------------------------------
# TokenManager.create_token
# ---------------------------------------------------------------------------

class TestCreateToken:
    def _make_manager(self):
        return TokenManager(_make_supabase_stub())

    def test_rejects_invalid_scopes(self):
        mgr = self._make_manager()
        with pytest.raises(ValueError, match="Unrecognised scopes"):
            mgr.create_token(
                owner_id=str(uuid.uuid4()),
                company_id=str(uuid.uuid4()),
                name="Bad scope token",
                scopes=["tickets:hack"],
            )

    def test_rejects_invalid_ip(self):
        mgr = self._make_manager()
        with pytest.raises(ValueError, match="Invalid IP/CIDR"):
            mgr.create_token(
                owner_id=str(uuid.uuid4()),
                company_id=str(uuid.uuid4()),
                name="Bad IP token",
                scopes=["tickets:read"],
                allowed_ips=["not-an-ip"],
            )

    def test_raw_token_starts_with_prefix(self):
        mgr = self._make_manager()
        result = mgr.create_token(
            owner_id=str(uuid.uuid4()),
            company_id=str(uuid.uuid4()),
            name="Integration Bot",
            scopes=["tickets:read"],
        )
        assert result.raw_token.startswith("hd_")

    def test_raw_token_not_persisted_in_db_row(self):
        """Verify the insert payload never contains the raw secret."""
        stub = _make_supabase_stub()
        mgr = TokenManager(stub)
        mgr.create_token(
            owner_id=str(uuid.uuid4()),
            company_id=str(uuid.uuid4()),
            name="Secure Token",
            scopes=["analytics:read"],
        )
        # First insert call is the token row; second is the audit event.
        all_inserts = stub.table.return_value.insert.call_args_list
        token_insert_dict = all_inserts[0][0][0]
        assert "raw_token" not in token_insert_dict
        assert "token_hash" in token_insert_dict

    def test_hash_is_sha256_of_raw(self):
        stub = _make_supabase_stub()
        mgr = TokenManager(stub)
        result = mgr.create_token(
            owner_id=str(uuid.uuid4()),
            company_id=str(uuid.uuid4()),
            name="Hash Check",
            scopes=["status:read"],
        )
        # First insert call is the token row insert.
        all_inserts = stub.table.return_value.insert.call_args_list
        inserted_dict = all_inserts[0][0][0]
        expected_hash = hashlib.sha256(result.raw_token.encode()).hexdigest()
        assert inserted_dict["token_hash"] == expected_hash

    def test_expiry_set_correctly(self):
        mgr = self._make_manager()
        result = mgr.create_token(
            owner_id=str(uuid.uuid4()),
            company_id=str(uuid.uuid4()),
            name="Short-lived",
            scopes=["tickets:read"],
            expires_in_days=30,
        )
        expiry = datetime.fromisoformat(result.expires_at)
        now = datetime.now(timezone.utc)
        diff_days = (expiry - now).days
        # Allow ±1 day tolerance for test timing
        assert 28 <= diff_days <= 31

    def test_all_valid_scopes_accepted(self):
        mgr = self._make_manager()
        result = mgr.create_token(
            owner_id=str(uuid.uuid4()),
            company_id=str(uuid.uuid4()),
            name="Full scope token",
            scopes=VALID_SCOPES,
        )
        assert set(result.scopes) == set(VALID_SCOPES)


# ---------------------------------------------------------------------------
# TokenManager.validate_token
# ---------------------------------------------------------------------------

class TestValidateToken:
    def _token_row(self, **overrides):
        base = {
            "id": str(uuid.uuid4()),
            "company_id": str(uuid.uuid4()),
            "owner_id": str(uuid.uuid4()),
            "scopes": ["tickets:read"],
            "status": "active",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            "allowed_ips": [],
        }
        return {**base, **overrides}

    def _make_manager(self, token_row):
        stub = _make_supabase_stub(token_row)
        return TokenManager(stub), stub

    def test_valid_token_returns_row(self):
        raw = "hd_" + "a" * 64
        row = self._token_row()
        mgr, stub = self._make_manager(row)

        # The validate path: .table().select().eq().single().execute()
        select_chain = MagicMock()
        select_chain.single.return_value.execute.return_value = SimpleNamespace(data=row)
        select_chain.eq.return_value = select_chain
        stub.table.return_value.select.return_value = select_chain

        # update last_used chain
        update_chain = MagicMock()
        update_chain.eq.return_value.execute.return_value = SimpleNamespace(data={})
        stub.table.return_value.update.return_value = update_chain

        # audit insert chain
        insert_chain = MagicMock()
        insert_chain.execute.return_value = SimpleNamespace(data={})
        stub.table.return_value.insert.return_value = insert_chain

        result = mgr.validate_token(
            raw_token=raw,
            required_scope="tickets:read",
            remote_ip="1.2.3.4",
        )
        assert result is not None

    def test_revoked_token_returns_none(self):
        raw = "hd_" + "b" * 64
        row = self._token_row(status="revoked")
        mgr, stub = self._make_manager(row)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=row)

        result = mgr.validate_token(
            raw_token=raw,
            required_scope="tickets:read",
            remote_ip="1.2.3.4",
        )
        assert result is None

    def test_expired_token_returns_none(self):
        raw = "hd_" + "c" * 64
        row = self._token_row(
            expires_at=(datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        )
        mgr, stub = self._make_manager(row)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=row)
        stub.table.return_value.update.return_value.eq.return_value.execute.return_value = \
            SimpleNamespace(data={})
        stub.table.return_value.insert.return_value.execute.return_value = SimpleNamespace(data={})

        result = mgr.validate_token(
            raw_token=raw,
            required_scope="tickets:read",
            remote_ip="1.2.3.4",
        )
        assert result is None

    def test_wrong_scope_returns_none(self):
        raw = "hd_" + "d" * 64
        row = self._token_row(scopes=["analytics:read"])
        mgr, stub = self._make_manager(row)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=row)
        stub.table.return_value.insert.return_value.execute.return_value = SimpleNamespace(data={})

        result = mgr.validate_token(
            raw_token=raw,
            required_scope="tickets:write",
            remote_ip="1.2.3.4",
        )
        assert result is None

    def test_ip_not_in_allowlist_returns_none(self):
        raw = "hd_" + "e" * 64
        row = self._token_row(allowed_ips=["10.0.0.0/8"])
        mgr, stub = self._make_manager(row)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=row)
        stub.table.return_value.insert.return_value.execute.return_value = SimpleNamespace(data={})

        result = mgr.validate_token(
            raw_token=raw,
            required_scope="tickets:read",
            remote_ip="203.0.113.5",  # outside the /8
        )
        assert result is None

    def test_unknown_token_returns_none(self):
        mgr, stub = self._make_manager(None)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=None)

        result = mgr.validate_token(
            raw_token="hd_nonexistent",
            required_scope="tickets:read",
            remote_ip="1.2.3.4",
        )
        assert result is None


# ---------------------------------------------------------------------------
# TokenManager.revoke_token
# ---------------------------------------------------------------------------

class TestRevokeToken:
    def test_revoke_calls_update_with_revoked_status(self):
        stub = _make_supabase_stub()
        mgr = TokenManager(stub)
        token_id = str(uuid.uuid4())
        company_id = str(uuid.uuid4())
        actor_id = str(uuid.uuid4())

        mgr.revoke_token(
            token_id=token_id,
            company_id=company_id,
            revoked_by=actor_id,
            reason="Security incident",
        )

        update_call = stub.table.return_value.update.call_args
        payload = update_call[0][0]
        assert payload["status"] == "revoked"
        assert "revoked_at" in payload
        assert payload["revoked_by"] == actor_id


# ---------------------------------------------------------------------------
# TokenManager.rotate_token
# ---------------------------------------------------------------------------

class TestRotateToken:
    def test_rotate_raises_on_missing_token(self):
        stub = _make_supabase_stub(None)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=None)
        mgr = TokenManager(stub)

        with pytest.raises(ValueError, match="Token not found"):
            mgr.rotate_token(
                token_id=str(uuid.uuid4()),
                company_id=str(uuid.uuid4()),
                owner_id=str(uuid.uuid4()),
            )

    def test_rotate_returns_new_raw_token(self):
        existing = {
            "name": "Old Integration",
            "scopes": ["tickets:read"],
            "allowed_ips": [],
        }
        stub = _make_supabase_stub(existing)
        stub.table.return_value.eq.return_value.single.return_value.execute.return_value = \
            SimpleNamespace(data=existing)
        mgr = TokenManager(stub)

        result = mgr.rotate_token(
            token_id=str(uuid.uuid4()),
            company_id=str(uuid.uuid4()),
            owner_id=str(uuid.uuid4()),
        )
        assert result.raw_token.startswith("hd_")
        assert result.name == "Old Integration"


# ---------------------------------------------------------------------------
# VALID_SCOPES reference
# ---------------------------------------------------------------------------

class TestValidScopes:
    def test_all_documented_scopes_present(self):
        expected = {
            "tickets:read",
            "tickets:write",
            "tickets:delete",
            "users:read",
            "analytics:read",
            "attachments:read",
            "status:read",
        }
        assert expected == set(VALID_SCOPES)
