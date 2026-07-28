-- Knowledge Gaps Detection Table
-- Tracks recurring issues that lack sufficient documentation in the Knowledge Base.

CREATE TABLE IF NOT EXISTS public.knowledge_gaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL, -- references companies(id) if applicable
    cluster_subject TEXT NOT NULL,
    occurrences INT NOT NULL DEFAULT 0,
    unique_users INT NOT NULL DEFAULT 0,
    gap_score FLOAT NOT NULL DEFAULT 0.0,
    coverage_status TEXT NOT NULL CHECK (coverage_status IN ('None', 'Partial', 'Covered')),
    recommended_draft TEXT,
    resolution_time_avg_hours FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_gaps ENABLE ROW LEVEL SECURITY;

-- Admins can view knowledge gaps
CREATE POLICY "Admins can view knowledge gaps"
    ON public.knowledge_gaps FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );

-- Admins can modify knowledge gaps
CREATE POLICY "Admins can modify knowledge gaps"
    ON public.knowledge_gaps FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'master_admin')
    );
