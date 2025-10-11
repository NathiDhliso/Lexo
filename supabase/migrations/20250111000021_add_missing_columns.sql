-- Add missing columns and fix schema issues
-- This migration adds user_id column to matters for compatibility
-- and ensures proper RLS policies

-- Add user_id column to matters table (as an alias for advocate_id)
-- This allows queries using user_id to work
ALTER TABLE matters ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_matters_user_id ON matters(user_id);

-- Update existing rows to set user_id = advocate_id
UPDATE matters SET user_id = advocate_id WHERE user_id IS NULL;

-- Create trigger to keep user_id in sync with advocate_id
CREATE OR REPLACE FUNCTION sync_matters_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.advocate_id IS NOT NULL THEN
    NEW.user_id := NEW.advocate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_matters_user_id_trigger ON matters;
CREATE TRIGGER sync_matters_user_id_trigger
  BEFORE INSERT OR UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION sync_matters_user_id();

-- Update RLS policies for matters to work with user_id
DROP POLICY IF EXISTS "Advocates can view their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can create their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can update their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can delete their own matters" ON matters;

CREATE POLICY "Advocates can view their own matters"
  ON matters FOR SELECT
  USING (
    advocate_id = auth.uid() OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.organization_id = matters.advocate_id
      AND team_members.status = 'active'
    )
  );

CREATE POLICY "Advocates can create their own matters"
  ON matters FOR INSERT
  WITH CHECK (
    advocate_id = auth.uid() OR 
    user_id = auth.uid()
  );

CREATE POLICY "Advocates can update their own matters"
  ON matters FOR UPDATE
  USING (
    advocate_id = auth.uid() OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.organization_id = matters.advocate_id
      AND team_members.status = 'active'
      AND team_members.role IN ('admin', 'advocate')
    )
  );

CREATE POLICY "Advocates can delete their own matters"
  ON matters FOR DELETE
  USING (
    advocate_id = auth.uid() OR 
    user_id = auth.uid()
  );

COMMENT ON COLUMN matters.user_id IS 'Alias for advocate_id to support legacy queries';
