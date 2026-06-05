# =============================================================================
# Root Dockerfile — build from project root (e.g., HuggingFace Spaces, CI/CD
# pipelines that check out the entire repository before building).
#
# For local development use docker-compose, which builds from ./backend and
# targets the backend/Dockerfile (multi-stage, non-root user, health check).
#
# Both Dockerfiles use the same two-stage pattern and identical base images so
# that dependency lists and runtime behaviour stay in sync.
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: builder — install all Python dependencies
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1     PIP_NO_CACHE_DIR=1     PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends     build-essential     libgl1     libglib2.0-0     libgomp1     && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m venv /opt/venv &&     /opt/venv/bin/pip install --upgrade pip &&     /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Pre-compile bytecode for faster startup
COPY . /build/src
RUN /opt/venv/bin/python -m compileall -q /build/src || true

# ---------------------------------------------------------------------------
# Stage 2: production — minimal runtime image
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS production

LABEL maintainer="HELPDESK.AI Team"       description="AI Helpdesk backend — built from repo root"

RUN apt-get update && apt-get install -y --no-install-recommends     libgl1     libglib2.0-0     libgomp1     curl     && rm -rf /var/lib/apt/lists/*

# Non-root user (mirrors backend/Dockerfile security posture)
RUN groupadd --gid 1001 appgroup &&     useradd --uid 1001 --gid 1001 --no-create-home --shell /bin/false appuser

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:/c/Users/novar/bin:/mingw64/bin:/usr/local/bin:/usr/bin:/bin:/mingw64/bin:/usr/bin:/c/Users/novar/bin:/c/WINDOWS/system32:/c/WINDOWS:/c/WINDOWS/System32/Wbem:/c/WINDOWS/System32/WindowsPowerShell/v1.0:/c/WINDOWS/System32/OpenSSH:/c/Program Files/dotnet:/c/Program Files/nodejs:/cmd:/c/Users/novar/AppData/Local/Microsoft/WindowsApps:/d/Download/Apps/Microsoft VS Code/bin:/c/Users/novar/AppData/Local/spicetify:/d/Program Files/msys64/ucrt64/bin:/c/Users/novar/AppData/Roaming/npm:/usr/bin/vendor_perl:/usr/bin/core_perl"

WORKDIR /app

COPY --from=builder /build/src /app

ENV PYTHONPATH=/app     PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1     ALLOW_DEGRADED_STARTUP=1     PORT=7860

USER appuser

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3     CMD curl -f http://localhost:7860/health || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
