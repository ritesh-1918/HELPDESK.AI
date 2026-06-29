from backend.services import classifier_metrics


def setup_function():
    classifier_metrics.reset_classifier_metrics()


def test_classifier_metrics_track_success_and_fallback():
    classifier_metrics.record_v3_success(0.91)
    classifier_metrics.record_v3_fallback("boom", "vpn login issue", 0.72)

    health = classifier_metrics.get_classifier_health()

    assert health["total_predictions"] == 2
    assert health["classifier_fallback_count"] == 1
    assert health["v3_success_rate"] == 0.5
    assert health["v3_average_confidence"] == 0.91
    assert health["v1_average_confidence"] == 0.72
    assert health["recent_fallback_events"][0]["text_hash"]


def test_classifier_metrics_record_shadow_agreement():
    classifier_metrics.record_shadow_comparison(
        {"category": "Access", "subcategory": "Login", "priority": "High", "assigned_team": "IAM Team", "auto_resolve": False},
        {
            "category": {"prediction": "Access"},
            "sub_category": {"prediction": "Login"},
            "priority": {"prediction": "High"},
            "assigned_team": {"prediction": "IAM Team"},
            "auto_resolve": {"prediction": False},
        },
    )

    health = classifier_metrics.get_classifier_health()

    assert health["shadow_comparison_count"] == 1
    assert health["shadow_agreement_rate"] == 1.0
    assert classifier_metrics.compare_predictions(
        {"category": "Access", "subcategory": "Login", "priority": "High", "assigned_team": "IAM Team", "auto_resolve": False},
        {
            "category": {"prediction": "Access"},
            "sub_category": {"prediction": "Login"},
            "priority": {"prediction": "High"},
            "assigned_team": {"prediction": "IAM Team"},
            "auto_resolve": {"prediction": False},
        },
    )
