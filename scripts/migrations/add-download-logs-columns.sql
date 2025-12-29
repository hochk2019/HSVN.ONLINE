-- Migration: Add columns to download_logs for better tracking
-- Run this in Supabase SQL Editor

-- Add ip_address column
ALTER TABLE download_logs 
ADD COLUMN IF NOT EXISTS ip_address text;

-- Add user_agent column  
ALTER TABLE download_logs 
ADD COLUMN IF NOT EXISTS user_agent text;

-- Add software_id column with foreign key
ALTER TABLE download_logs 
ADD COLUMN IF NOT EXISTS software_id uuid REFERENCES software_products(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_download_logs_software_id ON download_logs(software_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_created_at ON download_logs(created_at DESC);

-- Optional: Add comment
COMMENT ON COLUMN download_logs.ip_address IS 'Client IP address (may be proxied)';
COMMENT ON COLUMN download_logs.user_agent IS 'Client browser/device user agent string';

