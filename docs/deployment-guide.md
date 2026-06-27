dockerfile
# =============================================================================
# HELPDESK.AI - Production Backend Dockerfile (SINGLE CANONICAL SOURCE)
# =============================================================================
# WARNING: This is the ONLY authoritative Dockerfile for the backend service.
# The file at backend/Dockerfile is DEPRECATED and MUST NOT be used.
# All CI/CD pipelines, deployment scripts, and documentation MUST reference
# this file exclusively.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder - Compile dependencies and build wheels
# -----------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS builder

# ---------------------------------------------------------------------------
# Security & System Setup
# ---------------------------------------------------------------------------
# Create non-root user early to prevent permission issues
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /build

# ---------------------------------------------------------------------------
# Dependency Installation (Layer Caching Optimization)
# ---------------------------------------------------------------------------
# Copy only dependency files first to maximize Docker layer caching
COPY backend/pyproject.toml backend/poetry.lock* ./

# Install build-time system dependencies
RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        gcc \
        libpq-dev \
        libffi-dev \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python build tools and dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev --no-interaction --no-ansi

# ---------------------------------------------------------------------------
# Application Code
# ---------------------------------------------------------------------------
COPY --chown=appuser:appuser backend/ ./backend/

# -----------------------------------------------------------------------------
# Stage 2: Runtime - Minimal production image
# -----------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS runtime

# ---------------------------------------------------------------------------
# Metadata & Labels
# ---------------------------------------------------------------------------
LABEL maintainer="HELPDESK.AI Team" \
      version="1.0.0" \
      description="HELPDESK.AI Backend Service - Production" \
      org.opencontainers.image.title="HELPDESK.AI Backend" \
      org.opencontainers.image.description="Production backend service for HELPDESK.AI" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.source="https://github.com/ritesh-1918/HELPDESK.AI" \
      org.opencontainers.image.licenses="MIT"

# ---------------------------------------------------------------------------
# Security: Non-root user
# ---------------------------------------------------------------------------
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# ---------------------------------------------------------------------------
# Runtime System Dependencies (Minimal)
# ---------------------------------------------------------------------------
RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        libpq-dev \
        curl \
        ca-certificates \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Copy from Builder Stage
# ---------------------------------------------------------------------------
# Copy Python packages (optimized: only site-packages and binaries)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code with proper ownership
COPY --from=builder --chown=appuser:appuser /build/backend ./backend/

# ---------------------------------------------------------------------------
# Directory Structure & Permissions
# ---------------------------------------------------------------------------
RUN mkdir -p /app/logs /app/data /app/tmp && \
    chown -R appuser:appuser /app && \
    chmod 755 /app && \
    chmod 750 /app/logs /app/data /app/tmp

# ---------------------------------------------------------------------------
# Security Hardening
# ---------------------------------------------------------------------------
# Remove setuid/setgid binaries
RUN find / -perm /6000 -type f -exec chmod a-s {} \; 2>/dev/null || true

# Switch to non-root user
USER appuser

# ---------------------------------------------------------------------------
# Environment Configuration
# ---------------------------------------------------------------------------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    APP_ENV=production \
    LOG_LEVEL=INFO \
    UVICORN_WORKERS=4 \
    MAX_UPLOAD_SIZE=10485760 \
    REQUEST_TIMEOUT=60

# ---------------------------------------------------------------------------
# Network Configuration
# ---------------------------------------------------------------------------
EXPOSE 8000

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl --fail --silent --show-error http://localhost:8000/health || exit 1

# ---------------------------------------------------------------------------
# Resource Limits (Documentation)
# ---------------------------------------------------------------------------
# Memory limit: 512MB
# CPU limit: 1.0 core
# These should be enforced at the orchestration level (Docker Compose/K8s)

# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
CMD ["uvicorn", "backend.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--log-level", "info", \
     "--limit-concurrency", "100", \
     "--backlog", "2048", \
     "--timeout-keep-alive", "30"]

# =============================================================================
# DEPRECATION NOTICE
# =============================================================================
# This file (Dockerfile at repository root) is the SINGLE canonical source for
# building the backend container. The file at backend/Dockerfile is DEPRECATED
# and will be removed in a future release.
#
# Migration status: backend/Dockerfile is retained for reference only.
# All new deployments MUST use this file.
# =============================================================================