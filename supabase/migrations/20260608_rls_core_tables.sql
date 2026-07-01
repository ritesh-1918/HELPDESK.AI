-- Migration: Enable RLS on core tables and define tenant-isolation policies
-- Addresses missing RLS on tickets, profiles, ticket_messages, internal_notes
-- and adds server-side authorization for ticket mutations.

-- ── tickets ────────────────────────────────────────────────────────────────
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tickets_user_select ON public.tickets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (role IN ('admin', 'super_admin', 'master_admin'))
        AND (company = tickets.company OR company_id = tickets.company_id)
    )
  );

CREATE POLICY tickets_admin_update ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin', 'master_admin')
        AND (company = tickets.company OR company_id = tickets.company_id)
    )
  );

CREATE POLICY tickets_insert ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── profiles ───────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid()
        AND p2.role IN ('admin', 'super_admin', 'master_admin')
        AND (p2.company = profiles.company OR p2.company_id = profiles.company_id)
    )
  );

CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── ticket_messages ────────────────────────────────────────────────────────
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_messages_select ON public.ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_messages.ticket_id
        AND (
          tickets.user_id = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'super_admin', 'master_admin')
              AND (profiles.company = tickets.company OR profiles.company_id = tickets.company_id)
          )
        )
    )
  );

CREATE POLICY ticket_messages_insert ON public.ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_messages.ticket_id
        AND (
          tickets.user_id = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'super_admin', 'master_admin')
              AND (profiles.company = tickets.company OR profiles.company_id = tickets.company_id)
          )
        )
    )
  );

-- ── internal_notes ─────────────────────────────────────────────────────────
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY internal_notes_select ON public.internal_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'master_admin')
    )
  );

CREATE POLICY internal_notes_insert ON public.internal_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'master_admin')
    )
  );
