-- SLA escalations table and automated monitor scheduler setup.

CREATE TABLE IF NOT EXISTS public.sla_escalations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    breached_at timestamp with time zone NOT NULL DEFAULT now(),
    team text NOT NULL,
    priority text NOT NULL,
    escalation_level integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sla_escalations ENABLE ROW LEVEL SECURITY;

-- Policy for Service Role
CREATE POLICY "Service role full access on sla_escalations" ON public.sla_escalations
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (admins/agents of same company can view logs)
CREATE POLICY "Company members can view own company sla_escalations" ON public.sla_escalations
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE company_id IN (
                SELECT company_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

-- Policy for standard users (creators can view their own ticket's escalations)
CREATE POLICY "Users can view own ticket sla_escalations" ON public.sla_escalations
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE user_id = auth.uid()
        )
    );

-- Grants
GRANT SELECT ON public.sla_escalations TO authenticated;
GRANT ALL ON public.sla_escalations TO service_role;

-- Comments
COMMENT ON TABLE public.sla_escalations IS 'Audit log of SLA breaches and automated team escalations.';
COMMENT ON COLUMN public.sla_escalations.ticket_id IS 'Reference to the breached ticket.';
COMMENT ON COLUMN public.sla_escalations.breached_at IS 'Timestamp when the SLA breach was detected/logged.';
COMMENT ON COLUMN public.sla_escalations.team IS 'The team the ticket was assigned to at the moment of breach.';
COMMENT ON COLUMN public.sla_escalations.priority IS 'The ticket priority when the breach occurred.';
COMMENT ON COLUMN public.sla_escalations.escalation_level IS 'The resulting escalation level of the ticket.';

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Safely unschedule existing cron job if it exists to avoid duplicates
DO $$
BEGIN
    PERFORM cron.unschedule('sla-breach-monitor-cron');
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Schedule the sla-breach-monitor-cron to run every 5 minutes
-- It will make an HTTP POST request to the Supabase Edge Function
SELECT cron.schedule(
  'sla-breach-monitor-cron',
  '*/5 * * * *',
  $$ SELECT net.http_post(
       url:='https://aejuenhqciagpntcqoir.supabase.co/functions/v1/sla-breach-monitor',
       headers:=jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer ' || coalesce(
           (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1),
           'FALLBACK_PLEASE_CONFIGURE_VAULT'
         )
       ),
       body:='{}'::jsonb
     ) $$
);
