-- Row-Level Security for SLA-related tables (sla_policies, escalation_logs).
-- Ensures strict per-company isolation for multi-tenant hosting.
-- Standard users may read their own company's SLA policies; Company Admins
-- (role = 'admin' or 'master_admin') may insert/update/delete policies that
-- match their authenticated profile's company_id.

-- Defensive: make sure profiles.company_id exists so the policies can reference it.
alter table if exists "public"."profiles"
    add column if not exists company_id uuid;

-- Defensive: make sure the target tables exist before applying RLS to them.
create table if not exists "public"."sla_policies" (
    id uuid default gen_random_uuid() primary key,
    company_id uuid not null,
    name text not null,
    response_time_minutes integer,
    resolution_time_minutes integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists "public"."escalation_logs" (
    id uuid default gen_random_uuid() primary key,
    company_id uuid not null,
    sla_policy_id uuid references "public"."sla_policies"(id) on delete cascade,
    ticket_id uuid,
    escalated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    reason text
);

-- Turn on RLS
alter table "public"."sla_policies" enable row level security;
alter table "public"."escalation_logs" enable row level security;

-- =====================================================================
-- sla_policies policies
-- =====================================================================

drop policy if exists "sla_policies select by company" on "public"."sla_policies";
create policy "sla_policies select by company"
on "public"."sla_policies" for select
to authenticated
using (
    company_id = (select company_id from public.profiles where id = auth.uid())
);

drop policy if exists "sla_policies insert by company admin" on "public"."sla_policies";
create policy "sla_policies insert by company admin"
on "public"."sla_policies" for insert
to authenticated
with check (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
);

drop policy if exists "sla_policies update by company admin" on "public"."sla_policies";
create policy "sla_policies update by company admin"
on "public"."sla_policies" for update
to authenticated
using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
)
with check (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
);

drop policy if exists "sla_policies delete by company admin" on "public"."sla_policies";
create policy "sla_policies delete by company admin"
on "public"."sla_policies" for delete
to authenticated
using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
);

-- =====================================================================
-- escalation_logs policies
-- =====================================================================

drop policy if exists "escalation_logs select by company" on "public"."escalation_logs";
create policy "escalation_logs select by company"
on "public"."escalation_logs" for select
to authenticated
using (
    company_id = (select company_id from public.profiles where id = auth.uid())
);

drop policy if exists "escalation_logs insert by company admin" on "public"."escalation_logs";
create policy "escalation_logs insert by company admin"
on "public"."escalation_logs" for insert
to authenticated
with check (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
);

drop policy if exists "escalation_logs update by company admin" on "public"."escalation_logs";
create policy "escalation_logs update by company admin"
on "public"."escalation_logs" for update
to authenticated
using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
)
with check (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
);

drop policy if exists "escalation_logs delete by company admin" on "public"."escalation_logs";
create policy "escalation_logs delete by company admin"
on "public"."escalation_logs" for delete
to authenticated
using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin', 'master_admin')
);
