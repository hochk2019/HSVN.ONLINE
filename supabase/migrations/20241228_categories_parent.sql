-- Add parent_id column to categories for hierarchical structure
-- This enables sub-categories and dropdown menus in the header

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for faster parent/child lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Comment for documentation
COMMENT ON COLUMN categories.parent_id IS 'Reference to parent category for hierarchical menu structure';
