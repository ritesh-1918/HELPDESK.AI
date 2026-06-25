-- Sync the service role key for triggering edge functions from Postgres.
-- IMPORTANT: Replace 'CHANGE_ME' with the actual key set via the Supabase dashboard.
-- Never commit live secrets to version control.
insert into vault.secrets (name, description, secret)
values (
  'SUPABASE_SERVICE_ROLE_KEY', 
  'Internal key for triggering edge functions from Postgres', 
  'CHANGE_ME'
)
on conflict (name) do update set secret = excluded.secret;
