"""Unit tests for backend/digest_service.py — Issue #208"""

import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch

from backend.digest_service import (
    get_weekly_stats,
    generate_ai_summary,
    send_digest_email,
    _fallback_summary,
    run_digest_for_company,
)


# ---------------------------------------------------------------------------
# Helpers — fake Supabase client
# ---------------------------------------------------------------------------

def _make_ticket(status="open", category="Network", sla_status="active", days_ago=1):
    created = (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
    return {"status": status, "category": category, "sla_status": sla_status, "created_at": created}


class FakeQuery:
    """Chainable fake that returns canned data on .execute()."""

    def __init__(self, data):
        self._data = data

    def select(self, *_): return self
    def gte(self, *_): return self
    def lt(self, *_): return self
    def eq(self, *_): return self

    def execute(self):
        r = MagicMock()
        r.data = self._data
        return r


class FakeSupabase:
    def __init__(self, this_week_data, last_week_data=None):
        self._this_week = this_week_data
        self._last_week = last_week_data or []
        self._call_count = 0

    def table(self, _name):
        self._call_count += 1
        # First call → this week, second call → last week
        data = self._this_week if self._call_count % 2 == 1 else self._last_week
        return FakeQuery(data)


# ---------------------------------------------------------------------------
# get_weekly_stats
# ---------------------------------------------------------------------------

class TestGetWeeklyStats(unittest.TestCase):

    def test_raises_without_supabase(self):
        with self.assertRaises(RuntimeError):
            get_weekly_stats(None, "company-1")

    def test_basic_totals(self):
        tickets = [
            _make_ticket("resolved", "Network"),
            _make_ticket("open", "Hardware"),
            _make_ticket("resolved", "Network"),
            _make_ticket("open", "Software", sla_status="breached"),
        ]
        db = FakeSupabase(this_week_data=tickets, last_week_data=[_make_ticket()])
        stats = get_weekly_stats(db, "company-1")

        self.assertEqual(stats["total_tickets"], 4)
        self.assertEqual(stats["resolved_count"], 2)
        self.assertAlmostEqual(stats["resolution_rate"], 50.0)
        self.assertEqual(stats["sla_breaches"], 1)

    def test_top_categories_sorted(self):
        tickets = [
            _make_ticket(category="Network"),
            _make_ticket(category="Network"),
            _make_ticket(category="Hardware"),
            _make_ticket(category="Software"),
            _make_ticket(category="Network"),
        ]
        db = FakeSupabase(this_week_data=tickets)
        stats = get_weekly_stats(db, "company-1")

        cats = [c for c, _ in stats["top_categories"]]
        self.assertEqual(cats[0], "Network")
        self.assertLessEqual(len(stats["top_categories"]), 3)

    def test_pct_change_positive(self):
        db = FakeSupabase(
            this_week_data=[_make_ticket()] * 10,
            last_week_data=[_make_ticket()] * 5,
        )
        stats = get_weekly_stats(db)
        self.assertAlmostEqual(stats["pct_change"], 100.0)

    def test_pct_change_zero_last_week(self):
        db = FakeSupabase(this_week_data=[_make_ticket()] * 3, last_week_data=[])
        stats = get_weekly_stats(db)
        self.assertEqual(stats["pct_change"], 0.0)

    def test_empty_week(self):
        db = FakeSupabase(this_week_data=[], last_week_data=[])
        stats = get_weekly_stats(db)
        self.assertEqual(stats["total_tickets"], 0)
        self.assertEqual(stats["resolution_rate"], 0.0)
        self.assertEqual(stats["sla_breaches"], 0)
        self.assertEqual(stats["top_categories"], [])

    def test_resolved_status_variants(self):
        tickets = [
            _make_ticket(status="Resolved"),
            _make_ticket(status="closed"),
            _make_ticket(status="auto-resolved"),
            _make_ticket(status="open"),
        ]
        db = FakeSupabase(this_week_data=tickets)
        stats = get_weekly_stats(db)
        self.assertEqual(stats["resolved_count"], 3)


# ---------------------------------------------------------------------------
# generate_ai_summary
# ---------------------------------------------------------------------------

class TestGenerateAiSummary(unittest.TestCase):

    def _sample_stats(self):
        return {
            "total_tickets": 20,
            "total_tickets_last_week": 15,
            "pct_change": 33.3,
            "resolved_count": 16,
            "resolution_rate": 80.0,
            "sla_breaches": 2,
            "top_categories": [("Network", 8), ("Hardware", 5), ("Software", 3)],
            "period_start": "2026-05-21T00:00:00+00:00",
            "period_end": "2026-05-28T00:00:00+00:00",
        }

    def test_fallback_when_gemini_none(self):
        stats = self._sample_stats()
        result = generate_ai_summary(stats, gemini_service=None)
        self.assertIn("20", result)
        self.assertIn("80.0", result)
        self.assertIn("Network", result)

    def test_fallback_when_not_initialized(self):
        mock_gemini = MagicMock()
        mock_gemini._initialized = False
        stats = self._sample_stats()
        result = generate_ai_summary(stats, gemini_service=mock_gemini)
        self.assertIn("20", result)

    def test_uses_gemini_when_initialized(self):
        mock_response = MagicMock()
        mock_response.text = "Great week. Tickets up 33%. Top issue: Network."
        mock_gemini = MagicMock()
        mock_gemini._initialized = True
        mock_gemini.client.models.generate_content.return_value = mock_response

        result = generate_ai_summary(self._sample_stats(), gemini_service=mock_gemini)
        self.assertIn("Great week", result)
        mock_gemini.client.models.generate_content.assert_called_once()

    def test_falls_back_on_gemini_exception(self):
        mock_gemini = MagicMock()
        mock_gemini._initialized = True
        mock_gemini.client.models.generate_content.side_effect = Exception("API error")

        result = generate_ai_summary(self._sample_stats(), gemini_service=mock_gemini)
        self.assertIn("20", result)

    def test_fallback_summary_no_categories(self):
        stats = self._sample_stats()
        stats["top_categories"] = []
        result = _fallback_summary(stats)
        self.assertIn("N/A", result)

    def test_fallback_trend_down(self):
        stats = self._sample_stats()
        stats["pct_change"] = -15.0
        result = _fallback_summary(stats)
        self.assertIn("down", result)


# ---------------------------------------------------------------------------
# send_digest_email
# ---------------------------------------------------------------------------

class TestSendDigestEmail(unittest.TestCase):

    def _sample_stats(self):
        return {
            "total_tickets": 10,
            "total_tickets_last_week": 8,
            "pct_change": 25.0,
            "resolved_count": 8,
            "resolution_rate": 80.0,
            "sla_breaches": 1,
            "top_categories": [("Network", 5)],
            "period_start": "2026-05-21T00:00:00+00:00",
            "period_end": "2026-05-28T00:00:00+00:00",
        }

    def test_no_api_key_returns_error(self):
        with patch.dict("os.environ", {}, clear=True):
            result = send_digest_email("admin@example.com", self._sample_stats(), "Summary text")
        self.assertFalse(result["ok"])
        self.assertIn("RESEND_API_KEY", result["error"])

    def test_no_resend_sdk_returns_error(self):
        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test"}):
            with patch("backend.digest_service._HAS_RESEND", False):
                result = send_digest_email("admin@example.com", self._sample_stats(), "Summary text")
        self.assertFalse(result["ok"])
        self.assertIn("resend package", result["error"])

    def test_successful_send(self):
        mock_response = MagicMock()
        mock_response.id = "email-id-123"

        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test"}):
            with patch("backend.digest_service._HAS_RESEND", True):
                with patch("backend.digest_service._resend_sdk") as mock_sdk:
                    mock_sdk.Emails.send.return_value = mock_response
                    result = send_digest_email("admin@example.com", self._sample_stats(), "Summary text")

        self.assertTrue(result["ok"])
        self.assertEqual(result["id"], "email-id-123")

    def test_send_exception_returns_error(self):
        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test"}):
            with patch("backend.digest_service._HAS_RESEND", True):
                with patch("backend.digest_service._resend_sdk") as mock_sdk:
                    mock_sdk.Emails.send.side_effect = Exception("Network error")
                    result = send_digest_email("admin@example.com", self._sample_stats(), "Summary text")

        self.assertFalse(result["ok"])
        self.assertIn("Network error", result["error"])


# ---------------------------------------------------------------------------
# run_digest_for_company
# ---------------------------------------------------------------------------

class TestRunDigestForCompany(unittest.TestCase):

    def test_stats_failure_returns_error(self):
        result = run_digest_for_company(None, "company-1", "admin@example.com")
        self.assertFalse(result["ok"])
        self.assertIn("Stats query failed", result["error"])

    def test_full_pipeline_success(self):
        tickets = [_make_ticket("resolved", "Network")] * 5
        db = FakeSupabase(this_week_data=tickets, last_week_data=tickets)

        mock_response = MagicMock()
        mock_response.id = "msg-abc"

        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test"}):
            with patch("backend.digest_service._HAS_RESEND", True):
                with patch("backend.digest_service._resend_sdk") as mock_sdk:
                    mock_sdk.Emails.send.return_value = mock_response
                    result = run_digest_for_company(db, "company-1", "admin@example.com")

        self.assertTrue(result["ok"])
        self.assertIn("stats", result)
        self.assertIn("summary", result)
        self.assertEqual(result["stats"]["total_tickets"], 5)


if __name__ == "__main__":
    unittest.main()
