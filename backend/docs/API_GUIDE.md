# HELPDESK.AI API Documentation

## Quick Start

### Swagger UI → [http://localhost:8000/docs](http://localhost:8000/docs)
Interactive API explorer. Toggle light/dark theme with the 🌙 button
or add `?theme=dark` to the URL. Use the environment switcher to point
at staging / production.

### ReDoc → [http://localhost:8000/redoc](http://localhost:8000/redoc)
Alternative documentation view with search and schema drill-down.

### Postman Collection
Import `postman_collection.json` into Postman. The collection includes:

- **Pre-configured variables** — `{{base_url}}`, `{{production_url}}`, `{{auth_token}}`
- **All ticket endpoints** — CRUD, search, bulk operations, ratings
- **AI analysis endpoints** — classify, troubleshoot, bug analysis, duplicate detection
- **System endpoints** — health, readiness, metrics, cache health
- **SLA management** — tracking, escalation, breach detection
- **Translation & Voice** — multi-language support, speech-to-ticket

### Authentication
Set `auth_token` in the Postman environment variable after signing in.
The API validates tokens against Supabase Auth.

## API Categories

| Tag | Description |
|-----|-------------|
| **System** | Health, readiness, landing page, monitoring |
| **AI Analysis** | Core NLP: classification, troubleshooting, bug analysis |
| **Tickets** | CRUD, search, bulk operations, ratings |
| **Admin** | Correction logging, CSAT reporting, security auditing |
| **SLA Management** | SLA tracking, breach detection, escalation |
| **Translation** | Multi-language ticket translation |
| **Estimator** | Response time and SLA estimation |
| **Voice** | Speech-to-text ticket creation |
| **Weekly Digest** | Automated email digests with summaries and trends |
