import pytest
from datetime import datetime
from unittest.mock import patch


class TestSlaTargets:
    def test_returns_critical_targets(self):
        from services.response_time_estimator import get_sla_targets
        targets = get_sla_targets("critical")
        assert targets["first_response"] == 1
        assert targets["resolution"] == 4

    def test_returns_high_targets(self):
        from services.response_time_estimator import get_sla_targets
        targets = get_sla_targets("high")
        assert targets["first_response"] == 4
        assert targets["resolution"] == 8

    def test_returns_medium_targets(self):
        from services.response_time_estimator import get_sla_targets
        targets = get_sla_targets("medium")
        assert targets["first_response"] == 8
        assert targets["resolution"] == 24

    def test_returns_low_targets(self):
        from services.response_time_estimator import get_sla_targets
        targets = get_sla_targets("low")
        assert targets["first_response"] == 24
        assert targets["resolution"] == 72

    def test_returns_default_for_unknown_priority(self):
        from services.response_time_estimator import get_sla_targets
        targets = get_sla_targets("unknown")
        assert targets == get_sla_targets("default")

    def test_is_case_insensitive(self):
        from services.response_time_estimator import get_sla_targets
        assert get_sla_targets("CRITICAL") == get_sla_targets("critical")


class TestEstimateResponseTime:
    def test_returns_dict_with_required_keys(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time()
        assert "estimated_first_response_hours" in result
        assert "estimated_resolution_hours" in result
        assert "sla_targets" in result
        assert "breach_risk" in result
        assert "predictions" in result
        assert "factors" in result

    def test_medium_priority_has_reasonable_estimate(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time("medium")
        assert 0 < result["estimated_first_response_hours"] < 24
        assert 0 < result["estimated_resolution_hours"] < 72

    def test_critical_priority_has_lower_estimates(self):
        from services.response_time_estimator import estimate_response_time
        critical = estimate_response_time("critical")
        medium = estimate_response_time("medium")
        assert critical["estimated_first_response_hours"] < medium["estimated_first_response_hours"]

    def test_workload_increases_estimate(self):
        from services.response_time_estimator import estimate_response_time
        low_workload = estimate_response_time("medium", team_workload=1, team_size=5)
        high_workload = estimate_response_time("medium", team_workload=20, team_size=1)
        assert high_workload["estimated_first_response_hours"] > low_workload["estimated_first_response_hours"]

    def test_historical_data_affects_estimate(self):
        from services.response_time_estimator import estimate_response_time
        without_hist = estimate_response_time("medium")
        with_hist = estimate_response_time("medium", historical_avg_hours=12)
        assert with_hist["estimated_first_response_hours"] != without_hist["estimated_first_response_hours"]

    def test_breach_risk_is_between_zero_and_one(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time("medium")
        risk = result["breach_risk"]
        assert 0 <= risk["first_response"] <= 1
        assert 0 <= risk["resolution"] <= 1
        assert 0 <= risk["overall"] <= 1

    def test_high_workload_increases_breach_risk(self):
        from services.response_time_estimator import estimate_response_time
        normal = estimate_response_time("medium", team_workload=0, team_size=1)
        overloaded = estimate_response_time("medium", team_workload=50, team_size=1)
        assert overloaded["breach_risk"]["overall"] >= normal["breach_risk"]["overall"]

    def test_risk_level_low_for_normal_conditions(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time("medium", team_workload=0)
        assert result["breach_risk"]["level"] in ("low", "medium")

    def test_includes_workload_factor_in_results(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time("medium", team_workload=10, team_size=2)
        assert result["factors"]["workload_factor"] > 1.0

    def test_includes_category_when_provided(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time(category="network")
        assert result["factors"]["category"] == "network"

    def test_estimates_are_capped_at_maximum(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time("low", team_workload=1000, team_size=1)
        assert result["estimated_first_response_hours"] <= 168
        assert result["estimated_resolution_hours"] <= 720

    def test_predictions_include_isoformat_dates(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time()
        for key in ("first_response_deadline", "resolution_deadline",
                     "estimated_first_response_at", "estimated_resolution_at"):
            assert "T" in result["predictions"][key]

    def test_will_breach_first_response_with_high_workload(self):
        from services.response_time_estimator import estimate_response_time
        result = estimate_response_time("critical", team_workload=100, team_size=1)
        assert isinstance(result["predictions"]["will_breach_first_response"], bool)


class TestGenerateEstimationSummary:
    def test_returns_string(self):
        from services.response_time_estimator import (
            estimate_response_time, generate_estimation_summary
        )
        estimation = estimate_response_time()
        summary = generate_estimation_summary(estimation)
        assert isinstance(summary, str)
        assert len(summary) > 0

    def test_contains_risk_level(self):
        from services.response_time_estimator import (
            estimate_response_time, generate_estimation_summary
        )
        estimation = estimate_response_time()
        summary = generate_estimation_summary(estimation)
        assert any(level in summary for level in ("HIGH", "MODERATE", "LOW"))

    def test_contains_time_estimates(self):
        from services.response_time_estimator import (
            estimate_response_time, generate_estimation_summary
        )
        estimation = estimate_response_time()
        summary = generate_estimation_summary(estimation)
        assert "Estimated first response" in summary
        assert "Estimated resolution" in summary

    def test_mentions_overload_when_applicable(self):
        from services.response_time_estimator import (
            estimate_response_time, generate_estimation_summary
        )
        estimation = estimate_response_time("medium", team_workload=50, team_size=1)
        summary = generate_estimation_summary(estimation)
        assert "overloaded" in summary.lower()
