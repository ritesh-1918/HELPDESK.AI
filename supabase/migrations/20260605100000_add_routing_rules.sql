-- routing_rules table: per-company rules to auto-route tickets to specific departments based on keywords or category
CREATE TABLE IF NOT EXISTS public.routing_rules (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name                TEXT        NOT NULL,
    rule_type           TEXT        NOT NULL CHECK (rule_type IN ('keyword', 'category')),
    pattern             TEXT        NOT NULL,
    target_department   TEXT        NOT NULL,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    priority            INTEGER     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company members (admins/agents) can perform CRUD on their company's routing rules
CREATE POLICY "Company members can manage routing rules" ON public.routing_rules
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Trigger to auto-update updated_at on modification
CREATE OR REPLACE FUNCTION update_routing_rules_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_routing_rules_updated_at
    BEFORE UPDATE ON public.routing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_routing_rules_timestamp();

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_routing_rules_company_id ON public.routing_rules(company_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routing_rules TO authenticated;
GRANT ALL ON public.routing_rules TO service_role;
