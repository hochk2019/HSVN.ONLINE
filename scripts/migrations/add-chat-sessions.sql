-- Chat Sessions Table for Golden Copilot
-- Log user questions and AI responses for analytics

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Message data
    user_message TEXT NOT NULL,
    ai_response TEXT,
    model_used VARCHAR(100),
    
    -- Analytics
    intent VARCHAR(50),  -- detected intent if any
    response_time_ms INTEGER,
    
    -- Status
    is_helpful BOOLEAN,  -- user feedback if given
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_intent ON chat_sessions(intent) WHERE intent IS NOT NULL;

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from public (for chatbot)
CREATE POLICY "Allow public insert chat sessions"
    ON chat_sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Only authenticated users can read
CREATE POLICY "Authenticated users can read chat sessions"
    ON chat_sessions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- View for analytics: Top questions
CREATE OR REPLACE VIEW chat_analytics AS
SELECT 
    date_trunc('day', created_at) as date,
    COUNT(*) as total_messages,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(response_time_ms) as avg_response_time,
    COUNT(CASE WHEN is_helpful = true THEN 1 END) as helpful_count,
    COUNT(CASE WHEN is_helpful = false THEN 1 END) as not_helpful_count
FROM chat_sessions
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;
