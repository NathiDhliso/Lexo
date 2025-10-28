-- ============================================================================
-- Fix retainer_agreements RLS Policies
-- ============================================================================
-- Fixes 403 Forbidden errors when accessing retainer agreements
-- The original policies referenced advocates(id) but users authenticate via auth.uid()
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Advocates can view their own retainer agreements" ON retainer_agreements;
DROP POLICY IF EXISTS "Advocates can create retainer agreements" ON retainer_agreements;
DROP POLICY IF EXISTS "Advocates can update their own retainer agreements" ON retainer_agreements;

-- SELECT Policy: Users can view retainer agreements for matters they own
CREATE POLICY "Users can view retainer agreements for their matters"
  ON retainer_agreements
  FOR SELECT
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- INSERT Policy: Users can create retainer agreements for matters they own
CREATE POLICY "Users can create retainer agreements for their matters"
  ON retainer_agreements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- UPDATE Policy: Users can update retainer agreements for matters they own
CREATE POLICY "Users can update retainer agreements for their matters"
  ON retainer_agreements
  FOR UPDATE
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  )
  WITH CHECK (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- DELETE Policy: Users can delete retainer agreements for matters they own
CREATE POLICY "Users can delete retainer agreements for their matters"
  ON retainer_agreements
  FOR DELETE
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON retainer_agreements TO authenticated;
GRANT ALL ON retainer_agreements TO service_role;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify policies are active:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'retainer_agreements'
-- ORDER BY policyname;
