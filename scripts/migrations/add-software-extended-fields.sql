-- Migration: Add extended fields to software_products table
-- Adds highlights, system_requirements, and faq columns for software enhancement

-- Add highlights column (JSON array of strings)
ALTER TABLE software_products
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT NULL;

-- Add system_requirements column (JSON object with os, ram, disk, other)
ALTER TABLE software_products
ADD COLUMN IF NOT EXISTS system_requirements JSONB DEFAULT NULL;

-- Add faq column (JSON array of {question, answer} objects)
ALTER TABLE software_products
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN software_products.highlights IS 'Array of highlight bullet points';
COMMENT ON COLUMN software_products.system_requirements IS 'Object with os, ram, disk, other requirements';
COMMENT ON COLUMN software_products.faq IS 'Array of FAQ objects with question and answer';
