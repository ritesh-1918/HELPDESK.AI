# HELPDESK.AI — Database Schema

> Auto-generated from Supabase migrations. Last updated: 2026-06-24.

---

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│     tickets      │       │  knowledge_base   │       │  system_settings    │
├──────────────────┤       ├──────────────────┤       ├─────────────────────┤
│ id (PK)          │       │ id (PK)          │       │ company_id (PK)     │
│ company_id (FK)  │──┐    │ title            │       │ ai_confidence_...   │
│ user_id (FK)     │  │    │ content          │       │ duplicate_sens...   │
│ subject          │  │    │ embedding        │       │ enable_auto_resolve │
│ description      │  │    │ category         │       │ auto_close_enabled  │
│ status           │  │    │ created_at       │       │ auto_close_days     │
│ priority         │  │    └──────────────────┘       │ email_notifications │
│ assigned_to      │  │                               │ admin_alerts        │
│ category         │  │    ┌──────────────────┐       │ digest_frequency    │
│ csat_rating      │  │    │   user_companies │       └─────────────────────┘
│ csat_comment     │  │    ├──────────────────┤
│ closed_at        │  │    │ user_id (FK)     │       ┌─────────────────────┐
│ auto_closed      │  │    │ company_id (FK)──┼───────│     companies       │
│ created_at       │  │    │ role             │       ├─────────────────────┤
│ updated_at       │  │    └──────────────────┘       │ id (PK)             │
└──────────────────┘  │                               │ name                │
        │             │                               │ domain              │
        ▼             │                               │ created_at          │
┌──────────────────┐  │                               └─────────────────────┘
│     profiles     │  │
├──────────────────┤  │       ┌──────────────────────────┐
│ id (PK)          │  │       │  internal_config.secrets │
│ email            │  │       ├──────────────────────────┤
│ role             │  │       │ name (PK)                │
│ full_name        │  │       │ value                    │
│ company_id (FK)──┼──┘       │ updated_at               │
│ avatar_url       │          └──────────────────────────┘
│ created_at       │
└──────────────────┘
```

---

## Tables

### `public.tickets`

Core support ticket entity. Central to the entire application.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `company_id` | `uuid` | — | FK → `companies.id` |
| `user_id` | `uuid` | — | FK → `profiles.id` (creator) |
| `subject` | `text` | — | Ticket title/summary |
| `description` | `text` | — | Full ticket body |
| `status` | `text` | `'open'` | One of: `open`, `in_progress`, `resolved`, `closed` |
| `priority` | `text` | `'medium'` | One of: `low`, `medium`, `high`, `critical` |
| `assigned_to` | `uuid` | — | FK → `profiles.id` (agent) |
| `category` | `text` | — | Classification (auto or manual) |
| `csat_rating` | `integer` | — | Customer satisfaction (1-5) |
| `csat_comment` | `text` | — | CSAT feedback text |
| `closed_at` | `timestamptz` | — | When ticket was closed |
| `auto_closed` | `boolean` | `false` | Closed by auto-close cron |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `now()` | |

**Indexes:**
- `idx_tickets_status_updated_at` — partial index on `(status, updated_at DESC)` WHERE `status = 'resolved'`
- `idx_tickets_auto_closed` — partial index on `(auto_closed, closed_at DESC)` WHERE `auto_closed = true`

**Triggers:**
- `ticket_insert_trigger` → calls edge function `email-notifier` on INSERT

---

### `public.profiles`

User profiles (extends Supabase Auth).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `uuid` | — | PK, references `auth.users.id` |
| `email` | `text` | — | User email |
| `role` | `text` | `'user'` | One of: `user`, `agent`, `admin` |
| `full_name` | `text` | — | Display name |
| `company_id` | `uuid` | — | FK → `companies.id` |
| `avatar_url` | `text` | — | Profile image URL |
| `created_at` | `timestamptz` | `now()` | |

---

### `public.companies`

Multi-tenant organization.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `name` | `text` | — | Company name |
| `domain` | `text` | — | Email domain for auto-association |
| `created_at` | `timestamptz` | `now()` | |

---

### `public.user_companies`

Many-to-many: users ↔ companies (with role).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `user_id` | `uuid` | — | FK → `profiles.id` |
| `company_id` | `uuid` | — | FK → `companies.id` |
| `role` | `text` | `'member'` | Company-level role |

---

### `public.knowledge_base`

RAG-powered help articles with pgvector embeddings.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `title` | `text` | — | Article title |
| `content` | `text` | — | Full article body |
| `embedding` | `vector(384)` | — | Sentence-transformer embedding (MiniLM-L6-v2) |
| `category` | `text` | — | Topic/category tag |
| `created_at` | `timestamptz` | `now()` | |

**RLS Policies:**
- `Knowledge base is viewable by authenticated users` — SELECT for all authenticated
- `Knowledge base is editable by admins` — ALL for users where `profiles.role = 'admin'`

**Functions:**
- `match_articles(query_embedding, match_threshold, match_count)` — Cosine similarity search returning `(id, title, content, similarity)`

---

### `public.system_settings`

Per-company AI and automation configuration.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `company_id` | `uuid` | — | PK, FK → `companies.id` |
| `ai_confidence_threshold` | `float` | `0.80` | Min confidence for auto-classification |
| `duplicate_sensitivity` | `float` | `0.85` | Threshold for duplicate detection |
| `enable_auto_resolve` | `boolean` | `false` | Auto-resolve low-confidence tickets? |
| `auto_close_enabled` | `boolean` | `true` | Enable auto-close cron |
| `auto_close_days` | `integer` | `7` | Days before auto-closing resolved tickets |
| `email_notifications` | `boolean` | `true` | Send email on ticket events |
| `admin_alerts` | `boolean` | `true` | Admin alert on critical events |
| `digest_frequency` | `text` | `'daily'` | Summary digest cadence |

**RLS Policies:**
- `Service role full access` — service_role has ALL
- `Users can view own company settings` — SELECT for users in same company

**Indexes:**
- `idx_system_settings_company_id`

---

### `internal_config.secrets`

Internal key-value store for sensitive configuration (bypasses Vault permission model).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `text` | — | Primary key |
| `value` | `text` | — | Secret value |
| `updated_at` | `timestamptz` | `now()` | |

**Grants:** postgres, service_role only (revoked from public).

---

## Extensions

| Extension | Purpose |
|-----------|---------|
| `vector` | pgvector for embedding storage & cosine similarity search |
| `pg_net` | HTTP requests from Postgres triggers (webhook to edge functions) |

## Backend Services & Models

| Service | Purpose |
|---------|---------|
| `classifier_service.py` | Ticket category classification (ML) |
| `classifier_v2.py` / `v3.py` | Iterative classifier improvements |
| `ner_service.py` | Named Entity Recognition extraction |
| `duplicate_service.py` | Duplicate ticket detection |
| `ocr_service.py` | Optical Character Recognition (EasyOCR) |
| `gemini_service.py` | Google Gemini AI integration |
| `rag_service.py` | Retrieval-Augmented Generation (knowledge base) |
| `auto_close_service.py` | Cron-based auto-close for resolved tickets |
| `notification_routing.py` | Email/webhook notification dispatch |
