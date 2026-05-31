-- Syncing the rotated service role key after the security leak
-- This is in a migration to ensure the vault is updated during deployment
-- SECURITY: Key must be set via `ALTER SYSTEM SET supabase.service_role_key TO '...';`
-- NEVER hardcode secrets in source code
insert into vault.secrets (name, description, secret)
values (
  'SUPABASE_SERVICE_ROLE_KEY', 
  'Internal key for triggering edge functions from Postgres', 
  current_setting('supabase.service_role_key', true)
)
on conflict (name) do update set secret = excluded.secret;
