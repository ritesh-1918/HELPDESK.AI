# HELPDESK.AI Database Schema

> This document describes the database tables, columns, and relationships used in the HELPDESK.AI platform.

## Overview

HELPDESK.AI uses PostgreSQL (via Supabase) as its primary database. The schema includes tables for:

- User management and authentication
- Ticket and bug reporting
- Knowledge base with vector embeddings
- Company settings and configuration
- Webhook integrations

## Tables

### 1. bug_reports

Stores bug reports submitted by users (including anonymous users).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | Yes | NULL | References auth.users(id). NULL for anonymous reports |
| bug_title | TEXT | No | - | Title of the bug report |
| description | TEXT | No | - | Detailed description of the bug |
| steps_to_reproduce | TEXT | Yes | NULL | Steps to reproduce the issue |
| expected_result | TEXT | Yes | NULL | What was expected to happen |
| actual_result | TEXT | Yes | NULL | What actually happened |
| severity | TEXT | No | - | One of: 'Low', 'Medium', 'High', 'Critical' |
| category | TEXT | No | - | One of: 'UI Issue', 'Performance', 'Functionality Broken', 'Security Issue', 'Other' |
| contact_permission | BOOLEAN | No | false | Whether user allows contact for follow-up |
| diagnostic_data | JSONB | No | '{}'::jsonb | Additional diagnostic information |
| status | TEXT | No | 'Open' | One of: 'Open', 'In Progress', 'Resolved', 'Closed' |
| created_at | TIMESTAMP | No | now() | When the report was created |

**RLS Policies:**
- Anyone can insert (including anonymous users)
- Users can read their own reports
- Admins can read all reports

---

### 2. knowledge_base

Stores knowledge base articles with vector embeddings for semantic search.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| title | TEXT | No | - | Article title |
| content | TEXT | No | - | Article content |
| embedding | vector(384) | Yes | NULL | Vector embedding for semantic search (all-MiniLM-L6-v2) |
| category | TEXT | Yes | NULL | Article category |
| created_at | TIMESTAMP | No | now() | When the article was created |

**RLS Policies:**
- Authenticated users can read all articles
- Only admins can insert/update/delete

**Vector Search:**
Uses pgvector extension with 384-dimensional embeddings from sentence-transformers/all-MiniLM-L6-v2.

---

### 3. system_settings

Stores per-company configuration settings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| company_id | UUID | No | - | Unique company identifier (primary key) |
| ai_confidence_threshold | FLOAT | No | 0.80 | Minimum AI confidence for auto-resolution |
| duplicate_sensitivity | FLOAT | No | 0.85 | Threshold for duplicate ticket detection |
| enable_auto_resolve | BOOLEAN | No | false | Enable AI auto-resolution |
| auto_close_enabled | BOOLEAN | No | true | Auto-close resolved tickets |
| auto_close_days | INTEGER | No | 7 | Days before auto-closing resolved tickets |
| email_notifications | BOOLEAN | No | true | Enable email notifications |
| admin_alerts | BOOLEAN | No | true | Enable admin alerts |
| digest_frequency | TEXT | No | 'daily' | Email digest frequency |

**RLS Policies:**
- Service role (backend) has full access
- Authenticated users can read their company settings

---

## Relationships

```
auth.users (Supabase Auth)
    │
    ├── bug_reports.user_id (1:N)
    │
    └── profiles.id (1:1)
            │
            └── system_settings.company_id (1:1)
```

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │    profiles     │
│─────────────────│       │─────────────────│
│ id (PK)         │◄──────│ id (PK)         │
│ email           │       │ role            │
│ ...             │       │ company_id      │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:N                     │ 1:1
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   bug_reports   │       │ system_settings │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ company_id (PK) │
│ user_id (FK)    │       │ ai_confidence.. │
│ bug_title       │       │ duplicate_sens..│
│ severity        │       │ auto_close_..   │
│ status          │       │ ...             │
│ ...             │       │                 │
└─────────────────┘       └─────────────────┘

┌─────────────────┐
│ knowledge_base  │
│─────────────────│
│ id (PK)         │
│ title           │
│ content         │
│ embedding       │  ← pgvector (384 dims)
│ category        │
│ created_at      │
└─────────────────┘
```

## Common Queries

### Get all open bug reports for a user
```sql
SELECT * FROM bug_reports 
WHERE user_id = :user_id 
AND status = 'Open'
ORDER BY created_at DESC;
```

### Semantic search on knowledge base
```sql
SELECT title, content, category,
       1 - (embedding <=> :query_embedding) AS similarity
FROM knowledge_base
WHERE 1 - (embedding <=> :query_embedding) > 0.3
ORDER BY similarity DESC
LIMIT 10;
```

### Get company settings
```sql
SELECT * FROM system_settings 
WHERE company_id = :company_id;
```

### Count tickets by severity
```sql
SELECT severity, COUNT(*) as count
FROM bug_reports
WHERE status != 'Closed'
GROUP BY severity
ORDER BY CASE severity
    WHEN 'Critical' THEN 1
    WHEN 'High' THEN 2
    WHEN 'Medium' THEN 3
    WHEN 'Low' THEN 4
END;
```

## Migration History

| Migration | Description |
|-----------|-------------|
| 20260330231301 | Create knowledge_base table with pgvector |
| 20260330231302 | Add webhook trigger |
| 20260331000000 | Resolve vault sync |
| 20260531 | Add system_settings table |
| 20260531 | Update tickets auto-close |

## Notes

- All tables use Row Level Security (RLS) for access control
- UUIDs are used as primary keys throughout
- Timestamps use UTC timezone
- The knowledge_base table uses pgvector for AI-powered semantic search
- Bug reports can be submitted by anonymous users (user_id is nullable)
