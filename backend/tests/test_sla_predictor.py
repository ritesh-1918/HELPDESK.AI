import unittest
from datetime import datetime, timedelta, timezone

from backend.sla_predictor import (
    get_sla_estimate,
    _category_adjustment,
    _workload_multiplier,
    _priority_key,
)


def _fixed_now(dt: datetime):
    return lambda: dt


def _future_iso(minutes: int, now: datetime) -> str:
    return (now + timedelta(minutes=minutes)).isoformat().replace("+00:00", "Z")


NOW = datetime(2026, 5, 27, 10, 0, tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# Minimal fake Supabase plumbing
# ---------------------------------------------------------------------------

class _FakeResult:
    def __init__(self, data=None):
        self.data = data or []


class _FakeTable:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.filters: dict = {}
        self._limit: int | None = None

    def select(self, *_args):
        return self

    def eq(self, field, value):
        self.filters[field] = value
        return self

    def limit(self, n):
        self._limit = n
        return self

    def execute(self):
        rows = list(self.db.get(self.name, []))
        for k, v in self.filters.items():
            rows = [r for r in rows if r.get(k) == v]
        if self._limit is not None:
            rows = rows[: self._limit]
        return _FakeResult(rows)


class _FakeSupabase:
    def __init__(self, db: dict):
        self.db = db

    def table(self, name: str) -> _FakeTable:
        return _FakeTable(self.db, name)


# ---------------------------------------------------------------------------
# Priority key normalisation
# ---------------------------------------------------------------------------

class TestPriorityKey(unittest.TestCase):
    def test_known_priorities_pass_through(self):
        for p in ("critical", "high", "medium", "low"):
            self.assertEqual(_priority_key(p), p)

    def test_unknown_priority_defaults_to_low(self):
        self.assertEqual(_priority_key("urgent"), "low")
        self.assertEqual(_priority_key(None), "low")
        self.assertEqual(_priority_key(""), "low")

    def test_case_insensitive(self):
        self.assertEqual(_priority_key("HIGH"), "high")
        self.assertEqual(_priority_key("Critical"), "critical")


# ---------------------------------------------------------------------------
# Baseline only (no Supabase)
# ---------------------------------------------------------------------------

class TestGetSlaEstimateBaseline(unittest.TestCase):
    def test_critical_baseline(self):
        result = get_sla_estimate({"priority": "critical"})
        self.assertEqual(result["estimated_minutes"], 120)
        self.assertFalse(result["breach_risk"])

    def test_high_baseline(self):
        result = get_sla_estimate({"priority": "high"})
        self.assertEqual(result["estimated_minutes"], 480)

    def test_medium_baseline(self):
        result = get_sla_estimate({"priority": "medium"})
        self.assertEqual(result["estimated_minutes"], 1440)

    def test_low_baseline(self):
        result = get_sla_estimate({"priority": "low"})
        self.assertEqual(result["estimated_minutes"], 4320)

    def test_unknown_priority_uses_low_baseline(self):
        result = get_sla_estimate({"priority": "turbo"})
        self.assertEqual(result["estimated_minutes"], 4320)

    def test_missing_sla_breach_at_gives_no_breach_risk(self):
        result = get_sla_estimate({"priority": "critical"})
        self.assertFalse(result["breach_risk"])

    def test_malformed_sla_breach_at_gives_no_breach_risk(self):
        result = get_sla_estimate({"priority": "high", "sla_breach_at": "not-a-date"})
        self.assertFalse(result["breach_risk"])


# ---------------------------------------------------------------------------
# Breach risk calculation
# ---------------------------------------------------------------------------

class TestBreachRisk(unittest.TestCase):
    def test_breach_risk_true_when_estimate_exceeds_remaining_time(self):
        # critical baseline = 120 min; only 60 min remain → breach risk
        sla_breach_at = _future_iso(60, NOW)
        result = get_sla_estimate(
            {"priority": "critical", "sla_breach_at": sla_breach_at},
            _now_fn=_fixed_now(NOW),
        )
        self.assertTrue(result["breach_risk"])

    def test_breach_risk_false_when_plenty_of_time_remains(self):
        # critical baseline = 120 min; 300 min remain → safe
        sla_breach_at = _future_iso(300, NOW)
        result = get_sla_estimate(
            {"priority": "critical", "sla_breach_at": sla_breach_at},
            _now_fn=_fixed_now(NOW),
        )
        self.assertFalse(result["breach_risk"])

    def test_breach_risk_true_for_already_past_deadline(self):
        # deadline already passed → minutes_remaining < 0 → breach risk
        past_deadline = (NOW - timedelta(hours=1)).isoformat().replace("+00:00", "Z")
        result = get_sla_estimate(
            {"priority": "low", "sla_breach_at": past_deadline},
            _now_fn=_fixed_now(NOW),
        )
        self.assertTrue(result["breach_risk"])

    def test_z_suffix_in_sla_breach_at_is_handled(self):
        sla_breach_at = _future_iso(300, NOW)
        result = get_sla_estimate(
            {"priority": "critical", "sla_breach_at": sla_breach_at},
            _now_fn=_fixed_now(NOW),
        )
        self.assertIsInstance(result["breach_risk"], bool)


# ---------------------------------------------------------------------------
# Category adjustment
# ---------------------------------------------------------------------------

class TestCategoryAdjustment(unittest.TestCase):
    def _make_db(self, resolved_count: int, breached_count: int) -> dict:
        tickets = []
        for i in range(resolved_count):
            tickets.append({
                "id": f"t{i}",
                "category": "Software",
                "company_id": "company_A",
                "status": "resolved",
                "sla_status": "BREACHED" if i < breached_count else "ACTIVE",
            })
        return {"tickets": tickets}

    def test_high_breach_rate_gives_slow_multiplier(self):
        # 8 out of 10 resolved tickets breached → factor 1.3
        db = self._make_db(resolved_count=10, breached_count=8)
        factor = _category_adjustment("Software", "company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 1.3)

    def test_low_breach_rate_gives_fast_multiplier(self):
        # 1 out of 10 resolved tickets breached → factor 0.8
        db = self._make_db(resolved_count=10, breached_count=1)
        factor = _category_adjustment("Software", "company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 0.8)

    def test_moderate_breach_rate_gives_neutral_multiplier(self):
        # 4 out of 10 breached (40%) → factor 1.0
        db = self._make_db(resolved_count=10, breached_count=4)
        factor = _category_adjustment("Software", "company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 1.0)

    def test_fewer_than_5_resolved_returns_neutral(self):
        db = self._make_db(resolved_count=3, breached_count=3)
        factor = _category_adjustment("Software", "company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 1.0)

    def test_no_supabase_returns_neutral(self):
        self.assertAlmostEqual(_category_adjustment("Software", "company_A", None), 1.0)

    def test_missing_category_returns_neutral(self):
        db = self._make_db(10, 8)
        self.assertAlmostEqual(_category_adjustment(None, "company_A", _FakeSupabase(db)), 1.0)


# ---------------------------------------------------------------------------
# Workload multiplier
# ---------------------------------------------------------------------------

class TestWorkloadMultiplier(unittest.TestCase):
    def _make_db(self, open_count: int) -> dict:
        return {
            "tickets": [
                {"id": f"t{i}", "company_id": "company_A", "status": "open"}
                for i in range(open_count)
            ]
        }

    def test_high_workload_gives_slow_multiplier(self):
        db = self._make_db(25)
        factor = _workload_multiplier("company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 1.2)

    def test_low_workload_gives_fast_multiplier(self):
        db = self._make_db(3)
        factor = _workload_multiplier("company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 0.9)

    def test_medium_workload_gives_neutral_multiplier(self):
        db = self._make_db(10)
        factor = _workload_multiplier("company_A", _FakeSupabase(db))
        self.assertAlmostEqual(factor, 1.0)

    def test_no_supabase_returns_neutral(self):
        self.assertAlmostEqual(_workload_multiplier("company_A", None), 1.0)

    def test_missing_company_id_returns_neutral(self):
        db = self._make_db(25)
        self.assertAlmostEqual(_workload_multiplier(None, _FakeSupabase(db)), 1.0)


# ---------------------------------------------------------------------------
# Integration: combined factors
# ---------------------------------------------------------------------------

class TestGetSlaEstimateIntegration(unittest.TestCase):
    def _make_supabase(self, open_count=3, resolved_count=10, breached_count=9) -> _FakeSupabase:
        tickets = [
            {"id": f"t{i}", "company_id": "company_A", "status": "open", "category": "Network", "sla_status": "ACTIVE"}
            for i in range(open_count)
        ] + [
            {
                "id": f"r{i}", "company_id": "company_A", "status": "resolved",
                "category": "Network",
                "sla_status": "BREACHED" if i < breached_count else "ACTIVE",
            }
            for i in range(resolved_count)
        ]
        return _FakeSupabase({"tickets": tickets})

    def test_combined_factors_produce_adjusted_estimate(self):
        # high breach rate (0.9) → factor 1.3; low workload (3) → factor 0.9
        # critical baseline = 120 min; 120 * 1.3 * 0.9 = 140.4 → rounds to 140
        supabase = self._make_supabase(open_count=3, resolved_count=10, breached_count=9)
        result = get_sla_estimate(
            {"priority": "critical", "category": "Network", "company_id": "company_A"},
            supabase=supabase,
            _now_fn=_fixed_now(NOW),
        )
        self.assertEqual(result["estimated_minutes"], 140)
        self.assertFalse(result["breach_risk"])

    def test_returns_breach_risk_when_estimate_exceeds_deadline(self):
        supabase = self._make_supabase(open_count=3, resolved_count=10, breached_count=9)
        sla_breach_at = _future_iso(100, NOW)  # only 100 min left, estimate is 140
        result = get_sla_estimate(
            {
                "priority": "critical",
                "category": "Network",
                "company_id": "company_A",
                "sla_breach_at": sla_breach_at,
            },
            supabase=supabase,
            _now_fn=_fixed_now(NOW),
        )
        self.assertTrue(result["breach_risk"])


class TestInMemoryTTLCache(unittest.TestCase):
    def test_cache_get_set_clear(self):
        from backend.sla_predictor import InMemoryTTLCache
        cache = InMemoryTTLCache(ttl_seconds=1)
        self.assertIsNone(cache.get("key"))

        cache.set("key", "val")
        self.assertEqual(cache.get("key"), "val")

        cache.clear()
        self.assertIsNone(cache.get("key"))

    def test_cache_ttl_expiry(self):
        import time
        from backend.sla_predictor import InMemoryTTLCache
        cache = InMemoryTTLCache(ttl_seconds=0.01)
        cache.set("key", "val")
        time.sleep(0.02)
        self.assertIsNone(cache.get("key"))


class TestGetSlaEstimateMetadata(unittest.TestCase):
    def test_estimate_contains_metadata_and_factors(self):
        result = get_sla_estimate({"priority": "critical"})
        self.assertIn("factors", result)
        self.assertIn("metadata", result)
        self.assertEqual(result["factors"]["baseline_minutes"], 120)
        self.assertEqual(result["metadata"]["confidence_score"], 0.3)
        self.assertEqual(result["metadata"]["sample_count"], 0)
        self.assertEqual(result["metadata"]["workload_count"], 0)


if __name__ == "__main__":
    unittest.main()
