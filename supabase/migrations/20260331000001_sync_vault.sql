-- Syncing the service role key after the security leak
-- NOTE: Replace '<your-service-role-jwt>' with the actual key.
--   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your_key>
-- NEVER hardcode secrets in version control.
insert into vault.secrets (name, description, secret)
values (
  'SUPABASE_SERVICE_ROLE_KEY', 
  'Internal key for triggering edge functions from Postgres', 
  '<your-service-role-jwt>'
)
on conflict (name) do update set secret = excluded.secret;
