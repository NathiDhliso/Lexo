-- Fix matter reference trigger to work with user_profiles instead of advocates
-- The original trigger references the advocates table which doesn't exist in production

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
