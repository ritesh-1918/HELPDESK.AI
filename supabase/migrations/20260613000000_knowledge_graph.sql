-- Migration: Create Knowledge Graph tables and seed defaults

-- 1. Create Nodes Table
CREATE TABLE IF NOT EXISTS public.knowledge_graph_nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    company_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Edges Table
CREATE TABLE IF NOT EXISTS public.knowledge_graph_edges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id TEXT REFERENCES public.knowledge_graph_nodes(id) ON DELETE CASCADE NOT NULL,
    target_id TEXT REFERENCES public.knowledge_graph_nodes(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT NOT NULL,
    company_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_edge UNIQUE (source_id, target_id, relationship_type)
);

-- 3. Enable RLS
ALTER TABLE public.knowledge_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_edges ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Auth users can view
CREATE POLICY "Nodes viewable by authenticated users" ON public.knowledge_graph_nodes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Edges viewable by authenticated users" ON public.knowledge_graph_edges
    FOR SELECT TO authenticated USING (true);

-- service_role has full control
CREATE POLICY "Nodes full access to service_role" ON public.knowledge_graph_nodes
    FOR ALL TO service_role USING (true);

CREATE POLICY "Edges full access to service_role" ON public.knowledge_graph_edges
    FOR ALL TO service_role USING (true);

-- Authenticated users can write nodes/edges too for logging ticket relations
CREATE POLICY "Nodes writable by authenticated users" ON public.knowledge_graph_nodes
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Edges writable by authenticated users" ON public.knowledge_graph_edges
    FOR ALL TO authenticated USING (true);

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_nodes_type ON public.knowledge_graph_nodes(type);
CREATE INDEX IF NOT EXISTS idx_edges_source ON public.knowledge_graph_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON public.knowledge_graph_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_edges_rel ON public.knowledge_graph_edges(relationship_type);

-- 6. Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_graph_nodes TO authenticated;
GRANT ALL ON public.knowledge_graph_nodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_graph_edges TO authenticated;
GRANT ALL ON public.knowledge_graph_edges TO service_role;

-- 7. Seed Default System Nodes
INSERT INTO public.knowledge_graph_nodes (id, name, type, metadata) VALUES
('server_001', 'Server-01', 'SERVER', '{"ip": "192.168.1.10", "team": "Infrastructure", "location": "Data Center A", "aliases": ["Server-01", "Server01", "SRV-01", "srv-01"]}'::jsonb),
('server_002', 'Server-02', 'SERVER', '{"ip": "192.168.1.11", "team": "Infrastructure", "location": "Data Center B", "aliases": ["Server-02", "Server02", "SRV-02", "srv-02"]}'::jsonb),
('database_prod_01', 'MySQL-DB', 'DATABASE', '{"db_type": "MySQL", "team": "Database Administration", "role": "production", "aliases": ["DB-01", "Database-01", "MYSQL-PROD", "MySQL-DB", "MySQL Database", "Database-A"]}'::jsonb),
('database_prod_02', 'PostgreSQL-DB', 'DATABASE', '{"db_type": "Postgres", "team": "Database Administration", "role": "production", "aliases": ["DB-02", "Database-02", "POSTGRES-PROD", "Postgres-DB", "Postgres Database"]}'::jsonb),
('crm_service', 'CRM Service', 'SERVICE', '{"owner": "CRM Team", "criticality": "high", "aliases": ["CRM", "CRM Service", "CRM-Service", "CRM app", "CRM Service App"]}'::jsonb),
('billing_api', 'Billing API', 'API', '{"owner": "Finance Tech Team", "version": "v2", "aliases": ["Billing API", "Billing-API", "Billing Endpoint", "Billing-Service"]}'::jsonb),
('infrastructure_team', 'Infrastructure Team', 'TEAM', '{"lead": "Alice Manager", "aliases": ["Infrastructure Team", "Infrastructure", "Infra", "Sysadmin"]}'::jsonb),
('dba_team', 'Database Administration Team', 'TEAM', '{"lead": "Bob Admin", "aliases": ["Database Administration Team", "DBA Team", "DBA", "Database Team"]}'::jsonb),
('iam_team', 'IAM Team', 'TEAM', '{"lead": "Charlie Sec", "aliases": ["IAM Team", "IAM", "Security Team", "Identity Team"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Default System Relationships
INSERT INTO public.knowledge_graph_edges (source_id, target_id, relationship_type, metadata) VALUES
('crm_service', 'database_prod_01', 'depends_on', '{"strength": "critical"}'::jsonb),
('crm_service', 'server_001', 'runs_on', '{}'::jsonb),
('billing_api', 'database_prod_01', 'depends_on', '{"strength": "high"}'::jsonb),
('billing_api', 'server_002', 'runs_on', '{}'::jsonb),
('database_prod_01', 'server_001', 'connected_to', '{}'::jsonb),
('database_prod_02', 'server_002', 'connected_to', '{}'::jsonb),
('server_001', 'infrastructure_team', 'owned_by', '{}'::jsonb),
('server_002', 'infrastructure_team', 'owned_by', '{}'::jsonb),
('database_prod_01', 'dba_team', 'owned_by', '{}'::jsonb),
('database_prod_02', 'dba_team', 'owned_by', '{}'::jsonb),
('billing_api', 'iam_team', 'owned_by', '{}'::jsonb)
ON CONFLICT (source_id, target_id, relationship_type) DO NOTHING;
