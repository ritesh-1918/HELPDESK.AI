import sys
import urllib.request

try:
    resp = urllib.request.urlopen("http://localhost:7860/health", timeout=5)
    if resp.status == 200:
        sys.exit(0)
    sys.exit(1)
except Exception:
    sys.exit(1)
