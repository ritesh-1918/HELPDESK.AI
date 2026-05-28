-- Syncing the rotated service role key after the security leak
-- This is in a migration to ensure the vault is updated during deployment
-- NOTE: The actual service_role key MUST be provided via environment variable
-- or PostgreSQL custom GUC variable. Set before running this migration:
--   SET custom.supabase_service_role_key = 'your-actual-jwt-here';

insert into vault.secrets (name, description, secret)
values (
  'SUPABASE_SERVICE_ROLE_KEY', 
  'Internal key for triggering edge functions from Postgres', 
  current_setting('custom.supabase_service_role_key', true)::text
)
on conflict (name) do update set secret = excluded.secret;
