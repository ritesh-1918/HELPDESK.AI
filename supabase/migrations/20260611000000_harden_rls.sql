-- Row Level Security (RLS) Hardening
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON tickets
    FOR ALL
    USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_policy ON users
    FOR ALL
    USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_policy ON comments
    FOR ALL
    USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
