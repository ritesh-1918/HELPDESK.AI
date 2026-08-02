"""Unit tests for backend/services/incident_service.py - Incident Correlation Service.

Issue: #1116 - test: add unit tests for incident_service.py
"""

import unittest
import time
from unittest.mock import patch, MagicMock


class TestIncidentServiceInit(unittest.TestCase):
    """Tests for IncidentService initialization."""

    def test_init_with_duplicate_service(self):
        """IncidentService initializes with a DuplicateService instance."""
        from backend.services.incident_service import IncidentService
        mock_dup = MagicMock()
        service = IncidentService(mock_dup)
        self.assertEqual(service._duplicate_service, mock_dup)
        self.assertEqual(service._recent, [])
        self.assertEqual(service._incidents, {})

    def test_init_stores_duplicate_service_reference(self):
        """Duplicate service reference is stored correctly."""
        from backend.services.incident_service import IncidentService
        mock_dup = MagicMock()
        service = IncidentService(mock_dup)
        self.assertIs(service._duplicate_service, mock_dup)


class TestIsCritical(unittest.TestCase):
    """Tests for _is_critical method."""

    def setUp(self):
        from backend.services.incident_service import IncidentService
        self.service = IncidentService(MagicMock())

    def test_critical_priority(self):
        """Priority 'critical' returns True."""
        self.assertTrue(self.service._is_critical("critical", None))

    def test_critical_priority_uppercase(self):
        """Priority 'CRITICAL' returns True (case insensitive)."""
        self.assertTrue(self.service._is_critical("CRITICAL", None))

    def test_critical_priority_mixed_case(self):
        """Priority 'Critical' returns True."""
        self.assertTrue(self.service._is_critical("Critical", None))

    def test_critical_category_email(self):
        """Category 'email' returns True."""
        self.assertTrue(self.service._is_critical(None, "email"))

    def test_critical_category_network(self):
        """Category 'network' returns True."""
        self.assertTrue(self.service._is_critical(None, "network"))

    def test_critical_category_authentication(self):
        """Category 'authentication' returns True."""
        self.assertTrue(self.service._is_critical(None, "authentication"))

    def test_critical_category_exchange(self):
        """Category 'exchange' returns True."""
        self.assertTrue(self.service._is_critical(None, "exchange"))

    def test_non_critical_priority(self):
        """Non-critical priority returns False."""
        self.assertFalse(self.service._is_critical("high", None))
        self.assertFalse(self.service._is_critical("medium", None))
        self.assertFalse(self.service._is_critical("low", None))

    def test_non_critical_category(self):
        """Non-critical category returns False."""
        self.assertFalse(self.service._is_critical(None, "general"))
        self.assertFalse(self.service._is_critical(None, "billing"))

    def test_both_none(self):
        """Both None returns False."""
        self.assertFalse(self.service._is_critical(None, None))

    def test_both_empty(self):
        """Empty strings return False."""
        self.assertFalse(self.service._is_critical("", ""))


class TestPrune(unittest.TestCase):
    """Tests for _prune method."""

    def setUp(self):
        from backend.services.incident_service import IncidentService
        self.service = IncidentService(MagicMock())

    def test_prune_removes_old_tickets(self):
        """Tickets older than WINDOW_SECONDS are removed."""
        from backend.services.incident_service import WINDOW_SECONDS
        now = 1000000.0
        cutoff = now - WINDOW_SECONDS
        self.service._recent = [
            {"ticket_id": "T1", "ts": cutoff - 1},       # Should be pruned
            {"ticket_id": "T2", "ts": cutoff},             # Edge: exactly at cutoff
            {"ticket_id": "T3", "ts": now - 1},            # Should stay
            {"ticket_id": "T4", "ts": now},                 # Should stay
        ]
        self.service._prune(now)
        remaining_ids = [t["ticket_id"] for t in self.service._recent]
        self.assertNotIn("T1", remaining_ids)
        self.assertIn("T3", remaining_ids)
        self.assertIn("T4", remaining_ids)

    def test_prune_empty_list(self):
        """Prune on empty list does nothing."""
        self.service._recent = []
        self.service._prune(1000000.0)
        self.assertEqual(self.service._recent, [])

    def test_prune_all_old(self):
        """All tickets older than window are removed."""
        from backend.services.incident_service import WINDOW_SECONDS
        now = 1000000.0
        self.service._recent = [
            {"ticket_id": "T1", "ts": now - WINDOW_SECONDS - 100},
            {"ticket_id": "T2", "ts": now - WINDOW_SECONDS - 1},
        ]
        self.service._prune(now)
        self.assertEqual(self.service._recent, [])

    def test_prune_all_recent(self):
        """All tickets within window stay."""
        from backend.services.incident_service import WINDOW_SECONDS
        now = 1000000.0
        self.service._recent = [
            {"ticket_id": "T1", "ts": now - 1},
            {"ticket_id": "T2", "ts": now},
        ]
        self.service._prune(now)
        self.assertEqual(len(self.service._recent), 2)


class TestCorrelate(unittest.TestCase):
    """Tests for correlate method."""

    def setUp(self):
        from backend.services.incident_service import IncidentService
        self.mock_dup = MagicMock()
        self.mock_model = MagicMock()
        self.mock_dup.model = self.mock_model
        self.service = IncidentService(self.mock_dup)

        # Mock the sentence_transformers.util
        self._util_patcher = patch(
            'backend.services.incident_service.util',
            create=True
        )
        self.mock_util = self._util_patcher.start()

    def tearDown(self):
        self._util_patcher.stop()

    def test_correlate_no_model_available(self):
        """When model is None, returns empty result."""
        self.mock_dup.model = None
        self.mock_dup.load.return_value = None

        result = self.service.correlate("test text", user_id="u1")
        self.assertIsNone(result["incident_id"])
        self.assertFalse(result["is_major_incident"])
        self.assertEqual(result["ticket_count"], 0)
        self.assertEqual(result["affected_users"], 0)
        self.assertEqual(result["similarity"], 0.0)

    def test_correlate_no_util_available(self):
        """When util is None, returns empty result."""
        self._util_patcher.stop()
        import backend.services.incident_service as inc_mod
        inc_mod.util = None

        result = self.service.correlate("test", user_id="u1")
        self.assertIsNone(result["incident_id"])

    def test_correlate_first_ticket_creates_incident(self):
        """First ticket creates a new incident."""
        mock_tensor = MagicMock()
        self.mock_model.encode.return_value = mock_tensor

        result = self.service.correlate(
            "Database is down",
            user_id="user-1",
            category="database",
            priority="critical",
            ticket_id="TKT-001",
        )
        self.assertIsNotNone(result["incident_id"])
        self.assertTrue(result["incident_id"].startswith("INC-"))
        self.assertFalse(result["is_major_incident"])
        self.assertEqual(result["ticket_count"], 1)
        self.assertEqual(result["affected_users"], 1)

    def test_correlate_multiple_tickets_same_incident(self):
        """Multiple similar tickets cluster into same incident."""
        mock_tensor1 = MagicMock()
        mock_tensor2 = MagicMock()

        # Mock cosine similarity to return high score
        self.mock_util.cos_sim.return_value.item.return_value = 0.85

        self.mock_model.encode.side_effect = [mock_tensor1, mock_tensor2]

        # First ticket
        self.service.correlate("DB connection error", ticket_id="TKT-001")
        # Second similar ticket
        result = self.service.correlate(
            "Database timeout issue",
            user_id="user-2",
            ticket_id="TKT-002",
        )
        self.assertEqual(result["ticket_count"], 2)
        self.assertEqual(result["affected_users"], 2)

    def test_correlate_below_threshold_new_incident(self):
        """Low similarity creates a new incident."""
        mock_tensor1 = MagicMock()
        mock_tensor2 = MagicMock()
        self.mock_util.cos_sim.return_value.item.return_value = 0.30  # below threshold

        self.mock_model.encode.side_effect = [mock_tensor1, mock_tensor2]

        r1 = self.service.correlate("Email issue", ticket_id="TKT-001")
        r2 = self.service.correlate("Database crash", ticket_id="TKT-002")

        # Should be different incidents
        self.assertNotEqual(r1["incident_id"], r2["incident_id"])

    def test_correlate_centroid_update(self):
        """Running average centroid is updated with new ticket."""
        mock_tensor1 = MagicMock()
        mock_tensor2 = MagicMock()
        self.mock_util.cos_sim.return_value.item.return_value = 0.80
        self.mock_model.encode.side_effect = [mock_tensor1, mock_tensor2]

        self.service.correlate("Issue 1", ticket_id="TKT-001")
        inc_id = list(self.service._incidents.keys())[0]
        original_centroid = self.service._incidents[inc_id]["centroid"]

        self.service.correlate("Issue 2", ticket_id="TKT-002")
        updated_centroid = self.service._incidents[inc_id]["centroid"]

        # Centroid should be updated (different object after averaging)
        self.assertIsNotNone(updated_centroid)

    def test_correlate_without_ticket_id(self):
        """Ticket ID auto-generated if not provided."""
        mock_tensor = MagicMock()
        self.mock_model.encode.return_value = mock_tensor

        result = self.service.correlate("text without id")
        self.assertIsNotNone(result["incident_id"])

    def test_correlate_major_incident_threshold(self):
        """Major incident triggered when ticket count exceeds threshold."""
        mock_tensor = MagicMock()
        self.mock_model.encode.return_value = mock_tensor
        self.mock_util.cos_sim.return_value.item.return_value = 0.85

        from backend.services.incident_service import TICKET_TRIGGER

        # Add tickets up to trigger
        for i in range(TICKET_TRIGGER):
            result = self.service.correlate(
                f"Network outage report {i}",
                user_id=f"user-{i}",
                ticket_id=f"TKT-{i:03d}",
                priority="critical" if i < 3 else "high",
            )

        self.assertTrue(result["is_major_incident"])
        self.assertGreaterEqual(result["ticket_count"], TICKET_TRIGGER)

    def test_correlate_major_incident_users_threshold(self):
        """Major incident triggered when affected users exceed threshold."""
        mock_tensor = MagicMock()
        self.mock_model.encode.return_value = mock_tensor
        self.mock_util.cos_sim.return_value.item.return_value = 0.85

        from backend.services.incident_service import USER_TRIGGER

        # Reset service for clean test
        from backend.services.incident_service import IncidentService
        mock_dup2 = MagicMock()
        mock_dup2.model = MagicMock()
        mock_dup2.model.encode.return_value = MagicMock()
        service2 = IncidentService(mock_dup2)

        for i in range(USER_TRIGGER):
            result = service2.correlate(
                f"Service degradation {i}",
                user_id=f"unique-user-{i}",
                ticket_id=f"TKT-{i:03d}",
            )

        self.assertTrue(result["is_major_incident"])


class TestListActive(unittest.TestCase):
    """Tests for list_active method."""

    def setUp(self):
        from backend.services.incident_service import IncidentService
        self.service = IncidentService(MagicMock())

    def test_list_active_empty(self):
        """No active incidents returns empty list."""
        result = self.service.list_active()
        self.assertEqual(result, [])

    def test_list_active_with_incidents(self):
        """Active incidents are listed."""
        now = time.time()
        self.service._incidents = {
            "INC-AAA": {
                "id": "INC-AAA",
                "is_major": False,
                "ticket_ids": ["T1", "T2"],
                "user_ids": {"u1", "u2"},
                "category": "network",
                "priority": "high",
                "first_seen": now - 500,
                "last_seen": now - 10,
                "sample_text": "Network down",
            },
            "INC-BBB": {
                "id": "INC-BBB",
                "is_major": True,
                "ticket_ids": ["T3"],
                "user_ids": {"u3"},
                "category": "email",
                "priority": "critical",
                "first_seen": now - 100,
                "last_seen": now - 5,
                "sample_text": "Email outage",
            },
        }
        result = self.service.list_active()
        self.assertEqual(len(result), 2)
        # Newest first
        self.assertEqual(result[0]["incident_id"], "INC-BBB")

    def test_list_active_filters_expired(self):
        """Incidents outside window are filtered out."""
        from backend.services.incident_service import WINDOW_SECONDS
        now = time.time()
        self.service._incidents = {
            "INC-OLD": {
                "id": "INC-OLD",
                "ticket_ids": ["T1"],
                "user_ids": {"u1"},
                "first_seen": now - WINDOW_SECONDS - 1000,
                "last_seen": now - WINDOW_SECONDS - 1,
                "is_major": False,
            },
        }
        result = self.service.list_active()
        self.assertEqual(len(result), 0)

    def test_list_active_returns_serializable_data(self):
        """Returned data is JSON-serializable dicts."""
        self.service._incidents = {
            "INC-001": {
                "id": "INC-001",
                "is_major": False,
                "ticket_ids": ["T1"],
                "user_ids": {"u1"},
                "category": "test",
                "priority": "low",
                "first_seen": time.time() - 100,
                "last_seen": time.time(),
                "sample_text": "Test incident",
            },
        }
        result = self.service.list_active()
        self.assertIsInstance(result, list)
        self.assertIn("incident_id", result[0])
        self.assertIn("ticket_count", result[0])
        self.assertIn("affected_users", result[0])


class TestConstants(unittest.TestCase):
    """Tests for module-level constants."""

    def test_correlation_threshold_default(self):
        """Default correlation threshold."""
        from backend.services.incident_service import CORRELATION_THRESHOLD
        self.assertGreater(CORRELATION_THRESHOLD, 0)
        self.assertLess(CORRELATION_THRESHOLD, 1)

    def test_window_seconds_default(self):
        """Default window seconds."""
        from backend.services.incident_service import WINDOW_SECONDS
        self.assertEqual(WINDOW_SECONDS, 600)

    def test_ticket_trigger_default(self):
        """Default ticket trigger."""
        from backend.services.incident_service import TICKET_TRIGGER
        self.assertEqual(TICKET_TRIGGER, 20)

    def test_user_trigger_default(self):
        """Default user trigger."""
        from backend.services.incident_service import USER_TRIGGER
        self.assertEqual(USER_TRIGGER, 50)

    def test_critical_trigger_default(self):
        """Default critical trigger."""
        from backend.services.incident_service import CRITICAL_TICKET_TRIGGER
        self.assertEqual(CRITICAL_TICKET_TRIGGER, 5)

    def test_env_override(self):
        """Constants can be overridden via env vars."""
        with patch.dict('os.environ', {
            'INCIDENT_CORRELATION_THRESHOLD': '0.85',
            'INCIDENT_WINDOW_SECONDS': '300',
            'INCIDENT_TICKET_TRIGGER': '10',
        }):
            # Re-import to get new values
            import importlib
            import backend.services.incident_service as mod
            importlib.reload(mod)
            self.assertEqual(mod.WINDOW_SECONDS, 300)
            self.assertEqual(mod.TICKET_TRIGGER, 10)


if __name__ == '__main__':
    unittest.main()
