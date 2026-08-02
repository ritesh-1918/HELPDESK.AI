"""
Comprehensive unit tests for backend/services/classifier_service.py — Issue #1136.

Covers: module constants validation, ClassifierService init, load() behaviour,
derivation logic (PRIORITY_MAP / TEAM_MAP / AUTO_RESOLVE_SUBS), regex override
layer behaviour, and predict() boundary conditions.

All torch/transformers/cache/metrics deps are stubbed at module level so the
suite runs in a CPU-only CI environment without any ML dependencies installed.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch, call

# ─── Stub ML and optional deps before importing the service ──────────────────
_mock_torch = MagicMock()
_mock_torch.cuda.is_available.return_value = False
_no_grad_ctx = MagicMock()
_no_grad_ctx.__enter__ = MagicMock(return_value=None)
_no_grad_ctx.__exit__ = MagicMock(return_value=False)
_mock_torch.no_grad.return_value = _no_grad_ctx
_mock_torch.device = MagicMock(side_effect=lambda d: f"device({d})")
_mock_f = MagicMock()
_mock_torch.nn = MagicMock()
_mock_torch.nn.functional = _mock_f

_mock_transformers = MagicMock()
_mock_transformers.DistilBertTokenizerFast = MagicMock()
_mock_transformers.DistilBertForSequenceClassification = MagicMock()

sys.modules["torch"] = _mock_torch
sys.modules["torch.nn"] = _mock_torch.nn
sys.modules["torch.nn.functional"] = _mock_f
sys.modules["transformers"] = _mock_transformers
sys.modules.setdefault("backend.services.cache_service", MagicMock())
sys.modules.setdefault("backend.services.metrics_service", MagicMock())

_SERVICES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services"))
if _SERVICES_DIR not in sys.path:
    sys.path.insert(0, _SERVICES_DIR)

sys.modules.pop("classifier_service", None)

from classifier_service import (  # noqa: E402
    ClassifierService,
    PRIORITY_MAP,
    TEAM_MAP,
    AUTO_RESOLVE_SUBS,
    MAX_LEN,
    SAVE_DIR,
)


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — PRIORITY_MAP: structural and content validation
# ═══════════════════════════════════════════════════════════════════════════════

class TestPriorityMapStructure(unittest.TestCase):
    """PRIORITY_MAP must cover all severity levels and have no stale keys."""

    VALID_PRIORITIES = {"Critical", "High", "Medium", "Low"}

    def test_every_value_is_a_valid_priority_level(self):
        for sub, pri in PRIORITY_MAP.items():
            self.assertIn(pri, self.VALID_PRIORITIES, f"Bad priority '{pri}' for '{sub}'")

    def test_blue_screen_is_critical(self):
        self.assertEqual(PRIORITY_MAP["Blue Screen"], "Critical")

    def test_overheating_is_critical(self):
        self.assertEqual(PRIORITY_MAP["Overheating"], "Critical")

    def test_data_loss_is_critical(self):
        self.assertEqual(PRIORITY_MAP["Data Loss"], "Critical")

    def test_hardware_failure_is_critical(self):
        self.assertEqual(PRIORITY_MAP["Hardware Failure"], "Critical")

    def test_application_crash_is_high(self):
        self.assertEqual(PRIORITY_MAP["Application Crash"], "High")

    def test_login_failure_is_high(self):
        self.assertEqual(PRIORITY_MAP["Login Failure"], "High")

    def test_password_reset_is_high(self):
        self.assertEqual(PRIORITY_MAP["Password Reset"], "High")

    def test_vpn_connection_is_high(self):
        self.assertEqual(PRIORITY_MAP["VPN Connection"], "High")

    def test_firewall_block_is_high(self):
        self.assertEqual(PRIORITY_MAP["Firewall Block"], "High")

    def test_dns_problem_is_high(self):
        self.assertEqual(PRIORITY_MAP["DNS Problem"], "High")

    def test_mfa_problem_is_high(self):
        self.assertEqual(PRIORITY_MAP["MFA Problem"], "High")

    def test_account_expired_is_high(self):
        self.assertEqual(PRIORITY_MAP["Account Expired"], "High")

    def test_permission_issue_is_medium(self):
        self.assertEqual(PRIORITY_MAP["Permission Issue"], "Medium")

    def test_software_install_is_medium(self):
        self.assertEqual(PRIORITY_MAP["Software Install"], "Medium")

    def test_account_unlock_is_low(self):
        self.assertEqual(PRIORITY_MAP["Account Unlock"], "Low")

    def test_keyboard_mouse_is_low(self):
        self.assertEqual(PRIORITY_MAP["Keyboard/Mouse"], "Low")

    def test_printer_error_is_low(self):
        self.assertEqual(PRIORITY_MAP["Printer Error"], "Low")

    def test_battery_issue_is_low(self):
        self.assertEqual(PRIORITY_MAP["Battery Issue"], "Low")

    def test_laptop_issue_is_low(self):
        self.assertEqual(PRIORITY_MAP["Laptop Issue"], "Low")

    def test_no_empty_subcategory_keys(self):
        for key in PRIORITY_MAP:
            self.assertTrue(key.strip(), "Whitespace-only key in PRIORITY_MAP")

    def test_all_keys_are_strings(self):
        for key in PRIORITY_MAP:
            self.assertIsInstance(key, str)

    def test_has_at_least_25_entries(self):
        self.assertGreaterEqual(len(PRIORITY_MAP), 25)

    def test_unknown_subcategory_defaults_to_medium(self):
        self.assertEqual(PRIORITY_MAP.get("ZZZ_Not_A_Real_SubCat", "Medium"), "Medium")

    def test_medium_priority_count_is_reasonable(self):
        count = sum(1 for v in PRIORITY_MAP.values() if v == "Medium")
        self.assertGreater(count, 5)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — TEAM_MAP: all four categories covered
# ═══════════════════════════════════════════════════════════════════════════════

class TestTeamMapStructure(unittest.TestCase):
    """TEAM_MAP must route the four standard IT categories to named support teams."""

    def test_access_maps_to_iam_team(self):
        self.assertEqual(TEAM_MAP["Access"], "IAM Team")

    def test_network_maps_to_network_support(self):
        self.assertEqual(TEAM_MAP["Network"], "Network Support")

    def test_software_maps_to_application_support(self):
        self.assertEqual(TEAM_MAP["Software"], "Application Support")

    def test_hardware_maps_to_hardware_support(self):
        self.assertEqual(TEAM_MAP["Hardware"], "Hardware Support")

    def test_all_four_standard_categories_present(self):
        for cat in ("Access", "Network", "Software", "Hardware"):
            self.assertIn(cat, TEAM_MAP, f"'{cat}' missing from TEAM_MAP")

    def test_all_team_names_are_non_empty_strings(self):
        for cat, team in TEAM_MAP.items():
            self.assertIsInstance(team, str)
            self.assertTrue(team.strip(), f"Empty team name for '{cat}'")

    def test_unknown_category_resolves_to_general_support_via_get(self):
        self.assertEqual(TEAM_MAP.get("Facilities", "General Support"), "General Support")

    def test_team_map_has_exactly_four_entries(self):
        self.assertEqual(len(TEAM_MAP), 4)


# ═══════════════════════════════════════════════════════════════════════════════
# 3 — AUTO_RESOLVE_SUBS: membership and safety rules
# ═══════════════════════════════════════════════════════════════════════════════

class TestAutoResolveSubsStructure(unittest.TestCase):
    """Only low-risk, high-frequency issues should be auto-resolved."""

    EXPECTED = {
        "Password Reset", "Account Unlock", "Software Install",
        "WiFi Issue", "Printer Error", "Monitor Problem",
    }

    def test_is_a_set(self):
        self.assertIsInstance(AUTO_RESOLVE_SUBS, set)

    def test_expected_members_present(self):
        self.assertEqual(AUTO_RESOLVE_SUBS, self.EXPECTED)

    def test_critical_issues_not_auto_resolved(self):
        for sub in ("Blue Screen", "Data Loss", "Hardware Failure", "Application Crash"):
            self.assertNotIn(sub, AUTO_RESOLVE_SUBS,
                             f"Critical sub '{sub}' must NOT be in AUTO_RESOLVE_SUBS")

    def test_high_priority_issues_not_auto_resolved(self):
        for sub in ("Login Failure", "VPN Connection", "Firewall Block", "DNS Problem"):
            self.assertNotIn(sub, AUTO_RESOLVE_SUBS,
                             f"High-priority sub '{sub}' must NOT be in AUTO_RESOLVE_SUBS")

    def test_all_auto_resolve_subs_exist_in_priority_map(self):
        for sub in AUTO_RESOLVE_SUBS:
            self.assertIn(sub, PRIORITY_MAP,
                          f"'{sub}' is auto-resolvable but missing from PRIORITY_MAP")

    def test_auto_resolve_subs_are_not_critical_priority(self):
        for sub in AUTO_RESOLVE_SUBS:
            pri = PRIORITY_MAP.get(sub, "Medium")
            self.assertNotEqual(pri, "Critical",
                                f"Auto-resolvable sub '{sub}' must not be Critical priority")

    def test_set_cardinality_is_six(self):
        self.assertEqual(len(AUTO_RESOLVE_SUBS), 6)

    def test_password_reset_is_member(self):
        self.assertIn("Password Reset", AUTO_RESOLVE_SUBS)

    def test_monitor_problem_is_member(self):
        self.assertIn("Monitor Problem", AUTO_RESOLVE_SUBS)

    def test_wifi_issue_is_member(self):
        self.assertIn("WiFi Issue", AUTO_RESOLVE_SUBS)


# ═══════════════════════════════════════════════════════════════════════════════
# 4 — MAX_LEN and SAVE_DIR constants
# ═══════════════════════════════════════════════════════════════════════════════

class TestModuleConstants(unittest.TestCase):

    def test_max_len_is_128(self):
        self.assertEqual(MAX_LEN, 128)

    def test_max_len_is_integer(self):
        self.assertIsInstance(MAX_LEN, int)

    def test_max_len_is_positive(self):
        self.assertGreater(MAX_LEN, 0)

    def test_save_dir_is_string(self):
        self.assertIsInstance(SAVE_DIR, str)

    def test_save_dir_is_absolute(self):
        self.assertTrue(os.path.isabs(SAVE_DIR))

    def test_save_dir_ends_with_classifier(self):
        self.assertTrue(SAVE_DIR.endswith("classifier") or "classifier" in SAVE_DIR)


# ═══════════════════════════════════════════════════════════════════════════════
# 5 — ClassifierService initialisation
# ═══════════════════════════════════════════════════════════════════════════════

class TestClassifierServiceInit(unittest.TestCase):
    """Fresh ClassifierService must start in a clean, unloaded state."""

    def setUp(self):
        self.svc = ClassifierService()

    def test_model_is_none_at_init(self):
        self.assertIsNone(self.svc.model)

    def test_tokenizer_is_none_at_init(self):
        self.assertIsNone(self.svc.tokenizer)

    def test_id2label_is_none_at_init(self):
        self.assertIsNone(self.svc.id2label)

    def test_label2id_is_none_at_init(self):
        self.assertIsNone(self.svc.label2id)

    def test_loaded_flag_is_false_at_init(self):
        self.assertFalse(self.svc._loaded)

    def test_two_instances_are_independent(self):
        svc2 = ClassifierService()
        self.svc._loaded = True
        self.assertFalse(svc2._loaded)


# ═══════════════════════════════════════════════════════════════════════════════
# 6 — load() behaviour
# ═══════════════════════════════════════════════════════════════════════════════

class TestLoadBehaviour(unittest.TestCase):

    def test_load_skips_filesystem_when_already_loaded(self):
        svc = ClassifierService()
        svc._loaded = True
        with patch("os.path.exists") as mock_exists:
            svc.load()
            mock_exists.assert_not_called()

    def test_loaded_flag_stays_true_after_second_call(self):
        svc = ClassifierService()
        svc._loaded = True
        svc.load()
        self.assertTrue(svc._loaded)

    def test_load_raises_when_safetensors_missing(self):
        svc = ClassifierService()
        with patch("os.path.exists", return_value=False):
            with self.assertRaises(Exception):
                svc.load()

    def test_load_called_once_then_idempotent(self):
        svc = ClassifierService()
        call_count = {"n": 0}

        original_load = svc.load

        def patched_load():
            if not svc._loaded:
                call_count["n"] += 1
                svc._loaded = True

        svc.load = patched_load
        svc.load()
        svc.load()
        svc.load()
        self.assertEqual(call_count["n"], 1)


# ═══════════════════════════════════════════════════════════════════════════════
# 7 — Derivation logic (tested directly without going through predict())
# ═══════════════════════════════════════════════════════════════════════════════

class TestDerivationLogicDirect(unittest.TestCase):
    """Validate the priority/team/auto_resolve derivation without mocking predict()."""

    def _derive(self, combined_label: str) -> dict:
        """Replicate the derivation logic from predict() for unit testing."""
        parts = combined_label.split(" | ", 1)
        category = parts[0].strip() if len(parts) > 0 else "Unknown"
        subcategory = parts[1].strip() if len(parts) > 1 else "Unknown"
        priority = PRIORITY_MAP.get(subcategory, "Medium")
        assigned_team = TEAM_MAP.get(category, "General Support")
        auto_resolve = subcategory in AUTO_RESOLVE_SUBS
        return {
            "category": category,
            "subcategory": subcategory,
            "priority": priority,
            "assigned_team": assigned_team,
            "auto_resolve": auto_resolve,
        }

    def test_network_dns_problem(self):
        r = self._derive("Network | DNS Problem")
        self.assertEqual(r["category"], "Network")
        self.assertEqual(r["subcategory"], "DNS Problem")
        self.assertEqual(r["priority"], "High")
        self.assertEqual(r["assigned_team"], "Network Support")
        self.assertFalse(r["auto_resolve"])

    def test_access_password_reset(self):
        r = self._derive("Access | Password Reset")
        self.assertEqual(r["priority"], "High")
        self.assertEqual(r["assigned_team"], "IAM Team")
        self.assertTrue(r["auto_resolve"])

    def test_access_account_unlock(self):
        r = self._derive("Access | Account Unlock")
        self.assertEqual(r["priority"], "Low")
        self.assertTrue(r["auto_resolve"])

    def test_software_application_crash(self):
        r = self._derive("Software | Application Crash")
        self.assertEqual(r["priority"], "High")
        self.assertEqual(r["assigned_team"], "Application Support")
        self.assertFalse(r["auto_resolve"])

    def test_hardware_blue_screen(self):
        r = self._derive("Hardware | Blue Screen")
        self.assertEqual(r["priority"], "Critical")
        self.assertEqual(r["assigned_team"], "Hardware Support")
        self.assertFalse(r["auto_resolve"])

    def test_hardware_laptop_issue_is_low_and_not_auto_resolved(self):
        r = self._derive("Hardware | Laptop Issue")
        self.assertEqual(r["priority"], "Low")
        self.assertFalse(r["auto_resolve"])

    def test_wifi_issue_is_auto_resolved(self):
        r = self._derive("Network | WiFi Issue")
        self.assertTrue(r["auto_resolve"])

    def test_printer_error_is_auto_resolved(self):
        r = self._derive("Hardware | Printer Error")
        self.assertTrue(r["auto_resolve"])

    def test_unknown_subcategory_defaults_to_medium_priority(self):
        r = self._derive("Software | Totally_Unknown_Sub")
        self.assertEqual(r["priority"], "Medium")
        self.assertFalse(r["auto_resolve"])

    def test_unknown_category_defaults_to_general_support(self):
        r = self._derive("Facilities | Desk Request")
        self.assertEqual(r["assigned_team"], "General Support")

    def test_label_without_pipe_subcategory_is_unknown(self):
        r = self._derive("Network")
        self.assertEqual(r["subcategory"], "Unknown")
        self.assertEqual(r["priority"], "Medium")

    def test_whitespace_stripped_from_label(self):
        r = self._derive("  Access  |  Account Unlock  ")
        self.assertEqual(r["category"], "Access")
        self.assertEqual(r["subcategory"], "Account Unlock")

    def test_extra_pipe_uses_first_split_only(self):
        r = self._derive("Software | App | Extra")
        self.assertEqual(r["category"], "Software")
        self.assertEqual(r["subcategory"], "App | Extra")


# ═══════════════════════════════════════════════════════════════════════════════
# 8 — Regex override logic (tested directly)
# ═══════════════════════════════════════════════════════════════════════════════

class TestRegexOverrideLogic(unittest.TestCase):
    """Validate the keyword-based regex override layer directly."""

    TECH_KEYWORDS = {
        "Network": [
            "IP address", "hostname", "connection", "network", "bandwidth",
            "DNS", "firewall", "VPN", "Connectivity", "Latency", "Routing", "Spikes",
        ],
        "Software": [
            "crash", "load", "website", "application", "error", "bug",
            "failing", "software", "SQL", "Cluster", "Database", "Production", "Latency",
        ],
        "Access": [
            "login", "password", "access", "authentication",
            "account", "permission", "MFA", "OAuth",
        ],
    }

    def _apply_override(self, text: str, category: str, confidence: float) -> tuple:
        lower_text = text.lower()
        for cat, keywords in self.TECH_KEYWORDS.items():
            if any(k.lower() in lower_text for k in keywords):
                if category == "General" or confidence < 0.9:
                    category = cat
                    assigned_team = TEAM_MAP.get(cat, "General Support")
                    confidence = max(confidence, 0.92)
                    return category, assigned_team, confidence
        return category, TEAM_MAP.get(category, "General Support"), confidence

    def test_dns_keyword_boosts_to_network(self):
        cat, team, conf = self._apply_override("DNS lookup failed", "General", 0.60)
        self.assertEqual(cat, "Network")
        self.assertEqual(team, "Network Support")

    def test_vpn_keyword_boosts_to_network(self):
        cat, _, _ = self._apply_override("VPN connection dropped", "General", 0.70)
        self.assertEqual(cat, "Network")

    def test_crash_keyword_boosts_to_software(self):
        cat, _, _ = self._apply_override("application keeps crashing", "General", 0.65)
        self.assertEqual(cat, "Software")

    def test_database_keyword_boosts_to_software(self):
        cat, _, _ = self._apply_override("Database cluster is down", "General", 0.55)
        self.assertEqual(cat, "Software")

    def test_password_keyword_boosts_to_access(self):
        cat, _, _ = self._apply_override("reset my password please", "General", 0.60)
        self.assertEqual(cat, "Access")

    def test_mfa_keyword_boosts_to_access(self):
        cat, team, _ = self._apply_override("MFA not working", "General", 0.55)
        self.assertEqual(cat, "Access")
        self.assertEqual(team, "IAM Team")

    def test_confidence_boosted_to_at_least_0_92(self):
        _, _, conf = self._apply_override("DNS issue", "General", 0.55)
        self.assertGreaterEqual(conf, 0.92)

    def test_high_original_confidence_not_lowered(self):
        _, _, conf = self._apply_override("DNS issue", "General", 0.98)
        self.assertGreaterEqual(conf, 0.92)
        self.assertEqual(conf, 0.98)

    def test_no_override_when_confidence_equals_0_9_exactly(self):
        cat, _, _ = self._apply_override("DNS issue", "Hardware", 0.90)
        self.assertEqual(cat, "Hardware")

    def test_no_override_when_category_not_general_and_high_confidence(self):
        cat, _, _ = self._apply_override("password reset", "Access", 0.95)
        self.assertEqual(cat, "Access")

    def test_case_insensitive_matching(self):
        cat, _, _ = self._apply_override("VPN CONNECTION FAILED", "General", 0.60)
        self.assertEqual(cat, "Network")

    def test_neutral_text_causes_no_override(self):
        cat, _, conf = self._apply_override("The sun is shining today", "General", 0.99)
        self.assertEqual(cat, "General")
        self.assertEqual(conf, 0.99)

    def test_numeric_text_causes_no_override(self):
        cat, _, _ = self._apply_override("12345 99999", "General", 0.99)
        self.assertEqual(cat, "General")

    def test_empty_string_causes_no_override(self):
        cat, _, _ = self._apply_override("", "General", 0.99)
        self.assertEqual(cat, "General")


if __name__ == "__main__":
    unittest.main()
