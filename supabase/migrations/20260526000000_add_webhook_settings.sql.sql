-- Webhook Settings Table
-- Stores Slack/Teams webhook URL per company tenant

CREATE TABLE IF NOT EXISTS webhook_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast company lookup
CREATE INDEX IF NOT EXISTS idx_webhook_settings_company 
ON webhook_settings(company_id);

-- Row Level Security
ALTER TABLE webhook_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read/write their own company webhook settings
CREATE POLICY "Admins can manage their company webhook settings"
ON webhook_settings
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);