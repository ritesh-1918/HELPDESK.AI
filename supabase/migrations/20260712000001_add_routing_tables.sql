-- Migration: Add Routing Logs and Routing Thresholds Tables
-- Implements ticket routing analytics and configuration for Issue #3202

-- ============================================================================
-- 1. Create routing_logs table for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.routing_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id           UUID        NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category            TEXT        NOT NULL,
    confidence          NUMERIC(5,3) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    assigned_team       TEXT        NOT NULL,
    assigned_agent_id   UUID,
    routed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.routing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company members can view their company's routing logs
CREATE POLICY "Company members can view routing logs" ON public.routing_logs
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- RLS Policy: Service role can insert routing logs
CREATE POLICY "Service role can insert routing logs" ON public.routing_logs
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
        OR current_setting('role') = 'service_role'
    );

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_routing_logs_company_id ON public.routing_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_routing_logs_ticket_id ON public.routing_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_routing_logs_routed_at ON public.routing_logs(routed_at DESC);
CREATE INDEX IF NOT EXISTS idx_routing_logs_category ON public.routing_logs(category);
CREATE INDEX IF NOT EXISTS idx_routing_logs_team ON public.routing_logs(assigned_team);

-- ============================================================================
-- 2. Create routing_thresholds table for per-company configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.routing_thresholds (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id              UUID        NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
    critical_threshold      NUMERIC(5,3) NOT NULL DEFAULT 0.95 CHECK (critical_threshold >= 0.0 AND critical_threshold <= 1.0),
    specialized_threshold   NUMERIC(5,3) NOT NULL DEFAULT 0.80 CHECK (specialized_threshold >= 0.0 AND specialized_threshold <= 1.0),
    standard_threshold      NUMERIC(5,3) NOT NULL DEFAULT 0.60 CHECK (standard_threshold >= 0.0 AND standard_threshold <= 1.0),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.routing_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage routing thresholds for their company
CREATE POLICY "Admins can manage routing thresholds" ON public.routing_thresholds
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );

-- RLS Policy: All company members can view thresholds
CREATE POLICY "All company members can view thresholds" ON public.routing_thresholds
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_routing_thresholds_company_id ON public.routing_thresholds(company_id);

-- ============================================================================
-- 3. Trigger to update routing_thresholds timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_routing_thresholds_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_routing_thresholds_updated_at
    BEFORE UPDATE ON public.routing_thresholds
    FOR EACH ROW
    EXECUTE FUNCTION update_routing_thresholds_timestamp();

-- ============================================================================
-- 4. Grant permissions
-- ============================================================================

GRANT SELECT, INSERT ON public.routing_logs TO authenticated;
GRANT ALL ON public.routing_logs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routing_thresholds TO authenticated;
GRANT ALL ON public.routing_thresholds TO service_role;

-- ============================================================================
-- 5. Add comments
-- ============================================================================

COMMENT ON TABLE public.routing_logs IS 'Audit trail of ticket routing decisions and classifications';
COMMENT ON TABLE public.routing_thresholds IS 'Per-company configuration for ticket routing confidence thresholds';
COMMENT ON COLUMN public.routing_logs.confidence IS 'DistilBERT confidence score (0.0-1.0)';
COMMENT ON COLUMN public.routing_logs.assigned_team IS 'Team ticket was routed to';
COMMENT ON COLUMN public.routing_thresholds.critical_threshold IS 'Minimum confidence for escalation to specialized team';
COMMENT ON COLUMN public.routing_thresholds.specialized_threshold IS 'Minimum confidence for routing to specialized team';
COMMENT ON COLUMN public.routing_thresholds.standard_threshold IS 'Minimum confidence for standard routing';
