"""
API Token Manager — HelpDesk.AI
Handles token generation, hashing, expiry enforcement, and revocation.
Tokens are stored as SHA-256 hashes; the plaintext is shown only once.
"""
from __future__ import annotations

import hashlib
import ipaddress
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from backend.models.api_token import (
    APITokenCreatedResponse,
    APITokenResponse,
    APITokenUsageSummary,
    VALID_SCOPES,
)

# Raw token format:  hd_<32-hex-chars>
_TOKEN_PREFIX_CHARS = "hd_"
_SECRET_BYTES = 32


def _generate_raw_token() -> str:
    return _TOKEN_PREFIX_CHARS + secrets.token_hex(_SECRET_BYTES)


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def _token_prefix(raw: str) -> str:
    """Return first 8 display characters (excludes the 'hd_' prefix byte)."""
    return raw[:11]  # e.g. hd_a1b2c3d4


def _normalize_ip(ip_str: str) -> str:
    """Validate and normalise a single IP or CIDR block."""
    ip_str = ip_str.strip()
    try:
        ipaddress.ip_network(ip_str, strict=False)
    except ValueError as exc:
        raise ValueError(f"Invalid IP/CIDR: {ip_str!r}") from exc
    return ip_str


def _ip_in_allowlist(remote_ip: str, allowed_ips: List[str]) -> bool:
    """Return True if *remote_ip* matches any entry in *allowed_ips*."""
    if not allowed_ips:
        return True  # No restriction — all IPs allowed.
    try:
        addr = ipaddress.ip_address(remote_ip)
    except ValueError:
        return False
    for entry in allowed_ips:
        try:
            if addr in ipaddress.ip_network(entry, strict=False):
                return True
        except ValueError:
            continue
    return False


class TokenManager:
    """Encapsulates all token lifecycle operations against Supabase."""

    def __init__(self, supabase_client) -> None:
        self._db = supabase_client

    # ------------------------------------------------------------------
    # Creation
    # ------------------------------------------------------------------

    def create_token(
        self,
        *,
        owner_id: str,
        company_id: str,
        name: str,
        scopes: List[str],
        expires_in_days: int = 90,
        allowed_ips: Optional[List[str]] = None,
    ) -> APITokenCreatedResponse:
        """Generate a new API token, persist the hash, and return the plaintext once."""
        # Validate scopes
        invalid = [s for s in scopes if s not in VALID_SCOPES]
        if invalid:
            raise ValueError(f"Unrecognised scopes: {invalid}")

        # Validate IP allowlist entries
        normalised_ips: List[str] = []
        for ip in (allowed_ips or []):
            normalised_ips.append(_normalize_ip(ip))

        raw = _generate_raw_token()
        token_hash = _hash_token(raw)
        prefix = _token_prefix(raw)
        expires_at = (datetime.now(timezone.utc) + timedelta(days=expires_in_days)).isoformat()

        row = {
            "id": str(uuid.uuid4()),
            "name": name,
            "token_hash": token_hash,
            "token_prefix": prefix,
            "owner_id": owner_id,
            "company_id": company_id,
            "scopes": scopes,
            "status": "active",
            "expires_at": expires_at,
            "allowed_ips": normalised_ips,
        }

        self._db.table("api_tokens").insert(row).execute()
        self._audit(
            token_id=row["id"],
            company_id=company_id,
            actor_id=owner_id,
            event_type="created",
            metadata={"name": name, "scopes": scopes, "expires_at": expires_at},
        )

        return APITokenCreatedResponse(
            id=row["id"],
            name=name,
            token_prefix=prefix,
            scopes=scopes,
            status="active",
            expires_at=expires_at,
            allowed_ips=normalised_ips,
            last_used_at=None,
            last_used_ip=None,
            created_at=datetime.now(timezone.utc).isoformat(),
            raw_token=raw,
        )

    # ------------------------------------------------------------------
    # Listing
    # ------------------------------------------------------------------

    def list_tokens(self, *, company_id: str) -> List[APITokenResponse]:
        """Return all tokens for a company, excluding the hash."""
        res = (
            self._db.table("api_tokens")
            .select(
                "id, name, token_prefix, scopes, status, expires_at, "
                "allowed_ips, last_used_at, last_used_ip, created_at"
            )
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .execute()
        )
        return [APITokenResponse(**row) for row in (res.data or [])]

    # ------------------------------------------------------------------
    # Revocation
    # ------------------------------------------------------------------

    def revoke_token(self, *, token_id: str, company_id: str, revoked_by: str, reason: Optional[str] = None) -> None:
        """Immediately revoke a token."""
        now = datetime.now(timezone.utc).isoformat()
        self._db.table("api_tokens").update({
            "status": "revoked",
            "revoked_at": now,
            "revoked_by": revoked_by,
        }).eq("id", token_id).eq("company_id", company_id).execute()

        self._audit(
            token_id=token_id,
            company_id=company_id,
            actor_id=revoked_by,
            event_type="revoked",
            metadata={"reason": reason or ""},
        )

    # ------------------------------------------------------------------
    # Rotation
    # ------------------------------------------------------------------

    def rotate_token(
        self,
        *,
        token_id: str,
        company_id: str,
        owner_id: str,
        expires_in_days: int = 90,
    ) -> APITokenCreatedResponse:
        """Revoke the existing token and issue a replacement with the same scopes."""
        existing_res = (
            self._db.table("api_tokens")
            .select("name, scopes, allowed_ips")
            .eq("id", token_id)
            .eq("company_id", company_id)
            .single()
            .execute()
        )
        if not existing_res.data:
            raise ValueError("Token not found or access denied.")

        existing = existing_res.data
        self.revoke_token(
            token_id=token_id,
            company_id=company_id,
            revoked_by=owner_id,
            reason="rotated",
        )

        new_token = self.create_token(
            owner_id=owner_id,
            company_id=company_id,
            name=existing["name"],
            scopes=existing["scopes"],
            expires_in_days=expires_in_days,
            allowed_ips=existing.get("allowed_ips") or [],
        )

        self._audit(
            token_id=new_token.id,
            company_id=company_id,
            actor_id=owner_id,
            event_type="rotated",
            metadata={"replaced_token_id": token_id},
        )

        return new_token

    # ------------------------------------------------------------------
    # Validation (called by middleware)
    # ------------------------------------------------------------------

    def validate_token(
        self,
        *,
        raw_token: str,
        required_scope: str,
        remote_ip: str,
    ) -> Optional[dict]:
        """
        Authenticate an inbound API token.

        Returns the token row on success, or None on any failure.
        Also records the usage event and updates last_used metadata.
        """
        token_hash = _hash_token(raw_token)
        now = datetime.now(timezone.utc)

        res = (
            self._db.table("api_tokens")
            .select("id, company_id, owner_id, scopes, status, expires_at, allowed_ips")
            .eq("token_hash", token_hash)
            .single()
            .execute()
        )
        token = res.data if res and res.data else None
        if not token:
            return None

        # Status check
        if token["status"] != "active":
            return None

        # Expiry check
        if token.get("expires_at"):
            expiry = datetime.fromisoformat(token["expires_at"])
            if now >= expiry:
                # Mark expired in DB
                self._db.table("api_tokens").update({"status": "expired"}).eq("id", token["id"]).execute()
                self._audit(
                    token_id=token["id"],
                    company_id=token["company_id"],
                    actor_id=None,
                    event_type="expired",
                    metadata={},
                )
                return None

        # IP allowlist check
        if not _ip_in_allowlist(remote_ip, token.get("allowed_ips") or []):
            self._audit(
                token_id=token["id"],
                company_id=token["company_id"],
                actor_id=None,
                event_type="ip_blocked",
                metadata={"remote_ip": remote_ip},
            )
            return None

        # Scope check
        if required_scope not in token["scopes"]:
            self._audit(
                token_id=token["id"],
                company_id=token["company_id"],
                actor_id=None,
                event_type="scope_denied",
                metadata={"required": required_scope, "granted": token["scopes"]},
            )
            return None

        # Update last-used metadata
        self._db.table("api_tokens").update({
            "last_used_at": now.isoformat(),
            "last_used_ip": remote_ip,
        }).eq("id", token["id"]).execute()

        return token

    # ------------------------------------------------------------------
    # Usage statistics
    # ------------------------------------------------------------------

    def get_usage_summary(self, *, token_id: str, company_id: str) -> APITokenUsageSummary:
        """Return aggregated usage metrics for a single token."""
        res = (
            self._db.table("api_token_usage")
            .select("endpoint, status_code, created_at, ip_address")
            .eq("token_id", token_id)
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .limit(1000)
            .execute()
        )
        rows = res.data or []

        now = datetime.now(timezone.utc)
        cutoff_24h = (now - timedelta(hours=24)).isoformat()
        cutoff_7d = (now - timedelta(days=7)).isoformat()

        total = len(rows)
        last_24h = sum(1 for r in rows if r["created_at"] >= cutoff_24h)
        last_7d = sum(1 for r in rows if r["created_at"] >= cutoff_7d)
        errors = sum(1 for r in rows if r["status_code"] >= 400)

        endpoint_counts: dict = {}
        for r in rows:
            endpoint_counts[r["endpoint"]] = endpoint_counts.get(r["endpoint"], 0) + 1

        top_endpoints = sorted(
            [{"endpoint": k, "count": v} for k, v in endpoint_counts.items()],
            key=lambda x: x["count"],
            reverse=True,
        )[:5]

        # Grab last-used data from tokens table
        token_res = (
            self._db.table("api_tokens")
            .select("last_used_at, last_used_ip")
            .eq("id", token_id)
            .single()
            .execute()
        )
        token_meta = token_res.data or {}

        return APITokenUsageSummary(
            total_requests=total,
            requests_last_24h=last_24h,
            requests_last_7d=last_7d,
            top_endpoints=top_endpoints,
            error_rate=round(errors / total, 4) if total else 0.0,
            last_used_at=token_meta.get("last_used_at"),
            last_used_ip=token_meta.get("last_used_ip"),
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _audit(
        self,
        *,
        token_id: Optional[str],
        company_id: str,
        actor_id: Optional[str],
        event_type: str,
        metadata: dict,
    ) -> None:
        """Persist a structured audit event. Failures are non-fatal."""
        try:
            self._db.table("api_token_audit").insert({
                "token_id": token_id,
                "company_id": company_id,
                "actor_id": actor_id,
                "event_type": event_type,
                "metadata": metadata,
            }).execute()
        except Exception as exc:
            logger.warning("[TokenManager] Audit write failed (non-fatal): %s", exc)

    def record_usage(
        self,
        *,
        token_id: str,
        company_id: str,
        endpoint: str,
        method: str,
        status_code: int,
        ip_address: Optional[str],
        response_ms: Optional[int],
    ) -> None:
        """Log a single API request attributed to this token. Failures are non-fatal."""
        try:
            self._db.table("api_token_usage").insert({
                "token_id": token_id,
                "company_id": company_id,
                "endpoint": endpoint,
                "method": method,
                "status_code": status_code,
                "ip_address": ip_address,
                "response_ms": response_ms,
            }).execute()
        except Exception as exc:
            logger.warning("[TokenManager] Usage write failed (non-fatal): %s", exc)
