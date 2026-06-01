"""Tests for the Slack SLA breach notifier."""

import json
import os
from unittest.mock import patch

import pytest

from backend.services.slack_notifier import (
    build_slack_payload,
    get_webhook_url,
    is_slack_enabled,
    notify_sla_breach,
    send_slack_alert,
)


@pytest.fixture
def sample_ticket():
    return {
        "id": "abc-123-xyz-4567",
        "subject": "Production database connection timeout",
        "priority": "critical",
        "assigned_team": "Infrastructure",
        "company": "Acme Corp",
        "company_id": "comp-001",
        "sla_breach_at": "2026-05-26T10:30:00Z",
    }


class TestBuildSlackPayload:
    def test_builds_valid_payload(self, sample_ticket):
        payload = build_slack_payload(sample_ticket)
        assert "attachments" in payload
        assert len(payload["attachments"]) == 1
        blocks = payload["attachments"][0]["blocks"]
        # Header block
        assert blocks[0]["type"] == "header"
        assert "SLA Breach" in blocks[0]["text"]["text"]
        # Section with fields
        section = blocks[1]
        assert section["type"] == "section"
        fields_text = " ".join(f["text"] for f in section["fields"])
        assert "#T-4567" in fields_text
        assert "Production database" in fields_text
        assert "CRITICAL" in fields_text
        assert "Infrastructure" in fields_text
        assert "Acme Corp" in fields_text
        assert "2026-05-26T10:30:00Z" in fields_text

    def test_handles_minimal_ticket(self):
        ticket = {"id": "42", "subject": "", "priority": None}
        payload = build_slack_payload(ticket)
        blocks = payload["attachments"][0]["blocks"]
        section = blocks[1]
        fields_text = " ".join(f["text"] for f in section["fields"])
        assert "#T-0042" in fields_text or "#T-42" in fields_text
        assert "Untitled" in fields_text
        assert "UNKNOWN" in fields_text

    def test_high_priority_uses_red(self):
        critical = build_slack_payload({"id": "1", "priority": "critical", "subject": "x"})
        high = build_slack_payload({"id": "2", "priority": "high", "subject": "x"})
        low = build_slack_payload({"id": "3", "priority": "low", "subject": "x"})
        assert critical["attachments"][0]["color"] == "#FF0000"
        assert high["attachments"][0]["color"] == "#FF0000"
        assert low["attachments"][0]["color"] == "#FFA500"


class TestSlackIntegration:
    def test_get_webhook_url_none_by_default(self):
        url = get_webhook_url()
        # Should be cached now — reset for test
        import backend.services.slack_notifier as sn
        sn._WEBHOOK_URL = None
        with patch.dict(os.environ, {}, clear=True):
            assert get_webhook_url() is None

    def test_get_webhook_url_from_env(self):
        import backend.services.slack_notifier as sn
        sn._WEBHOOK_URL = None
        with patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/test"}):
            assert get_webhook_url() == "https://hooks.slack.com/test"
        sn._WEBHOOK_URL = None

    def test_is_slack_enabled_false_without_url(self):
        import backend.services.slack_notifier as sn
        sn._WEBHOOK_URL = None
        with patch.dict(os.environ, {}, clear=True):
            assert not is_slack_enabled()

    def test_send_slack_alert_success(self, sample_ticket):
        import backend.services.slack_notifier as sn
        sn._WEBHOOK_URL = None
        with patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/test"}):
            with patch("backend.services.slack_notifier.urlopen") as mock_urlopen:
                mock_urlopen.return_value.__enter__.return_value.status = 200
                result = send_slack_alert(sample_ticket)
                assert result is True
                # Verify correct data was sent
                call_args = mock_urlopen.call_args[0][0]
                sent_data = json.loads(call_args.data.decode())
                assert "attachments" in sent_data

    def test_send_slack_alert_no_webhook(self, sample_ticket):
        import backend.services.slack_notifier as sn
        sn._WEBHOOK_URL = None
        with patch.dict(os.environ, {}, clear=True):
            result = send_slack_alert(sample_ticket)
            assert result is False

    def test_notify_sla_breach_graceful_fallback(self, sample_ticket):
        """Should not raise when Slack is not configured."""
        import backend.services.slack_notifier as sn
        sn._WEBHOOK_URL = None
        with patch.dict(os.environ, {}, clear=True):
            # Should return False gracefully, not raise
            result = notify_sla_breach(sample_ticket)
            assert result is False