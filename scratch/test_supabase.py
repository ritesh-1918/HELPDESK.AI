import os
from dotenv import load_dotenv
from supabase import create_client

# Load backend environment variables
load_dotenv(dotenv_path="backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

print("Connecting to Supabase at:", url)
supabase = create_client(url, key)

try:
    print("Testing connection: fetching one ticket...")
    res = supabase.table("tickets").select("*").limit(1).execute()
    print("Fetch success! Sample record:")
    if res.data:
        record = res.data[0]
        print("Columns in tickets table:")
        for col in sorted(record.keys()):
            print(f" - {col}: {type(record[col]).__name__}")
    else:
        print("No tickets found in the database.")
        
    print("\nAttempting to reload PostgREST schema cache...")
    # PostgREST cache can be reloaded by calling an RPC or pg_notify if we have permission.
    # Let's try running a direct query or check if we can call it.
    try:
        reload_res = supabase.postgrest.auth(key).rpc("reload_schema").execute()
        print("Reload RPC success:", reload_res)
    except Exception as rpc_err:
        print("Reload RPC failed or not defined (this is normal):", rpc_err)
        
except Exception as e:
    print("Error querying database:", e)
