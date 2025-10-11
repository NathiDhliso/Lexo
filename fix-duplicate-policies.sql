-- Fix Duplicate RLS Policies on matters table
-- This removes old conflicting policies and keeps only the new ones

-- ============================================================================
-- PART 1: Remove ALL existing policies on matters
-- ============================================================================

DROP POLICY IF EXISTS "matters_select_policy" ON matters;
DROP POLICY IF EXISTS "matters_insert_policy" ON matters;
DROP POLICY IF EXISTS "matters_update_policy" ON matters;
DROP POLICY IF EXISTS "matters_delete_policy" ON matters;
DROP POLICY IF EXISTS "Advocates can view their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can create their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can update their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can delete their own matters" ON matters;

-- ============================================================================
-- PART 2: Create clean, consolidated policies
-- ============================================================================

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
-- PART 3: Verify policies
-- ============================================================================

-- Check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'matters'
ORDER BY cmd, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Duplicate policies removed';
  RAISE NOTICE '✓ Clean policies created';
  RAISE NOTICE '✓ matters table now has 4 policies (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE 'Please refresh your application!';
END $$;
