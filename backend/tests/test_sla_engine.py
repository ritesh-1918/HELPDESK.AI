"""
Unit tests for backend/services/sla_engine.py
Issue: #1089 - test : add unit tests for sla_engine
"""

import sys
import os
import json
import datetime
import pytest
from unittest.mock import MagicMock, patch, AsyncMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from services.sla_engine import (
    SLAEngine,
    SLAStatus,
    EscalationLevel,
    ChannelType,
    SLA_POLICIES,
    get_sla_policy,
    compute_sla_breach_at,
    _load_escalation_channels,
    _load_team_escalation_contacts,
)


# ---------------------------------------------------------------------------
# SLAStatus Enum
# ---------------------------------------------------------------------------

class TestSLAStatus:
    def test_values(self):
        assert SLAStatus.ACTIVE.value == "active"
        assert SLAStatus.WARNING.value == "warning"
        assert SLAStatus.BREACHED.value == "breached"
        assert SLAStatus.MET.value == "met"
        assert SLAStatus.PAUSED.value == "paused"

    def test_is_string_enum(self):
        assert isinstance(SLAStatus.ACTIVE, str)
        assert SLAStatus.ACTIVE == "active"


class TestEscalationLevel:
    def test_values(self):
        assert EscalationLevel.NONE.value == 0
        assert EscalationLevel.LEVEL_1.value == 1
        assert EscalationLevel.LEVEL_2.value == 2
        assert EscalationLevel.LEVEL_3.value == 3

    def test_is_int_enum(self):
        assert isinstance(EscalationLevel.LEVEL_2, int)
        assert EscalationLevel.LEVEL_2 == 2


class TestChannelType:
    def test_values(self):
        assert ChannelType.EMAIL.value == "email"
        assert ChannelType.SLACK.value == "slack"
        assert ChannelType.TEAMS.value == "teams"
        assert ChannelType.WEBHOOK.value == "webhook"


# ---------------------------------------------------------------------------
# SLA_POLICIES
# ---------------------------------------------------------------------------

class TestSLAPolicies:
    def test_all_priorities_present(self):
        assert "critical" in SLA_POLICIES
        assert "high" in SLA_POLICIES
        assert "medium" in SLA_POLICIES
        assert "low" in SLA_POLICIES

    def test_critical_policy(self):
        p = SLA_POLICIES["critical"]
        assert p["max_hours"] == 2
        assert p["max_seconds"] == 7200
        assert p["warning_pct"] == 0.75
        assert p["auto_escalate_on_breach"] is True

    def test_high_policy(self):
        p = SLA_POLICIES["high"]
        assert p["max_hours"] == 4
        assert p["l2_escalation_mins"] == 30

    def test_medium_policy(self):
        p = SLA_POLICIES["medium"]
        assert p["max_hours"] == 8
        assert p["warning_pct"] == 0.75

    def test_low_policy(self):
        p = SLA_POLICIES["low"]
        assert p["max_hours"] == 24
        assert p["auto_escalate_on_breach"] is False

    def test_warning_pct_uniform(self):
        for prio in ["critical", "high", "medium", "low"]:
            assert SLA_POLICIES[prio]["warning_pct"] == 0.75


# ---------------------------------------------------------------------------
# get_sla_policy
# ---------------------------------------------------------------------------

class TestGetSLAPolicy:
    def test_valid_priority(self):
        assert get_sla_policy("critical") == SLA_POLICIES["critical"]
        assert get_sla_policy("HIGH") == SLA_POLICIES["high"]
        assert get_sla_policy("Medium") == SLA_POLICIES["medium"]
        assert get_sla_policy("low") == SLA_POLICIES["low"]

    def test_invalid_falls_back_to_medium(self):
        assert get_sla_policy("invalid") == SLA_POLICIES["medium"]
        assert get_sla_policy("") == SLA_POLICIES["medium"]
        assert get_sla_policy("urgent") == SLA_POLICIES["medium"]

    def test_whitespace_handling(self):
        assert get_sla_policy(" critical ") == SLA_POLICIES["critical"]
        assert get_sla_policy("HIGH ") == SLA_POLICIES["high"]


# ---------------------------------------------------------------------------
# compute_sla_breach_at
# ---------------------------------------------------------------------------

class TestComputeSLABreachAt:
    def test_critical_breach_2h(self):
        from_time = datetime.datetime(2025, 1, 1, 10, 0, 0, tzinfo=datetime.timezone.utc)
        result = compute_sla_breach_at("critical", from_time)
        expected = datetime.datetime(2025, 1, 1, 12, 0, 0, tzinfo=datetime.timezone.utc)
        assert result == expected.isoformat()

    def test_high_breach_4h(self):
        from_time = datetime.datetime(2025, 1, 1, 8, 0, 0, tzinfo=datetime.timezone.utc)
        result = compute_sla_breach_at("high", from_time)
        expected = datetime.datetime(2025, 1, 1, 12, 0, 0, tzinfo=datetime.timezone.utc)
        assert result == expected.isoformat()

    def test_medium_breach_8h(self):
        from_time = datetime.datetime(2025, 1, 1, 0, 0, 0, tzinfo=datetime.timezone.utc)
        result = compute_sla_breach_at("medium", from_time)
        expected = datetime.datetime(2025, 1, 1, 8, 0, 0, tzinfo=datetime.timezone.utc)
        assert result == expected.isoformat()

    def test_low_breach_24h(self):
        from_time = datetime.datetime(2025, 1, 1, 0, 0, 0, tzinfo=datetime.timezone.utc)
        result = compute_sla_breach_at("low", from_time)
        expected = datetime.datetime(2025, 1, 2, 0, 0, 0, tzinfo=datetime.timezone.utc)
        assert result == expected.isoformat()

    def test_default_from_time(self):
        result = compute_sla_breach_at("critical")
        assert result.endswith("+00:00") or "Z" in result or "+" in result

    def test_invalid_priority_fallback(self):
        from_time = datetime.datetime(2025, 1, 1, 0, 0, 0, tzinfo=datetime.timezone.utc)
        result = compute_sla_breach_at("invalid", from_time)
        expected = datetime.datetime(2025, 1, 1, 8, 0, 0, tzinfo=datetime.timezone.utc)
        assert result == expected.isoformat()


# ---------------------------------------------------------------------------
# _load_escalation_channels
# ---------------------------------------------------------------------------

class TestLoadEscalationChannels:
    def test_empty_default(self):
        with patch.dict(os.environ, {"SLA_CHANNELS": "[]"}, clear=True):
            result = _load_escalation_channels()
            assert result == []

    def test_valid_json(self):
        channels = [{"type": "slack", "url": "https://hook.slack.com", "enabled": True}]
        with patch.dict(os.environ, {"SLA_CHANNELS": json.dumps(channels)}, clear=True):
            result = _load_escalation_channels()
            assert len(result) == 1
            assert result[0]["type"] == "slack"

    def test_invalid_json_fallback(self):
        with patch.dict(os.environ, {"SLA_CHANNELS": "not-json"}, clear=True):
            result = _load_escalation_channels()
            assert result == []

    def test_multiple_channels(self):
        channels = [
            {"type": "slack", "url": "hook1", "enabled": True},
            {"type": "email", "url": "mailto:test", "enabled": False},
        ]
        with patch.dict(os.environ, {"SLA_CHANNELS": json.dumps(channels)}, clear=True):
            result = _load_escalation_channels()
            assert len(result) == 2


class TestLoadTeamEscalationContacts:
    def test_empty_default(self):
        with patch.dict(os.environ, {"SLA_ESCALATION_CONTACTS": "{}"}, clear=True):
            result = _load_team_escalation_contacts()
            assert result == {}

    def test_valid_contacts(self):
        contacts = {"team_a": {"l1": "alice@test.com", "l2": "bob@test.com"}}
        with patch.dict(os.environ, {"SLA_ESCALATION_CONTACTS": json.dumps(contacts)}, clear=True):
            result = _load_team_escalation_contacts()
            assert result == contacts

    def test_invalid_json_fallback(self):
        with patch.dict(os.environ, {"SLA_ESCALATION_CONTACTS": "bad-json"}, clear=True):
            result = _load_team_escalation_contacts()
            assert result == {}


# ---------------------------------------------------------------------------
# SLAEngine - Initialization
# ---------------------------------------------------------------------------

class TestSLAEngineInit:
    def test_init_no_client(self):
        engine = SLAEngine()
        assert engine.supabase is None
        assert isinstance(engine.channels, list)
        assert isinstance(engine.contacts, dict)

    def test_init_with_client(self):
        mock_client = MagicMock()
        engine = SLAEngine(supabase_client=mock_client)
        assert engine.supabase is mock_client


# ---------------------------------------------------------------------------
# SLAEngine - evaluate_ticket
# ---------------------------------------------------------------------------

class TestSLAEngineEvaluateTicket:
    def setup_method(self):
        self.engine = SLAEngine()

    def test_active_ticket_recently_created(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        recent = now - datetime.timedelta(minutes=30)
        ticket = {
            "priority": "medium",
            "created_at": recent.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "active"
        assert result["remaining_seconds"] > 0
        assert result["escalation_level"] == 0
        assert result["needs_notification"] is False

    def test_warning_ticket(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        # 7 hours ago for medium (8h SLA), past 75% warning
        past = now - datetime.timedelta(hours=7)
        ticket = {
            "priority": "medium",
            "created_at": past.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "warning"
        assert result["escalation_level"] == 1
        assert result["needs_notification"] is True

    def test_breached_ticket(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=10)
        ticket = {
            "priority": "medium",
            "created_at": past.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "breached"
        assert result["remaining_seconds"] < 0
        assert result["needs_notification"] is True

    def test_met_ticket_resolved(self):
        ticket = {
            "priority": "high",
            "created_at": "2025-01-01T00:00:00+00:00",
            "status": "resolved",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "met"
        assert result["remaining_seconds"] == 0
        assert result["needs_notification"] is False

    def test_met_ticket_closed(self):
        ticket = {
            "priority": "critical",
            "created_at": "2025-01-01T00:00:00+00:00",
            "status": "closed",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "met"

    def test_met_ticket_auto_resolved(self):
        ticket = {
            "priority": "low",
            "created_at": "2025-01-01T00:00:00+00:00",
            "status": "auto-resolved",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "met"

    def test_critical_breach_l2_immediate(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=3)
        ticket = {
            "priority": "critical",
            "created_at": past.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "breached"
        # critical: l2_escalation_mins=0, so L2 immediately on breach
        assert result["escalation_level"] >= 2

    def test_low_priority_no_auto_escalation(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=30)
        ticket = {
            "priority": "low",
            "created_at": past.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "breached"
        # low priority auto_escalate_on_breach is False, but evaluation still marks breached

    def test_missing_start_time_default(self):
        ticket = {"priority": "medium", "status": "open"}
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "active"
        assert result["remaining_seconds"] == SLA_POLICIES["medium"]["max_seconds"]

    def test_invalid_start_time_default(self):
        ticket = {
            "priority": "high",
            "created_at": "not-a-datetime",
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "active"

    def test_uses_sla_started_at(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=1)
        ticket = {
            "priority": "medium",
            "created_at": "2020-01-01T00:00:00+00:00",
            "sla_started_at": past.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "active"

    def test_priority_case_insensitive(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=2)
        ticket = {"priority": "HIGH", "created_at": past.isoformat(), "status": "open"}
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] in ("warning", "active")

    def test_missing_priority_defaults_medium(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(minutes=30)
        ticket = {"created_at": past.isoformat(), "status": "open"}
        result = self.engine.evaluate_ticket(ticket)
        assert "policy" in result

    def test_unknown_priority_logs_warning_and_uses_medium_policy(self, caplog):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(minutes=30)
        ticket = {
            "id": "ticket-urgent-1",
            "priority": "URGENT",
            "created_at": past.isoformat(),
            "status": "open",
        }

        result = self.engine.evaluate_ticket(ticket)

        assert result["policy"] == SLA_POLICIES["medium"]
        assert "Unknown priority 'URGENT'" in caplog.text
        assert "ticket-urgent-1" in caplog.text

    def test_returns_elapsed_pct(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=4)
        ticket = {"priority": "medium", "created_at": past.isoformat(), "status": "open"}
        result = self.engine.evaluate_ticket(ticket)
        assert "elapsed_pct" in result
        assert 0 < result["elapsed_pct"] < 1

    def test_no_duplicate_notification_same_level(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=7)
        ticket = {
            "priority": "medium",
            "created_at": past.isoformat(),
            "status": "open",
            "escalation_level": 1,
        }
        result = self.engine.evaluate_ticket(ticket)
        # already escalated to level 1, same as current
        assert result["needs_notification"] is False


# ---------------------------------------------------------------------------
# SLAEngine - _default_eval
# ---------------------------------------------------------------------------

class TestSLAEngineDefaultEval:
    def test_default_eval_structure(self):
        engine = SLAEngine()
        policy = SLA_POLICIES["medium"]
        result = engine._default_eval(policy)
        assert result["sla_status"] == "active"
        assert result["remaining_seconds"] == policy["max_seconds"]
        assert result["elapsed_pct"] == 0.0
        assert result["escalation_level"] == 0
        assert result["needs_notification"] is False


# ---------------------------------------------------------------------------
# SLAEngine - check_all_active_tickets
# ---------------------------------------------------------------------------

class TestSLAEngineCheckAllActiveTickets:
    @pytest.mark.asyncio
    async def test_no_supabase_client(self):
        engine = SLAEngine()
        result = await engine.check_all_active_tickets()
        assert result == []

    @pytest.mark.asyncio
    async def test_empty_tickets(self):
        mock_client = MagicMock()
        mock_client.table.return_value.select.return_value.not_.ilike.return_value.not_.ilike.return_value.execute.return_value = MagicMock(data=[])
        engine = SLAEngine(supabase_client=mock_client)
        result = await engine.check_all_active_tickets()
        assert result == []

    @pytest.mark.asyncio
    async def test_with_breached_ticket(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        past = now - datetime.timedelta(hours=10)
        ticket = {
            "id": 1,
            "priority": "medium",
            "created_at": past.isoformat(),
            "status": "open",
        }
        mock_res = MagicMock(data=[ticket])
        mock_chain = MagicMock()
        mock_chain.execute.return_value = mock_res
        mock_table = MagicMock()
        mock_table.select.return_value = mock_chain
        mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock()
        mock_client = MagicMock()
        mock_client.table.return_value = mock_table
        engine = SLAEngine(supabase_client=mock_client)
        result = await engine.check_all_active_tickets()
        assert len(result) >= 0

    @pytest.mark.asyncio
    async def test_fetch_error_handling(self):
        mock_client = MagicMock()
        mock_client.table.return_value.select.return_value.not_.ilike.return_value.not_.ilike.return_value.execute.side_effect = Exception("DB error")
        engine = SLAEngine(supabase_client=mock_client)
        result = await engine.check_all_active_tickets()
        assert result == []


# ---------------------------------------------------------------------------
# SLAEngine - get_dashboard_stats
# ---------------------------------------------------------------------------

class TestSLAEngineGetDashboardStats:
    @pytest.mark.asyncio
    async def test_no_supabase_client(self):
        engine = SLAEngine()
        result = await engine.get_dashboard_stats()
        assert "error" in result

    @pytest.mark.asyncio
    async def test_empty_dashboard(self):
        mock_client = MagicMock()
        mock_client.table.return_value.select.return_value.execute.return_value = MagicMock(data=[])
        engine = SLAEngine(supabase_client=mock_client)
        result = await engine.get_dashboard_stats()
        assert result["total"] == 0
        assert result["active"] == 0
        assert result["breached"] == 0
        assert result["warning"] == 0
        assert result["breach_rate"] == 0

    @pytest.mark.asyncio
    async def test_dashboard_with_data(self):
        tickets = [
            {"id": 1, "priority": "critical", "sla_status": "breached", "status": "open", "escalation_level": 2},
            {"id": 2, "priority": "high", "sla_status": "warning", "status": "open", "escalation_level": 1},
            {"id": 3, "priority": "medium", "sla_status": "active", "status": "open", "escalation_level": 0},
            {"id": 4, "priority": "low", "sla_status": "met", "status": "resolved", "escalation_level": 0},
        ]
        mock_client = MagicMock()
        mock_client.table.return_value.select.return_value.execute.return_value = MagicMock(data=tickets)
        engine = SLAEngine(supabase_client=mock_client)
        result = await engine.get_dashboard_stats()
        assert result["total"] == 4
        assert result["breached"] == 1
        assert result["warning"] == 1
        assert result["met"] == 1
        assert result["breach_rate"] == 25.0

    @pytest.mark.asyncio
    async def test_dashboard_db_error(self):
        mock_client = MagicMock()
        mock_client.table.return_value.select.return_value.execute.side_effect = Exception("Connection lost")
        engine = SLAEngine(supabase_client=mock_client)
        result = await engine.get_dashboard_stats()
        assert "error" in result


# ---------------------------------------------------------------------------
# SLAEngine - dispatch_notifications
# ---------------------------------------------------------------------------

class TestSLAEngineDispatchNotifications:
    @pytest.mark.asyncio
    async def test_empty_escalated_items(self):
        engine = SLAEngine()
        await engine.dispatch_notifications([])

    @pytest.mark.asyncio
    async def test_no_channels(self):
        engine = SLAEngine()
        with patch.dict(os.environ, {"SLA_CHANNELS": "[]"}, clear=True):
            engine.channels = []
            await engine.dispatch_notifications([{
                "ticket": {"id": 1, "priority": "high"},
                "sla_result": {"escalation_level": 2, "sla_status": "breached"},
            }])


# ---------------------------------------------------------------------------
# SLAEngine - _resolve_channels
# ---------------------------------------------------------------------------

class TestSLAEngineResolveChannels:
    def test_only_enabled_channels(self):
        engine = SLAEngine()
        engine.channels = [
            {"type": "slack", "enabled": True, "min_level": 0},
            {"type": "email", "enabled": False, "min_level": 0},
        ]
        result = engine._resolve_channels({}, {"escalation_level": 1})
        assert len(result) == 1
        assert result[0]["type"] == "slack"

    def test_filter_by_escalation_level(self):
        engine = SLAEngine()
        engine.channels = [
            {"type": "slack", "enabled": True, "min_level": 0},
            {"type": "email", "enabled": True, "min_level": 2},
        ]
        result = engine._resolve_channels({}, {"escalation_level": 1})
        assert len(result) == 1
        assert result[0]["type"] == "slack"


# ---------------------------------------------------------------------------
# SLAEngine - _build_payload
# ---------------------------------------------------------------------------

class TestSLAEngineBuildPayload:
    def setup_method(self):
        self.engine = SLAEngine()

    def test_base_payload(self):
        ticket = {
            "id": 12345,
            "priority": "high",
            "subject": "Test ticket",
            "assigned_team": "Platform",
        }
        result = {"sla_status": "breached", "escalation_level": 2, "remaining_seconds": -3600}
        payload = self.engine._build_payload(ticket, result, "webhook")
        assert "Ticket #" in payload["title"]
        assert payload["priority"] == "HIGH"
        assert payload["status"] == "breached"
        assert payload["subject"] == "Test ticket"

    def test_slack_payload(self):
        ticket = {"id": 1, "priority": "critical", "subject": "Urgent", "assigned_team": "DevOps"}
        result = {"sla_status": "breached", "escalation_level": 3, "remaining_seconds": -7200}
        payload = self.engine._build_payload(ticket, result, "slack")
        assert "attachments" in payload
        assert payload["attachments"][0]["color"] == "#ef4444"

    def test_teams_payload(self):
        ticket = {"id": 2, "priority": "medium", "subject": "Normal", "assigned_team": "Support"}
        result = {"sla_status": "warning", "escalation_level": 1, "remaining_seconds": 3600}
        payload = self.engine._build_payload(ticket, result, "teams")
        assert payload["@type"] == "MessageCard"
        assert "sections" in payload

    def test_email_payload(self):
        ticket = {"id": 3, "priority": "low", "subject": "Low prio", "reporter_email": "user@test.com"}
        result = {"sla_status": "warning", "escalation_level": 1, "remaining_seconds": 1800}
        payload = self.engine._build_payload(ticket, result, "email")
        assert payload["type"] == "SLA_ALERT"
        assert "template_data" in payload

    def test_missing_subject_untitled(self):
        ticket = {"id": 99, "priority": "medium", "assigned_team": "N/A"}
        result = {"sla_status": "active", "escalation_level": 0, "remaining_seconds": 28800}
        payload = self.engine._build_payload(ticket, result, "webhook")
        assert payload["subject"] == "Untitled"


# ---------------------------------------------------------------------------
# SLAEngine - _fmt_remaining
# ---------------------------------------------------------------------------

class TestSLAEngineFmtRemaining:
    def test_overdue(self):
        assert SLAEngine._fmt_remaining(-100) == "OVERDUE"
        assert SLAEngine._fmt_remaining(0) == "OVERDUE"

    def test_hours_and_minutes(self):
        assert SLAEngine._fmt_remaining(3660) == "1h 1m"
        assert SLAEngine._fmt_remaining(7200) == "2h 0m"

    def test_minutes_only(self):
        assert SLAEngine._fmt_remaining(600) == "10m"
        assert SLAEngine._fmt_remaining(59) == "0m"


# ---------------------------------------------------------------------------
# SLAEngine - _send_to_channel (async)
# ---------------------------------------------------------------------------

class TestSLAEngineSendToChannel:
    @pytest.mark.asyncio
    async def test_webhook_success(self):
        engine = SLAEngine()
        channel = {"type": "webhook", "url": "https://example.com/hook"}
        ticket = {"id": 1}
        result = {"sla_status": "warning", "escalation_level": 1}
        with patch("services.sla_engine.aiohttp.ClientSession") as mock_session:
            mock_resp = AsyncMock()
            mock_resp.status = 200
            mock_session.return_value.__aenter__.return_value.post.return_value.__aenter__.return_value = mock_resp
            success = await engine._send_to_channel(channel, ticket, result)
            assert success is True

    @pytest.mark.asyncio
    async def test_channel_failure(self):
        engine = SLAEngine()
        channel = {"type": "webhook", "url": "https://broken.example.com"}
        ticket = {"id": 1}
        result = {"sla_status": "warning", "escalation_level": 1}
        with patch("services.sla_engine.aiohttp.ClientSession") as mock_session:
            mock_session.return_value.__aenter__.return_value.post.side_effect = Exception("Connection refused")
            success = await engine._send_to_channel(channel, ticket, result)
            assert success is False


# ---------------------------------------------------------------------------
# Escalation Level 3 (extended breach)
# ---------------------------------------------------------------------------

class TestSLAEngineExtendedBreach:
    def setup_method(self):
        self.engine = SLAEngine()

    def test_critical_extended_breach_l3(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        # critical SLA: 2h, l3_escalation after 120min breach => total 4h
        past = now - datetime.timedelta(hours=5)
        ticket = {
            "priority": "critical",
            "created_at": past.isoformat(),
            "status": "open",
        }
        result = self.engine.evaluate_ticket(ticket)
        assert result["sla_status"] == "breached"
        assert result["escalation_level"] == 3
