-- Migration: Create audit logs table and associated triggers for tickets
-- Date: 2026-06-01
-- Objective: Track ticket creation, status changes, priority corrections, team changes, assignee changes, AI overrides, and reopening.

-- Drop existing trigger first to prevent compile locks
DROP TRIGGER IF EXISTS ticket_audit_trigger ON public.tickets;
DROP FUNCTION IF EXISTS public.process_ticket_audit();

-- Recreate audit_logs table with exact required schema columns
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- 'create', 'status_change', 'priority_change', 'team_change', 'assignee_change', 'ai_override', 'reopen'
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast chronological timeline fetches
CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_id ON public.audit_logs(ticket_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view audit logs for tickets belonging to their company
CREATE POLICY "Users can view audit logs of their own company's tickets" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

-- Policy 2: service_role has full control
CREATE POLICY "Service role full access on audit logs" ON public.audit_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant privileges
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- PL/pgSQL Trigger Function to process ticket changes
CREATE OR REPLACE FUNCTION public.process_ticket_audit()
RETURNS TRIGGER AS $$
DECLARE
    actor_id_var UUID := NULL;
    old_assignee_name TEXT := 'Unassigned';
    new_assignee_name TEXT := 'Unassigned';
BEGIN
    -- 1. Identify the actor
    IF auth.uid() IS NOT NULL THEN
        actor_id_var := auth.uid();
    END IF;

    -- 2. Handle INSERT (Ticket Creation)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (
            ticket_id,
            company_id,
            performed_by,
            action,
            old_value,
            new_value
        ) VALUES (
            NEW.id,
            NEW.company_id,
            actor_id_var,
            'create',
            NULL,
            NULL
        );
        RETURN NEW;
    END IF;

    -- 3. Handle UPDATE (Ticket updates)
    IF (TG_OP = 'UPDATE') THEN
        -- A. Reopen Check: Transition from 'resolved' to 'pending_human' (or any open status like 'pending')
        IF OLD.status = 'resolved' AND NEW.status = 'pending_human' THEN
            INSERT INTO public.audit_logs (
                ticket_id, company_id, performed_by, action, old_value, new_value
            ) VALUES (
                NEW.id, NEW.company_id, actor_id_var, 'reopen', OLD.status, NEW.status
            );
        -- B. Standard Status Change Check
        ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO public.audit_logs (
                ticket_id, company_id, performed_by, action, old_value, new_value
            ) VALUES (
                NEW.id, NEW.company_id, actor_id_var, 'status_change', OLD.status, NEW.status
            );
        END IF;

        -- C. Category / Subcategory corrections (AI Overrides)
        IF OLD.category IS DISTINCT FROM NEW.category OR OLD.subcategory IS DISTINCT FROM NEW.subcategory THEN
            INSERT INTO public.audit_logs (
                ticket_id, company_id, performed_by, action, old_value, new_value
            ) VALUES (
                NEW.id,
                NEW.company_id,
                actor_id_var,
                'ai_override',
                COALESCE(OLD.category, 'None') || ' / ' || COALESCE(OLD.subcategory, 'None'),
                COALESCE(NEW.category, 'None') || ' / ' || COALESCE(NEW.subcategory, 'None')
            );
        END IF;

        -- D. Priority Overrides / Adjustments
        IF OLD.priority IS DISTINCT FROM NEW.priority THEN
            -- Check if it was part of an AI correction override or just standard priority change
            IF OLD.category IS DISTINCT FROM NEW.category OR NEW.metadata->>'corrected_at' IS DISTINCT FROM OLD.metadata->>'corrected_at' THEN
                INSERT INTO public.audit_logs (
                    ticket_id, company_id, performed_by, action, old_value, new_value
                ) VALUES (
                    NEW.id, NEW.company_id, actor_id_var, 'ai_override', OLD.priority, NEW.priority
                );
            ELSE
                INSERT INTO public.audit_logs (
                    ticket_id, company_id, performed_by, action, old_value, new_value
                ) VALUES (
                    NEW.id, NEW.company_id, actor_id_var, 'priority_change', OLD.priority, NEW.priority
                );
            END IF;
        END IF;

        -- E. Team Change Check
        IF OLD.assigned_team IS DISTINCT FROM NEW.assigned_team THEN
            INSERT INTO public.audit_logs (
                ticket_id, company_id, performed_by, action, old_value, new_value
            ) VALUES (
                NEW.id,
                NEW.company_id,
                actor_id_var,
                'team_change',
                OLD.assigned_team,
                NEW.assigned_team
            );
        END IF;

        -- F. Assignee Change Check
        IF OLD.assigned_agent_id IS DISTINCT FROM NEW.assigned_agent_id THEN
            IF OLD.assigned_agent_id IS NOT NULL THEN
                SELECT COALESCE(full_name, email, 'Agent') INTO old_assignee_name 
                FROM public.profiles 
                WHERE id = OLD.assigned_agent_id;
            END IF;
            
            IF NEW.assigned_agent_id IS NOT NULL THEN
                SELECT COALESCE(full_name, email, 'Agent') INTO new_assignee_name 
                FROM public.profiles 
                WHERE id = NEW.assigned_agent_id;
            END IF;

            INSERT INTO public.audit_logs (
                ticket_id,
                company_id,
                performed_by,
                action,
                old_value,
                new_value
            ) VALUES (
                NEW.id,
                NEW.company_id,
                actor_id_var,
                'assignee_change',
                old_assignee_name,
                new_assignee_name
            );
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to tickets table
CREATE TRIGGER ticket_audit_trigger
    AFTER INSERT OR UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.process_ticket_audit();
