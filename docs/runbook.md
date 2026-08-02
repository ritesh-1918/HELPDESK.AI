# HELPDESK.AI Production Runbook

## 1. Overview
This runbook outlines the procedures and protocols for resolving common production incidents in the HELPDESK.AI ecosystem. It serves as the primary reference for on-call engineers and site reliability engineers.

## 2. Common Incidents and Resolutions

### 2.1. High API Latency or Timeout
**Symptoms:** 
- API endpoints returning `504 Gateway Timeout` or taking >2 seconds to respond.
- Increased error rate on the frontend.

**Diagnosis:**
1. Check CloudWatch/Datadog for API latency metrics.
2. Review database connection pools and slow queries.
3. Check external API dependencies (e.g., LLM services).

**Resolution:**
- If the database is the bottleneck, scale up the read replicas or optimize the query.
- If external services are rate-limiting, implement exponential backoff or use cached responses.
- If high traffic is causing the issue, manually scale up API instances.

### 2.2. Database Connection Exhaustion
**Symptoms:**
- Error logs show `FATAL: remaining connection slots are reserved for non-replication superuser connections`.
- API endpoints returning `500 Internal Server Error`.

**Diagnosis:**
1. Check the active connection count in the database dashboard (e.g., Supabase/RDS).
2. Look for API routes not properly releasing database connections.

**Resolution:**
- Kill idle connections in the database.
- Restart the API instances to flush the connection pool.
- Implement connection pooling (e.g., PgBouncer).

### 2.3. Frontend Asset Delivery Failure
**Symptoms:**
- Users report a blank screen.
- Console shows `404 Not Found` for `.js` or `.css` files.

**Diagnosis:**
1. Check CDN status and cache hit ratio.
2. Verify if the latest deployment succeeded.

**Resolution:**
- Rollback the deployment to the previous stable release.
- Invalidate the CDN cache for the affected assets.

### 2.4. Memory Leak (OOM Killer)
**Symptoms:**
- Containers restarting unexpectedly.
- Error logs show `OOMKilled` or `java.lang.OutOfMemoryError` / `JavaScript heap out of memory`.

**Diagnosis:**
1. Check the memory utilization metrics of the instances.
2. Analyze heap dumps if available.

**Resolution:**
- Temporarily increase the memory limits of the pods/instances.
- Roll back to the previous deployment if the leak is newly introduced.
- Schedule a deep dive investigation to find the root cause (e.g., unclosed streams, large unpaginated database queries).

## 3. Escalation Policy
If an incident cannot be resolved within 30 minutes, or if it involves a critical security vulnerability or data loss, escalate immediately to:
1. Lead Engineer / SRE Lead
2. Engineering Manager

## 4. Post-Mortem Requirement
For any incident causing >15 minutes of downtime or impacting >5% of users, a post-mortem document must be created within 48 hours to discuss root causes and preventative measures.
