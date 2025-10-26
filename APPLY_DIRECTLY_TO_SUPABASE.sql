-- ============================================================================
-- MATTER CREATION FIXES - APPLY DIRECTLY TO SUPABASE
-- ============================================================================
-- This file combines both migrations for easy copy-paste into Supabase SQL Editor
-- 
-- Fixes:
-- 1. Adds missing columns (urgency, practice_area, deadline_date, etc.)
-- 2. Fixes matter reference trigger that was querying non-existent advocates table
--
-- Safe to run: No data loss, only adds columns and fixes trigger
-- ============================================================================

-- ============================================================================
-- PART 1: Add Missing Columns
-- ============================================================================

-- Create urgency enum type
DO $$ BEGIN
    CREATE TYPE matter_urgency AS ENUM ('routine', 'standard', 'urgent', 'emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add urgency column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS urgency matter_urgency DEFAULT 'standard';

-- Add practice area column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS practice_area TEXT;

-- Add deadline date column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS deadline_date DATE;

-- Add creation source column (tracks how the matter was created)
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS creation_source TEXT;

-- Add quick create flag
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS is_quick_create BOOLEAN DEFAULT false;

-- Add date accepted column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS date_accepted TIMESTAMPTZ;

-- Add date commenced column
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS date_commenced TIMESTAMPTZ;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matters_urgency ON matters(urgency);
CREATE INDEX IF NOT EXISTS idx_matters_practice_area ON matters(practice_area);
CREATE INDEX IF NOT EXISTS idx_matters_deadline_date ON matters(deadline_date);
CREATE INDEX IF NOT EXISTS idx_matters_creation_source ON matters(creation_source);

-- Add comments
COMMENT ON COLUMN matters.urgency IS 'Urgency level of the matter: routine, standard, urgent, or emergency';
COMMENT ON COLUMN matters.practice_area IS 'Practice area or legal specialty for the matter';
COMMENT ON COLUMN matters.deadline_date IS 'Deadline date for the matter';
COMMENT ON COLUMN matters.creation_source IS 'Source of matter creation (e.g., quick_brief_capture, attorney_request)';
COMMENT ON COLUMN matters.is_quick_create IS 'Flag indicating if matter was created via quick create workflow';
COMMENT ON COLUMN matters.date_accepted IS 'Date when the matter was accepted by the advocate';
COMMENT ON COLUMN matters.date_commenced IS 'Date when work on the matter commenced';

-- ============================================================================
-- PART 2: Fix Matter Reference Trigger
-- ============================================================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS set_matter_reference ON matters;
DROP FUNCTION IF EXISTS set_matter_reference_trigger();

-- Recreate the function to work without the advocates table
-- Since user_profiles doesn't have a 'bar' field, we'll default to 'johannesburg'
-- or make the reference number simpler
CREATE OR REPLACE FUNCTION set_matter_reference_trigger()
RETURNS TRIGGER AS $$
DECLARE
  bar_prefix TEXT;
  year_part TEXT;
  sequence_num INTEGER;
  ref_num TEXT;
BEGIN
  -- Default to JHB prefix (can be made configurable later)
  bar_prefix := 'JHB';
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d{4}/(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM matters
  WHERE reference_number LIKE bar_prefix || '/' || year_part || '/%';
  
  -- Generate reference number: JHB/YYYY/NNN
  ref_num := bar_prefix || '/' || year_part || '/' || LPAD(sequence_num::TEXT, 3, '0');
  
  NEW.reference_number := ref_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER set_matter_reference
  BEFORE INSERT ON matters
  FOR EACH ROW
  WHEN (NEW.reference_number IS NULL)
  EXECUTE FUNCTION set_matter_reference_trigger();

COMMENT ON FUNCTION set_matter_reference_trigger IS 'Auto-generates matter reference numbers in format JHB/YYYY/NNN';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'matters' 
AND column_name IN ('urgency', 'practice_area', 'deadline_date', 'creation_source', 'is_quick_create', 'date_accepted', 'date_commenced')
ORDER BY column_name;

-- Verify trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'set_matter_reference';

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- If you see the columns and trigger listed above, the migration was successful.
-- You can now use:
-- - Quick Add Matter feature
-- - Quick Brief Capture workflow
-- - Matter Request submissions
-- ============================================================================
