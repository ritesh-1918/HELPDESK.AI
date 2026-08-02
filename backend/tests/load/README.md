# Load Testing Suite

Distributed load testing for HELPDESK.AI critical API endpoints using [Locust](https://locust.io/).

## Quick Start

```bash
# Install Locust
pip install locust

# Start web UI
locust -f backend/tests/load/locustfile.py --web-port 8089

# Or run headless (50 users, 10/s ramp, 5 minute duration)
locust -f backend/tests/load/locustfile.py \
  --headless -u 50 -r 10 --run-time 5m \
  --host http://localhost:8000
```

## Test Coverage

| Endpoint | Method | Description | SLA Target |
|----------|--------|-------------|------------|
| `/auth/login` | POST | Sequential login with token reuse | p50<300ms, p95<800ms |
| `/auth/signup` | POST | New user registration | p50<500ms, p95<1500ms |
| `/tickets` | GET | List tickets with pagination/filters | p50<200ms, p95<500ms |
| `/tickets` | POST | Create new ticket | p50<200ms, p95<500ms |
| `/tickets/{id}` | GET | Get ticket by ID | p50<150ms, p95<400ms |
| `/tickets/save` | POST | Save analyzed ticket | p50<300ms, p95<700ms |
| `/ai/analyze_ticket` | POST | Full AI ticket analysis (DistilBERT) | p50<500ms, p95<1500ms |
| `/ai/analyze` | POST | Lightweight text analysis | p50<400ms, p95<1200ms |
| `/health` | GET | Service health check | p50<50ms, p95<100ms |
| `/ready` | GET | Service readiness | p50<50ms, p95<100ms |

## Simulation Profiles

### `AuthBehaviour` (SequentialTaskSet)
- Login → token reuse → list tickets → create tickets
- Simulates a support agent performing ticket operations

### `TicketAnalystUser` (HttpUser)
- Health checks (weight: 3)
- AI ticket analysis (weight: 5)
- Text-only analysis (weight: 2)
- Simulates AI/ML pipeline workload

### `MixedWorkloadUser` (HttpUser)
- Readiness checks (weight: 1)
- Save analyzed tickets (weight: 3)
- Get ticket by ID (weight: 1)
- Mixed realistic workload

## SLA Configuration

Thresholds are defined in `sla_config.py`:

- **CRUD endpoints**: p50<200ms, p95<500ms, p99<1000ms, error rate <0.1%
- **AI endpoints**: p50<500ms, p95<1500ms, p99<3000ms, error rate <1%
- **Health endpoints**: p50<50ms, p95<100ms, p99<200ms, error rate <0%

## Benchmarks

To generate a benchmarking report:

```bash
# Run headless with report output
locust -f backend/tests/load/locustfile.py \
  --headless -u 100 -r 20 --run-time 10m \
  --host http://localhost:8000 \
  --csv=benchmark_results

# Or use the Python report generator
python -c "
from sla_config import ReportCollector
# ... (use the collector with Locust event hooks)
report = collector.generate_report()
collector.save_report('benchmark_report.json')
"
```

## File Structure

```
backend/tests/load/
├── locustfile.py      # Main Locust test definitions
├── sla_config.py      # SLA thresholds + reporting
└── README.md          # This file
```