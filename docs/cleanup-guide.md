dockerfile
# =============================================================================
# HELPDESK.AI - Production Backend Dockerfile
# =============================================================================
# This is the SINGLE canonical Dockerfile for the backend service.
# All deployment workflows (local/dev/staging/prod) MUST reference this file.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder - Install dependencies and compile assets
# -----------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS builder

# Security: Run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser -m -d /app appuser

# Set working directory
WORKDIR /app

# Security: Update CA certificates and install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        curl \
        ca-certificates \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# Copy dependency files first (for better layer caching)
COPY backend/requirements.txt backend/requirements.prod.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        --requirement requirements.txt \
        --requirement requirements.prod.txt

# -----------------------------------------------------------------------------
# Stage 2: Runtime - Minimal production image
# -----------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS runtime

# Security: Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -m -d /app appuser

# Install runtime dependencies only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
        ca-certificates \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY backend/ ./backend/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Security: Set proper permissions
RUN chown -R appuser:appuser /app && \
    chmod -R 755 /app

# Switch to non-root user
USER appuser

# -----------------------------------------------------------------------------
# Environment Configuration
# -----------------------------------------------------------------------------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    DJANGO_SETTINGS_MODULE=backend.settings.production \
    PORT=8000

# -----------------------------------------------------------------------------
# Health Check
# -----------------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl --fail http://localhost:${PORT}/health/ || exit 1

# -----------------------------------------------------------------------------
# Expose Application Port
# -----------------------------------------------------------------------------
EXPOSE ${PORT}

# -----------------------------------------------------------------------------
# Startup Command
# -----------------------------------------------------------------------------
CMD ["gunicorn", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info", \
     "backend.asgi:application"]