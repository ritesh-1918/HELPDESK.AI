"""
Unit tests for backend/security/isolation_audit.py.

Covers the data-only side: enums, dataclasses, AuditResult risk-score
property, and pure helpers. The full engine is exercised with a mocked
supabase client.
"""

import os
import sys
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

from backend.security.isolation_audit import (
    Severity,
    AuditCategory,
    AuditFinding,
    AuditResult,
    IsolationAuditEngine,
    TENANT_SENSITIVE_TABLES,
    TENANT_SCOPED_ENDPOINTS,
)


class TestSeverityEnum(unittest.TestCase):
    def test_values(self):
        self.assertEqual(Severity.CRITICAL.value, "critical")
        self.assertEqual(Severity.HIGH.value, "high")
        self.assertEqual(Severity.MEDIUM.value, "medium")
        self.assertEqual(Severity.LOW.value, "low")
        self.assertEqual(Severity.PASS.value, "pass")

    def test_str_inheritance(self):
        self.assertEqual(str(Severity.CRITICAL), "Severity.CRITICAL")
        # Severity is a str subclass so equality with the value works
        self.assertEqual(Severity.CRITICAL, "critical")


class TestAuditCategoryEnum(unittest.TestCase):
    def test_values(self):
        self.assertEqual(AuditCategory.RLS_POLICY.value, "rls_policy")
        self.assertEqual(AuditCategory.CROSS_TENANT.value, "cross_tenant_access")
        self.assertEqual(AuditCategory.IDOR.value, "idor_detection")
        self.assertEqual(AuditCategory.API_ISOLATION.value, "api_isolation")
        self.assertEqual(AuditCategory.MIDDLEWARE.value, "middleware_validation")


class TestAuditFinding(unittest.TestCase):
    def test_minimal_construction(self):
        f = AuditFinding(
            category=AuditCategory.RLS_POLICY,
            severity=Severity.PASS,
            title="ok",
            description="all good",
        )
        self.assertEqual(f.title, "ok")
        self.assertIsNone(f.table)
        self.assertIsNone(f.endpoint)
        self.assertEqual(f.remediation, "")
        self.assertEqual(f.evidence, "")

    def test_full_construction(self):
        f = AuditFinding(
            category=AuditCategory.IDOR,
            severity=Severity.HIGH,
            title="risk",
            description="d",
            table="tickets",
            endpoint="/tickets",
            remediation="r",
            evidence="e",
        )
        self.assertEqual(f.table, "tickets")
        self.assertEqual(f.endpoint, "/tickets")
        self.assertEqual(f.remediation, "r")
        self.assertEqual(f.evidence, "e")


class TestAuditResult(unittest.TestCase):
    def test_defaults(self):
        r = AuditResult()
        self.assertEqual(r.tables_audited, 0)
        self.assertEqual(r.endpoints_audited, 0)
        self.assertEqual(r.policies_passed, 0)
        self.assertEqual(r.policies_failed, 0)
        self.assertEqual(r.isolation_failures, 0)
        self.assertEqual(r.findings, [])
        self.assertEqual(r.leakage_risk, "Unknown")

    def test_risk_score_empty_is_zero(self):
        self.assertEqual(AuditResult().risk_score, 0.0)

    def test_risk_score_caps_at_100(self):
        r = AuditResult()
        for _ in range(10):
            r.findings.append(
                AuditFinding(
                    category=AuditCategory.RLS_POLICY,
                    severity=Severity.CRITICAL,
                    title="x",
                    description="x",
                )
            )
        # 10 * 25 = 250 -> capped at 100
        self.assertEqual(r.risk_score, 100.0)

    def test_risk_score_weighted_sum(self):
        r = AuditResult()
        r.findings = [
            AuditFinding(AuditCategory.RLS_POLICY, Severity.CRITICAL, "a", "a"),  # 25
            AuditFinding(AuditCategory.RLS_POLICY, Severity.HIGH, "b", "b"),       # 15
            AuditFinding(AuditCategory.RLS_POLICY, Severity.MEDIUM, "c", "c"),     # 8
            AuditFinding(AuditCategory.RLS_POLICY, Severity.LOW, "d", "d"),        # 3
            AuditFinding(AuditCategory.RLS_POLICY, Severity.PASS, "e", "e"),       # 0
        ]
        # 25+15+8+3+0 = 51
        self.assertEqual(r.risk_score, 51.0)


class TestTenantSensitiveConstants(unittest.TestCase):
    def test_sensitive_tables_contains_tickets(self):
        self.assertIn("tickets", TENANT_SENSITIVE_TABLES)

    def test_sensitive_tables_contains_users(self):
        self.assertIn("users", TENANT_SENSITIVE_TABLES)

    def test_scoped_endpoints_contains_tickets(self):
        self.assertIn("/tickets", TENANT_SCOPED_ENDPOINTS)


class TestEngineOffline(unittest.TestCase):
    """Tests for IsolationAuditEngine in offline mode (no supabase client)."""

    def test_init_offline(self):
        engine = IsolationAuditEngine()
        self.assertTrue(engine._offline)

    def test_supabase_property_returns_none_offline(self):
        engine = IsolationAuditEngine()
        self.assertIsNone(engine.supabase)

    def test_run_full_audit_offline(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        # tables are still counted
        self.assertEqual(result.tables_audited, len(TENANT_SENSITIVE_TABLES))
        self.assertEqual(result.endpoints_audited, len(TENANT_SCOPED_ENDPOINTS))
        # Each table should produce a PASS finding (offline skip)
        rls_pass = [
            f for f in result.findings
            if f.category == AuditCategory.RLS_POLICY and f.severity == Severity.PASS
        ]
        self.assertEqual(len(rls_pass), len(TENANT_SENSITIVE_TABLES))

    def test_run_full_audit_offline_with_company_ids(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit(company_ids=["A", "B"])
        # No cross-tenant findings when offline (just one PASS)
        ct_findings = [
            f for f in result.findings if f.category == AuditCategory.CROSS_TENANT
        ]
        self.assertGreaterEqual(len(ct_findings), 1)

    def test_run_full_audit_offline_idor(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        idor_findings = [
            f for f in result.findings if f.category == AuditCategory.IDOR
        ]
        # 3 tables + 1 middleware PASS = 4
        self.assertGreaterEqual(len(idor_findings), 4)

    def test_leakage_risk_low_when_no_findings(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        # No critical/high so risk is low
        self.assertEqual(result.leakage_risk, "Low")


class TestEngineWithMockedSupabase(unittest.TestCase):
    """Tests for IsolationAuditEngine with a mocked supabase client."""

    def test_rls_findings_when_table_returns_data(self):
        mock_table = mock.MagicMock()
        mock_select = mock.MagicMock()
        mock_limit = mock.MagicMock()
        mock_exec = mock.MagicMock()
        mock_exec.execute.return_value.data = [
            {"id": "1", "company_id": "C1"},
            {"id": "2", "company_id": "C1"},
        ]
        mock_limit.limit.return_value = mock_exec
        mock_select.select.return_value = mock_limit
        mock_table.table.return_value = mock_select

        engine = IsolationAuditEngine(mock_table)
        result = engine.run_full_audit()
        rls = [
            f for f in result.findings if f.category == AuditCategory.RLS_POLICY
        ]
        # All tables should have PASS findings
        self.assertEqual(len(rls), len(TENANT_SENSITIVE_TABLES))
        for f in rls:
            self.assertEqual(f.severity, Severity.PASS)

    def test_cross_tenant_no_overlap(self):
        mock_table = mock.MagicMock()
        # Build separate mock chains for tenant A and tenant B by tracking call count.
        call_count = {"n": 0}

        def table_side_effect(name):
            m = mock.MagicMock()
            chain = m.select.return_value.eq.return_value.limit.return_value
            call_count["n"] += 1
            if call_count["n"] % 2 == 1:
                chain.execute.return_value.data = [
                    {"id": "a-1", "company_id": "A"},
                ]
            else:
                chain.execute.return_value.data = [
                    {"id": "b-1", "company_id": "B"},
                ]
            return m

        mock_table.table.side_effect = table_side_effect
        engine = IsolationAuditEngine(mock_table)
        result = engine.run_full_audit(company_ids=["A", "B"])
        # No overlaps -> all cross-tenant findings are PASS
        ct = [
            f for f in result.findings
            if f.category == AuditCategory.CROSS_TENANT and f.severity == Severity.PASS
        ]
        self.assertGreaterEqual(len(ct), 1)

    def test_api_isolation_findings_present(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        api = [
            f for f in result.findings if f.category == AuditCategory.API_ISOLATION
        ]
        self.assertEqual(len(api), len(TENANT_SCOPED_ENDPOINTS))
        for f in api:
            self.assertEqual(f.severity, Severity.PASS)


class TestGenerateReport(unittest.TestCase):
    def test_report_contains_summary(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        report = engine.generate_report(result)
        self.assertIn("# Tenant Isolation Security Audit Report", report)
        self.assertIn("## Summary", report)
        self.assertIn("Risk Score", report)
        self.assertIn("Leakage Risk", report)

    def test_report_includes_recommendations(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        report = engine.generate_report(result)
        self.assertIn("Recommendations", report)

    def test_report_includes_passed_checks(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        report = engine.generate_report(result)
        self.assertIn("Passed Checks", report)

    def test_report_with_critical_findings(self):
        engine = IsolationAuditEngine()
        result = AuditResult()
        result.findings.append(
            AuditFinding(
                category=AuditCategory.CROSS_TENANT,
                severity=Severity.CRITICAL,
                title="leak",
                description="d",
                table="tickets",
                remediation="r",
            )
        )
        report = engine.generate_report(result)
        self.assertIn("Critical Findings", report)
        self.assertIn("leak", report)


class TestGenerateJsonReport(unittest.TestCase):
    def test_json_report_structure(self):
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        json_report = engine.generate_json_report(result)
        self.assertIn("timestamp", json_report)
        self.assertIn("risk_score", json_report)
        self.assertIn("leakage_risk", json_report)
        self.assertIn("summary", json_report)
        self.assertIn("findings", json_report)
        self.assertIsInstance(json_report["findings"], list)

    def test_json_report_serializable(self):
        import json
        engine = IsolationAuditEngine()
        result = engine.run_full_audit()
        json_report = engine.generate_json_report(result)
        # Must not raise
        json.dumps(json_report)


if __name__ == "__main__":
    unittest.main()
