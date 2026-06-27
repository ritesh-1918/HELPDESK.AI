import unittest
import datetime
from unittest.mock import MagicMock, patch, mock_open

# Import the service functions
from backend.services.digest_service import (
    get_weekly_stats,
    generate_ai_summary,
    send_digest_email,
    digest_scheduler_loop_async,
    _build_team_performance_html,
    _build_category_list_html,
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
        self.assertEqual(stats["team_performance"], [])

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
            # Resolved, not breached, Software, General Support
            {
                "id": "1",
                "status": "resolved",
                "category": "Software",
                "assigned_team": "General Support",
                "created_at": created_str,
                "updated_at": now_str,
                "sla_status": "satisfied"
            },
            # Closed, breached, Hardware, Hardware Team
            {
                "id": "2",
                "status": "closed",
                "category": "Hardware",
                "assigned_team": "Hardware Team",
                "created_at": created_str,
                "closed_at": now_str,
                "sla_status": "breached"
            },
            # Open, not breached, Software, General Support
            {
                "id": "3",
                "status": "open",
                "category": "Software",
                "assigned_team": "General Support",
                "created_at": now_str,
                "sla_status": "active"
            },
            # Pending ticket
            {
                "id": "4",
                "status": "pending",
                "category": "Software",
                "assigned_team": "General Support",
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
        
        self.assertEqual(stats["total_tickets"], 4)
        self.assertEqual(stats["resolved_tickets"], 2)
        self.assertEqual(stats["open_tickets"], 1)
        self.assertEqual(stats["pending_tickets"], 1)
        self.assertEqual(stats["sla_breaches"], 1)
        self.assertEqual(stats["resolution_rate"], 50.0)
        self.assertEqual(stats["company_name"], "Test Enterprise")
        
        # Verify top categories
        top_cats = stats["top_categories"]
        self.assertEqual(len(top_cats), 2)
        self.assertEqual(top_cats[0]["category"], "Software")
        self.assertEqual(top_cats[0]["count"], 3)
        
        # Verify team performance
        team_perf = stats["team_performance"]
        self.assertEqual(len(team_perf), 2)
        
        # General Support team
        gs_team = next(t for t in team_perf if t["team"] == "General Support")
        self.assertEqual(gs_team["total"], 3)
        self.assertEqual(gs_team["resolved"], 1)
        self.assertEqual(gs_team["open"], 1)
        self.assertEqual(gs_team["pending"], 1)
        self.assertEqual(gs_team["resolution_rate"], 33.3)
        
        # Hardware Team
        hw_team = next(t for t in team_perf if t["team"] == "Hardware Team")
        self.assertEqual(hw_team["total"], 1)
        self.assertEqual(hw_team["resolved"], 1)
        self.assertEqual(hw_team["sla_breaches"], 1)
        self.assertEqual(hw_team["resolution_rate"], 100.0)

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
                "pending_tickets": 0,
                "top_categories": [{"category": "Software", "count": 5}],
                "team_performance": []
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
            "pending_tickets": 1,
            "top_categories": [{"category": "Software", "count": 5}],
            "open_tickets": 2,
            "team_performance": [
                {"team": "General Support", "total": 6, "resolved": 5, "open": 1, "pending": 0, "resolution_rate": 83.3, "avg_resolution_time": "1.2h", "sla_breaches": 0},
                {"team": "Hardware Team", "total": 4, "resolved": 3, "open": 1, "pending": 1, "resolution_rate": 75.0, "avg_resolution_time": "2.0h", "sla_breaches": 1},
            ]
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
            "open_tickets": 1,
            "pending_tickets": 0,
            "top_categories": [{"category": "Software", "count": 3}],
            "team_performance": [
                {"team": "General Support", "total": 3, "resolved": 3, "open": 0, "pending": 0, "resolution_rate": 100.0, "avg_resolution_time": "45m", "sla_breaches": 0},
                {"team": "Hardware Team", "total": 2, "resolved": 1, "open": 1, "pending": 0, "resolution_rate": 50.0, "avg_resolution_time": "2h", "sla_breaches": 0},
            ]
        }
        
        success = send_digest_email("admin@test.com", stats, "Perfect summary.")
        self.assertTrue(success)
        mock_urlopen.assert_called_once()


class TestTeamPerformanceHTML(unittest.TestCase):
    """Test the team performance HTML builder helper."""

    def test_empty_team_performance(self):
        html = _build_team_performance_html([])
        self.assertIn("No team data", html)

    def test_team_performance_with_data(self):
        teams = [
            {"team": "General Support", "total": 10, "resolved": 8, "open": 2, "pending": 0, "resolution_rate": 80.0, "avg_resolution_time": "1.5h", "sla_breaches": 1},
            {"team": "Hardware Team", "total": 5, "resolved": 3, "open": 1, "pending": 1, "resolution_rate": 60.0, "avg_resolution_time": "3h", "sla_breaches": 2},
        ]
        html = _build_team_performance_html(teams)
        self.assertIn("General Support", html)
        self.assertIn("Hardware Team", html)
        self.assertIn("80.0%", html)
        self.assertIn("60.0%", html)
        self.assertIn("SLA Breaches", html)

    def test_category_list_html(self):
        cats = [{"category": "Software", "count": 5}, {"category": "Hardware", "count": 3}]
        html = _build_category_list_html(cats)
        self.assertIn("Software", html)
        self.assertIn("5 tickets", html)

    def test_category_list_html_empty(self):
        html = _build_category_list_html([])
        self.assertIn("No category data", html)


if __name__ == "__main__":
    unittest.main()
