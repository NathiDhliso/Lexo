-- Add advocate_id to firms table
-- This links each firm to the advocate who manages them

ALTER TABLE firms
ADD COLUMN IF NOT EXISTS advocate_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_firms_advocate_id ON firms(advocate_id);

-- Add comment
COMMENT ON COLUMN firms.advocate_id IS 'The advocate who manages this firm and receives their matter requests';

-- Update RLS policies to allow advocates to see only their firms
DROP POLICY IF EXISTS "Advocates can view all firms" ON firms;

CREATE POLICY "Advocates can view their own firms"
  ON firms
  FOR SELECT
  TO authenticated
  USING (advocate_id = auth.uid() OR advocate_id IS NULL);

-- Allow advocates to update their own firms
DROP POLICY IF EXISTS "Authenticated users can update firms" ON firms;

CREATE POLICY "Advocates can update their own firms"
  ON firms
  FOR UPDATE
  TO authenticated
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());
