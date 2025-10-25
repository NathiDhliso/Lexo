-- Add firm_id foreign key to matters table
-- This establishes the attorney-first model where matters must be associated with a firm

-- Add firm_id column (nullable initially for migration)
ALTER TABLE matters
ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES firms(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_matters_firm_id ON matters(firm_id);

-- Add comment for documentation
COMMENT ON COLUMN matters.firm_id IS 'Foreign key to the instructing firm (required after migration)';

-- Note: firm_id is nullable initially to allow for data migration
-- After migration is complete, run the make_firm_id_required migration
-- to enforce NOT NULL constraint
