-- Migration: Rate Limits for AI Endpoints
-- Created: 2024-12-28

-- 1. Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);

-- 3. Create RPC function to check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_key TEXT,
    p_limit INTEGER DEFAULT 10,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record rate_limits%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
    v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::INTERVAL;
BEGIN
    -- Try to get existing record
    SELECT * INTO v_record FROM rate_limits WHERE key = p_key FOR UPDATE;
    
    IF NOT FOUND THEN
        -- First request, create record
        INSERT INTO rate_limits (key, count, window_start)
        VALUES (p_key, 1, v_now);
        RETURN TRUE;
    END IF;
    
    -- Check if window has expired
    IF v_record.window_start < v_window_start THEN
        -- Reset window
        UPDATE rate_limits 
        SET count = 1, window_start = v_now 
        WHERE key = p_key;
        RETURN TRUE;
    END IF;
    
    -- Check if limit exceeded
    IF v_record.count >= p_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Increment counter
    UPDATE rate_limits 
    SET count = count + 1 
    WHERE key = p_key;
    
    RETURN TRUE;
END;
$$;

-- 4. Allow anon/authenticated to call this RPC (for API routes)
GRANT EXECUTE ON FUNCTION check_rate_limit TO anon, authenticated;

-- 5. RLS Policy (optional, function is SECURITY DEFINER)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON rate_limits
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Cleanup old records (optional cron job or manual)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;
