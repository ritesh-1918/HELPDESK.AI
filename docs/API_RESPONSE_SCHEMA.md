# API Response Payload Schema Reference

> **Audience:** GSSoC'26 contributors and anyone integrating with the HELPDESK.AI
> backend.
> **Scope:** Documents the JSON response payloads returned by the core FastAPI
> endpoints defined in [`backend/main.py`](../backend/main.py).

This guide is a quick reference for **what each endpoint returns** so you can build
frontend components, write tests, or call the API from external tooling without
having to reverse-engineer the source each time. Every schema below is derived
directly from the Pydantic models and handler return values in the backend.

> 💡 The backend also ships an always-up-to-date interactive schema. Run the
> service and open **`/docs`** (Swagger UI) or **`/openapi.json`** for the
> machine-readable contract. This document is the human-friendly companion.

---

## Conventions

- **Base URL (production):** `https://<your-helpdesk-ai-space>.hf.space`
- **Base URL (local dev):** `http://localhost:7860`
- All request and response bodies are `application/json` unless noted
  (`/ai/analyze_stream` uses `text/event-stream`, `/` returns `text/html`).
- Timestamps are ISO-8601 UTC strings with a trailing `Z`
  (e.g. `2026-06-06T10:15:30.123456Z`).
- `confidence` and `similarity` values are floats in the range `0.0`–`1.0`.
- Types use Python/JSON notation: `str | null` means the field may be a string or
  `null`.

---

## Endpoint Index

| Method | Path | Purpose | Section |
| ------ | ---- | ------- | ------- |
| `GET`  | `/health` | Liveness + model load flags | [Health](#get-health) |
| `GET`  | `/ready` | Deployment readiness gate | [Readiness](#get-ready) |
| `POST` | `/ai/analyze` | Read-only ticket analysis | [Analyze](#post-aianalyze) |
| `POST` | `/ai/analyze_ticket` | Analyze (rate-limited wrapper) | [Analyze Ticket](#post-aianalyze_ticket) |
| `POST` | `/ai/analyze_stream` | Streaming (SSE) analysis | [Analyze Stream](#post-aianalyze_stream) |
| `POST` | `/ai/analyze-v2` | Lightweight V2 classifier | [Analyze V2](#post-aianalyze-v2) |
| `POST` | `/ai/troubleshoot` | Dynamic troubleshooting step | [Troubleshoot](#post-aitroubleshoot) |
| `POST` | `/ai/analyze_bug` | Bug report root-cause | [Analyze Bug](#post-aianalyze_bug) |
| `POST` | `/ai/log_correction` | Log admin override | [Log Correction](#post-ailog_correction) |
| `GET`  | `/tickets` | List persisted tickets | [List Tickets](#get-tickets) |
| `GET`  | `/tickets/{id}` | Fetch one ticket | [Get Ticket](#get-ticketsid) |
| `POST` | `/tickets/save` | Persist analyzed ticket | [Save Ticket](#post-ticketssave) |
| `POST` | `/auth/login` | Email/password login | [Auth](#authentication-endpoints) |
| `POST` | `/auth/signup` | Register account | [Auth](#authentication-endpoints) |
| `POST` | `/auth/logout` | Clear session cookies | [Auth](#authentication-endpoints) |
| `GET`  | `/auth/me` | Current user | [Auth](#authentication-endpoints) |

---

## Health & Readiness

### `GET /health`

Lightweight liveness probe. Always returns `200` while the process is up.

**Response — `HealthResponse`**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `status` | `str` | Always `"ok"`. |
| `classifier_loaded` | `bool` | Whether the DistilBERT classifier is loaded into memory. |
| `ner_loaded` | `bool` | Whether the NER model is loaded. |

```json
{
  "status": "ok",
  "classifier_loaded": true,
  "ner_loaded": true
}
```

### `GET /ready`

Deployment readiness gate. Returns `200` with `status: "ready"` only when every
required check passes; otherwise returns **`503`** with `status: "not_ready"` and
the same `checks` object so you can see which dependency is missing.

**Response — `ReadinessResponse`**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `status` | `str` | `"ready"` or `"not_ready"`. |
| `checks` | `object<str, bool>` | Per-dependency boolean flags. |

```json
{
  "status": "ready",
  "checks": {
    "api": true,
    "classifier_loaded": true,
    "ner_loaded": true,
    "duplicate_index_loaded": true,
    "rag_loaded": true
  }
}
```

> The `supabase_configured` key is added to `checks` only when the
> `REQUIRE_SUPABASE=true` environment variable is set. In degraded mode
> (`ALLOW_DEGRADED_STARTUP=1`) the `duplicate_index_loaded` and `rag_loaded`
> checks are treated as optional.

---

## AI Analysis

### `POST /ai/analyze`

The primary read-only analysis endpoint. It runs the full local AI cascade
(OCR → classification → NER → duplicate detection → RAG knowledge base → optional
Gemini summary) and returns a structured analysis **without persisting anything**
to the database. The frontend calls `/tickets/save` afterward if the user confirms.

#### Request body — `TicketRequest`

| Field | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `text` | `str` | *(required)* | The raw ticket description. |
| `image_base64` | `str` | `""` | Optional base64 screenshot for OCR/vision. |
| `image_text` | `str` | `""` | Pre-extracted OCR text (skips vision call). |
| `user_id` | `str \| null` | `null` | Reporting user's id. |
| `company` | `str \| null` | `null` | Tenant/company id used to load settings. |
| `image_url` | `str \| null` | `null` | Public URL of the uploaded image. |
| `confidence_threshold` | `float` | `0.20` | Client hint (server uses tenant settings). |
| `duplicate_sensitivity` | `float` | `0.85` | Client hint (server uses tenant settings). |

#### Response body — `TicketResponse`

| Field | Type | Description |
| ----- | ---- | ----------- |
| `id` | `str \| int \| null` | Database id (null for read-only analysis). |
| `ticket_id` | `str \| null` | Temporary UUID generated for this analysis. |
| `summary` | `str` | Short summary (Gemini-generated if available, else truncated text). |
| `category` | `str` | Top-level category, e.g. `Network`, `Software`, `Hardware`, `Access`. |
| `subcategory` | `str` | Specific issue type, e.g. `WiFi Issue`, `Password Reset`. |
| `priority` | `str` | One of `Critical`, `High`, `Medium`, `Low`. |
| `auto_resolve` | `bool` | Whether the ticket is flagged for AI auto-resolution. |
| `assigned_team` | `str` | Routed team, e.g. `Network Support`, `Auto-Resolve AI`. |
| `entities` | `EntityInfo[]` | Extracted technical entities (see below). |
| `duplicate_ticket` | `DuplicateInfo` | Duplicate detection result (see below). |
| `confidence` | `float` | Classifier confidence `0.0`–`1.0`. |
| `needs_review` | `bool` | `true` when confidence is below the tenant threshold. |
| `reasoning` | `str` | Human-readable explanation of the decision. |
| `decision_factors` | `str[]` | Bullet points that drove the decision. |
| `image_description` | `str` | Gemini vision description of the screenshot. |
| `ocr_text` | `str` | Text extracted from the image. |
| `image_url` | `str \| null` | Echoes the request `image_url`. |
| `highlights` | `str[]` | Highlight tokens (currently mirrors `entities`). |
| `timeline` | `object<str, str>` | Step → ISO-timestamp milestones. |
| `env_metadata` | `object` | Model version, timestamp, and endpoint used. |
| `sla_breach_at` | `str \| null` | Projected SLA breach timestamp. |
| `version` | `str` | Schema version, e.g. `2.1.0-Neural-Diagnostic`. |

**Nested object — `EntityInfo`**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `text` | `str` | Matched entity text. |
| `label` | `str` | Entity label/type. |
| `confidence` | `float` | Extraction confidence. |

**Nested object — `DuplicateInfo`**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `is_duplicate` | `bool` | Whether a similar ticket exists. |
| `duplicate_ticket_id` | `str \| null` | Id of the matched ticket. |
| `similarity` | `float` | Cosine similarity `0.0`–`1.0`. |

**Example response**

```json
{
  "id": null,
  "ticket_id": "3f0b9c2e-1a4d-4c8e-9b2f-7a6c5d4e3f21",
  "summary": "User cannot connect to office WiFi on their laptop.",
  "category": "Network",
  "subcategory": "WiFi Issue",
  "priority": "Medium",
  "auto_resolve": false,
  "assigned_team": "Network Support",
  "entities": [
    { "text": "WiFi", "label": "TECH", "confidence": 0.97 },
    { "text": "laptop", "label": "DEVICE", "confidence": 0.91 }
  ],
  "duplicate_ticket": {
    "is_duplicate": false,
    "duplicate_ticket_id": null,
    "similarity": 0.0
  },
  "confidence": 0.88,
  "needs_review": false,
  "reasoning": "Categorized as 'Network' - WiFi Issue.",
  "decision_factors": [
    "High confidence match for 'WiFi Issue'",
    "Detected entities: WiFi, laptop"
  ],
  "image_description": "",
  "ocr_text": "",
  "image_url": null,
  "highlights": [
    { "text": "WiFi", "label": "TECH", "confidence": 0.97 }
  ],
  "timeline": {
    "received": "2026-06-06T10:15:30.000000Z",
    "ai_analyzed": "2026-06-06T10:15:30.420000Z",
    "triaged": "2026-06-06T10:15:30.420000Z",
    "metadata_harvested": "2026-06-06T10:15:30.450000Z",
    "routed": "2026-06-06T10:15:30.700000Z"
  },
  "env_metadata": {
    "timestamp": "2026-06-06T10:15:30.000000Z",
    "model_version": "3.0.0-PRO",
    "api_endpoint": "/ai/analyze"
  },
  "sla_breach_at": "2026-06-07T10:15:30.000000Z",
  "version": "2.1.0-Neural-Diagnostic"
}
```

### `POST /ai/analyze_ticket`

Same request/response contract as [`/ai/analyze`](#post-aianalyze), but
**rate-limited to `10/minute` per client IP** (free-tier protection). It also runs
local OCR over `image_base64` before delegating to the same analysis logic.
Exceeding the limit returns the SlowAPI **`429 Too Many Requests`** payload:

```json
{ "error": "Rate limit exceeded: 10 per 1 minute" }
```

### `POST /ai/analyze_stream`

Real-time progress via **Server-Sent Events** (`Content-Type: text/event-stream`).
Each event is a `data: <json>\n\n` line. Intermediate events report progress; the
final event carries the full `TicketResponse` payload under `result`.

**Progress event**

```text
data: {"step": "Detecting category and priority", "status": "in_progress"}
```

The emitted steps, in order, are:
`Reading your message` → `Extracting technical entities` →
`Detecting category and priority` → `Checking duplicate issues` →
`Finding possible solutions` → `done`.

**Final event**

```text
data: {"step": "done", "result": { ...full TicketResponse object... }}
```

### `POST /ai/analyze-v2`

A lightweight classifier-only endpoint. Returns a flat object (not the full
`TicketResponse`).

```json
{
  "status": "success",
  "category": "Software",
  "subcategory": "Application Crash",
  "priority": "High",
  "auto_resolve": false,
  "assigned_team": "Application Support",
  "confidence": 0.83
}
```

On failure it returns a **`500`** with `{"detail": "<error message>"}`.

---

## Assistive AI Endpoints

### `POST /ai/troubleshoot`

Returns the next dynamic troubleshooting step from Gemini.

**Request — `TroubleshootRequest`**: `text` (`str`), `category` (`str`),
`history` (`object[]`, default `[]`).

**Response — `TroubleshootResponse`**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `step_text` | `str` | The instruction/question to show the user. |
| `options` | `str[]` | Selectable follow-up options. |
| `is_final` | `bool` | `true` when the troubleshooting flow is complete. |

```json
{
  "step_text": "Have you tried toggling Airplane mode off and on?",
  "options": ["Yes, still broken", "No, let me try"],
  "is_final": false
}
```

> When Gemini is unavailable the endpoint degrades gracefully:
> `{"step_text": "AI Troubleshooting is currently unavailable.", "options": ["Continue to tracking"], "is_final": true}`.

### `POST /ai/analyze_bug`

Generates a probable root cause for a bug report.

**Request — `BugReportAnalysisRequest`**: `bug_title` (`str`),
`description` (`str`), `steps_to_reproduce` (`str`, default `""`),
`console_errors` (`str[]`, default `[]`).

**Response — `BugReportAnalysisResponse`**

```json
{ "probable_cause": "Null reference when the auth token cookie is missing on first render." }
```

### `POST /ai/log_correction`

Logs an admin correction when the human decision differs from the AI prediction.
Accepts a free-form JSON body (`ticket_id`, `original_text`, `ocr_text`,
`confidence`, `original_prediction`, `corrected_prediction`). Returns one of three
status shapes:

| Scenario | Response |
| -------- | -------- |
| A field changed and was logged | `{"status": "saved", "changed_fields": ["priority"]}` |
| Prediction matched correction | `{"status": "no_change", "message": "Prediction matches correction, nothing logged."}` |
| Invalid JSON / write error | `{"status": "error", "message": "<reason>"}` |

Only the `category`, `subcategory`, `priority`, and `assigned_team` fields are
compared to decide whether anything changed.

---

## Ticket Persistence

### `GET /tickets`

Returns an **array** of ticket rows from Supabase, ordered by `created_at`
descending. Pass an optional `?company_id=<id>` query parameter to scope results
to a tenant. Each element is the raw Supabase row (column set defined by the
`tickets` table). Returns **`500`** if the database connection is not initialized.

```json
[
  {
    "id": 1042,
    "user_id": "8a7b...",
    "subject": "Cannot connect to VPN",
    "category": "Network",
    "subcategory": "VPN Connection",
    "priority": "High",
    "assigned_team": "Network Support",
    "status": "open",
    "company_id": "acme-corp",
    "created_at": "2026-06-06T09:00:00Z"
  }
]
```

### `GET /tickets/{ticket_id}`

Returns a single ticket row (object). Returns **`404`** with
`{"detail": "Ticket not found"}` when no row matches, or **`500`** if the database
is offline.

### `POST /tickets/save`

Persists an analyzed ticket after the user confirms. The request body is the
`TicketSaveRequest` model (subject, description, category, subcategory, priority,
`assigned_team`, status, `auto_resolve`, `is_duplicate`, `confidence`,
`sla_breach_at`, `metadata`, `routing_confidence`, etc.). The handler validates
tenant linkage against the user's profile before inserting.

**Success response**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `status` | `str` | `"success"`. |
| `ticket_id` | `int` | Newly inserted database id. |
| `duplicate_indexed` | `bool` | Whether the ticket text was added to the duplicate index. |
| `duplicate_index_warning` | `str` *(optional)* | Present only when indexing was skipped or failed. |

```json
{
  "status": "success",
  "ticket_id": 1043,
  "duplicate_indexed": true
}
```

**Error responses**

| Status | When |
| ------ | ---- |
| `400` | User has no tenant assignment. |
| `403` | `company_id` does not match the user's profile tenant. |
| `404` | User profile not found. |
| `500` | Supabase not initialized or insert failed. |
| `503` | Tenant linkage could not be resolved. |

All errors use the FastAPI shape `{"detail": "<message>"}`.

---

## Authentication Endpoints

Sessions are cookie-based. `/auth/login` and `/auth/signup` set `HttpOnly`,
`Secure`, `SameSite=Strict` cookies (`access_token`, `refresh_token`).

| Endpoint | Success payload |
| -------- | --------------- |
| `POST /auth/login` | `{"user": { ...supabase user... }, "message": "Session cookies set"}` |
| `POST /auth/signup` | `{"user": { ...supabase user... } \| null, "message": "Signup complete"}` |
| `POST /auth/logout` | `{"ok": true}` |
| `GET /auth/me` | `{"user": { ...supabase user... }}` |

**Auth error responses** (FastAPI `{"detail": ...}` shape):

| Status | Meaning |
| ------ | ------- |
| `401` | Not authenticated / invalid credentials / invalid session. |
| `400` | Signup rejected by Supabase (e.g. duplicate email). |
| `503` | Database connection offline. |

---

## Standard Error Envelope

Unless otherwise noted, errors raised via FastAPI's `HTTPException` follow this
shape:

```json
{ "detail": "Human-readable error message" }
```

Validation errors (malformed request bodies) are produced by FastAPI/Pydantic and
return **`422 Unprocessable Entity`** with a `detail` array describing each
offending field:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "text"],
      "msg": "Field required"
    }
  ]
}
```

---

## Keeping This Document in Sync

These schemas mirror the Pydantic models and handlers in
[`backend/main.py`](../backend/main.py). If you change a request/response model in
the backend, update the matching section here in the same pull request. When in
doubt, the live `/openapi.json` is the source of truth.

*Maintained by GSSoC'26 contributors. Happy hacking! 🚀*
