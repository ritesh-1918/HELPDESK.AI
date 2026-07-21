-- Critical bounty: semantic duplicate ticket detection

create extension if not exists vector;

alter table if exists public.tickets
  add column if not exists description_vector vector(384),
  add column if not exists is_potential_duplicate boolean not null default false,
  add column if not exists parent_ticket_id text;

create index if not exists tickets_description_vector_idx
  on public.tickets
  using ivfflat (description_vector vector_cosine_ops)
  with (lists = 100);

create index if not exists tickets_company_id_idx
  on public.tickets (company_id);

drop function if exists public.match_tickets(vector, float, int, uuid);

create or replace function public.match_tickets(
  query_vector vector(384),
  match_threshold float,
  match_count int,
  tenant_company_id uuid
)
returns table (
  id uuid,
  ticket_id text,
  summary text,
  parent_ticket_id text,
  similarity float
)
language sql
stable
as $$
  select
    t.id,
    t.ticket_id,
    t.summary,
    t.parent_ticket_id,
    1 - (t.description_vector <=> query_vector) as similarity
  from public.tickets t
  where t.company_id = tenant_company_id
    and t.description_vector is not null
    and 1 - (t.description_vector <=> query_vector) > match_threshold
  order by t.description_vector <=> query_vector
  limit match_count;
$$;
