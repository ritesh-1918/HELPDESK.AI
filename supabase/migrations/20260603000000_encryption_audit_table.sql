-- Migration for Encryption Key Management, Audit Logging and Rotation History
create extension if not exists pgcrypto;

-- 1. Encryption Audit Logs Table
create table if not exists public.encryption_audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id text,
    organization_id text,
    timestamp timestamptz not null default now(),
    operation_type text not null, -- 'ENCRYPT', 'DECRYPT', 'ROTATE', 'RE-ENCRYPT'
    field_accessed text,          -- 'contact_email', 'description', 'raw_text', etc.
    key_version integer not null,
    request_source text,
    status text not null,         -- 'SUCCESS', 'FAILED'
    error_message text,
    created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.encryption_audit_logs enable row level security;

-- Grant permissions to postgres and service_role
grant all on public.encryption_audit_logs to postgres, service_role;
grant select on public.encryption_audit_logs to authenticated;

-- RLS policies
create policy "Allow service_role full access to encryption_audit_logs" 
on public.encryption_audit_logs for all to service_role using (true) with check (true);

-- 2. Key Rotation History Table
create table if not exists public.encryption_key_rotation_history (
    id uuid primary key default gen_random_uuid(),
    tenant_id text not null, -- 'global' or organization_id
    key_version integer not null,
    active_from timestamptz not null default now(),
    expires_at timestamptz not null,
    retired_at timestamptz,
    created_at timestamptz default now(),
    unique(tenant_id, key_version)
);

-- Enable RLS
alter table public.encryption_key_rotation_history enable row level security;

-- Grant permissions to postgres and service_role
grant all on public.encryption_key_rotation_history to postgres, service_role;
grant select on public.encryption_key_rotation_history to authenticated;

-- RLS policies
create policy "Allow service_role full access to encryption_key_rotation_history"
on public.encryption_key_rotation_history for all to service_role using (true) with check (true);

-- 3. Create indexes for performance
create index if not exists idx_encryption_audit_logs_org_id on public.encryption_audit_logs(organization_id);
create index if not exists idx_encryption_audit_logs_timestamp on public.encryption_audit_logs(timestamp);
create index if not exists idx_key_rotation_tenant_version on public.encryption_key_rotation_history(tenant_id, key_version);

-- 4. Secure RPC to fetch or initialize the Master Key
create or replace function public.get_master_encryption_key()
returns text
language plpgsql
security definer
as $$
declare
    m_key text;
begin
    -- Try to retrieve from vault schema if it exists
    begin
        select secret into m_key from vault.secrets where name = 'MASTER_ENCRYPTION_KEY' limit 1;
    exception when others then
        m_key := null;
    end;

    -- Fallback to internal_config schema if not found in vault
    if m_key is null then
        begin
            select value into m_key from internal_config.secrets where name = 'MASTER_ENCRYPTION_KEY' limit 1;
        exception when others then
            m_key := null;
        end;
    end if;

    -- If still null, generate a new master key and persist it
    if m_key is null then
        m_key := encode(gen_random_bytes(32), 'hex');

        -- Attempt to save in internal_config.secrets
        begin
            insert into internal_config.secrets (name, value)
            values ('MASTER_ENCRYPTION_KEY', m_key)
            on conflict (name) do update set value = excluded.value;
        exception when others then
            null;
        end;

        -- Attempt to save in vault.secrets
        begin
            insert into vault.secrets (name, description, secret)
            values ('MASTER_ENCRYPTION_KEY', 'Master encryption key for PII data', m_key)
            on conflict (name) do update set secret = excluded.secret;
        exception when others then
            null;
        end;
    end if;

    return m_key;
end;
$$;

-- Restrict execution of get_master_encryption_key
revoke all on function public.get_master_encryption_key() from public;
grant execute on function public.get_master_encryption_key() to postgres, service_role;

-- 5. Secure RPC to get/auto-rotate active key version for a tenant
create or replace function public.get_active_key_version(p_tenant_id text)
returns integer
language plpgsql
security definer
as $$
declare
    v_tenant text := coalesce(p_tenant_id, 'global');
    v_version integer;
    v_expires timestamptz;
begin
    -- Automatically retire key versions that expired more than 30 days ago
    update public.encryption_key_rotation_history
    set retired_at = now()
    where tenant_id = v_tenant 
      and retired_at is null 
      and expires_at + interval '30 days' <= now();

    -- Retrieve current active version
    select key_version, expires_at into v_version, v_expires
    from public.encryption_key_rotation_history
    where tenant_id = v_tenant and retired_at is null
    order by key_version desc
    limit 1;

    -- If none exists, or if current key has expired, generate/rotate key version
    if v_version is null then
        v_version := 1;
        insert into public.encryption_key_rotation_history (tenant_id, key_version, active_from, expires_at)
        values (v_tenant, v_version, now(), now() + interval '90 days');
    elsif v_expires <= now() then
        v_version := v_version + 1;
        insert into public.encryption_key_rotation_history (tenant_id, key_version, active_from, expires_at)
        values (v_tenant, v_version, now(), now() + interval '90 days');
    end if;

    return v_version;
end;
$$;

revoke all on function public.get_active_key_version(text) from public;
grant execute on function public.get_active_key_version(text) to postgres, service_role;

-- 6. Secure RPC to manually rotate the encryption key for a tenant
create or replace function public.rotate_encryption_key(p_tenant_id text)
returns integer
language plpgsql
security definer
as $$
declare
    v_tenant text := coalesce(p_tenant_id, 'global');
    v_curr_version integer;
    v_new_version integer;
begin
    -- Retire older key versions if they should be retired
    update public.encryption_key_rotation_history
    set retired_at = now()
    where tenant_id = v_tenant 
      and retired_at is null 
      and expires_at + interval '30 days' <= now();

    -- Find the max key version
    select coalesce(max(key_version), 0) into v_curr_version
    from public.encryption_key_rotation_history
    where tenant_id = v_tenant;

    v_new_version := v_curr_version + 1;

    -- Insert new version immediately, marking older versions expired
    -- We set expires_at for the new key 90 days out
    insert into public.encryption_key_rotation_history (tenant_id, key_version, active_from, expires_at)
    values (v_tenant, v_new_version, now(), now() + interval '90 days');

    -- Update previous active key's expires_at to now so it starts its grace period immediately
    update public.encryption_key_rotation_history
    set expires_at = now()
    where tenant_id = v_tenant 
      and key_version = v_curr_version;

    return v_new_version;
end;
$$;

revoke all on function public.rotate_encryption_key(text) from public;
grant execute on function public.rotate_encryption_key(text) to postgres, service_role;
