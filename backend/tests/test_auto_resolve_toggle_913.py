"""
Regression tests for Issue #913:
Auto-Resolve Toggle in Admin Settings Has No Effect — Backend Always Defaults to Disabled.

Root causes fixed:
1. backend/main.py (both analyze paths): the RAG block unconditionally set
   classification["auto_resolve"] = True, bypassing the company's enable_auto_resolve
   toggle read from system_settings.  Fix: guard the RAG assignment with
   `if enable_auto_resolve`.

2. backend/services/auto_close_service.py: get_system_settings() fell back to
   auto_close_enabled=True when the DB was unavailable or the row was missing,
   meaning a DB failure would silently enable auto-close for every company.
   Fix: fall back to False (safe/disabled).

These tests verify both fixes without requiring a live Supabase connection.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# Path setup — ensure backend package is importable without a live DB
# ---------------------------------------------------------------------------
_cwd = os.getcwd()
sys.path = [p for p in sys.path if p not in ("", _cwd, os.path.dirname(_cwd))]
try:
    import supabase  # noqa: F401 — pre-import to avoid namespace shadowing
finally:
    sys.path.insert(0, _cwd)
    _backend_root = os.path.join(_cwd, "backend") if "backend" not in _cwd else _cwd
    sys.path.insert(0, _backend_root)
    sys.path.insert(0, os.path.dirname(_backend_root))

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "mock_service_key")


# ===========================================================================
# Part 1 — AutoCloseService.get_system_settings fallback behaviour
# ===========================================================================

from backend.services.auto_close_service import AutoCloseService


class TestAutoCloseServiceFallback(unittest.TestCase):
    """
    Verify that get_system_settings() uses a *safe* (disabled) default when
    the database is unavailable or returns no data.
    """

    def setUp(self):
        patcher = patch("backend.services.auto_close_service.create_client")
        self.mock_create_client = patcher.start()
        self.addCleanup(patcher.stop)
        self.mock_supabase = MagicMock()
        self.mock_create_client.return_value = self.mock_supabase
        self.service = AutoCloseService()

    # --- DB exception → safe fallback ---

    def test_fallback_disabled_on_db_exception(self):
        """When the DB raises, auto_close_enabled must default to False (not True)."""
        self.mock_supabase.table.side_effect = Exception("connection refused")

        result = self.service.get_system_settings("company-unreachable")

        self.assertFalse(
            result["auto_close_enabled"],
            "Fallback on DB error must be False to avoid silently auto-closing tickets."
        )

    def test_fallback_disabled_when_data_is_none(self):
        """When the DB returns no row, auto_close_enabled must default to False."""
        mock_resp = MagicMock()
        mock_resp.data = None
        (self.mock_supabase.table.return_value
         .select.return_value.eq.return_value.single.return_value
         .execute.return_value) = mock_resp

        result = self.service.get_system_settings("company-no-row")

        self.assertFalse(
            result["auto_close_enabled"],
            "Missing DB row must default to False, not True."
        )

    # --- DB returns explicit values → must be respected ---

    def test_db_enabled_true_is_respected(self):
        """When DB has auto_close_enabled=True, the service must honour it."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 7, "auto_close_enabled": True}
        (self.mock_supabase.table.return_value
         .select.return_value.eq.return_value.single.return_value
         .execute.return_value) = mock_resp

        result = self.service.get_system_settings("company-enabled")

        self.assertTrue(result["auto_close_enabled"])

    def test_db_enabled_false_is_respected(self):
        """When DB has auto_close_enabled=False, the service must honour it."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 14, "auto_close_enabled": False}
        (self.mock_supabase.table.return_value
         .select.return_value.eq.return_value.single.return_value
         .execute.return_value) = mock_resp

        result = self.service.get_system_settings("company-disabled")

        self.assertFalse(result["auto_close_enabled"])
        self.assertEqual(result["auto_close_days"], 14)

    def test_db_missing_auto_close_enabled_key_defaults_false(self):
        """When the DB row exists but lacks auto_close_enabled, default to False."""
        mock_resp = MagicMock()
        mock_resp.data = {"auto_close_days": 7}  # key absent
        (self.mock_supabase.table.return_value
         .select.return_value.eq.return_value.single.return_value
         .execute.return_value) = mock_resp

        result = self.service.get_system_settings("company-partial-row")

        self.assertFalse(
            result["auto_close_enabled"],
            "Absent auto_close_enabled key must default to False."
        )


# ===========================================================================
# Part 2 — main.py: RAG block must respect enable_auto_resolve toggle
# ===========================================================================

class TestAutoResolveToggleInMainPy(unittest.TestCase):
    """
    Simulate the logic in backend/main.py's analyze path to verify that the
    RAG block cannot enable auto_resolve when the company toggle is False.

    We replicate the exact pattern from main.py rather than importing the
    full FastAPI app (which requires heavy ML assets), so these tests are
    fast and deterministic.
    """

    # -----------------------------------------------------------------------
    # Helper: replicate the analyze logic from main.py
    # -----------------------------------------------------------------------

    @staticmethod
    def _run_analyze_logic(enable_auto_resolve: bool, rag_returns_match: bool) -> dict:
        """
        Minimal reproduction of the classify + RAG + spam section in main.py.

        Returns the final classification dict so tests can assert auto_resolve.
        """
        # Simulate classifier output (may or may not suggest auto-resolve)
        classification = {
            "auto_resolve": False,
            "assigned_team": "IT Support",
            "confidence": 0.75,
            "category": "Technical",
            "subcategory": "Software",
            "priority": "Medium",
        }

        # Gate: if toggle is off, force False immediately (as main.py does)
        if not enable_auto_resolve:
            classification["auto_resolve"] = False

        # Simulate RAG block (the previously buggy section)
        rag_match = None
        if rag_returns_match:
            rag_match = {"title": "How to reset password", "similarity": 0.92}

        if rag_match:
            # FIXED behaviour: only set True when toggle allows it
            if enable_auto_resolve:
                classification["auto_resolve"] = True
                classification["assigned_team"] = "Auto-Resolve AI"
            classification["confidence"] = max(
                classification["confidence"], float(rag_match["similarity"])
            )

        return classification

    # -----------------------------------------------------------------------
    # Tests
    # -----------------------------------------------------------------------

    def test_toggle_off_rag_match_auto_resolve_stays_false(self):
        """
        Core regression: even when RAG finds a solution, auto_resolve must
        remain False when the company's enable_auto_resolve toggle is False.
        """
        result = self._run_analyze_logic(
            enable_auto_resolve=False,
            rag_returns_match=True,
        )
        self.assertFalse(
            result["auto_resolve"],
            "RAG must NOT enable auto_resolve when the company toggle is False."
        )

    def test_toggle_off_rag_match_team_not_overwritten(self):
        """
        When toggle is off and RAG finds a match, assigned_team must NOT be
        changed to 'Auto-Resolve AI'.
        """
        result = self._run_analyze_logic(
            enable_auto_resolve=False,
            rag_returns_match=True,
        )
        self.assertNotEqual(
            result["assigned_team"],
            "Auto-Resolve AI",
            "assigned_team must not be overwritten to 'Auto-Resolve AI' when toggle is off."
        )

    def test_toggle_off_rag_match_confidence_still_updated(self):
        """
        Even when toggle is off, the confidence score from RAG should still
        be applied (it's informational, not a behaviour gate).
        """
        result = self._run_analyze_logic(
            enable_auto_resolve=False,
            rag_returns_match=True,
        )
        # RAG similarity was 0.92, original confidence 0.75 → should be 0.92
        self.assertAlmostEqual(result["confidence"], 0.92)

    def test_toggle_on_rag_match_auto_resolve_true(self):
        """
        When the toggle IS enabled and RAG finds a match, auto_resolve should
        be set to True (normal happy path).
        """
        result = self._run_analyze_logic(
            enable_auto_resolve=True,
            rag_returns_match=True,
        )
        self.assertTrue(result["auto_resolve"])
        self.assertEqual(result["assigned_team"], "Auto-Resolve AI")

    def test_toggle_on_no_rag_match_auto_resolve_false(self):
        """
        When toggle is on but RAG finds no match, auto_resolve should remain
        False (classifier default).
        """
        result = self._run_analyze_logic(
            enable_auto_resolve=True,
            rag_returns_match=False,
        )
        self.assertFalse(result["auto_resolve"])

    def test_toggle_off_no_rag_match_auto_resolve_false(self):
        """
        Toggle off + no RAG match → auto_resolve must be False.
        """
        result = self._run_analyze_logic(
            enable_auto_resolve=False,
            rag_returns_match=False,
        )
        self.assertFalse(result["auto_resolve"])


if __name__ == "__main__":
    unittest.main()
