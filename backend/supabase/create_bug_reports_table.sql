-- Create the bug_reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable because anon users might report bugs
    bug_title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_result TEXT,
    actual_result TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    category TEXT NOT NULL CHECK (category IN ('UI Issue', 'Performance', 'Functionality Broken', 'Security Issue', 'Other')),
    contact_permission BOOLEAN DEFAULT false,
    diagnostic_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anonymous reporters (user_id IS NULL) or from an
-- authenticated user reporting on their own behalf (user_id = auth.uid()).
-- The previous policy used `WITH CHECK (true)` which let any caller -- including
-- the anon role -- INSERT rows with a spoofed user_id, enabling impersonation
-- and audit-log forgery (CWE-862).
CREATE POLICY "Allow public inserts" ON public.bug_reports
    FOR INSERT
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Allow admins OR the creator to view reports
CREATE POLICY "Users can view their own reports" ON public.bug_reports
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Super Admins and Admins can view all reports" ON public.bug_reports
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master_admin')
      )
    );

-- Only admins / master admins may change a report's status.
CREATE POLICY "Super Admins and Admins can update reports" ON public.bug_reports
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master_admin')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master_admin')
      )
    );

-- Only admins / master admins may purge reports.
CREATE POLICY "Super Admins and Admins can delete reports" ON public.bug_reports
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'master_admin')
      )
    );

-- Grant privileges (least-privilege for anon: INSERT only, subject to RLS).
-- The previous `GRANT ALL ... TO anon` exposed UPDATE/DELETE/SELECT at the
-- table level to unauthenticated callers; RLS narrowed reads/writes but the
-- table-level grant was unnecessarily broad. Authenticated users keep SELECT
-- so they can read their own reports; admin mutations are mediated by RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bug_reports TO authenticated;
GRANT INSERT ON TABLE public.bug_reports TO anon;
GRANT ALL ON TABLE public.bug_reports TO service_role;
