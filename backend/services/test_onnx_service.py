"""
Tests for onnx_service.py — vectorized cosine similarity with NumPy.

Covers:
- cosine_similarity with 1-D query and 2-D prototypes matrix
- Zero-vector handling (norm = 0)
- Dimension mismatch raises ValueError
- best_prototype_match selects highest score
- Empty prototypes returns Unknown
- build_classification_result routing maps
"""

import numpy as np

from backend.services.onnx_service import (
    best_prototype_match,
    build_classification_result,
    cosine_similarity,
)


def _normalise(v: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(v)
    return v / n if n > 0 else v


def test_cosine_similarity_identical_vectors():
    v = _normalise(np.array([1.0, 2.0, 3.0], dtype=np.float32))
    scores = cosine_similarity(v, v.reshape(1, -1))
    assert abs(float(scores[0]) - 1.0) < 1e-5


def test_cosine_similarity_orthogonal_vectors():
    q = np.array([1.0, 0.0], dtype=np.float32)
    p = np.array([[0.0, 1.0]], dtype=np.float32)
    scores = cosine_similarity(q, p)
    assert abs(float(scores[0])) < 1e-5


def test_cosine_similarity_output_shape():
    q = _normalise(np.random.randn(8).astype(np.float32))
    p = _normalise(np.random.randn(5, 8).astype(np.float32))
    scores = cosine_similarity(q, p)
    assert scores.shape == (5,)
    assert scores.dtype == np.float32


def test_cosine_similarity_raises_on_dim_mismatch():
    q = np.array([1.0, 0.0], dtype=np.float32)
    p = np.array([[0.0, 1.0, 0.0]], dtype=np.float32)
    try:
        cosine_similarity(q, p)
        assert False, "Expected ValueError"
    except ValueError:
        pass


def test_best_prototype_match_selects_highest_score():
    q = _normalise(np.array([1.0, 0.0], dtype=np.float32))
    access_v = _normalise(np.array([0.2, 0.8], dtype=np.float32))
    network_v = _normalise(np.array([0.9, 0.1], dtype=np.float32))

    match = best_prototype_match(
        q,
        {
            "Access": access_v,
            "Network": network_v,
        },
    )

    assert match.label == "Network"
    assert match.score > 0.9


def test_best_prototype_match_empty_prototypes():
    q = np.array([1.0, 0.0], dtype=np.float32)
    match = best_prototype_match(q, {})
    assert match.label == "Unknown"
    assert match.score == 0.0


def test_build_classification_result_uses_existing_routing_maps():
    result = build_classification_result("Access", "Password Reset", 0.87654)

    assert result == {
        "category": "Access",
        "subcategory": "Password Reset",
        "priority": "High",
        "auto_resolve": True,
        "assigned_team": "IAM Team",
        "confidence": 0.8765,
        "source": "onnx-minilm",
    }
