"""
Security audit logging (issue #3906).

Privilege-sensitive operations (admin role updates, user login elevation)
persist a detailed audit record capturing the acting operator, the target
user, and request metadata. Writes are deliberately non-blocking: an audit
insert failure is logged but never fails the originating request.

Run with:  python -m unittest backend.tests.test_audit_log -v
"""

import datetime
import json
import logging

logger = logging.getLogger(__name__)

AUDIT_TABLE = "audit_logs"

PRIVILEGE_ACTIONS = ("privilege.elevation", "privilege.revocation", "role.update")


def build_audit_payload(
    *,
    actor_id: str,
    actor_role: str,
    action: str,
    target_user_id: str | None = None,
    target_role: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    meta: dict | None = None,
) -> dict:
    """
    Assemble the normalized audit record. ``meta`` is serialized to JSON so
    arbitrary context (previous role, changed fields) is preserved.
    """
    return {
        "actor_id": actor_id,
        "actor_role": actor_role,
        "action": action,
        "target_user_id": target_user_id,
        "target_role": target_role,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "meta": json.dumps(meta) if meta else None,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
    }


def log_privilege_change(
    supabase,
    *,
    actor_id: str,
    actor_role: str,
    target_user_id: str,
    target_role: str,
    action: str = "privilege.elevation",
    ip_address: str | None = None,
    user_agent: str | None = None,
    meta: dict | None = None,
) -> None:
    """
    Record a privilege change on ``target_user_id`` performed by ``actor_id``.

    Never raises: if the audit insert fails, the error is logged and the
    request continues (security logging must not be a single point of failure).
    """
    if action not in PRIVILEGE_ACTIONS:
        action = "privilege.elevation"
    if supabase is None:
        logger.warning("[AuditLog] Supabase unavailable; audit event dropped")
        return

    payload = build_audit_payload(
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        target_user_id=target_user_id,
        target_role=target_role,
        ip_address=ip_address,
        user_agent=user_agent,
        meta=meta,
    )
    try:
        supabase.table(AUDIT_TABLE).insert(payload).execute()
    except Exception as exc:  # noqa: BLE001 - audit must never break the request
        logger.warning("[AuditLog] Failed to persist audit event: %s", exc)
