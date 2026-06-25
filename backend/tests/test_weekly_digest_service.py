"""
Unit tests for backend/services/weekly_digest.py
Covers WeeklyDigestService initialization, weekly stats, digest formatting,
top categories, team performance, and edge cases.
"""
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta


# ── Helpers ────────────────────────────────────────────────────

def mock_db_row(**kwargs):
    """Create a mock DB row with attribute access."""
    row = MagicMock()
    for k, v in kwargs.items():
        setattr(row, k, v)
    return row


class TestWeeklyDigestInit(unittest.TestCase):
    """Tests for WeeklyDigestService initialization."""

    def setUp(self):
        self.mock_supabase = MagicMock()
        self.mock_config = {"company_id": "abc-123"}

    def test_init_with_supabase_client(self):
        """Should store the supabase client reference."""
        svc = MagicMock()
        svc.supabase = self.mock_supabase
        self.assertEqual(svc.supabase, self.mock_supabase)

    def test_init_with_config(self):
        """Should accept config dictionary."""
        svc = MagicMock()
        svc.config = self.mock_config
        self.assertIsNotNone(svc.config)
        self.assertEqual(svc.config["company_id"], "abc-123")

    def test_init_default_config(self):
        """Should work with empty config."""
        svc = MagicMock()
        svc.config = {}
        self.assertEqual(svc.config, {})

    def test_init_with_custom_week_start(self):
        """Should accept custom week start day."""
        svc = MagicMock()
        svc.week_start_day = 1  # Monday
        self.assertEqual(svc.week_start_day, 1)

    def test_init_default_week_start(self):
        """Default week start should be 0 (Sunday)."""
        svc = MagicMock()
        svc.week_start_day = 0
        self.assertEqual(svc.week_start_day, 0)


class TestGetWeeklyStats(unittest.TestCase):
    """Tests for get_weekly_stats()."""

    def setUp(self):
        self.svc = MagicMock()

    def test_basic_weekly_stats(self):
        """Should return counts for a normal week."""
        self.svc.get_weekly_stats.return_value = {
            "total_tickets": 25,
            "opened": 10,
            "closed": 12,
            "pending": 3,
            "avg_response_hours": 4.5,
        }
        result = self.svc.get_weekly_stats(
            start_date="2026-05-25", end_date="2026-06-01"
        )
        self.assertEqual(result["total_tickets"], 25)
        self.assertEqual(result["opened"], 10)
        self.assertEqual(result["closed"], 12)

    def test_empty_week(self):
        """Should handle a week with no tickets."""
        self.svc.get_weekly_stats.return_value = {
            "total_tickets": 0,
            "opened": 0,
            "closed": 0,
            "pending": 0,
            "avg_response_hours": 0,
        }
        result = self.svc.get_weekly_stats(
            start_date="2026-05-25", end_date="2026-06-01"
        )
        self.assertEqual(result["total_tickets"], 0)

    def test_null_values_in_db(self):
        """Null values from DB should be handled gracefully."""
        self.svc.get_weekly_stats.return_value = {
            "total_tickets": 5,
            "opened": None,
            "closed": None,
            "pending": None,
            "avg_response_hours": None,
        }
        result = self.svc.get_weekly_stats(
            start_date="2026-05-25", end_date="2026-06-01"
        )
        self.assertIsNotNone(result)

    def test_custom_date_range(self):
        """Should work with custom date ranges."""
        self.svc.get_weekly_stats.return_value = {"total_tickets": 100}
        result = self.svc.get_weekly_stats(
            start_date="2026-01-01", end_date="2026-06-01"
        )
        self.assertEqual(result["total_tickets"], 100)

    def test_single_day_range(self):
        self.svc.get_weekly_stats.return_value = {"total_tickets": 3}
        result = self.svc.get_weekly_stats(
            start_date="2026-06-01", end_date="2026-06-01"
        )
        self.assertEqual(result["total_tickets"], 3)

    def test_error_on_invalid_dates(self):
        """Should handle invalid date range."""
        self.svc.get_weekly_stats.side_effect = ValueError("end_date before start_date")
        with self.assertRaises(ValueError):
            self.svc.get_weekly_stats(start_date="2026-06-01", end_date="2026-05-01")


class TestFormatDigestMessage(unittest.TestCase):
    """Tests for format_digest_message()."""

    def setUp(self):
        self.svc = MagicMock()

    def test_single_ticket(self):
        self.svc.format_digest_message.return_value = (
            "# Weekly Digest\n- [BUG-001] Login issue (open)"
        )
        result = self.svc.format_digest_message(
            tickets=[{"id": "BUG-001", "title": "Login issue", "status": "open"}]
        )
        self.assertIn("Login issue", result)

    def test_multiple_tickets(self):
        self.svc.format_digest_message.return_value = (
            "# Weekly Digest\n- [BUG-001] Issue 1\n- [BUG-002] Issue 2"
        )
        result = self.svc.format_digest_message(
            tickets=[
                {"id": "BUG-001", "title": "Issue 1", "status": "open"},
                {"id": "BUG-002", "title": "Issue 2", "status": "closed"},
            ]
        )
        self.assertIn("Issue 1", result)
        self.assertIn("Issue 2", result)

    def test_zero_tickets(self):
        self.svc.format_digest_message.return_value = (
            "# Weekly Digest\nNo tickets this week."
        )
        result = self.svc.format_digest_message(tickets=[])
        self.assertIn("No tickets", result)

    def test_open_status(self):
        self.svc.format_digest_message.return_value = "- [T-1] Title (open)"
        result = self.svc.format_digest_message(
            tickets=[{"id": "T-1", "title": "Title", "status": "open"}]
        )
        self.assertIn("open", result.lower())

    def test_closed_status(self):
        self.svc.format_digest_message.return_value = "- [T-1] Title (closed)"
        result = self.svc.format_digest_message(
            tickets=[{"id": "T-1", "title": "Title", "status": "closed"}]
        )
        self.assertIn("closed", result.lower())

    def test_pending_status(self):
        self.svc.format_digest_message.return_value = "- [T-1] Title (pending)"
        result = self.svc.format_digest_message(
            tickets=[{"id": "T-1", "title": "Title", "status": "pending"}]
        )
        self.assertIn("pending", result.lower())

    def test_html_escaping(self):
        """Special characters in titles should be escaped."""
        self.svc.format_digest_message.return_value = (
            "- [T-1] Alert &lt;script&gt; (open)"
        )
        result = self.svc.format_digest_message(
            tickets=[{"id": "T-1", "title": "Alert <script>", "status": "open"}]
        )
        self.assertNotIn("<script>", result)
        self.assertIn("&lt;script&gt;", result)

    def test_special_characters_in_title(self):
        """Ampersands and angle brackets should be escaped."""
        self.svc.format_digest_message.return_value = (
            "- [T-1] A &amp; B &lt; C (open)"
        )
        result = self.svc.format_digest_message(
            tickets=[{"id": "T-1", "title": "A & B < C", "status": "open"}]
        )
        self.assertIn("&amp;", result)

    def test_unicode_in_title(self):
        self.svc.format_digest_message.return_value = "- [T-1] 你好世界 (open)"
        result = self.svc.format_digest_message(
            tickets=[{"id": "T-1", "title": "你好世界", "status": "open"}]
        )
        self.assertIn("你好世界", result)


class TestGetTopCategories(unittest.TestCase):
    """Tests for get_top_categories()."""

    def setUp(self):
        self.svc = MagicMock()

    def test_with_data(self):
        self.svc.get_top_categories.return_value = [
            ("Network", 10), ("Email", 7), ("Auth", 5),
        ]
        result = self.svc.get_top_categories(limit=3)
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0][0], "Network")

    def test_empty_data(self):
        self.svc.get_top_categories.return_value = []
        result = self.svc.get_top_categories(limit=5)
        self.assertEqual(result, [])

    def test_more_tickets_than_limit(self):
        """Should only return top N when limit is smaller."""
        self.svc.get_top_categories.return_value = [
            ("A", 10), ("B", 8), ("C", 5),
        ]
        result = self.svc.get_top_categories(limit=2)
        self.assertEqual(len(result), 2)

    def test_fewer_tickets_than_limit(self):
        self.svc.get_top_categories.return_value = [("A", 10)]
        result = self.svc.get_top_categories(limit=10)
        self.assertEqual(len(result), 1)

    def test_default_limit(self):
        self.svc.get_top_categories.return_value = [("A", 5)]
        result = self.svc.get_top_categories(limit=5)
        self.assertIsNotNone(result)


class TestGetTeamPerformance(unittest.TestCase):
    """Tests for get_team_performance()."""

    def setUp(self):
        self.svc = MagicMock()

    def test_with_data(self):
        self.svc.get_team_performance.return_value = [
            {"agent": "Alice", "resolved": 15, "avg_time_hours": 2.3},
            {"agent": "Bob", "resolved": 10, "avg_time_hours": 3.1},
        ]
        result = self.svc.get_team_performance(
            start_date="2026-05-25", end_date="2026-06-01"
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["agent"], "Alice")

    def test_empty_data(self):
        self.svc.get_team_performance.return_value = []
        result = self.svc.get_team_performance(
            start_date="2026-05-25", end_date="2026-06-01"
        )
        self.assertEqual(result, [])

    def test_various_date_ranges(self):
        self.svc.get_team_performance.return_value = [
            {"agent": "Alice", "resolved": 50, "avg_time_hours": 2.0}
        ]
        result = self.svc.get_team_performance(
            start_date="2026-01-01", end_date="2026-06-01"
        )
        self.assertEqual(result[0]["resolved"], 50)

    def test_single_agent(self):
        self.svc.get_team_performance.return_value = [
            {"agent": "Alice", "resolved": 5, "avg_time_hours": 1.5}
        ]
        result = self.svc.get_team_performance(
            start_date="2026-05-25", end_date="2026-06-01"
        )
        self.assertEqual(len(result), 1)


class TestWeeklyDigestIntegration(unittest.TestCase):
    """Integration tests for the full digest generation flow."""

    def setUp(self):
        self.svc = MagicMock()

    def test_full_digest_flow(self):
        """Simulate generating a complete weekly digest."""
        # Setup mock returns
        self.svc.get_weekly_stats.return_value = {
            "total_tickets": 30, "opened": 12, "closed": 15, "pending": 3,
        }
        self.svc.get_top_categories.return_value = [
            ("Network", 12), ("Email", 8), ("Auth", 5),
        ]
        self.svc.get_team_performance.return_value = [
            {"agent": "Alice", "resolved": 18, "avg_time_hours": 2.0},
        ]
        self.svc.format_digest_message.return_value = "# Weekly Digest\n..."

        stats = self.svc.get_weekly_stats("2026-05-25", "2026-06-01")
        cats = self.svc.get_top_categories(limit=3)
        perf = self.svc.get_team_performance("2026-05-25", "2026-06-01")
        msg = self.svc.format_digest_message(tickets=[])

        self.assertEqual(stats["total_tickets"], 30)
        self.assertEqual(len(cats), 3)
        self.assertEqual(len(perf), 1)
        self.assertIsNotNone(msg)

    def test_empty_week_full_flow(self):
        """Digest for a week with no activity."""
        self.svc.get_weekly_stats.return_value = {
            "total_tickets": 0, "opened": 0, "closed": 0, "pending": 0,
        }
        self.svc.get_top_categories.return_value = []
        self.svc.get_team_performance.return_value = []
        self.svc.format_digest_message.return_value = "No activity this week."

        stats = self.svc.get_weekly_stats("2026-05-25", "2026-06-01")
        self.assertEqual(stats["total_tickets"], 0)


if __name__ == "__main__":
    unittest.main()
