-- Migration: ticket_embeddings table
-- Required by fix #2373 — DuplicateService Supabase persistence
--
-- Run this once in your Supabase SQL editor (or via the Supabase CLI).
-- This replaces the previous local JSON / in-memory duplicate index with a
-- shared, persistent store that works correctly across multiple Uvicorn workers
-- and survives container restarts.

CREATE TABLE IF NOT EXISTS ticket_embeddings (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   text        NOT NULL UNIQUE,   -- matches tickets.id (text/uuid)
    text        text        NOT NULL,           -- original ticket text used for embedding
    embedding   jsonb       NOT NULL,           -- float[] stored as a JSON array
    created_at  timestamptz DEFAULT now()
);

-- Index for fast lookup by ticket_id
CREATE INDEX IF NOT EXISTS idx_ticket_embeddings_ticket_id
    ON ticket_embeddings(ticket_id);

-- Optional: if you install the pgvector extension you can later replace the
-- full-table scan with an approximate nearest-neighbour index for large scale:
--
--   CREATE EXTENSION IF NOT EXISTS vector;
--   ALTER TABLE ticket_embeddings ADD COLUMN embedding_vec vector(384);
--   CREATE INDEX ON ticket_embeddings USING ivfflat (embedding_vec vector_cosine_ops);
