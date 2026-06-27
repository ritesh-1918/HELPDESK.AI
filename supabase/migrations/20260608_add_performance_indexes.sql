-- Migration: Add database indexes for frequently queried columns
-- Target queries from AdminTickets.jsx and AdminUsers.jsx

CREATE INDEX IF NOT EXISTS idx_tickets_company_created
  ON public.tickets (company, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_company_status_created
  ON public.tickets (company, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_company_category
  ON public.tickets (company, category);

CREATE INDEX IF NOT EXISTS idx_tickets_company_priority
  ON public.tickets (company, priority);

CREATE INDEX IF NOT EXISTS idx_tickets_company_assigned_team
  ON public.tickets (company, assigned_team);

CREATE INDEX IF NOT EXISTS idx_profiles_company_id_status
  ON public.profiles (company_id, status);

CREATE INDEX IF NOT EXISTS idx_profiles_company_status
  ON public.profiles (company, status);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id_created
  ON public.ticket_messages (ticket_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_internal_notes_ticket_id
  ON public.internal_notes (ticket_id);
