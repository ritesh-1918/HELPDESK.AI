-- Creating a webhook trigger payload for new tickets
-- Ensure the pg_net extension is enabled to make HTTP requests
create extension if not exists pg_net with schema extensions;

-- Create the trigger function that calls the edge function
create or replace function public.ticket_insert_webhook()
returns trigger as $$
declare
  service_key text;
begin
  -- SECURE: Fetching the service role key from the Supabase Vault
  -- This prevents hardcoding sensitive secrets in version control.
  select decrypted_secret into service_key from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY' limit 1;

  perform net.http_post(
    url:='https://aejuenhqciagpntcqoir.supabase.co/functions/v1/email-notifier',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(service_key, 'FALLBACK_PLEASE_CONFIGURE_VAULT')
    ),
    body:=jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Attach the trigger to the tickets table
drop trigger if exists ticket_insert_trigger on public.tickets;

create trigger ticket_insert_trigger
  after insert on public.tickets
  for each row
  execute function public.ticket_insert_webhook();
