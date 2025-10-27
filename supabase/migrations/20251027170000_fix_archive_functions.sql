-- Fix archive_matter and unarchive_matter functions
-- Issue: Function delimiter was incorrect

-- Drop existing functions
DROP FUNCTION IF EXISTS archive_matter(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS unarchive_matter(UUID, UUID);

-- Recreate archive_matter function with correct syntax
CREATE OR REPLACE FUNCTION archive_matter(
  p_matter_id UUID,
  p_advocate_id UUID,
  p_reason TEXT DEFAULT NULL
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the archive operation
  RAISE NOTICE 'Archiving matter % for advocate %', p_matter_id, p_advocate_id;
  
  -- Update the matter
  UPDATE matters
  SET 
    is_archived = true,
    archived_at = NOW(),
    archived_by = p_advocate_id,
    updated_at = NOW()
  WHERE id = p_matter_id
    AND advocate_id = p_advocate_id
    AND (is_archived = false OR is_archived IS NULL);
  
  -- Check if update was successful
  IF FOUND THEN
    RAISE NOTICE 'Matter % archived successfully', p_matter_id;
    RETURN true;
  ELSE
    RAISE NOTICE 'Matter % not found or already archived', p_matter_id;
    RETURN false;
  END IF;
END;
$$;

-- Recreate unarchive_matter function with correct syntax
CREATE OR REPLACE FUNCTION unarchive_matter(
  p_matter_id UUID,
  p_advocate_id UUID
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the unarchive operation
  RAISE NOTICE 'Unarchiving matter % for advocate %', p_matter_id, p_advocate_id;
  
  -- Update the matter
  UPDATE matters
  SET 
    is_archived = false,
    archived_at = NULL,
    archived_by = NULL,
    updated_at = NOW()
  WHERE id = p_matter_id
    AND advocate_id = p_advocate_id
    AND is_archived = true;
  
  -- Check if update was successful
  IF FOUND THEN
    RAISE NOTICE 'Matter % unarchived successfully', p_matter_id;
    RETURN true;
  ELSE
    RAISE NOTICE 'Matter % not found or not archived', p_matter_id;
    RETURN false;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION archive_matter(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION unarchive_matter(UUID, UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION archive_matter IS 'Archive a matter with audit trail. Returns true if successful, false if matter not found or already archived.';
COMMENT ON FUNCTION unarchive_matter IS 'Unarchive a matter. Returns true if successful, false if matter not found or not archived.';
