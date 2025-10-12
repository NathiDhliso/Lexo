-- Fix cloud storage unique constraint
-- The original migration had a syntax error with inline partial unique constraint
-- This migration fixes it by creating a proper partial unique index

-- Drop the problematic constraint if it exists (it shouldn't due to the error)
ALTER TABLE IF EXISTS cloud_storage_connections 
  DROP CONSTRAINT IF EXISTS unique_primary_per_advocate;

-- Create the partial unique index to ensure only one primary provider per advocate
CREATE UNIQUE INDEX IF NOT EXISTS idx_cloud_storage_connections_unique_primary 
  ON cloud_storage_connections(advocate_id) 
  WHERE is_primary = true;
