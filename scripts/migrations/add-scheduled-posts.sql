-- Add scheduled_at column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Add check constraint for scheduled status
-- scheduled_at should be set when status is 'scheduled'
CREATE OR REPLACE FUNCTION check_scheduled_post()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'scheduled' AND NEW.scheduled_at IS NULL THEN
        RAISE EXCEPTION 'scheduled_at is required when status is scheduled';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_scheduled_post_trigger ON posts;
CREATE TRIGGER check_scheduled_post_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION check_scheduled_post();

-- Index for scheduled posts query
CREATE INDEX IF NOT EXISTS idx_posts_scheduled 
ON posts(scheduled_at) 
WHERE status = 'scheduled';
