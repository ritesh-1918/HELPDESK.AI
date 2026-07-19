-- Migration: Add Ticket Merge and Duplicate Detection Support
-- This migration creates tables for tracking ticket merges and links

-- ============================================================================
-- 1. Ticket Merges Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ticket_merges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    secondary_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    merged_by_user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    merge_note TEXT,
    merged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying merge history
CREATE INDEX IF NOT EXISTS idx_merges_primary 
    ON ticket_merges(primary_ticket_id, merged_at DESC);

CREATE INDEX IF NOT EXISTS idx_merges_secondary 
    ON ticket_merges(secondary_ticket_id, merged_at DESC);

CREATE INDEX IF NOT EXISTS idx_merges_company 
    ON ticket_merges(company_id, merged_at DESC);

-- ============================================================================
-- 2. Ticket Links Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ticket_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    target_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL CHECK (link_type IN ('duplicate', 'related', 'blocks', 'blocked_by')),
    notes TEXT,
    company_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_ticket_id, target_ticket_id, link_type)
);

-- Index for querying ticket relationships
CREATE INDEX IF NOT EXISTS idx_links_source 
    ON ticket_links(source_ticket_id);

CREATE INDEX IF NOT EXISTS idx_links_target 
    ON ticket_links(target_ticket_id);

CREATE INDEX IF NOT EXISTS idx_links_type 
    ON ticket_links(link_type);

-- ============================================================================
-- 3. Add merged_into field to tickets table
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'merged_into'
    ) THEN
        ALTER TABLE tickets ADD COLUMN merged_into UUID REFERENCES tickets(id) ON DELETE SET NULL;
        CREATE INDEX idx_tickets_merged_into ON tickets(merged_into);
    END IF;
END $$;

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on ticket_merges
ALTER TABLE ticket_merges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read merges for their company
CREATE POLICY merges_read_policy ON ticket_merges
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Agents/Admins can create merges
CREATE POLICY merges_insert_policy ON ticket_merges
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Enable RLS on ticket_links
ALTER TABLE ticket_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read links for their company
CREATE POLICY links_read_policy ON ticket_links
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can create links for their company
CREATE POLICY links_insert_policy ON ticket_links
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can delete their own links
CREATE POLICY links_delete_policy ON ticket_links
    FOR DELETE
    USING (
        created_by_user_id = auth.uid()
        OR company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to get all related tickets for a ticket
CREATE OR REPLACE FUNCTION get_related_tickets(p_ticket_id UUID)
RETURNS TABLE (
    related_ticket_id UUID,
    link_type TEXT,
    direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Outgoing links
    SELECT 
        tl.target_ticket_id as related_ticket_id,
        tl.link_type,
        'outgoing'::TEXT as direction
    FROM ticket_links tl
    WHERE tl.source_ticket_id = p_ticket_id
    
    UNION ALL
    
    -- Incoming links
    SELECT 
        tl.source_ticket_id as related_ticket_id,
        tl.link_type,
        'incoming'::TEXT as direction
    FROM ticket_links tl
    WHERE tl.target_ticket_id = p_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two tickets are linked
CREATE OR REPLACE FUNCTION are_tickets_linked(
    p_ticket_id_1 UUID,
    p_ticket_id_2 UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM ticket_links
        WHERE (source_ticket_id = p_ticket_id_1 AND target_ticket_id = p_ticket_id_2)
           OR (source_ticket_id = p_ticket_id_2 AND target_ticket_id = p_ticket_id_1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Views
-- ============================================================================

-- View: Duplicate ticket pairs
CREATE OR REPLACE VIEW v_duplicate_tickets AS
SELECT 
    tl.id as link_id,
    tl.source_ticket_id,
    t1.subject as source_subject,
    t1.status as source_status,
    tl.target_ticket_id,
    t2.subject as target_subject,
    t2.status as target_status,
    tl.company_id,
    tl.created_at as linked_at
FROM ticket_links tl
JOIN tickets t1 ON tl.source_ticket_id = t1.id
JOIN tickets t2 ON tl.target_ticket_id = t2.id
WHERE tl.link_type = 'duplicate';

-- ============================================================================
-- 7. Comments
-- ============================================================================

COMMENT ON TABLE ticket_merges IS 'Tracks ticket merge operations for audit trail';
COMMENT ON TABLE ticket_links IS 'Stores relationships between tickets (duplicates, related, blocking)';
COMMENT ON FUNCTION get_related_tickets IS 'Returns all tickets related to a given ticket';
COMMENT ON FUNCTION are_tickets_linked IS 'Checks if two tickets are linked';
COMMENT ON VIEW v_duplicate_tickets IS 'View of all duplicate ticket pairs';
