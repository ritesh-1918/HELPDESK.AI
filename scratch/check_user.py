import os
from dotenv import load_dotenv
from supabase import create_client

# Load backend environment variables
load_dotenv(dotenv_path="backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

print("Connecting to Supabase at:", url)
supabase = create_client(url, key)

email = "24ananyagupta@gmail.com"
print(f"Checking for profile with email: {email}")

res = supabase.table("profiles").select("*").eq("email", email).execute()
print("Profiles results:")
print(res.data)

# Let's also check all pending approval profiles
print("\nFetching all pending profiles...")
pending_res = supabase.table("profiles").select("*").eq("status", "pending_approval").execute()
for p in pending_res.data:
    print(f"- {p.get('email')}: status={p.get('status')}, role={p.get('role')}, company={p.get('company')}")

# Fetching all active profiles
print("\nFetching all active profiles...")
active_res = supabase.table("profiles").select("*").eq("status", "active").execute()
for p in active_res.data:
    print(f"- {p.get('email')}: status={p.get('status')}, role={p.get('role')}, company={p.get('company')}")
