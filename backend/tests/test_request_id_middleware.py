"""
Unit tests for backend/middleware/request_id.py.
"""

import asyncio
import os
import sys
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.middleware.request_id import (
    RequestIDMiddleware,
    add_request_id_middleware,
    get_request_id,
    _new_request_id,
    REQUEST_ID_HEADER,
)


def _make_request(inbound_id=None):
    request = mock.MagicMock()
    request.headers = {}
    if inbound_id is not None:
        request.headers[REQUEST_ID_HEADER] = inbound_id
    # Use a real attribute for request.state
    class _State:
        pass
    request.state = _State()
    return request


def _make_response():
    response = mock.MagicMock()
    response.headers = {}
    return response


class TestNewRequestId(unittest.TestCase):
    def test_returns_string(self):
        self.assertIsInstance(_new_request_id(), str)

    def test_unique(self):
        ids = {_new_request_id() for _ in range(100)}
        self.assertEqual(len(ids), 100)

    def test_is_hex(self):
        rid = _new_request_id()
        # 32 char hex
        self.assertEqual(len(rid), 32)
        int(rid, 16)  # parses as hex


class TestGetRequestId(unittest.TestCase):
    def test_returns_existing(self):
        request = _make_request()
        request.state.request_id = "preset"
        self.assertEqual(get_request_id(request), "preset")

    def test_generates_if_missing(self):
        request = _make_request()
        rid = get_request_id(request)
        self.assertEqual(len(rid), 32)
        # Side effect: stored on state
        self.assertEqual(request.state.request_id, rid)


class TestAddMiddleware(unittest.TestCase):
    def test_adds_middleware(self):
        app = mock.MagicMock()
        add_request_id_middleware(app)
        self.assertEqual(app.add_middleware.call_count, 1)
        call = app.add_middleware.call_args
        self.assertEqual(call.args[0].__name__, "RequestIDMiddleware")


class TestMiddlewareDispatch(unittest.TestCase):
    def _run_dispatch(self, mw, request):
        async def call_next(_):
            return _make_response()

        return asyncio.run(mw.dispatch(request, call_next))

    def test_generates_id_when_no_inbound(self):
        mw = RequestIDMiddleware(mock.MagicMock())
        request = _make_request()
        response = self._run_dispatch(mw, request)
        # request.state.request_id was set
        self.assertEqual(len(request.state.request_id, ), 32)
        # response echoes the same id
        self.assertEqual(response.headers[REQUEST_ID_HEADER], request.state.request_id)

    def test_propagates_inbound_id(self):
        mw = RequestIDMiddleware(mock.MagicMock())
        request = _make_request(inbound_id="upstream-id-123")
        response = self._run_dispatch(mw, request)
        self.assertEqual(request.state.request_id, "upstream-id-123")
        self.assertEqual(response.headers[REQUEST_ID_HEADER], "upstream-id-123")

    def test_inbound_whitespace_stripped(self):
        # The middleware uses .strip() — verify behaviour via the request
        # headers that were set
        mw = RequestIDMiddleware(mock.MagicMock())
        request = _make_request(inbound_id="   ")
        response = self._run_dispatch(mw, request)
        # Whitespace is treated as missing; a new id is generated
        self.assertNotEqual(request.state.request_id.strip(), "")


if __name__ == "__main__":
    unittest.main()
