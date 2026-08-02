-- Enterprise Authentication Suite (SAML2 & OAuth2 Configs)
-- Migration: 20260603000000_enterprise_auth_suite.sql

-- 1. Create SSO Providers Table
CREATE TABLE IF NOT EXISTS public.sso_providers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    provider_name   TEXT        NOT NULL, -- 'okta', 'azure', 'google', 'generic'
    protocol        TEXT        NOT NULL CHECK (protocol IN ('saml', 'oidc', 'oauth')),
    domain_names    TEXT[]      NOT NULL DEFAULT '{}', -- e.g. {'company.com', 'subsidiary.com'}
    metadata_url    TEXT,
    metadata_xml    TEXT,
    client_id       TEXT,
    client_secret   TEXT,
    sso_url         TEXT, -- SAML SSO Endpoint
    entity_id       TEXT, -- SAML Entity ID
    x509_cert       TEXT, -- SAML signing certificate
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create SSO Role Mappings Table
CREATE TABLE IF NOT EXISTS public.sso_role_mappings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    idp_group       TEXT        NOT NULL, -- Group name inside Okta / Azure AD
    app_role        TEXT        NOT NULL CHECK (app_role IN ('super_admin', 'admin', 'user')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, idp_group)
);

-- 3. Create SSO Provisioning Settings Table
CREATE TABLE IF NOT EXISTS public.sso_provisioning_settings (
    company_id      UUID        PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    enable_jit      BOOLEAN     NOT NULL DEFAULT TRUE,
    default_role    TEXT        NOT NULL DEFAULT 'user' CHECK (default_role IN ('super_admin', 'admin', 'user')),
    auto_deprovision BOOLEAN    NOT NULL DEFAULT FALSE,
    sync_groups     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create SSO Audit Logs Table
CREATE TABLE IF NOT EXISTS public.sso_audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    event_type      TEXT        NOT NULL CHECK (event_type IN ('login_success', 'login_failed', 'provision_user', 'deprovision_user', 'group_sync')),
    user_email      TEXT        NOT NULL,
    provider_name   TEXT        NOT NULL,
    details         JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_sso_providers_company_id ON public.sso_providers(company_id);
CREATE INDEX IF NOT EXISTS idx_sso_providers_domain_names ON public.sso_providers USING GIN(domain_names);
CREATE INDEX IF NOT EXISTS idx_sso_role_mappings_company_id ON public.sso_role_mappings(company_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_logs_company_id ON public.sso_audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_logs_created_at ON public.sso_audit_logs(created_at DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_role_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_provisioning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- SSO Providers: Viewable by authenticated company members, editable by company admins
CREATE POLICY "SSO Providers select policy" ON public.sso_providers
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "SSO Providers manage policy" ON public.sso_providers
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- SSO Role Mappings: Viewable by authenticated company members, editable by company admins
CREATE POLICY "SSO Role Mappings select policy" ON public.sso_role_mappings
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "SSO Role Mappings manage policy" ON public.sso_role_mappings
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- SSO Provisioning Settings: Viewable by authenticated company members, editable by company admins
CREATE POLICY "SSO Provisioning Settings select policy" ON public.sso_provisioning_settings
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "SSO Provisioning Settings manage policy" ON public.sso_provisioning_settings
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
    WITH CHECK (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- SSO Audit Logs: Viewable by company members, insertable via system
CREATE POLICY "SSO Audit Logs select policy" ON public.sso_audit_logs
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "SSO Audit Logs insert policy" ON public.sso_audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- 8. Trigger to Automatically Create Provisioning Settings for New Companies
CREATE OR REPLACE FUNCTION public.handle_new_company_sso_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.sso_provisioning_settings (company_id, enable_jit, default_role, auto_deprovision, sync_groups)
    VALUES (NEW.id, TRUE, 'user', FALSE, TRUE)
    ON CONFLICT (company_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_company_created_sso_settings
    AFTER INSERT ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_company_sso_settings();

-- 9. Backfill Default Provisioning Settings for Existing Companies
INSERT INTO public.sso_provisioning_settings (company_id, enable_jit, default_role, auto_deprovision, sync_groups)
SELECT id, TRUE, 'user', FALSE, TRUE FROM public.companies
ON CONFLICT (company_id) DO NOTHING;

-- 10. Update timestamps triggers
CREATE OR REPLACE FUNCTION public.update_sso_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_sso_providers_updated_at
    BEFORE UPDATE ON public.sso_providers
    FOR EACH ROW EXECUTE FUNCTION public.update_sso_timestamp();

CREATE OR REPLACE TRIGGER trigger_sso_provisioning_settings_updated_at
    BEFORE UPDATE ON public.sso_provisioning_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_sso_timestamp();

-- 11. Grant Permissions to authenticated and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sso_providers TO authenticated;
GRANT ALL ON public.sso_providers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sso_role_mappings TO authenticated;
GRANT ALL ON public.sso_role_mappings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sso_provisioning_settings TO authenticated;
GRANT ALL ON public.sso_provisioning_settings TO service_role;

GRANT SELECT, INSERT ON public.sso_audit_logs TO authenticated;
GRANT ALL ON public.sso_audit_logs TO service_role;
