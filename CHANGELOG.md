# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `CHANGELOG.md` to track features, fixes, and breaking changes across releases.

### Fixed
- Duplicate detection now learns from saved tickets: after a ticket is inserted into Supabase, the `POST /tickets/save` endpoint in `backend/main.py` calls `duplicate_service.add_ticket(...)` so newly saved tickets are immediately available for future duplicate checks. Indexing failures return a non-breaking warning instead of failing the save.
- Backfilled `company_id` for existing tickets to keep ticket-to-company associations consistent.

[Unreleased]: https://github.com/ritesh-1918/HELPDESK.AI/commits/main
