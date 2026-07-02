"""
AST-level tests for analyze_ticket → analyze_only delegation in main.py.
Splits concerns: file existence, function existence, call existence,
and current_user delegation (positional OR keyword).
"""

import ast
import pytest
from pathlib import Path


# ─── Source fixture ───────────────────────────────────────────────────────────
# FIX 8: Root resolved from this file's location once; all tests share it.
#         If test file moves, only this line changes.

_MAIN_PY = Path(__file__).resolve().parent
while not (_MAIN_PY / "backend" / "main.py").exists():
    parent = _MAIN_PY.parent
    if parent == _MAIN_PY:
        _MAIN_PY = None
        break
    _MAIN_PY = parent

# FIX 1: Skip entire module cleanly if main.py not found.
if _MAIN_PY is None:
    pytest.skip("backend/main.py not found — skipping AST tests",
                allow_module_level=True)

_MAIN_PATH = _MAIN_PY / "backend" / "main.py"


@pytest.fixture(scope="module")
def main_tree() -> ast.Module:
    """Parse main.py once; shared across all tests."""
    return ast.parse(_MAIN_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def top_level_names(main_tree) -> set[str]:
    """All top-level function/async-function names in main.py."""
    return {
        node.name
        for node in main_tree.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }


# ─── FIX 9: analyze_only existence ───────────────────────────────────────────

def test_analyze_only_defined_in_main(top_level_names):
    assert "analyze_only" in top_level_names, (
        "analyze_only not found as top-level function in main.py"
    )


# ─── FIX 5+7: analyze_ticket existence (separate test) ───────────────────────

def test_analyze_ticket_defined_in_main(top_level_names):
    assert "analyze_ticket" in top_level_names, (
        "analyze_ticket not found as top-level async function in main.py"
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_analyze_ticket(tree: ast.Module) -> ast.AsyncFunctionDef:
    """
    FIX 2: Return analyze_ticket node or call pytest.fail with a clear message
    instead of letting next() raise an unreadable StopIteration.
    """
    for node in tree.body:
        if (
            isinstance(node, ast.AsyncFunctionDef)
            and node.name == "analyze_ticket"
            and any(arg.arg == "current_user" for arg in node.args.args)
        ):
            return node
    pytest.fail(
        "analyze_ticket(current_user=...) not found in main.py — "
        "function may have been renamed or current_user parameter removed"
    )


def _analyze_only_calls(fn: ast.AsyncFunctionDef) -> list[ast.Call]:
    """
    FIX 10: Collect ALL analyze_only calls via ast.walk (order irrelevant for
    existence check); return list so callers decide how to use it.
    """
    return [
        node
        for node in ast.walk(fn)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "analyze_only"
    ]


# ─── Delegation tests ─────────────────────────────────────────────────────────
# FIX 4: Check ALL calls, not just last one.

def test_analyze_ticket_calls_analyze_only(main_tree):
    """analyze_ticket must call analyze_only at least once."""
    fn = _get_analyze_ticket(main_tree)
    calls = _analyze_only_calls(fn)
    assert calls, "analyze_ticket never calls analyze_only"


def test_analyze_ticket_delegates_current_user(main_tree):
    """
    Every analyze_only call inside analyze_ticket must pass current_user
    either as a positional arg (ast.Name id=='current_user') or as a
    keyword arg (ast.keyword arg=='current_user').

    FIX 3: No hardcoded positional index — checks both positional and keyword.
    FIX 4: Checks ALL calls, not just the last one.
    FIX 6: Handles keyword argument delegation.
    """
    fn = _get_analyze_ticket(main_tree)
    calls = _analyze_only_calls(fn)
    assert calls, "analyze_ticket never calls analyze_only"

    for call in calls:
        positional_ok = any(
            isinstance(arg, ast.Name) and arg.id == "current_user"
            for arg in call.args
        )
        keyword_ok = any(
            kw.arg == "current_user"
            and isinstance(kw.value, ast.Name)
            and kw.value.id == "current_user"
            for kw in call.keywords
        )
        assert positional_ok or keyword_ok, (
            f"analyze_only call at line {call.lineno} does not pass current_user "
            f"(checked positional args and keyword args)"
        )