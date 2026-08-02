# =============================================================================
# Multi-stage Dockerfile for HELPDESK.AI Frontend (Vite + nginx)
# Stage 1 (builder): Build the Vite/React application
# Stage 2 (production): Serve via nginx:alpine with non-root user
# Stage 3 (dev): Vite dev server with hot module replacement
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: builder - install deps and compile Vite production bundle
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /build

ARG VITE_API_URL=http://localhost:7860
ARG VITE_WS_URL=ws://localhost:7860/ws/metrics
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: production - serve static files via nginx with non-root user
# ---------------------------------------------------------------------------
FROM nginx:stable-alpine AS production

LABEL maintainer="HELPDESK.AI Team" \
      version="3.0.0" \
      description="AI Helpdesk frontend production image (optimized)"

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ---------------------------------------------------------------------------
# Stage 3: dev - Vite dev server with hot module replacement
# ---------------------------------------------------------------------------
FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
