from __future__ import annotations


class AuditLogAccessError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class AuditLogService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def get_ticket_audit_logs(self, ticket_id: str, company_id: str):
        ticket_result = (
            self.supabase.table("tickets")
            .select("id, company_id")
            .eq("id", ticket_id)
            .single()
            .execute()
        )

        ticket_row = ticket_result.data
        if not ticket_row:
            raise AuditLogAccessError(404, "Ticket not found")

        ticket_company_id = str(ticket_row.get("company_id") or "")
        requested_company_id = str(company_id or "")
        if not ticket_company_id or ticket_company_id != requested_company_id:
            raise AuditLogAccessError(404, "Ticket not found")

        logs_result = (
            self.supabase.table("audit_logs")
            .select(
                "id, ticket_id, company_id, performed_by, action, old_value, new_value, created_at, performed_by_profile:profiles!audit_logs_performed_by_fkey(full_name, email, profile_picture)"
            )
            .eq("ticket_id", ticket_id)
            .eq("company_id", company_id)
            .order("created_at")
            .execute()
        )

        return logs_result.data or []