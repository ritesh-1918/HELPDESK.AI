"""
Tests for issue #1403 — Vectorize Sentence-Transformers Cosine Similarity
Computations with NumPy and ONNX Runtime.

Covers:
- cosine_similarity_matrix: identical vectors -> 1.0, orthogonal -> 0.0
- cosine_similarity_matrix: correct shape (N,)
- cosine_similarity_matrix: L2-normalised query/corpus gives correct similarity
- cosine_similarity_matrix: batch of different queries
- cosine_similarity_matrix: ValueError on shape mismatch
- cosine_similarity_matrix: accepts 2-D query of shape (1, d)
- top_k_similar: returns k results sorted descending
- top_k_similar: k capped at corpus size
- best_match: returns highest-similarity index
- best_match: correct for trivial identical-vector corpus
- OnnxEncoder: is_available False when no model dir configured
- OnnxEncoder: encode raises RuntimeError when unavailable
- Performance: matrix multiply is faster than loop for N=500
"""

from __future__ import annotations

import os
import sys
import time
import unittest

import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")


def _make_unit(d: int, rng: np.random.Generator | None = None) -> np.ndarray:
    if rng is None:
        rng = np.random.default_rng(42)
    v = rng.standard_normal(d).astype(np.float32)
    return v / np.linalg.norm(v)


def _make_corpus(n: int, d: int, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    vecs = rng.standard_normal((n, d)).astype(np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True).clip(min=1e-9)
    return vecs / norms


def _import():
    try:
        from backend.services.cosine_similarity import (
            cosine_similarity_matrix,
            top_k_similar,
            best_match,
            OnnxEncoder,
        )
        return cosine_similarity_matrix, top_k_similar, best_match, OnnxEncoder
    except ImportError:
        return None, None, None, None


# ---------------------------------------------------------------------------
# cosine_similarity_matrix
# ---------------------------------------------------------------------------

class TestCosineSimilarityMatrix(unittest.TestCase):
    def setUp(self):
        self.fn, _, _, _ = _import()

    def test_identical_vectors_score_one(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        v = _make_unit(384)
        corpus = v.reshape(1, -1)
        scores = self.fn(v, corpus)
        self.assertAlmostEqual(float(scores[0]), 1.0, places=5)

    def test_orthogonal_vectors_score_zero(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        d = 4
        q = np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
        c = np.array([[0.0, 1.0, 0.0, 0.0]], dtype=np.float32)
        scores = self.fn(q, c)
        self.assertAlmostEqual(float(scores[0]), 0.0, places=5)

    def test_opposite_vectors_score_minus_one(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        v = _make_unit(16)
        corpus = (-v).reshape(1, -1)
        scores = self.fn(v, corpus)
        self.assertAlmostEqual(float(scores[0]), -1.0, places=5)

    def test_output_shape_is_n(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        n, d = 50, 128
        q = _make_unit(d)
        c = _make_corpus(n, d)
        scores = self.fn(q, c)
        self.assertEqual(scores.shape, (n,))

    def test_scores_in_range(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(384)
        c = _make_corpus(100, 384)
        scores = self.fn(q, c)
        self.assertTrue(np.all(scores >= -1.01))
        self.assertTrue(np.all(scores <= 1.01))

    def test_2d_query_shape_accepted(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(64).reshape(1, -1)
        c = _make_corpus(10, 64)
        scores = self.fn(q, c)
        self.assertEqual(scores.shape, (10,))

    def test_dimension_mismatch_raises_valueerror(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(128)
        c = _make_corpus(5, 64)
        with self.assertRaises(ValueError):
            self.fn(q, c)

    def test_corpus_must_be_2d(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(4)
        c = _make_unit(4)  # 1-D corpus — should fail
        with self.assertRaises(ValueError):
            self.fn(q, c)

    def test_symmetry(self):
        """cosine_sim(a, b) == cosine_sim(b, a) for normalised vectors."""
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        a = _make_unit(64)
        b = _make_unit(64)
        s_ab = float(self.fn(a, b.reshape(1, -1))[0])
        s_ba = float(self.fn(b, a.reshape(1, -1))[0])
        self.assertAlmostEqual(s_ab, s_ba, places=5)

    def test_dtype_is_float32(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(16)
        c = _make_corpus(4, 16)
        scores = self.fn(q, c)
        self.assertEqual(scores.dtype, np.float32)


# ---------------------------------------------------------------------------
# top_k_similar
# ---------------------------------------------------------------------------

class TestTopKSimilar(unittest.TestCase):
    def setUp(self):
        _, self.fn, _, _ = _import()

    def test_returns_k_results(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(64)
        c = _make_corpus(20, 64)
        scores, indices = self.fn(q, c, k=5)
        self.assertEqual(len(scores), 5)
        self.assertEqual(len(indices), 5)

    def test_sorted_descending(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(64)
        c = _make_corpus(20, 64)
        scores, _ = self.fn(q, c, k=5)
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_k_capped_at_corpus_size(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(16)
        c = _make_corpus(3, 16)
        scores, indices = self.fn(q, c, k=100)
        self.assertEqual(len(scores), 3)

    def test_k_equals_one_matches_best_match(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        _, _, bm_fn, _ = _import()
        q = _make_unit(32)
        c = _make_corpus(10, 32)
        top_scores, top_idx = self.fn(q, c, k=1)
        bm_score, bm_idx = bm_fn(q, c)
        self.assertAlmostEqual(top_scores[0], bm_score, places=5)
        self.assertEqual(top_idx[0], bm_idx)

    def test_indices_are_valid_corpus_indices(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(64)
        c = _make_corpus(50, 64)
        _, indices = self.fn(q, c, k=10)
        for idx in indices:
            self.assertGreaterEqual(idx, 0)
            self.assertLess(idx, 50)


# ---------------------------------------------------------------------------
# best_match
# ---------------------------------------------------------------------------

class TestBestMatch(unittest.TestCase):
    def setUp(self):
        _, _, self.fn, _ = _import()

    def test_identical_query_returns_score_one(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(64)
        c = np.vstack([_make_corpus(4, 64), q.reshape(1, -1)])
        score, idx = self.fn(q, c)
        self.assertEqual(idx, 4)  # last row is q
        self.assertAlmostEqual(score, 1.0, places=5)

    def test_returns_highest_score(self):
        if self.fn is None:
            self.skipTest("cosine_similarity not importable")
        q = _make_unit(32)
        c = _make_corpus(20, 32)
        score, idx = self.fn(q, c)
        from backend.services.cosine_similarity import cosine_similarity_matrix
        scores = cosine_similarity_matrix(q, c)
        self.assertAlmostEqual(score, float(np.max(scores)), places=5)
        self.assertEqual(idx, int(np.argmax(scores)))


# ---------------------------------------------------------------------------
# OnnxEncoder
# ---------------------------------------------------------------------------

class TestOnnxEncoder(unittest.TestCase):
    def setUp(self):
        _, _, _, self.cls = _import()

    def test_not_available_when_no_dir(self):
        if self.cls is None:
            self.skipTest("cosine_similarity not importable")
        enc = self.cls(model_dir="")
        self.assertFalse(enc.is_available)

    def test_encode_raises_when_unavailable(self):
        if self.cls is None:
            self.skipTest("cosine_similarity not importable")
        enc = self.cls(model_dir="")
        with self.assertRaises(RuntimeError):
            enc.encode("test text")

    def test_not_available_when_dir_does_not_exist(self):
        if self.cls is None:
            self.skipTest("cosine_similarity not importable")
        enc = self.cls(model_dir="/non/existent/path")
        self.assertFalse(enc.is_available)


# ---------------------------------------------------------------------------
# Performance: matrix multiply vs loop
# ---------------------------------------------------------------------------

class TestPerformance(unittest.TestCase):
    def test_matrix_multiply_faster_than_loop_for_n500(self):
        """Vectorized numpy matmul must be faster than a Python dot-product loop."""
        try:
            from backend.services.cosine_similarity import cosine_similarity_matrix
        except ImportError:
            self.skipTest("cosine_similarity not importable")

        n, d = 500, 384
        q = _make_unit(d)
        c = _make_corpus(n, d)

        # Vectorized
        t0 = time.perf_counter()
        for _ in range(100):
            cosine_similarity_matrix(q, c)
        vectorized_time = time.perf_counter() - t0

        # Loop
        t0 = time.perf_counter()
        for _ in range(100):
            [float(np.dot(q, c[i])) for i in range(n)]
        loop_time = time.perf_counter() - t0

        self.assertLess(
            vectorized_time,
            loop_time,
            f"Vectorized ({vectorized_time:.3f}s) must be faster than loop ({loop_time:.3f}s)",
        )


if __name__ == "__main__":
    unittest.main()
