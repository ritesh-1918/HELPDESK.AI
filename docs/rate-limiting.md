# Backend API Rate Limiting Standards

## Overview

HELPDESK.AI uses [`slowapi`](https://github.com/laurisvm/slowapi) (a FastAPI-compatible rate limiter) to protect the `/ai/analyze_ticket` endpoint and any future API endpoints from abuse. Rate limiting is configured in `backend/main.py`.

## Current Configuration

| Setting | Value | Location |
|---------|-------|----------|
| Library | `slowapi` with `Limiter` | `backend/main.py:23` |
| Key function | `get_remote_address` (IP-based) | `backend/main.py:273` |
| AI endpoint limit | **10 requests per minute per IP** | `backend/main.py:698` (decorator) |

### How It Works

1. A `Limiter` instance is created at module level using `get_remote_address` as the key function (line 273).
2. The limiter is attached to the FastAPI `app.state` (line 274).
3. A global exception handler for `RateLimitExceeded` is registered (line 275).
4. Individual endpoints are decorated with `@limiter.limit("N/period")` (line 698).

## Adding Rate Limits to New Endpoints

To add rate limiting to a new endpoint:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/your-endpoint")
@limiter.limit("30/minute")
async def your_endpoint(request: Request, body: YourModel):
    ...
```

> **Important:** The endpoint function **must** accept a `request: Request` parameter for the limiter to extract the client IP.

## Rate Limit Response Format

When a client exceeds the rate limit, they receive:

- **HTTP Status:** `429 Too Many Requests`
- **Response body:** `{"detail": "Rate limit exceeded: 10 per 1 minute"}`
- **Headers:** `Retry-After` (seconds until limit resets)

## Customizing Limits

| Pattern | Use Case | Example |
|---------|----------|---------|
| `"10/minute"` | AI inference (per-user) | `@limiter.limit("10/minute")` |
| `"100/hour"` | Read-only endpoints | `@limiter.limit("100/hour")` |
| `"1000/day"` | Batch/import endpoints | `@limiter.limit("1000/day")` |
| `"5/second"` | Health checks (generous) | `@limiter.limit("5/second")` |

## Testing Rate Limits Locally

1. Start the backend: `uvicorn backend.main:app --reload`
2. Send requests rapidly to the endpoint using `curl` or `httpie`:
   ```
   for i in $(seq 1 15); do curl -X POST http://localhost:8000/ai/analyze_ticket ...; done
   ```
3. After the 11th request, observe a `429` response.
4. To simulate different IPs during testing, set the `X-Forwarded-For` header:
   ```
   curl -H "X-Forwarded-For: 192.168.1.1" ...
   ```

## Best Practices

1. **Always use `Limiter(key_func=get_remote_address)`** — do not use a static key or user-ID based key without explicit security review.
2. **Never exempt auth-sensitive endpoints** (login, registration, password reset) from rate limits.
3. **Document the limit** in the endpoint's docstring so Swagger/Redoc reflects it.
4. **Choose limits conservatively** — you can always raise them later.
5. **Log rate limit violations** using FastAPI middleware or the existing logging configuration.
6. **Update `PLATFORM_MAP.md`** when adding new rate-limited endpoints.
7. **Test with `X-Forwarded-For`** to ensure the IP extraction works behind reverse proxies (Nginx, Cloudflare, Hugging Face Spaces).

## Example: Adding a Medium-Limit Endpoint

```python
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/v1/tickets")
@limiter.limit("60/minute")
async def list_tickets(request: Request):
    return {"tickets": [...]}
```
