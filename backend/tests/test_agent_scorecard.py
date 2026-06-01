"""
Unit tests for agent_scorecard.compute_performance_score
=========================================================
Covers:
  - Zero-ticket agent (returns 0.0, not an error)
  - Perfect agent (all metrics maxed → near 100)
  - Worst-case agent (all metrics 0)
  - Only resolution rate contributes (sla=1, speed unknown)
  - Volume capped at reference (does not exceed 10 pts)
  - Return type is always float
  - Return value always in [0, 100]
  - SLA compliance alone can drive a meaningful score
  - Realistic mid-range agent
  - Missing avg_resolution_hours (None) handled gracefully
  - Very slow agent (avg 48 h resolution)
  - Very fast agent (avg 0.5 h resolution)
"""
import unittest
import math

from backend.services.agent_scorecard import compute_performance_score, get_agent_metrics


class TestComputePerformanceScore(unittest.TestCase):

    # ------------------------------------------------------------------
    # Edge: no ticket history
    # ------------------------------------------------------------------
    def test_zero_tickets_returns_zero(self):
        metrics = {
            "total_tickets": 0,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance_rate": 0.0,
        }
        score = compute_performance_score(metrics)
        self.assertEqual(score, 0.0)

    # ------------------------------------------------------------------
    # Edge: perfect agent
    # ------------------------------------------------------------------
    def test_perfect_agent_near_100(self):
        """
        resolution_rate=1.0, sla_compliance=1.0, avg_hours=0 (instant),
        volume=20 (reference).  Score ≥ 90 expected.
        """
        metrics = {
            "total_tickets": 20,
            "resolved_tickets": 20,
            "sla_breached_count": 0,
            "avg_resolution_hours": 0.0,
            "resolution_rate": 1.0,
            "sla_compliance_rate": 1.0,
        }
        score = compute_performance_score(metrics)
        self.assertGreaterEqual(score, 90.0)
        self.assertLessEqual(score, 100.0)

    # ------------------------------------------------------------------
    # Edge: worst-case agent (1 ticket, nothing resolved, SLA all breached)
    # ------------------------------------------------------------------
    def test_worst_case_agent_low_score(self):
        metrics = {
            "total_tickets": 1,
            "resolved_tickets": 0,
            "sla_breached_count": 1,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance_rate": 0.0,
        }
        score = compute_performance_score(metrics)
        # Only neutral speed (10 pts) + 0 vol  → ~10 pts
        self.assertLessEqual(score, 20.0)
        self.assertGreaterEqual(score, 0.0)

    # ------------------------------------------------------------------
    # Resolution rate contributes 40 pts when 100 %
    # ------------------------------------------------------------------
    def test_resolution_rate_weight(self):
        metrics = {
            "total_tickets": 10,
            "resolved_tickets": 10,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,   # neutral speed → 10 pts
            "resolution_rate": 1.0,
            "sla_compliance_rate": 0.0,     # zero SLA contribution
        }
        score = compute_performance_score(metrics)
        # Expected: 40 (resolution) + 0 (sla) + 10 (speed neutral) + min(5,10) (volume 10/20)
        self.assertGreaterEqual(score, 40.0)

    # ------------------------------------------------------------------
    # SLA compliance contributes 30 pts when 100 %
    # ------------------------------------------------------------------
    def test_sla_compliance_weight(self):
        metrics = {
            "total_tickets": 10,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance_rate": 1.0,
        }
        score = compute_performance_score(metrics)
        # Expected: 0 (resolution) + 30 (sla) + 10 (speed neutral) + 5 (volume 10/20)
        self.assertGreaterEqual(score, 30.0)

    # ------------------------------------------------------------------
    # Volume score capped at 10 even with 100 tickets
    # ------------------------------------------------------------------
    def test_volume_score_capped(self):
        metrics_small = {
            "total_tickets": 20,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance_rate": 0.0,
        }
        metrics_huge = {
            "total_tickets": 1000,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance_rate": 0.0,
        }
        score_small = compute_performance_score(metrics_small)
        score_huge = compute_performance_score(metrics_huge)
        # Volume score should be the same once reference is hit
        self.assertAlmostEqual(score_small, score_huge, delta=0.01)

    # ------------------------------------------------------------------
    # Always returns float
    # ------------------------------------------------------------------
    def test_return_type_is_float(self):
        metrics = {
            "total_tickets": 5,
            "resolved_tickets": 3,
            "sla_breached_count": 1,
            "avg_resolution_hours": 6.0,
            "resolution_rate": 0.6,
            "sla_compliance_rate": 0.8,
        }
        score = compute_performance_score(metrics)
        self.assertIsInstance(score, float)

    # ------------------------------------------------------------------
    # Always in [0, 100]
    # ------------------------------------------------------------------
    def test_score_always_in_range(self):
        test_cases = [
            {"total_tickets": 0, "resolved_tickets": 0, "sla_breached_count": 0,
             "avg_resolution_hours": None, "resolution_rate": 0.0, "sla_compliance_rate": 0.0},
            {"total_tickets": 50, "resolved_tickets": 50, "sla_breached_count": 0,
             "avg_resolution_hours": 0.001, "resolution_rate": 1.0, "sla_compliance_rate": 1.0},
            {"total_tickets": 1, "resolved_tickets": 1, "sla_breached_count": 1,
             "avg_resolution_hours": 200.0, "resolution_rate": 1.0, "sla_compliance_rate": 0.0},
        ]
        for m in test_cases:
            score = compute_performance_score(m)
            self.assertGreaterEqual(score, 0.0, f"Score below 0: {score} for {m}")
            self.assertLessEqual(score, 100.0, f"Score above 100: {score} for {m}")

    # ------------------------------------------------------------------
    # Missing avg_resolution_hours → neutral speed (no crash)
    # ------------------------------------------------------------------
    def test_none_avg_hours_handled(self):
        metrics = {
            "total_tickets": 5,
            "resolved_tickets": 3,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.6,
            "sla_compliance_rate": 1.0,
        }
        try:
            score = compute_performance_score(metrics)
            self.assertIsNotNone(score)
        except Exception as e:
            self.fail(f"compute_performance_score raised {e} with avg_hours=None")

    # ------------------------------------------------------------------
    # Very slow agent (48 h avg)
    # ------------------------------------------------------------------
    def test_very_slow_agent_lower_score_than_fast(self):
        base = {
            "total_tickets": 10,
            "resolved_tickets": 10,
            "sla_breached_count": 0,
            "resolution_rate": 1.0,
            "sla_compliance_rate": 1.0,
        }
        slow = {**base, "avg_resolution_hours": 48.0}
        fast = {**base, "avg_resolution_hours": 0.5}
        self.assertLess(compute_performance_score(slow), compute_performance_score(fast))

    # ------------------------------------------------------------------
    # Realistic mid-range agent
    # ------------------------------------------------------------------
    def test_realistic_mid_range_agent(self):
        metrics = {
            "total_tickets": 12,
            "resolved_tickets": 8,
            "sla_breached_count": 2,
            "avg_resolution_hours": 5.0,
            "resolution_rate": 8 / 12,
            "sla_compliance_rate": 10 / 12,
        }
        score = compute_performance_score(metrics)
        # Should be between 40 and 85
        self.assertGreater(score, 40.0)
        self.assertLess(score, 85.0)

    # ------------------------------------------------------------------
    # Insufficient_data flag propagates correctly from get_agent_metrics
    # ------------------------------------------------------------------
    def test_empty_metrics_returns_insufficient_data_flag(self):
        """get_agent_metrics with no supabase returns an empty dict with the flag set."""
        result = get_agent_metrics("fake-agent-id", "fake-company-id", None, 30)
        self.assertTrue(result.get("insufficient_data", False))
        score = compute_performance_score(result)
        self.assertEqual(score, 0.0)


if __name__ == "__main__":
    unittest.main()
