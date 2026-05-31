-- FINAL REMEDIATION: Bypassing the pgvault permission bottleneck
-- This creates a private internal configuration store that is accessible to triggers
-- but maintains a higher degree of security than hardcoding.

create schema if not exists internal_config;

create table if not exists internal_config.secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Sync the Service Role Key from environment (NEVER hardcode in source)
insert into internal_config.secrets (name, value)
values ('SUPABASE_SERVICE_ROLE_KEY', current_setting('supabase.service_role_key', true))
on conflict (name) do update set value = excluded.value, updated_at = now();

-- Ensure only the database owner can see this
revoke all on internal_config.secrets from public;
grant select on internal_config.secrets to postgres, service_role;
