-- SLA escalation support for enterprise ticket operations.

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_response_due_at timestamp with time zone;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_breach_at timestamp with time zone;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_status text DEFAULT 'ACTIVE';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalation_level integer DEFAULT 0;

ALTER TABLE tickets
    ADD CONSTRAINT tickets_sla_status_check
    CHECK (sla_status IN ('ACTIVE', 'WARNING', 'BREACHED'));

CREATE INDEX IF NOT EXISTS idx_tickets_sla_breach_open
    ON tickets(sla_breach_at, sla_status, status)
    WHERE sla_breach_at IS NOT NULL
      AND status NOT IN ('resolved', 'closed', 'auto-resolved');

CREATE INDEX IF NOT EXISTS idx_tickets_escalation_level
    ON tickets(escalation_level DESC)
    WHERE escalation_level > 0;

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    ticket_id text,
    company_id uuid,
    actor_type text NOT NULL DEFAULT 'system',
    message text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_event
    ON audit_logs(ticket_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created
    ON audit_logs(company_id, created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full audit access" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view own company audit logs" ON audit_logs
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO service_role;

COMMENT ON COLUMN tickets.sla_response_due_at IS 'First response target timestamp derived from ticket priority.';
COMMENT ON COLUMN tickets.sla_breach_at IS 'Resolution target timestamp used by the SLA escalation engine.';
COMMENT ON COLUMN tickets.sla_status IS 'Current SLA state: ACTIVE, WARNING, or BREACHED.';
COMMENT ON COLUMN tickets.escalation_level IS 'Number of automated SLA escalations triggered for this ticket.';
