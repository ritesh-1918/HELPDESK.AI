"""
Unit tests for the embedding duplicate-detection pipeline.

Tests the pure vector math and the ranking pipeline using a fake model so the
suite runs without downloading sentence-transformers weights.

Run with:  python -m unittest backend.tests.test_duplicate_service -v
"""

import unittest
import tempfile
import os

from backend.services.duplicate_service import (
    DuplicateService,
    cosine_similarity,
    SIMILARITY_THRESHOLD,
)


class DummyModel:
    """Deterministic fake embedder for pipeline tests."""

    def encode(self, text: str):
        # Fixed-dimension vector derived from the characters of the text.
        return [float((ord(c) % 7) + 1) for c in text]


class CosineSimilarityTests(unittest.TestCase):
    def test_identical_vectors(self):
        self.assertEqual(cosine_similarity([1, 0, 0], [1, 0, 0]), 1.0)

    def test_orthogonal_vectors(self):
        self.assertAlmostEqual(cosine_similarity([1, 0], [0, 1]), 0.0)

    def test_opposite_vectors(self):
        self.assertAlmostEqual(cosine_similarity([1, 0], [-1, 0]), -1.0)

    def test_zero_vector_guard(self):
        self.assertEqual(cosine_similarity([0, 0], [1, 1]), 0.0)

    def test_length_mismatch(self):
        with self.assertRaises(ValueError):
            cosine_similarity([1, 2], [1])

    def test_empty_vectors(self):
        self.assertEqual(cosine_similarity([], []), 0.0)


class DuplicatePipelineTests(unittest.TestCase):
    def setUp(self):
        tmpdir = tempfile.mkdtemp()
        self.service = DuplicateService()
        self.service.model = DummyModel()
        self.service._loaded = True
        self.service.storage_file = os.path.join(tmpdir, "case_history_cache.json")
        self.service._tickets = []
        self.service.add_ticket("ticket-1", "printer won't connect to the wifi network")
        self.service.add_ticket("ticket-2", "billing invoice has the wrong total")
        self.service.add_ticket("ticket-3", "laptop screen flickers after update")

    def test_add_ticket_persists_to_disk(self):
        self.assertTrue(os.path.exists(self.service.storage_file))
        self.assertEqual(len(self.service._tickets), 3)

    def test_find_similar_ranks_matches(self):
        matches = self.service.find_similar("printer cannot join wifi", top_k=2)
        self.assertEqual(len(matches), 2)
        self.assertEqual(matches[0]["ticket_id"], "ticket-1")
        self.assertGreater(matches[0]["similarity"], matches[1]["similarity"])
        self.assertIn("similarity", matches[0])
        self.assertIn("text", matches[0])

    def test_find_similar_exclude(self):
        matches = self.service.find_similar("printer cannot join wifi", top_k=3, exclude_ticket_id="ticket-1")
        self.assertTrue(all(m["ticket_id"] != "ticket-1" for m in matches))

    def test_find_similar_empty_store(self):
        self.service._tickets = []
        self.assertEqual(self.service.find_similar("anything"), [])

    def test_check_duplicate_found(self):
        result = self.service.check_duplicate("printer fails to connect to wifi", threshold=0.1)
        self.assertTrue(result["is_duplicate"])
        self.assertEqual(result["duplicate_ticket_id"], "ticket-1")

    def test_check_duplicate_none(self):
        result = self.service.check_duplicate("printer fails to connect to wifi", threshold=0.99)
        self.assertFalse(result["is_duplicate"])

    def test_similarity_between(self):
        score = self.service.similarity_between("printer wifi issue", "printer wifi issue")
        self.assertEqual(score, 1.0)

    def test_index_summary(self):
        summary = self.service.index_summary()
        self.assertEqual(summary["model_available"], True)
        self.assertEqual(summary["indexed_tickets"], 3)
        self.assertEqual(summary["threshold"], SIMILARITY_THRESHOLD)

    def test_rebuild_index_from_disk(self):
        self.service._tickets = []
        self.service.rebuild_index_from_disk()
        self.assertEqual(len(self.service._tickets), 3)


if __name__ == "__main__":
    unittest.main()
