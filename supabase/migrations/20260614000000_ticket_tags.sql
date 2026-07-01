-- Migration: Create Ticket Tags tables and configuration

-- 1. Create Ticket Tags Table
CREATE TABLE IF NOT EXISTS public.ticket_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    tag_name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_ticket_tag UNIQUE (ticket_id, tag_name)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.ticket_tags ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Authenticated users can read tags
CREATE POLICY "Tags viewable by authenticated users" ON public.ticket_tags
    FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert tags
CREATE POLICY "Tags insertable by authenticated users" ON public.ticket_tags
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- Authenticated users can delete tags
CREATE POLICY "Tags deletable by authenticated users" ON public.ticket_tags
    FOR DELETE TO authenticated USING (true);

-- Service role has full control
CREATE POLICY "Tags full access to service_role" ON public.ticket_tags
    FOR ALL TO service_role USING (true);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_tags_ticket_id ON public.ticket_tags(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tags_tag_name ON public.ticket_tags(tag_name);

-- 5. Grant Permissions
GRANT SELECT, INSERT, DELETE ON public.ticket_tags TO authenticated;
GRANT ALL ON public.ticket_tags TO service_role;
