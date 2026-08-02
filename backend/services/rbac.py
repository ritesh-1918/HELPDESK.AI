"""
Role-based access control (issue #3911).

Enforces strict permissions for the three supported roles — ``admin``, ``agent``
and ``employee`` — at the endpoint level through FastAPI dependencies. The
caller's role is resolved from the ``X-User-Role`` header (set by the frontend
from the authenticated Supabase profile), normalized and checked against a
central permission matrix before the handler runs.

Run with:  python -m unittest backend.tests.test_rbac -v
"""

from __future__ import annotations

from fastapi import Depends, HTTPException, Request

ROLE_ADMIN = "admin"
ROLE_AGENT = "agent"
ROLE_EMPLOYEE = "employee"
ALL_ROLES = frozenset({ROLE_ADMIN, ROLE_AGENT, ROLE_EMPLOYEE})

ROLE_HEADER = "x-user-role"

# Central permission matrix: action -> roles allowed to perform it.
PERMISSIONS: dict[str, frozenset[str]] = {
    "ticket.read": frozenset({ROLE_ADMIN, ROLE_AGENT, ROLE_EMPLOYEE}),
    "ticket.create": frozenset({ROLE_ADMIN, ROLE_AGENT, ROLE_EMPLOYEE}),
    "ticket.update": frozenset({ROLE_ADMIN, ROLE_AGENT}),
    "ticket.assign": frozenset({ROLE_ADMIN, ROLE_AGENT}),
    "ticket.delete": frozenset({ROLE_ADMIN}),
    "admin.users.manage": frozenset({ROLE_ADMIN}),
    "reports.export": frozenset({ROLE_ADMIN}),
    "audit.read": frozenset({ROLE_ADMIN}),
}


def normalize_role(value: str | None) -> str | None:
    """Lower-case and validate a raw role value; returns None if invalid."""
    if not value:
        return None
    role = value.strip().lower()
    return role if role in ALL_ROLES else None


def get_request_role(request: Request) -> str | None:
    """Resolve the caller's role from the ``X-User-Role`` header."""
    return normalize_role(request.headers.get(ROLE_HEADER))


def has_permission(role: str | None, action: str) -> bool:
    """True when ``role`` is allowed to perform ``action``."""
    return role in PERMISSIONS.get(action, frozenset())


def require_roles(*required_roles: str):
    """
    Build a FastAPI dependency that requires any one of ``required_roles``.

    Raises 401 when the caller is unauthenticated and 403 when the role is
    present but not permitted.
    """

    def dependency(request: Request) -> str:
        role = get_request_role(request)
        if role is None:
            raise HTTPException(status_code=401, detail="Authentication required")
        if role not in required_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Requires one of roles: {', '.join(sorted(required_roles))}",
            )
        return role

    return dependency


def require_action(action: str):
    """
    Build a FastAPI dependency checking the permission matrix for ``action``.
    """

    def dependency(request: Request) -> str:
        role = get_request_role(request)
        if role is None:
            raise HTTPException(status_code=401, detail="Authentication required")
        if not has_permission(role, action):
            raise HTTPException(
                status_code=403,
                detail=f"Role '{role}' is not allowed to {action}",
            )
        return role

    return dependency


# Common pre-built dependencies.
require_admin = require_roles(ROLE_ADMIN)
require_agent_or_admin = require_roles(ROLE_ADMIN, ROLE_AGENT)
require_any_authenticated = require_roles(*ALL_ROLES)

require_admin_action = require_action("admin.users.manage")
