"""
Unit tests for department routing rules logic.

Tests the apply_routing_rules and resolve_company_id helpers in isolation
by defining minimal local versions that mirror the implementations in
backend/main.py — avoiding the need to import the entire FastAPI app
(which requires dozens of optional ML/cloud dependencies).
"""
import re
import unittest
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# Minimal reproductions of the two functions under test
# (kept in sync with the implementations in backend/main.py)
# ---------------------------------------------------------------------------

_SUPABASE = None  # module-level sentinel; patched in tests


def resolve_company_id(user_id, company_id):
    """Look up company_id from user profile if not explicitly provided."""
    if company_id:
        return company_id
    if not user_id or not _SUPABASE:
        return None
    try:
        res = _SUPABASE.table("profiles").select("company_id").eq("id", user_id).single().execute()
        if res.data:
            return res.data.get("company_id")
    except Exception as e:
        print(f"[WARNING] Failed to resolve company_id for user_id={user_id}: {e}")
    return None


def apply_routing_rules(text, predicted_category, rules):
    """
    Evaluates active routing rules against the ticket text and predicted category.
    Returns the target_department if a rule matches, otherwise None.
    Rules are sorted by priority DESC so highest-priority rules win.
    """
    sorted_rules = sorted(rules, key=lambda r: r.get("priority", 0), reverse=True)
    for rule in sorted_rules:
        rule_type = rule.get("rule_type")
        pattern = rule.get("pattern", "")
        target = rule.get("target_department")

        if not pattern or not target:
            continue

        if rule_type == "keyword":
            pattern_escaped = re.escape(pattern)
            try:
                if re.search(rf"\b{pattern_escaped}\b", text, re.IGNORECASE):
                    return target
            except Exception:
                if pattern.lower() in text.lower():
                    return target
        elif rule_type == "category":
            if predicted_category.lower() == pattern.lower():
                return target

    return None


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestApplyRoutingRules(unittest.TestCase):

    def test_keyword_word_boundary_match(self):
        rules = [{
            "rule_type": "keyword",
            "pattern": "router",
            "target_department": "Network Ops",
            "is_active": True,
            "priority": 10,
        }]
        # Case-insensitive word match
        self.assertEqual(
            apply_routing_rules("The Cisco Router ISR4331 is down", "Hardware", rules),
            "Network Ops",
        )

    def test_keyword_no_subword_match(self):
        rules = [{
            "rule_type": "keyword",
            "pattern": "router",
            "target_department": "Network Ops",
            "is_active": True,
            "priority": 10,
        }]
        # "troubleshooterrr" contains "router" as substring but NOT as a whole word
        self.assertIsNone(
            apply_routing_rules("This is my troubleshooterrr", "Hardware", rules)
        )

    def test_category_match(self):
        rules = [{
            "rule_type": "category",
            "pattern": "Access",
            "target_department": "IAM Team",
            "is_active": True,
            "priority": 5,
        }]
        self.assertEqual(
            apply_routing_rules("Need help with login", "Access", rules),
            "IAM Team",
        )
        # Case-insensitive category match
        self.assertEqual(
            apply_routing_rules("Need help with login", "access", rules),
            "IAM Team",
        )
        # No match for a different category
        self.assertIsNone(
            apply_routing_rules("My screen is broken", "Hardware", rules)
        )

    def test_priority_order(self):
        rules = [
            {
                "rule_type": "keyword",
                "pattern": "router",
                "target_department": "Network Team Low Priority",
                "is_active": True,
                "priority": 1,
            },
            {
                "rule_type": "keyword",
                "pattern": "cisco",
                "target_department": "Cisco Special Force",
                "is_active": True,
                "priority": 100,  # Higher priority wins
            },
        ]
        # Both keywords appear in text; highest priority rule should win
        self.assertEqual(
            apply_routing_rules("The cisco router is down", "Network", rules),
            "Cisco Special Force",
        )

    def test_no_rules_returns_none(self):
        self.assertIsNone(apply_routing_rules("Any text", "Hardware", []))


class TestResolveCompanyId(unittest.TestCase):

    def test_direct_company_id(self):
        self.assertEqual(
            resolve_company_id("some-user", "direct-company-id"),
            "direct-company-id",
        )

    def test_none_returns_none(self):
        self.assertIsNone(resolve_company_id(None, None))

    def test_no_supabase_returns_none(self):
        # _SUPABASE is None by default in this test module
        self.assertIsNone(resolve_company_id("user-123", None))

    def test_db_lookup(self):
        import sys
        this_module = sys.modules[__name__]

        mock_supabase = MagicMock()
        mock_response = MagicMock()
        mock_response.data = {"company_id": "resolved-db-company"}
        (
            mock_supabase.table.return_value
            .select.return_value
            .eq.return_value
            .single.return_value
            .execute.return_value
        ) = mock_response

        # Temporarily inject supabase
        original = this_module._SUPABASE
        this_module._SUPABASE = mock_supabase
        try:
            res = resolve_company_id("user-123", None)
        finally:
            this_module._SUPABASE = original

        self.assertEqual(res, "resolved-db-company")
        mock_supabase.table.assert_called_with("profiles")


if __name__ == "__main__":
    unittest.main()
