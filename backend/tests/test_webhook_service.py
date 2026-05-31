import sys
import os
import json
import unittest
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError, URLError

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.webhook_service import (
    build_slack_payload,
    build_teams_payload,
    detect_webhook_type,
    send_webhook_notification,
    notify_critical_ticket,
)


class TestBuildSlackPayload(unittest.TestCase):

    def setUp(self):
        self.ticket = {
            "id": 12345,
            "subject": "Server is down",
            "priority": "critical",
            "assigned_team": "infra",
            "company": "Acme Corp",
            "sla_breach_at": "2026-05-31T22:00:00Z",
        }

    def test_returns_dict_with_attachments(self):
        payload = build_slack_payload(self.ticket)
        self.assertIn("attachments", payload)
        self.assertIsInstance(payload["attachments"], list)

    def test_contains_ticket_ref_in_header(self):
        payload = build_slack_payload(self.ticket)
        header_text = payload["attachments"][0]["blocks"][0]["text"]["text"]
        self.assertIn("#T-2345", header_text)

    def test_priority_in_fields(self):
        payload = build_slack_payload(self.ticket)
        fields = payload["attachments"][0]["blocks"][1]["fields"]
        field_texts = [f["text"] for f in fields]
        self.assertTrue(any("CRITICAL" in ft for ft in field_texts))

    def test_short_ticket_id_falls_back_gracefully(self):
        ticket = {"id": 1, "subject": "test"}
        payload = build_slack_payload(ticket)
        self.assertIn("#T-1", json.dumps(payload))

    def test_unknown_priority_uses_defaults(self):
        ticket = {**self.ticket, "priority": "unknown"}
        payload = build_slack_payload(ticket)
        payload_str = json.dumps(payload)
        self.assertIn("UNKNOWN", payload_str)

    def test_missing_fields_dont_crash(self):
        payload = build_slack_payload({})
        self.assertIn("attachments", payload)


class TestBuildTeamsPayload(unittest.TestCase):

    def setUp(self):
        self.ticket = {
            "id": 12345,
            "subject": "Server is down",
            "priority": "high",
            "assigned_team": "infra",
            "company": "Acme Corp",
            "sla_breach_at": "2026-05-31T22:00:00Z",
        }

    def test_returns_message_card(self):
        payload = build_teams_payload(self.ticket)
        self.assertEqual(payload["@type"], "MessageCard")
        self.assertEqual(payload["@context"], "http://schema.org/extensions")

    def test_contains_ticket_ref_in_title(self):
        payload = build_teams_payload(self.ticket)
        self.assertIn("#T-2345", payload["sections"][0]["activityTitle"])

    def test_contains_facts(self):
        payload = build_teams_payload(self.ticket)
        facts = payload["sections"][0]["facts"]
        fact_names = [f["name"] for f in facts]
        self.assertIn("Priority", fact_names)
        self.assertIn("Assigned Team", fact_names)
        self.assertIn("Company", fact_names)

    def test_color_is_red_for_critical(self):
        ticket = {**self.ticket, "priority": "critical"}
        payload = build_teams_payload(ticket)
        self.assertEqual(payload["themeColor"], "FF0000")

    def test_color_is_orange_for_non_critical(self):
        payload = build_teams_payload(self.ticket)
        self.assertEqual(payload["themeColor"], "FFA500")

    def test_has_open_uri_action(self):
        payload = build_teams_payload(self.ticket)
        self.assertIn("potentialAction", payload)
        self.assertEqual(payload["potentialAction"][0]["@type"], "OpenUri")

    def test_missing_fields_dont_crash(self):
        payload = build_teams_payload({})
        self.assertEqual(payload["@type"], "MessageCard")


class TestDetectWebhookType(unittest.TestCase):

    def test_slack_url_detected(self):
        url = "https://hooks.slack.com/services/T00/B00/xxx"
        self.assertEqual(detect_webhook_type(url), "slack")

    def test_teams_url_detected(self):
        url = "https://outlook.office.com/webhook/xxx"
        self.assertEqual(detect_webhook_type(url), "teams")

    def test_teams_webhook_office_url(self):
        url = "https://webhook.office.com/xxx"
        self.assertEqual(detect_webhook_type(url), "teams")

    def test_unknown_url_defaults_to_slack(self):
        url = "https://example.com/hook"
        self.assertEqual(detect_webhook_type(url), "slack")

    def test_empty_url_defaults_to_slack(self):
        self.assertEqual(detect_webhook_type(""), "slack")


class TestSendWebhookNotification(unittest.TestCase):

    def test_empty_url_returns_false(self):
        result = send_webhook_notification("", {"id": 1})
        self.assertFalse(result)

    @patch("backend.services.webhook_service.urlopen")
    def test_slack_webhook_sends_correct_payload(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_urlopen.return_value.__enter__.return_value = mock_response

        url = "https://hooks.slack.com/services/T00/B00/xxx"
        ticket = {"id": 1, "subject": "test", "priority": "low"}
        result = send_webhook_notification(url, ticket)

        self.assertTrue(result)
        called_data = mock_urlopen.call_args[0][0].data
        payload = json.loads(called_data)
        self.assertIn("attachments", payload)

    @patch("backend.services.webhook_service.urlopen")
    def test_teams_webhook_sends_correct_payload(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_urlopen.return_value.__enter__.return_value = mock_response

        url = "https://outlook.office.com/webhook/xxx"
        ticket = {"id": 1, "subject": "test", "priority": "low"}
        result = send_webhook_notification(url, ticket)

        self.assertTrue(result)
        called_data = mock_urlopen.call_args[0][0].data
        payload = json.loads(called_data)
        self.assertEqual(payload["@type"], "MessageCard")

    @patch("backend.services.webhook_service.urlopen")
    def test_http_error_returns_false(self, mock_urlopen):
        mock_urlopen.side_effect = HTTPError(
            "http://example.com", 403, "Forbidden", {}, None
        )
        result = send_webhook_notification("https://hooks.slack.com/xxx", {"id": 1})
        self.assertFalse(result)

    @patch("backend.services.webhook_service.urlopen")
    def test_url_error_returns_false(self, mock_urlopen):
        mock_urlopen.side_effect = URLError("Connection refused")
        result = send_webhook_notification("https://hooks.slack.com/xxx", {"id": 1})
        self.assertFalse(result)


class TestNotifyCriticalTicket(unittest.TestCase):

    @patch.dict(os.environ, {}, clear=True)
    def test_no_webhook_url_returns_false(self):
        result = notify_critical_ticket({"id": 1})
        self.assertFalse(result)

    @patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/test"})
    @patch("backend.services.webhook_service.send_webhook_notification")
    def test_uses_env_var_when_no_url_provided(self, mock_send):
        mock_send.return_value = True
        result = notify_critical_ticket({"id": 1})
        self.assertTrue(result)
        mock_send.assert_called_once_with("https://hooks.slack.com/test", {"id": 1})

    @patch("backend.services.webhook_service.send_webhook_notification")
    def test_uses_provided_url_over_env(self, mock_send):
        mock_send.return_value = True
        ticket = {"id": 1}
        result = notify_critical_ticket(ticket, "https://custom.hook/url")
        self.assertTrue(result)
        mock_send.assert_called_once_with("https://custom.hook/url", ticket)


if __name__ == '__main__':
    unittest.main()
