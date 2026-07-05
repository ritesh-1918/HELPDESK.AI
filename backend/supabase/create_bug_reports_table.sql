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

-- Allow anyone (even anonymous) to insert a bug report. 
-- For a SaaS dashboard, usually only authenticated users are reporting, 
-- but in an open demo it's safer to allow inserts.
CREATE POLICY "Allow public inserts" ON public.bug_reports
    FOR INSERT
    WITH CHECK (true);

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

-- Grant privileges
GRANT ALL ON TABLE public.bug_reports TO authenticated;
GRANT ALL ON TABLE public.bug_reports TO anon;
GRANT ALL ON TABLE public.bug_reports TO service_role;
