"""
Healthcheck Module

Provides a lightweight CLI utility to verify that the HELPDESK.AI backend
is reachable and responding with a healthy HTTP status code.

Usage:
    python backend/healthcheck.py

Environment Variables:
    HEALTHCHECK_URL (str):
        Full URL to probe.  Defaults to ``http://127.0.0.1:7860/ready``.

    HEALTHCHECK_TIMEOUT_SECONDS (str):
        Timeout in seconds for the HTTP probe.  Defaults to ``3``.

Example (docker-compose healthcheck):
    healthcheck:
      test: ["CMD", "python", "backend/healthcheck.py"]
      interval: 30s
      timeout: 5s
      retries: 3
"""
import os
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse


def main() -> int:
    """Run the healthcheck probe.

    Probes ``HEALTHCHECK_URL`` (or ``http://127.0.0.1:7860/ready``) and
    returns an exit code suitable for container health-check commands.

    Returns:
        int: ``0`` when the response status is 2xx, ``1`` otherwise.

    Raises:
        SystemExit: Always – the return value is passed to ``sys.exit()``.

    Example::

        $ HEALTHCHECK_URL=http://localhost:7860/ready python backend/healthcheck.py
        $ echo $?
        0
    """
    url = os.environ.get("HEALTHCHECK_URL", "http://127.0.0.1:7860/ready")
    parsed_url = urlparse(url)
    if parsed_url.scheme not in {"http", "https"}:
        return 1

    try:
        timeout = float(os.environ.get("HEALTHCHECK_TIMEOUT_SECONDS", "3"))
    except (TypeError, ValueError):
        timeout = 3.0

    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return 0 if 200 <= response.status < 300 else 1
    except (TimeoutError, urllib.error.URLError, OSError):
        return 1


if __name__ == "__main__":
    sys.exit(main())
