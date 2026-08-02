"""
Test suite for backend/services/classifier_service.py (Issue #1152 - v2).

Covers:
- All PRIORITY_MAP subcategories verify correct priority one by one
- TEAM_MAP lookup for all four categories
- AUTO_RESOLVE_SUBS exact membership check for each item
- DerivationLogicDirect tests for 10+ ticket scenarios
"""

import sys
import os
import types
import importlib.util
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Stub torch and transformers dependencies
for mod_name in ["torch", "torch.nn.functional", "transformers"]:
    if mod_name not in sys.modules:
        sys.modules[mod_name] = types.ModuleType(mod_name)

tf_mod = sys.modules["transformers"]
tf_mod.DistilBertTokenizerFast = MagicMock()
tf_mod.DistilBertForSequenceClassification = MagicMock()

# Stub cache_service
cs_mod = types.ModuleType("backend.services.cache_service")
cache_mock = MagicMock()
cache_mock.get = MagicMock(return_value=None)
cache_mock.set = MagicMock()
cs_mod.cache_service = cache_mock
sys.modules["backend.services.cache_service"] = cs_mod

# Stub metrics
for mod_name in ["backend.services.metrics_service"]:
    if mod_name not in sys.modules:
        m = types.ModuleType(mod_name)
        sys.modules[mod_name] = m

# Load the real module bypassing conftest stub
sys.modules.pop("backend.services.classifier_service", None)
_spec = importlib.util.spec_from_file_location(
    "classifier_service_real",
    os.path.join(os.path.dirname(__file__), "..", "services", "classifier_service.py")
)
_clf_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_clf_module)

PRIORITY_MAP = _clf_module.PRIORITY_MAP
TEAM_MAP = _clf_module.TEAM_MAP
AUTO_RESOLVE_SUBS = _clf_module.AUTO_RESOLVE_SUBS
ClassifierService = _clf_module.ClassifierService


# ---------------------------------------------------------------------------
# PRIORITY_MAP - verify every subcategory maps to correct priority
# ---------------------------------------------------------------------------

class TestPriorityMapCritical:
    def test_blue_screen_is_critical(self):
        assert PRIORITY_MAP["Blue Screen"] == "Critical"

    def test_overheating_is_critical(self):
        assert PRIORITY_MAP["Overheating"] == "Critical"

    def test_data_loss_is_critical(self):
        assert PRIORITY_MAP["Data Loss"] == "Critical"

    def test_hardware_failure_is_critical(self):
        assert PRIORITY_MAP["Hardware Failure"] == "Critical"


class TestPriorityMapHigh:
    def test_application_crash_is_high(self):
        assert PRIORITY_MAP["Application Crash"] == "High"

    def test_login_failure_is_high(self):
        assert PRIORITY_MAP["Login Failure"] == "High"

    def test_password_reset_is_high(self):
        assert PRIORITY_MAP["Password Reset"] == "High"

    def test_vpn_connection_is_high(self):
        assert PRIORITY_MAP["VPN Connection"] == "High"

    def test_firewall_block_is_high(self):
        assert PRIORITY_MAP["Firewall Block"] == "High"

    def test_dns_problem_is_high(self):
        assert PRIORITY_MAP["DNS Problem"] == "High"

    def test_mfa_problem_is_high(self):
        assert PRIORITY_MAP["MFA Problem"] == "High"

    def test_account_expired_is_high(self):
        assert PRIORITY_MAP["Account Expired"] == "High"


class TestPriorityMapMedium:
    def test_permission_issue_is_medium(self):
        assert PRIORITY_MAP["Permission Issue"] == "Medium"

    def test_access_request_is_medium(self):
        assert PRIORITY_MAP["Access Request"] == "Medium"

    def test_software_install_is_medium(self):
        assert PRIORITY_MAP["Software Install"] == "Medium"

    def test_update_problem_is_medium(self):
        assert PRIORITY_MAP["Update Problem"] == "Medium"

    def test_compatibility_is_medium(self):
        assert PRIORITY_MAP["Compatibility"] == "Medium"

    def test_configuration_is_medium(self):
        assert PRIORITY_MAP["Configuration"] == "Medium"

    def test_license_issue_is_medium(self):
        assert PRIORITY_MAP["License Issue"] == "Medium"

    def test_performance_is_medium(self):
        assert PRIORITY_MAP["Performance"] == "Medium"

    def test_internet_slow_is_medium(self):
        assert PRIORITY_MAP["Internet Slow"] == "Medium"

    def test_wifi_issue_is_medium(self):
        assert PRIORITY_MAP["WiFi Issue"] == "Medium"

    def test_remote_access_is_medium(self):
        assert PRIORITY_MAP["Remote Access"] == "Medium"

    def test_proxy_error_is_medium(self):
        assert PRIORITY_MAP["Proxy Error"] == "Medium"

    def test_network_drive_is_medium(self):
        assert PRIORITY_MAP["Network Drive"] == "Medium"

    def test_role_change_is_medium(self):
        assert PRIORITY_MAP["Role Change"] == "Medium"


class TestPriorityMapLow:
    def test_account_unlock_is_low(self):
        assert PRIORITY_MAP["Account Unlock"] == "Low"

    def test_keyboard_mouse_is_low(self):
        assert PRIORITY_MAP["Keyboard/Mouse"] == "Low"

    def test_monitor_problem_is_low(self):
        assert PRIORITY_MAP["Monitor Problem"] == "Low"

    def test_printer_error_is_low(self):
        assert PRIORITY_MAP["Printer Error"] == "Low"

    def test_battery_issue_is_low(self):
        assert PRIORITY_MAP["Battery Issue"] == "Low"

    def test_laptop_issue_is_low(self):
        assert PRIORITY_MAP["Laptop Issue"] == "Low"


class TestPriorityMapCompleteness:
    def test_all_values_are_valid_priorities(self):
        valid = {"Critical", "High", "Medium", "Low"}
        for sub, priority in PRIORITY_MAP.items():
            assert priority in valid, f"{sub} has invalid priority {priority}"

    def test_priority_map_has_minimum_entries(self):
        assert len(PRIORITY_MAP) >= 20

    def test_no_none_values(self):
        for sub, priority in PRIORITY_MAP.items():
            assert priority is not None


# ---------------------------------------------------------------------------
# TEAM_MAP - all four categories
# ---------------------------------------------------------------------------

class TestTeamMap:
    def test_access_maps_to_iam_team(self):
        assert TEAM_MAP["Access"] == "IAM Team"

    def test_network_maps_to_network_support(self):
        assert TEAM_MAP["Network"] == "Network Support"

    def test_software_maps_to_application_support(self):
        assert TEAM_MAP["Software"] == "Application Support"

    def test_hardware_maps_to_hardware_support(self):
        assert TEAM_MAP["Hardware"] == "Hardware Support"

    def test_team_map_has_exactly_four_entries(self):
        assert len(TEAM_MAP) == 4

    def test_all_team_map_values_are_strings(self):
        for cat, team in TEAM_MAP.items():
            assert isinstance(team, str)

    def test_all_team_map_keys_are_strings(self):
        for cat in TEAM_MAP.keys():
            assert isinstance(cat, str)


# ---------------------------------------------------------------------------
# AUTO_RESOLVE_SUBS - exact membership
# ---------------------------------------------------------------------------

class TestAutoResolveSubs:
    def test_password_reset_in_auto_resolve(self):
        assert "Password Reset" in AUTO_RESOLVE_SUBS

    def test_account_unlock_in_auto_resolve(self):
        assert "Account Unlock" in AUTO_RESOLVE_SUBS

    def test_software_install_in_auto_resolve(self):
        assert "Software Install" in AUTO_RESOLVE_SUBS

    def test_wifi_issue_in_auto_resolve(self):
        assert "WiFi Issue" in AUTO_RESOLVE_SUBS

    def test_printer_error_in_auto_resolve(self):
        assert "Printer Error" in AUTO_RESOLVE_SUBS

    def test_monitor_problem_in_auto_resolve(self):
        assert "Monitor Problem" in AUTO_RESOLVE_SUBS

    def test_is_set_type(self):
        assert isinstance(AUTO_RESOLVE_SUBS, (set, frozenset))

    def test_data_loss_not_in_auto_resolve(self):
        assert "Data Loss" not in AUTO_RESOLVE_SUBS

    def test_blue_screen_not_in_auto_resolve(self):
        assert "Blue Screen" not in AUTO_RESOLVE_SUBS

    def test_application_crash_not_in_auto_resolve(self):
        assert "Application Crash" not in AUTO_RESOLVE_SUBS

    def test_minimum_6_items_in_auto_resolve(self):
        assert len(AUTO_RESOLVE_SUBS) >= 6


# ---------------------------------------------------------------------------
# DerivationLogicDirect - test priority/team/auto_resolve derivation
# (Pure logic tests using PRIORITY_MAP, TEAM_MAP, AUTO_RESOLVE_SUBS)
# ---------------------------------------------------------------------------

class TestDerivationLogic:
    """Test the derivation logic for 10+ ticket scenarios."""

    def _derive(self, category, subcategory):
        priority = PRIORITY_MAP.get(subcategory, "Medium")
        team = TEAM_MAP.get(category, "General Support")
        auto_resolve = subcategory in AUTO_RESOLVE_SUBS
        return {"priority": priority, "team": team, "auto_resolve": auto_resolve}

    def test_vpn_connection_derives_high_priority_network(self):
        result = self._derive("Network", "VPN Connection")
        assert result["priority"] == "High"
        assert result["team"] == "Network Support"
        assert result["auto_resolve"] is False

    def test_password_reset_derives_high_priority_auto_resolve(self):
        result = self._derive("Access", "Password Reset")
        assert result["priority"] == "High"
        assert result["team"] == "IAM Team"
        assert result["auto_resolve"] is True

    def test_software_install_derives_medium_auto_resolve(self):
        result = self._derive("Software", "Software Install")
        assert result["priority"] == "Medium"
        assert result["team"] == "Application Support"
        assert result["auto_resolve"] is True

    def test_blue_screen_derives_critical_not_auto_resolve(self):
        result = self._derive("Hardware", "Blue Screen")
        assert result["priority"] == "Critical"
        assert result["team"] == "Hardware Support"
        assert result["auto_resolve"] is False

    def test_printer_error_derives_low_auto_resolve(self):
        result = self._derive("Hardware", "Printer Error")
        assert result["priority"] == "Low"
        assert result["team"] == "Hardware Support"
        assert result["auto_resolve"] is True

    def test_account_unlock_derives_low_iam_auto_resolve(self):
        result = self._derive("Access", "Account Unlock")
        assert result["priority"] == "Low"
        assert result["team"] == "IAM Team"
        assert result["auto_resolve"] is True

    def test_firewall_block_derives_high_network_not_auto_resolve(self):
        result = self._derive("Network", "Firewall Block")
        assert result["priority"] == "High"
        assert result["team"] == "Network Support"
        assert result["auto_resolve"] is False

    def test_data_loss_derives_critical_not_auto_resolve(self):
        result = self._derive("Hardware", "Data Loss")
        assert result["priority"] == "Critical"
        assert result["auto_resolve"] is False

    def test_mfa_problem_derives_high_iam(self):
        result = self._derive("Access", "MFA Problem")
        assert result["priority"] == "High"
        assert result["team"] == "IAM Team"

    def test_wifi_issue_derives_medium_auto_resolve(self):
        result = self._derive("Network", "WiFi Issue")
        assert result["priority"] == "Medium"
        assert result["team"] == "Network Support"
        assert result["auto_resolve"] is True

    def test_performance_derives_medium_software(self):
        result = self._derive("Software", "Performance")
        assert result["priority"] == "Medium"
        assert result["team"] == "Application Support"

    def test_laptop_issue_derives_low_hardware(self):
        result = self._derive("Hardware", "Laptop Issue")
        assert result["priority"] == "Low"
        assert result["team"] == "Hardware Support"


# ---------------------------------------------------------------------------
# ClassifierService init
# ---------------------------------------------------------------------------

class TestClassifierServiceInit:
    def test_loaded_is_false(self):
        svc = ClassifierService()
        assert svc._loaded is False

    def test_model_is_none(self):
        svc = ClassifierService()
        assert svc.model is None

    def test_tokenizer_is_none(self):
        svc = ClassifierService()
        assert svc.tokenizer is None

    def test_id2label_is_none(self):
        svc = ClassifierService()
        assert svc.id2label is None
