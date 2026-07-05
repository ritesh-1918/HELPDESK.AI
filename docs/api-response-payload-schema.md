# API response payload schema reference guide

This guide documents the response shapes returned by the core HELPDESK.AI
backend endpoints. It is intended for GSSoC contributors who need a quick
contract reference while wiring frontend views, tests, or integration clients.

> Base URL: use `VITE_BACKEND_URL` from the frontend environment, or the
> locally running FastAPI service URL during development.

## Common error response

FastAPI returns this shape for validation errors and explicit
`HTTPException` failures:

```json
{
  "detail": "Database connection not initialized"
}
```

Validation failures may return `detail` as an array of field errors instead of a
string.

## `GET /health`

Returns the basic process and model-load status.

```json
{
  "status": "ok",
  "classifier_loaded": true,
  "ner_loaded": true
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `status` | string | Usually `ok` when the service process is alive. |
| `classifier_loaded` | boolean | Whether the classifier singleton loaded successfully. |
| `ner_loaded` | boolean | Whether the NER singleton loaded successfully. |

## `GET /ready`

Returns readiness checks for dependencies that the service needs before it can
serve traffic safely.

```json
{
  "status": "ready",
  "checks": {
    "api": true,
    "classifier_loaded": true,
    "ner_loaded": true,
    "duplicate_index_loaded": true,
    "rag_loaded": true,
    "supabase_configured": true
  }
}
```

`supabase_configured` is present only when `REQUIRE_SUPABASE=true`.

## `POST /ai/analyze` and `POST /ai/analyze_ticket`

Both endpoints return the `TicketResponse` analysis payload. `/ai/analyze` is
read-only. `/ai/analyze_ticket` is rate limited and delegates to the same
analysis flow.

Example response:

```json
{
  "id": null,
  "ticket_id": "7cc6e8ef-b5d9-4615-a349-1d629154e7c6",
  "summary": "VPN connecting error 789 on router",
  "category": "Network",
  "subcategory": "VPN Failure",
  "priority": "High",
  "auto_resolve": false,
  "assigned_team": "Network Ops",
  "entities": [
    {
      "text": "VPN",
      "label": "TECHNOLOGY",
      "confidence": 0.94
    }
  ],
  "duplicate_ticket": {
    "is_duplicate": false,
    "duplicate_ticket_id": null,
    "similarity": 0.0
  },
  "confidence": 0.96,
  "needs_review": false,
  "reasoning": "Categorized as 'Network' - VPN Failure.",
  "decision_factors": [
    "High confidence match for 'VPN Failure'"
  ],
  "image_description": "",
  "ocr_text": "",
  "image_url": null,
  "highlights": [
    {
      "text": "VPN",
      "label": "TECHNOLOGY",
      "confidence": 0.94
    }
  ],
  "timeline": {
    "received": "2026-06-05T12:00:00Z",
    "ai_analyzed": "2026-06-05T12:00:00Z",
    "triaged": "2026-06-05T12:00:00Z",
    "metadata_harvested": "2026-06-05T12:00:00Z",
    "routed": "2026-06-05T12:00:00Z"
  },
  "env_metadata": {
    "timestamp": "2026-06-05T12:00:00Z",
    "model_version": "3.0.0-PRO",
    "api_endpoint": "/ai/analyze"
  },
  "sla_breach_at": "2026-06-05T20:00:00Z",
  "version": "2.1.0-Neural-Diagnostic"
}
```

### Ticket analysis fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string \| integer \| null | Reserved for persisted records. |
| `ticket_id` | string \| null | Temporary UUID for preview analysis. |
| `summary` | string | AI or fallback summary of the ticket text. |
| `category` | string | Top-level predicted category. |
| `subcategory` | string | More specific predicted issue type. |
| `priority` | string | Expected values include `Critical`, `High`, `Medium`, and `Low`. |
| `auto_resolve` | boolean | True only when auto-resolution is enabled and confidence rules pass. |
| `assigned_team` | string | Routing team selected by category or RAG match. |
| `entities` | array | Extracted entities, each with `text`, `label`, and `confidence`. |
| `duplicate_ticket` | object | Duplicate detection result. |
| `confidence` | number | Classifier confidence from `0.0` to `1.0`. |
| `needs_review` | boolean | True when confidence is below the active threshold. |
| `reasoning` | string | Human-readable routing explanation. |
| `decision_factors` | array of strings | Concise evidence used for the decision. |
| `image_description` | string | Vision model description when an image is supplied. |
| `ocr_text` | string | OCR text from uploaded image context. |
| `image_url` | string \| null | Preserved uploaded image URL if provided. |
| `highlights` | array | Currently mirrors extracted entities for UI highlighting. |
| `timeline` | object | ISO timestamps for analysis milestones. |
| `env_metadata` | object | Request or model metadata for diagnostics. |
| `sla_breach_at` | string \| null | ISO timestamp generated from priority SLA rules. |
| `version` | string | Response contract / analyzer version. |

## `POST /ai/analyze_stream`

Streams Server-Sent Events instead of one JSON document. Each event payload is a
JSON string with a progress `step`, a status `message`, and optional final
analysis data. Clients should parse each SSE `data:` line independently and
handle disconnects gracefully.

## `POST /tickets/save`

Persists a reviewed ticket analysis to Supabase and creates the initial system
message.

Success response:

```json
{
  "status": "success",
  "ticket_id": "8f4e8d46-6b0d-46f9-b5c0-4fd4a98cb8f4",
  "duplicate_indexed": true
}
```

If duplicate indexing fails but the ticket is saved, the response includes a
warning:

```json
{
  "status": "success",
  "ticket_id": "8f4e8d46-6b0d-46f9-b5c0-4fd4a98cb8f4",
  "duplicate_indexed": false,
  "duplicate_index_warning": "Duplicate index update failed."
}
```

## `GET /tickets`

Returns an array of persisted ticket records from Supabase, ordered newest
first. The exact columns mirror the `tickets` table, so consumers should treat
unknown keys as forward-compatible metadata.

```json
[
  {
    "id": "8f4e8d46-6b0d-46f9-b5c0-4fd4a98cb8f4",
    "subject": "VPN cannot connect",
    "description": "VPN connecting error 789 on router",
    "category": "Network",
    "subcategory": "VPN Failure",
    "priority": "High",
    "assigned_team": "Network Ops",
    "status": "open",
    "created_at": "2026-06-05T12:00:00Z"
  }
]
```

## `GET /tickets/{ticket_id}`

Returns one persisted ticket record from Supabase. On a missing record, the API
returns `404` with:

```json
{
  "detail": "Ticket not found"
}
```

## Auth endpoints

### `POST /auth/login`

Sets session cookies and returns the authenticated profile payload.

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "admin"
  },
  "message": "Session cookies set"
}
```

### `POST /auth/signup`

Creates an account, sets session cookies, and returns the new profile payload.

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "user"
  },
  "message": "Signup complete"
}
```

### `POST /auth/logout`

Clears session cookies.

```json
{
  "ok": true
}
```

### `GET /auth/me`

Returns the current authenticated user from the session cookie or bearer token.

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

## Contributor checklist

- Keep frontend consumers tolerant of extra response fields.
- Treat `detail` as either a string or an array for error handling.
- Do not assume Supabase-backed endpoints are available in degraded local mode.
- Use `confidence`, `needs_review`, and `decision_factors` together when
  explaining AI decisions to users.
