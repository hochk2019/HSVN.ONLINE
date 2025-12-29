-- Migration: Translation Queue
-- Created: 2024-12-28

-- 1. Create translation_queue table
CREATE TABLE IF NOT EXISTS translation_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    target_language TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by uuid REFERENCES profiles(id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_translation_queue_status ON translation_queue(status);
CREATE INDEX IF NOT EXISTS idx_translation_queue_post ON translation_queue(post_id);

-- 3. RLS
ALTER TABLE translation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to translation_queue" ON translation_queue
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Function to get next pending item
CREATE OR REPLACE FUNCTION get_next_translation_job()
RETURNS TABLE(
    id uuid,
    post_id uuid,
    target_language TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_job translation_queue%ROWTYPE;
BEGIN
    -- Get and lock next pending job
    SELECT * INTO v_job
    FROM translation_queue
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    IF FOUND THEN
        -- Mark as processing
        UPDATE translation_queue
        SET status = 'processing', started_at = NOW()
        WHERE translation_queue.id = v_job.id;
        
        RETURN QUERY SELECT v_job.id, v_job.post_id, v_job.target_language;
    END IF;
    
    RETURN;
END;
$$;

-- 5. Function to complete job
CREATE OR REPLACE FUNCTION complete_translation_job(
    p_job_id uuid,
    p_success BOOLEAN,
    p_error TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE translation_queue
    SET 
        status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
        completed_at = NOW(),
        error = p_error
    WHERE id = p_job_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_next_translation_job TO service_role;
GRANT EXECUTE ON FUNCTION complete_translation_job TO service_role;
