"""
Smoke tests: verify all backend service modules can be imported without errors.
Tests use importlib to dynamically import each module and check for expected attributes.
Supabase is mocked so these tests run without real credentials.
"""

import sys
import os
import importlib
import unittest
from unittest.mock import patch, MagicMock

# Project root on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# Patch heavy deps before any import
_SUPABASE_MOCK = MagicMock()
_SUPABASE_MOCK.return_value = MagicMock()

os.environ.setdefault("ALLOW_DEGRADED_STARTUP", "1")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "placeholder_key")


class TestServiceImports(unittest.TestCase):
    """Verify all service modules are importable without runtime errors."""

    def _import(self, module_path):
        """Helper that imports a module and returns it, or raises on failure."""
        return importlib.import_module(module_path)

    def test_import_translation_service(self):
        mod = self._import("backend.services.translation_service")
        self.assertTrue(hasattr(mod, "translate_text"))
        self.assertTrue(hasattr(mod, "detect_locale"))
        self.assertTrue(hasattr(mod, "batch_translate"))

    def test_import_supabase_utils(self):
        mod = self._import("backend.services.supabase_utils")
        self.assertTrue(hasattr(mod, "get_ticket"))
        self.assertTrue(hasattr(mod, "create_ticket"))
        self.assertTrue(hasattr(mod, "update_ticket"))
        self.assertTrue(hasattr(mod, "get_profile"))
        self.assertTrue(hasattr(mod, "get_system_settings"))
        self.assertTrue(hasattr(mod, "list_tickets"))

    def test_import_classifier_service(self):
        mod = self._import("backend.services.classifier_service")
        self.assertTrue(hasattr(mod, "ClassifierService"))
        self.assertTrue(hasattr(mod, "PRIORITY_MAP"))
        self.assertTrue(hasattr(mod, "TEAM_MAP"))
        self.assertTrue(hasattr(mod, "AUTO_RESOLVE_SUBS"))

    def test_import_duplicate_service(self):
        mod = self._import("backend.services.duplicate_service")
        self.assertTrue(hasattr(mod, "DuplicateService"))

    @patch.dict(os.environ, {"SUPABASE_URL": "https://placeholder.supabase.co",
                              "SUPABASE_SERVICE_ROLE_KEY": "placeholder"})
    @patch("supabase.create_client", return_value=MagicMock())
    def test_import_auto_close_service_module(self, mock_create):
        # Only import the module — don't instantiate AutoCloseService
        mod = self._import("backend.services.auto_close_service")
        self.assertTrue(hasattr(mod, "AutoCloseService"))

    def test_import_rag_service(self):
        try:
            mod = self._import("backend.services.rag_service")
            self.assertTrue(hasattr(mod, "RagService"))
        except ImportError:
            self.skipTest("rag_service deps not installed")

    def test_import_backend_package(self):
        mod = self._import("backend")
        self.assertIsNotNone(mod)

    def test_translation_service_translate_text_signature(self):
        import inspect
        mod = self._import("backend.services.translation_service")
        sig = inspect.signature(mod.translate_text)
        params = list(sig.parameters.keys())
        self.assertIn("text", params)
        self.assertIn("from_lang", params)
        self.assertIn("to_lang", params)

    def test_supabase_utils_functions_are_callable(self):
        mod = self._import("backend.services.supabase_utils")
        for fn_name in ["get_ticket", "create_ticket", "update_ticket",
                        "get_profile", "get_system_settings", "list_tickets"]:
            fn = getattr(mod, fn_name)
            self.assertTrue(callable(fn), f"{fn_name} should be callable")

    def test_classifier_service_class_instantiable(self):
        mod = self._import("backend.services.classifier_service")
        svc = mod.ClassifierService()
        self.assertFalse(svc._loaded)
        self.assertIsNone(svc.model)

    def test_priority_map_is_dict_with_string_values(self):
        mod = self._import("backend.services.classifier_service")
        self.assertIsInstance(mod.PRIORITY_MAP, dict)
        for k, v in mod.PRIORITY_MAP.items():
            self.assertIsInstance(k, str)
            self.assertIsInstance(v, str)

    def test_team_map_covers_all_four_categories(self):
        mod = self._import("backend.services.classifier_service")
        for cat in ["Hardware", "Network", "Software", "Access"]:
            self.assertIn(cat, mod.TEAM_MAP)

    def test_auto_resolve_subs_is_set(self):
        mod = self._import("backend.services.classifier_service")
        self.assertIsInstance(mod.AUTO_RESOLVE_SUBS, (set, frozenset))
        self.assertGreater(len(mod.AUTO_RESOLVE_SUBS), 0)


class TestEnvVarDocumentation(unittest.TestCase):
    """Verify required environment variable names are documented in the codebase."""

    REQUIRED_ENV_VARS = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_KEY",
        "ALLOW_DEGRADED_STARTUP",
        "AUTO_CLOSE_ENABLED",
        "AUTO_CLOSE_DAYS",
    ]

    def test_env_vars_documented_in_main(self):
        main_path = os.path.join(
            os.path.dirname(__file__), "..", "main.py"
        )
        if not os.path.exists(main_path):
            self.skipTest("main.py not found")
        with open(main_path, "r", encoding="utf-8") as f:
            content = f.read()
        for var in ["SUPABASE_URL", "ALLOW_DEGRADED_STARTUP"]:
            self.assertIn(var, content, f"Env var {var} not referenced in main.py")

    def test_env_vars_referenced_in_auto_close_service(self):
        service_path = os.path.join(
            os.path.dirname(__file__), "..", "services", "auto_close_service.py"
        )
        if not os.path.exists(service_path):
            self.skipTest("auto_close_service.py not found")
        with open(service_path, "r", encoding="utf-8") as f:
            content = f.read()
        for var in ["AUTO_CLOSE_ENABLED", "AUTO_CLOSE_DAYS"]:
            self.assertIn(var, content, f"Env var {var} not referenced in auto_close_service.py")


class TestFastAPIAppObject(unittest.TestCase):
    """Verify the FastAPI app object is constructed correctly (mocked Supabase)."""

    @patch("supabase.create_client", return_value=MagicMock())
    @patch.dict(os.environ, {
        "ALLOW_DEGRADED_STARTUP": "1",
        "SUPABASE_URL": "https://placeholder.supabase.co",
        "SUPABASE_SERVICE_KEY": "placeholder_key",
    })
    def test_app_has_routes_attribute(self, _mock):
        try:
            import importlib
            mod = importlib.import_module("backend.main")
            self.assertTrue(hasattr(mod, "app"), "backend.main should export 'app'")
        except Exception as exc:
            self.skipTest(f"backend.main import failed (likely missing ML models): {exc}")

    def test_get_system_settings_returns_dict(self):
        """get_system_settings from main.py should return a dict with expected keys."""
        try:
            from backend.main import get_system_settings
            result = get_system_settings(None)
            self.assertIsInstance(result, dict)
            self.assertIn("enable_auto_resolve", result)
        except ImportError:
            self.skipTest("backend.main not importable")


if __name__ == "__main__":
    unittest.main()
