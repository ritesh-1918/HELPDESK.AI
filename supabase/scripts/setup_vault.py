"""
Vault setup script — populates Supabase Vault with the service role key
at deployment / local-dev time instead of hardcoding it in migrations.

Usage:
    SUPABASE_URL=https://your-project.supabase.co \
    SUPABASE_SERVICE_KEY=eyJhbG... \
    python supabase/scripts/setup_vault.py

Requires: pip install supabase
"""

import os
import sys

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("ERROR: Both SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.")
    sys.exit(1)


def main():
    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: supabase package not installed. Run: pip install supabase")
        sys.exit(1)

    client = create_client(SUPABASE_URL, SERVICE_KEY)

    secret_name = "SUPABASE_SERVICE_ROLE_KEY"
    description = "Internal key for triggering edge functions from Postgres"

    response = client.table("vault.secrets").upsert(
        {
            "name": secret_name,
            "description": description,
            "secret": SERVICE_KEY,
        },
        on_conflict="name",
    ).execute()

    if hasattr(response, "error") and response.error:
        print(f"ERROR: Failed to upsert vault secret: {response.error}")
        sys.exit(1)

    print(f"vault.secrets '{secret_name}' upserted successfully.")

    # Also sync to internal_config.secrets for triggers that read from there
    try:
        response = client.table("internal_config.secrets").upsert(
            {
                "name": secret_name,
                "value": SERVICE_KEY,
            },
            on_conflict="name",
        ).execute()
        print(f"internal_config.secrets '{secret_name}' upserted successfully.")
    except Exception as e:
        print(f"Note: internal_config.secrets upsert skipped ({e})")


if __name__ == "__main__":
    main()
