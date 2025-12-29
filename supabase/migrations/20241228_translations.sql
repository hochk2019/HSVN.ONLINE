-- Add translations JSONB column for multi-language content
-- This enables storing English (or other language) translations alongside Vietnamese content

-- Add translations column to posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';

-- Add translations column to categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';

-- Add translations column to software
ALTER TABLE software_products 
ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';

-- Comments for documentation
COMMENT ON COLUMN posts.translations IS 'JSONB object containing translations: {"en": {"title": "...", "excerpt": "...", "content_html": "..."}}';
COMMENT ON COLUMN categories.translations IS 'JSONB object containing translations: {"en": {"name": "...", "description": "..."}}';
COMMENT ON COLUMN software_products.translations IS 'JSONB object containing translations: {"en": {"title": "...", "description": "..."}}';

-- Example structure:
-- {
--   "en": {
--     "title": "English title",
--     "excerpt": "English excerpt",
--     "content_html": "<p>English content...</p>"
--   },
--   "zh": {
--     "title": "Chinese title (future)",
--     ...
--   }
-- }
