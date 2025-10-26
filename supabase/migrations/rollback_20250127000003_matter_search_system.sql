-- Rollback Migration: Matter Search & Archiving System
-- Description: Rollback full-text search and archiving features
-- Date: January 27, 2025

-- Drop trigger
DROP TRIGGER IF EXISTS matter_search_vector_update ON matters;

-- Drop functions
DROP FUNCTION IF EXISTS update_matter_search_vector();
DROP FUNCTION IF EXISTS search_matters(UUID, TEXT, BOOLEAN, TEXT, TEXT[], DATE, DATE);

-- Drop indexes
DROP INDEX IF EXISTS idx_matters_search;
DROP INDEX IF EXISTS idx_matters_archived;

-- Remove columns from matters
ALTER TABLE matters
DROP COLUMN IF EXISTS search_vector,
DROP COLUMN IF EXISTS is_archived,
DROP COLUMN IF EXISTS archived_at,
DROP COLUMN IF EXISTS archived_by;

-- Log rollback
COMMENT ON TABLE matters IS 'Matter search system rolled back on ' || NOW()::TEXT;
