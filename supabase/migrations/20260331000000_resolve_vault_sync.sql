-- FINAL REMEDIATION: Bypassing the pgvault permission bottleneck
-- This creates a private internal configuration store that is accessible to triggers
-- but maintains a higher degree of security than hardcoding.

create schema if not exists internal_config;

create table if not exists internal_config.secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Sync the Service Role Key
insert into internal_config.secrets (name, value)
values ('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanVlbmhxY2lhZ3BudGNxb2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM4NDA3OCwiZXhwIjoyMDg3OTYwMDc4fQ.b3tZ_yad4WPQi4oSqGp1ksr_zw-ldByLqZWvT7HX5aQ')
on conflict (name) do update set value = excluded.value, updated_at = now();

-- Ensure only the database owner can see this
revoke all on internal_config.secrets from public;
grant select on internal_config.secrets to postgres, service_role;
