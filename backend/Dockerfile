# =============================================================================
# Multi-stage Dockerfile for HELPDESK.AI Backend (FastAPI + uvicorn)
# Stage 1 (builder): Install Python dependencies
# Stage 2 (production): Minimal runtime image with non-root user
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: builder — install dependencies into user space
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ---------------------------------------------------------------------------
# Stage 2: production — minimal runtime image
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS production

LABEL maintainer="HELPDESK.AI Team" \
      version="2.0.0" \
      description="AI Helpdesk — backend production image"

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

WORKDIR /app

COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appgroup . .

ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

USER appuser

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD wget --spider -q http://localhost:7860/health || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "2"]