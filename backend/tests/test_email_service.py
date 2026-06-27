import os
import unittest

from backend.services.email_service import EmailService, TicketEmailContext
from backend.services.notification_worker import notification_enabled


class EmailServiceTests(unittest.TestCase):
    def setUp(self):
        self.previous_email_provider = os.environ.get("EMAIL_PROVIDER")
        os.environ["EMAIL_PROVIDER"] = "disabled"

    def tearDown(self):
        if self.previous_email_provider is None:
            os.environ.pop("EMAIL_PROVIDER", None)
        else:
            os.environ["EMAIL_PROVIDER"] = self.previous_email_provider

    def test_renders_ticket_email_with_escaped_values(self):
        service = EmailService(provider="disabled", app_base_url="https://helpdesk.example")
        context = TicketEmailContext(
            event_type="ticket_resolved",
            recipient_email="user@example.com",
            recipient_name="Ada <Admin>",
            ticket_id="abc123",
            ticket_title="VPN <broken>",
            ticket_status="resolved",
            ticket_priority="high",
        )

        subject, html, text = service.build_ticket_email(context)

        self.assertIn("#abc123", subject)
        self.assertIn("Ticket resolved", html)
        self.assertIn("Ada &lt;Admin&gt;", html)
        self.assertIn("VPN &lt;broken&gt;", html)
        self.assertIn("https://helpdesk.example/ticket/abc123", html)
        self.assertIn("resolved", text)

    def test_disabled_provider_skips_delivery(self):
        service = EmailService(provider="disabled")
        result = service.send_ticket_email(
            TicketEmailContext(
                event_type="ticket_created",
                recipient_email="user@example.com",
                ticket_id="t1",
                ticket_title="Cannot login",
            )
        )

        self.assertFalse(result.sent)
        self.assertTrue(result.skipped)
        self.assertEqual(result.reason, "email_provider_disabled")

    def test_notification_preferences_gate_events(self):
        self.assertFalse(notification_enabled({"email_enabled": False}, "ticket_created"))
        self.assertFalse(notification_enabled({"ticket_resolved": False}, "ticket_resolved"))
        self.assertTrue(notification_enabled({"ticket_resolved": False}, "ticket_created"))
        self.assertTrue(notification_enabled(None, "ticket_updated"))


if __name__ == "__main__":
    unittest.main()
