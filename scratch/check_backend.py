import urllib.request
import json

urls = [
    "https://ritesh19180-ai-helpdesk-api.hf.space/",
    "https://ritesh19180-ai-helpdesk-api.hf.space/health",
    "https://ritesh19180-ai-helpdesk-api.hf.space/ready",
    "https://ritesh19180-ai-helpdesk-api.hf.space/auth/me"
]

for url in urls:
    print(f"\nFetching: {url}")
    try:
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(f"Body: {body[:300]}...")
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} - {e.reason}")
        try:
            print(f"Error Body: {e.read().decode('utf-8')[:300]}...")
        except Exception:
            pass
    except Exception as e:
        print(f"Exception: {e}")
