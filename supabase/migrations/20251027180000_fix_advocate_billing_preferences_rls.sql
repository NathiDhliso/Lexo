-- ============================================================================
-- Fix advocate_billing_preferences RLS Policies
-- ============================================================================
-- Fixes 403 Forbidden errors when accessing billing preferences
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE advocate_billing_preferences ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own billing preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "Users can insert their own billing preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "Users can update their own billing preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "Users can delete their own billing preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "advocate_view_own_preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "advocate_update_own_preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "advocate_insert_own_preferences" ON advocate_billing_preferences;
DROP POLICY IF EXISTS "service_role_full_access" ON advocate_billing_preferences;

-- SELECT Policy: Users can view their own preferences
CREATE POLICY "Advocates can view own billing preferences"
  ON advocate_billing_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);

-- INSERT Policy: Users can create their own preferences
CREATE POLICY "Advocates can insert own billing preferences"
  ON advocate_billing_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advocate_id);

-- UPDATE Policy: Users can update their own preferences
CREATE POLICY "Advocates can update own billing preferences"
  ON advocate_billing_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

-- DELETE Policy: Users can delete their own preferences
CREATE POLICY "Advocates can delete own billing preferences"
  ON advocate_billing_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = advocate_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON advocate_billing_preferences TO authenticated;
GRANT ALL ON advocate_billing_preferences TO service_role;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify policies are active:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'advocate_billing_preferences'
-- ORDER BY policyname;
