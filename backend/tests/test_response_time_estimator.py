"""
Unit tests for backend/services/response_time_estimator.py
Issue: #1088 - test : add unit tests for response_time_estimator
"""

import sys
import os
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from services.response_time_estimator import (
    SLA_TARGETS,
    PRIORITY_WEIGHTS,
    get_sla_targets,
    estimate_response_time,
    generate_estimation_summary,
)


# ---------------------------------------------------------------------------
# SLA_TARGETS
# ---------------------------------------------------------------------------

class TestSLATargets:
    def test_critical(self):
        assert SLA_TARGETS["critical"] == {"first_response": 1, "resolution": 4}

    def test_high(self):
        assert SLA_TARGETS["high"] == {"first_response": 4, "resolution": 8}

    def test_medium(self):
        assert SLA_TARGETS["medium"] == {"first_response": 8, "resolution": 24}

    def test_low(self):
        assert SLA_TARGETS["low"] == {"first_response": 24, "resolution": 72}

    def test_default(self):
        assert SLA_TARGETS["default"] == {"first_response": 24, "resolution": 48}

    def test_all_priorities_present(self):
        for prio in ["critical", "high", "medium", "low", "default"]:
            assert prio in SLA_TARGETS


class TestPriorityWeights:
    def test_values(self):
        assert PRIORITY_WEIGHTS["critical"] == 4
        assert PRIORITY_WEIGHTS["high"] == 3
        assert PRIORITY_WEIGHTS["medium"] == 2
        assert PRIORITY_WEIGHTS["low"] == 1


# ---------------------------------------------------------------------------
# get_sla_targets
# ---------------------------------------------------------------------------

class TestGetSLATargets:
    def test_valid_priorities(self):
        assert get_sla_targets("critical") == SLA_TARGETS["critical"]
        assert get_sla_targets("HIGH") == SLA_TARGETS["high"]
        assert get_sla_targets("Medium") == SLA_TARGETS["medium"]
        assert get_sla_targets("low") == SLA_TARGETS["low"]

    def test_invalid_falls_to_default(self):
        assert get_sla_targets("invalid") == SLA_TARGETS["default"]
        assert get_sla_targets("") == SLA_TARGETS["default"]
        assert get_sla_targets("urgent") == SLA_TARGETS["default"]


# ---------------------------------------------------------------------------
# estimate_response_time - basic scenarios
# ---------------------------------------------------------------------------

class TestEstimateResponseTime:
    def test_default_params(self):
        result = estimate_response_time()
        assert "estimated_first_response_hours" in result
        assert "estimated_resolution_hours" in result
        assert "sla_targets" in result
        assert "breach_risk" in result
        assert "predictions" in result
        assert "factors" in result

    def test_critical_priority(self):
        result = estimate_response_time(priority="critical")
        assert result["sla_targets"]["first_response"] == 1
        assert result["sla_targets"]["resolution"] == 4
        assert result["factors"]["priority"] == "critical"

    def test_high_priority(self):
        result = estimate_response_time(priority="high")
        assert result["sla_targets"]["first_response"] == 4

    def test_low_priority(self):
        result = estimate_response_time(priority="low")
        assert result["sla_targets"]["first_response"] == 24

    def test_invalid_priority_fallback(self):
        result = estimate_response_time(priority="urgent")
        assert result["sla_targets"] == SLA_TARGETS["default"]

    def test_estimated_times_are_positive(self):
        for prio in ["critical", "high", "medium", "low"]:
            result = estimate_response_time(priority=prio)
            assert result["estimated_first_response_hours"] > 0
            assert result["estimated_resolution_hours"] > 0

    def test_first_response_less_than_resolution(self):
        result = estimate_response_time(priority="medium")
        assert result["estimated_first_response_hours"] <= result["estimated_resolution_hours"]


# ---------------------------------------------------------------------------
# estimate_response_time - workload factor
# ---------------------------------------------------------------------------

class TestEstimateResponseTimeWorkload:
    def test_zero_workload(self):
        result = estimate_response_time(priority="medium", team_workload=0, team_size=5)
        assert result["factors"]["workload_factor"] == 1.0
        assert result["estimated_first_response_hours"] == 8.0

    def test_high_workload(self):
        result = estimate_response_time(priority="medium", team_workload=20, team_size=5)
        assert result["factors"]["workload_factor"] > 1.0
        assert result["estimated_first_response_hours"] > 8.0

    def test_single_person_team(self):
        result = estimate_response_time(priority="medium", team_workload=10, team_size=1)
        assert result["factors"]["workload_factor"] == 2.5
        assert result["estimated_first_response_hours"] == 20.0

    def test_zero_team_size(self):
        result = estimate_response_time(priority="medium", team_workload=5, team_size=0)
        assert result["estimated_first_response_hours"] > 0

    def test_workload_factor_increases_with_ratio(self):
        r1 = estimate_response_time(priority="medium", team_workload=2, team_size=10)
        r2 = estimate_response_time(priority="medium", team_workload=20, team_size=10)
        assert r2["estimated_first_response_hours"] > r1["estimated_first_response_hours"]


# ---------------------------------------------------------------------------
# estimate_response_time - historical data
# ---------------------------------------------------------------------------

class TestEstimateResponseTimeHistorical:
    def test_with_historical_data(self):
        result = estimate_response_time(
            priority="medium",
            historical_avg_hours=2.0,
        )
        # With historical=2h, base=8h: (8*0.4 + 2*0.6) * 1.0 = 4.4
        assert result["estimated_first_response_hours"] == 4.4

    def test_historical_data_speeds_up(self):
        no_hist = estimate_response_time(priority="medium")
        with_hist = estimate_response_time(priority="medium", historical_avg_hours=1.0)
        assert with_hist["estimated_first_response_hours"] < no_hist["estimated_first_response_hours"]

    def test_historical_data_zero_ignored(self):
        result = estimate_response_time(priority="medium", historical_avg_hours=0)
        assert result["estimated_first_response_hours"] == 8.0

    def test_historical_data_none(self):
        result = estimate_response_time(priority="medium", historical_avg_hours=None)
        assert result["factors"]["has_historical_data"] is False

    def test_historical_data_flag(self):
        result = estimate_response_time(priority="medium", historical_avg_hours=5.0)
        assert result["factors"]["has_historical_data"] is True


# ---------------------------------------------------------------------------
# estimate_response_time - caps
# ---------------------------------------------------------------------------

class TestEstimateResponseTimeCaps:
    def test_first_response_capped_at_168h(self):
        result = estimate_response_time(priority="low", team_workload=1000, team_size=1)
        assert result["estimated_first_response_hours"] <= 168

    def test_resolution_capped_at_720h(self):
        result = estimate_response_time(priority="low", team_workload=1000, team_size=1)
        assert result["estimated_resolution_hours"] <= 720


# ---------------------------------------------------------------------------
# estimate_response_time - breach risk
# ---------------------------------------------------------------------------

class TestEstimateResponseTimeBreachRisk:
    def test_breach_risk_structure(self):
        result = estimate_response_time()
        risk = result["breach_risk"]
        assert "first_response" in risk
        assert "resolution" in risk
        assert "overall" in risk
        assert "level" in risk

    def test_breach_risk_between_0_and_1(self):
        result = estimate_response_time(priority="medium", team_workload=5, team_size=5)
        risk = result["breach_risk"]
        assert 0 <= risk["first_response"] <= 1
        assert 0 <= risk["resolution"] <= 1
        assert 0 <= risk["overall"] <= 1

    def test_low_risk_when_no_load(self):
        result = estimate_response_time(priority="medium", team_workload=0, team_size=5)
        assert result["breach_risk"]["level"] == "low"

    def test_medium_risk_with_moderate_load(self):
        result = estimate_response_time(priority="medium", team_workload=30, team_size=5)
        # workload_factor = 1 + (6*0.15) = 1.9 => first_response = 8*1.9=15.2
        # risk = (15.2/8)/3 = 0.633
        assert result["breach_risk"]["level"] in ("medium", "high")

    def test_high_risk_with_heavy_load(self):
        result = estimate_response_time(priority="critical", team_workload=50, team_size=2)
        # workload_factor = 1 + (25*0.15) = 4.75 => first_response = 1*4.75=4.75
        # risk = min(4.75/1, 3)/3 = 1.0
        assert result["breach_risk"]["level"] == "high"


# ---------------------------------------------------------------------------
# estimate_response_time - predictions
# ---------------------------------------------------------------------------

class TestEstimateResponseTimePredictions:
    def test_predictions_structure(self):
        result = estimate_response_time()
        preds = result["predictions"]
        assert "will_breach_first_response" in preds
        assert "will_breach_resolution" in preds
        assert "first_response_deadline" in preds
        assert "resolution_deadline" in preds
        assert "estimated_first_response_at" in preds
        assert "estimated_resolution_at" in preds

    def test_will_breach_is_bool(self):
        result = estimate_response_time(priority="medium", team_workload=0, team_size=5)
        assert isinstance(result["predictions"]["will_breach_first_response"], bool)
        assert isinstance(result["predictions"]["will_breach_resolution"], bool)

    def test_no_breach_when_no_load(self):
        result = estimate_response_time(priority="medium", team_workload=0, team_size=5)
        assert result["predictions"]["will_breach_first_response"] is False

    def test_breach_with_heavy_load(self):
        result = estimate_response_time(priority="critical", team_workload=50, team_size=1)
        assert result["predictions"]["will_breach_first_response"] is True

    def test_deadlines_are_future(self):
        result = estimate_response_time()
        now = datetime.utcnow()
        fr_deadline = datetime.fromisoformat(result["predictions"]["first_response_deadline"])
        assert fr_deadline > now

    def test_estimated_times_are_future(self):
        result = estimate_response_time()
        now = datetime.utcnow()
        fr_est = datetime.fromisoformat(result["predictions"]["estimated_first_response_at"])
        assert fr_est > now


# ---------------------------------------------------------------------------
# estimate_response_time - category
# ---------------------------------------------------------------------------

class TestEstimateResponseTimeCategory:
    def test_category_in_factors(self):
        result = estimate_response_time(category="billing")
        assert result["factors"]["category"] == "billing"

    def test_category_none(self):
        result = estimate_response_time(category=None)
        assert result["factors"]["category"] is None


# ---------------------------------------------------------------------------
# generate_estimation_summary
# ---------------------------------------------------------------------------

class TestGenerateEstimationSummary:
    def test_returns_string(self):
        estimation = estimate_response_time()
        summary = generate_estimation_summary(estimation)
        assert isinstance(summary, str)
        assert len(summary) > 0

    def test_high_risk_summary(self):
        estimation = estimate_response_time(priority="critical", team_workload=100, team_size=1)
        summary = generate_estimation_summary(estimation)
        assert "HIGH BREACH RISK" in summary

    def test_medium_risk_summary(self):
        estimation = estimate_response_time(priority="medium", team_workload=20, team_size=5)
        summary = generate_estimation_summary(estimation)
        if estimation["breach_risk"]["level"] == "medium":
            assert "MODERATE BREACH RISK" in summary

    def test_low_risk_summary(self):
        estimation = estimate_response_time(priority="medium", team_workload=0, team_size=5)
        summary = generate_estimation_summary(estimation)
        assert "LOW BREACH RISK" in summary

    def test_includes_time_estimates(self):
        estimation = estimate_response_time()
        summary = generate_estimation_summary(estimation)
        assert "Estimated first response:" in summary
        assert "Estimated resolution:" in summary

    def test_breach_prediction_warnings(self):
        estimation = estimate_response_time(priority="critical", team_workload=100, team_size=1)
        summary = generate_estimation_summary(estimation)
        if estimation["predictions"]["will_breach_first_response"]:
            assert "will likely be breached" in summary

    def test_overloaded_team_warning(self):
        estimation = estimate_response_time(priority="medium", team_workload=50, team_size=2)
        summary = generate_estimation_summary(estimation)
        if estimation["factors"]["workload_factor"] > 1.5:
            assert "overloaded" in summary.lower()

    def test_all_priorities(self):
        for prio in ["critical", "high", "medium", "low"]:
            estimation = estimate_response_time(priority=prio)
            summary = generate_estimation_summary(estimation)
            assert isinstance(summary, str)
            assert len(summary) > 0


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

class TestEstimateResponseTimeEdgeCases:
    def test_very_high_workload(self):
        result = estimate_response_time(priority="low", team_workload=500, team_size=1)
        assert result["estimated_first_response_hours"] <= 168
        assert result["estimated_resolution_hours"] <= 720

    def test_negative_team_size(self):
        result = estimate_response_time(priority="medium", team_workload=5, team_size=-1)
        assert result["estimated_first_response_hours"] > 0

    def test_all_params_explicit(self):
        result = estimate_response_time(
            priority="high",
            team_workload=10,
            team_size=3,
            category="security",
            historical_avg_hours=3.5,
        )
        assert result["factors"]["priority"] == "high"
        assert result["factors"]["team_workload"] == 10
        assert result["factors"]["team_size"] == 3
        assert result["factors"]["category"] == "security"
        assert result["factors"]["has_historical_data"] is True

    def test_consistent_output_structure(self):
        """Every call returns the same top-level keys."""
        result = estimate_response_time()
        expected_keys = {
            "estimated_first_response_hours",
            "estimated_resolution_hours",
            "sla_targets",
            "breach_risk",
            "predictions",
            "factors",
        }
        assert set(result.keys()) == expected_keys

    def test_estimates_are_floats(self):
        result = estimate_response_time()
        assert isinstance(result["estimated_first_response_hours"], float)
        assert isinstance(result["estimated_resolution_hours"], float)

    def test_breach_risk_values_are_floats(self):
        result = estimate_response_time()
        risk = result["breach_risk"]
        assert isinstance(risk["first_response"], float)
        assert isinstance(risk["resolution"], float)
        assert isinstance(risk["overall"], float)
