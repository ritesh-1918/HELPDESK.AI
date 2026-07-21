-- Create the audit logs table
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id UUID NOT NULL, -- references auth.users(id) or public.profiles(id)
    operator_id UUID, -- The user who made the change (if available)
    old_role TEXT,
    new_role TEXT,
    old_status TEXT,
    new_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the audit logs
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow super_admin, admin, and master_admin to view logs
CREATE POLICY "Admins can view auth audit logs" ON public.auth_audit_logs
    FOR SELECT
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );

-- Allow service_role full access
GRANT ALL ON TABLE public.auth_audit_logs TO service_role;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.log_privilege_elevation()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if role or status has changed
    IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.auth_audit_logs (
            target_user_id,
            operator_id,
            old_role,
            new_role,
            old_status,
            new_status
        ) VALUES (
            NEW.id,
            auth.uid(), -- Will capture the ID of the user performing the update if called from the client
            OLD.role,
            NEW.role,
            OLD.status,
            NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the profiles table
DROP TRIGGER IF EXISTS trg_log_privilege_elevation ON public.profiles;
CREATE TRIGGER trg_log_privilege_elevation
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_privilege_elevation();
