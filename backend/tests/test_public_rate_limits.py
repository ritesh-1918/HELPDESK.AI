import functools
import importlib
import unittest
from unittest.mock import patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

import backend.main as main


class TestPublicEndpointRateLimits(unittest.TestCase):
    """Verify public endpoints are protected by the shared SlowAPI limiter."""

    def _reload_module_with_limit(self, module_path: str, limit_wrapper):
        original_limit = main.limiter.limit
        main.limiter.limit = limit_wrapper
        try:
            module = importlib.reload(importlib.import_module(module_path))
        finally:
            main.limiter.limit = original_limit
            importlib.reload(importlib.import_module(module_path))
        return module

    def test_translation_routes_are_limited(self):
        captured = {}

        def fake_limit(value):
            def decorator(func):
                captured[func.__name__] = value
                return func

            return decorator

        translation = self._reload_module_with_limit("backend.routes.translation", fake_limit)

        self.assertEqual(captured.get("translate"), "30/minute")
        self.assertEqual(captured.get("translate_ticket_endpoint"), "30/minute")
        self.assertEqual(captured.get("detect"), "30/minute")
        self.assertEqual(captured.get("list_languages"), "60/minute")
        self.assertIsNotNone(translation.router)

    def test_auth_routes_are_limited(self):
        captured = {}

        def fake_limit(value):
            def decorator(func):
                captured[func.__name__] = value
                return func

            return decorator

        auth = self._reload_module_with_limit("backend.auth_cookie", fake_limit)

        self.assertEqual(captured.get("auth_login"), "5/minute")
        self.assertEqual(captured.get("auth_signup"), "5/minute")
        self.assertEqual(captured.get("auth_logout"), "30/minute")
        self.assertEqual(captured.get("auth_me"), "60/minute")

    def test_voice_routes_are_limited(self):
        captured = {}

        def fake_limit(value):
            def decorator(func):
                captured[func.__name__] = value
                return func

            return decorator

        voice = self._reload_module_with_limit("backend.routes.voice", fake_limit)

        self.assertEqual(captured.get("transcribe_audio"), "20/minute")
        self.assertEqual(captured.get("create_ticket_from_voice"), "20/minute")

    def test_estimator_route_is_limited(self):
        captured = {}

        def fake_limit(value):
            def decorator(func):
                captured[func.__name__] = value
                return func

            return decorator

        estimator = self._reload_module_with_limit("backend.routes.estimator", fake_limit)

        self.assertEqual(captured.get("estimate"), "30/minute")

    def test_tag_suggest_route_is_limited(self):
        captured = {}

        def fake_limit(value):
            def decorator(func):
                captured[func.__name__] = value
                return func

            return decorator

        tags = self._reload_module_with_limit("backend.tag_router", fake_limit)

        self.assertEqual(captured.get("suggest_tags_endpoint"), "20/minute")

    def test_translation_detect_endpoint_returns_429_after_limit(self):
        def fake_limit(value):
            def decorator(func):
                @functools.wraps(func)
                async def wrapper(*args, **kwargs):
                    if wrapper.called:
                        raise HTTPException(status_code=429, detail="Too Many Requests")
                    wrapper.called = True
                    return await func(*args, **kwargs)

                wrapper.called = False
                return wrapper

            return decorator

        original_limit = main.limiter.limit
        main.limiter.limit = fake_limit
        try:
            translation = importlib.reload(importlib.import_module("backend.routes.translation"))
            app = FastAPI()
            app.include_router(translation.router)

            with patch("backend.routes.translation.detect_language", return_value="es"), \
                 patch("backend.routes.translation.get_supported_languages", return_value={"es": "Spanish"}):
                client = TestClient(app)
                first = client.post("/api/translation/detect", json={"text": "Hola mundo"})
                self.assertEqual(first.status_code, 200)

                second = client.post("/api/translation/detect", json={"text": "Hola mundo"})
                self.assertEqual(second.status_code, 429)
        finally:
            main.limiter.limit = original_limit
            importlib.reload(importlib.import_module("backend.routes.translation"))


if __name__ == "__main__":
    unittest.main()
