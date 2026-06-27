"""
Rate Limiting Middleware for HELPDESK.AI

Implements token bucket rate limiting per IP address.
Apply to auth routes (login, register, password-reset) and AI endpoints.
"""
import time
from collections import defaultdict
from threading import Lock
from typing import Callable


class RateLimiter:
    """Per-IP token bucket rate limiter."""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._buckets: dict = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, identifier: str) -> tuple[bool, int]:
        """
        Check if a request from `identifier` (IP or user ID) is allowed.

        Returns:
            (allowed: bool, retry_after_seconds: int)
        """
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            # Remove requests outside the window
            self._buckets[identifier] = [
                t for t in self._buckets[identifier] if t > window_start
            ]
            count = len(self._buckets[identifier])

            if count < self.max_requests:
                self._buckets[identifier].append(now)
                return True, 0
            else:
                oldest = self._buckets[identifier][0]
                retry_after = int(self.window_seconds - (now - oldest)) + 1
                return False, retry_after


# Flask integration
def make_flask_limiter(limiter: RateLimiter):
    """Create a Flask before_request rate limit handler."""
    def check_rate_limit():
        try:
            from flask import request, jsonify
            ip = request.headers.get("X-Forwarded-For", request.remote_addr)
            allowed, retry_after = limiter.is_allowed(ip)
            if not allowed:
                resp = jsonify({
                    "error": "Too many requests",
                    "retry_after_seconds": retry_after
                })
                resp.status_code = 429
                resp.headers["Retry-After"] = str(retry_after)
                return resp
        except ImportError:
            pass
    return check_rate_limit


# Default limiters
auth_limiter = RateLimiter(max_requests=5, window_seconds=60)
ai_limiter = RateLimiter(max_requests=10, window_seconds=60)
