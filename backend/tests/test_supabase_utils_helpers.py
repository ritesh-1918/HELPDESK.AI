"""
Unit tests for backend/utils/supabase_utils.py — generic helpers.

Covers fetch_all, fetch_by_field, insert_record, update_record,
delete_record with a mocked supabase client (async functions are
executed via asyncio.run). Also covers the "missing env vars"
failure mode for get_supabase_client.
"""

import asyncio
import os
import sys
import unittest
from unittest import mock

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)

import backend.utils.supabase_utils as su


def run(coro):
    return asyncio.run(coro)


def _chain_with(data):
    """Return a mock chain whose .execute().data == data."""
    mock_chain = mock.MagicMock()
    mock_chain.execute.return_value.data = data
    return mock_chain


class TestFetchAll(unittest.TestCase):
    def test_returns_data(self):
        mock_sb = mock.MagicMock()
        mock_sb.table.return_value.select.return_value.limit.return_value = _chain_with(
            [{"id": 1}, {"id": 2}]
        )
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.fetch_all("tickets"))
        self.assertEqual(result, [{"id": 1}, {"id": 2}])

    def test_returns_empty_when_no_data(self):
        mock_sb = mock.MagicMock()
        mock_sb.table.return_value.select.return_value.limit.return_value = _chain_with(None)
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.fetch_all("tickets"))
        self.assertEqual(result, [])

    def test_respects_limit(self):
        mock_sb = mock.MagicMock()
        limit_chain = _chain_with([])
        mock_sb.table.return_value.select.return_value.limit.return_value = limit_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            run(su.fetch_all("tickets", limit=10))
        mock_sb.table.return_value.select.return_value.limit.assert_called_with(10)


class TestFetchByField(unittest.TestCase):
    def test_returns_data(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with([{"id": 1, "status": "open"}])
        mock_sb.table.return_value.select.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.fetch_by_field("tickets", "status", "open"))
        self.assertEqual(result, [{"id": 1, "status": "open"}])
        mock_sb.table.return_value.select.return_value.eq.assert_called_with("status", "open")

    def test_returns_empty(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with(None)
        mock_sb.table.return_value.select.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.fetch_by_field("tickets", "status", "nonexistent"))
        self.assertEqual(result, [])


class TestInsertRecord(unittest.TestCase):
    def test_returns_first_row(self):
        mock_sb = mock.MagicMock()
        mock_sb.table.return_value.insert.return_value = _chain_with(
            [{"id": 1, "name": "test"}]
        )
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.insert_record("tickets", {"name": "test"}))
        self.assertEqual(result, {"id": 1, "name": "test"})

    def test_returns_empty_dict_when_no_data(self):
        mock_sb = mock.MagicMock()
        mock_sb.table.return_value.insert.return_value = _chain_with(None)
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.insert_record("tickets", {"name": "test"}))
        self.assertEqual(result, {})


class TestUpdateRecord(unittest.TestCase):
    def test_returns_first_row(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with([{"id": 1, "name": "updated"}])
        mock_sb.table.return_value.update.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.update_record("tickets", "1", {"name": "updated"}))
        self.assertEqual(result, {"id": 1, "name": "updated"})

    def test_returns_empty_dict_when_no_data(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with(None)
        mock_sb.table.return_value.update.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            result = run(su.update_record("tickets", "1", {"name": "updated"}))
        self.assertEqual(result, {})


class TestDeleteRecord(unittest.TestCase):
    def test_returns_true_when_data_returned(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with([{"id": 1}])
        mock_sb.table.return_value.delete.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            self.assertTrue(run(su.delete_record("tickets", "1")))

    def test_returns_false_when_no_data(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with(None)
        mock_sb.table.return_value.delete.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            self.assertFalse(run(su.delete_record("tickets", "1")))

    def test_returns_false_when_empty_data(self):
        mock_sb = mock.MagicMock()
        eq_chain = _chain_with([])
        mock_sb.table.return_value.delete.return_value.eq.return_value = eq_chain
        with mock.patch.object(su, "_supabase_client", mock_sb):
            self.assertFalse(run(su.delete_record("tickets", "1")))


class TestGetSupabaseClientEnv(unittest.TestCase):
    def test_missing_env_raises(self):
        with mock.patch.object(su, "_supabase_client", None):
            with mock.patch.dict(os.environ, {}, clear=True):
                with self.assertRaises(ValueError) as ctx:
                    su.get_supabase_client()
                self.assertIn("SUPABASE_URL", str(ctx.exception))

    def test_only_url_no_key_raises(self):
        with mock.patch.object(su, "_supabase_client", None):
            with mock.patch.dict(
                os.environ, {"SUPABASE_URL": "https://x.supabase.co"}, clear=True
            ):
                with self.assertRaises(ValueError) as ctx:
                    su.get_supabase_client()
                self.assertIn("SUPABASE_SERVICE_KEY", str(ctx.exception))

    def test_only_key_no_url_raises(self):
        with mock.patch.object(su, "_supabase_client", None):
            with mock.patch.dict(
                os.environ, {"SUPABASE_SERVICE_KEY": "key"}, clear=True
            ):
                with self.assertRaises(ValueError):
                    su.get_supabase_client()


if __name__ == "__main__":
    unittest.main()
