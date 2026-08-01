"""
Unit tests for role-based access control (issue #3911).

Run with:  python -m unittest backend.tests.test_rbac -v
"""

import unittest

from fastapi import HTTPException
from starlette.requests import Request

from backend.services.rbac import (
    ROLE_ADMIN,
    ROLE_AGENT,
    ROLE_EMPLOYEE,
    ROLE_HEADER,
    get_request_role,
    has_permission,
    normalize_role,
    require_roles,
)


def _make_request(headers: dict | None = None) -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [
            (k.lower().encode(), v.encode())
            for k, v in (headers or {}).items()
        ],
        "query_string": b"",
        "server": ("test", 80),
        "client": ("127.0.0.1", 5000),
        "scheme": "http",
    }
    return Request(scope)


class NormalizeRoleTests(unittest.TestCase):
    def test_normalizes_case(self):
        self.assertEqual(normalize_role("ADMIN"), "admin")

    def test_invalid_role_returns_none(self):
        self.assertIsNone(normalize_role("superuser"))

    def test_empty_returns_none(self):
        self.assertIsNone(normalize_role(""))


class GetRequestRoleTests(unittest.TestCase):
    def test_reads_role_header(self):
        request = _make_request({ROLE_HEADER: "agent"})
        self.assertEqual(get_request_role(request), "agent")

    def test_missing_header(self):
        request = _make_request()
        self.assertIsNone(get_request_role(request))

    def test_unknown_role_ignored(self):
        request = _make_request({ROLE_HEADER: "root"})
        self.assertIsNone(get_request_role(request))


class HasPermissionTests(unittest.TestCase):
    def test_matrix(self):
        self.assertTrue(has_permission("admin", "ticket.delete"))
        self.assertFalse(has_permission("agent", "ticket.delete"))
        self.assertTrue(has_permission("agent", "ticket.update"))
        self.assertFalse(has_permission("employee", "ticket.update"))
        self.assertTrue(has_permission("employee", "ticket.create"))

    def test_unknown_action(self):
        self.assertFalse(has_permission("admin", "nonexistent.action"))


class RequireRolesTests(unittest.TestCase):
    def test_allowed_role_passes(self):
        request = _make_request({ROLE_HEADER: "admin"})
        dependency = require_roles(ROLE_ADMIN, ROLE_AGENT)
        self.assertEqual(dependency(request), "admin")

    def test_disallowed_role_raises_403(self):
        request = _make_request({ROLE_HEADER: ROLE_EMPLOYEE})
        dependency = require_roles(ROLE_ADMIN, ROLE_AGENT)
        with self.assertRaises(HTTPException) as ctx:
            dependency(request)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_no_role_raises_401(self):
        request = _make_request()
        dependency = require_roles(ROLE_ADMIN)
        with self.assertRaises(HTTPException) as ctx:
            dependency(request)
        self.assertEqual(ctx.exception.status_code, 401)


if __name__ == "__main__":
    unittest.main()
