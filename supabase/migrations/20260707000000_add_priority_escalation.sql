-- Priority Escalation Rules Engine for aging tickets.
-- Automatically escalates ticket priority based on age, reopen count, and custom rules.

-- Table: priority_escalation_rules
-- Stores configurable escalation rules for automatic priority bumping
CREATE TABLE IF NOT EXISTS priority_escalation_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    rule_name text NOT NULL,
    rule_description text,
    from_priority text NOT NULL CHECK (from_priority IN ('low', 'medium', 'high', 'critical')),
    to_priority text NOT NULL CHECK (to_priority IN ('low', 'medium', 'high', 'critical')),
    age_threshold_hours integer,
    reopen_count_threshold integer,
    enabled boolean NOT NULL DEFAULT true,
    priority_order integer NOT NULL DEFAULT 0,
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_priority_escalation CHECK (
        (age_threshold_hours IS NOT NULL AND age_threshold_hours > 0) OR
        (reopen_count_threshold IS NOT NULL AND reopen_count_threshold > 0)
    ),
    CONSTRAINT no_priority_downgrade CHECK (
        CASE 
            WHEN from_priority = 'low' THEN to_priority IN ('medium', 'high', 'critical')
            WHEN from_priority = 'medium' THEN to_priority IN ('high', 'critical')
            WHEN from_priority = 'high' THEN to_priority = 'critical'
            ELSE false
        END
    )
);

-- Index for efficient rule querying
CREATE INDEX IF NOT EXISTS idx_escalation_rules_company_enabled
    ON priority_escalation_rules(company_id, enabled, priority_order)
    WHERE enabled = true;

-- Table: priority_escalation_log
-- Audit log for all priority escalations
CREATE TABLE IF NOT EXISTS priority_escalation_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    rule_id uuid REFERENCES priority_escalation_rules(id) ON DELETE SET NULL,
    from_priority text NOT NULL,
    to_priority text NOT NULL,
    escalation_reason text NOT NULL,
    ticket_age_hours numeric(10,2),
    reopen_count integer,
    escalated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for escalation history queries
CREATE INDEX IF NOT EXISTS idx_escalation_log_ticket
    ON priority_escalation_log(ticket_id, escalated_at DESC);

CREATE INDEX IF NOT EXISTS idx_escalation_log_company_date
    ON priority_escalation_log(company_id, escalated_at DESC);

-- Add columns to tickets table for escalation tracking
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS reopen_count integer NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS last_escalation_at timestamptz;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS auto_escalated boolean NOT NULL DEFAULT false;

-- Index for efficient escalation candidate queries
CREATE INDEX IF NOT EXISTS idx_tickets_escalation_candidates
    ON tickets(priority, created_at, status, reopen_count)
    WHERE status NOT IN ('resolved', 'closed', 'auto-resolved');

-- Row Level Security for priority_escalation_rules
ALTER TABLE priority_escalation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full escalation rules access" ON priority_escalation_rules
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage own company escalation rules" ON priority_escalation_rules
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Row Level Security for priority_escalation_log
ALTER TABLE priority_escalation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full escalation log access" ON priority_escalation_log
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins and agents can view own company escalation logs" ON priority_escalation_log
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON priority_escalation_rules TO authenticated;
GRANT ALL ON priority_escalation_rules TO service_role;

GRANT SELECT, INSERT ON priority_escalation_log TO authenticated;
GRANT ALL ON priority_escalation_log TO service_role;

-- Insert default escalation rules (can be customized per company)
-- These are global defaults that apply to all companies unless overridden
INSERT INTO priority_escalation_rules (
    company_id, rule_name, rule_description, from_priority, to_priority,
    age_threshold_hours, reopen_count_threshold, enabled, priority_order
) VALUES
    (NULL, 'Low to Medium after 7 days', 'Escalate low priority tickets to medium after 7 days of inactivity', 'low', 'medium', 168, NULL, true, 1),
    (NULL, 'Medium to High after 3 days', 'Escalate medium priority tickets to high after 3 days of inactivity', 'medium', 'high', 72, NULL, true, 2),
    (NULL, 'High to Critical after 1 day', 'Escalate high priority tickets to critical after 1 day of inactivity', 'high', 'critical', 24, NULL, true, 3),
    (NULL, 'Reopen to Critical after 2 reopens', 'Escalate any ticket to critical if reopened more than 2 times', 'low', 'critical', NULL, 2, true, 4),
    (NULL, 'Reopen to Critical after 2 reopens (medium)', 'Escalate medium tickets to critical if reopened more than 2 times', 'medium', 'critical', NULL, 2, true, 5),
    (NULL, 'Reopen to Critical after 2 reopens (high)', 'Escalate high tickets to critical if reopened more than 2 times', 'high', 'critical', NULL, 2, true, 6)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE priority_escalation_rules IS 'Configurable rules for automatic ticket priority escalation based on age and reopen count.';
COMMENT ON TABLE priority_escalation_log IS 'Audit log of all priority escalations with reason and metadata.';
COMMENT ON COLUMN tickets.reopen_count IS 'Number of times this ticket has been reopened after being resolved.';
COMMENT ON COLUMN tickets.last_escalation_at IS 'Timestamp of the last automatic priority escalation.';
COMMENT ON COLUMN tickets.auto_escalated IS 'Flag indicating if this ticket has been automatically escalated.';
