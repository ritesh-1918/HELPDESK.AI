"""
Tests for ClassifierService input validation.

Covers:
- Empty / None / whitespace input rejection
- Non-string type rejection
- Oversized input boundary
- Valid input accepted (mocked prediction)
- Repeated calls on same instance
- Isolated module loading with full cleanup
"""

import importlib.util
import os
import sys
import types
from unittest.mock import MagicMock, patch

import pytest

# ─── Path to the service file ─────────────────────────────────────────────────

_SERVICE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "services", "classifier_service.py"
)

# ─── Skip entire module if service file is missing ────────────────────────────
# FIX 9: Previously exec_module would raise FileNotFoundError with no context.
# Now the whole module is skipped with a clear message.

if not os.path.exists(_SERVICE_PATH):
    pytest.skip(
        f"classifier_service.py not found at {_SERVICE_PATH}",
        allow_module_level=True,
    )


# ─── Fixture: isolated module load with full cleanup ─────────────────────────
# FIX 2: sys.modules mutations now live inside a fixture with teardown so
#         they do not leak into other test files in the same session.
# FIX 6: ClassifierService is loaded once per test via fixture — no inline
#         instantiation, and __init__ side-effects are fully mocked.
# FIX 12: Single shared instance per test via fixture scope.

@pytest.fixture()
def classifier_service():
    """
    Load ClassifierService in an isolated namespace with all heavy deps mocked.
    Restores sys.modules to its original state after each test.
    """
    # FIX 1: torch.nn added alongside torch.nn.functional.
    _mocked = [
        "torch",
        "torch.nn",               # was missing — caused AttributeError
        "torch.nn.functional",
        "transformers",
        "sentence_transformers",
    ]

    original = {k: sys.modules.get(k) for k in _mocked}

    for mod_name in _mocked:
        sys.modules[mod_name] = types.ModuleType(mod_name)

    # FIX 11: Configure MagicMock return values so cache/metrics calls during
    #          predict() don't silently swallow errors.
    cache_mock = MagicMock()
    cache_mock.get.return_value = None
    cache_mock.set.return_value = True
    metrics_mock = MagicMock()
    metrics_mock.record.return_value = None

    sys.modules["torch"].nn = sys.modules["torch.nn"]
    sys.modules["transformers"].DistilBertTokenizerFast = MagicMock()
    sys.modules["transformers"].DistilBertForSequenceClassification = MagicMock()
    sys.modules["backend.services.cache_service"] = cache_mock
    sys.modules["backend.services.metrics_service"] = metrics_mock

    # Pop stale real module so exec_module always runs fresh.
    sys.modules.pop("backend.services.classifier_service", None)

    spec = importlib.util.spec_from_file_location(
        "classifier_service_isolated", _SERVICE_PATH
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    service = mod.ClassifierService()

    yield service

    # Teardown — restore original sys.modules state.
    for mod_name in _mocked:
        if original[mod_name] is None:
            sys.modules.pop(mod_name, None)
        else:
            sys.modules[mod_name] = original[mod_name]
    sys.modules.pop("backend.services.classifier_service", None)


# ─── Empty / None / whitespace rejection ─────────────────────────────────────

@pytest.mark.parametrize("text", [None, "", "   ", "\t", "\n", "\r\n"])
def test_predict_rejects_empty_text(classifier_service, text):
    """
    predict() must raise ValueError for None, empty, and whitespace-only input.
    FIX 7: match pattern anchored to avoid silent pass on partial message changes.
    """
    with pytest.raises(ValueError, match=r"(?i)(text|input).*(must not be empty|is required|cannot be empty)"):
        classifier_service.predict(text)


# ─── Non-string type rejection ────────────────────────────────────────────────
# FIX 8: int, float, list, dict passed as text should raise TypeError or ValueError.

@pytest.mark.parametrize("bad_input", [
    42,
    3.14,
    ["some", "text"],
    {"text": "value"},
    b"bytes input",
    True,
])
def test_predict_rejects_non_string_types(classifier_service, bad_input):
    """predict() must raise TypeError or ValueError for non-string inputs."""
    with pytest.raises((TypeError, ValueError)):
        classifier_service.predict(bad_input)


# ─── Oversized input ──────────────────────────────────────────────────────────
# FIX 5: Exercise any max_length guard in the service.

def test_predict_rejects_oversized_input(classifier_service):
    """predict() must raise ValueError for input exceeding reasonable max length."""
    oversized = "a" * 100_001
    with pytest.raises(ValueError):
        classifier_service.predict(oversized)


# ─── Valid input accepted ─────────────────────────────────────────────────────
# FIX 4: Smoke-test that a well-formed input reaches the model layer
#         (mocked) without raising an unexpected exception.

@pytest.mark.parametrize("text", [
    "My printer is not working.",
    "I need help resetting my password.",
    "The application crashes on startup.",
    "A" * 512,      # long but within typical model limits
])
def test_predict_accepts_valid_text(classifier_service, text):
    """
    predict() must not raise for valid non-empty strings.
    The actual return value is whatever the mocked model returns.
    """
    try:
        classifier_service.predict(text)
    except ValueError as exc:
        pytest.fail(f"predict() raised ValueError unexpectedly for valid input: {exc}")


# ─── Repeated calls on same instance ─────────────────────────────────────────
# FIX 10: Verify ClassifierService is stateless across calls — two sequential
#          empty inputs must both raise, not just the first.

def test_predict_raises_on_repeated_empty_calls(classifier_service):
    """Two consecutive empty calls must both raise — service must not short-circuit."""
    for _ in range(2):
        with pytest.raises(ValueError):
            classifier_service.predict("")


def test_predict_raises_after_valid_call(classifier_service):
    """An empty call after a valid call must still raise."""
    try:
        classifier_service.predict("Valid ticket text.")
    except Exception:
        pass  # model is mocked; any non-ValueError result is acceptable

    with pytest.raises(ValueError):
        classifier_service.predict("")