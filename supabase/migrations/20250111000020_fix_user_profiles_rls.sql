-- Fix user_profiles RLS policies to allow proper querying
-- This migration fixes the 406 and 400 errors when querying user_profiles

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

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

COMMENT ON POLICY "Users can view their own profile" ON user_profiles IS 'Users can view their own profile';
COMMENT ON POLICY "Team members can view organization profiles" ON user_profiles IS 'Team members can view profiles in their organization';
