-- Migration: User Privacy Preferences, Consent Logging, and Privacy Request Tracking

-- 1. Create User Privacy Preferences Table (Current State)
CREATE TABLE IF NOT EXISTS public.user_privacy_preferences (
    user_id                 UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    marketing_emails        BOOLEAN     NOT NULL DEFAULT TRUE,
    product_updates         BOOLEAN     NOT NULL DEFAULT TRUE,
    announcements           BOOLEAN     NOT NULL DEFAULT TRUE,
    usage_analytics         BOOLEAN     NOT NULL DEFAULT TRUE,
    performance_monitoring  BOOLEAN     NOT NULL DEFAULT TRUE,
    behavior_tracking       BOOLEAN     NOT NULL DEFAULT TRUE,
    experimental_features   BOOLEAN     NOT NULL DEFAULT FALSE,
    research_participation  BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_privacy_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for user_privacy_preferences
CREATE POLICY "Users can manage their own privacy preferences" ON public.user_privacy_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all privacy preferences" ON public.user_privacy_preferences
    FOR SELECT TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_privacy_preferences_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_privacy_preferences_updated_at
    BEFORE UPDATE ON public.user_privacy_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_privacy_preferences_timestamp();


-- 2. Create Consent Logs Table (History)
CREATE TABLE IF NOT EXISTS public.consent_logs (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type   TEXT        NOT NULL,
    previous_state BOOLEAN,
    new_state      BOOLEAN     NOT NULL,
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Policies for consent_logs
CREATE POLICY "Users can view their own consent logs" ON public.consent_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent logs" ON public.consent_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent logs" ON public.consent_logs
    FOR SELECT TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );


-- 3. Create Privacy Requests Table (Export / Deletion requests)
CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type   TEXT        NOT NULL CHECK (request_type IN ('export', 'deletion')),
    status         TEXT        NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Verified', 'Processing', 'Completed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at   TIMESTAMPTZ,
    admin_notes    TEXT
);

-- Enable RLS
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

-- Policies for privacy_requests
CREATE POLICY "Users can manage their own privacy requests" ON public.privacy_requests
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all privacy requests" ON public.privacy_requests
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );


-- 4. Create Privacy Compliance Audit Logs Table (Compliance Records)
CREATE TABLE IF NOT EXISTS public.privacy_audit_logs (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID        NOT NULL,
    action    TEXT        NOT NULL,
    details   JSONB       NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.privacy_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for privacy_audit_logs
CREATE POLICY "Admins can view compliance audit logs" ON public.privacy_audit_logs
    FOR SELECT TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );

CREATE POLICY "Service role can insert audit logs" ON public.privacy_audit_logs
    FOR ALL TO service_role USING (true);


-- 5. Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_privacy_prefs_user ON public.user_privacy_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user ON public.consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_user ON public.privacy_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON public.privacy_requests(status);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE ON public.user_privacy_preferences TO authenticated;
GRANT SELECT, INSERT ON public.consent_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.privacy_requests TO authenticated;
GRANT SELECT ON public.privacy_audit_logs TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
