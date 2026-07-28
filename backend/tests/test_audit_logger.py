import unittest
import json
from datetime import datetime, timezone, timedelta
from backend.services.audit_query_service import AuditQueryService

class FakeSupabaseResult:
    def __init__(self, data):
        self.data = data

class FakeSupabaseTable:
    def __init__(self, data):
        self.data = data
        self.params = {}

    def select(self, *args):
        return self

    def order(self, *args, **kwargs):
        return self

    def eq(self, field, val):
        self.params[field] = val
        return self

    def lte(self, field, val):
        self.params[f"{field}__lte"] = val
        return self

    def gte(self, field, val):
        self.params[f"{field}__gte"] = val
        return self

    def range(self, start, end):
        return self

    def execute(self):
        filtered = self.data
        for k, v in self.params.items():
            if "__lte" in k:
                col = k.replace("__lte", "")
                filtered = [r for r in filtered if r.get(col) <= v]
            elif "__gte" in k:
                col = k.replace("__gte", "")
                filtered = [r for r in filtered if r.get(col) >= v]
            else:
                filtered = [r for r in filtered if r.get(k) == v]
        return FakeSupabaseResult(filtered)

class FakeSupabaseClient:
    def __init__(self, data=None):
        self.data = data or []
        self.rpc_calls = []

    def table(self, name):
        return FakeSupabaseTable(self.data)

    def rpc(self, name, params=None):
        self.rpc_calls.append((name, params))
        class FakeRpc:
            def execute(self):
                # Chain validation response mock
                if name == "verify_chain":
                    return FakeSupabaseResult([{"verified": True, "tampered_audit_id": None}])
                return FakeSupabaseResult(None)
        return FakeRpc()

class TestAuditLoggerFramework(unittest.TestCase):
    def setUp(self):
        self.sample_logs = [
            {
                "id": "audit-1",
                "timestamp": "2026-06-03T10:00:00Z",
                "user_id": "user-abc",
                "company_id": "company-1",
                "action": "user_login",
                "status": "success",
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0",
                "hash": "hash1",
                "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000"
            },
            {
                "id": "audit-2",
                "timestamp": "2026-06-03T10:05:00Z",
                "user_id": "user-abc",
                "company_id": "company-1",
                "action": "view_ticket_detail",
                "resource_type": "ticket",
                "resource_id": "ticket-999",
                "status": "success",
                "ip_address": "192.168.1.1",
                "hash": "hash2",
                "previous_hash": "hash1"
            }
        ]
        self.fake_client = FakeSupabaseClient(self.sample_logs)

    def test_filter_logs(self):
        logs = AuditQueryService.filter_logs(self.fake_client, company_id="company-1")
        self.assertEqual(len(logs), 2)
        
        filtered = AuditQueryService.filter_logs(self.fake_client, action="user_login")
        self.assertEqual(len(filtered), 1)
        self.assertEqual(filtered[0]["id"], "audit-1")

    def test_export_csv(self):
        csv_string = AuditQueryService.export_logs_csv(self.sample_logs)
        self.assertIn("audit_id,timestamp,user_id,company_id", csv_string)
        self.assertIn("user_login", csv_string)
        self.assertIn("view_ticket_detail", csv_string)

    def test_export_json(self):
        json_string = AuditQueryService.export_logs_json(self.sample_logs)
        data = json.loads(json_string)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["id"], "audit-1")

    def test_generate_compliance_report_soc2(self):
        report = AuditQueryService.generate_compliance_report(self.fake_client, "SOC2", "company-1")
        self.assertEqual(report["metadata"]["report_type"], "SOC2")
        self.assertIn("administrative_actions", report["sections"])
        self.assertIn("authentication_events", report["sections"])
        self.assertEqual(report["sections"]["authentication_events"]["count"], 1)

    def test_generate_compliance_report_hipaa(self):
        report = AuditQueryService.generate_compliance_report(self.fake_client, "HIPAA", "company-1")
        self.assertEqual(report["metadata"]["report_type"], "HIPAA")
        self.assertIn("data_access_history", report["sections"])
        self.assertEqual(report["sections"]["data_access_history"]["count"], 1)

    def test_generate_compliance_report_gdpr(self):
        report = AuditQueryService.generate_compliance_report(self.fake_client, "GDPR", "company-1")
        self.assertEqual(report["metadata"]["report_type"], "GDPR")
        self.assertIn("personal_data_access", report["sections"])
        self.assertEqual(report["sections"]["personal_data_access"]["count"], 1)

    def test_security_alerts_failed_logins(self):
        # Generate 5 failed login attempts in 2 minutes
        failed_attempts = []
        base_time = datetime.now(timezone.utc)
        for i in range(5):
            failed_attempts.append({
                "id": f"failed-{i}",
                "timestamp": (base_time - timedelta(minutes=i)).isoformat(),
                "company_id": "company-1",
                "action": "failed_login_attempt",
                "status": "failure",
                "ip_address": "10.0.0.1"
            })
        client = FakeSupabaseClient(failed_attempts)
        alerts = AuditQueryService.detect_security_alerts(client, "company-1")
        
        # Should detect authentication abuse
        auth_alerts = [a for a in alerts if a["category"] == "Authentication Abuse"]
        self.assertTrue(len(auth_alerts) >= 1)
        self.assertEqual(auth_alerts[0]["details"]["ip_address"], "10.0.0.1")

    def test_security_alerts_bulk_views(self):
        # Generate 20 ticket views in 2 minutes
        views = []
        base_time = datetime.now(timezone.utc)
        for i in range(20):
            views.append({
                "id": f"view-{i}",
                "timestamp": (base_time - timedelta(seconds=i*5)).isoformat(),
                "company_id": "company-1",
                "user_id": "user-malicious",
                "action": "view_ticket_detail",
                "status": "success"
            })
        client = FakeSupabaseClient(views)
        alerts = AuditQueryService.detect_security_alerts(client, "company-1")
        
        exfil_alerts = [a for a in alerts if a["category"] == "Data Exfiltration"]
        self.assertTrue(len(exfil_alerts) >= 1)
        self.assertEqual(exfil_alerts[0]["details"]["user_id"], "user-malicious")

    def test_integrity_chain_verification(self):
        result = AuditQueryService.verify_integrity(self.fake_client)
        self.assertTrue(result["verified"])
        self.assertIsNone(result["tampered_audit_id"])

if __name__ == "__main__":
    unittest.main()
