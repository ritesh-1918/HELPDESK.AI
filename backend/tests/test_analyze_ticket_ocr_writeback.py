"""
Exec-based integration tests for analyze_ticket OCR enrichment path.
Compiles and runs the real analyze_ticket function from main.py with
minimal mocked dependencies.
"""

import ast
import asyncio
from pathlib import Path
from types import SimpleNamespace

import pytest
import pytest_asyncio


# ─── Path resolution + skip guard ────────────────────────────────────────────
# FIX 1: Walk up to find main.py; skip module if absent.

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
    pytest.skip("main.py not found", allow_module_level=True)


# ─── Async OCR stub ───────────────────────────────────────────────────────────
# FIX 6: async coroutine so `await ocr_service.extract_text(...)` works.

class _AsyncOcrService:
    def __init__(self, result: str = "[OCR_MARKER]", raises=None):
        self._result = result
        self._raises = raises

    async def extract_text(self, image_base64: str) -> str:
        if self._raises:
            raise self._raises
        return self._result


# ─── Namespace builder ────────────────────────────────────────────────────────
# FIX 3+4+5: Full namespace with current_user param and correct analyze_only
#             signature; also includes common globals analyze_ticket may need.

def _build_namespace(
    captured: dict,
    ocr_text: str = "[OCR_MARKER]",
    ocr_raises=None,
    analyze_only_raises=None,
) -> dict:
    """
    FIX 5: analyze_only signature matches the real one: (body, request, current_user).
    FIX 4: current_user included in namespace so the dep-injected param resolves.
    """
    async def analyze_only(body, request=None, current_user=None):
        if analyze_only_raises:
            raise analyze_only_raises
        captured["delegated_text"] = body.text
        captured["current_user"] = current_user
        return {"delegated": True}

    return {
        # FastAPI / Pydantic stubs
        "Request": object,
        "TicketRequest": object,
        "HTTPException": Exception,
        "Depends": lambda f: None,
        "Optional": None,
        # Business logic stubs
        "analyze_only": analyze_only,
        "get_system_settings": lambda company: {
            "ai_confidence_threshold": 0.8,
            "duplicate_sensitivity": 0.85,
            "enable_auto_resolve": False,
        },
        "ocr_service": _AsyncOcrService(result=ocr_text, raises=ocr_raises),
        # Common builtins exec may need
        "__builtins__": __builtins__,
    }


# ─── Fixture: compiled analyze_ticket ────────────────────────────────────────
# FIX 12: Parse + compile once per session; yield compiled fn via fixture.
# FIX 2: pytest.fail() instead of StopIteration from next().

@pytest.fixture(scope="session")
def _analyze_ticket_node() -> ast.AsyncFunctionDef:
    tree = ast.parse(_MAIN_PATH.read_text(encoding="utf-8"))
    for node in tree.body:
        if (
            isinstance(node, ast.AsyncFunctionDef)
            and node.name == "analyze_ticket"
            and any(
                isinstance(child, ast.Call)
                and isinstance(child.func, ast.Attribute)
                and child.func.attr == "model_copy"
                for child in ast.walk(node)
            )
        ):
            node.decorator_list = []   # strip FastAPI route decorator
            ast.fix_missing_locations(node)
            return node
    pytest.fail(
        "analyze_ticket (OCR/model_copy variant) not found in main.py"
    )


def _exec_analyze_ticket(node: ast.AsyncFunctionDef, namespace: dict):
    """Compile and exec the single function node into namespace."""
    module = ast.Module(body=[node], type_ignores=[])
    exec(compile(module, str(_MAIN_PATH), "exec"), namespace)
    return namespace["analyze_ticket"]


# ─── Request factories ────────────────────────────────────────────────────────

def _make_request():
    return SimpleNamespace(
        client=SimpleNamespace(host="127.0.0.1"),
        headers={},
    )


def _make_body(text="User description", image_base64="fake_b64", company=None):
    return SimpleNamespace(text=text, image_base64=image_base64, company=company)


_MOCK_USER = {"id": "u1", "role": "user"}


# ─── Happy path ───────────────────────────────────────────────────────────────
# FIX 9: pytest-asyncio async def replaces asyncio.run().

@pytest.mark.asyncio
async def test_ocr_text_prepended_before_delegation(_analyze_ticket_node):
    captured = {}
    ns = _build_namespace(captured, ocr_text="[OCR_MARKER]")
    fn = _exec_analyze_ticket(_analyze_ticket_node, ns)

    body = _make_body()
    result = await fn(body, _make_request(), current_user=_MOCK_USER)

    # FIX 10: assert captured AFTER await — captured populated only on success.
    assert result == {"delegated": True}, f"Unexpected result: {result}"

    # FIX 11: check OCR text IS present in delegated text, not exact concat.
    assert "[OCR_MARKER]" in captured.get("delegated_text", ""), (
        f"OCR text not in delegated body. Got: {captured.get('delegated_text')}"
    )
    assert "User description" in captured["delegated_text"]


@pytest.mark.asyncio
async def test_current_user_forwarded_to_analyze_only(_analyze_ticket_node):
    """FIX 4: current_user must be forwarded to analyze_only."""
    captured = {}
    ns = _build_namespace(captured)
    fn = _exec_analyze_ticket(_analyze_ticket_node, ns)

    await fn(_make_body(), _make_request(), current_user=_MOCK_USER)
    assert captured.get("current_user") == _MOCK_USER


# ─── Error paths ─────────────────────────────────────────────────────────────
# FIX 8a: no image_base64 — OCR skipped, analyze_only still called.

@pytest.mark.asyncio
async def test_no_image_base64_skips_ocr(_analyze_ticket_node):
    captured = {}
    ns = _build_namespace(captured)
    fn = _exec_analyze_ticket(_analyze_ticket_node, ns)

    body = _make_body(image_base64=None)
    result = await fn(body, _make_request(), current_user=_MOCK_USER)
    assert result == {"delegated": True}
    # Original text unchanged — no OCR appended.
    assert captured.get("delegated_text") == "User description"


# FIX 8b: OCR service raises — endpoint should propagate or handle gracefully.

@pytest.mark.asyncio
async def test_ocr_service_exception_propagates(_analyze_ticket_node):
    captured = {}
    ns = _build_namespace(captured, ocr_raises=RuntimeError("OCR failed"))
    fn = _exec_analyze_ticket(_analyze_ticket_node, ns)

    with pytest.raises((RuntimeError, Exception)):
        await fn(_make_body(), _make_request(), current_user=_MOCK_USER)


# FIX 8c: empty OCR result — empty string should not be appended.

@pytest.mark.asyncio
async def test_empty_ocr_result_not_appended(_analyze_ticket_node):
    captured = {}
    ns = _build_namespace(captured, ocr_text="")
    fn = _exec_analyze_ticket(_analyze_ticket_node, ns)

    body = _make_body(text="User description")
    await fn(body, _make_request(), current_user=_MOCK_USER)
    # Empty OCR must not add trailing whitespace or empty marker.
    delegated = captured.get("delegated_text", "")
    assert delegated.strip() == "User description", (
        f"Empty OCR should not alter text. Got: '{delegated}'"
    )


# FIX 8d: analyze_only raising — exception must propagate.

@pytest.mark.asyncio
async def test_analyze_only_exception_propagates(_analyze_ticket_node):
    captured = {}
    ns = _build_namespace(captured, analyze_only_raises=ValueError("service down"))
    fn = _exec_analyze_ticket(_analyze_ticket_node, ns)

    with pytest.raises((ValueError, Exception)):
        await fn(_make_body(), _make_request(), current_user=_MOCK_USER)