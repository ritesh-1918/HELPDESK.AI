-- Migration: Add SLA Breach Prediction and Proactive Alerting Support
-- This migration creates tables for tracking SLA predictions and alerts

-- ============================================================================
-- 1. SLA Prediction Alerts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS sla_prediction_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'safe')),
    breach_probability DECIMAL(5, 3) NOT NULL CHECK (breach_probability >= 0 AND breach_probability <= 1),
    time_to_breach_minutes INTEGER,
    channels_used TEXT[] DEFAULT '{}',
    contributing_factors TEXT[] DEFAULT '{}',
    recommended_actions TEXT[] DEFAULT '{}',
    alert_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient alert history queries
CREATE INDEX IF NOT EXISTS idx_sla_alerts_company_sent 
    ON sla_prediction_alerts(company_id, alert_sent_at DESC);

-- Index for ticket-specific alert history
CREATE INDEX IF NOT EXISTS idx_sla_alerts_ticket 
    ON sla_prediction_alerts(ticket_id, alert_sent_at DESC);

-- Index for risk level filtering
CREATE INDEX IF NOT EXISTS idx_sla_alerts_risk_level 
    ON sla_prediction_alerts(risk_level, alert_sent_at DESC);

-- ============================================================================
-- 2. SLA Prediction History Table (for trend analysis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sla_prediction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'safe')),
    breach_probability DECIMAL(5, 3) NOT NULL,
    time_to_breach_minutes INTEGER,
    prediction_factors JSONB DEFAULT '{}',
    confidence_score DECIMAL(5, 3),
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for trend analysis queries
CREATE INDEX IF NOT EXISTS idx_sla_history_ticket_time 
    ON sla_prediction_history(ticket_id, predicted_at DESC);

-- Index for company-wide analytics
CREATE INDEX IF NOT EXISTS idx_sla_history_company_time 
    ON sla_prediction_history(company_id, predicted_at DESC);

-- ============================================================================
-- 3. Notifications Table Enhancement
-- ============================================================================
-- Add SLA prediction notification type if notifications table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Add check constraint for SLA prediction type if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage 
            WHERE table_name = 'notifications' AND constraint_name LIKE '%type%'
        ) THEN
            ALTER TABLE notifications 
            ADD CONSTRAINT notifications_type_check 
            CHECK (type IN ('ticket_created', 'ticket_updated', 'sla_breach', 'sla_breach_prediction', 'assignment', 'comment'));
        END IF;
    ELSE
        -- Create notifications table if it doesn't exist
        CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type TEXT NOT NULL CHECK (type IN ('ticket_created', 'ticket_updated', 'sla_breach', 'sla_breach_prediction', 'assignment', 'comment')),
            ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
            company_id UUID NOT NULL,
            assigned_to UUID,
            title TEXT NOT NULL,
            message TEXT,
            risk_level TEXT,
            probability TEXT,
            time_to_breach TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            read BOOLEAN DEFAULT FALSE,
            read_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX idx_notifications_company_user ON notifications(company_id, assigned_to, read);
        CREATE INDEX idx_notifications_ticket ON notifications(ticket_id, created_at DESC);
    END IF;
END $$;

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on sla_prediction_alerts
ALTER TABLE sla_prediction_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read alerts for their company
CREATE POLICY sla_alerts_read_policy ON sla_prediction_alerts
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: System can insert alerts (service accounts)
CREATE POLICY sla_alerts_insert_policy ON sla_prediction_alerts
    FOR INSERT
    WITH CHECK (true);  -- Allow system to insert, rely on application logic

-- Enable RLS on sla_prediction_history
ALTER TABLE sla_prediction_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read prediction history for their company
CREATE POLICY sla_history_read_policy ON sla_prediction_history
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: System can insert prediction history
CREATE POLICY sla_history_insert_policy ON sla_prediction_history
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- 5. Functions for Analytics
-- ============================================================================

-- Function to get SLA risk trend for a ticket
CREATE OR REPLACE FUNCTION get_sla_risk_trend(
    p_ticket_id UUID,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    predicted_at TIMESTAMP WITH TIME ZONE,
    risk_level TEXT,
    breach_probability DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sph.predicted_at,
        sph.risk_level,
        sph.breach_probability
    FROM sla_prediction_history sph
    WHERE sph.ticket_id = p_ticket_id
      AND sph.predicted_at >= NOW() - (p_hours || ' hours')::INTERVAL
    ORDER BY sph.predicted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get company-wide SLA risk statistics
CREATE OR REPLACE FUNCTION get_company_sla_stats(
    p_company_id UUID
)
RETURNS TABLE (
    risk_level TEXT,
    ticket_count BIGINT,
    avg_probability DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.priority as risk_level,
        COUNT(t.id) as ticket_count,
        AVG(CASE 
            WHEN t.sla_breach_at IS NOT NULL AND t.status NOT IN ('resolved', 'closed')
            THEN 
                CASE 
                    WHEN t.sla_breach_at < NOW() THEN 1.0
                    WHEN EXTRACT(EPOCH FROM (t.sla_breach_at - NOW())) / 3600 < 1 THEN 0.9
                    WHEN EXTRACT(EPOCH FROM (t.sla_breach_at - NOW())) / 3600 < 4 THEN 0.7
                    WHEN EXTRACT(EPOCH FROM (t.sla_breach_at - NOW())) / 3600 < 24 THEN 0.5
                    ELSE 0.3
                END
            ELSE 0.1
        END)::DECIMAL as avg_probability
    FROM tickets t
    WHERE t.company_id = p_company_id
      AND t.status IN ('open', 'in_progress')
    GROUP BY t.priority;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record prediction in history
CREATE OR REPLACE FUNCTION record_sla_prediction(
    p_ticket_id UUID,
    p_company_id UUID,
    p_risk_level TEXT,
    p_breach_probability DECIMAL,
    p_time_to_breach INTEGER,
    p_factors JSONB,
    p_confidence DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_prediction_id UUID;
BEGIN
    INSERT INTO sla_prediction_history (
        ticket_id,
        company_id,
        risk_level,
        breach_probability,
        time_to_breach_minutes,
        prediction_factors,
        confidence_score,
        predicted_at
    ) VALUES (
        p_ticket_id,
        p_company_id,
        p_risk_level,
        p_breach_probability,
        p_time_to_breach,
        p_factors,
        p_confidence,
        NOW()
    )
    RETURNING id INTO v_prediction_id;
    
    RETURN v_prediction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Triggers
-- ============================================================================

-- Trigger to automatically record predictions in history when alerts are sent
CREATE OR REPLACE FUNCTION log_prediction_on_alert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sla_prediction_history (
        ticket_id,
        company_id,
        risk_level,
        breach_probability,
        time_to_breach_minutes,
        prediction_factors,
        confidence_score,
        predicted_at
    ) VALUES (
        NEW.ticket_id,
        NEW.company_id,
        NEW.risk_level,
        NEW.breach_probability,
        NEW.time_to_breach_minutes,
        jsonb_build_object('factors', NEW.contributing_factors),
        0.7,  -- Default confidence
        NEW.alert_sent_at
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_prediction_on_alert
    AFTER INSERT ON sla_prediction_alerts
    FOR EACH ROW
    EXECUTE FUNCTION log_prediction_on_alert();

-- ============================================================================
-- 7. Helper Views
-- ============================================================================

-- View: Current at-risk tickets with latest predictions
CREATE OR REPLACE VIEW v_tickets_at_risk AS
SELECT DISTINCT ON (t.id)
    t.id,
    t.subject,
    t.priority,
    t.category,
    t.status,
    t.company_id,
    t.assigned_to,
    t.sla_breach_at,
    EXTRACT(EPOCH FROM (t.sla_breach_at - NOW())) / 60 AS minutes_to_breach,
    sph.risk_level,
    sph.breach_probability,
    sph.predicted_at
FROM tickets t
LEFT JOIN sla_prediction_history sph ON t.id = sph.ticket_id
WHERE t.status IN ('open', 'in_progress')
  AND t.sla_breach_at IS NOT NULL
  AND t.sla_breach_at > NOW()
ORDER BY t.id, sph.predicted_at DESC;

-- View: Alert frequency by risk level
CREATE OR REPLACE VIEW v_alert_frequency AS
SELECT 
    company_id,
    risk_level,
    DATE_TRUNC('hour', alert_sent_at) AS hour,
    COUNT(*) AS alert_count
FROM sla_prediction_alerts
WHERE alert_sent_at >= NOW() - INTERVAL '7 days'
GROUP BY company_id, risk_level, DATE_TRUNC('hour', alert_sent_at)
ORDER BY hour DESC;

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE sla_prediction_alerts IS 'Logs of proactive SLA breach alerts sent to users';
COMMENT ON TABLE sla_prediction_history IS 'Historical record of SLA breach predictions for trend analysis';
COMMENT ON FUNCTION get_sla_risk_trend IS 'Returns risk level trend for a specific ticket over time';
COMMENT ON FUNCTION get_company_sla_stats IS 'Returns company-wide SLA risk statistics';
COMMENT ON FUNCTION record_sla_prediction IS 'Records an SLA prediction in the history table';
COMMENT ON VIEW v_tickets_at_risk IS 'Current tickets at risk of SLA breach with latest predictions';
COMMENT ON VIEW v_alert_frequency IS 'Alert frequency analytics by risk level and time';
