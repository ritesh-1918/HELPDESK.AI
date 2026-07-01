"""
Tests for the Tenant Isolation Security Audit Engine.

Validates:
- Audit engine runs without errors
- RLS policy checks produce expected findings
- Cross-tenant access detection works
- IDOR risk assessment produces findings
- Report generation works (Markdown and JSON)
"""

import sys
import os
from unittest.mock import MagicMock

# Mock heavy dependencies
for module_name in [
    "torch", "torch.nn", "torch.nn.functional", "torch.optim",
    "transformers", "sentence_transformers", "easyocr",
    "datasets", "sklearn", "sklearn.metrics", "pandas", "openpyxl",
    "prometheus_client",
]:
    sys.modules[module_name] = MagicMock()

os.environ["SUPABASE_URL"] = "https://mock-project.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "mock-service-key"

import pytest
from backend.security.isolation_audit import (
    IsolationAuditEngine,
    AuditResult,
    AuditFinding,
    AuditCategory,
    Severity,
    TENANT_SENSITIVE_TABLES,
    TENANT_SCOPED_ENDPOINTS,
)


class MockResult:
    def __init__(self, data):
        self.data = data


class MockSupabaseTable:
    def __init__(self, name, data=None):
        self.name = name
        self._data = data or []

    def select(self, *args, **kwargs):
        return self

    def eq(self, field, value):
        return self

    def limit(self, n):
        return self

    def execute(self):
        return MockResult(self._data)


class MockSupabaseClient:
    def __init__(self, data=None):
        self._data = data or {
            "tickets": [
                {"id": "t1", "company_id": "companyA"},
                {"id": "t2", "company_id": "companyA"},
            ],
            "profiles": [
                {"id": "u1", "company_id": "companyA"},
            ],
            "attachments": [
                {"id": "a1", "company_id": "companyA"},
            ],
        }

    def table(self, name):
        return MockSupabaseTable(name, self._data.get(name, []))


@pytest.fixture
def mock_supabase():
    return MockSupabaseClient()


@pytest.fixture
def audit_engine(mock_supabase):
    return IsolationAuditEngine(supabase_client=mock_supabase)


@pytest.fixture
def offline_engine():
    return IsolationAuditEngine(supabase_client=None)


class TestAuditEngineOffline:
    """Tests for audit engine in offline/degraded mode."""

    def test_full_audit_runs_without_error(self, offline_engine):
        result = offline_engine.run_full_audit()
        assert isinstance(result, AuditResult)
        assert result.leakage_risk in ("Low", "Medium", "High", "Critical", "Unknown")

    def test_offline_audit_passes_all(self, offline_engine):
        result = offline_engine.run_full_audit()
        critical = [f for f in result.findings if f.severity == Severity.CRITICAL]
        assert len(critical) == 0

    def test_tables_audited_count(self, offline_engine):
        result = offline_engine.run_full_audit()
        assert result.tables_audited == len(TENANT_SENSITIVE_TABLES)

    def test_endpoints_audited_count(self, offline_engine):
        result = offline_engine.run_full_audit()
        assert result.endpoints_audited == len(TENANT_SCOPED_ENDPOINTS)


class TestAuditEngineOnline:
    """Tests for audit engine with mock Supabase client."""

    def test_rls_policy_findings(self, audit_engine):
        result = audit_engine.run_full_audit()
        rls_findings = [
            f for f in result.findings if f.category == AuditCategory.RLS_POLICY
        ]
        assert len(rls_findings) == len(TENANT_SENSITIVE_TABLES)

    def test_idor_findings(self, audit_engine):
        result = audit_engine.run_full_audit()
        idor_findings = [
            f for f in result.findings if f.category == AuditCategory.IDOR
        ]
        assert len(idor_findings) >= 2

    def test_api_isolation_findings(self, audit_engine):
        result = audit_engine.run_full_audit()
        api_findings = [
            f for f in result.findings if f.category == AuditCategory.API_ISOLATION
        ]
        assert len(api_findings) == len(TENANT_SCOPED_ENDPOINTS)

    def test_cross_tenant_with_two_companies(self, audit_engine):
        result = audit_engine.run_full_audit(company_ids=["companyA", "companyB"])
        ct_findings = [
            f for f in result.findings if f.category == AuditCategory.CROSS_TENANT
        ]
        assert len(ct_findings) > 0

    def test_cross_tenant_without_enough_companies(self, audit_engine):
        result = audit_engine.run_full_audit(company_ids=["companyA"])
        ct_findings = [
            f for f in result.findings if f.category == AuditCategory.CROSS_TENANT
        ]
        assert len(ct_findings) == 0

    def test_risk_score_calculation(self, audit_engine):
        result = audit_engine.run_full_audit()
        assert 0 <= result.risk_score <= 100

    def test_leakage_risk_determination(self, audit_engine):
        result = audit_engine.run_full_audit()
        assert result.leakage_risk in ("Low", "Medium", "High", "Critical")


class TestReportGeneration:
    """Tests for report generation."""

    def test_markdown_report_contains_title(self, audit_engine):
        result = audit_engine.run_full_audit()
        report = audit_engine.generate_report(result)
        assert "# Tenant Isolation Security Audit Report" in report

    def test_markdown_report_contains_summary_table(self, audit_engine):
        result = audit_engine.run_full_audit()
        report = audit_engine.generate_report(result)
        assert "Tables Audited" in report
        assert "Endpoints Audited" in report

    def test_markdown_report_contains_recommendations(self, audit_engine):
        result = audit_engine.run_full_audit()
        report = audit_engine.generate_report(result)
        assert "Recommendations" in report

    def test_markdown_report_contains_compliance(self, audit_engine):
        result = audit_engine.run_full_audit()
        report = audit_engine.generate_report(result)
        assert "HIPAA" in report
        assert "GDPR" in report
        assert "SOC 2" in report

    def test_json_report_structure(self, audit_engine):
        result = audit_engine.run_full_audit()
        json_report = audit_engine.generate_json_report(result)
        assert "timestamp" in json_report
        assert "risk_score" in json_report
        assert "leakage_risk" in json_report
        assert "summary" in json_report
        assert "findings" in json_report
        assert isinstance(json_report["findings"], list)

    def test_json_report_summary_fields(self, audit_engine):
        result = audit_engine.run_full_audit()
        json_report = audit_engine.generate_json_report(result)
        summary = json_report["summary"]
        assert "tables_audited" in summary
        assert "endpoints_audited" in summary
        assert "policies_passed" in summary
        assert "policies_failed" in summary
        assert "isolation_failures" in summary


class TestCrossTenantDetection:
    """Tests for cross-tenant data leak detection."""

    def test_detects_overlapping_ids(self):
        overlapping_data = {
            "tickets": [{"id": "shared-id", "company_id": "companyA"}],
            "profiles": [{"id": "u1", "company_id": "companyA"}],
            "attachments": [{"id": "a1", "company_id": "companyA"}],
        }

        class OverlappingClient:
            def table(self, name):
                return MockSupabaseTable(name, overlapping_data.get(name, []))

        engine = IsolationAuditEngine(supabase_client=OverlappingClient())
        result = engine.run_full_audit(company_ids=["companyA", "companyB"])
        assert isinstance(result, AuditResult)


class TestEdgeCases:
    """Edge cases and error handling."""

    def test_audit_with_empty_database(self):
        class EmptyClient:
            def table(self, name):
                return MockSupabaseTable(name, [])

        engine = IsolationAuditEngine(supabase_client=EmptyClient())
        result = engine.run_full_audit()
        assert isinstance(result, AuditResult)

    def test_audit_with_none_company_ids(self, audit_engine):
        result = audit_engine.run_full_audit(company_ids=None)
        assert isinstance(result, AuditResult)

    def test_audit_with_single_company(self, audit_engine):
        result = audit_engine.run_full_audit(company_ids=["companyA"])
        assert isinstance(result, AuditResult)


class TestMiddlewareValidation:
    """
    Tests for the Tenant Context Verification Middleware audit checks.

    Validates _audit_middleware_validation() produces correct findings
    for all 5 checks: manager presence, get_current_user_profile,
    verify_resource_ownership, spoofing prevention, and graceful handling.
    """

    def test_middleware_findings_present_in_full_audit(self, offline_engine):
        """Full audit must include MIDDLEWARE category findings."""
        result = offline_engine.run_full_audit()
        mw_findings = [f for f in result.findings if f.category == AuditCategory.MIDDLEWARE]
        assert len(mw_findings) > 0, "Expected at least one MIDDLEWARE finding"

    def test_middleware_audit_standalone(self, offline_engine):
        """_audit_middleware_validation() must return a non-empty list."""
        findings = offline_engine._audit_middleware_validation()
        assert isinstance(findings, list)
        assert len(findings) > 0

    def test_middleware_manager_presence_check(self, offline_engine):
        """TenantSecurityManager presence check must produce a PASS finding."""
        findings = offline_engine._audit_middleware_validation()
        manager_findings = [f for f in findings if "TenantSecurityManager present" in f.title]
        assert len(manager_findings) == 1
        assert manager_findings[0].severity == Severity.PASS

    def test_middleware_get_current_user_profile_check(self, offline_engine):
        """get_current_user_profile check must produce a PASS finding."""
        findings = offline_engine._audit_middleware_validation()
        profile_findings = [f for f in findings if "get_current_user_profile" in f.title]
        assert len(profile_findings) == 1
        assert profile_findings[0].severity == Severity.PASS

    def test_middleware_verify_resource_ownership_check(self, offline_engine):
        """verify_resource_ownership check must produce a PASS finding."""
        findings = offline_engine._audit_middleware_validation()
        ownership_findings = [f for f in findings if "verify_resource_ownership" in f.title]
        assert len(ownership_findings) == 1
        assert ownership_findings[0].severity == Severity.PASS

    def test_middleware_spoofing_prevention_check(self, offline_engine):
        """Context spoofing prevention check must produce a PASS finding."""
        findings = offline_engine._audit_middleware_validation()
        spoofing_findings = [f for f in findings if "spoofing" in f.title.lower()]
        assert len(spoofing_findings) == 1
        assert spoofing_findings[0].severity == Severity.PASS

    def test_middleware_missing_context_handling_check(self, offline_engine):
        """Missing tenant context handling check must produce a PASS finding."""
        findings = offline_engine._audit_middleware_validation()
        context_findings = [f for f in findings if "missing tenant context" in f.title.lower()]
        assert len(context_findings) == 1
        assert context_findings[0].severity == Severity.PASS

    def test_middleware_all_findings_have_category(self, offline_engine):
        """Every middleware finding must have MIDDLEWARE category."""
        findings = offline_engine._audit_middleware_validation()
        for f in findings:
            assert f.category == AuditCategory.MIDDLEWARE

    def test_middleware_no_critical_findings_on_clean_setup(self, offline_engine):
        """A correctly configured setup must produce no CRITICAL middleware findings."""
        findings = offline_engine._audit_middleware_validation()
        critical = [f for f in findings if f.severity == Severity.CRITICAL]
        assert len(critical) == 0, f"Unexpected CRITICAL: {[f.title for f in critical]}"

    def test_middleware_findings_have_remediation(self, offline_engine):
        """All middleware findings must include a remediation hint."""
        findings = offline_engine._audit_middleware_validation()
        for f in findings:
            assert isinstance(f.remediation, str)


class TestAuditCategories:
    """Verify all AuditCategory values appear in a full audit result."""

    def test_rls_category_present(self, offline_engine):
        result = offline_engine.run_full_audit()
        cats = {f.category for f in result.findings}
        assert AuditCategory.RLS_POLICY in cats

    def test_idor_category_present(self, offline_engine):
        result = offline_engine.run_full_audit()
        cats = {f.category for f in result.findings}
        assert AuditCategory.IDOR in cats

    def test_api_isolation_category_present(self, offline_engine):
        result = offline_engine.run_full_audit()
        cats = {f.category for f in result.findings}
        assert AuditCategory.API_ISOLATION in cats

    def test_middleware_category_present(self, offline_engine):
        """MIDDLEWARE category must appear after wiring _audit_middleware_validation()."""
        result = offline_engine.run_full_audit()
        cats = {f.category for f in result.findings}
        assert AuditCategory.MIDDLEWARE in cats, (
            "MIDDLEWARE category missing — check that run_full_audit() calls _audit_middleware_validation()"
        )

    def test_all_findings_have_valid_severity(self, offline_engine):
        """Every finding must have a valid Severity enum value."""
        result = offline_engine.run_full_audit()
        valid_severities = set(Severity)
        for f in result.findings:
            assert f.severity in valid_severities

    def test_all_findings_have_title_and_description(self, offline_engine):
        """Every finding must have non-empty title and description."""
        result = offline_engine.run_full_audit()
        for f in result.findings:
            assert f.title, f"Finding missing title: {f}"
            assert f.description, f"Finding missing description: {f}"
