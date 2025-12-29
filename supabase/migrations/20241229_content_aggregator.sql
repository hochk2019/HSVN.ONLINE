-- Migration: Content Aggregator Tables
-- Created: 2024-12-29

-- Table: feed_sources
-- Stores RSS feed sources for content aggregation
CREATE TABLE IF NOT EXISTS feed_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    fetch_interval INT DEFAULT 60, -- minutes between fetches
    is_active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    articles_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: imported_articles
-- Stores articles fetched from RSS feeds
CREATE TABLE IF NOT EXISTS imported_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES feed_sources(id) ON DELETE CASCADE,
    original_url TEXT UNIQUE NOT NULL,
    original_title TEXT NOT NULL,
    original_content TEXT,
    ai_rewritten_title TEXT,
    ai_rewritten_content TEXT,
    featured_image TEXT,
    source_name TEXT, -- "Nguồn: xyz.com" attribution
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    fetched_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feed_sources_active ON feed_sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_imported_articles_status ON imported_articles(status);
CREATE INDEX IF NOT EXISTS idx_imported_articles_source ON imported_articles(source_id);

-- RLS Policies
ALTER TABLE feed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_articles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage feed sources
CREATE POLICY "Authenticated users can manage feed sources"
ON feed_sources FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to manage imported articles
CREATE POLICY "Authenticated users can manage imported articles"
ON imported_articles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feed_sources_updated_at
    BEFORE UPDATE ON feed_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imported_articles_updated_at
    BEFORE UPDATE ON imported_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
