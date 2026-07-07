"""Unit tests for backend/services/audit_service.py - Audit Log Service.

Issue: #1114 - test: add unit tests for audit_service.py
"""

import unittest
from unittest.mock import MagicMock


class TestAuditLogAccessError(unittest.TestCase):
    """Tests for AuditLogAccessError exception."""

    def test_error_with_status_code(self):
        """Error stores status_code and detail."""
        from backend.services.audit_service import AuditLogAccessError
        err = AuditLogAccessError(404, "Ticket not found")
        self.assertEqual(err.status_code, 404)
        self.assertEqual(err.detail, "Ticket not found")
        self.assertIn("Ticket not found", str(err))

    def test_error_500(self):
        """Error with 500 status code."""
        from backend.services.audit_service import AuditLogAccessError
        err = AuditLogAccessError(500, "Database error")
        self.assertEqual(err.status_code, 500)

    def test_error_is_exception(self):
        """AuditLogAccessError is an Exception subclass."""
        from backend.services.audit_service import AuditLogAccessError
        err = AuditLogAccessError(403, "Forbidden")
        self.assertIsInstance(err, Exception)


class TestAuditLogServiceInit(unittest.TestCase):
    """Tests for AuditLogService initialization."""

    def test_init_with_supabase_client(self):
        """Service stores supabase client reference."""
        from backend.services.audit_service import AuditLogService
        mock_client = MagicMock()
        service = AuditLogService(mock_client)
        self.assertEqual(service.supabase, mock_client)


class TestGetTicketAuditLogs(unittest.TestCase):
    """Tests for get_ticket_audit_logs method."""

    def setUp(self):
        from backend.services.audit_service import AuditLogService
        self.mock_client = MagicMock()
        self.service = AuditLogService(self.mock_client)

    def _mock_ticket_response(self, ticket_id, company_id):
        """Helper to mock a successful ticket lookup."""
        mock_result = MagicMock()
        mock_result.data = {"id": ticket_id, "company_id": company_id}
        mock_exec = MagicMock()
        mock_exec.execute.return_value = mock_result
        mock_single = MagicMock()
        mock_single.single.return_value = mock_exec
        mock_eq = MagicMock()
        mock_eq.eq.return_value = mock_single
        mock_select = MagicMock()
        mock_select.select.return_value = mock_eq
        return mock_select

    def _mock_logs_response(self, logs_data):
        """Helper to mock successful audit logs query."""
        mock_result = MagicMock()
        mock_result.data = logs_data
        mock_exec = MagicMock()
        mock_exec.execute.return_value = mock_result
        mock_order = MagicMock()
        mock_order.order.return_value = mock_exec
        mock_eq2 = MagicMock()
        mock_eq2.eq.return_value = mock_order
        mock_eq1 = MagicMock()
        mock_eq1.eq.return_value = mock_eq2
        mock_select = MagicMock()
        mock_select.select.return_value = mock_eq1
        return mock_select

    def test_get_audit_logs_success(self):
        """Valid ticket returns audit logs."""
        # Setup ticket lookup
        self.mock_client.table.return_value = self._mock_ticket_response("TKT-001", "company-123")

        # Setup logs lookup (separate table call)
        def table_side_effect(table_name):
            mock = MagicMock()
            if table_name == "tickets":
                return self._mock_ticket_response("TKT-001", "company-123")
            elif table_name == "audit_logs":
                return self._mock_logs_response([
                    {"id": "log-1", "ticket_id": "TKT-001", "company_id": "company-123",
                     "action": "created", "performed_by": "agent-1", "created_at": "2024-01-01T00:00:00Z"},
                    {"id": "log-2", "ticket_id": "TKT-001", "company_id": "company-123",
                     "action": "updated", "performed_by": "agent-2", "created_at": "2024-01-01T01:00:00Z"},
                ])
            return MagicMock()

        self.mock_client.table.side_effect = table_side_effect

        result = self.service.get_ticket_audit_logs("TKT-001", "company-123")
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["action"], "created")
        self.assertEqual(result[1]["action"], "updated")

    def test_get_audit_logs_empty(self):
        """Ticket with no audit logs returns empty list."""
        def table_side_effect(table_name):
            if table_name == "tickets":
                return self._mock_ticket_response("TKT-002", "company-123")
            elif table_name == "audit_logs":
                return self._mock_logs_response([])
            return MagicMock()

        self.mock_client.table.side_effect = table_side_effect

        result = self.service.get_ticket_audit_logs("TKT-002", "company-123")
        self.assertEqual(result, [])

    def test_ticket_not_found(self):
        """Non-existent ticket raises 404 error."""
        from backend.services.audit_service import AuditLogAccessError

        mock_result = MagicMock()
        mock_result.data = None
        mock_exec = MagicMock()
        mock_exec.execute.return_value = mock_result
        mock_single = MagicMock()
        mock_single.single.return_value = mock_exec
        mock_eq = MagicMock()
        mock_eq.eq.return_value = mock_single
        mock_select = MagicMock()
        mock_select.select.return_value = mock_eq
        self.mock_client.table.return_value = mock_select

        with self.assertRaises(AuditLogAccessError) as ctx:
            self.service.get_ticket_audit_logs("TKT-999", "company-123")
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertIn("not found", str(ctx.exception).lower())

    def test_company_isolation(self):
        """Access restricted to correct company."""
        from backend.services.audit_service import AuditLogAccessError

        # Ticket belongs to company-A, but request is for company-B
        self.mock_client.table.return_value = self._mock_ticket_response("TKT-001", "company-A")

        with self.assertRaises(AuditLogAccessError) as ctx:
            self.service.get_ticket_audit_logs("TKT-001", "company-B")
        self.assertEqual(ctx.exception.status_code, 404)

    def test_company_id_none_in_ticket(self):
        """Ticket with None company_id raises 404."""
        from backend.services.audit_service import AuditLogAccessError

        self.mock_client.table.return_value = self._mock_ticket_response("TKT-001", None)

        with self.assertRaises(AuditLogAccessError):
            self.service.get_ticket_audit_logs("TKT-001", "company-123")

    def test_company_id_empty_string(self):
        """Ticket with empty company_id raises 404."""
        from backend.services.audit_service import AuditLogAccessError

        self.mock_client.table.return_value = self._mock_ticket_response("TKT-001", "")

        with self.assertRaises(AuditLogAccessError):
            self.service.get_ticket_audit_logs("TKT-001", "company-123")

    def test_request_company_id_none(self):
        """Request with None company_id and ticket with no company raises 404."""
        from backend.services.audit_service import AuditLogAccessError

        self.mock_client.table.return_value = self._mock_ticket_response("TKT-001", "")

        with self.assertRaises(AuditLogAccessError):
            self.service.get_ticket_audit_logs("TKT-001", None)

    def test_database_error_during_ticket_fetch(self):
        """Database error during ticket lookup raises 500."""
        from backend.services.audit_service import AuditLogAccessError

        mock_select = MagicMock()
        mock_select.select.side_effect = Exception("Connection timeout")
        self.mock_client.table.return_value = mock_select

        with self.assertRaises(AuditLogAccessError) as ctx:
            self.service.get_ticket_audit_logs("TKT-001", "company-123")
        self.assertEqual(ctx.exception.status_code, 500)

    def test_database_error_during_logs_fetch(self):
        """Database error during audit logs lookup raises 500."""
        from backend.services.audit_service import AuditLogAccessError

        # Ticket lookup succeeds
        mock_ticket_select = self._mock_ticket_response("TKT-001", "company-123")

        # Logs lookup fails
        def table_side_effect(table_name):
            if table_name == "tickets":
                return mock_ticket_select
            elif table_name == "audit_logs":
                mock_select = MagicMock()
                mock_select.select.side_effect = Exception("Connection timeout")
                mock = MagicMock()
                mock.table.return_value = mock_select
                return mock_select
            return MagicMock()

        self.mock_client.table.side_effect = table_side_effect

        with self.assertRaises(AuditLogAccessError) as ctx:
            self.service.get_ticket_audit_logs("TKT-001", "company-123")
        self.assertEqual(ctx.exception.status_code, 500)

    def test_audit_logs_with_joined_profile(self):
        """Audit logs include joined profile data."""
        logs_data = [{
            "id": "log-1",
            "ticket_id": "TKT-001",
            "company_id": "company-123",
            "performed_by": "agent-1",
            "action": "status_change",
            "old_value": "open",
            "new_value": "in_progress",
            "created_at": "2024-01-01T00:00:00Z",
            "performed_by_profile": {
                "full_name": "John Doe",
                "email": "john@example.com",
                "profile_picture": "https://example.com/avatar.jpg",
            },
        }]

        def table_side_effect(table_name):
            if table_name == "tickets":
                return self._mock_ticket_response("TKT-001", "company-123")
            elif table_name == "audit_logs":
                return self._mock_logs_response(logs_data)
            return MagicMock()

        self.mock_client.table.side_effect = table_side_effect

        result = self.service.get_ticket_audit_logs("TKT-001", "company-123")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["action"], "status_change")
        self.assertEqual(result[0]["old_value"], "open")
        self.assertEqual(result[0]["new_value"], "in_progress")

    def test_various_audit_entry_types(self):
        """Different audit log entry types are returned."""
        logs_data = [
            {"id": "log-1", "action": "created", "ticket_id": "TKT-001", "company_id": "C1"},
            {"id": "log-2", "action": "assigned", "ticket_id": "TKT-001", "company_id": "C1"},
            {"id": "log-3", "action": "priority_changed", "ticket_id": "TKT-001", "company_id": "C1"},
            {"id": "log-4", "action": "closed", "ticket_id": "TKT-001", "company_id": "C1"},
        ]

        def table_side_effect(table_name):
            if table_name == "tickets":
                return self._mock_ticket_response("TKT-001", "C1")
            elif table_name == "audit_logs":
                return self._mock_logs_response(logs_data)
            return MagicMock()

        self.mock_client.table.side_effect = table_side_effect

        result = self.service.get_ticket_audit_logs("TKT-001", "C1")
        actions = [r["action"] for r in result]
        self.assertIn("created", actions)
        self.assertIn("assigned", actions)
        self.assertIn("closed", actions)


class TestCompanyIsolationEdgeCases(unittest.TestCase):
    """Edge case tests for company isolation."""

    def setUp(self):
        from backend.services.audit_service import AuditLogService
        self.mock_client = MagicMock()
        self.service = AuditLogService(self.mock_client)

    def test_company_id_type_mismatch(self):
        """Company ID comparison handles type differences (int vs string)."""
        from backend.services.audit_service import AuditLogAccessError

        # Ticket has integer company_id
        mock_result = MagicMock()
        mock_result.data = {"id": "TKT-001", "company_id": 42}
        mock_exec = MagicMock()
        mock_exec.execute.return_value = mock_result
        mock_single = MagicMock()
        mock_single.single.return_value = mock_exec
        mock_eq = MagicMock()
        mock_eq.eq.return_value = mock_single
        mock_select = MagicMock()
        mock_select.select.return_value = mock_eq
        self.mock_client.table.return_value = mock_select

        # Request with string "42" should match after str conversion
        def table_side_effect(table_name):
            if table_name == "tickets":
                return mock_select
            elif table_name == "audit_logs":
                mock_result2 = MagicMock()
                mock_result2.data = [{"id": "log-1"}]
                mock_exec2 = MagicMock()
                mock_exec2.execute.return_value = mock_result2
                mock_order = MagicMock()
                mock_order.order.return_value = mock_exec2
                mock_eq2 = MagicMock()
                mock_eq2.eq.return_value = mock_order
                mock_eq1 = MagicMock()
                mock_eq1.eq.return_value = mock_eq2
                mock_select2 = MagicMock()
                mock_select2.select.return_value = mock_eq1
                return mock_select2
            return MagicMock()

        self.mock_client.table.side_effect = table_side_effect

        result = self.service.get_ticket_audit_logs("TKT-001", "42")
        self.assertEqual(len(result), 1)

    def test_same_company_different_tenant(self):
        """Two different companies cannot see each other's logs."""
        from backend.services.audit_service import AuditLogAccessError

        self.mock_client.table.return_value = MagicMock()
        mock_select = MagicMock()
        mock_result = MagicMock()
        mock_result.data = {"id": "TKT-001", "company_id": "tenant-alpha"}
        mock_exec = MagicMock()
        mock_exec.execute.return_value = mock_result
        mock_single = MagicMock()
        mock_single.single.return_value = mock_exec
        mock_eq = MagicMock()
        mock_eq.eq.return_value = mock_single
        mock_select.select.return_value = mock_eq
        self.mock_client.table.return_value = mock_select

        with self.assertRaises(AuditLogAccessError) as ctx:
            self.service.get_ticket_audit_logs("TKT-001", "tenant-beta")
        self.assertEqual(ctx.exception.status_code, 404)


if __name__ == '__main__':
    unittest.main()
