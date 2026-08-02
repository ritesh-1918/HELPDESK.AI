-- Enterprise Audit Logging Table Schema with Immutability and Hashing triggers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.logs (
    audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid,
    company_id uuid,
    session_id text,
    request_id text,
    action text NOT NULL,
    resource_type text,
    resource_id text,
    operation_type text,
    status text,
    old_value jsonb DEFAULT '{}'::jsonb,
    new_value jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    origin text,
    authentication_method text,
    reason text,
    approval_id text,
    workflow_reference text,
    hash text,
    previous_hash text
);

-- Indexing for high-performance querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit.logs (company_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs (action);

-- Enable RLS on underlying table
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

-- Cryptographic Hashing Trigger to prevent tamper insertion
CREATE OR REPLACE FUNCTION audit.hash_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    prev_hash text;
    record_string text;
BEGIN
    -- Get latest log hash to chain them
    SELECT hash INTO prev_hash FROM audit.logs ORDER BY timestamp DESC, audit_id DESC LIMIT 1;
    IF prev_hash IS NULL THEN
        prev_hash := '0000000000000000000000000000000000000000000000000000000000000000';
    END IF;

    NEW.previous_hash := prev_hash;

    -- Standardized canonical string
    record_string := coalesce(NEW.timestamp::text, '') || '|' ||
                     coalesce(NEW.user_id::text, '') || '|' ||
                     coalesce(NEW.company_id::text, '') || '|' ||
                     coalesce(NEW.action, '') || '|' ||
                     coalesce(NEW.resource_type, '') || '|' ||
                     coalesce(NEW.resource_id, '') || '|' ||
                     coalesce(NEW.operation_type, '') || '|' ||
                     coalesce(NEW.status, '') || '|' ||
                     coalesce(NEW.old_value::text, '') || '|' ||
                     coalesce(NEW.new_value::text, '') || '|' ||
                     coalesce(NEW.ip_address, '') || '|' ||
                     NEW.previous_hash;

    NEW.hash := encode(digest(record_string, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hash_audit_log
BEFORE INSERT ON audit.logs
FOR EACH ROW EXECUTE FUNCTION audit.hash_audit_log();

-- Immutability Triggers (prohibits updates/deletes, with bypass check for archival)
CREATE OR REPLACE FUNCTION audit.prevent_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' AND current_setting('audit.allow_archival_delete', true) = 'true' THEN
        RETURN OLD;
    END IF;
    
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_update
BEFORE UPDATE ON audit.logs
FOR EACH ROW EXECUTE FUNCTION audit.prevent_update_delete();

CREATE TRIGGER trg_prevent_delete
BEFORE DELETE ON audit.logs
FOR EACH ROW EXECUTE FUNCTION audit.prevent_update_delete();

-- Cryptographic verification tool
CREATE OR REPLACE FUNCTION audit.verify_chain()
RETURNS TABLE(verified boolean, tampered_audit_id uuid) AS $$
DECLARE
    r RECORD;
    calc_hash text;
    expected_prev_hash text := '0000000000000000000000000000000000000000000000000000000000000000';
    record_string text;
BEGIN
    FOR r IN SELECT * FROM audit.logs ORDER BY timestamp ASC, audit_id ASC LOOP
        IF r.previous_hash IS DISTINCT FROM expected_prev_hash THEN
            verified := false;
            tampered_audit_id := r.audit_id;
            RETURN NEXT;
            RETURN;
        END IF;

        record_string := coalesce(r.timestamp::text, '') || '|' ||
                         coalesce(r.user_id::text, '') || '|' ||
                         coalesce(r.company_id::text, '') || '|' ||
                         coalesce(r.action, '') || '|' ||
                         coalesce(r.resource_type, '') || '|' ||
                         coalesce(r.resource_id, '') || '|' ||
                         coalesce(r.operation_type, '') || '|' ||
                         coalesce(r.status, '') || '|' ||
                         coalesce(r.old_value::text, '') || '|' ||
                         coalesce(r.new_value::text, '') || '|' ||
                         coalesce(r.ip_address, '') || '|' ||
                         r.previous_hash;

        calc_hash := encode(digest(record_string, 'sha256'), 'hex');

        IF calc_hash IS DISTINCT FROM r.hash THEN
            verified := false;
            tampered_audit_id := r.audit_id;
            RETURN NEXT;
            RETURN;
        END IF;

        expected_prev_hash := r.hash;
    END LOOP;

    verified := true;
    tampered_audit_id := NULL;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Expose table in public schema for compatibility with standard PostgREST usage
CREATE OR REPLACE VIEW public.enterprise_audit_logs AS 
SELECT * FROM audit.logs;

-- Policies for Row Level Security on underlying table
CREATE POLICY "Service role full access" ON audit.logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view own company audit logs" ON audit.logs
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'master_admin')
        )
    );

-- Grant privileges
GRANT USAGE ON SCHEMA audit TO authenticated, service_role;
GRANT SELECT, INSERT ON audit.logs TO authenticated, service_role;
GRANT SELECT, INSERT ON public.enterprise_audit_logs TO authenticated, service_role;

-- Purge function for compliance retention archival
CREATE OR REPLACE FUNCTION audit.purge_expired_logs(expired_before timestamp with time zone)
RETURNS integer AS $$
DECLARE
    deleted_rows integer;
BEGIN
    -- Set session variable to allow deletion
    PERFORM set_config('audit.allow_archival_delete', 'true', true);
    
    DELETE FROM audit.logs WHERE timestamp < expired_before;
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    
    RETURN deleted_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION audit.purge_expired_logs(timestamp with time zone) TO service_role;

