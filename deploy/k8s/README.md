# Kubernetes deployment (HELPDESK.AI backend)

Manifests for running the FastAPI backend on Kubernetes with horizontal scaling.

## Apply

```bash
kubectl apply -f deploy/k8s/
```

Create a secret named `helpdesk-backend-env` with Supabase/Gemini/Redis variables from `backend/.env.example`.

## Components

| File | Purpose |
|------|---------|
| `deployment.yaml` | 2-replica backend with readiness/liveness probes |
| `service.yaml` | ClusterIP on port 80 → container 7860 |
| `hpa.yaml` | CPU autoscaler 2–10 pods at 75% utilization |
| `ingress.yaml` | Nginx host routing for `api.helpdesk.ai` |

Build the image from `backend/Dockerfile` (multi-stage, target <300MB runtime layer).
