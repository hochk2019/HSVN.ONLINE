-- Database Performance Indexes
-- Run this migration in Supabase SQL Editor

-- Index for posts pagination by category
CREATE INDEX IF NOT EXISTS idx_posts_category_status 
ON posts(category_id, status, published_at DESC);

-- Index for posts search by title
CREATE INDEX IF NOT EXISTS idx_posts_title_search 
ON posts USING gin(to_tsvector('simple', title));

-- Index for download logs analytics
CREATE INDEX IF NOT EXISTS idx_download_logs_software_created 
ON download_logs(software_id, created_at DESC);

-- Index for contact messages filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created 
ON contact_messages(status, created_at DESC);

-- Index for audit logs querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON audit_logs(user_id, created_at DESC);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_read_created 
ON admin_notifications(is_read, created_at DESC);

-- Index for software products by status
CREATE INDEX IF NOT EXISTS idx_software_products_status 
ON software_products(status);

-- Index for posts by author
CREATE INDEX IF NOT EXISTS idx_posts_author 
ON posts(author_id, created_at DESC);
