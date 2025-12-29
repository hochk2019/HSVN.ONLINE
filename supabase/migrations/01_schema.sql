-- =====================================================
-- Golden Logistics Database Schema
-- Version: 1.0.0
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES (User roles: admin, editor)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'editor'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 2. CATEGORIES (3 chuyên mục chính)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- lucide icon name
    color TEXT, -- hex color for UI
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================================================
-- 3. TAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- =====================================================
-- 4. POSTS (Bài viết - TipTap JSON content)
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content JSONB, -- TipTap editor JSON
    content_html TEXT, -- Rendered HTML for faster display
    featured_image TEXT,
    
    -- SEO fields
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    
    -- Status & scheduling
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    
    -- Categorization
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Settings
    allow_comments BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    
    -- Audit
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);

-- Full-text search index
CREATE INDEX idx_posts_fts ON posts USING gin(
    to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(excerpt, ''))
);

-- =====================================================
-- 5. POST_TAGS (Junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- =====================================================
-- 6. POST_ATTACHMENTS (File đính kèm bài viết)
-- =====================================================
CREATE TABLE IF NOT EXISTS post_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER, -- bytes
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_attachments_post ON post_attachments(post_id);

-- =====================================================
-- 7. SOFTWARE_PRODUCTS (Phần mềm)
-- =====================================================
CREATE TABLE IF NOT EXISTS software_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    description JSONB, -- TipTap JSON for rich description
    description_html TEXT,
    
    -- Features
    highlights JSONB, -- Array of highlight strings
    system_requirements JSONB, -- Array of requirement strings
    faq JSONB, -- Array of {question, answer} objects
    
    -- Media
    icon_url TEXT,
    screenshots JSONB, -- Array of image URLs
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'coming_soon')),
    is_featured BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Stats
    download_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_software_slug ON software_products(slug);
CREATE INDEX idx_software_status ON software_products(status);

-- =====================================================
-- 8. SOFTWARE_VERSIONS (Phiên bản phần mềm)
-- =====================================================
CREATE TABLE IF NOT EXISTS software_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_id UUID REFERENCES software_products(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    release_notes TEXT,
    
    -- Download file
    file_url TEXT, -- Storage URL
    file_name TEXT,
    file_size INTEGER, -- bytes
    
    -- Status
    is_latest BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'beta')),
    
    -- Audit
    released_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_versions_software ON software_versions(software_id);
CREATE INDEX idx_versions_latest ON software_versions(is_latest) WHERE is_latest = true;

-- =====================================================
-- 9. DOWNLOAD_LOGS (Lịch sử tải)
-- =====================================================
CREATE TABLE IF NOT EXISTS download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES software_versions(id) ON DELETE SET NULL,
    software_id UUID REFERENCES software_products(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_download_logs_software ON download_logs(software_id);
CREATE INDEX idx_download_logs_created ON download_logs(created_at DESC);

-- =====================================================
-- 10. CONTACT_MESSAGES (Form liên hệ)
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    notes TEXT, -- Admin notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);

-- =====================================================
-- 11. SETTINGS (Cấu hình site - key/value)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- =====================================================
-- 12. AUDIT_LOGS (Log thao tác)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- create, update, delete, login, logout, etc.
    entity_type TEXT, -- posts, software, settings, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_software_updated_at BEFORE UPDATE ON software_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
