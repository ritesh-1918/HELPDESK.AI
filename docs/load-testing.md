# Load Testing Guide

This guide describes how to run and interpret load tests for HELPDESK.AI's critical API endpoints using [Locust](https://locust.io/), a Python-based load testing framework.

## Overview

The load testing suite simulates concurrent helpdesk agents performing common daily workflows:

- **Authentication**: Sequential login with token reuse
- **Ticket browsing**: Paginated ticket lists with status/priority filters
- **Ticket creation**: Submitting support tickets with realistic payloads
- **AI ticket analysis**: DistilBERT classifier inference (target: <500ms per inference)
- **Troubleshooting**: Step-by-step troubleshooting queries
- **Health checks**: Lightweight liveness and readiness probes

## Quick Start

### 1. Install Dependencies

```bash
pip install locust
```

### 2. Run Locally (with UI)

```bash
cd backend/tests/load
locust --host=http://localhost:8000
```

Then open http://localhost:8089 in your browser to configure the test (number of users, spawn rate, host).

### 3. Run Headless (CI mode)

```bash
cd backend/tests/load
locust --headless \
  --host=http://localhost:8000 \
  --users=50 \
  --spawn-rate=5 \
  --run-time=5m \
  --html=report.html
```

### 4. Generate Benchmark Report

```bash
python backend/tests/load/generate_report.py \
  --summary load_test_reports/summary.json \
  --html load_test_reports/benchmark_report.html
```

## Test Scenarios

| Task | Weight | Endpoint | Description |
|------|--------|----------|-------------|
| Health Check | 2 | `GET /health` | Lightweight liveness probe |
| Readiness Check | 1 | `GET /ready` | Full service dependency check |
| Browse Tickets | 5 | `GET /tickets` | Paginated ticket list with filters |
| Get Ticket | 3 | `GET /tickets/{id}` | Single ticket details |
| Create Ticket | 3 | `POST /tickets` | Submit new support ticket |
| Save Ticket | 2 | `POST /tickets/save` | Save ticket draft |
| AI Analysis | 4 | `POST /ai/analyze_ticket` | Full AI triage pipeline |
| Lightweight AI | 2 | `POST /ai/analyze` | Analysis without ticket save |
| Troubleshoot | 1 | `POST /ai/troubleshoot` | Step-by-step troubleshooting |
| Update Ticket | 1 | `PATCH /tickets/{id}` | Update ticket status/priority |

## SLA Thresholds

| Endpoint Group | p50 | p95 | p99 | Max Error Rate |
|---------------|-----|-----|-----|---------------|
| CRUD (tickets) | <200ms | <500ms | <1000ms | <0.1% |
| AI Analysis | <500ms | <1500ms | <3000ms | <0.1% |
| Auth | <300ms | <800ms | <1500ms | <0.1% |
| Health | <100ms | <300ms | <500ms | <0.0% |

Thresholds are defined in `backend/tests/load/locust_config.py` and can be overridden via the `PERFORMANCE_BUDGET` environment variable.

### Performance Budget Environment Variable

```bash
# Override specific thresholds
export PERFORMANCE_BUDGET="crud_p50=150,crud_p95=400,ai_p50=400,ai_p95=1200,error_rate=0.5"

# Run with custom budget
PERFORMANCE_BUDGET="crud_p50=100" locust --headless --host=...
```

**Format**: Comma-separated `key=value` pairs:
- `crud_p50`, `crud_p95`, `crud_p99` — CRUD endpoint thresholds (ms)
- `ai_p50`, `ai_p95`, `ai_p99` — AI analysis thresholds (ms)
- `auth_p50`, `auth_p95`, `auth_p99` — Auth endpoint thresholds (ms)
- `error_rate` — Maximum error rate (percentage, divided by 100 internally)

## Test Data

The load test generates random but realistic test data:

- **Ticket titles**: 10 predefined IT support ticket scenarios (VPN issues, email crashes, login errors, etc.)
- **Ticket descriptions**: 5 realistic multi-sentence descriptions with technical detail
- **User agents**: Rotated between Windows, macOS, and Linux user agent strings
- **Authentication**: Each simulated user creates a unique session (random email + password)

## CI/CD Integration

The suite runs nightly via GitHub Actions (`.github/workflows/performance.yml`):

1. **Schedule**: Runs at 02:00 UTC every day against staging
2. **Trigger**: Also runs on `workflow_dispatch` (manual) or on pull request with label `performance`
3. **Artifacts**: Locust HTML report, CSV stats, and benchmark HTML report are uploaded
4. **PR Comments**: Results are posted as a comment on pull requests
5. **SLA Enforcement**: The workflow fails if SLA thresholds are exceeded

### Manual Trigger

```bash
# Via GitHub UI: Actions → Performance Load Testing → Run workflow
# Or via gh CLI:
gh workflow run performance.yml \
  --field target_url=https://staging.example.com \
  --field users=100 \
  --field run_time=10m
```

## File Structure

```
backend/tests/load/
├── __init__.py              # Package marker
├── locustfile.py            # Main Locust test definition (HttpUser tasks)
├── locust_config.py          # SLA threshold configuration dataclass
└── generate_report.py       # Benchmark report generator (HTML + terminal)

.github/workflows/
└── performance.yml          # Nightly CI workflow
```

## Best Practices

1. **Run against staging, not production**: The Locust test should target a staging environment with representative data (10K+ tickets, 100+ users)
2. **Seed test data**: Ensure the staging database has realistic test data before running
3. **Mock AI models**: The AI analysis endpoint should use a mock model in test mode to avoid GPU dependency during load tests
4. **Monitor resources**: Watch database connection pool, CPU, and memory during tests
5. **Use FastHttpLocust**: For higher request throughput during large-scale tests, switch to `FastHttpUser`
6. **Gradual ramp-up**: Use `--spawn-rate` to gradually increase load rather than hitting the system all at once
7. **Consistent baselines**: Run tests at the same time of day to avoid time-of-day variance

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'locust'` | Run `pip install locust` |
| Auth endpoints return 403/401 | Verify staging environment auth is configured for test users |
| AI endpoints return 503 | Mock model not loaded — check `--mock-ai` flag or GPU availability |
| Summary JSON not generated | Ensure `--only-summary` flag is NOT used; Locust must print stats to stdout |
| Report says "0 requests" | Check that the host URL is correct and the staging server is running |
