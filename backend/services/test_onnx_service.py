from backend.services.onnx_service import (
    best_prototype_match,
    build_classification_result,
    cosine_similarity,
)


def test_cosine_similarity_handles_zero_vectors():
    assert cosine_similarity([0, 0, 0], [1, 2, 3]) == 0.0


def test_best_prototype_match_selects_highest_score():
    match = best_prototype_match(
        [1, 0],
        {
            "Access": [0.2, 0.8],
            "Network": [0.9, 0.1],
        },
    )

    assert match.label == "Network"
    assert match.score > 0.9


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
