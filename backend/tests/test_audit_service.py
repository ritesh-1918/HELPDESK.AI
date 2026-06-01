"""
Unit tests for audit_service.py
"""

import pytest
from unittest.mock import MagicMock
from backend.services.audit_service import AuditLogService, AuditLogAccessError


class TestAuditLogService:
    def test_get_ticket_audit_logs_success(self):
        mock_ticket_result = MagicMock()
        mock_ticket_result.data = {"id": "ticket1", "company_id": "company_A"}

        mock_logs_result = MagicMock()
        mock_logs_result.data = [
            {
                "id": "log1",
                "ticket_id": "ticket1",
                "company_id": "company_A",
                "performed_by": "user_A",
                "action": "created",
                "old_value": None,
                "new_value": "open",
                "created_at": "2026-05-30T10:00:00Z",
            },
            {
                "id": "log2",
                "ticket_id": "ticket1",
                "company_id": "company_A",
                "performed_by": "user_B",
                "action": "status_changed",
                "old_value": "open",
                "new_value": "pending",
                "created_at": "2026-05-30T11:00:00Z",
            },
        ]

        mock_table = MagicMock()
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_ticket_result

        mock_table2 = MagicMock()
        mock_table2.select.return_value = mock_table2
        mock_table2.eq.return_value = mock_table2
        mock_table2.order.return_value = mock_table2
        mock_table2.execute.return_value = mock_logs_result

        mock_supabase = MagicMock()
        mock_supabase.table.side_effect = [mock_table, mock_table2]

        audit_service = AuditLogService(mock_supabase)
        logs = audit_service.get_ticket_audit_logs("ticket1", "company_A")

        assert len(logs) == 2
        assert logs[0]["action"] == "created"
        assert logs[1]["action"] == "status_changed"

    def test_get_ticket_audit_logs_missing_ticket(self):
        mock_ticket_result = MagicMock()
        mock_ticket_result.data = None

        mock_table = MagicMock()
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_ticket_result

        mock_supabase = MagicMock()
        mock_supabase.table.return_value = mock_table

        audit_service = AuditLogService(mock_supabase)

        with pytest.raises(AuditLogAccessError) as exc_info:
            audit_service.get_ticket_audit_logs("nonexistent", "company_A")

        assert exc_info.value.status_code == 404
        assert "Ticket not found" in str(exc_info.value.detail)

    def test_get_ticket_audit_logs_company_mismatch(self):
        mock_ticket_result = MagicMock()
        mock_ticket_result.data = {"id": "ticket1", "company_id": "company_A"}

        mock_table = MagicMock()
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_ticket_result

        mock_supabase = MagicMock()
        mock_supabase.table.return_value = mock_table

        audit_service = AuditLogService(mock_supabase)

        with pytest.raises(AuditLogAccessError) as exc_info:
            audit_service.get_ticket_audit_logs("ticket1", "company_B")

        assert exc_info.value.status_code == 404
        assert "Ticket not found" in str(exc_info.value.detail)

    def test_get_ticket_audit_logs_empty_results(self):
        mock_ticket_result = MagicMock()
        mock_ticket_result.data = {"id": "ticket1", "company_id": "company_A"}

        mock_logs_result = MagicMock()
        mock_logs_result.data = []

        mock_table = MagicMock()
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_ticket_result

        mock_table2 = MagicMock()
        mock_table2.select.return_value = mock_table2
        mock_table2.eq.return_value = mock_table2
        mock_table2.order.return_value = mock_table2
        mock_table2.execute.return_value = mock_logs_result

        mock_supabase = MagicMock()
        mock_supabase.table.side_effect = [mock_table, mock_table2]

        audit_service = AuditLogService(mock_supabase)
        logs = audit_service.get_ticket_audit_logs("ticket1", "company_A")

        assert logs == []

    def test_audit_log_access_error_attributes(self):
        error = AuditLogAccessError(404, "Not found")

        assert error.status_code == 404
        assert error.detail == "Not found"
        assert str(error) == "Not found"

    def test_get_ticket_audit_logs_with_profile_join(self):
        mock_ticket_result = MagicMock()
        mock_ticket_result.data = {"id": "ticket1", "company_id": "company_A"}

        mock_logs_result = MagicMock()
        mock_logs_result.data = [
            {
                "id": "log1",
                "ticket_id": "ticket1",
                "company_id": "company_A",
                "performed_by": "user_A",
                "action": "created",
                "old_value": None,
                "new_value": "open",
                "created_at": "2026-05-30T10:00:00Z",
                "performed_by_profile": {
                    "full_name": "Test User",
                    "email": "test@example.com",
                    "profile_picture": None,
                },
            },
        ]

        mock_table = MagicMock()
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_ticket_result

        mock_table2 = MagicMock()
        mock_table2.select.return_value = mock_table2
        mock_table2.eq.return_value = mock_table2
        mock_table2.order.return_value = mock_table2
        mock_table2.execute.return_value = mock_logs_result

        mock_supabase = MagicMock()
        mock_supabase.table.side_effect = [mock_table, mock_table2]

        audit_service = AuditLogService(mock_supabase)
        logs = audit_service.get_ticket_audit_logs("ticket1", "company_A")

        assert len(logs) == 1
        assert logs[0]["performed_by_profile"]["full_name"] == "Test User"