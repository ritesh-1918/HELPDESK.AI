"""
Unit tests for webhook_service.py
"""

import pytest
from unittest.mock import patch, MagicMock
from backend.services.webhook_service import (
    build_slack_payload,
    build_teams_payload,
    detect_webhook_type,
    send_webhook_notification,
    notify_critical_ticket,
)


class TestBuildSlackPayload:
    def test_build_slack_payload_critical_priority(self):
        ticket = {
            "id": "1234567890abcdef",
            "subject": "Server down",
            "priority": "critical",
            "assigned_team": "Ops",
            "company": "ACME Corp",
            "sla_breach_at": "2026-05-30T15:00:00Z",
        }
        payload = build_slack_payload(ticket)

        assert "attachments" in payload
        assert len(payload["attachments"]) == 1
        attachment = payload["attachments"][0]
        assert attachment["color"] == "#FF0000"

        blocks = attachment["blocks"]
        header_block = blocks[0]
        assert header_block["type"] == "header"
        assert "critical" in header_block["text"]["text"].lower()

    def test_build_slack_payload_high_priority(self):
        ticket = {
            "id": "1234567890abcdef",
            "subject": "Database slow",
            "priority": "high",
            "assigned_team": "DBA",
            "company": "ACME Corp",
            "sla_breach_at": "2026-05-30T18:00:00Z",
        }
        payload = build_slack_payload(ticket)
        attachment = payload["attachments"][0]
        assert attachment["color"] == "#FF0000"

    def test_build_slack_payload_medium_priority(self):
        ticket = {
            "id": "1234567890abcdef",
            "subject": "UI glitch",
            "priority": "medium",
            "assigned_team": "Frontend",
            "company": "ACME Corp",
            "sla_breach_at": None,
        }
        payload = build_slack_payload(ticket)
        attachment = payload["attachments"][0]
        assert attachment["color"] == "#FFA500"

    def test_build_slack_payload_missing_fields(self):
        ticket = {
            "id": "1234",
        }
        payload = build_slack_payload(ticket)
        assert "attachments" in payload
        attachment = payload["attachments"][0]
        assert attachment["color"] == "#FFA500"

    def test_build_slack_payload_short_id(self):
        ticket = {
            "id": "abc",
            "subject": "Test",
            "priority": "critical",
            "assigned_team": "Team",
            "company": "Co",
            "sla_breach_at": None,
        }
        payload = build_slack_payload(ticket)
        assert "attachments" in payload


class TestBuildTeamsPayload:
    def test_build_teams_payload_critical_priority(self):
        ticket = {
            "id": "1234567890abcdef",
            "subject": "Server down",
            "priority": "critical",
            "assigned_team": "Ops",
            "company": "ACME Corp",
            "sla_breach_at": "2026-05-30T15:00:00Z",
        }
        payload = build_teams_payload(ticket)

        assert payload["@type"] == "MessageCard"
        assert payload["themeColor"] == "FF0000"
        assert len(payload["sections"]) == 1

    def test_build_teams_payload_high_priority(self):
        ticket = {
            "id": "1234567890abcdef",
            "subject": "Database slow",
            "priority": "high",
            "assigned_team": "DBA",
            "company": "ACME Corp",
            "sla_breach_at": None,
        }
        payload = build_teams_payload(ticket)
        assert payload["themeColor"] == "FF0000"

    def test_build_teams_payload_low_priority(self):
        ticket = {
            "id": "1234567890abcdef",
            "subject": "Minor issue",
            "priority": "low",
            "assigned_team": "Support",
            "company": "ACME Corp",
            "sla_breach_at": None,
        }
        payload = build_teams_payload(ticket)
        assert payload["themeColor"] == "FFA500"

    def test_build_teams_payload_missing_fields(self):
        ticket = {
            "id": "1234",
        }
        payload = build_teams_payload(ticket)
        assert payload["@type"] == "MessageCard"


class TestDetectWebhookType:
    def test_detect_slack_webhook(self):
        url = "https://hooks.slack.com/services/ABC/DEF/123"
        assert detect_webhook_type(url) == "slack"

    def test_detect_teams_webhook(self):
        url = "https://webhook.office.com/testwebhook"
        assert detect_webhook_type(url) == "teams"

    def test_detect_teams_webhook_outlook(self):
        url = "https://outlook.office.com/webhook/test"
        assert detect_webhook_type(url) == "teams"

    def test_detect_default_slack(self):
        url = "https://other.service.com/webhook"
        assert detect_webhook_type(url) == "slack"


class TestSendWebhookNotification:
    @patch("backend.services.webhook_service.urlopen")
    def test_send_webhook_notification_success_slack(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=None)
        mock_urlopen.return_value = mock_response

        ticket = {
            "id": "1234567890abcdef",
            "subject": "Test",
            "priority": "critical",
            "assigned_team": "Team",
            "company": "Co",
            "sla_breach_at": None,
        }
        url = "https://hooks.slack.com/services/ABC/DEF/123"

        result = send_webhook_notification(url, ticket)

        assert result is True
        mock_urlopen.assert_called_once()

    @patch("backend.services.webhook_service.urlopen")
    def test_send_webhook_notification_success_teams(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=None)
        mock_urlopen.return_value = mock_response

        ticket = {
            "id": "1234567890abcdef",
            "subject": "Test",
            "priority": "critical",
            "assigned_team": "Team",
            "company": "Co",
            "sla_breach_at": None,
        }
        url = "https://webhook.office.com/testwebhook"

        result = send_webhook_notification(url, ticket)

        assert result is True

    @patch("backend.services.webhook_service.urlopen")
    def test_send_webhook_notification_http_error(self, mock_urlopen):
        from urllib.error import HTTPError

        mock_urlopen.side_effect = HTTPError(
            url="http://test",
            code=500,
            msg="Internal Server Error",
            hdrs={},
            fp=None,
        )

        ticket = {"id": "1234", "subject": "Test", "priority": "high"}
        url = "https://hooks.slack.com/services/ABC/DEF/123"

        result = send_webhook_notification(url, ticket)

        assert result is False

    @patch("backend.services.webhook_service.urlopen")
    def test_send_webhook_notification_url_error(self, mock_urlopen):
        from urllib.error import URLError

        mock_urlopen.side_effect = URLError("Connection refused")

        ticket = {"id": "1234", "subject": "Test", "priority": "high"}
        url = "https://hooks.slack.com/services/ABC/DEF/123"

        result = send_webhook_notification(url, ticket)

        assert result is False

    def test_send_webhook_notification_no_url(self):
        result = send_webhook_notification("", {"id": "1234"})
        assert result is False


class TestNotifyCriticalTicket:
    @patch.dict("os.environ", {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/test"})
    @patch("backend.services.webhook_service.send_webhook_notification")
    def test_notify_critical_ticket_with_env_url(self, mock_send):
        mock_send.return_value = True

        ticket = {"id": "1234567890abcdef", "subject": "Test", "priority": "critical"}
        result = notify_critical_ticket(ticket)

        assert result is True
        mock_send.assert_called_once()
        call_args = mock_send.call_args[0]
        assert call_args[0] == "https://hooks.slack.com/test"
        assert call_args[1]["id"] == "1234567890abcdef"

    @patch("backend.services.webhook_service.send_webhook_notification")
    def test_notify_critical_ticket_with_provided_url(self, mock_send):
        mock_send.return_value = True

        ticket = {"id": "1234567890abcdef", "subject": "Test", "priority": "critical"}
        webhook_url = "https://hooks.slack.com/provided"
        result = notify_critical_ticket(ticket, webhook_url=webhook_url)

        assert result is True
        mock_send.assert_called_once_with(webhook_url, ticket)

    @patch("os.environ.get", return_value="")
    def test_notify_critical_ticket_no_url(self, mock_get):
        result = notify_critical_ticket({"id": "1234"})
        assert result is False

    @patch("backend.services.webhook_service.send_webhook_notification")
    def test_notify_critical_ticket_send_fails(self, mock_send):
        mock_send.return_value = False

        ticket = {"id": "1234567890abcdef", "subject": "Test", "priority": "critical"}
        webhook_url = "https://hooks.slack.com/test"
        result = notify_critical_ticket(ticket, webhook_url=webhook_url)

        assert result is False