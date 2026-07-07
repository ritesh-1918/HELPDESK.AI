#!/usr/bin/env bash
# ============================================================
# Pre-commit / CI check: ensure no secret files are staged.
# Run manually:  bash scripts/check-no-secrets.sh
# Or wire into a pre-commit hook:
#   ln -s ../../scripts/check-no-secrets.sh .git/hooks/pre-commit
# ============================================================

set -euo pipefail

FAIL=0

# ── 1. Check staged files for .env files ────────────────────
echo "Checking staged files for .env patterns..."
STAGED_ENV=$(git diff --cached --name-only 2>/dev/null | grep -E '(^|/)\.(env)(\.|$)' || true)
if [ -n "$STAGED_ENV" ]; then
  echo "ERROR: Staged .env file(s) detected:"
  echo "$STAGED_ENV" | sed 's/^/  - /'
  FAIL=1
fi

# ── 2. Scan staged content for secret patterns ──────────────
echo "Scanning staged content for secret patterns..."

# Supabase JWT tokens (eyJ...)
SUPABASE_LEAK=$(git diff --cached 2>/dev/null | grep '^\+' | grep -E 'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}' | grep -v 'REPLACE_ME' || true)
if [ -n "$SUPABASE_LEAK" ]; then
  echo "ERROR: Possible Supabase JWT token found in staged diff."
  echo "  If this is intentional (e.g., .env.example with a placeholder), add 'REPLACE_ME' to the value."
  FAIL=1
fi

# Generic API keys starting with AIza (Google)
GOOGLE_KEY_LEAK=$(git diff --cached 2>/dev/null | grep '^\+' | grep -E 'AIza[0-9A-Za-z_-]{35}' | grep -v 'REPLACE_ME' || true)
if [ -n "$GOOGLE_KEY_LEAK" ]; then
  echo "ERROR: Possible Google API key found in staged diff (starts with AIza...)."
  FAIL=1
fi

# Private key headers
PEM_LEAK=$(git diff --cached 2>/dev/null | grep '^\+' | grep -E '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' || true)
if [ -n "$PEM_LEAK" ]; then
  echo "ERROR: Private key material found in staged diff."
  FAIL=1
fi

# AWS access key pattern
AWS_LEAK=$(git diff --cached 2>/dev/null | grep '^\+' | grep -E 'AKIA[0-9A-Z]{16}' || true)
if [ -n "$AWS_LEAK" ]; then
  echo "ERROR: Possible AWS access key found in staged diff."
  FAIL=1
fi

# ── 3. Check .gitignore covers all .env variants ────────────
echo "Verifying .gitignore covers .env variants..."
GITIGNORE=".gitignore"
REQUIRED_PATTERNS=(
  ".env"
  ".env.local"
  "backend/.env"
  "Frontend/.env"
  "MobileApp/.env"
)
for pat in "${REQUIRED_PATTERNS[@]}"; do
  if ! grep -qF "$pat" "$GITIGNORE" 2>/dev/null; then
    echo "WARNING: .gitignore is missing pattern: $pat"
  fi
done

# ── Result ───────────────────────────────────────────────────
if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "Secret check FAILED. Commit blocked."
  echo "Remove the secret before committing. If it is a placeholder,"
  echo "make sure it contains the string 'REPLACE_ME'."
  exit 1
fi

echo "Secret check passed — no leaked credentials detected."
exit 0
