create extension if not exists pg_cron;

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    ticket_id uuid not null references public.tickets(id) on delete cascade,
    company_id uuid not null references public.companies(id) on delete cascade,
    performed_by uuid references public.profiles(id) on delete set null,
    action varchar(64) not null,
    old_value jsonb,
    new_value jsonb,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists audit_logs_ticket_company_created_idx
    on public.audit_logs (ticket_id, company_id, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Audit logs are readable within the same company" on public.audit_logs;

create policy "Audit logs are readable within the same company"
on public.audit_logs
for select
to authenticated
using (
    company_id = (
        select p.company_id
        from public.profiles p
        where p.id = auth.uid()
    )
);

create or replace function public.priority_rank(priority_text text)
returns integer
language sql
immutable
as $$
    select case lower(coalesce(priority_text, ''))
        when 'critical' then 4
        when 'high' then 3
        when 'medium' then 2
        when 'low' then 1
        else 0
    end;
$$;

create or replace function public.log_ticket_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    actor_id uuid := auth.uid();
    status_action varchar(64);
    priority_action varchar(64);
begin
    if tg_op = 'INSERT' then
        insert into public.audit_logs (
            ticket_id, company_id, performed_by, action, old_value, new_value
        ) values (
            new.id,
            new.company_id,
            actor_id,
            'TICKET_CREATED',
            null,
            jsonb_build_object(
                'field', 'status',
                'value', new.status,
                'summary', new.subject,
                'priority', new.priority,
                'assigned_team', new.assigned_team
            )
        );
        return new;
    end if;

    if new.status is distinct from old.status then
        status_action := case
            when lower(coalesce(new.status, '')) like '%escalat%' then 'STATUS_ESCALATED'
            else 'STATUS_CHANGED'
        end;

        insert into public.audit_logs (
            ticket_id, company_id, performed_by, action, old_value, new_value
        ) values (
            new.id,
            new.company_id,
            actor_id,
            status_action,
            jsonb_build_object('field', 'status', 'value', old.status),
            jsonb_build_object('field', 'status', 'value', new.status)
        );
    end if;

    if new.priority is distinct from old.priority then
        priority_action := case
            when public.priority_rank(new.priority) > public.priority_rank(old.priority) then 'PRIORITY_ESCALATED'
            else 'PRIORITY_CHANGED'
        end;

        insert into public.audit_logs (
            ticket_id, company_id, performed_by, action, old_value, new_value
        ) values (
            new.id,
            new.company_id,
            actor_id,
            priority_action,
            jsonb_build_object('field', 'priority', 'value', old.priority),
            jsonb_build_object('field', 'priority', 'value', new.priority)
        );
    end if;

    if new.assigned_agent_id is distinct from old.assigned_agent_id then
        insert into public.audit_logs (
            ticket_id, company_id, performed_by, action, old_value, new_value
        ) values (
            new.id,
            new.company_id,
            actor_id,
            'TICKET_ASSIGNED',
            jsonb_build_object('field', 'assigned_agent_id', 'value', old.assigned_agent_id),
            jsonb_build_object('field', 'assigned_agent_id', 'value', new.assigned_agent_id)
        );
    end if;

    if new.assigned_team is distinct from old.assigned_team then
        insert into public.audit_logs (
            ticket_id, company_id, performed_by, action, old_value, new_value
        ) values (
            new.id,
            new.company_id,
            actor_id,
            'TEAM_ROUTED',
            jsonb_build_object('field', 'assigned_team', 'value', old.assigned_team),
            jsonb_build_object('field', 'assigned_team', 'value', new.assigned_team)
        );
    end if;

    if new.metadata is distinct from old.metadata then
        insert into public.audit_logs (
            ticket_id, company_id, performed_by, action, old_value, new_value
        ) values (
            new.id,
            new.company_id,
            actor_id,
            'METADATA_UPDATED',
            old.metadata,
            new.metadata
        );
    end if;

    return new;
end;
$$;

drop trigger if exists ticket_audit_logs_trigger on public.tickets;

create trigger ticket_audit_logs_trigger
after insert or update on public.tickets
for each row
execute function public.log_ticket_audit();

create or replace function public.log_stale_ticket_escalations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.audit_logs (
        ticket_id,
        company_id,
        performed_by,
        action,
        old_value,
        new_value
    )
    select
        t.id,
        t.company_id,
        null,
        'AUTO_ESCALATED',
        jsonb_build_object(
            'field', 'ticket_state',
            'status', t.status,
            'assigned_agent_id', t.assigned_agent_id,
            'age_minutes', floor(extract(epoch from (now() - t.created_at)) / 60)::int
        ),
        jsonb_build_object(
            'reason', case
                when t.assigned_agent_id is null then 'unassigned'
                else 'unanswered'
            end,
            'threshold_minutes', case
                when public.priority_rank(t.priority) >= 3 then 60
                else 120
            end,
            'escalation_level', case
                when public.priority_rank(t.priority) >= 4 then 'critical'
                when public.priority_rank(t.priority) >= 3 then 'high'
                else 'standard'
            end
        )
    from public.tickets t
    where lower(coalesce(t.status, '')) not in ('resolved', 'closed', 'done')
      and (
        (t.assigned_agent_id is null and t.created_at <= now() - interval '2 hours')
        or (t.assigned_agent_id is not null and coalesce(t.updated_at, t.created_at) <= now() - interval '4 hours')
      )
      and not exists (
        select 1
        from public.audit_logs a
        where a.ticket_id = t.id
          and a.action = 'AUTO_ESCALATED'
          and a.created_at >= now() - interval '6 hours'
      );
end;
$$;

do $$
begin
    if exists (select 1 from pg_extension where extname = 'pg_cron') then
        if not exists (
            select 1
            from cron.job
            where jobname = 'ticket-escalation-audit'
        ) then
            perform cron.schedule(
                'ticket-escalation-audit',
                '*/15 * * * *',
                $schedule$select public.log_stale_ticket_escalations();$schedule$
            );
        end if;
    end if;
end $$;