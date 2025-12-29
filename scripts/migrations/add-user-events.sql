-- User Events Table for Recommendation Engine
-- Track user behavior to personalize content recommendations

-- User events table
CREATE TABLE IF NOT EXISTS user_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User identification (cookie-based for anonymous, user_id for logged in)
    session_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'post_view', 'software_view', 'download', 'cta_click', 'search'
    
    -- Target entity
    target_type VARCHAR(30), -- 'post', 'software', 'category', 'page'
    target_id UUID,
    target_slug VARCHAR(200),
    
    -- Additional context
    metadata JSONB DEFAULT '{}', -- Extra data like search query, referrer, etc.
    
    -- Client info
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_events_session ON user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_target ON user_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_events_created ON user_events(created_at DESC);

-- Enable RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from public (for tracking)
CREATE POLICY "Allow public insert events"
    ON user_events
    FOR INSERT
    WITH CHECK (true);

-- Policy: Only authenticated admins can read
CREATE POLICY "Admins can read events"
    ON user_events
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- View: User content preferences
CREATE OR REPLACE VIEW user_content_preferences AS
SELECT 
    session_id,
    user_id,
    p.category_id,
    c.name as category_name,
    COUNT(*) as view_count,
    MAX(e.created_at) as last_viewed
FROM user_events e
LEFT JOIN posts p ON e.target_id = p.id AND e.target_type = 'post'
LEFT JOIN categories c ON p.category_id = c.id
WHERE e.event_type IN ('post_view', 'page_view')
  AND p.category_id IS NOT NULL
GROUP BY session_id, user_id, p.category_id, c.name;

-- View: Popular content (for homepage)
CREATE OR REPLACE VIEW popular_content AS
SELECT 
    target_type,
    target_id,
    COUNT(*) as view_count,
    COUNT(DISTINCT session_id) as unique_visitors,
    MAX(created_at) as last_viewed
FROM user_events
WHERE event_type IN ('post_view', 'software_view')
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY target_type, target_id
ORDER BY view_count DESC;

-- Function: Get recommended posts for a session
CREATE OR REPLACE FUNCTION get_recommendations(
    p_session_id VARCHAR(100),
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    post_id UUID,
    title TEXT,
    slug VARCHAR,
    category_id UUID,
    score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH user_categories AS (
        -- Get categories this user has viewed
        SELECT DISTINCT p.category_id, COUNT(*) as weight
        FROM user_events e
        JOIN posts p ON e.target_id = p.id AND e.target_type = 'post'
        WHERE e.session_id = p_session_id
        GROUP BY p.category_id
    ),
    viewed_posts AS (
        -- Posts user has already seen
        SELECT DISTINCT target_id 
        FROM user_events 
        WHERE session_id = p_session_id 
          AND target_type = 'post'
    )
    SELECT 
        p.id as post_id,
        p.title,
        p.slug,
        p.category_id,
        COALESCE(uc.weight, 0) + 
        (CASE WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 2 ELSE 0 END) as score
    FROM posts p
    LEFT JOIN user_categories uc ON p.category_id = uc.category_id
    WHERE p.status = 'published'
      AND p.id NOT IN (SELECT target_id FROM viewed_posts WHERE target_id IS NOT NULL)
    ORDER BY score DESC, p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
