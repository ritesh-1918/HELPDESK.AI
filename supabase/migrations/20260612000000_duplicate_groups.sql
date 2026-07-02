-- Issue #2807: Real-Time Ticket Clustering & Duplicate Detection Improvements
-- Migration: duplicate_groups, duplicate_feedback, and cluster analytics indexes

-- ============================================================
-- 1. duplicate_groups: stores cluster metadata
-- ============================================================
create table if not exists public.duplicate_groups (
    id               uuid primary key default gen_random_uuid(),
    cluster_id       text not null unique,
    primary_ticket   text,                       -- FK to tickets.id (soft reference)
    company_id       uuid references public.companies(id) on delete cascade,
    category         text not null default 'Unknown',
    confidence       float not null default 0.0,
    size             int not null default 1,
    kb_suggestion    text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index if not exists duplicate_groups_company_id_idx
    on public.duplicate_groups (company_id);

create index if not exists duplicate_groups_category_idx
    on public.duplicate_groups (category);

-- ============================================================
-- 2. duplicate_group_members: per-ticket cluster membership
-- ============================================================
create table if not exists public.duplicate_group_members (
    id               uuid primary key default gen_random_uuid(),
    cluster_id       text not null references public.duplicate_groups(cluster_id) on delete cascade,
    ticket_id        text not null,
    company_id       uuid references public.companies(id) on delete cascade,
    is_primary       boolean not null default false,
    similarity       float not null default 0.0,
    semantic_score   float not null default 0.0,
    keyword_score    float not null default 0.0,
    structural_score float not null default 0.0,
    joined_at        timestamptz not null default now(),
    unique (cluster_id, ticket_id)
);

create index if not exists dup_members_cluster_idx
    on public.duplicate_group_members (cluster_id);

create index if not exists dup_members_ticket_idx
    on public.duplicate_group_members (ticket_id);

-- ============================================================
-- 3. duplicate_feedback: admin feedback for auto-tuning
-- ============================================================
create table if not exists public.duplicate_feedback (
    id             uuid primary key default gen_random_uuid(),
    company_id     uuid references public.companies(id) on delete cascade,
    ticket_id      text,
    feedback_type  text not null check (feedback_type in ('false_positive', 'missed_duplicate')),
    old_threshold  float,
    new_threshold  float,
    created_at     timestamptz not null default now()
);

create index if not exists dup_feedback_company_idx
    on public.duplicate_feedback (company_id);

create index if not exists dup_feedback_created_at_idx
    on public.duplicate_feedback (created_at desc);

-- ============================================================
-- 4. Ensure duplicate_sensitivity exists in system_settings
-- ============================================================
alter table if exists public.system_settings
    add column if not exists duplicate_sensitivity float not null default 0.85;

-- ============================================================
-- 5. updated_at trigger for duplicate_groups
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists duplicate_groups_updated_at on public.duplicate_groups;
create trigger duplicate_groups_updated_at
    before update on public.duplicate_groups
    for each row execute function public.set_updated_at();

-- ============================================================
-- 6. Analytics view: duplicate frequency by category
-- ============================================================
create or replace view public.duplicate_analytics as
select
    dg.company_id,
    dg.category,
    count(dgm.id)        as duplicate_count,
    avg(dgm.similarity)  as avg_similarity,
    max(dg.confidence)   as max_confidence,
    count(distinct dg.cluster_id) as cluster_count
from public.duplicate_groups dg
left join public.duplicate_group_members dgm
    on dgm.cluster_id = dg.cluster_id
group by dg.company_id, dg.category;
