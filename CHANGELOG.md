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
