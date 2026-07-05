-- Syncing the rotated service role key after the security leak
-- This is in a migration to ensure the vault is updated during deployment
insert into vault.secrets (name, description, secret)
values (
  'SUPABASE_SERVICE_ROLE_KEY', 
  'Internal key for triggering edge functions from Postgres', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanVlbmhxY2lhZ3BudGNxb2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM4NDA3OCwiZXhwIjoyMDg3OTYwMDc4fQ.b3tZ_yad4WPQi4oSqGp1ksr_zw-ldByLqZWvT7HX5aQ'
)
on conflict (name) do update set secret = excluded.secret;
