import unittest

from backend.services.audit_service import AuditLogAccessError, AuditLogService


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, result):
        self._result = result
        self.calls = []

    def select(self, *_args, **_kwargs):
        self.calls.append(("select", _args, _kwargs))
        return self

    def eq(self, *_args, **_kwargs):
        self.calls.append(("eq", _args, _kwargs))
        return self

    def single(self):
        self.calls.append(("single", (), {}))
        return self

    def order(self, *_args, **_kwargs):
        self.calls.append(("order", _args, _kwargs))
        return self

    def execute(self):
        self.calls.append(("execute", (), {}))
        return self._result


class FakeSupabaseClient:
    def __init__(self, ticket_row, audit_rows):
        self.ticket_query = FakeQuery(FakeResult(ticket_row))
        self.audit_query = FakeQuery(FakeResult(audit_rows))

    def table(self, name):
        if name == "tickets":
            return self.ticket_query
        if name == "audit_logs":
            return self.audit_query
        raise AssertionError(f"Unexpected table: {name}")


class AuditLogServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_rejects_cross_company_ticket_access(self):
        client = FakeSupabaseClient({"id": "ticket-1", "company_id": "company-a"}, [])
        service = AuditLogService(client)

        with self.assertRaises(AuditLogAccessError) as ctx:
            service.get_ticket_audit_logs("ticket-1", "company-b")

        self.assertEqual(ctx.exception.status_code, 404)
        self.assertEqual(ctx.exception.detail, "Ticket not found")

    async def test_returns_logs_for_matching_company(self):
        rows = [
            {
                "id": "log-1",
                "ticket_id": "ticket-1",
                "company_id": "company-a",
                "performed_by": "user-1",
                "action": "STATUS_CHANGED",
                "old_value": {"field": "status", "value": "open"},
                "new_value": {"field": "status", "value": "in_progress"},
                "created_at": "2026-05-22T10:00:00Z",
                "performed_by_profile": {"full_name": "Alex Admin"},
            }
        ]
        client = FakeSupabaseClient({"id": "ticket-1", "company_id": "company-a"}, rows)
        service = AuditLogService(client)

        result = service.get_ticket_audit_logs("ticket-1", "company-a")

        self.assertEqual(result, rows)
        self.assertEqual(client.ticket_query.calls[0][0], "select")
        self.assertEqual(client.audit_query.calls[0][0], "select")
        self.assertEqual(client.audit_query.calls[-1][0], "execute")


if __name__ == "__main__":
    unittest.main()
