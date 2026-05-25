# syntax=docker/dockerfile:1.6

# ---------- Stage 1: builder ----------
# Compiles Python dependencies into an isolated prefix that the runtime
# stage copies over, so build toolchains (gcc, git, headers) never ship.
FROM python:3.10-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# ---------- Stage 2: runtime ----------
FROM python:3.10-slim AS runtime

LABEL version="1.2.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Runtime-only system libs (no compilers, no git) — keeps image small.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Pull in the prebuilt Python packages from the builder stage.
COPY --from=builder /install /usr/local

# Copy application source as 'backend' so absolute imports keep working.
COPY . /app/backend

# Drop root.
RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD ["python", "backend/healthcheck.py"]

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
