import unittest
import datetime
from unittest.mock import MagicMock, patch, mock_open
import urllib.error

# Import the service functions
from backend.services.digest_service import (
    get_weekly_stats,
    generate_ai_summary,
    send_digest_email,
    digest_scheduler_loop_async
)

class FakeResult:
    def __init__(self, data):
        self.data = data

class TestDigestService(unittest.TestCase):
    
    def setUp(self):
        self.company_id = "test-company-uuid"
        
    @patch("backend.services.digest_service.supabase")
    def test_get_weekly_stats_empty(self, mock_supabase):
        # Setup mocks
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult(
            {"name": "Test Enterprise"}
        )
        
        # Mock tickets table return empty list
        mock_supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult([])
        
        stats = get_weekly_stats(self.company_id)
        
        self.assertEqual(stats["total_tickets"], 0)
        self.assertEqual(stats["resolved_tickets"], 0)
        self.assertEqual(stats["resolution_rate"], 0.0)
        self.assertEqual(stats["avg_resolution_time_str"], "N/A")
        self.assertEqual(stats["company_name"], "Test Enterprise")

    @patch("backend.services.digest_service.supabase")
    def test_get_weekly_stats_with_data(self, mock_supabase):
        # Mock company name query
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult(
            {"name": "Test Enterprise"}
        )
        
        # Setup mock tickets
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        created_str = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat()
        
        mock_tickets = [
            # Resolved, not breached, Software
            {
                "id": "1",
                "status": "resolved",
                "category": "Software",
                "created_at": created_str,
                "updated_at": now_str,
                "sla_status": "satisfied"
            },
            # Closed, breached, Hardware
            {
                "id": "2",
                "status": "closed",
                "category": "Hardware",
                "created_at": created_str,
                "closed_at": now_str,
                "sla_status": "breached"
            },
            # Open, not breached, Software
            {
                "id": "3",
                "status": "open",
                "category": "Software",
                "created_at": now_str,
                "sla_status": "active"
            }
        ]
        
        # Route query to return mock_tickets
        def mock_table(name):
            mock_tbl = MagicMock()
            if name == "companies":
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({"name": "Test Enterprise"})
            elif name == "tickets":
                mock_tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult(mock_tickets)
            return mock_tbl

        mock_supabase.table.side_effect = mock_table
        
        stats = get_weekly_stats(self.company_id)
        
        self.assertEqual(stats["total_tickets"], 3)
        self.assertEqual(stats["resolved_tickets"], 2)
        self.assertEqual(stats["open_tickets"], 1)
        self.assertEqual(stats["sla_breaches"], 1)
        self.assertEqual(stats["resolution_rate"], 66.7)
        self.assertEqual(stats["avg_resolution_time_str"], "2.0h") # 120 minutes average
        self.assertEqual(stats["company_name"], "Test Enterprise")
        
        # Verify top categories
        top_cats = stats["top_categories"]
        self.assertEqual(len(top_cats), 2)
        self.assertEqual(top_cats[0]["category"], "Software")
        self.assertEqual(top_cats[0]["count"], 2)
        
    @patch("backend.services.digest_service.gemini_service")
    def test_generate_ai_summary_offline(self, mock_gemini):
        # Set gemini_service mock to None or offline
        with patch("backend.services.digest_service.gemini_service", None):
            stats = {
                "company_name": "Test Company",
                "total_tickets": 10,
                "resolved_tickets": 8,
                "resolution_rate": 80.0,
                "avg_resolution_time_str": "1.5h",
                "sla_breaches": 1,
                "top_categories": [{"category": "Software", "count": 5}]
            }
            summary = generate_ai_summary(stats)
            self.assertIn("10 tickets", summary)
            self.assertIn("80.0%", summary)
            self.assertIn("1.5h", summary)

    @patch("backend.services.digest_service.gemini_service")
    def test_generate_ai_summary_success(self, mock_gemini):
        # Mock active GeminiService response
        mock_gemini._initialized = True
        mock_gemini.model_name = "gemini-2.5-flash"
        mock_gemini.client.models.generate_content.return_value = MagicMock(text="AI generated summary statement.")
        
        stats = {
            "company_name": "Test Company",
            "total_tickets": 10,
            "resolved_tickets": 8,
            "resolution_rate": 80.0,
            "avg_resolution_time_str": "1.5h",
            "sla_breaches": 1,
            "top_categories": [{"category": "Software", "count": 5}],
            "open_tickets": 2
        }
        
        summary = generate_ai_summary(stats)
        self.assertEqual(summary, "AI generated summary statement.")
        mock_gemini.client.models.generate_content.assert_called_once()

    @patch.dict("os.environ", {"RESEND_API_KEY": ""})
    def test_send_email_missing_key(self):
        stats = {"company_name": "Test", "date_range_str": "May 20-27"}
        success = send_digest_email("admin@test.com", stats, "AI summary")
        self.assertFalse(success)

    @patch("urllib.request.urlopen")
    @patch.dict("os.environ", {"RESEND_API_KEY": "re_123456789"})
    def test_send_email_success(self, mock_urlopen):
        # Mock successful URL open
        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"id": "email_sent_id"}'
        mock_urlopen.return_value.__enter__.return_value = mock_resp
        
        stats = {
            "company_name": "Test Enterprise",
            "date_range_str": "May 20-27",
            "total_tickets": 5,
            "resolved_tickets": 4,
            "resolution_rate": 80.0,
            "avg_resolution_time_str": "1h",
            "sla_breaches": 0,
            "top_categories": [{"category": "Software", "count": 3}]
        }
        
        success = send_digest_email("admin@test.com", stats, "Perfect summary.")
        self.assertTrue(success)
        mock_urlopen.assert_called_once()
