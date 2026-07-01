"""
Unit tests for backend/services/sla_escalation_service.py

Covers:
  - ESCALATION_MAP constant
  - SLAEscalationService.__init__ (webhook URL env vars)
  - check_breaches (Supabase query, company filter, error handling)
  - escalate_ticket (team mapping, update fields, error handling)
  - send_webhook_alert (Slack/Teams payload, no URL, no requests lib)
  - run_sweep (full sweep, stats, skip escalated, error counting)
  - _utc_now_iso helper
"""
import json
import os
import unittest
from unittest.mock import MagicMock, patch, PropertyMock

import sys
sys.path.insert(0, '.')


class MockSupabaseResponse:
    def __init__(self, data=None):
        self.data = data or []


class TestSLAEscalationService(unittest.TestCase):
    """Tests for SLAEscalationService."""

    # ------------------------------------------------------------------
    # ESCALATION_MAP
    # ------------------------------------------------------------------

    def test_escalation_map_has_entries(self):
        from backend.services.sla_escalation_service import ESCALATION_MAP
        self.assertIsInstance(ESCALATION_MAP, dict)
        self.assertGreater(len(ESCALATION_MAP), 0)

    def test_escalation_map_known_teams(self):
        from backend.services.sla_escalation_service import ESCALATION_MAP
        self.assertEqual(ESCALATION_MAP["Network Support"], "Senior Network Engineers")
        self.assertEqual(ESCALATION_MAP["Hardware Support"], "Senior Hardware Engineers")
        self.assertEqual(ESCALATION_MAP["IAM Team"], "Security Operations Center")
        self.assertEqual(ESCALATION_MAP["IT Service Desk"], "Tier 2 Support")
        self.assertEqual(ESCALATION_MAP["Cloud Apps Team"], "Platform Engineering")

    def test_escalation_map_all_values_are_strings(self):
        from backend.services.sla_escalation_service import ESCALATION_MAP
        for k, v in ESCALATION_MAP.items():
            self.assertIsInstance(k, str)
            self.assertIsInstance(v, str)

    # ------------------------------------------------------------------
    # __init__ — webhook URL env
    # ------------------------------------------------------------------

    def test_init_reads_slack_webhook_url(self):
        from backend.services.sla_escalation_service import SLAEscalationService
        with patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/abc"}):
            svc = SLAEscalationService()
            self.assertEqual(svc.slack_webhook_url, "https://hooks.slack.com/abc")

    def test_init_reads_teams_webhook_url(self):
        from backend.services.sla_escalation_service import SLAEscalationService
        with patch.dict(os.environ, {"TEAMS_WEBHOOK_URL": "https://webhook.office.com/xyz"}):
            svc = SLAEscalationService()
            self.assertEqual(svc.teams_webhook_url, "https://webhook.office.com/xyz")

    def test_init_empty_webhook_urls_by_default(self):
        from backend.services.sla_escalation_service import SLAEscalationService
        with patch.dict(os.environ, {}, clear=True):
            svc = SLAEscalationService()
            self.assertEqual(svc.slack_webhook_url, "")
            self.assertEqual(svc.teams_webhook_url, "")

    # ------------------------------------------------------------------
    # check_breaches
    # ------------------------------------------------------------------

    def setUp(self):
        self._svc_class = None
        # Import inside setUp to avoid env contamination
        from backend.services.sla_escalation_service import SLAEscalationService
        self._svc_class = SLAEscalationService
        self.supabase = MagicMock()

    def _make_svc(self, slack="", teams=""):
        with patch.dict(os.environ, {
            "SLACK_WEBHOOK_URL": slack,
            "TEAMS_WEBHOOK_URL": teams,
        }):
            return self._svc_class()

    def _mock_chain(self, data):
        chain = MagicMock()
        chain.select.return_value = chain
        chain.lt.return_value = chain
        chain.neq.return_value = chain
        chain.eq.return_value = chain
        chain.execute.return_value = MockSupabaseResponse(data)
        return chain

    def test_check_breaches_returns_empty_list_when_none_breached(self):
        svc = self._make_svc()
        self.supabase.table.return_value = self._mock_chain([])
        result = svc.check_breaches(self.supabase)
        self.assertEqual(result, [])

    def test_check_breaches_returns_breached_tickets(self):
        svc = self._make_svc()
        tickets = [
            {"id": "t1", "subject": "SLA breach 1", "status": "open", "sla_breach_at": "2024-01-01T00:00:00"},
            {"id": "t2", "subject": "SLA breach 2", "status": "in_progress", "sla_breach_at": "2024-01-01T00:00:00"},
        ]
        self.supabase.table.return_value = self._mock_chain(tickets)
        result = svc.check_breaches(self.supabase)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["id"], "t1")
        self.assertEqual(result[1]["id"], "t2")

    def test_check_breaches_filters_by_company(self):
        svc = self._make_svc()
        chain = self._mock_chain([{"id": "t3"}])
        self.supabase.table.return_value = chain
        result = svc.check_breaches(self.supabase, company_id="company-xyz")
        chain.eq.assert_called_with("company_id", "company-xyz")
        self.assertEqual(len(result), 1)

    def test_check_breaches_no_company_filter_when_none(self):
        svc = self._make_svc()
        chain = self._mock_chain([])
        self.supabase.table.return_value = chain
        svc.check_breaches(self.supabase, company_id=None)
        chain.eq.assert_not_called()

    def test_check_breaches_selects_correct_columns(self):
        svc = self._make_svc()
        chain = self._mock_chain([])
        self.supabase.table.return_value = chain
        svc.check_breaches(self.supabase)
        expected_cols = "id, subject, category, priority, assigned_team, status, sla_breach_at, company_id, escalated"
        chain.select.assert_called_with(expected_cols)

    def test_check_breaches_excludes_resolved_and_closed(self):
        svc = self._make_svc()
        chain = self._mock_chain([])
        self.supabase.table.return_value = chain
        svc.check_breaches(self.supabase)
        neq_calls = [c[0][0] for c in chain.neq.call_args_list]
        self.assertIn("status", neq_calls)

    def test_check_breaches_handles_exception(self):
        svc = self._make_svc()
        chain = self._mock_chain([])
        chain.execute.side_effect = Exception("DB error")
        self.supabase.table.return_value = chain
        result = svc.check_breaches(self.supabase)
        self.assertEqual(result, [])

    # ------------------------------------------------------------------
    # escalate_ticket
    # ------------------------------------------------------------------

    def test_escalate_ticket_known_team(self):
        svc = self._make_svc()
        updated_ticket = {"id": "t10", "assigned_team": "Senior Network Engineers", "escalated": True}
        chain = self._mock_chain([updated_ticket])
        self.supabase.table.return_value = chain
        result = svc.escalate_ticket(self.supabase, "t10", "Network Support")
        self.assertEqual(result["assigned_team"], "Senior Network Engineers")
        self.assertTrue(result["escalated"])

    def test_escalate_ticket_unknown_team_fallback(self):
        svc = self._make_svc()
        updated_ticket = {"id": "t11", "assigned_team": "Escalated: Unknown Team", "escalated": True}
        chain = self._mock_chain([updated_ticket])
        self.supabase.table.return_value = chain
        result = svc.escalate_ticket(self.supabase, "t11", "Unknown Team")
        self.assertIn("Escalated:", result["assigned_team"])

    def test_escalate_ticket_sets_escalation_fields(self):
        svc = self._make_svc()
        chain = self._mock_chain([{"id": "t12", "assigned_team": "Tier 2 Support"}])
        self.supabase.table.return_value = chain
        svc.escalate_ticket(self.supabase, "t12", "General Support")

        update_call = chain.update.call_args[0][0]
        self.assertTrue(update_call["escalated"])
        self.assertIn("escalated_at", update_call)
        self.assertIn("escalation_note", update_call)
        self.assertIn("Auto-escalated", update_call["escalation_note"])

    def test_escalate_ticket_no_data_returned(self):
        svc = self._make_svc()
        chain = self._mock_chain(None)
        chain.execute.return_value.data = None
        self.supabase.table.return_value = chain
        result = svc.escalate_ticket(self.supabase, "t13", "Network Support")
        self.assertEqual(result, {})

    def test_escalate_ticket_handles_exception(self):
        svc = self._make_svc()
        chain = self._mock_chain([])
        chain.update.return_value = chain
        chain.execute.side_effect = Exception("Update failed")
        self.supabase.table.return_value = chain
        result = svc.escalate_ticket(self.supabase, "t14", "Network Support")
        self.assertEqual(result, {})

    # ------------------------------------------------------------------
    # send_webhook_alert
    # ------------------------------------------------------------------

    def test_send_webhook_alert_no_url_configured(self):
        svc = self._make_svc()
        ticket = {"id": "t20", "subject": "Test", "priority": "high", "assigned_team": "Network"}
        result = svc.send_webhook_alert(ticket)
        self.assertFalse(result)

    def test_send_webhook_alert_no_requests_lib(self):
        svc = self._make_svc(slack="https://hooks.slack.com/test")
        with patch("backend.services.sla_escalation_service._requests_lib", None):
            ticket = {"id": "t21"}
            result = svc.send_webhook_alert(ticket)
            self.assertFalse(result)

    def test_send_webhook_alert_successful(self):
        svc = self._make_svc(slack="https://hooks.slack.com/test")
        mock_requests = MagicMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status.return_value = None
        mock_requests.post.return_value = mock_resp

        with patch("backend.services.sla_escalation_service._requests_lib", mock_requests):
            ticket = {
                "id": "t22", "subject": "Login broken",
                "priority": "critical", "assigned_team": "IT Service Desk",
                "sla_breach_at": "2024-06-01T12:00:00",
            }
            result = svc.send_webhook_alert(ticket)
            self.assertTrue(result)
            mock_requests.post.assert_called_once()
            payload = mock_requests.post.call_args[1]["json"]
            self.assertIn("SLA Breach Alert", payload["text"])
            self.assertIn("t22", payload["blocks"][0]["text"]["text"])

    def test_send_webhook_alert_uses_explicit_url(self):
        svc = self._make_svc()
        mock_requests = MagicMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status.return_value = None
        mock_requests.post.return_value = mock_resp

        with patch("backend.services.sla_escalation_service._requests_lib", mock_requests):
            ticket = {"id": "t23"}
            result = svc.send_webhook_alert(ticket, webhook_url="https://explicit.example.com/hook")
            self.assertTrue(result)
            mock_requests.post.assert_called_once()
            self.assertEqual(
                mock_requests.post.call_args[0][0],
                "https://explicit.example.com/hook"
            )

    def test_send_webhook_alert_handles_request_exception(self):
        svc = self._make_svc(slack="https://hooks.slack.com/test")
        mock_requests = MagicMock()
        mock_requests.post.side_effect = Exception("Connection refused")

        with patch("backend.services.sla_escalation_service._requests_lib", mock_requests):
            ticket = {"id": "t24"}
            result = svc.send_webhook_alert(ticket)
            self.assertFalse(result)

    def test_send_webhook_alert_ticket_missing_fields(self):
        svc = self._make_svc(slack="https://hooks.slack.com/test")
        mock_requests = MagicMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status.return_value = None
        mock_requests.post.return_value = mock_resp

        with patch("backend.services.sla_escalation_service._requests_lib", mock_requests):
            ticket = {}
            result = svc.send_webhook_alert(ticket)
            self.assertTrue(result)
            payload = mock_requests.post.call_args[1]["json"]
            self.assertIn("unknown", payload["blocks"][0]["text"]["text"])

    def test_send_webhook_alert_prefers_teams_url(self):
        svc = self._make_svc(teams="https://webhook.office.com/test")
        mock_requests = MagicMock()
        mock_resp = MagicMock()
        mock_resp.raise_for_status.return_value = None
        mock_requests.post.return_value = mock_resp

        with patch("backend.services.sla_escalation_service._requests_lib", mock_requests):
            result = svc.send_webhook_alert({"id": "t25"})
            self.assertTrue(result)
            self.assertEqual(
                mock_requests.post.call_args[0][0],
                "https://webhook.office.com/test"
            )

    # ------------------------------------------------------------------
    # run_sweep
    # ------------------------------------------------------------------

    def test_run_sweep_no_breaches(self):
        svc = self._make_svc()
        chain = self._mock_chain([])
        self.supabase.table.return_value = chain
        stats = svc.run_sweep(self.supabase, send_alerts=False)
        self.assertEqual(stats["breaches_found"], 0)
        self.assertEqual(stats["escalated"], 0)

    def test_run_sweep_escalates_breached_tickets(self):
        svc = self._make_svc()
        # check_breaches returns breached tickets
        breached = [
            {"id": "t30", "assigned_team": "Hardware Support", "escalated": False},
            {"id": "t31", "assigned_team": "IAM Team", "escalated": False},
        ]
        check_chain = self._mock_chain(breached)
        escalate_chain = self._mock_chain([{"id": "t30", "escalated": True}])

        # Different supabase.table calls
        table_mock = MagicMock()
        table_mock.return_value = check_chain
        self.supabase.table = table_mock

        # We need to control escalate_ticket calls
        with patch.object(svc, "escalate_ticket", return_value={"id": "ok", "escalated": True}):
            stats = svc.run_sweep(self.supabase, send_alerts=False)
            self.assertEqual(stats["escalated"], 2)
            self.assertEqual(stats["breaches_found"], 2)

    def test_run_sweep_skips_already_escalated(self):
        svc = self._make_svc()
        breached = [
            {"id": "t32", "assigned_team": "Network Support", "escalated": True},
            {"id": "t33", "assigned_team": "IT Service Desk", "escalated": False},
        ]
        chain = self._mock_chain(breached)
        self.supabase.table.return_value = chain

        with patch.object(svc, "escalate_ticket", return_value={"id": "ok", "escalated": True}):
            stats = svc.run_sweep(self.supabase, send_alerts=False)
            self.assertEqual(stats["skipped_already_escalated"], 1)
            self.assertEqual(stats["escalated"], 1)

    def test_run_sweep_counts_errors_on_missing_id(self):
        svc = self._make_svc()
        chain = self._mock_chain([{"assigned_team": "IT Service Desk"}])  # no id
        self.supabase.table.return_value = chain
        stats = svc.run_sweep(self.supabase, send_alerts=False)
        self.assertGreater(stats["errors"], 0)

    def test_run_sweep_sends_alerts_when_enabled(self):
        svc = self._make_svc()
        breached = [
            {"id": "t34", "assigned_team": "Network Support", "escalated": False},
        ]
        chain = self._mock_chain(breached)
        self.supabase.table.return_value = chain

        with patch.object(svc, "escalate_ticket", return_value={"id": "ok"}):
            with patch.object(svc, "send_webhook_alert", return_value=True):
                stats = svc.run_sweep(self.supabase, send_alerts=True)
                self.assertEqual(stats["alerts_sent"], 1)

    def test_run_sweep_no_alerts_when_disabled(self):
        svc = self._make_svc()
        breached = [
            {"id": "t35", "assigned_team": "IAM Team", "escalated": False},
        ]
        chain = self._mock_chain(breached)
        self.supabase.table.return_value = chain

        with patch.object(svc, "escalate_ticket", return_value={"id": "ok"}):
            with patch.object(svc, "send_webhook_alert") as mock_alert:
                svc.run_sweep(self.supabase, send_alerts=False)
                mock_alert.assert_not_called()

    def test_run_sweep_failed_escalation_counts_error(self):
        svc = self._make_svc()
        breached = [
            {"id": "t36", "assigned_team": "Network Support", "escalated": False},
        ]
        chain = self._mock_chain(breached)
        self.supabase.table.return_value = chain

        with patch.object(svc, "escalate_ticket", return_value={}):
            stats = svc.run_sweep(self.supabase, send_alerts=False)
            self.assertEqual(stats["escalated"], 0)
            self.assertEqual(stats["errors"], 1)

    def test_run_sweep_with_company_filter(self):
        svc = self._make_svc()
        with patch.object(svc, "check_breaches", return_value=[]) as mock_check:
            stats = svc.run_sweep(self.supabase, company_id="comp-abc")
            mock_check.assert_called_with(self.supabase, company_id="comp-abc")
            self.assertEqual(stats["breaches_found"], 0)

    def test_run_sweep_handles_fatal_exception(self):
        svc = self._make_svc()
        with patch.object(svc, "check_breaches", side_effect=Exception("DB down")):
            stats = svc.run_sweep(self.supabase)
            self.assertEqual(stats["errors"], 1)

    # ------------------------------------------------------------------
    # _utc_now_iso
    # ------------------------------------------------------------------

    def test_utc_now_iso_format(self):
        from backend.services.sla_escalation_service import _utc_now_iso
        result = _utc_now_iso()
        self.assertIsInstance(result, str)
        self.assertIn("T", result)
        self.assertIn("+00:00", result)

    def test_utc_now_iso_is_current(self):
        from backend.services.sla_escalation_service import _utc_now_iso
        from datetime import datetime, timezone
        before = datetime.now(timezone.utc).isoformat()
        result = _utc_now_iso()
        after = datetime.now(timezone.utc).isoformat()
        # Result should be between before and after (allowing 1s margin)
        self.assertLessEqual(before, result)
        self.assertGreaterEqual(after, result)


if __name__ == "__main__":
    unittest.main()
