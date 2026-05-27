-- Internal configuration store for runtime-accessible secrets.
-- The actual service role key is NOT stored here — it is populated
-- at deployment time via the vault setup script (scripts/setup_vault.py).
-- This prevents hardcoding sensitive credentials in version control.

create schema if not exists internal_config;

create table if not exists internal_config.secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Ensure only the database owner can see this
revoke all on internal_config.secrets from public;
grant select on internal_config.secrets to postgres, service_role;
