-- Migration: Add Knowledge Base Suggestion Interactions Table
-- Implements KB suggestion tracking and analytics for Issue #3203

-- ============================================================================
-- 1. Create kb_suggestion_interactions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kb_suggestion_interactions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id           UUID        NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    article_id          UUID        NOT NULL,  -- Reference to KB article (external)
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    interaction_type    TEXT        NOT NULL CHECK (interaction_type IN ('viewed', 'helpful', 'not_helpful')),
    user_id             UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.kb_suggestion_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company members can view interactions from their company
CREATE POLICY "Company members can view KB interactions" ON public.kb_suggestion_interactions
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- RLS Policy: Users can insert interactions for their company
CREATE POLICY "Users can record KB interactions" ON public.kb_suggestion_interactions
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
        OR current_setting('role') = 'service_role'
    );

-- RLS Policy: Admins can update interactions
CREATE POLICY "Admins can manage KB interactions" ON public.kb_suggestion_interactions
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_kb_interactions_company_id ON public.kb_suggestion_interactions(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_interactions_ticket_id ON public.kb_suggestion_interactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_kb_interactions_article_id ON public.kb_suggestion_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_interactions_type ON public.kb_suggestion_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_kb_interactions_created_at ON public.kb_suggestion_interactions(created_at DESC);

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_kb_interactions_company_article ON public.kb_suggestion_interactions(company_id, article_id);
CREATE INDEX IF NOT EXISTS idx_kb_interactions_company_type ON public.kb_suggestion_interactions(company_id, interaction_type);

-- ============================================================================
-- 2. Trigger to update kb_suggestion_interactions timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_kb_interactions_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_kb_interactions_updated_at
    BEFORE UPDATE ON public.kb_suggestion_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_kb_interactions_timestamp();

-- ============================================================================
-- 3. Helper function to get KB suggestion analytics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_kb_analytics(
    company_id_param UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    article_id UUID,
    total_views INTEGER,
    helpful_count INTEGER,
    not_helpful_count INTEGER,
    helpful_ratio NUMERIC,
    interaction_trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.article_id,
        COUNT(*)::INTEGER as total_views,
        COUNT(*) FILTER (WHERE ki.interaction_type = 'helpful')::INTEGER as helpful_count,
        COUNT(*) FILTER (WHERE ki.interaction_type = 'not_helpful')::INTEGER as not_helpful_count,
        ROUND(
            COUNT(*) FILTER (WHERE ki.interaction_type = 'helpful')::NUMERIC / 
            NULLIF(COUNT(*)::NUMERIC, 0) * 100, 2
        ) as helpful_ratio,
        CASE 
            WHEN COUNT(*) > 100 THEN 'trending'
            WHEN COUNT(*) > 50 THEN 'popular'
            ELSE 'baseline'
        END as interaction_trend
    FROM public.kb_suggestion_interactions ki
    WHERE ki.company_id = company_id_param
        AND ki.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ki.article_id
    ORDER BY total_views DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Helper function to get top suggested articles
-- ============================================================================

CREATE OR REPLACE FUNCTION get_top_kb_articles(
    company_id_param UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    article_id UUID,
    suggestion_count INTEGER,
    avg_helpfulness NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.article_id,
        COUNT(*)::INTEGER as suggestion_count,
        ROUND(
            COUNT(*) FILTER (WHERE ki.interaction_type = 'helpful')::NUMERIC / 
            NULLIF(COUNT(*)::NUMERIC, 0) * 100, 2
        ) as avg_helpfulness
    FROM public.kb_suggestion_interactions ki
    WHERE ki.company_id = company_id_param
    GROUP BY ki.article_id
    ORDER BY suggestion_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.kb_suggestion_interactions TO authenticated;
GRANT ALL ON public.kb_suggestion_interactions TO service_role;

GRANT EXECUTE ON FUNCTION get_kb_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_kb_articles(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- 6. Add comments
-- ============================================================================

COMMENT ON TABLE public.kb_suggestion_interactions IS 'Tracks user interactions with knowledge base article suggestions';
COMMENT ON COLUMN public.kb_suggestion_interactions.interaction_type IS 'Type of interaction: viewed, helpful, or not_helpful';
COMMENT ON COLUMN public.kb_suggestion_interactions.user_id IS 'User who interacted with the suggestion';
COMMENT ON FUNCTION get_kb_analytics IS 'Analytics for KB articles including views, helpfulness, and trends';
COMMENT ON FUNCTION get_top_kb_articles IS 'Get top performing KB articles by suggestion count';
