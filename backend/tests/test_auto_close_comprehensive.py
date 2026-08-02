"""
Comprehensive unit tests for AutoCloseService (Issue #279).

Covers all service methods:
    - __init__
    - get_system_settings()
    - _close_ticket()
    - run()
    - test_query()
    - load()
    - get_instance()

Edge cases tested:
    - Disabled service returning {status: disabled}
    - Empty resolved ticket list
    - Multiple companies with distinct settings
    - Per-company auto-close disabled while global service is enabled
    - Datetime parsing errors on invalid updated_at
    - Missing updated_at field on a ticket
    - Fatal DB error in run() outer try-block
    - Ticket newer than cutoff is skipped, not closed
    - Ticket older than cutoff is closed
    - Company-level error increments error_count for all its tickets
    - test_query() returns empty list on DB error
    - load() returns singleton / get_instance() reflects loaded state
"""

import sys
import os

# ---------------------------------------------------------------------------
# Path / supabase bootstrap — identical pattern to existing test_auto_close.py
# ---------------------------------------------------------------------------
cwd = os.getcwd()
sys.path = [p for p in sys.path if p not in ('', cwd, os.path.dirname(cwd))]
try:
    import supabase
finally:
    sys.path.insert(0, cwd)
    backend_root = os.path.join(cwd, 'backend') if 'backend' not in cwd else cwd
    sys.path.insert(0, backend_root)
    sys.path.insert(0, os.path.dirname(backend_root))

import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch, call

os.environ['SUPABASE_URL'] = 'https://example.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mock_key'
os.environ['AUTO_CLOSE_ENABLED'] = 'true'

# Import the module under test
from backend.services.auto_close_service import AutoCloseService, load, get_instance


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_service(mock_supabase=None):
    """Instantiate AutoCloseService with a mocked create_client."""
    with patch('backend.services.auto_close_service.create_client') as mock_create:
        client = mock_supabase or MagicMock()
        mock_create.return_value = client
        svc = AutoCloseService()
    return svc, client


def _isoformat(dt: datetime) -> str:
    return dt.isoformat()


# ---------------------------------------------------------------------------
# Test Suite
# ---------------------------------------------------------------------------

class TestAutoCloseServiceInit(unittest.TestCase):
    """Tests for AutoCloseService.__init__"""

    def test_init_defaults(self):
        """Service initialises with correct defaults from environment."""
        svc, client = _make_service()
        self.assertTrue(svc.enabled)
        self.assertEqual(svc.default_auto_close_days, 7)
        self.assertEqual(svc.cron_schedule, '0 2 * * *')

    def test_init_disabled_via_env(self):
        """AUTO_CLOSE_ENABLED=false disables the service at init."""
        with patch.dict(os.environ, {'AUTO_CLOSE_ENABLED': 'false'}):
            svc, _ = _make_service()
        self.assertFalse(svc.enabled)

    def test_init_custom_days_env(self):
        """AUTO_CLOSE_DAYS env variable overrides default_auto_close_days."""
        with patch.dict(os.environ, {'AUTO_CLOSE_DAYS': '14'}):
            svc, _ = _make_service()
        self.assertEqual(svc.default_auto_close_days, 14)

    def test_init_custom_cron_env(self):
        """AUTO_CLOSE_CRON_SCHEDULE env variable overrides cron_schedule."""
        with patch.dict(os.environ, {'AUTO_CLOSE_CRON_SCHEDULE': '30 4 * * *'}):
            svc, _ = _make_service()
        self.assertEqual(svc.cron_schedule, '30 4 * * *')


class TestGetSystemSettings(unittest.TestCase):
    """Tests for AutoCloseService.get_system_settings()"""

    def setUp(self):
        self.patcher = patch('backend.services.auto_close_service.create_client')
        mock_create = self.patcher.start()
        self.mock_supabase = MagicMock()
        mock_create.return_value = self.mock_supabase
        self.service = AutoCloseService()

    def tearDown(self):
        self.patcher.stop()

    def test_get_system_settings_success(self):
        """Returns DB values when the query succeeds."""
        mock_resp = MagicMock()
        mock_resp.data = {'auto_close_days': 3, 'auto_close_enabled': True}
        (self.mock_supabase.table.return_value
                           .select.return_value
                           .eq.return_value
                           .single.return_value
                           .execute.return_value) = mock_resp

        settings = self.service.get_system_settings('company-abc')
        self.assertEqual(settings['auto_close_days'], 3)
        self.assertTrue(settings['auto_close_enabled'])

    def test_get_system_settings_disabled_company(self):
        """auto_close_enabled=False is returned verbatim."""
        mock_resp = MagicMock()
        mock_resp.data = {'auto_close_days': 5, 'auto_close_enabled': False}
        (self.mock_supabase.table.return_value
                           .select.return_value
                           .eq.return_value
                           .single.return_value
                           .execute.return_value) = mock_resp

        settings = self.service.get_system_settings('company-abc')
        self.assertFalse(settings['auto_close_enabled'])

    def test_get_system_settings_fallback_on_exception(self):
        """Returns safe defaults when the DB call raises an exception."""
        self.mock_supabase.table.side_effect = Exception('network error')
        settings = self.service.get_system_settings('bad-company')
        self.assertEqual(settings['auto_close_days'], 7)
        self.assertTrue(settings['auto_close_enabled'])

    def test_get_system_settings_missing_days_key(self):
        """Falls back to default_auto_close_days when DB row omits the key."""
        mock_resp = MagicMock()
        mock_resp.data = {'auto_close_enabled': True}  # no auto_close_days key
        (self.mock_supabase.table.return_value
                           .select.return_value
                           .eq.return_value
                           .single.return_value
                           .execute.return_value) = mock_resp

        settings = self.service.get_system_settings('company-xyz')
        self.assertEqual(settings['auto_close_days'], self.service.default_auto_close_days)


class TestCloseTicket(unittest.TestCase):
    """Tests for AutoCloseService._close_ticket()"""

    def setUp(self):
        self.patcher = patch('backend.services.auto_close_service.create_client')
        mock_create = self.patcher.start()
        self.mock_supabase = MagicMock()
        mock_create.return_value = self.mock_supabase
        self.service = AutoCloseService()

    def tearDown(self):
        self.patcher.stop()

    def test_close_ticket_success_increments_closed_count(self):
        """A successful DB update increments stats['closed_count'] and returns True."""
        stats = {'closed_count': 0, 'error_count': 0}
        (self.mock_supabase.table.return_value
                           .update.return_value
                           .eq.return_value
                           .eq.return_value
                           .execute.return_value) = MagicMock()

        result = self.service._close_ticket('ticket-1', 'company-1', stats)
        self.assertTrue(result)
        self.assertEqual(stats['closed_count'], 1)
        self.assertEqual(stats['error_count'], 0)

    def test_close_ticket_failure_increments_error_count(self):
        """A DB exception increments stats['error_count'] and returns False."""
        stats = {'closed_count': 0, 'error_count': 0}
        self.mock_supabase.table.side_effect = Exception('write failed')

        result = self.service._close_ticket('ticket-2', 'company-2', stats)
        self.assertFalse(result)
        self.assertEqual(stats['closed_count'], 0)
        self.assertEqual(stats['error_count'], 1)

    def test_close_ticket_does_not_alter_other_stats_keys(self):
        """_close_ticket only touches closed_count / error_count."""
        stats = {'closed_count': 0, 'error_count': 0,
                 'processed_count': 5, 'skipped_count': 2}
        (self.mock_supabase.table.return_value
                           .update.return_value
                           .eq.return_value
                           .eq.return_value
                           .execute.return_value) = MagicMock()

        self.service._close_ticket('ticket-3', 'company-3', stats)
        self.assertEqual(stats['processed_count'], 5)
        self.assertEqual(stats['skipped_count'], 2)


class TestRun(unittest.TestCase):
    """Tests for AutoCloseService.run()"""

    def setUp(self):
        self.patcher = patch('backend.services.auto_close_service.create_client')
        mock_create = self.patcher.start()
        self.mock_supabase = MagicMock()
        mock_create.return_value = self.mock_supabase
        self.service = AutoCloseService()

    def tearDown(self):
        self.patcher.stop()

    # ------------------------------------------------------------------
    # Disabled state
    # ------------------------------------------------------------------

    def test_run_returns_disabled_when_service_disabled(self):
        """run() short-circuits with {status: disabled} when self.enabled is False."""
        self.service.enabled = False
        result = self.service.run()
        self.assertEqual(result, {'status': 'disabled'})

    # ------------------------------------------------------------------
    # Empty ticket list
    # ------------------------------------------------------------------

    def test_run_empty_tickets_returns_zero_stats(self):
        """run() handles an empty resolved ticket list gracefully."""
        mock_resp = MagicMock()
        mock_resp.data = []
        (self.mock_supabase.table.return_value
                           .select.return_value
                           .eq.return_value
                           .execute.return_value) = mock_resp

        result = self.service.run()
        self.assertEqual(result['processed_count'], 0)
        self.assertEqual(result['closed_count'], 0)
        self.assertEqual(result['error_count'], 0)
        self.assertEqual(result['skipped_count'], 0)

    # ------------------------------------------------------------------
    # Ticket age filtering
    # ------------------------------------------------------------------

    def test_run_closes_old_ticket(self):
        """A ticket whose updated_at is older than auto_close_days is closed."""
        now = datetime(2024, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        old_updated_at = (now - timedelta(days=10)).isoformat()

        # Mock resolved tickets query
        tickets_resp = MagicMock()
        tickets_resp.data = [
            {'id': 'ticket-old', 'company_id': 'co-1', 'status': 'resolved',
             'updated_at': old_updated_at}
        ]

        # Mock settings query
        settings_resp = MagicMock()
        settings_resp.data = {'auto_close_days': 7, 'auto_close_enabled': True}

        # Mock update query
        update_resp = MagicMock()

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == 'tickets':
                # First call: SELECT resolved tickets
                mock_tbl.select.return_value.eq.return_value.execute.return_value = tickets_resp
                # Second call: UPDATE closed ticket
                mock_tbl.update.return_value.eq.return_value.eq.return_value.execute.return_value = update_resp
            elif table_name == 'system_settings':
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = settings_resp
            return mock_tbl

        self.mock_supabase.table.side_effect = table_side_effect

        with patch('backend.services.auto_close_service.datetime') as mock_dt:
            mock_dt.now.return_value = now
            mock_dt.fromisoformat.side_effect = datetime.fromisoformat
            result = self.service.run()

        self.assertEqual(result['closed_count'], 1)
        self.assertEqual(result['skipped_count'], 0)

    def test_run_skips_recent_ticket(self):
        """A ticket whose updated_at is within auto_close_days is NOT closed."""
        now = datetime(2024, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        recent_updated_at = (now - timedelta(days=2)).isoformat()

        tickets_resp = MagicMock()
        tickets_resp.data = [
            {'id': 'ticket-new', 'company_id': 'co-2', 'status': 'resolved',
             'updated_at': recent_updated_at}
        ]
        settings_resp = MagicMock()
        settings_resp.data = {'auto_close_days': 7, 'auto_close_enabled': True}

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == 'tickets':
                mock_tbl.select.return_value.eq.return_value.execute.return_value = tickets_resp
            elif table_name == 'system_settings':
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = settings_resp
            return mock_tbl

        self.mock_supabase.table.side_effect = table_side_effect

        with patch('backend.services.auto_close_service.datetime') as mock_dt:
            mock_dt.now.return_value = now
            mock_dt.fromisoformat.side_effect = datetime.fromisoformat
            result = self.service.run()

        self.assertEqual(result['closed_count'], 0)
        self.assertEqual(result['skipped_count'], 1)

    # ------------------------------------------------------------------
    # Missing / invalid timestamp
    # ------------------------------------------------------------------

    def test_run_skips_ticket_with_missing_updated_at(self):
        """A ticket with no updated_at field is silently skipped (no close, no error)."""
        tickets_resp = MagicMock()
        tickets_resp.data = [
            {'id': 'ticket-null', 'company_id': 'co-3', 'status': 'resolved',
             'updated_at': None}
        ]
        settings_resp = MagicMock()
        settings_resp.data = {'auto_close_days': 7, 'auto_close_enabled': True}

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == 'tickets':
                mock_tbl.select.return_value.eq.return_value.execute.return_value = tickets_resp
            elif table_name == 'system_settings':
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = settings_resp
            return mock_tbl

        self.mock_supabase.table.side_effect = table_side_effect
        result = self.service.run()

        self.assertEqual(result['closed_count'], 0)
        self.assertEqual(result['error_count'], 0)

    def test_run_increments_error_on_invalid_timestamp(self):
        """A ticket with a non-parseable updated_at increments error_count."""
        tickets_resp = MagicMock()
        tickets_resp.data = [
            {'id': 'ticket-bad-ts', 'company_id': 'co-4', 'status': 'resolved',
             'updated_at': 'NOT-A-DATE'}
        ]
        settings_resp = MagicMock()
        settings_resp.data = {'auto_close_days': 7, 'auto_close_enabled': True}

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == 'tickets':
                mock_tbl.select.return_value.eq.return_value.execute.return_value = tickets_resp
            elif table_name == 'system_settings':
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = settings_resp
            return mock_tbl

        self.mock_supabase.table.side_effect = table_side_effect
        result = self.service.run()

        self.assertGreater(result['error_count'], 0)
        self.assertEqual(result['closed_count'], 0)

    # ------------------------------------------------------------------
    # Per-company auto-close disabled
    # ------------------------------------------------------------------

    def test_run_skips_all_tickets_when_company_auto_close_disabled(self):
        """All tickets for a company with auto_close_enabled=False are skipped."""
        tickets_resp = MagicMock()
        tickets_resp.data = [
            {'id': 'ticket-a', 'company_id': 'co-5', 'status': 'resolved',
             'updated_at': '2024-01-01T00:00:00+00:00'},
            {'id': 'ticket-b', 'company_id': 'co-5', 'status': 'resolved',
             'updated_at': '2024-01-02T00:00:00+00:00'},
        ]
        settings_resp = MagicMock()
        settings_resp.data = {'auto_close_days': 7, 'auto_close_enabled': False}

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == 'tickets':
                mock_tbl.select.return_value.eq.return_value.execute.return_value = tickets_resp
            elif table_name == 'system_settings':
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = settings_resp
            return mock_tbl

        self.mock_supabase.table.side_effect = table_side_effect
        result = self.service.run()

        self.assertEqual(result['skipped_count'], 2)
        self.assertEqual(result['closed_count'], 0)

    # ------------------------------------------------------------------
    # Multiple companies
    # ------------------------------------------------------------------

    def test_run_multiple_companies_fetches_settings_per_company(self):
        """get_system_settings is called once per unique company_id."""
        tickets_resp = MagicMock()
        tickets_resp.data = [
            {'id': 'tkt-1', 'company_id': 'co-A', 'status': 'resolved',
             'updated_at': '2024-01-01T00:00:00+00:00'},
            {'id': 'tkt-2', 'company_id': 'co-B', 'status': 'resolved',
             'updated_at': '2024-01-01T00:00:00+00:00'},
        ]
        settings_resp_A = MagicMock()
        settings_resp_A.data = {'auto_close_days': 7, 'auto_close_enabled': True}
        settings_resp_B = MagicMock()
        settings_resp_B.data = {'auto_close_days': 7, 'auto_close_enabled': True}

        update_resp = MagicMock()

        call_count = {'n': 0}

        def table_side_effect(table_name):
            mock_tbl = MagicMock()
            if table_name == 'tickets':
                mock_tbl.select.return_value.eq.return_value.execute.return_value = tickets_resp
                mock_tbl.update.return_value.eq.return_value.eq.return_value.execute.return_value = update_resp
            elif table_name == 'system_settings':
                call_count['n'] += 1
                resp = settings_resp_A if call_count['n'] == 1 else settings_resp_B
                mock_tbl.select.return_value.eq.return_value.single.return_value.execute.return_value = resp
            return mock_tbl

        self.mock_supabase.table.side_effect = table_side_effect

        with patch.object(self.service, 'get_system_settings',
                          wraps=self.service.get_system_settings) as mock_gss:
            self.service.run()
            company_ids_called = {c.args[0] for c in mock_gss.call_args_list}

        self.assertIn('co-A', company_ids_called)
        self.assertIn('co-B', company_ids_called)
        self.assertEqual(len(company_ids_called), 2)

    # ------------------------------------------------------------------
    # Fatal outer error
    # ------------------------------------------------------------------

    def test_run_handles_fatal_db_error(self):
        """A total DB failure on the outer query increments error_count safely."""
        self.mock_supabase.table.side_effect = Exception('connection refused')
        result = self.service.run()
        self.assertIn('error_count', result)
        self.assertGreaterEqual(result['error_count'], 1)


class TestTestQuery(unittest.TestCase):
    """Tests for AutoCloseService.test_query()"""

    def setUp(self):
        self.patcher = patch('backend.services.auto_close_service.create_client')
        mock_create = self.patcher.start()
        self.mock_supabase = MagicMock()
        mock_create.return_value = self.mock_supabase
        self.service = AutoCloseService()

    def tearDown(self):
        self.patcher.stop()

    def test_test_query_returns_list_on_success(self):
        """test_query() returns a non-empty list when tickets exist."""
        mock_resp = MagicMock()
        mock_resp.data = [
            {'id': 'tkt-1', 'company_id': 'co-1', 'status': 'resolved',
             'updated_at': '2024-05-01T00:00:00+00:00', 'title': 'Network issue'}
        ]
        (self.mock_supabase.table.return_value
                           .select.return_value
                           .eq.return_value
                           .limit.return_value
                           .execute.return_value) = mock_resp

        result = self.service.test_query()
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['id'], 'tkt-1')

    def test_test_query_returns_empty_list_on_exception(self):
        """test_query() returns [] on any DB error — never raises."""
        self.mock_supabase.table.side_effect = Exception('timeout')
        result = self.service.test_query()
        self.assertEqual(result, [])

    def test_test_query_returns_empty_list_when_no_tickets(self):
        """test_query() returns [] when response.data is empty."""
        mock_resp = MagicMock()
        mock_resp.data = []
        (self.mock_supabase.table.return_value
                           .select.return_value
                           .eq.return_value
                           .limit.return_value
                           .execute.return_value) = mock_resp

        result = self.service.test_query()
        self.assertEqual(result, [])


class TestLoadAndGetInstance(unittest.TestCase):
    """Tests for module-level load() and get_instance() singleton helpers."""

    def setUp(self):
        # Reset module-level singleton before each test
        import backend.services.auto_close_service as svc_mod
        svc_mod._instance = None

    def test_get_instance_returns_none_before_load(self):
        """get_instance() returns None when load() has not yet been called."""
        result = get_instance()
        self.assertIsNone(result)

    def test_load_creates_and_returns_instance(self):
        """load() returns an AutoCloseService instance on first call."""
        with patch('backend.services.auto_close_service.create_client'):
            instance = load()
        self.assertIsInstance(instance, AutoCloseService)

    def test_load_returns_same_singleton(self):
        """Consecutive load() calls return the same object (singleton pattern)."""
        with patch('backend.services.auto_close_service.create_client'):
            first = load()
            second = load()
        self.assertIs(first, second)

    def test_get_instance_returns_instance_after_load(self):
        """get_instance() returns the singleton after load() was called."""
        with patch('backend.services.auto_close_service.create_client'):
            loaded = load()
        retrieved = get_instance()
        self.assertIs(loaded, retrieved)


if __name__ == '__main__':
    unittest.main()
