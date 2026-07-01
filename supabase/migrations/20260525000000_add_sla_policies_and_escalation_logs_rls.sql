-- Company-scoped SLA policy and escalation history tables.
-- Standard authenticated users can only read their own company records.
-- Company admins can create, update, and delete records for their company.

CREATE TABLE IF NOT EXISTS sla_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    policy_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT sla_policies_company_name_key UNIQUE (company_id, name)
);

CREATE TABLE IF NOT EXISTS escalation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ticket_id text,
    sla_policy_id uuid REFERENCES sla_policies(id) ON DELETE SET NULL,
    escalation_level integer NOT NULL DEFAULT 0,
    event_type text NOT NULL,
    message text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_company_id ON sla_policies(company_id);
CREATE INDEX IF NOT EXISTS idx_sla_policies_company_active ON sla_policies(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_company_created_at ON escalation_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_ticket_id ON escalation_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_sla_policy_id ON escalation_logs(sla_policy_id);

ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view SLA policies" ON sla_policies
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company admins can create SLA policies" ON sla_policies
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    );

CREATE POLICY "Company admins can update SLA policies" ON sla_policies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    );

CREATE POLICY "Company admins can delete SLA policies" ON sla_policies
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    );

CREATE POLICY "Company members can view escalation logs" ON escalation_logs
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company admins can create escalation logs" ON escalation_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    );

CREATE POLICY "Company admins can update escalation logs" ON escalation_logs
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    );

CREATE POLICY "Company admins can delete escalation logs" ON escalation_logs
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = auth.uid()
              AND p.company_id = company_id
              AND p.role = 'admin'
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON sla_policies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON escalation_logs TO authenticated;
GRANT ALL ON sla_policies TO service_role;
GRANT ALL ON escalation_logs TO service_role;
