-- =====================================================
-- Golden Logistics RLS Policies
-- Chạy file này SAU KHI đã chạy 01_schema.sql
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is editor or admin
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
-- Users can read any profile
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only admin can update roles
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================
-- Public can read all categories
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

-- Only admin can manage categories
CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- TAGS POLICIES
-- =====================================================
-- Public can read all tags
CREATE POLICY "Tags are viewable by everyone"
    ON tags FOR SELECT
    USING (true);

-- Editor/Admin can manage tags
CREATE POLICY "Editors can manage tags"
    ON tags FOR ALL
    USING (is_editor_or_admin())
    WITH CHECK (is_editor_or_admin());

-- =====================================================
-- POSTS POLICIES
-- =====================================================
-- Public can only read published posts
CREATE POLICY "Published posts are viewable by everyone"
    ON posts FOR SELECT
    USING (
        status = 'published' 
        AND published_at <= NOW()
    );

-- Editors can read all posts
CREATE POLICY "Editors can view all posts"
    ON posts FOR SELECT
    USING (is_editor_or_admin());

-- Editors can create posts
CREATE POLICY "Editors can create posts"
    ON posts FOR INSERT
    WITH CHECK (is_editor_or_admin());

-- Editors can update their own posts, admins can update any
CREATE POLICY "Editors can update own posts"
    ON posts FOR UPDATE
    USING (
        is_editor_or_admin() 
        AND (author_id = auth.uid() OR is_admin())
    )
    WITH CHECK (is_editor_or_admin());

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
    ON posts FOR DELETE
    USING (is_admin());

-- =====================================================
-- POST_TAGS POLICIES
-- =====================================================
-- Public can read post_tags for published posts
CREATE POLICY "Post tags viewable for published posts"
    ON post_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_tags.post_id 
            AND posts.status = 'published'
            AND posts.published_at <= NOW()
        )
        OR is_editor_or_admin()
    );

-- Editors can manage post_tags
CREATE POLICY "Editors can manage post_tags"
    ON post_tags FOR ALL
    USING (is_editor_or_admin())
    WITH CHECK (is_editor_or_admin());

-- =====================================================
-- POST_ATTACHMENTS POLICIES
-- =====================================================
-- Similar to posts - public can see attachments for published
CREATE POLICY "Attachments viewable for published posts"
    ON post_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_attachments.post_id 
            AND posts.status = 'published'
            AND posts.published_at <= NOW()
        )
        OR is_editor_or_admin()
    );

-- Editors can manage attachments
CREATE POLICY "Editors can manage attachments"
    ON post_attachments FOR ALL
    USING (is_editor_or_admin())
    WITH CHECK (is_editor_or_admin());

-- =====================================================
-- SOFTWARE_PRODUCTS POLICIES
-- =====================================================
-- Public can view active software
CREATE POLICY "Active software is viewable by everyone"
    ON software_products FOR SELECT
    USING (status = 'active');

-- Editors can view all software
CREATE POLICY "Editors can view all software"
    ON software_products FOR SELECT
    USING (is_editor_or_admin());

-- Only admins can manage software
CREATE POLICY "Admins can manage software"
    ON software_products FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- SOFTWARE_VERSIONS POLICIES
-- =====================================================
-- Public can view versions of active software
CREATE POLICY "Versions of active software are viewable"
    ON software_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM software_products
            WHERE software_products.id = software_versions.software_id
            AND software_products.status = 'active'
        )
        AND status = 'active'
    );

-- Editors can view all versions
CREATE POLICY "Editors can view all versions"
    ON software_versions FOR SELECT
    USING (is_editor_or_admin());

-- Only admins can manage versions
CREATE POLICY "Admins can manage versions"
    ON software_versions FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- DOWNLOAD_LOGS POLICIES
-- =====================================================
-- Anyone can insert download logs (for tracking downloads)
CREATE POLICY "Anyone can log downloads"
    ON download_logs FOR INSERT
    WITH CHECK (true);

-- Only admins can view download logs
CREATE POLICY "Admins can view download logs"
    ON download_logs FOR SELECT
    USING (is_admin());

-- =====================================================
-- CONTACT_MESSAGES POLICIES
-- =====================================================
-- Anyone can submit contact messages
CREATE POLICY "Anyone can submit contact"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

-- Only admin/editor can view messages
CREATE POLICY "Staff can view contact messages"
    ON contact_messages FOR SELECT
    USING (is_editor_or_admin());

-- Only admin can manage messages
CREATE POLICY "Admins can manage contact messages"
    ON contact_messages FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- SETTINGS POLICIES
-- =====================================================
-- Public can read certain settings (will filter in app)
CREATE POLICY "Public settings are viewable"
    ON settings FOR SELECT
    USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
    ON settings FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- AUDIT_LOGS POLICIES
-- =====================================================
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- System can insert audit logs (via functions)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);
