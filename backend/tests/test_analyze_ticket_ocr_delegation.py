"""
AST tests for analyze_ticket OCR enrichment path in main.py.
Verifies: enriched model_copy update keys, analyze_only delegation
with enriched + current_user (positional OR keyword).
"""

import ast
import pytest
from pathlib import Path


# ─── Source resolution + skip guard ──────────────────────────────────────────
# FIX 1+2: Walk up from test file; skip cleanly if main.py absent.

def _find_main_py() -> Path | None:
    here = Path(__file__).resolve().parent
    while True:
        candidate = here / "main.py"
        if candidate.exists():
            return candidate
        parent = here.parent
        if parent == here:
            return None
        here = parent

_MAIN_PATH = _find_main_py()

if _MAIN_PATH is None:
    pytest.skip("main.py not found — skipping AST tests", allow_module_level=True)


# ─── Fixtures ─────────────────────────────────────────────────────────────────
# FIX 10: Parse once; all tests share the tree.

@pytest.fixture(scope="module")
def main_tree() -> ast.Module:
    return ast.parse(_MAIN_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def analyze_ticket_fn(main_tree) -> ast.AsyncFunctionDef:
    """
    FIX 3+11: pytest.fail() instead of AssertionError for both helpers.
    Returns the primary analyze_ticket node (the one that builds model_copy).
    """
    candidates = [
        node for node in main_tree.body
        if isinstance(node, ast.AsyncFunctionDef)
        and node.name == "analyze_ticket"
    ]
    if not candidates:
        pytest.fail("analyze_ticket async function not found in main.py")

    for node in candidates:
        has_model_copy = any(
            isinstance(child, ast.Call)
            and isinstance(child.func, ast.Attribute)
            and child.func.attr == "model_copy"
            for child in ast.walk(node)
        )
        if has_model_copy:
            return node

    pytest.fail(
        "No analyze_ticket overload that calls model_copy found — "
        "OCR enrichment path may have been removed or renamed"
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _name_in_call(call: ast.Call, name: str) -> bool:
    """
    FIX 5+6: True if `name` appears as any positional arg (ast.Name)
    OR as a keyword arg value (ast.Name), regardless of position.
    """
    positional = any(
        isinstance(a, ast.Name) and a.id == name for a in call.args
    )
    keyword = any(
        isinstance(kw.value, ast.Name) and kw.value.id == name
        for kw in call.keywords
    )
    return positional or keyword


def _get_update_dict(call: ast.Call) -> ast.Dict:
    """
    FIX 8: Return the ast.Dict for the update= keyword, or pytest.fail.
    Replaces bare next() which raises StopIteration on missing keyword.
    """
    for kw in call.keywords:
        if kw.arg == "update" and isinstance(kw.value, ast.Dict):
            return kw.value
    pytest.fail(
        f"model_copy call at line {call.lineno} has no update={{...}} keyword"
    )


# ─── model_copy update key tests ─────────────────────────────────────────────

def test_analyze_ticket_model_copy_update_contains_text_and_image_text(
    analyze_ticket_fn,
):
    """All model_copy calls must include 'text' and 'image_text' in update dict."""
    # FIX 7: check ALL model_copy calls, not just last.
    model_copy_calls = [
        node for node in ast.walk(analyze_ticket_fn)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "model_copy"
    ]
    assert model_copy_calls, "analyze_ticket builds no enriched request via model_copy"

    for call in model_copy_calls:
        update_dict = _get_update_dict(call)
        update_keys = {
            key.value
            for key in update_dict.keys
            if isinstance(key, ast.Constant)
        }
        assert {"text", "image_text"}.issubset(update_keys), (
            f"model_copy at line {call.lineno} update dict missing 'text' or "
            f"'image_text'. Found: {update_keys}"
        )


def test_analyze_ticket_model_copy_update_has_no_unexpected_keys(
    analyze_ticket_fn,
):
    """
    FIX 12: Complementary check — update dict must not contain keys outside
    the known set. Guards against stale/garbage keys being added silently.
    """
    _EXPECTED_UPDATE_KEYS = {"text", "image_text"}

    model_copy_calls = [
        node for node in ast.walk(analyze_ticket_fn)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "model_copy"
    ]
    for call in model_copy_calls:
        update_dict = _get_update_dict(call)
        update_keys = {
            key.value
            for key in update_dict.keys
            if isinstance(key, ast.Constant)
        }
        unexpected = update_keys - _EXPECTED_UPDATE_KEYS
        assert not unexpected, (
            f"model_copy at line {call.lineno} update dict has unexpected "
            f"keys: {unexpected}"
        )


# ─── analyze_only delegation tests ───────────────────────────────────────────

def test_analyze_ticket_calls_analyze_only(analyze_ticket_fn):
    """analyze_ticket must delegate to analyze_only at least once."""
    calls = [
        node for node in ast.walk(analyze_ticket_fn)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "analyze_only"
    ]
    assert calls, "analyze_ticket never calls analyze_only"


def test_analyze_ticket_delegates_enriched_to_analyze_only(analyze_ticket_fn):
    """
    FIX 4+5+6+9: ALL analyze_only calls must pass 'enriched' (pos or kwarg).
    """
    calls = [
        node for node in ast.walk(analyze_ticket_fn)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "analyze_only"
    ]
    assert calls, "analyze_ticket never calls analyze_only"

    for call in calls:
        assert _name_in_call(call, "enriched"), (
            f"analyze_only at line {call.lineno} does not pass 'enriched' "
            f"(checked positional and keyword args)"
        )


def test_analyze_ticket_delegates_current_user_to_analyze_only(analyze_ticket_fn):
    """
    FIX 4+5+6: ALL analyze_only calls must pass 'current_user' (pos or kwarg).
    """
    calls = [
        node for node in ast.walk(analyze_ticket_fn)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "analyze_only"
    ]
    assert calls, "analyze_ticket never calls analyze_only"

    for call in calls:
        assert _name_in_call(call, "current_user"), (
            f"analyze_only at line {call.lineno} does not pass 'current_user' "
            f"(checked positional and keyword args)"
        )