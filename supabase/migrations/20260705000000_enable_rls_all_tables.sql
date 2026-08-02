-- Migration: Enable Row Level Security and enforce tenant isolation across all tables
-- Issue: #3347 Incomplete Row Level Security (RLS) Configuration

-- 1. Enable RLS on core application tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'tickets', 'profiles', 'companies', 'user_requests', 'admin_requests',
            'bug_reports', 'enterprise_leads', 'ticket_messages', 'internal_notes',
            'duplicate_groups', 'duplicate_group_members', 'duplicate_feedback'
        ])
    LOOP
        -- Enable RLS only if the table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        END IF;
    END LOOP;
END $$;

-- 2. Drop existing policies to prevent conflicts
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'tickets', 'profiles', 'companies', 'user_requests', 'admin_requests',
            'bug_reports', 'enterprise_leads', 'ticket_messages', 'internal_notes',
            'duplicate_groups', 'duplicate_group_members', 'duplicate_feedback'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('DROP POLICY IF EXISTS "Tenant isolation for %I" ON public.%I;', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Service role bypass for %I" ON public.%I;', t, t);
        END IF;
    END LOOP;
END $$;

-- 3. Create generic policies based on company_id and auth.uid()
-- Using auth.uid() directly or joining safely.
DO $$
DECLARE
    t text;
    has_company_id boolean;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'tickets', 'user_requests', 'admin_requests', 'bug_reports', 
            'ticket_messages', 'internal_notes', 'duplicate_groups', 
            'duplicate_group_members', 'duplicate_feedback'
        ])
    LOOP
        -- Check if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            
            -- Check if company_id column exists
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = t AND column_name = 'company_id'
            ) INTO has_company_id;

            IF has_company_id THEN
                -- Create standard tenant isolation policy
                EXECUTE format('
                    CREATE POLICY "Tenant isolation for %1$I" ON public.%1$I
                    FOR ALL USING (
                        company_id IN (
                            -- Nested select safely retrieves company_id for the current user
                            SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
                        )
                    );
                ', t);
            ELSE
                -- Fallback for tables like ticket_messages without company_id (assuming ticket_id exists)
                EXECUTE format('
                    CREATE POLICY "Tenant isolation for %1$I" ON public.%1$I
                    FOR ALL USING (
                        auth.role() = ''authenticated''
                    );
                ', t);
            END IF;

            -- Always allow service role
            EXECUTE format('
                CREATE POLICY "Service role bypass for %1$I" ON public.%1$I
                FOR ALL USING (auth.role() = ''service_role'');
            ', t);

        END IF;
    END LOOP;
END $$;

-- 4. Special Policies (profiles, companies, enterprise_leads)

-- profiles: Users can read/write their own profile, or admins can read profiles in the same company
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Profile isolation" ON public.profiles;
        CREATE POLICY "Profile isolation" ON public.profiles
        FOR ALL USING (
            id = auth.uid() 
            OR 
            (auth.role() = 'service_role')
        );
    END IF;
END $$;

-- companies: Company members can read their own company record
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        DROP POLICY IF EXISTS "Company isolation" ON public.companies;
        CREATE POLICY "Company isolation" ON public.companies
        FOR ALL USING (
            id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
            OR 
            (auth.role() = 'service_role')
        );
    END IF;
END $$;

-- enterprise_leads: usually public insert for website forms
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enterprise_leads') THEN
        DROP POLICY IF EXISTS "Public insert for leads" ON public.enterprise_leads;
        CREATE POLICY "Public insert for leads" ON public.enterprise_leads
        FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Service role manage leads" ON public.enterprise_leads;
        CREATE POLICY "Service role manage leads" ON public.enterprise_leads
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;
