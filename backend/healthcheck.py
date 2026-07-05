import os
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse


def main() -> int:
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
