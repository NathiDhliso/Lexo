-- Make firm_id NOT NULL after data migration
-- This migration should only run after 20250115000004 and 20250115000005

-- First, verify that all active matters have a firm_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count 
  FROM matters 
  WHERE firm_id IS NULL AND deleted_at IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Cannot make firm_id NOT NULL: % active matters still have NULL firm_id. Run migration 20250115000005 first.', null_count;
  END IF;
  
  RAISE NOTICE 'Verification passed: All active matters have firm_id assigned';
END $$;

-- Make firm_id NOT NULL
ALTER TABLE matters
ALTER COLUMN firm_id SET NOT NULL;

-- Ensure foreign key constraint exists
-- (It should already exist from 20250115000002, but we verify here)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matters_firm_id_fkey'
    AND table_name = 'matters'
  ) THEN
    ALTER TABLE matters
    ADD CONSTRAINT matters_firm_id_fkey 
    FOREIGN KEY (firm_id) REFERENCES firms(id) ON DELETE RESTRICT;
    
    RAISE NOTICE 'Added foreign key constraint matters_firm_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint matters_firm_id_fkey already exists';
  END IF;
END $$;

-- Add check constraint to ensure firm exists
ALTER TABLE matters
ADD CONSTRAINT matters_firm_id_exists 
CHECK (firm_id IS NOT NULL);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: firm_id is now required on matters table';
  RAISE NOTICE 'All new matters must be associated with a firm';
END $$;

-- Update comment
COMMENT ON COLUMN matters.firm_id IS 'Foreign key to firms table (REQUIRED) - every matter must be associated with an instructing firm';

