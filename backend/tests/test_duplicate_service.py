"""
Unit coverage for duplicate_service.py (issue #3888).

Verifies that ticket title/text collisions trigger correctly and that the
service degrades safely when the embedding model is unavailable. The
sentence-transformers model and similarity function are mocked so tests run
without downloading the model.

Run with:  python -m unittest backend.tests.test_duplicate_service -v
"""

import json
import os
import tempfile
import unittest
from unittest.mock import patch

from backend.services.duplicate_service import SIMILARITY_THRESHOLD, DuplicateService


class FakeEmbedding:
    def __init__(self, value):
        self.value = value

    def item(self):
        return self.value


class FakeModel:
    def __init__(self, *args, **kwargs):
        pass

    def encode(self, text, convert_to_tensor=True):
        return text


def fake_cos_sim(query, stored):
    """Deterministic stand-in for util.cos_sim comparing text tokens."""
    q, s = query, stored
    if q == s:
        return FakeEmbedding(0.95)
    if q.lower() in s.lower() or s.lower() in q.lower():
        return FakeEmbedding(0.72)
    return FakeEmbedding(0.2)


@patch("backend.services.duplicate_service.SentenceTransformer", FakeModel)
@patch("backend.services.duplicate_service.util.cos_sim", fake_cos_sim)
class DuplicateServiceTests(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.service = DuplicateService()
        self.service.storage_file = os.path.join(self.tmpdir, "cache.json")

    def test_available_after_model_load(self):
        self.service.load()
        self.assertTrue(self.service.is_available())

    def test_empty_store_never_flags_duplicate(self):
        self.service.load()
        result = self.service.check_duplicate("printer jam")
        self.assertFalse(result["is_duplicate"])
        self.assertIsNone(result["duplicate_ticket_id"])
        self.assertEqual(result["similarity"], 0.0)

    def test_exact_title_collision_detected(self):
        self.service.load()
        self.service.add_ticket("T-100", "printer jam on the fifth floor")
        result = self.service.check_duplicate("printer jam on the fifth floor")
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "T-100")
        self.assertEqual(result["similarity"], 0.95)

    def test_related_title_collision_detected(self):
        self.service.load()
        self.service.add_ticket("T-101", "cannot connect to wifi network")
        result = self.service.check_duplicate("cannot connect to wifi")
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "T-101")

    def test_unrelated_text_not_flagged(self):
        self.service.load()
        self.service.add_ticket("T-102", "laptop screen cracked")
        result = self.service.check_duplicate("coffee machine not dispensing")
        self.assertFalse(result["is_duplicate"])
        self.assertIsNone(result["duplicate_ticket_id"])
        self.assertLess(result["similarity"], SIMILARITY_THRESHOLD)

    def test_best_match_returned(self):
        self.service.load()
        self.service.add_ticket("T-200", "keyboard broken")
        self.service.add_ticket("T-201", "monitor flickering at night")
        result = self.service.check_duplicate("monitor flickering at night")
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "T-201")

    def test_custom_threshold_overrides_default(self):
        self.service.load()
        self.service.add_ticket("T-300", "mouse not working")
        result = self.service.check_duplicate("random unrelated", threshold=0.1)
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "T-300")

    def test_degraded_mode_returns_no_duplicate(self):
        self.service._loaded = False
        self.service._load_failed = True
        self.service.model = None
        result = self.service.check_duplicate("anything at all")
        self.assertFalse(result["is_duplicate"])
        self.assertIsNone(result["duplicate_ticket_id"])
        self.assertEqual(result["similarity"], 0.0)

    def test_save_to_disk_persists_ticket(self):
        self.service.load()
        self.service.add_ticket("T-400", "usb port broken")
        with open(self.service.storage_file) as f:
            data = json.load(f)
        self.assertTrue(any(item["ticket_id"] == "T-400" for item in data))

    def test_history_rehydrated_from_disk(self):
        self.service.load()
        self.service.add_ticket("T-500", "bluetooth pairing fails")
        reloaded = DuplicateService()
        reloaded.storage_file = self.service.storage_file
        reloaded.load()
        result = reloaded.check_duplicate("bluetooth pairing fails")
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "T-500")


if __name__ == "__main__":
    unittest.main()
