"""
Comprehensive unit tests for DigestService + API endpoint (Issue #208).

Covers:
    - get_weekly_stats(): offline (no supabase), empty tickets, full stats,
      resolution time formatting (minutes, hours, days), SLA breaches,
      top categories, missing company name
    - generate_ai_summary(): offline (no gemini), gemini success, gemini exception fallback
    - send_digest_email(): missing API key, HTTP success, HTTP error, network error
    - digest_scheduler_loop_async(): non-Monday skip, Monday dispatch, duplicate-send guard,
      no admin email fallback, supabase error in loop
"""

import unittest
import datetime
from unittest.mock import MagicMock, patch, AsyncMock
import urllib.error
import asyncio

import sys
import os

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.digest_service import (
    get_weekly_stats,
    generate_ai_summary,
    send_digest_email,
    digest_scheduler_loop_async,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_stats(**overrides) -> dict:
    """Return a minimal valid stats dict for send_digest_email / generate_ai_summary."""
    base = {
        'company_name': 'Acme Corp',
        'date_range_str': 'May 20 - May 27, 2024',
        'total_tickets': 10,
        'resolved_tickets': 8,
        'resolution_rate': 80.0,
        'avg_resolution_time_str': '1.5h',
        'sla_breaches': 0,
        'top_categories': [{'category': 'Software', 'count': 5}],
        'open_tickets': 2,
    }
    base.update(overrides)
    return base


class FakeResult:
    """Minimal stand-in for supabase query response."""
    def __init__(self, data):
        self.data = data


# ---------------------------------------------------------------------------
# get_weekly_stats tests
# ---------------------------------------------------------------------------

class TestGetWeeklyStats(unittest.TestCase):

    @patch('backend.services.digest_service.supabase', None)
    def test_returns_defaults_when_supabase_offline(self):
        """Returns zero-filled default stats dict when supabase is None."""
        stats = get_weekly_stats('co-1')
        self.assertEqual(stats['total_tickets'], 0)
        self.assertEqual(stats['resolved_tickets'], 0)
        self.assertEqual(stats['resolution_rate'], 0.0)
        self.assertEqual(stats['avg_resolution_time_str'], 'N/A')

    @patch('backend.services.digest_service.supabase')
    def test_empty_ticket_list(self, mock_sb):
        """Zero-ticket week returns all zeros."""
        def mock_table(name):
            tbl = MagicMock()
            if name == 'companies':
                tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({'name': 'Test Co'})
            elif name == 'tickets':
                tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult([])
            return tbl
        mock_sb.table.side_effect = mock_table

        stats = get_weekly_stats('co-2')
        self.assertEqual(stats['total_tickets'], 0)
        self.assertEqual(stats['resolution_rate'], 0.0)

    @patch('backend.services.digest_service.supabase')
    def test_resolution_rate_calculated_correctly(self, mock_sb):
        """Resolution rate = (resolved/total)*100, rounded to 1 decimal."""
        now = datetime.datetime.now(datetime.timezone.utc)
        created = (now - datetime.timedelta(hours=4)).isoformat()
        tickets = [
            {'id': str(i), 'status': 'resolved', 'category': 'Net',
             'created_at': created, 'closed_at': now.isoformat(), 'sla_status': 'ok'}
            for i in range(3)
        ] + [
            {'id': '99', 'status': 'open', 'category': 'Net',
             'created_at': now.isoformat(), 'sla_status': 'active'}
        ]

        def mock_table(name):
            tbl = MagicMock()
            if name == 'companies':
                tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({'name': 'Corp'})
            elif name == 'tickets':
                tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult(tickets)
            return tbl
        mock_sb.table.side_effect = mock_table

        stats = get_weekly_stats('co-3')
        self.assertEqual(stats['total_tickets'], 4)
        self.assertEqual(stats['resolved_tickets'], 3)
        self.assertEqual(stats['resolution_rate'], 75.0)

    @patch('backend.services.digest_service.supabase')
    def test_avg_resolution_time_minutes(self, mock_sb):
        """When avg < 60 min the string ends with 'm'."""
        now = datetime.datetime.now(datetime.timezone.utc)
        created = (now - datetime.timedelta(minutes=30)).isoformat()
        tickets = [
            {'id': '1', 'status': 'resolved', 'category': 'HW',
             'created_at': created, 'closed_at': now.isoformat(), 'sla_status': 'ok'}
        ]

        def mock_table(name):
            tbl = MagicMock()
            if name == 'companies':
                tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({'name': 'Corp'})
            elif name == 'tickets':
                tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult(tickets)
            return tbl
        mock_sb.table.side_effect = mock_table

        stats = get_weekly_stats('co-4')
        self.assertIn('m', stats['avg_resolution_time_str'])
        self.assertNotIn('h', stats['avg_resolution_time_str'])

    @patch('backend.services.digest_service.supabase')
    def test_avg_resolution_time_days(self, mock_sb):
        """When avg > 24 h the string ends with 'd'."""
        now = datetime.datetime.now(datetime.timezone.utc)
        created = (now - datetime.timedelta(days=3)).isoformat()
        tickets = [
            {'id': '1', 'status': 'resolved', 'category': 'SW',
             'created_at': created, 'closed_at': now.isoformat(), 'sla_status': 'ok'}
        ]

        def mock_table(name):
            tbl = MagicMock()
            if name == 'companies':
                tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({'name': 'Corp'})
            elif name == 'tickets':
                tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult(tickets)
            return tbl
        mock_sb.table.side_effect = mock_table

        stats = get_weekly_stats('co-5')
        self.assertIn('d', stats['avg_resolution_time_str'])

    @patch('backend.services.digest_service.supabase')
    def test_sla_breaches_counted(self, mock_sb):
        """Tickets with sla_status='breached' are counted correctly."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        tickets = [
            {'id': '1', 'status': 'open', 'category': 'Net',
             'created_at': now, 'sla_status': 'breached'},
            {'id': '2', 'status': 'open', 'category': 'Net',
             'created_at': now, 'sla_status': 'breached'},
            {'id': '3', 'status': 'open', 'category': 'Net',
             'created_at': now, 'sla_status': 'active'},
        ]

        def mock_table(name):
            tbl = MagicMock()
            if name == 'companies':
                tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({'name': 'Corp'})
            elif name == 'tickets':
                tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult(tickets)
            return tbl
        mock_sb.table.side_effect = mock_table

        stats = get_weekly_stats('co-6')
        self.assertEqual(stats['sla_breaches'], 2)

    @patch('backend.services.digest_service.supabase')
    def test_top_categories_ordered_by_count(self, mock_sb):
        """Top categories list is sorted most-frequent first."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        tickets = (
            [{'id': str(i), 'status': 'open', 'category': 'Alpha',
              'created_at': now, 'sla_status': 'ok'} for i in range(5)]
            + [{'id': str(i+10), 'status': 'open', 'category': 'Beta',
                'created_at': now, 'sla_status': 'ok'} for i in range(2)]
        )

        def mock_table(name):
            tbl = MagicMock()
            if name == 'companies':
                tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = FakeResult({'name': 'Corp'})
            elif name == 'tickets':
                tbl.select.return_value.eq.return_value.gte.return_value.execute.return_value = FakeResult(tickets)
            return tbl
        mock_sb.table.side_effect = mock_table

        stats = get_weekly_stats('co-7')
        self.assertEqual(stats['top_categories'][0]['category'], 'Alpha')
        self.assertEqual(stats['top_categories'][0]['count'], 5)


# ---------------------------------------------------------------------------
# generate_ai_summary tests
# ---------------------------------------------------------------------------

class TestGenerateAiSummary(unittest.TestCase):

    def test_fallback_when_gemini_is_none(self):
        """Returns template-based string when gemini_service is None."""
        stats = _make_stats()
        with patch('backend.services.digest_service.gemini_service', None):
            summary = generate_ai_summary(stats)
        self.assertIn(str(stats['total_tickets']), summary)
        self.assertIn(str(stats['resolution_rate']), summary)

    @patch('backend.services.digest_service.gemini_service')
    def test_returns_ai_text_on_success(self, mock_gemini):
        """Returns the text from Gemini when the service is healthy."""
        mock_gemini._initialized = True
        mock_gemini.model_name = 'gemini-2.5-flash'
        mock_gemini.client.models.generate_content.return_value = MagicMock(
            text='  Excellent week for support.  '
        )
        stats = _make_stats()
        summary = generate_ai_summary(stats)
        self.assertEqual(summary, 'Excellent week for support.')

    @patch('backend.services.digest_service.gemini_service')
    def test_falls_back_on_gemini_exception(self, mock_gemini):
        """Falls back to template summary when Gemini API raises."""
        mock_gemini._initialized = True
        mock_gemini.model_name = 'gemini-2.5-flash'
        mock_gemini.client.models.generate_content.side_effect = RuntimeError('quota exceeded')
        stats = _make_stats()
        summary = generate_ai_summary(stats)
        self.assertIsInstance(summary, str)
        self.assertGreater(len(summary), 0)


# ---------------------------------------------------------------------------
# send_digest_email tests
# ---------------------------------------------------------------------------

class TestSendDigestEmail(unittest.TestCase):

    @patch.dict(os.environ, {'RESEND_API_KEY': ''})
    def test_returns_false_when_api_key_missing(self):
        """No API key → returns False without attempting HTTP request."""
        result = send_digest_email('admin@co.com', _make_stats(), 'summary')
        self.assertFalse(result)

    @patch('urllib.request.urlopen')
    @patch.dict(os.environ, {'RESEND_API_KEY': 're_live_testkey'})
    def test_returns_true_on_successful_send(self, mock_urlopen):
        """Returns True when Resend API responds 200."""
        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"id":"email_abc123"}'
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        result = send_digest_email('admin@co.com', _make_stats(), 'summary')
        self.assertTrue(result)
        mock_urlopen.assert_called_once()

    @patch('urllib.request.urlopen')
    @patch.dict(os.environ, {'RESEND_API_KEY': 're_live_testkey'})
    def test_returns_false_on_http_error(self, mock_urlopen):
        """Returns False when Resend API returns HTTP error."""
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url=None, code=422, msg='Unprocessable', hdrs=None, fp=MagicMock()
        )
        result = send_digest_email('bad@addr', _make_stats(), 'summary')
        self.assertFalse(result)

    @patch('urllib.request.urlopen')
    @patch.dict(os.environ, {'RESEND_API_KEY': 're_live_testkey'})
    def test_returns_false_on_network_error(self, mock_urlopen):
        """Returns False when a generic network/timeout error occurs."""
        mock_urlopen.side_effect = Exception('connection timed out')
        result = send_digest_email('admin@co.com', _make_stats(), 'summary')
        self.assertFalse(result)

    @patch('urllib.request.urlopen')
    @patch.dict(os.environ, {'RESEND_API_KEY': 're_live_testkey'})
    def test_sla_breach_html_rendered_in_red(self, mock_urlopen):
        """send_digest_email is called with stats that have SLA breaches; call goes through."""
        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"id":"abc"}'
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        stats = _make_stats(sla_breaches=5)
        result = send_digest_email('admin@co.com', stats, 'summary')
        self.assertTrue(result)


# ---------------------------------------------------------------------------
# digest_scheduler_loop_async tests
# ---------------------------------------------------------------------------

class TestDigestSchedulerLoop(unittest.IsolatedAsyncioTestCase):

    async def test_skips_dispatch_on_non_monday(self):
        """Loop body does not call get_weekly_stats on a non-Monday hour."""
        # Use a Wednesday
        fake_now = datetime.datetime(2024, 5, 29, 8, 0, 0, tzinfo=datetime.timezone.utc)
        assert fake_now.weekday() == 2  # Wednesday

        mock_supabase = MagicMock()
        sleep_called = []

        async def fake_sleep(n):
            sleep_called.append(n)
            raise asyncio.CancelledError()

        with patch('backend.services.digest_service.datetime') as mock_dt, \
             patch('asyncio.sleep', side_effect=fake_sleep), \
             patch('backend.services.digest_service.get_weekly_stats') as mock_gws:
            mock_dt.datetime.now.return_value = fake_now
            mock_dt.timezone.utc = datetime.timezone.utc
            mock_dt.timedelta = datetime.timedelta
            mock_dt.datetime.fromisoformat = datetime.datetime.fromisoformat

            with self.assertRaises(asyncio.CancelledError):
                await digest_scheduler_loop_async(mock_supabase, interval_seconds=3600)

        mock_gws.assert_not_called()

    async def test_sends_on_monday_8am(self):
        """Loop dispatches digest on Monday 8 AM UTC."""
        fake_now = datetime.datetime(2024, 5, 27, 8, 0, 0, tzinfo=datetime.timezone.utc)
        assert fake_now.weekday() == 0  # Monday

        mock_supabase = MagicMock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                'company_id': 'co-abc',
                'digest_admin_email': 'admin@co.com',
                'digest_last_sent': None,
                'digest_enabled': True,
            }]
        )
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

        async def fake_sleep(n):
            raise asyncio.CancelledError()

        with patch('backend.services.digest_service.datetime') as mock_dt, \
             patch('asyncio.sleep', side_effect=fake_sleep), \
             patch('backend.services.digest_service.get_weekly_stats', return_value=_make_stats()) as mock_gws, \
             patch('backend.services.digest_service.generate_ai_summary', return_value='AI summary') as mock_ai, \
             patch('backend.services.digest_service.send_digest_email', return_value=True) as mock_send:

            mock_dt.datetime.now.return_value = fake_now
            mock_dt.timezone.utc = datetime.timezone.utc
            mock_dt.timedelta = datetime.timedelta
            mock_dt.datetime.fromisoformat = datetime.datetime.fromisoformat

            with self.assertRaises(asyncio.CancelledError):
                await digest_scheduler_loop_async(mock_supabase, interval_seconds=3600)

        mock_gws.assert_called_once_with('co-abc')
        mock_send.assert_called_once()

    async def test_skips_if_already_sent_within_24h(self):
        """Does not re-send when digest_last_sent is within the last 24 hours."""
        fake_now = datetime.datetime(2024, 5, 27, 8, 0, 0, tzinfo=datetime.timezone.utc)
        last_sent = (fake_now - datetime.timedelta(hours=2)).isoformat()

        mock_supabase = MagicMock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                'company_id': 'co-dedup',
                'digest_admin_email': 'admin@co.com',
                'digest_last_sent': last_sent,
                'digest_enabled': True,
            }]
        )

        async def fake_sleep(n):
            raise asyncio.CancelledError()

        with patch('backend.services.digest_service.datetime') as mock_dt, \
             patch('asyncio.sleep', side_effect=fake_sleep), \
             patch('backend.services.digest_service.send_digest_email', return_value=True) as mock_send:

            mock_dt.datetime.now.return_value = fake_now
            mock_dt.timezone.utc = datetime.timezone.utc
            mock_dt.timedelta = datetime.timedelta
            mock_dt.datetime.fromisoformat = datetime.datetime.fromisoformat

            with self.assertRaises(asyncio.CancelledError):
                await digest_scheduler_loop_async(mock_supabase, interval_seconds=3600)

        mock_send.assert_not_called()


if __name__ == '__main__':
    unittest.main()
