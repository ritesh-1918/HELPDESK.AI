-- SLA Engine — Database schema for SLA breach detection and escalation
-- Part of Issue #75: SLA Breach & Automated Multi-Channel Escalation Engine

-- =========================================================================
-- 1. Extend the tickets table with SLA columns
-- =========================================================================

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_status text 
    DEFAULT 'active'
    CHECK (sla_status IN ('active', 'warning', 'breached', 'met', 'paused'));

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_policy text
    DEFAULT 'medium'
    CHECK (sla_policy IN ('critical', 'high', 'medium', 'low'));

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_breach_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_warning_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_started_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_updated_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS escalation_level integer 
    DEFAULT 0 
    CHECK (escalation_level >= 0 AND escalation_level <= 3);

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS last_escalated_at timestamptz;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS remaining_seconds integer 
    DEFAULT 0;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS channel_notified text[] 
    DEFAULT '{}';

-- =========================================================================
-- 2. Escalation Logs — audit trail for every SLA escalation event
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.escalation_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
    ticket_subject text NOT NULL DEFAULT '',
    priority text NOT NULL DEFAULT 'medium',
    sla_status text NOT NULL CHECK (sla_status IN ('active', 'warning', 'breached', 'met', 'paused')),
    escalation_level integer NOT NULL DEFAULT 0,
    remaining_seconds integer NOT NULL DEFAULT 0,
    assigned_team text NOT NULL DEFAULT '',
    notification_channels text[] DEFAULT '{}',
    triggered_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    notes text DEFAULT ''
);

-- Index for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_escalation_logs_ticket_id ON public.escalation_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_triggered_at ON public.escalation_logs(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_sla_status ON public.escalation_logs(sla_status);

-- Enable RLS
ALTER TABLE public.escalation_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all escalation logs
CREATE POLICY "Admins can read escalation logs" ON public.escalation_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'master_admin')
        )
    );

-- Service role and triggers can insert
CREATE POLICY "Service role can insert escalation logs" ON public.escalation_logs
    FOR INSERT
    WITH CHECK (true);

-- =========================================================================
-- 3. SLA Policies — configurable SLA definitions (optional override table)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.sla_policies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    priority text NOT NULL UNIQUE CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    max_hours integer NOT NULL DEFAULT 8,
    warning_pct numeric(4,3) NOT NULL DEFAULT 0.750,
    auto_escalate boolean NOT NULL DEFAULT true,
    l2_after_minutes integer NOT NULL DEFAULT 0,
    l3_after_minutes integer NOT NULL DEFAULT 120,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    is_custom boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);

-- Insert default SLA policies
INSERT INTO public.sla_policies (priority, max_hours, warning_pct, auto_escalate, l2_after_minutes, l3_after_minutes)
VALUES
    ('critical', 2, 0.750, true, 0, 120),
    ('high',     4, 0.750, true, 30, 240),
    ('medium',   8, 0.750, true, 60, 480),
    ('low',     24, 0.750, false, 120, 1440)
ON CONFLICT (priority) DO NOTHING;

ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sla_policies" ON public.sla_policies
    FOR SELECT USING (true);

CREATE POLICY "Master admins can manage sla_policies" ON public.sla_policies
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'master_admin'
        )
    );

-- =========================================================================
-- 4. Indexes on tickets for SLA queries
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_tickets_sla_status ON public.tickets(sla_status);
CREATE INDEX IF NOT EXISTS idx_tickets_escalation_level ON public.tickets(escalation_level);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_breach_at ON public.tickets(sla_breach_at);
CREATE INDEX IF NOT EXISTS idx_tickets_priority_sla ON public.tickets(priority, sla_status);

-- =========================================================================
-- 5. Trigger: auto-set sla_policy when priority changes
-- =========================================================================

CREATE OR REPLACE FUNCTION public.auto_set_sla_policy()
RETURNS trigger AS $$
BEGIN
    NEW.sla_policy := LOWER(NEW.priority);
    -- If SLA hasn't started yet, start it now
    IF NEW.sla_started_at IS NULL THEN
        NEW.sla_started_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_set_sla_policy ON public.tickets;
CREATE TRIGGER trg_auto_set_sla_policy
    BEFORE INSERT OR UPDATE OF priority ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_set_sla_policy();

-- =========================================================================
-- 6. Trigger: log when sla_status changes to breached
-- =========================================================================

CREATE OR REPLACE FUNCTION public.log_sla_breach()
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_sla_breach ON public.tickets;
CREATE TRIGGER trg_log_sla_breach
    AFTER UPDATE OF sla_status ON public.tickets
    FOR EACH ROW
    WHEN (NEW.sla_status = 'breached')
    EXECUTE FUNCTION public.log_sla_breach();

-- =========================================================================
-- 7. Grant permissions
-- =========================================================================

GRANT ALL ON TABLE public.escalation_logs TO authenticated;
GRANT ALL ON TABLE public.escalation_logs TO service_role;
GRANT SELECT ON TABLE public.sla_policies TO authenticated;
GRANT ALL ON TABLE public.sla_policies TO service_role;
