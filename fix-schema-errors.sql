-- Fix Schema Errors
-- Run this in Supabase SQL Editor to fix 406 and 400 errors
-- This addresses user_profiles and matters query issues

-- ============================================================================
-- PART 1: Fix user_profiles RLS policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Team members can view organization profiles" ON user_profiles;

-- Recreate policies with proper access patterns
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy for team members to view profiles in their organization
CREATE POLICY "Team members can view organization profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.organization_id = user_profiles.user_id
      AND team_members.status = 'active'
    )
  );

-- ============================================================================
-- PART 2: Add user_id column to matters table
-- ============================================================================

-- Add user_id column to matters table (as an alias for advocate_id)
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

-- ============================================================================
-- PART 3: Update matters RLS policies (Remove ALL duplicates first)
-- ============================================================================

-- Drop ALL existing policies (both old and new naming conventions)
DROP POLICY IF EXISTS "matters_select_policy" ON matters;
DROP POLICY IF EXISTS "matters_insert_policy" ON matters;
DROP POLICY IF EXISTS "matters_update_policy" ON matters;
DROP POLICY IF EXISTS "matters_delete_policy" ON matters;
DROP POLICY IF EXISTS "Advocates can view their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can create their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can update their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can delete their own matters" ON matters;

-- Create clean, consolidated policies
-- SELECT policy: View own matters and team matters
CREATE POLICY "matters_select_policy"
  ON matters FOR SELECT
  TO authenticated
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

-- INSERT policy: Create own matters only
CREATE POLICY "matters_insert_policy"
  ON matters FOR INSERT
  TO authenticated
  WITH CHECK (
    advocate_id = auth.uid() OR 
    user_id = auth.uid()
  );

-- UPDATE policy: Update own matters and team matters (if admin/advocate)
CREATE POLICY "matters_update_policy"
  ON matters FOR UPDATE
  TO authenticated
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
  )
  WITH CHECK (
    advocate_id = auth.uid() OR 
    user_id = auth.uid()
  );

-- DELETE policy: Delete own matters only
CREATE POLICY "matters_delete_policy"
  ON matters FOR DELETE
  TO authenticated
  USING (
    advocate_id = auth.uid() OR 
    user_id = auth.uid()
  );

-- ============================================================================
-- PART 4: Add comments for documentation
-- ============================================================================

COMMENT ON POLICY "Users can view their own profile" ON user_profiles IS 'Users can view their own profile';
COMMENT ON POLICY "Team members can view organization profiles" ON user_profiles IS 'Team members can view profiles in their organization';
COMMENT ON COLUMN matters.user_id IS 'Alias for advocate_id to support legacy queries';

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check if user_id column exists in matters
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matters' AND column_name = 'user_id';

-- Check RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Check RLS policies on matters
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'matters';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Schema fixes applied successfully!';
  RAISE NOTICE 'Please refresh your application to see the changes.';
END $$;
