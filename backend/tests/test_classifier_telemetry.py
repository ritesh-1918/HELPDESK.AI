import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def reset_classifier_telemetry():
    import backend.main as main

    main.classifier_telemetry.clear()
    yield
    main.classifier_telemetry.clear()


def test_classifier_health_tracks_fallback_and_shadow_metrics(test_client):
    import backend.main as main

    fallback_prediction = {
        "category": "Hardware",
        "subcategory": "Printer Error",
        "priority": "High",
        "auto_resolve": False,
        "assigned_team": "Hardware Support",
        "confidence": 0.81,
    }
    shadow_prediction = {
        "category": "Hardware",
        "subcategory": "Printer Error",
        "priority": "High",
        "auto_resolve": False,
        "assigned_team": "Hardware Support",
        "confidence": 0.79,
    }

    with patch.object(main.classifier_v3, "predict", return_value={"error": "V3 unavailable"}), \
         patch.object(main.onnx_classifier, "predict", side_effect=RuntimeError("onnx unavailable")), \
         patch.object(main.classifier_service, "predict", return_value=fallback_prediction), \
         patch.object(main.classifier_v2, "predict", return_value=shadow_prediction):
        response = test_client.post(
            "/ai/analyze",
            json={"text": "Printer keeps jamming", "company_id": "company_A"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["env_metadata"]["classifier_version"] == "v1"
    assert payload["env_metadata"]["shadow_classifier_version"] == "v2_shadow"

    health = test_client.get("/ai/model_health")
    assert health.status_code == 200
    metrics = health.json()
    assert metrics["observations"] == 1
    assert metrics["classifier_fallback_count"] == 1
    assert metrics["v3_success_rate"] == 0.0
    assert metrics["v1_average_confidence"] == pytest.approx(0.81)
    assert metrics["v2_shadow_agreement_rate"] == 1.0
    assert metrics["critical_warning"] is True


def test_model_comparison_returns_normalized_predictions(test_client):
    import backend.main as main

    with patch.object(main.classifier_v3, "predict", return_value={"error": "V3 unavailable"}), \
         patch.object(main.classifier_service, "predict", return_value={
             "category": "Software",
             "subcategory": "Software Install",
             "priority": "Medium",
             "auto_resolve": True,
             "assigned_team": "Application Support",
             "confidence": 0.92,
         }), \
         patch.object(main.classifier_v2, "predict", return_value={
             "category": {"prediction": "Software", "confidence": 0.91},
             "subcategory": {"prediction": "Software Install", "confidence": 0.91},
             "priority": {"prediction": "Medium", "confidence": 0.91},
         }):
        response = test_client.post("/ai/model_comparison", json={"text": "VPN timeout on laptop"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["fallback_used"] is True
    assert payload["primary_model"]["model"] == "v1"
    assert payload["primary_model"]["category"] == "Software"
    assert payload["v2_shadow"]["model"] == "v2_shadow"
    assert payload["v2_agrees_with_primary"] is True
