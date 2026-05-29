-- Fix duplicate SLA escalation logging
--
-- The old trigger trg_log_sla_breach logged only BREACHED transitions in
-- escalation_logs, but the backend also independently called _log_escalation()
-- for the same events, creating duplicate entries.
--
-- This migration:
--  1. Drops the old trigger and function that only handled BREACHED
--  2. Creates a new unified trigger that logs both WARNING and BREACHED
--     transitions, making the DB the single source of truth for audit logging
--  3. Backend _log_escalation() call is removed to eliminate duplication

-- Drop old trigger and function
DROP TRIGGER IF EXISTS trg_log_sla_breach ON public.tickets;
DROP FUNCTION IF EXISTS public.log_sla_breach;

-- Create a unified escalation logging function
CREATE OR REPLACE FUNCTION public.log_sla_escalation()
RETURNS trigger AS $$
BEGIN
    IF NEW.sla_status = 'breached' AND (OLD.sla_status IS DISTINCT FROM 'breached') THEN
        INSERT INTO public.escalation_logs (
            ticket_id, ticket_subject, priority, sla_status,
            escalation_level, remaining_seconds, assigned_team,
            notification_channels, triggered_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.subject, NEW.summary, ''),
            NEW.priority,
            'breached',
            COALESCE(NEW.escalation_level, 1),
            COALESCE(NEW.remaining_seconds, 0),
            COALESCE(NEW.assigned_team, ''),
            '{}',
            now()
        );
    END IF;

    IF NEW.sla_status = 'warning' AND (OLD.sla_status IS DISTINCT FROM 'warning') THEN
        INSERT INTO public.escalation_logs (
            ticket_id, ticket_subject, priority, sla_status,
            escalation_level, remaining_seconds, assigned_team,
            notification_channels, triggered_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.subject, NEW.summary, ''),
            NEW.priority,
            'warning',
            COALESCE(NEW.escalation_level, 1),
            COALESCE(NEW.remaining_seconds, 0),
            COALESCE(NEW.assigned_team, ''),
            '{}',
            now()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the unified trigger
DROP TRIGGER IF EXISTS trg_log_sla_escalation ON public.tickets;
CREATE TRIGGER trg_log_sla_escalation
    AFTER UPDATE OF sla_status ON public.tickets
    FOR EACH ROW
    WHEN (NEW.sla_status IN ('breached', 'warning'))
    EXECUTE FUNCTION public.log_sla_escalation();
