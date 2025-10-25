-- Add 'new_request' status for attorney-submitted matter requests
-- This status indicates a matter request pending advocate review

-- Note: If matter_status is an enum type, we need to add the value
-- If it's just a text field with a check constraint, we update the constraint

-- Check if matter_status is an enum type and add value if needed
DO $$ 
BEGIN
  -- Try to add the enum value (will fail silently if already exists or if not an enum)
  BEGIN
    ALTER TYPE matter_status ADD VALUE IF NOT EXISTS 'new_request';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_matters_firm_id_status ON matters(firm_id, status) 
WHERE deleted_at IS NULL;

-- Add comment
COMMENT ON COLUMN matters.status IS 'Matter status: active, pending, settled, closed, new_request (attorney-submitted)';

