# HELPDESK.AI Database Schema

> Auto-documented from `schema.sql`. All tables use PostgreSQL with `pgcrypto` and `pgvector` extensions.

## Extensions

| Extension | Purpose |
|-----------|---------|
| `pgcrypto` | `gen_random_uuid()` for primary keys |
| `vector` | 384-dimensional embeddings for semantic RAG search |
| `pg_net` | Async HTTP calls from Postgres (in `extensions` schema) |

## Shared Trigger

```sql
CREATE FUNCTION update_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;
```

Attached to every table with an `updated_at` column.

---

## Tables

### `companies`

Top-level tenant entity. Every ticket, KB article, and SLA config is scoped to a company.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `name` | text | — | NOT NULL | |
| `admin_id` | uuid | — | | FK → `profiles(id)` (deferred) |
| `company_size` | text | — | | |
| `industry` | text | — | | |
| `website` | text | — | | |
| `country` | text | — | | |
| `status` | text | `'active'` | NOT NULL | |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | Trigger-maintained |

### `profiles`

User accounts. `id` references Supabase Auth (`auth.users`) with `ON DELETE CASCADE`.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | — | PK, FK → `auth.users(id) ON DELETE CASCADE` | |
| `email` | text | — | NOT NULL, UNIQUE | |
| `full_name` | text | — | | |
| `role` | text | `'user'` | NOT NULL | `user`, `agent`, `admin` |
| `company` | text | — | | Legacy text field |
| `company_id` | uuid | — | FK → `companies(id)` DEFERRABLE INITIALLY DEFERRED | |
| `profile_picture` | text | — | | URL |
| `phone` | text | — | | |
| `job_title` | text | — | | |
| `status` | text | `'pending_email_verification'` | NOT NULL | |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | Trigger-maintained |

### `user_companies`

Join table for many-to-many user ↔ company membership.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `user_id` | uuid | — | NOT NULL, FK → `profiles(id) ON DELETE CASCADE` | |
| `company_id` | uuid | — | NOT NULL, FK → `companies(id) ON DELETE CASCADE` | |
| `role` | text | `'member'` | NOT NULL | Per-company role override |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |
| | | | **PK**: `(user_id, company_id)` | Composite primary key |

### `admin_requests`

Requests from users seeking admin privileges for a new or existing company.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `admin_id` | uuid | — | NOT NULL, FK → `profiles(id) ON DELETE CASCADE` | |
| `company_name` | text | — | NOT NULL | |
| `company_size` | text | — | | |
| `industry` | text | — | | |
| `website` | text | — | | |
| `country` | text | — | | |
| `phone` | text | — | | |
| `job_title` | text | — | | |
| `status` | text | `'pending'` | NOT NULL | `pending`, `approved`, `rejected` |
| `reviewed_by` | uuid | — | FK → `profiles(id) ON DELETE SET NULL` | |
| `review_notes` | text | — | | |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

### `tickets`

Core support ticket entity. AI-classified and optionally auto-resolved.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `user_id` | uuid | — | FK → `profiles(id) ON DELETE SET NULL` | |
| `company_id` | uuid | — | FK → `companies(id) ON DELETE CASCADE` | |
| `assigned_agent_id` | uuid | — | FK → `profiles(id) ON DELETE SET NULL` | |
| `subject` | text | — | | |
| `summary` | text | — | | AI-generated summary |
| `description` | text | — | | |
| `category` | text | — | | AI-classified |
| `priority` | text | `'medium'` | NOT NULL | `low`, `medium`, `high`, `urgent` |
| `status` | text | `'open'` | NOT NULL | `open`, `in_progress`, `resolved`, `closed` |
| `metadata` | jsonb | `'{}'` | NOT NULL | Flexible key-value store |
| `ai_confidence` | numeric(5,4) | — | | 0.0000–1.0000 |
| `duplicate_of` | uuid | — | FK → `tickets(id) ON DELETE SET NULL` | Self-reference |
| `resolved_at` | timestamptz | — | | |
| `closed_at` | timestamptz | — | | |
| `auto_closed` | boolean | `false` | NOT NULL | |
| `last_user_viewed_at` | timestamptz | — | | |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

### `ticket_messages`

Chat-style messages on a ticket. Supports internal (agent-only) messages.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `ticket_id` | uuid | — | NOT NULL, FK → `tickets(id) ON DELETE CASCADE` | |
| `sender_id` | uuid | — | FK → `profiles(id) ON DELETE SET NULL` | |
| `sender_name` | text | — | NOT NULL | Denormalized for display |
| `message` | text | — | NOT NULL | |
| `message_type` | text | `'text'` | NOT NULL | `text`, `image`, `file` |
| `is_internal` | boolean | `false` | NOT NULL | Agent-only notes |
| `created_at` | timestamptz | `now()` | NOT NULL | |

### `internal_notes`

Private agent notes on a ticket (separate from `ticket_messages` with `is_internal`).

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `ticket_id` | uuid | — | NOT NULL, FK → `tickets(id) ON DELETE CASCADE` | |
| `agent_id` | uuid | — | NOT NULL, FK → `profiles(id) ON DELETE CASCADE` | |
| `note` | text | — | NOT NULL | |
| `created_at` | timestamptz | `now()` | NOT NULL | |

### `bug_reports`

In-app bug reports submitted by users.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `reporter_id` | uuid | — | FK → `profiles(id) ON DELETE SET NULL` | |
| `company_id` | uuid | — | FK → `companies(id) ON DELETE SET NULL` | |
| `bug_title` | text | — | NOT NULL | |
| `description` | text | — | NOT NULL | |
| `severity` | text | `'medium'` | NOT NULL | `low`, `medium`, `high`, `critical` |
| `status` | text | `'open'` | NOT NULL | |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

### `enterprise_leads`

Sales leads from the enterprise landing page.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `company_name` | text | — | NOT NULL | |
| `contact_name` | text | — | NOT NULL | |
| `email` | text | — | NOT NULL | |
| `phone` | text | — | | |
| `website` | text | — | | |
| `message` | text | — | | |
| `status` | text | `'new'` | NOT NULL | `new`, `contacted`, `qualified`, `closed` |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

### `kb_articles`

Company-scoped knowledge base articles with full-text search.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `company_id` | uuid | — | FK → `companies(id) ON DELETE CASCADE` | |
| `title` | text | — | NOT NULL | |
| `content` | text | — | NOT NULL | |
| `category` | text | — | | |
| `tags` | text[] | `'{}'` | NOT NULL | Postgres array |
| `search_vector` | tsvector | — | | Full-text search index |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

### `knowledge_base`

Global RAG knowledge base with vector embeddings.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `title` | text | — | NOT NULL | |
| `content` | text | — | NOT NULL | |
| `embedding` | vector(384) | — | | pgvector 384-dim (all-MiniLM-L6-v2) |
| `category` | text | — | | |
| `created_at` | timestamptz | `now()` | NOT NULL | |

### `sla_config`

Per-company SLA configuration. One row per company (unique `company_id`).

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `company_id` | uuid | — | NOT NULL, UNIQUE, FK → `companies(id) ON DELETE CASCADE` | |
| `priority` | text | — | NOT NULL | |
| `resolution_sla_hours` | integer | — | NOT NULL | |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

### `user_feedback`

Feedback/ratings linked to tickets, users, and companies.

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `id` | uuid | `gen_random_uuid()` | PK | |
| `user_id` | uuid | — | FK → `profiles(id) ON DELETE SET NULL` | |
| `company_id` | uuid | — | FK → `companies(id) ON DELETE SET NULL` | |
| `ticket_id` | uuid | — | FK → `tickets(id) ON DELETE SET NULL` | |
| `feedback_type` | text | — | NOT NULL | `positive`, `negative`, `neutral` |
| `rating` | integer | — | | 1–5 scale |
| `comment` | text | — | | |
| `created_at` | timestamptz | `now()` | NOT NULL | |

### `system_settings`

Per-company system configuration. One row per company (unique `company_id`).

| Column | Type | Default | Constraints | Notes |
|--------|------|---------|-------------|-------|
| `company_id` | uuid | — | NOT NULL, UNIQUE, FK → `companies(id) ON DELETE CASCADE` | |
| `ai_confidence_threshold` | float | `0.80` | | Minimum AI confidence to auto-resolve |
| `duplicate_sensitivity` | float | `0.85` | | Cosine similarity threshold |
| `enable_auto_resolve` | boolean | `false` | | |
| `auto_close_enabled` | boolean | `true` | | |
| `auto_close_days` | integer | `7` | | Days before auto-close |
| `email_notifications` | boolean | `true` | | |
| `admin_alerts` | boolean | `true` | | |
| `digest_frequency` | text | `'daily'` | | `daily`, `weekly`, `monthly` |
| `created_at` | timestamptz | `now()` | NOT NULL | |
| `updated_at` | timestamptz | `now()` | NOT NULL | |

---

## Entity Relationship Summary

```
auth.users (Supabase)
  └── profiles (1:1, CASCADE)
        ├── tickets.user_id (SET NULL)
        ├── tickets.assigned_agent_id (SET NULL)
        ├── ticket_messages.sender_id (SET NULL)
        ├── internal_notes.agent_id (CASCADE)
        ├── bug_reports.reporter_id (SET NULL)
        ├── user_feedback.user_id (SET NULL)
        ├── admin_requests.admin_id (CASCADE)
        └── user_companies.user_id (CASCADE)

companies
  ├── profiles.company_id (DEFERRED)
  ├── tickets.company_id (CASCADE)
  ├── kb_articles.company_id (CASCADE)
  ├── sla_config.company_id (CASCADE, UNIQUE)
  ├── system_settings.company_id (CASCADE, UNIQUE)
  ├── bug_reports.company_id (SET NULL)
  ├── user_feedback.company_id (SET NULL)
  └── user_companies.company_id (CASCADE)

tickets
  ├── ticket_messages.ticket_id (CASCADE)
  ├── internal_notes.ticket_id (CASCADE)
  ├── user_feedback.ticket_id (SET NULL)
  └── tickets.duplicate_of (SET NULL, self-reference)
```

## Row-Level Security

All tables grant `USAGE` on the `public` schema to `anon`, `authenticated`, and `service_role` Postgres roles. RLS policies are expected to be configured at the Supabase dashboard level to enforce tenant isolation by `company_id`.
