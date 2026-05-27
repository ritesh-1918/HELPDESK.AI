# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dedicated About Us page.
- Google OAuth support via Supabase.

### Fixed
- Navbar responsiveness on mobile devices.
- `NameError` in `save_ticket` by defining `classify_sla_status`.
- Slack payload fallbacks normalization.
- Security: Enforced tenant-scoped authentication on all ticket read endpoints.
- CI/CD: Resolved ESLint v9 command errors and missing dependencies in backend/frontend workflows.

### Security
- Replaced hardcoded environment secrets with GitHub secrets.
- Enforced tenant isolation for ticket data access.
