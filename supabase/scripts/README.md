# Supabase Vault Setup

This script populates the Supabase Vault with the service role key
at deployment / local-dev time, eliminating the need to hardcode
sensitive credentials in version-controlled migration files.

## Prerequisites

- Python 3.8+
- `supabase` package: `pip install supabase`
- Supabase project URL and service role key

## Usage

### From environment variables

```bash
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
python supabase/scripts/setup_vault.py
```

Or using a `.env` file (loaded automatically if you have python-dotenv installed):

```bash
set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
set SUPABASE_SERVICE_KEY=your_service_role_key_here
python supabase/scripts/setup_vault.py
```

## What it does

1. Upserts `SUPABASE_SERVICE_ROLE_KEY` into `vault.secrets`
2. Upserts the same key into `internal_config.secrets` (used by legacy triggers)

## After rotating the service role key

If the service role key is rotated in the Supabase dashboard:

1. Update the value in your local `.env` or deployment secrets
2. Re-run this script to sync the new key to the vault
3. All triggers and edge functions will pick up the new key automatically
