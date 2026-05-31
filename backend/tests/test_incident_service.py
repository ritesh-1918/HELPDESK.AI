import sys
import os
import unittest
from unittest.mock import MagicMock, patch
import time

os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mockkey'

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.incident_service import (
    IncidentService,
    CORRELATION_THRESHOLD,
    WINDOW_SECONDS,
    TICKET_TRIGGER,
    USER_TRIGGER,
    CRITICAL_TICKET_TRIGGER,
)


class TestIncidentConstants(unittest.TestCase):

    def test_correlation_threshold_is_float(self):
        self.assertIsInstance(CORRELATION_THRESHOLD, float)
        self.assertGreater(CORRELATION_THRESHOLD, 0)
        self.assertLessEqual(CORRELATION_THRESHOLD, 1)

    def test_window_seconds_is_positive(self):
        self.assertGreater(WINDOW_SECONDS, 0)

    def test_ticket_trigger_is_positive(self):
        self.assertGreater(TICKET_TRIGGER, 0)

    def test_user_trigger_is_positive(self):
        self.assertGreater(USER_TRIGGER, 0)

    def test_critical_ticket_trigger_is_positive(self):
        self.assertGreater(CRITICAL_TICKET_TRIGGER, 0)


class TestIncidentServicePrune(unittest.TestCase):

    def setUp(self):
        mock_dup = MagicMock()
        mock_dup.model = MagicMock()
        self.service = IncidentService(mock_dup)

    def test_prune_removes_expired_entries(self):
        now = time.time()
        self.service._recent = [
            {"ts": now - WINDOW_SECONDS - 100, "ticket_id": "old"},
            {"ts": now - 10, "ticket_id": "new"},
        ]
        self.service._prune(now)
        self.assertEqual(len(self.service._recent), 1)
        self.assertEqual(self.service._recent[0]["ticket_id"], "new")

    def test_prune_keeps_all_within_window(self):
        now = time.time()
        self.service._recent = [
            {"ts": now - 5, "ticket_id": "a"},
            {"ts": now - 10, "ticket_id": "b"},
        ]
        self.service._prune(now)
        self.assertEqual(len(self.service._recent), 2)

    def test_prune_empty_list(self):
        self.service._recent = []
        self.service._prune(time.time())
        self.assertEqual(self.service._recent, [])


class TestIncidentServiceIsCritical(unittest.TestCase):

    def setUp(self):
        mock_dup = MagicMock()
        mock_dup.model = MagicMock()
        self.service = IncidentService(mock_dup)

    def test_critical_priority(self):
        self.assertTrue(self.service._is_critical("critical", None))

    def test_case_insensitive(self):
        self.assertTrue(self.service._is_critical("CRITICAL", None))
        self.assertTrue(self.service._is_critical("Critical", None))

    def test_critical_category(self):
        for cat in ("email", "network", "authentication", "exchange"):
            self.assertTrue(self.service._is_critical(None, cat))

    def test_non_critical_priority_and_category(self):
        self.assertFalse(self.service._is_critical("low", "billing"))

    def test_none_values_return_false(self):
        self.assertFalse(self.service._is_critical(None, None))


class TestIncidentServiceCorrelate(unittest.TestCase):

    def setUp(self):
        self.mock_dup = MagicMock()
        self.mock_model = MagicMock()
        self.mock_dup.model = self.mock_model
        self.mock_dup.load = MagicMock()
        self.service = IncidentService(self.mock_dup)

    def test_no_model_returns_empty_result(self):
        self.mock_dup.model = None
        result = self.service.correlate("test ticket text")
        self.assertIsNone(result["incident_id"])
        self.assertFalse(result["is_major_incident"])

    @patch("backend.services.incident_service.util")
    def test_first_ticket_creates_new_incident(self, mock_util):
        mock_util.cos_sim.return_value.item.return_value = 0.0
        self.mock_model.encode.return_value = "fake_embedding"

        result = self.service.correlate(
            "New issue with login",
            user_id="user1",
            category="authentication",
            priority="high",
            ticket_id="T-001",
        )

        self.assertIsNotNone(result["incident_id"])
        self.assertTrue(result["incident_id"].startswith("INC-"))
        self.assertEqual(result["ticket_count"], 1)
        self.assertEqual(result["affected_users"], 1)
        self.assertFalse(result["is_major_incident"])

    @patch("backend.services.incident_service.util")
    def test_similar_ticket_matches_existing_incident(self, mock_util):
        mock_util.cos_sim.return_value.item.return_value = 0.95
        self.mock_model.encode.return_value = "fake_embedding"

        result1 = self.service.correlate(
            "Login issue", user_id="user1", ticket_id="T-001"
        )
        incident_id = result1["incident_id"]

        result2 = self.service.correlate(
            "Still login problem", user_id="user2", ticket_id="T-002"
        )

        self.assertEqual(result2["incident_id"], incident_id)
        self.assertEqual(result2["ticket_count"], 2)
        self.assertEqual(result2["affected_users"], 2)

    @patch("backend.services.incident_service.util")
    def test_low_similarity_creates_separate_incident(self, mock_util):
        mock_util.cos_sim.return_value.item.return_value = 0.1
        self.mock_model.encode.return_value = "fake_embedding"

        r1 = self.service.correlate("Login issue", ticket_id="T-001")
        r2 = self.service.correlate("Refund request", ticket_id="T-002")

        self.assertNotEqual(r1["incident_id"], r2["incident_id"])


class TestIncidentServiceListActive(unittest.TestCase):

    def setUp(self):
        mock_dup = MagicMock()
        mock_dup.model = MagicMock()
        self.service = IncidentService(mock_dup)

    def test_empty_returns_empty_list(self):
        self.assertEqual(self.service.list_active(), [])

    @patch("backend.services.incident_service.util")
    def test_active_incidents_are_returned(self, mock_util):
        mock_util.cos_sim.return_value.item.return_value = 0.0
        self.mock_model.encode.return_value = "fake_embed"

        self.service.correlate("Test ticket", user_id="u1", ticket_id="T-001")
        active = self.service.list_active()

        self.assertEqual(len(active), 1)
        self.assertIn("incident_id", active[0])
        self.assertIn("is_major_incident", active[0])
        self.assertIn("ticket_count", active[0])

    def test_expired_incidents_excluded(self):
        old_time = time.time() - WINDOW_SECONDS - 1000
        self.service._incidents = {
            "INC-OLD": {
                "id": "INC-OLD",
                "last_seen": old_time,
                "is_major": False,
                "ticket_ids": ["T-old"],
                "user_ids": set(),
                "category": None,
                "priority": None,
                "first_seen": old_time,
            }
        }
        self.assertEqual(self.service.list_active(), [])

    def test_active_incidents_sorted_by_last_seen(self):
        now = time.time()
        self.service._incidents = {
            "A": {"id": "A", "is_major": False, "ticket_ids": ["1"], "user_ids": set(), "category": None, "priority": None, "first_seen": now - 10, "last_seen": now - 5, "sample_text": ""},
            "B": {"id": "B", "is_major": True, "ticket_ids": ["2"], "user_ids": set(), "category": None, "priority": None, "first_seen": now - 20, "last_seen": now, "sample_text": ""},
        }
        active = self.service.list_active()
        self.assertEqual(active[0]["incident_id"], "B")
        self.assertEqual(active[1]["incident_id"], "A")


if __name__ == '__main__':
    unittest.main()
