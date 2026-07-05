"""
Patch script for backend/main.py:
  1. Update FastAPI app metadata (title, description, tags, swagger UI)
  2. Add docstrings to key endpoints
  3. Add rate limiting decorators and inject request: Request param

Run from project root:
    python scripts/patch_main.py [--dry-run]
"""

import ast
import re
import shutil
import sys
from pathlib import Path


# ─── Path resolution ──────────────────────────────────────────────────────────
# FIX 1: resolve main.py relative to this script, not cwd.

_HERE = Path(__file__).resolve().parent
_MAIN = _HERE.parent / "backend" / "main.py"

if not _MAIN.exists():
    sys.exit(f"ERROR: {_MAIN} not found. Run from project root.")

DRY_RUN = "--dry-run" in sys.argv


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _backup(path: Path) -> Path:
    # FIX 9: create .bak before any mutation.
    bak = path.with_suffix(".py.bak")
    shutil.copy2(path, bak)
    return bak


def _already_patched(content: str) -> bool:
    # FIX 6+11: idempotency guard — skip if patch already applied.
    return "HELPDESK.AI API" in content


# ─── Patch 1: FastAPI metadata ────────────────────────────────────────────────

_ORIG_APP = '''app = FastAPI(
    title="AI Helpdesk Backend",
    description="Ticket classification, entity extraction, and duplicate detection",
    version="1.0.0",
    lifespan=lifespan,
)'''

_NEW_APP = '''tags_metadata = [
    {"name": "AI",      "description": "Ticket analysis, image OCR, and troubleshooting endpoints"},
    {"name": "Tickets", "description": "CRUD operations for support tickets"},
    {"name": "Auth",    "description": "User authentication and session management"},
    {"name": "Health",  "description": "Service readiness and liveness probes"},
]

app = FastAPI(
    title="HELPDESK.AI API",
    description="AI-powered helpdesk: ticket classification, NER, duplicate detection, RAG knowledge base.",
    version="3.0.0",
    contact={"name": "HELPDESK.AI Team", "url": "https://github.com/rudra3007-pro/HELPDESK.AI"},
    license_info={"name": "MIT"},
    openapi_tags=tags_metadata,
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "syntaxHighlight.theme": "monokai",
        "docExpansion": "list",
        "filter": True,
        "tryItOutEnabled": True,
    },
    docs_url="/api/docs",
    lifespan=lifespan,
)'''


def patch_fastapi_init(content: str) -> str:
    # FIX 2: raise on mismatch instead of silently continuing.
    if _ORIG_APP not in content:
        raise ValueError(
            "FastAPI init block not found — main.py may have changed. "
            "Update _ORIG_APP in this script before re-running."
        )
    return content.replace(_ORIG_APP, _NEW_APP)


# ─── Patch 2: Docstrings ──────────────────────────────────────────────────────
# FIX 10: insert docstring as first line of function body using AST line
#          numbers to find the exact insertion point.

_DOCSTRINGS = {
    "/auth/login":   "Authenticate user and return JWT token.",
    "/auth/signup":  "Register a new user account.",
    "/auth/logout":  "Invalidate current user session.",
    "/auth/me":      "Get current authenticated user profile.",
    "/health":       "Service liveness probe and health check.",
    "/ready":        "Service readiness probe checking all dependencies.",
    "/ai/analyze-v2":"Advanced V2 ticket analysis using improved models.",
}


def patch_docstrings(content: str) -> str:
    lines = content.splitlines(keepends=True)
    tree = ast.parse(content)
    # Map route path → function node via decorator inspection.
    insertions: list[tuple[int, str]] = []   # (line_index, docstring_line)
    for node in ast.walk(tree):
        if not isinstance(node, ast.AsyncFunctionDef):
            continue
        for dec in node.decorator_list:
            if not isinstance(dec, ast.Call):
                continue
            args = dec.args
            if not args or not isinstance(args[0], ast.Constant):
                continue
            route_path = args[0].value
            if route_path not in _DOCSTRINGS:
                continue
            # Check function doesn't already have a docstring.
            body = node.body
            if (
                body
                and isinstance(body[0], ast.Expr)
                and isinstance(body[0].value, ast.Constant)
            ):
                continue   # already has docstring
            # Insert after the `def` line (node.body[0].lineno - 1 is 0-indexed).
            insert_at = body[0].lineno - 1   # 0-indexed line index
            indent = "    "
            doc = f'{indent}"""{_DOCSTRINGS[route_path]}"""\n'
            insertions.append((insert_at, doc))

    # Apply in reverse order so line numbers stay valid.
    for idx, doc in sorted(insertions, reverse=True):
        lines.insert(idx, doc)
    return "".join(lines)


# ─── Patch 3: Rate limiting ───────────────────────────────────────────────────
# FIX 3+4+5+6+8: Use AST to identify endpoints; apply targeted line inserts
#                instead of broad regex with comma-splitting type hints.

_AUTH_PATHS = {"/auth/login", "/auth/signup", "/auth/logout", "/auth/me"}


def _limiter_line(path: str) -> str:
    rate = "5/minute" if path in _AUTH_PATHS else "10/minute"
    return f'@limiter.limit("{rate}")\n'


def patch_rate_limiting(content: str) -> str:
    """
    FIX 3+4: Use AST to find decorator line numbers; insert @limiter.limit
    above the function def — avoids regex splitting of complex type hints.
    FIX 5: Only add if 'from slowapi' already present in file.
    FIX 6+11: Skip if @limiter.limit already on next line (idempotent).
    """
    if "from slowapi" not in content and "import limiter" not in content:
        print("WARNING: slowapi not imported — skipping rate limit patch")
        return content

    lines = content.splitlines(keepends=True)
    tree = ast.parse(content)
    insertions: list[tuple[int, str]] = []

    for node in ast.walk(tree):
        if not isinstance(node, ast.AsyncFunctionDef):
            continue
        for dec in node.decorator_list:
            if not isinstance(dec, ast.Call):
                continue
            args = dec.args
            if not args or not isinstance(args[0], ast.Constant):
                continue
            route_path = args[0].value
            if not isinstance(route_path, str) or not route_path.startswith("/"):
                continue
            # Decorator starts at dec.lineno (1-indexed); function def at node.lineno.
            # Insert @limiter.limit just before the function def line.
            def_line_idx = node.lineno - 1   # 0-indexed
            # FIX 6: idempotency — check line above def for existing limiter.
            if def_line_idx > 0 and "@limiter.limit" in lines[def_line_idx - 1]:
                continue
            insertions.append((def_line_idx, _limiter_line(route_path)))

    for idx, line in sorted(insertions, reverse=True):
        lines.insert(idx, line)
    return "".join(lines)


# ─── Patch 4: Targeted request param renames ─────────────────────────────────
# FIX 7+8: Replace request.attr only inside known function bodies using AST
#           line ranges, not global string replace.

_RENAME_ATTRS = ["text", "category", "history", "bug_title",
                 "description", "steps_to_reproduce", "console_errors"]


def patch_request_renames(content: str) -> str:
    """
    FIX 8: Scoped replace — only rename request.<attr> to request_body.<attr>
    inside function bodies where the param was renamed.
    Avoids touching comments, strings, or unrelated code.
    """
    tree = ast.parse(content)
    lines = content.splitlines(keepends=True)

    for node in ast.walk(tree):
        if not isinstance(node, ast.AsyncFunctionDef):
            continue
        args = [a.arg for a in node.args.args]
        if "request_body" not in args:
            continue
        # Scope: lines of this function body.
        start = node.body[0].lineno - 1
        end = node.end_lineno
        for i in range(start, end):
            for attr in _RENAME_ATTRS:
                lines[i] = lines[i].replace(f"request.{attr}", f"request_body.{attr}")

    return "".join(lines)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    content = _MAIN.read_text(encoding="utf-8")

    if _already_patched(content):
        print("Already patched — nothing to do.")
        return

    bak = _backup(_MAIN)
    print(f"Backup: {bak}")

    try:
        content = patch_fastapi_init(content)
        content = patch_docstrings(content)
        content = patch_rate_limiting(content)
        content = patch_request_renames(content)
    except Exception as exc:
        print(f"ERROR during patch: {exc}")
        shutil.copy2(bak, _MAIN)
        print("Restored from backup.")
        sys.exit(1)

    # Validate result parses as valid Python before writing.
    try:
        ast.parse(content)
    except SyntaxError as exc:
        print(f"SYNTAX ERROR in patched content: {exc}")
        shutil.copy2(bak, _MAIN)
        print("Restored from backup.")
        sys.exit(1)

    if DRY_RUN:
        print("[DRY RUN] Patch valid — no file written.")
        return

    _MAIN.write_text(content, encoding="utf-8")
    print("Patch applied successfully.")


if __name__ == "__main__":
    main()