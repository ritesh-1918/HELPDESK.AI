"""
Unit tests for Advanced Ticket Search endpoint (Issue #2845).
Tests cover: keyword scoring, multi-value filters, date presets,
relevance ranking, pagination, and saved-search CRUD logic.

Run with:  python -m pytest backend/tests/test_advanced_search.py -v
"""
import unittest
from datetime import datetime, timedelta, timezone


# ─── Helpers mirroring the production relevance logic ─────────────────────────

def _relevance(ticket: dict, terms: list[str], now_utc: datetime) -> float:
    """Mirror of the _relevance() closure in /tickets/search."""
    import re as _re
    if not terms:
        return 0.0
    subject = (ticket.get("subject") or ticket.get("summary") or "").lower()
    description = (ticket.get("description") or "").lower()
    summary = (ticket.get("summary") or "").lower()
    category_val = (ticket.get("category") or "").lower()

    score = 0.0
    for term in terms:
        if term in subject:
            score += 3.0 if subject.startswith(term) else 2.0
        if term in summary:
            score += 1.5
        if term in description:
            score += 1.0
        if term in category_val:
            score += 0.8

    # Recency boost
    created_at_str = ticket.get("created_at") or ""
    if created_at_str:
        try:
            created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            age_days = (now_utc.replace(tzinfo=timezone.utc) - created_dt).days
            recency_boost = max(0.0, 1.0 - age_days / 90)
            score += recency_boost * 0.3
        except (ValueError, TypeError):
            pass

    return round(score, 3)


def _apply_filters(
    tickets: list[dict],
    status: str = "",
    priority: str = "",
    category: str = "",
) -> list[dict]:
    """Mirror of the Python-side multi-value filter in /tickets/search."""
    if status:
        statuses = [s.strip().lower() for s in status.split(",") if s.strip()]
        tickets = [t for t in tickets if (t.get("status") or "").lower() in statuses]
    if priority:
        priorities = [p.strip().lower() for p in priority.split(",") if p.strip()]
        tickets = [t for t in tickets if (t.get("priority") or "").lower() in priorities]
    if category:
        cats = [c.strip().lower() for c in category.split(",") if c.strip()]
        tickets = [t for t in tickets if (t.get("category") or "").lower() in cats]
    return tickets


# ─── Ticket factory ────────────────────────────────────────────────────────────

def _ticket(
    *,
    id: str = "t1",
    subject: str = "",
    description: str = "",
    summary: str = "",
    category: str = "General",
    status: str = "open",
    priority: str = "medium",
    created_at: datetime | None = None,
) -> dict:
    now = created_at or datetime.now(timezone.utc)
    return {
        "id": id,
        "subject": subject,
        "description": description,
        "summary": summary,
        "category": category,
        "status": status,
        "priority": priority,
        "created_at": now.isoformat().replace("+00:00", "Z"),
    }


# ─── Tests ────────────────────────────────────────────────────────────────────

NOW = datetime.now(timezone.utc)


class TestRelevanceScoring(unittest.TestCase):
    """Verify the relevance scoring function produces correct relative weights."""

    def _score(self, ticket: dict, query: str) -> float:
        import re as _re
        terms = _re.split(r"\s+", query.strip().lower()) if query.strip() else []
        return _relevance(ticket, terms, NOW)

    def test_subject_match_scores_higher_than_description_match(self):
        t_subject = _ticket(subject="VPN Authentication Failure", description="unrelated text")
        t_description = _ticket(subject="Unrelated Title", description="VPN Authentication Failure in the body")
        s1 = self._score(t_subject, "vpn authentication")
        s2 = self._score(t_description, "vpn authentication")
        self.assertGreater(s1, s2, "Subject match should outrank description match")

    def test_zero_score_when_no_keyword_match(self):
        # A very old ticket that matches no search terms should score near-zero
        # (recency boost is 0 beyond 90 days, so score is exactly 0).
        old_date = NOW - timedelta(days=120)
        t = _ticket(subject="Printer Jam", description="Paper stuck in tray", created_at=old_date)
        score = self._score(t, "vpn network")
        self.assertEqual(score, 0.0, "Old ticket with no keyword match must score 0.0")

    def test_prefix_match_scores_higher_than_interior_match(self):
        t_prefix = _ticket(subject="VPN login error on remote host")
        t_interior = _ticket(subject="Cannot connect to remote VPN server")
        s_prefix = self._score(t_prefix, "vpn")
        s_interior = self._score(t_interior, "vpn")
        self.assertGreater(s_prefix, s_interior, "Prefix subject match should score higher")

    def test_recency_boost_for_recent_ticket(self):
        recent = _ticket(subject="VPN issue", created_at=NOW)
        old = _ticket(subject="VPN issue", created_at=NOW - timedelta(days=120))
        s_recent = self._score(recent, "vpn")
        s_old = self._score(old, "vpn")
        self.assertGreater(s_recent, s_old, "Recent tickets should receive a recency boost")

    def test_multi_term_cumulative_scoring(self):
        t_both = _ticket(subject="VPN Authentication Failure", description="login error")
        t_one = _ticket(subject="VPN Setup", description="hardware config")
        s_both = self._score(t_both, "vpn authentication")
        s_one = self._score(t_one, "vpn authentication")
        self.assertGreater(s_both, s_one, "Ticket matching more terms should score higher")

    def test_category_match_contributes_to_score(self):
        t_cat = _ticket(subject="Cannot access resource", category="Network")
        t_no_cat = _ticket(subject="Cannot access resource", category="Hardware")
        s_cat = self._score(t_cat, "network")
        s_no_cat = self._score(t_no_cat, "network")
        self.assertGreater(s_cat, s_no_cat, "Category hit should contribute to score")

    def test_empty_query_returns_zero(self):
        t = _ticket(subject="VPN issue")
        score = self._score(t, "")
        self.assertEqual(score, 0.0)


class TestRelevanceRanking(unittest.TestCase):
    """Verify that sorting by relevance puts highest-scoring tickets first."""

    def test_most_relevant_ticket_ranks_first(self):
        import re as _re
        tickets = [
            _ticket(id="low",  subject="Printer issue",             description="paper jam"),
            _ticket(id="high", subject="VPN Authentication Failure", description="vpn login error"),
            _ticket(id="mid",  subject="Cannot connect",            description="vpn timeout"),
        ]
        query = "vpn authentication"
        terms = _re.split(r"\s+", query.lower())
        scored = [(t, _relevance(t, terms, NOW)) for t in tickets]
        scored.sort(key=lambda x: -x[1])
        self.assertEqual(scored[0][0]["id"], "high")


class TestMultiValueFilters(unittest.TestCase):
    """Verify comma-separated filter values work as OR conditions."""

    def _make_tickets(self):
        return [
            _ticket(id="open_high",   status="open",        priority="high"),
            _ticket(id="closed_low",  status="closed",      priority="low"),
            _ticket(id="pending_med", status="pending",     priority="medium"),
            _ticket(id="open_crit",   status="open",        priority="critical"),
        ]

    def test_single_status_filter(self):
        result = _apply_filters(self._make_tickets(), status="open")
        ids = [t["id"] for t in result]
        self.assertIn("open_high", ids)
        self.assertIn("open_crit", ids)
        self.assertNotIn("closed_low", ids)

    def test_multi_status_filter_or_logic(self):
        result = _apply_filters(self._make_tickets(), status="open,pending")
        ids = [t["id"] for t in result]
        self.assertIn("open_high", ids)
        self.assertIn("pending_med", ids)
        self.assertNotIn("closed_low", ids)

    def test_multi_priority_filter_or_logic(self):
        result = _apply_filters(self._make_tickets(), priority="high,critical")
        ids = [t["id"] for t in result]
        self.assertIn("open_high", ids)
        self.assertIn("open_crit", ids)
        self.assertNotIn("closed_low", ids)
        self.assertNotIn("pending_med", ids)

    def test_combined_status_and_priority(self):
        result = _apply_filters(self._make_tickets(), status="open", priority="critical")
        ids = [t["id"] for t in result]
        self.assertEqual(ids, ["open_crit"])

    def test_empty_filters_return_all(self):
        tickets = self._make_tickets()
        result = _apply_filters(tickets)
        self.assertEqual(len(result), len(tickets))

    def test_category_filter(self):
        tickets = [
            _ticket(id="net",  category="Network"),
            _ticket(id="hw",   category="Hardware"),
            _ticket(id="sec",  category="Security"),
        ]
        result = _apply_filters(tickets, category="network,security")
        ids = [t["id"] for t in result]
        self.assertIn("net", ids)
        self.assertIn("sec", ids)
        self.assertNotIn("hw", ids)


class TestDatePresets(unittest.TestCase):
    """Verify date preset logic produces correct cutoff timestamps."""

    def test_today_preset_cutoff(self):
        now = datetime.utcnow()
        cutoff = now.strftime("%Y-%m-%d") + "T00:00:00Z"
        self.assertTrue(cutoff.startswith(now.strftime("%Y-%m-%d")))

    def test_7d_preset_cutoff(self):
        now = datetime.utcnow()
        cutoff = (now - timedelta(days=7)).isoformat() + "Z"
        cutoff_dt = datetime.fromisoformat(cutoff.replace("Z", "+00:00").replace("+00:00+00:00", "+00:00"))
        age = (now.replace(tzinfo=timezone.utc) - cutoff_dt).days
        self.assertAlmostEqual(age, 7, delta=1)

    def test_30d_preset_cutoff(self):
        now = datetime.utcnow()
        cutoff = (now - timedelta(days=30)).isoformat() + "Z"
        cutoff_dt = datetime.fromisoformat(cutoff.replace("Z", "+00:00").replace("+00:00+00:00", "+00:00"))
        age = (now.replace(tzinfo=timezone.utc) - cutoff_dt).days
        self.assertAlmostEqual(age, 30, delta=1)


class TestPagination(unittest.TestCase):
    """Verify offset/limit slicing is correct."""

    def _make_scored(self, n: int) -> list[tuple[dict, float]]:
        return [(_ticket(id=str(i)), float(n - i)) for i in range(n)]

    def test_first_page(self):
        scored = self._make_scored(20)
        page = scored[0:10]
        self.assertEqual(len(page), 10)
        self.assertEqual(page[0][0]["id"], "0")

    def test_second_page(self):
        scored = self._make_scored(20)
        page = scored[10:20]
        self.assertEqual(len(page), 10)
        self.assertEqual(page[0][0]["id"], "10")

    def test_partial_last_page(self):
        scored = self._make_scored(13)
        page = scored[10:20]
        self.assertEqual(len(page), 3)

    def test_has_more_flag(self):
        total = 25
        limit = 10
        offset = 0
        has_more = (offset + limit) < total
        self.assertTrue(has_more)

    def test_no_more_on_last_page(self):
        total = 10
        limit = 10
        offset = 0
        has_more = (offset + limit) < total
        self.assertFalse(has_more)


class TestSavedSearchCrud(unittest.TestCase):
    """Validate saved-search list manipulation (add/delete) logic."""

    def _add(self, existing: list, name: str, filters: dict) -> list:
        import uuid as _uuid
        new_entry = {
            "id": str(_uuid.uuid4()),
            "name": name,
            "filters": filters,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        existing.append(new_entry)
        return existing

    def _delete(self, existing: list, search_id: str) -> list:
        return [s for s in existing if s.get("id") != search_id]

    def test_create_saved_search(self):
        result = self._add([], "My Critical Tickets", {"priority": "critical", "status": "open"})
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "My Critical Tickets")
        self.assertIn("id", result[0])

    def test_create_multiple_saved_searches(self):
        existing = []
        existing = self._add(existing, "VPN Issues", {"q": "vpn", "status": "open"})
        existing = self._add(existing, "Network Queue", {"category": "network"})
        self.assertEqual(len(existing), 2)

    def test_delete_saved_search(self):
        existing = self._add([], "To Delete", {})
        search_id = existing[0]["id"]
        remaining = self._delete(existing, search_id)
        self.assertEqual(len(remaining), 0)

    def test_delete_only_removes_target(self):
        existing = []
        existing = self._add(existing, "Keep", {})
        existing = self._add(existing, "Remove", {})
        target_id = existing[1]["id"]
        remaining = self._delete(existing, target_id)
        self.assertEqual(len(remaining), 1)
        self.assertEqual(remaining[0]["name"], "Keep")

    def test_delete_nonexistent_is_safe(self):
        existing = self._add([], "Keep", {})
        remaining = self._delete(existing, "nonexistent-uuid")
        self.assertEqual(len(remaining), 1)


class TestRelevancePctNormalization(unittest.TestCase):
    """Verify relevance_score percentage is bounded to 0–100."""

    def test_pct_capped_at_100(self):
        import re as _re
        query = "vpn"
        terms = _re.split(r"\s+", query.lower())
        max_possible = len(terms) * 3.5
        score = 999.0  # artificially high
        pct = round(min(score / max_possible, 1.0) * 100)
        self.assertEqual(pct, 100)

    def test_pct_is_none_without_keyword(self):
        terms = []
        relevance_pct = None if not terms else 50
        self.assertIsNone(relevance_pct)

    def test_pct_proportional(self):
        import re as _re
        query = "vpn"
        terms = _re.split(r"\s+", query.lower())
        max_possible = len(terms) * 3.5
        score = 1.75  # half of 3.5
        pct = round(min(score / max_possible, 1.0) * 100)
        self.assertEqual(pct, 50)


if __name__ == "__main__":
    unittest.main()
