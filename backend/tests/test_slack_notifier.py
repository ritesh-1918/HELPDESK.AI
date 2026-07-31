"""
Mock-based unit tests for backend.services.slack_notifier.

The Slack webhook is never hit: delivery is replaced with mocks so tests run
fully offline.

Run with:  python -m unittest backend.tests.test_slack_notifier -v
"""

import unittest
from unittest import mock

from backend.services import slack_notifier
from backend.services.slack_notifier import (
    SlackNotifier,
    notify_sla_breach,
    notify_ticket_escalated,
    send_message,
    send_blocks,
    is_enabled,
)


def _notifier(webhook="https://hooks.slack.com/services/T000/B000/XXXX"):
    return SlackNotifier(webhook_url=webhook)


class SlackNotifierDisabledTests(unittest.TestCase):
    def test_disabled_without_webhook(self):
        n = SlackNotifier(webhook_url=None)
        self.assertFalse(n.is_enabled())
        self.assertFalse(n.send_message("hi"))
        self.assertFalse(n.send_blocks([{"type": "section", "text": {"type": "plain_text", "text": "x"}}]))

    def test_disabled_with_non_https_url(self):
        n = SlackNotifier(webhook_url="http://not-https.example.com")
        self.assertFalse(n.is_enabled())


class SlackNotifierDeliveryTests(unittest.TestCase):
    @mock.patch.object(SlackNotifier, "_post", return_value=True)
    def test_send_message_payload(self, mock_post):
        n = _notifier()
        self.assertTrue(n.send_message("hello"))
        mock_post.assert_called_once_with({"text": "hello"})

    @mock.patch.object(SlackNotifier, "_post", return_value=True)
    def test_send_blocks_payload(self, mock_post):
        n = _notifier()
        blocks = [{"type": "section", "text": {"type": "plain_text", "text": "x"}}]
        self.assertTrue(n.send_blocks(blocks, text="fallback"))
        mock_post.assert_called_once_with({"blocks": blocks, "text": "fallback"})

    @mock.patch.object(SlackNotifier, "_post", return_value=False)
    def test_failed_delivery_returns_false(self, mock_post):
        n = _notifier()
        self.assertFalse(n.send_message("hello"))

    def test_empty_message_not_sent(self):
        n = _notifier()
        with mock.patch.object(n, "_post", return_value=True) as mock_post:
            self.assertFalse(n.send_message(""))
            mock_post.assert_not_called()

    @mock.patch("urllib.request.urlopen")
    def test_post_success(self, mock_urlopen):
        mock_response = mock.MagicMock()
        mock_response.read.return_value = b"ok"
        mock_urlopen.return_value.__enter__.return_value = mock_response
        n = _notifier()
        self.assertTrue(n._post({"text": "hi"}))
        self.assertIsNone(n.last_error())

    @mock.patch("urllib.request.urlopen")
    def test_post_rejected_payload(self, mock_urlopen):
        mock_response = mock.MagicMock()
        mock_response.read.return_value = b"invalid_token"
        mock_urlopen.return_value.__enter__.return_value = mock_response
        n = _notifier()
        self.assertFalse(n._post({"text": "hi"}))
        self.assertEqual(n.last_error(), "invalid_token")

    @mock.patch("urllib.request.urlopen", side_effect=Exception("network down"))
    def test_post_network_error(self, mock_urlopen):
        n = _notifier()
        self.assertFalse(n._post({"text": "hi"}))
        self.assertIn("network down", n.last_error())


class SlackNotificationHelpersTests(unittest.TestCase):
    def _patch_default_post(self):
        patcher = mock.patch.object(slack_notifier._default_notifier, "_post", return_value=True)
        mock_post = patcher.start()
        self.addCleanup(patcher.stop)
        slack_notifier._default_notifier.webhook_url = "https://hooks.slack.com/services/T/B/X"
        return mock_post

    def test_notify_sla_breach_builds_blocks(self):
        mock_post = self._patch_default_post()
        ticket = {"id": "ticket-1", "subject": "printer down", "priority": "high", "status": "open"}
        ok = notify_sla_breach(ticket, deadline="2026-08-01T12:00:00+00:00")
        self.assertTrue(ok)
        payload = mock_post.call_args[0][0]
        self.assertIn("blocks", payload)
        self.assertIn("ticket-1", str(payload))
        self.assertIn("SLA breach", str(payload))

    def test_notify_ticket_escalated(self):
        mock_post = self._patch_default_post()
        ticket = {"id": "ticket-9", "subject": "vpn broken", "priority": "high"}
        ok = notify_ticket_escalated(ticket)
        self.assertTrue(ok)
        payload = mock_post.call_args[0][0]
        self.assertIn("Ticket escalated", str(payload))

    def test_send_message_module_level(self):
        mock_post = self._patch_default_post()
        self.assertTrue(send_message("ping"))
        mock_post.assert_called_once_with({"text": "ping"})

    def test_send_blocks_module_level(self):
        mock_post = self._patch_default_post()
        blocks = [{"type": "section"}]
        self.assertTrue(send_blocks(blocks))
        mock_post.assert_called_once_with({"blocks": blocks})

    def test_is_enabled_module_level_default_off(self):
        original = slack_notifier._default_notifier.webhook_url
        slack_notifier._default_notifier.webhook_url = ""
        try:
            self.assertFalse(is_enabled())
        finally:
            slack_notifier._default_notifier.webhook_url = original


if __name__ == "__main__":
    unittest.main()
