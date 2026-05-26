# syntax=docker/dockerfile:1

FROM python:3.10-slim AS builder

WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.10-slim AS runtime

LABEL org.opencontainers.image.title="helpdesk-backend"
LABEL org.opencontainers.image.description="HELPDESK.AI FastAPI backend (multi-stage)"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /usr/sbin/nologin appuser

COPY --from=builder /install /usr/local
COPY . /app/backend

ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD ["python", "backend/healthcheck.py"]

USER appuser

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
