# Kubernetes Deployment for HelpDesk.ai Backend

This directory contains Kubernetes manifests for deploying the HelpDesk.ai backend.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured to access your cluster
- Helm (optional, for installing NGINX Ingress Controller)
- cert-manager (for TLS certificates)

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

Edit `secrets.yaml` with your actual values:

```bash
# Encode your values
echo -n "your-supabase-url" | base64
echo -n "your-supabase-service-key" | base64
echo -n "your-aes-encryption-key" | base64

# Update secrets.yaml with encoded values
kubectl apply -f secrets.yaml
```

### 3. Deploy Application

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n helpdesk

# Check services
kubectl get svc -n helpdesk

# Check ingress
kubectl get ingress -n helpdesk

# Check HPA
kubectl get hpa -n helpdesk
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service key | Yes |
| `AES_ENCRYPTION_KEY` | AES-256 encryption key for PII | Yes |
| `ALLOW_DEGRADED_STARTUP` | Allow startup if models fail to load | No |
| `REQUIRE_SUPABASE` | Require Supabase configuration | No |

### Resource Limits

- **CPU Request:** 250m, **Limit:** 1000m
- **Memory Request:** 512Mi, **Limit:** 2Gi

### Scaling

The HPA is configured to:
- **Min replicas:** 2
- **Max replicas:** 10
- **Scale up:** When CPU > 70% or Memory > 80%
- **Scale down:** Stabilization window of 5 minutes

## Multi-Stage Docker Build

Use the multi-stage Dockerfile for optimized production builds:

```bash
docker build -f Dockerfile.multi-stage -t helpdesk/backend:latest .
```

### Benefits

- **Smaller image size:** Only runtime dependencies in final image
- **Security:** Non-root user, minimal attack surface
- **Faster builds:** Layer caching for dependencies
- **Production ready:** Optimized for Kubernetes deployment

## Monitoring

### Health Checks

- **Liveness probe:** `/health` endpoint, checked every 30s
- **Readiness probe:** `/health` endpoint, checked every 10s

### Logs

```bash
# View pod logs
kubectl logs -f deployment/helpdesk-backend -n helpdesk

# View logs from all pods
kubectl logs -f -l app=helpdesk-backend -n helpdesk
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod -l app=helpdesk-backend -n helpdesk

# Check pod logs
kubectl logs -l app=helpdesk-backend -n helpdesk
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints helpdesk-backend-service -n helpdesk

# Test service connectivity
kubectl run -it --rm debug --image=curlimages/curl -- curl http://helpdesk-backend-service/help
```

### HPA Not Scaling

```bash
# Check HPA status
kubectl describe hpa helpdesk-backend-hpa -n helpdesk

# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io
```

## Security Considerations

- **Non-root container:** Application runs as `helpdesk` user
- **Secrets management:** Sensitive data stored in Kubernetes Secrets
- **Network policies:** Consider adding NetworkPolicy for production
- **TLS termination:** Ingress configured with cert-manager for automatic TLS

## Production Checklist

- [ ] Update `secrets.yaml` with actual values
- [ ] Configure DNS for `api.helpdesk.ai`
- [ ] Set up cert-manager for TLS certificates
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Configure backup strategy for Supabase
- [ ] Test disaster recovery procedures