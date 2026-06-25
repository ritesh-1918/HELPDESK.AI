# Smoke test: backend `/metrics` + Grafana dashboard provisioning

This smoke test verifies:

1. Backend starts locally (with degraded startup allowed)
2. `/metrics` returns `200` using the configured token
3. Grafana starts locally and imports the pre-provisioned dashboard

## Prereqs

- Docker + docker compose
- Python deps installed (see `backend/requirements.txt`)

## Step 1 — Start backend locally

From repo root:

```bash
export ALLOW_DEGRADED_STARTUP=1
export METRICS_TOKEN="dev-metrics-token"
export METRICS_ALLOWED_IPS="" # token auth enabled, so IP allow is not required

python -m backend.main 2>/dev/null
```

If your environment doesn’t allow `python -m backend.main` directly, run via uvicorn:

```bash
export ALLOW_DEGRADED_STARTUP=1
export METRICS_TOKEN="dev-metrics-token"

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Wait until the API is responding on `http://localhost:8000`.

## Step 2 — Verify `/metrics`

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "X-Metrics-Token: dev-metrics-token" \
  http://localhost:8000/metrics
```

Expected: `200`

## Step 3 — Start Grafana locally (Docker)

This repo provisions the dashboard via files under `deploy/grafana/provisioning`.

Create a small compose setup:

```bash
cat > /tmp/helpdesk-grafana-compose.yml <<'YAML'
services:
  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      # must match Grafana secret/admin password usage for auth, but provisioning works regardless
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_PATHS_PROVISIONING: /etc/grafana/provisioning
    volumes:
      - "${PWD}/deploy/grafana/provisioning:/etc/grafana/provisioning:ro"
      - "${PWD}/deploy/grafana/dashboards:/var/lib/grafana/dashboards:ro"
    restart: unless-stopped
YAML

docker compose -f /tmp/helpdesk-grafana-compose.yml up -d
```

## Step 4 — Verify dashboard import

Open Grafana:

- http://localhost:3000

Login:

- user: `admin`
- password: `admin`

Then confirm the dashboard named:

- `HELPDESK.AI - Backend Monitoring`

Because provisioning uses file-based dashboard import, it should auto-load on startup.

## Notes for Kubernetes smoke test

If you want to verify `/metrics` from inside the cluster, you must set:

- `METRICS_TOKEN` (or configure `METRICS_ALLOWED_IPS`)
- and ensure ServiceMonitor/NetworkPolicy allows Prometheus to reach `/metrics`.
