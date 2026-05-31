import sys
import os
import json
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.sla_engine import (
    SLAEngine, SLAStatus, EscalationLevel, ChannelType,
    SLA_POLICIES, _load_escalation_channels, _load_team_escalation_contacts,
)


class TestSLAConstants(unittest.TestCase):

    def test_sla_status_enum_values(self):
        self.assertEqual(SLAStatus.ACTIVE.value, "active")
        self.assertEqual(SLAStatus.WARNING.value, "warning")
        self.assertEqual(SLAStatus.BREACHED.value, "breached")
        self.assertEqual(SLAStatus.MET.value, "met")
        self.assertEqual(SLAStatus.PAUSED.value, "paused")

    def test_escalation_level_enum_values(self):
        self.assertEqual(EscalationLevel.NONE.value, 0)
        self.assertEqual(EscalationLevel.LEVEL_1.value, 1)
        self.assertEqual(EscalationLevel.LEVEL_2.value, 2)
        self.assertEqual(EscalationLevel.LEVEL_3.value, 3)

    def test_channel_type_enum_values(self):
        self.assertEqual(ChannelType.EMAIL.value, "email")
        self.assertEqual(ChannelType.SLACK.value, "slack")
        self.assertEqual(ChannelType.TEAMS.value, "teams")
        self.assertEqual(ChannelType.WEBHOOK.value, "webhook")

    def test_sla_policies_has_all_tiers(self):
        for tier in ("critical", "high", "medium", "low"):
            self.assertIn(tier, SLA_POLICIES)

    def test_sla_policy_critical_max_2_hours(self):
        self.assertEqual(SLA_POLICIES["critical"]["max_hours"], 2)
        self.assertEqual(SLA_POLICIES["critical"]["max_seconds"], 7200)


class TestLoadEscalationChannels(unittest.TestCase):

    @patch.dict(os.environ, {"SLA_CHANNELS": '[{"type":"slack","url":"https://hooks.slack.com/test"}]'})
    def test_load_channels_from_env(self):
        channels = _load_escalation_channels()
        self.assertEqual(len(channels), 1)
        self.assertEqual(channels[0]["type"], "slack")

    @patch.dict(os.environ, {"SLA_CHANNELS": "invalid json"})
    def test_invalid_json_returns_empty_list(self):
        self.assertEqual(_load_escalation_channels(), [])

    @patch.dict(os.environ, {}, clear=True)
    def test_missing_env_returns_empty_list(self):
        self.assertEqual(_load_escalation_channels(), [])


class TestLoadTeamEscalationContacts(unittest.TestCase):

    @patch.dict(os.environ, {"SLA_ESCALATION_CONTACTS": '{"support":"slack:C0123"}'})
    def test_load_contacts_from_env(self):
        contacts = _load_team_escalation_contacts()
        self.assertEqual(contacts["support"], "slack:C0123")

    @patch.dict(os.environ, {"SLA_ESCALATION_CONTACTS": "bad json"})
    def test_invalid_json_returns_empty_dict(self):
        self.assertEqual(_load_team_escalation_contacts(), {})

    @patch.dict(os.environ, {}, clear=True)
    def test_missing_env_returns_empty_dict(self):
        self.assertEqual(_load_team_escalation_contacts(), {})


class TestSLAEngineEvaluateTicket(unittest.TestCase):

    def setUp(self):
        self.engine = SLAEngine()

    def test_missing_start_time_returns_default(self):
        result = self.engine.evaluate_ticket({"priority": "low"})
        self.assertEqual(result["sla_status"], SLAStatus.ACTIVE.value)
        self.assertEqual(result["remaining_seconds"], SLA_POLICIES["low"]["max_seconds"])

    def test_invalid_date_returns_default(self):
        result = self.engine.evaluate_ticket({"created_at": "not-a-date", "priority": "medium"})
        self.assertEqual(result["sla_status"], SLAStatus.ACTIVE.value)

    def test_resolved_ticket_returns_met(self):
        result = self.engine.evaluate_ticket({
            "created_at": "2026-01-01T00:00:00Z",
            "status": "resolved",
            "priority": "high",
        })
        self.assertEqual(result["sla_status"], SLAStatus.MET.value)
        self.assertEqual(result["needs_notification"], False)

    def test_closed_ticket_returns_met(self):
        result = self.engine.evaluate_ticket({
            "created_at": "2026-01-01T00:00:00Z",
            "status": "closed",
            "priority": "high",
        })
        self.assertEqual(result["sla_status"], SLAStatus.MET.value)

    def test_unknown_priority_falls_back_to_medium(self):
        result = self.engine.evaluate_ticket({
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
            "priority": "nonexistent",
        })
        self.assertEqual(result["policy"]["max_hours"], SLA_POLICIES["medium"]["max_hours"])

    def test_needs_notification_true_when_escalation_increases(self):
        created = (datetime.now(timezone.utc) - timedelta(hours=25)).isoformat()
        result = self.engine.evaluate_ticket({
            "created_at": created,
            "priority": "low",
            "escalation_level": 0,
        })
        self.assertIn(result["sla_status"], (SLAStatus.WARNING.value, SLAStatus.BREACHED.value))

    def test_needs_notification_false_when_escalation_already_sent(self):
        created = (datetime.now(timezone.utc) - timedelta(hours=25)).isoformat()
        result = self.engine.evaluate_ticket({
            "created_at": created,
            "priority": "low",
            "escalation_level": 3,
        })
        self.assertEqual(result["needs_notification"], False)


class TestSLAEngineCheckAllActiveTickets(unittest.TestCase):

    def setUp(self):
        self.mock_supabase = MagicMock()
        self.engine = SLAEngine(supabase_client=self.mock_supabase)

    async def test_no_supabase_returns_empty(self):
        engine = SLAEngine()
        result = await engine.check_all_active_tickets()
        self.assertEqual(result, [])

    async def test_db_error_returns_empty(self):
        self.mock_supabase.table.return_value.select.return_value.not_.ilike.return_value.not_.ilike.return_value.execute.side_effect = Exception("DB down")
        result = await self.engine.check_all_active_tickets()
        self.assertEqual(result, [])


if __name__ == '__main__':
    unittest.main()
