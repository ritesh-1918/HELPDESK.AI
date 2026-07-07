# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- AI-powered ticket response time estimator with SLA breach prediction
- Multi-language ticket support with auto-translation pipeline (HuggingFace NLP)
- Voice-to-ticket feature with speech recognition pipeline
- Weekly digest email report for admins with ticket trends
- Ticket export to PDF and CSV for admin dashboard
- Slack & Microsoft Teams webhook integration for critical ticket alerts
- WebSockets heartbeat and connection pooling for real-time dashboards
- Scroll-to-top button for improved user navigation
- Dedicated About Us page
- Google OAuth authentication
- AI-generated weekly digest email report
- Local backend environment setup & schema verification guide
- GSSoC migration troubleshooting reference for contributors validating schema changes

### Fixed
- Dashboard components not respecting dark mode (WelcomeCard, QuickActions, RecentTickets)
- Failing Slack notifier tests due to company placeholder casing
- Backend CI smoke test Python import error
- Environment variable name mismatch (VITE_API_URL vs VITE_BACKEND_URL)
- Password handling error in admin signup
- Authorization bypass via client-side persisted profile cache
- Hardcoded Supabase anon key in MobileApp source

### Changed
- Added .editorconfig for consistent editor settings
- Added .prettierrc configuration file
- Added .eslintrc.json for static analysis and linting
- Added pull request template
- Added CODE_OF_CONDUCT.md
- Added SECURITY.md policy file
- Setup markdownlint for documentation standards

### GSSoC Migration Troubleshooting Guide

Use this checklist when a Supabase migration, seed script, or schema-dependent
test fails during local GSSoC development.

#### 1. Confirm the migration order

- Ensure new SQL files use the timestamp prefix format in
  `supabase/migrations/`.
- Run migrations in ascending timestamp order so dependency tables, enums, and
  policies exist before later statements reference them.
- If a migration depends on a previous PR, rebase onto the latest `gssoc`
  branch before debugging local failures.

#### 2. Check environment variables

- Backend migrations and seed scripts require a valid `SUPABASE_URL`.
- Admin-only maintenance scripts should use `SUPABASE_SERVICE_KEY` or the
  service-role variable documented by the script.
- Frontend-only variables such as `VITE_SUPABASE_ANON_KEY` are not enough for
  backend migration verification.

#### 3. Validate SQL before running the full app

```bash
git status --short
rg -n "create table|alter table|create policy|drop table" supabase/migrations
```

For targeted checks, copy the migration into the Supabase SQL editor or run it
against a local Supabase database before starting the FastAPI server.

#### 4. Re-run seed and smoke checks

```bash
cd backend
python scripts/seed_company_settings.py --dry-run
python -m pytest tests/test_supabase_utils_helpers.py -q
```

If the seed script fails, capture the table name, missing column, and exact
migration file in the PR description so maintainers can reproduce it quickly.

#### 5. Diagnose common failures

- **Missing relation**: the base migration was not applied or the branch is
  behind `gssoc`.
- **Missing column**: a later migration expects a column that was renamed or
  introduced in another PR.
- **Policy denies write**: row-level security is enabled without a matching
  service-role or authenticated policy.
- **Duplicate object**: a migration is not idempotent; wrap repeated setup in
  `if not exists` where PostgreSQL supports it.
- **Seed creates no rows**: check that the source table has data and that
  pagination or filters are not excluding all records.

#### 6. PR readiness checklist

- [ ] Migration filenames are timestamped and ordered.
- [ ] Required environment variables are documented.
- [ ] Seed or verification commands were run locally.
- [ ] The PR body includes any skipped checks and why they were skipped.
