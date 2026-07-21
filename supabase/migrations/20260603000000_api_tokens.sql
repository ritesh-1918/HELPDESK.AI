-- API Token Management Framework
-- Supports granular scopes, IP whitelisting, usage tracking, and audit events.

-- ─── Token storage ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_tokens (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name         text NOT NULL,
    token_hash   text NOT NULL UNIQUE,
    token_prefix text NOT NULL,
    owner_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id   uuid NOT NULL,
    scopes       text[] NOT NULL DEFAULT '{}',
    status       text NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at   timestamp with time zone,
    allowed_ips  text[] NOT NULL DEFAULT '{}',
    last_used_at timestamp with time zone,
    last_used_ip text,
    created_at   timestamp with time zone NOT NULL DEFAULT now(),
    revoked_at   timestamp with time zone,
    revoked_by   uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_owner     ON api_tokens(owner_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_company   ON api_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_status    ON api_tokens(status);
CREATE INDEX IF NOT EXISTS idx_api_tokens_hash      ON api_tokens(token_hash);

-- ─── Per-request usage log ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_token_usage (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id      uuid NOT NULL REFERENCES api_tokens(id) ON DELETE CASCADE,
    company_id    uuid NOT NULL,
    endpoint      text NOT NULL,
    method        text NOT NULL DEFAULT 'GET',
    status_code   integer NOT NULL,
    ip_address    text,
    response_ms   integer,
    created_at    timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_token_id  ON api_token_usage(token_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_company   ON api_token_usage(company_id, created_at DESC);

-- ─── Audit events ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_token_audit (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id    uuid REFERENCES api_tokens(id) ON DELETE SET NULL,
    company_id  uuid NOT NULL,
    actor_id    uuid REFERENCES auth.users(id),
    event_type  text NOT NULL
                    CHECK (event_type IN ('created', 'revoked', 'rotated', 'ip_blocked', 'scope_denied', 'expired')),
    metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_audit_token   ON api_token_audit(token_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_audit_company ON api_token_audit(company_id, created_at DESC);

-- ─── Row-level security ─────────────────────────────────────────────────────

ALTER TABLE api_tokens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_token_audit ENABLE ROW LEVEL SECURITY;

-- Service role retains full unrestricted access (used by backend middleware).
CREATE POLICY "Service role full access to api_tokens"
    ON api_tokens FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to api_token_usage"
    ON api_token_usage FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to api_token_audit"
    ON api_token_audit FOR ALL USING (auth.role() = 'service_role');

-- Company admins can manage tokens belonging to their own company.
CREATE POLICY "Admins manage own company tokens"
    ON api_tokens FOR ALL USING (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins view own company token usage"
    ON api_token_usage FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins view own company token audit"
    ON api_token_audit FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin')
        )
    );

GRANT SELECT, INSERT, UPDATE ON api_tokens      TO authenticated;
GRANT SELECT                  ON api_token_usage TO authenticated;
GRANT SELECT                  ON api_token_audit TO authenticated;
GRANT ALL                     ON api_tokens      TO service_role;
GRANT ALL                     ON api_token_usage TO service_role;
GRANT ALL                     ON api_token_audit TO service_role;

-- ─── Column documentation ────────────────────────────────────────────────────

COMMENT ON COLUMN api_tokens.token_hash   IS 'SHA-256 hash of the raw token secret. The plaintext is never persisted.';
COMMENT ON COLUMN api_tokens.token_prefix IS 'First 8 characters of the raw token displayed in the UI for identification.';
COMMENT ON COLUMN api_tokens.scopes       IS 'Array of granted permission scopes, e.g. {tickets:read, analytics:read}.';
COMMENT ON COLUMN api_tokens.allowed_ips  IS 'Optional CIDR/IP whitelist. Empty array means no IP restriction.';
COMMENT ON COLUMN api_tokens.expires_at   IS 'UTC timestamp after which the token is automatically invalid.';
