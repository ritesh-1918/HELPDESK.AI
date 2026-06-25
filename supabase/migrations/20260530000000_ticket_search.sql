-- Full-text ticket search via pg_trgm.
-- Adds trigram indexes on the searchable ticket columns plus a
-- security-invoker RPC so callers automatically inherit existing
-- row level security (admins see only their company, users see only
-- their own tickets, etc.).

create extension if not exists pg_trgm;

create index if not exists tickets_subject_trgm_idx
    on public.tickets using gin (subject gin_trgm_ops);

create index if not exists tickets_description_trgm_idx
    on public.tickets using gin (description gin_trgm_ops);

create index if not exists tickets_category_trgm_idx
    on public.tickets using gin (category gin_trgm_ops);

create index if not exists tickets_status_trgm_idx
    on public.tickets using gin (status gin_trgm_ops);

create index if not exists profiles_full_name_trgm_idx
    on public.profiles using gin (full_name gin_trgm_ops);

create or replace function public.search_tickets(q text, limit_count int default 8)
returns table (
    id uuid,
    subject text,
    description text,
    category text,
    status text,
    priority text,
    assigned_agent_id uuid,
    assignee_name text,
    created_at timestamptz,
    rank real
)
language sql
stable
security invoker
set search_path = public
as $$
    select
        t.id,
        t.subject,
        t.description,
        t.category,
        t.status,
        t.priority,
        t.assigned_agent_id,
        p.full_name as assignee_name,
        t.created_at,
        greatest(
            similarity(coalesce(t.subject, ''), q),
            similarity(coalesce(t.description, ''), q),
            similarity(coalesce(t.category, ''), q),
            similarity(coalesce(t.status, ''), q),
            similarity(coalesce(p.full_name, ''), q)
        ) as rank
    from public.tickets t
    left join public.profiles p on p.id = t.assigned_agent_id
    where
        q is not null
        and length(trim(q)) > 0
        and (
            coalesce(t.subject, '') ilike '%' || q || '%'
            or coalesce(t.description, '') ilike '%' || q || '%'
            or coalesce(t.category, '') ilike '%' || q || '%'
            or coalesce(t.status, '') ilike '%' || q || '%'
            or coalesce(t.id::text, '') ilike '%' || q || '%'
            or coalesce(p.full_name, '') ilike '%' || q || '%'
        )
    order by rank desc nulls last, t.created_at desc
    limit greatest(1, least(coalesce(limit_count, 8), 50));
$$;

grant execute on function public.search_tickets(text, int) to authenticated;
