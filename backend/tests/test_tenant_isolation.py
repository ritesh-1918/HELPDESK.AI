"""
Unit tests for tenant isolation scope resolution (issue #3900).

Run with:  python -m unittest backend.tests.test_tenant_isolation -v
"""

import unittest

from fastapi import HTTPException
from starlette.requests import Request


def _make_request(headers: dict | None = None) -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/tickets",
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


class ResolveTenantIdTests(unittest.TestCase):
    def test_company_id_query_param_wins(self):
        request = _make_request({"X-Company-Id": "header-company"})
        self.assertEqual(resolve_tenant_id(request, "acme"), "acme")

    def test_header_used_when_no_query_param(self):
        request = _make_request({"X-Company-Id": "acme"})
        self.assertEqual(resolve_tenant_id(request), "acme")

    def test_none_when_nothing_supplied(self):
        request = _make_request()
        self.assertIsNone(resolve_tenant_id(request))

    def test_blank_values_ignored(self):
        request = _make_request({"X-Company-Id": "   "})
        self.assertIsNone(resolve_tenant_id(request, "   "))


class RequireTenantTests(unittest.TestCase):
    def test_returns_resolved_tenant(self):
        request = _make_request({"X-Company-Id": "acme"})
        self.assertEqual(require_tenant(request), "acme")

    def test_raises_403_without_scope(self):
        request = _make_request()
        with self.assertRaises(HTTPException) as ctx:
            require_tenant(request)
        self.assertEqual(ctx.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
