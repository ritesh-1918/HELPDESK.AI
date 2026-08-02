"""
Unit tests for the rate-limiting middleware (issue #3950).

Validates that sensitive endpoints (auth + ticket creation) are capped at
their configured budgets, that the 429 response carries a Retry-After header,
and that the client-IP key honors proxy headers (X-Forwarded-For).

The tests build a minimal FastAPI app around the shared limiter machinery so
they run without importing the ML model stack.

Run with:  python -m unittest backend.tests.test_rate_limit -v
"""

import unittest

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from slowapi.errors import RateLimitExceeded

from backend.rate_limit import (
    AUTH_LOGIN_LIMIT,
    TICKET_CREATE_LIMIT,
    build_limiter,
    client_ip_key,
    rate_limit_exceeded_handler,
)


class RateLimitAppTests(unittest.TestCase):
    def setUp(self):
        self.limiter = build_limiter()
        self.app = FastAPI()
        self.app.state.limiter = self.limiter
        self.app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

        @self.app.post("/auth/login")
        @self.limiter.limit(AUTH_LOGIN_LIMIT)
        async def login(request: Request):
            return {"ok": True}

        @self.app.post("/tickets")
        @self.limiter.limit(TICKET_CREATE_LIMIT)
        async def create_ticket(request: Request):
            return {"ok": True}

        self.client = TestClient(self.app)

    def test_login_limited_to_five_per_minute(self):
        statuses = [self.client.post("/auth/login").status_code for _ in range(6)]
        self.assertEqual(statuses[:5], [200] * 5)
        self.assertEqual(statuses[5], 429)

    def test_ticket_creation_limited_to_ten_per_minute(self):
        statuses = [self.client.post("/tickets").status_code for _ in range(11)]
        self.assertEqual(statuses[:10], [200] * 10)
        self.assertEqual(statuses[10], 429)

    def test_retry_after_header_and_json_body_on_429(self):
        for _ in range(5):
            self.client.post("/auth/login")
        resp = self.client.post("/auth/login")
        self.assertEqual(resp.status_code, 429)
        self.assertIn("Retry-After", resp.headers)
        self.assertTrue(int(resp.headers["Retry-After"]) >= 1)
        body = resp.json()
        self.assertIn("detail", body)
        self.assertGreaterEqual(int(body["retry_after"]), 1)

    def test_budgets_bucketed_per_x_forwarded_for_client(self):
        # The first client exhausts its budget...
        for _ in range(5):
            self.client.post("/auth/login", headers={"X-Forwarded-For": "203.0.113.10"})
        self.assertEqual(
            self.client.post("/auth/login", headers={"X-Forwarded-For": "203.0.113.10"}).status_code,
            429,
        )
        # ...but an independent client is unaffected.
        self.assertEqual(
            self.client.post("/auth/login", headers={"X-Forwarded-For": "198.51.100.42"}).status_code,
            200,
        )

    def test_x_forwarded_for_takes_first_entry(self):
        request = _FakeRequest(
            headers={"X-Forwarded-For": "10.0.0.1, 10.0.0.2, 10.0.0.3"},
            client=("198.51.100.99", 1234),
        )
        self.assertEqual(client_ip_key(request), "10.0.0.1")

    def test_client_ip_falls_back_to_real_ip(self):
        request = _FakeRequest(headers={"X-Real-IP": "192.0.2.7"})
        self.assertEqual(client_ip_key(request), "192.0.2.7")

    def test_client_ip_falls_back_to_socket(self):
        request = _FakeRequest(client=("198.51.100.99", 1234))
        self.assertEqual(client_ip_key(request), "198.51.100.99")


class _FakeHeaders:
    def __init__(self, **values):
        self._values = {k.lower(): v for k, v in values.items()}

    def get(self, key, default=None):
        return self._values.get(key.lower(), default)


class _FakeRequest:
    def __init__(self, headers=None, client=None):
        self.headers = _FakeHeaders(**(headers or {}))
        self.client = client


if __name__ == "__main__":
    unittest.main()
