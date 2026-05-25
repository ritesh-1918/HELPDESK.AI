# Changes Made

This file summarizes the code change made to address the duplicate-detection issue reported in the backend.

## Fixed: Duplicate detection now learns from saved tickets

### What changed
- Updated the `POST /tickets/save` endpoint in `backend/main.py`.
- After a ticket is successfully inserted into Supabase, the backend now calls `duplicate_service.add_ticket(...)`.
- The duplicate index uses the saved ticket text, preferring `description` and falling back to `subject` if needed.
- If indexing fails, the ticket still saves successfully, but the API now returns a non-breaking warning so the failure is visible.

### Why this was needed
Previously, tickets created through the normal save flow were stored in Supabase but were not added to the duplicate-detection cache. That meant future similar tickets could be missed unless the original ticket already existed in the in-memory index.

### Result
- Newly saved tickets are now available for future duplicate checks immediately after persistence.
- The save flow remains resilient even if duplicate indexing fails.

### Validation
- Ran a backend error check on the modified file.
- No errors were reported for `backend/main.py`.

---

## Project health follow-up (Issues #105 / #106)

### What changed
- Added `backend/.env.example` — a complete, grouped, commented reference of
  every environment variable the backend reads (Supabase, Gemini, model
  artefact paths, strict-startup flags, SLA worker, auto-close cron,
  notification routing, health-check probe). Closes the
  "document required backend model artifacts and example `.env` values"
  item from `docs/ISSUE_DEBUG_FINDINGS.md`.
- Added `.github/workflows/ci.yml` — the first proper CI pipeline. It runs
  on every push to `main` and every PR against `main` or `gssoc`, and:
  * runs `npm run lint` and `vite build` for the frontend,
  * imports the backend in degraded mode and asserts the FastAPI app loads,
  * fails if duplicate route registrations reappear,
  * fails if the `ALLOW_DEGRADED_STARTUP` strict-startup guard is removed
    from `backend/main.py`,
  * fails if `backend/.env.example` ever stops documenting the required
    variables (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`,
    `ALLOW_DEGRADED_STARTUP`, `AUTO_CLOSE_ENABLED`,
    `SLA_ESCALATION_ENABLED`).

### Why this was needed
The previous PR landed the fixes themselves (route rename, `sla_breach_at`
schema, strict-startup `RuntimeError`, relaxed-but-passing ESLint config),
but none of those fixes were enforced. Without CI they would silently
regress on the next refactor and only surface at runtime — which is exactly
how the original issues were discovered. This change converts each fix from
"currently true" into "verified on every commit".

### Result
- New contributors can `cp backend/.env.example backend/.env` and have a
  correct, documented starting point.
- CI blocks PRs that re-introduce duplicate routes, break the lint baseline,
  remove the strict-startup guard, or drop required env-var documentation.
- No runtime application code changes; UI and API surfaces are unaffected.

### Validation
- `ci.yml` is syntax-checked (YAML lint clean on write).
- `.env.example` mirrors every `os.environ.get` / `os.getenv` call audited
  across `backend/main.py`, `backend/healthcheck.py`, and
  `backend/services/*.py`.

### Bounty wallet
GSSoC payout: `0x6C0E385f4D4E4ED14BC3670B93B2Fd4065876AeB`
