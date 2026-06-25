"""
Unit tests for the agent scorecard feature:
  - GeminiService.get_agent_coaching()
  - GET /ai/agent_scorecard endpoint logic (metric computation helpers)
"""

import datetime
import sys
import types
import unittest
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# Helpers — minimal metric dict used across tests
# ---------------------------------------------------------------------------

def _make_metrics(**overrides) -> dict:
    base = {
        "total_tickets": 20,
        "resolved_tickets": 15,
        "open_tickets": 5,
        "critical_tickets": 2,
        "avg_resolution_hours": 6.5,
        "sla_breach_rate": 10.0,
        "auto_resolved_rate": 25.0,
        "top_categories": ["Network", "Software"],
        "common_subcategories": ["VPN Connection", "Login Failure"],
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# GeminiService.get_agent_coaching tests
# ---------------------------------------------------------------------------

class TestGeminiAgentCoaching(unittest.TestCase):

    def _make_service(self, initialized: bool = True, response_text: str = ""):
        """Return a GeminiService instance with a mocked Google GenAI client."""
        # Stub out the google.genai import
        genai_stub = types.ModuleType("google.genai")
        google_stub = types.ModuleType("google")
        google_stub.genai = genai_stub

        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = response_text
        mock_client.models.generate_content.return_value = mock_response

        genai_stub.Client = MagicMock(return_value=mock_client)

        with patch.dict(sys.modules, {"google": google_stub, "google.genai": genai_stub}):
            from backend.services.gemini_service import GeminiService
            svc = GeminiService.__new__(GeminiService)
            svc.api_key = "fake-key" if initialized else None
            svc._initialized = initialized
            svc.model_name = "gemini-2.5-flash"
            svc.client = mock_client
            return svc

    def test_returns_fallback_when_not_initialized(self):
        svc = self._make_service(initialized=False)
        result = svc.get_agent_coaching("Team Alpha", _make_metrics())

        self.assertEqual(result["performance_score"], 0)
        self.assertEqual(result["strengths"], [])
        self.assertIn("unavailable", result["coaching_tip"].lower())

    def test_parses_well_formed_gemini_response(self):
        response = (
            "SCORE: 82\n"
            "STRENGTHS: Fast triage | Good SLA adherence | High auto-resolve rate\n"
            "IMPROVEMENTS: Critical ticket handling | Reduce open backlog\n"
            "TIP: Focus on closing critical tickets within 2 hours to improve SLA scores.\n"
            "TRAINING: ITIL Fundamentals | Critical Incident Response | SLA Management"
        )
        svc = self._make_service(response_text=response)
        result = svc.get_agent_coaching("Network Support", _make_metrics())

        self.assertEqual(result["performance_score"], 82)
        self.assertIn("Fast triage", result["strengths"])
        self.assertIn("Critical ticket handling", result["improvement_areas"])
        self.assertIn("ITIL Fundamentals", result["recommended_training"])
        self.assertGreater(len(result["coaching_tip"]), 10)

    def test_score_clamped_to_0_100_on_out_of_range_value(self):
        response = "SCORE: 150\nSTRENGTHS: x\nIMPROVEMENTS: y\nTIP: tip\nTRAINING: z"
        svc = self._make_service(response_text=response)
        result = svc.get_agent_coaching("Team X", _make_metrics())
        self.assertLessEqual(result["performance_score"], 100)
        self.assertGreaterEqual(result["performance_score"], 0)

    def test_score_clamped_when_negative(self):
        response = "SCORE: -10\nSTRENGTHS: x\nIMPROVEMENTS: y\nTIP: tip\nTRAINING: z"
        svc = self._make_service(response_text=response)
        result = svc.get_agent_coaching("Team X", _make_metrics())
        self.assertGreaterEqual(result["performance_score"], 0)

    def test_returns_50_when_score_unparseable(self):
        response = "SCORE: not-a-number\nSTRENGTHS: x\nIMPROVEMENTS: y\nTIP: tip\nTRAINING: z"
        svc = self._make_service(response_text=response)
        result = svc.get_agent_coaching("Team X", _make_metrics())
        self.assertEqual(result["performance_score"], 50)

    def test_partial_response_missing_sections_returns_empty_lists(self):
        response = "SCORE: 60\nTIP: Focus on speed."
        svc = self._make_service(response_text=response)
        result = svc.get_agent_coaching("Team X", _make_metrics())
        self.assertEqual(result["strengths"], [])
        self.assertEqual(result["improvement_areas"], [])
        self.assertEqual(result["recommended_training"], [])

    def test_splits_pipe_delimited_training_modules(self):
        response = (
            "SCORE: 70\n"
            "STRENGTHS: a | b\n"
            "IMPROVEMENTS: c\n"
            "TIP: Do better.\n"
            "TRAINING: Module One | Module Two | Module Three"
        )
        svc = self._make_service(response_text=response)
        result = svc.get_agent_coaching("IAM Team", _make_metrics())
        self.assertEqual(len(result["recommended_training"]), 3)
        self.assertIn("Module Two", result["recommended_training"])

    def test_gemini_api_exception_returns_fallback(self):
        svc = self._make_service(initialized=True)
        svc.client.models.generate_content.side_effect = RuntimeError("API error")
        result = svc.get_agent_coaching("Team X", _make_metrics())
        self.assertEqual(result["performance_score"], 0)
        self.assertIn("failed", result["coaching_tip"].lower())

    def test_metrics_are_embedded_in_prompt(self):
        """Verify the prompt sent to Gemini includes the agent name and key metrics."""
        response = "SCORE: 75\nSTRENGTHS: x\nIMPROVEMENTS: y\nTIP: tip\nTRAINING: z"
        svc = self._make_service(response_text=response)
        metrics = _make_metrics(total_tickets=42, sla_breach_rate=15.5)
        svc.get_agent_coaching("Hardware Support", metrics)

        call_args = svc.client.models.generate_content.call_args
        prompt = call_args.kwargs.get("contents") or call_args.args[0]
        if isinstance(prompt, list):
            prompt = prompt[0]

        self.assertIn("Hardware Support", prompt)
        self.assertIn("42", prompt)
        self.assertIn("15.5", prompt)


# ---------------------------------------------------------------------------
# Metric computation tests (logic extracted from the endpoint for unit testing)
# ---------------------------------------------------------------------------

def _compute_metrics(tickets: list) -> dict:
    """
    Mirror of the metric computation in GET /ai/agent_scorecard so it can be
    unit-tested independently of FastAPI / Supabase.
    """
    from collections import Counter

    total = len(tickets)
    resolved = sum(1 for t in tickets if (t.get("status") or "").lower().startswith("resolv"))
    open_count = total - resolved
    critical = sum(1 for t in tickets if (t.get("priority") or "").lower() == "critical")
    auto_resolved = sum(1 for t in tickets if t.get("auto_resolve"))

    resolution_times: list[float] = []
    for t in tickets:
        if (t.get("status") or "").lower().startswith("resolv") and t.get("created_at") and t.get("updated_at"):
            try:
                created = datetime.datetime.fromisoformat(t["created_at"].replace("Z", "+00:00"))
                updated = datetime.datetime.fromisoformat(t["updated_at"].replace("Z", "+00:00"))
                hours = (updated - created).total_seconds() / 3600
                if hours >= 0:
                    resolution_times.append(hours)
            except Exception:
                pass

    avg_resolution_hours = (
        round(sum(resolution_times) / len(resolution_times), 2)
        if resolution_times else 0.0
    )

    now_utc = datetime.datetime(2099, 1, 1, tzinfo=datetime.timezone.utc)
    sla_breached = 0
    for t in tickets:
        breach_at = t.get("sla_breach_at")
        if breach_at:
            try:
                breach_dt = datetime.datetime.fromisoformat(breach_at.replace("Z", "+00:00"))
                ticket_open = not (t.get("status") or "").lower().startswith("resolv")
                if ticket_open and breach_dt < now_utc:
                    sla_breached += 1
            except Exception:
                pass

    sla_breach_rate = round((sla_breached / total) * 100, 2) if total else 0.0
    auto_resolved_rate = round((auto_resolved / total) * 100, 2) if total else 0.0

    cat_counter = Counter(t.get("category") or "Unknown" for t in tickets)
    sub_counter = Counter(t.get("subcategory") or "Unknown" for t in tickets)

    return {
        "total_tickets": total,
        "resolved_tickets": resolved,
        "open_tickets": open_count,
        "critical_tickets": critical,
        "avg_resolution_hours": avg_resolution_hours,
        "sla_breach_rate": sla_breach_rate,
        "auto_resolved_rate": auto_resolved_rate,
        "top_categories": [c for c, _ in cat_counter.most_common(3)],
        "common_subcategories": [s for s, _ in sub_counter.most_common(3)],
    }


class TestMetricComputation(unittest.TestCase):

    def _make_ticket(self, status="open", priority="Medium", category="Network",
                     subcategory="VPN Connection", auto_resolve=False,
                     created_at="2026-01-01T08:00:00Z", updated_at="2026-01-01T10:00:00Z",
                     sla_breach_at=None):
        return {
            "status": status,
            "priority": priority,
            "category": category,
            "subcategory": subcategory,
            "auto_resolve": auto_resolve,
            "created_at": created_at,
            "updated_at": updated_at,
            "sla_breach_at": sla_breach_at,
        }

    def test_empty_ticket_list_returns_zeros(self):
        m = _compute_metrics([])
        self.assertEqual(m["total_tickets"], 0)
        self.assertEqual(m["resolved_tickets"], 0)
        self.assertEqual(m["sla_breach_rate"], 0.0)

    def test_all_resolved_count(self):
        tickets = [self._make_ticket(status="resolved") for _ in range(5)]
        m = _compute_metrics(tickets)
        self.assertEqual(m["resolved_tickets"], 5)
        self.assertEqual(m["open_tickets"], 0)

    def test_mixed_resolved_and_open(self):
        tickets = [
            self._make_ticket(status="resolved"),
            self._make_ticket(status="resolved"),
            self._make_ticket(status="open"),
        ]
        m = _compute_metrics(tickets)
        self.assertEqual(m["resolved_tickets"], 2)
        self.assertEqual(m["open_tickets"], 1)

    def test_critical_count(self):
        tickets = [
            self._make_ticket(priority="Critical"),
            self._make_ticket(priority="High"),
            self._make_ticket(priority="Critical"),
        ]
        m = _compute_metrics(tickets)
        self.assertEqual(m["critical_tickets"], 2)

    def test_avg_resolution_hours_calculation(self):
        tickets = [
            self._make_ticket(
                status="resolved",
                created_at="2026-01-01T08:00:00Z",
                updated_at="2026-01-01T10:00:00Z"  # 2 h
            ),
            self._make_ticket(
                status="resolved",
                created_at="2026-01-01T08:00:00Z",
                updated_at="2026-01-01T12:00:00Z"  # 4 h
            ),
        ]
        m = _compute_metrics(tickets)
        self.assertAlmostEqual(m["avg_resolution_hours"], 3.0)

    def test_avg_resolution_hours_zero_when_no_resolved(self):
        tickets = [self._make_ticket(status="open")]
        m = _compute_metrics(tickets)
        self.assertEqual(m["avg_resolution_hours"], 0.0)

    def test_sla_breach_rate_open_breached(self):
        # sla_breach_at in the past → open ticket → breached
        past_breach = "2020-01-01T00:00:00Z"
        tickets = [
            self._make_ticket(status="open", sla_breach_at=past_breach),
            self._make_ticket(status="open", sla_breach_at=past_breach),
            self._make_ticket(status="open"),  # no breach_at
            self._make_ticket(status="resolved", sla_breach_at=past_breach),  # resolved → not counted
        ]
        m = _compute_metrics(tickets)
        # 2 out of 4 breached
        self.assertAlmostEqual(m["sla_breach_rate"], 50.0)

    def test_auto_resolved_rate(self):
        tickets = [
            self._make_ticket(auto_resolve=True),
            self._make_ticket(auto_resolve=True),
            self._make_ticket(auto_resolve=False),
            self._make_ticket(auto_resolve=False),
        ]
        m = _compute_metrics(tickets)
        self.assertAlmostEqual(m["auto_resolved_rate"], 50.0)

    def test_top_categories_sorted_by_frequency(self):
        tickets = (
            [self._make_ticket(category="Network")] * 5 +
            [self._make_ticket(category="Software")] * 3 +
            [self._make_ticket(category="Hardware")] * 2
        )
        m = _compute_metrics(tickets)
        self.assertEqual(m["top_categories"][0], "Network")
        self.assertEqual(m["top_categories"][1], "Software")

    def test_top_categories_limited_to_three(self):
        tickets = [
            self._make_ticket(category=c)
            for c in ["A", "B", "C", "D", "E"]
        ]
        m = _compute_metrics(tickets)
        self.assertLessEqual(len(m["top_categories"]), 3)

    def test_malformed_timestamps_are_skipped(self):
        tickets = [
            self._make_ticket(status="resolved", created_at="bad-date", updated_at="also-bad"),
        ]
        m = _compute_metrics(tickets)
        self.assertEqual(m["avg_resolution_hours"], 0.0)

    def test_none_status_treated_as_open(self):
        tickets = [self._make_ticket(status=None)]
        m = _compute_metrics(tickets)
        self.assertEqual(m["resolved_tickets"], 0)
        self.assertEqual(m["open_tickets"], 1)
Unit tests for agent_scorecard.compute_performance_score
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

from backend.agent_scorecard import compute_performance_score, get_agent_metrics


class TestComputePerformanceScore(unittest.TestCase):

    def test_zero_tickets_returns_zero(self):
        metrics = {
            "total_tickets": 0,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance": 0.0,
        }
        score = compute_performance_score(metrics)
        self.assertEqual(score, 0.0)

    def test_perfect_agent_near_100(self):
        metrics = {
            "total_tickets": 20,
            "resolved_tickets": 20,
            "sla_breached_count": 0,
            "avg_resolution_hours": 0.0,
            "resolution_rate": 100.0,
            "sla_compliance": 100.0,
        }
        score = compute_performance_score(metrics)
        self.assertGreaterEqual(score, 90.0)
        self.assertLessEqual(score, 100.0)

    def test_worst_case_agent_low_score(self):
        metrics = {
            "total_tickets": 1,
            "resolved_tickets": 0,
            "sla_breached_count": 1,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance": 0.0,
        }
        score = compute_performance_score(metrics)
        self.assertLessEqual(score, 25.0)
        self.assertGreaterEqual(score, 0.0)

    def test_resolution_rate_weight(self):
        metrics = {
            "total_tickets": 10,
            "resolved_tickets": 10,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 100.0,
            "sla_compliance": 0.0,
        }
        score = compute_performance_score(metrics)
        self.assertGreaterEqual(score, 40.0)

    def test_sla_compliance_weight(self):
        metrics = {
            "total_tickets": 10,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance": 100.0,
        }
        score = compute_performance_score(metrics)
        self.assertGreaterEqual(score, 30.0)

    def test_volume_score_capped(self):
        metrics_small = {
            "total_tickets": 50,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance": 0.0,
        }
        metrics_huge = {
            "total_tickets": 1000,
            "resolved_tickets": 0,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 0.0,
            "sla_compliance": 0.0,
        }
        score_small = compute_performance_score(metrics_small)
        score_huge = compute_performance_score(metrics_huge)
        self.assertAlmostEqual(score_small, score_huge, delta=0.01)

    def test_return_type_is_float(self):
        metrics = {
            "total_tickets": 5,
            "resolved_tickets": 3,
            "sla_breached_count": 1,
            "avg_resolution_hours": 6.0,
            "resolution_rate": 60.0,
            "sla_compliance": 80.0,
        }
        score = compute_performance_score(metrics)
        self.assertIsInstance(score, float)

    def test_score_always_in_range(self):
        test_cases = [
            {"total_tickets": 0, "resolved_tickets": 0, "sla_breached_count": 0,
             "avg_resolution_hours": None, "resolution_rate": 0.0, "sla_compliance": 0.0},
            {"total_tickets": 50, "resolved_tickets": 50, "sla_breached_count": 0,
             "avg_resolution_hours": 0.001, "resolution_rate": 100.0, "sla_compliance": 100.0},
            {"total_tickets": 1, "resolved_tickets": 1, "sla_breached_count": 1,
             "avg_resolution_hours": 200.0, "resolution_rate": 100.0, "sla_compliance": 0.0},
        ]
        for metrics in test_cases:
            score = compute_performance_score(metrics)
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 100.0)

    def test_none_avg_hours_handled(self):
        metrics = {
            "total_tickets": 5,
            "resolved_tickets": 3,
            "sla_breached_count": 0,
            "avg_resolution_hours": None,
            "resolution_rate": 60.0,
            "sla_compliance": 100.0,
        }
        score = compute_performance_score(metrics)
        self.assertIsNotNone(score)

    def test_very_slow_agent_lower_score_than_fast(self):
        base = {
            "total_tickets": 10,
            "resolved_tickets": 10,
            "sla_breached_count": 0,
            "resolution_rate": 100.0,
            "sla_compliance": 100.0,
        }
        slow = {**base, "avg_resolution_hours": 48.0}
        fast = {**base, "avg_resolution_hours": 0.5}
        self.assertLess(compute_performance_score(slow), compute_performance_score(fast))

    def test_realistic_mid_range_agent(self):
        metrics = {
            "total_tickets": 12,
            "resolved_tickets": 8,
            "sla_breached_count": 2,
            "avg_resolution_hours": 5.0,
            "resolution_rate": (8 / 12) * 100,
            "sla_compliance": (10 / 12) * 100,
        }
        score = compute_performance_score(metrics)
        self.assertGreater(score, 40.0)
        self.assertLess(score, 85.0)

    def test_empty_metrics_returns_insufficient_data_flag(self):
        result = get_agent_metrics("fake-agent-id", "fake-company-id", None, 30)
        self.assertTrue(result.get("insufficient_data", False))
        score = compute_performance_score(result)
        self.assertEqual(score, 0.0)


if __name__ == "__main__":
    unittest.main()
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
