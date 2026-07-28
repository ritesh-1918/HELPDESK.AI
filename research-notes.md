dockerfile
# =============================================================================
# Stage 1: Base Image Definition
# =============================================================================
FROM python:3.11-slim AS base

# ---------------------------------------------------------------------------
# Environment Configuration
# ---------------------------------------------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive \
    TZ=UTC

# ---------------------------------------------------------------------------
# System Dependencies & Security Updates
# ---------------------------------------------------------------------------
RUN set -eux; \
    apt-get update; \
    apt-get upgrade -y; \
    apt-get install -y --no-install-recommends \
        curl \
        gcc \
        libpq-dev \
        netcat-openbsd \
        tini \
        ca-certificates \
    ; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ---------------------------------------------------------------------------
# Application User (Non-Root)
# ---------------------------------------------------------------------------
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# =============================================================================
# Stage 2: Dependency Installation
# =============================================================================
FROM base AS dependencies

WORKDIR /app

# Copy dependency files
COPY backend/requirements.txt .
COPY backend/requirements-dev.txt .

# Install production dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Stage 3: Production Build
# =============================================================================
FROM dependencies AS production

WORKDIR /app

# ---------------------------------------------------------------------------
# Application Code
# ---------------------------------------------------------------------------
COPY --chown=appuser:appuser backend/ .

# ---------------------------------------------------------------------------
# Security Hardening
# ---------------------------------------------------------------------------
RUN chmod -R 755 /app && \
    chown -R appuser:appuser /app

# ---------------------------------------------------------------------------
# Health Check Configuration
# ---------------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ---------------------------------------------------------------------------
# Port Exposure
# ---------------------------------------------------------------------------
EXPOSE 8000

# ---------------------------------------------------------------------------
# Entrypoint & Command
# ---------------------------------------------------------------------------
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# =============================================================================
# Stage 4: Development Build
# =============================================================================
FROM dependencies AS development

WORKDIR /app

# Install development dependencies
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application code with hot-reload support
COPY --chown=appuser:appuser backend/ .

# Development-specific health check (more lenient)
HEALTHCHECK --interval=60s --timeout=30s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# =============================================================================
# Stage 5: Testing Build
# =============================================================================
FROM dependencies AS testing

WORKDIR /app

# Install test dependencies
COPY backend/requirements-test.txt .
RUN pip install --no-cache-dir -r requirements-test.txt

# Copy application code
COPY --chown=appuser:appuser backend/ .

# Test-specific configuration
ENV TESTING=1 \
    DATABASE_URL=sqlite:///test.db

HEALTHCHECK NONE

EXPOSE 8000

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pytest", "--verbose", "--cov=.", "--cov-report=term-missing", "tests/"]

# =============================================================================
# Stage 6: Linting Build
# =============================================================================
FROM dependencies AS linting

WORKDIR /app

# Install linting tools
RUN pip install --no-cache-dir flake8 black isort mypy

# Copy application code
COPY --chown=appuser:appuser backend/ .

HEALTHCHECK NONE

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "flake8 . && black --check . && isort --check-only . && mypy ."]

# =============================================================================
# Default Target: Production
# =============================================================================
FROM production