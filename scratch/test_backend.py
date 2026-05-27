import requests
import json

url = "https://ritesh19180-ai-helpdesk-api.hf.space"

try:
    print("Checking backend health...")
    r = requests.get(f"{url}/health")
    print("Health response:", r.status_code, r.json())
    
    print("\nChecking backend readiness...")
    r_ready = requests.get(f"{url}/ready")
    print("Readiness response:", r_ready.status_code, r_ready.json())
except Exception as e:
    print("Error querying backend:", e)
