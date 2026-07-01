"""
Security tests: scan source files for hardcoded credential patterns.
Fails if any file contains hardcoded Supabase anon keys (JWT prefix "eyJ"),
hardcoded Supabase URLs embedded in code (not in .env.example or templates),
or passwords/secrets in source.

This test should run in CI to prevent credential leaks.
"""

import sys
import os
import re
import unittest
import fnmatch
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

PROJECT_ROOT = Path(__file__).parent.parent.parent

# Files/patterns that are explicitly allowed to reference credentials
# (templates, examples, test files, git-ignored env files)
ALLOWED_PATTERNS = [
    "*.env.example",
    "*.env.template",
    "test_env_security.py",  # this file
    "test_pii_redaction.py",  # test for PII redaction (contains fake JWT)
    "*.md",
    ".env",
    ".env.*",
    "*.lock",
    "package-lock.json",
    "*.png", "*.jpg", "*.ico", "*.svg", "*.woff", "*.ttf",
    "*.pyc",
    "SECURITY.md",
]

# Directories to skip entirely
SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".expo", "dist",
    "web-build", "build", ".venv", "venv", "env",
    "backend/models",  # binary model files
}

# Patterns that indicate hardcoded credentials
CREDENTIAL_PATTERNS = [
    # Supabase anon key prefix (JWT HS256)
    (
        re.compile(r'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+'),
        "Hardcoded Supabase JWT / anon key detected",
    ),
    # Supabase project URLs embedded as string literals in source (not env vars)
    # Matches patterns like: 'https://xxxx.supabase.co' (in quotes, not a variable assignment to be read from env)
    (
        re.compile(r'''(?:const|var|let)\s+\w+\s*=\s*['"][^'"]+\.supabase\.co['"]'''),
        "Hardcoded Supabase URL in variable assignment (use env var instead)",
    ),
    # Generic password assignment patterns
    (
        re.compile(r'''(?:password|passwd|secret)\s*=\s*['"][^'"]{8,}['"]''', re.IGNORECASE),
        "Possible hardcoded password/secret detected",
    ),
]

# Source file extensions to scan
SCAN_EXTENSIONS = {".js", ".ts", ".jsx", ".tsx", ".py", ".json", ".yaml", ".yml", ".env"}


def _should_skip(path: Path) -> bool:
    """Return True if this path should be excluded from scanning."""
    parts = path.parts
    for skip in SKIP_DIRS:
        skip_parts = tuple(skip.split("/"))
        for i in range(len(parts) - len(skip_parts) + 1):
            if parts[i:i + len(skip_parts)] == skip_parts:
                return True

    for pat in ALLOWED_PATTERNS:
        if fnmatch.fnmatch(path.name, pat):
            return True

    return False


def _scan_file(path: Path) -> list[tuple[int, str, str]]:
    """
    Scan a single file for credential patterns.
    Returns list of (line_number, matched_text, reason).
    """
    hits = []
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return hits

    lines = content.splitlines()
    for i, line in enumerate(lines, start=1):
        for pattern, reason in CREDENTIAL_PATTERNS:
            if pattern.search(line):
                hits.append((i, line.strip()[:120], reason))
    return hits


def collect_violations() -> list[tuple[str, int, str, str]]:
    """
    Walk the project tree and collect all credential pattern violations.
    Returns list of (relative_path, line_num, matched_text, reason).
    """
    violations = []
    for path in PROJECT_ROOT.rglob("*"):
        if path.is_dir():
            continue
        if path.suffix not in SCAN_EXTENSIONS:
            continue
        rel = path.relative_to(PROJECT_ROOT)
        if _should_skip(rel):
            continue

        hits = _scan_file(path)
        for line_num, text, reason in hits:
            violations.append((str(rel), line_num, text, reason))

    return violations


class TestNoHardcodedCredentials(unittest.TestCase):
    """Security scan: verify no hardcoded credentials exist in source files."""

    @classmethod
    def setUpClass(cls):
        cls.violations = collect_violations()

    def test_no_hardcoded_jwt_tokens(self):
        jwt_violations = [
            v for v in self.violations if "JWT" in v[3] or "anon key" in v[3]
        ]
        if jwt_violations:
            msg = "Hardcoded JWT/Supabase anon keys found:\n"
            for path, line, text, reason in jwt_violations:
                msg += f"  {path}:{line} — {reason}\n    {text}\n"
            self.fail(msg)

    def test_no_hardcoded_supabase_urls(self):
        url_violations = [
            v for v in self.violations if "Supabase URL" in v[3]
        ]
        if url_violations:
            msg = "Hardcoded Supabase URLs found:\n"
            for path, line, text, reason in url_violations:
                msg += f"  {path}:{line} — {reason}\n    {text}\n"
            self.fail(msg)

    def test_mobile_app_supabase_lib_uses_env_vars(self):
        supabase_lib = PROJECT_ROOT / "MobileApp" / "src" / "lib" / "supabase.js"
        if not supabase_lib.exists():
            self.skipTest("MobileApp/src/lib/supabase.js not found")
        content = supabase_lib.read_text(encoding="utf-8")
        # Must use process.env, not hardcoded strings
        self.assertIn("process.env", content,
                      "MobileApp/src/lib/supabase.js must read credentials from process.env")
        # Must NOT contain the leaked key prefix
        self.assertNotIn("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", content,
                         "Hardcoded JWT found in MobileApp/src/lib/supabase.js")

    def test_env_example_exists_for_mobile_app(self):
        env_example = PROJECT_ROOT / "MobileApp" / ".env.example"
        self.assertTrue(env_example.exists(),
                        "MobileApp/.env.example must exist as a template for developers")

    def test_env_example_contains_required_vars(self):
        env_example = PROJECT_ROOT / "MobileApp" / ".env.example"
        if not env_example.exists():
            self.skipTest(".env.example not found")
        content = env_example.read_text(encoding="utf-8")
        for var in ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"]:
            self.assertIn(var, content, f"{var} must be documented in .env.example")

    def test_mobile_gitignore_ignores_env_files(self):
        gitignore = PROJECT_ROOT / "MobileApp" / ".gitignore"
        if not gitignore.exists():
            self.skipTest("MobileApp/.gitignore not found")
        content = gitignore.read_text(encoding="utf-8")
        self.assertTrue(
            ".env" in content or ".env.*" in content,
            "MobileApp/.gitignore must exclude .env files"
        )

    def test_eas_json_uses_placeholder_not_real_key(self):
        eas_json = PROJECT_ROOT / "MobileApp" / "eas.json"
        if not eas_json.exists():
            self.skipTest("MobileApp/eas.json not found")
        content = eas_json.read_text(encoding="utf-8")
        # eas.json should not contain the leaked JWT
        self.assertNotIn(
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            content,
            "eas.json must not contain a hardcoded JWT/anon key"
        )


if __name__ == "__main__":
    unittest.main()
