This folder contains Grafana provisioning and dashboard JSON for HELPDesk.AI backend.

Quick start (Docker Compose with Grafana + Prometheus):

1. Mount this repo's `deploy/grafana/provisioning` to `/etc/grafana/provisioning` in the Grafana container.
2. Mount `deploy/grafana/dashboards` to `/var/lib/grafana/dashboards` in the Grafana container.
3. Ensure a Prometheus datasource is reachable at `http://prometheus:9090` inside the Grafana network.
4. Restart Grafana — dashboards should be auto-imported.

Example docker-compose snippet:

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./deploy/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./deploy/grafana/dashboards:/var/lib/grafana/dashboards:ro
    ports:
      - 3000:3000
```

Kubernetes (quick apply)

Create `monitoring` namespace and apply ConfigMaps + Deployment:

```bash
kubectl create ns monitoring
kubectl apply -f deploy/grafana/k8s/grafana-config.yaml
kubectl apply -f deploy/grafana/k8s/grafana-admin-secret.yaml
kubectl apply -f deploy/grafana/k8s/grafana-deploy.yaml
```

This mounts the provisioning files and dashboard via `ConfigMap` so Grafana will auto-import on startup. Replace the `admin` password secret before production.
