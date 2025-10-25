-- ============================================
-- FIX FIRMS AND CLOUD STORAGE RLS POLICIES
-- ============================================
-- Run this in your Supabase SQL Editor to fix the firms page issue
-- Date: 2025-10-25

-- ============================================
-- FIRMS TABLE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Advocates can view all firms" ON firms;
DROP POLICY IF EXISTS "Advocates can view their own firms" ON firms;
DROP POLICY IF EXISTS "Authenticated users can insert firms" ON firms;
DROP POLICY IF EXISTS "Authenticated users can update firms" ON firms;
DROP POLICY IF EXISTS "Advocates can update their own firms" ON firms;
DROP POLICY IF EXISTS "Authenticated users can delete firms" ON firms;

-- Enable RLS
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view firms
CREATE POLICY "Advocates can view all firms"
  ON firms FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create firms
CREATE POLICY "Authenticated users can insert firms"
  ON firms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update firms
CREATE POLICY "Authenticated users can update firms"
  ON firms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete firms
CREATE POLICY "Authenticated users can delete firms"
  ON firms FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CLOUD_STORAGE_CONNECTIONS TABLE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Advocates can view their storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can manage their storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can view own connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can insert own connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can update own connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can manage own connections" ON cloud_storage_connections;

-- Enable RLS
ALTER TABLE cloud_storage_connections ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own connections
CREATE POLICY "Users can view own connections"
  ON cloud_storage_connections FOR SELECT
  TO authenticated
  USING (advocate_id = auth.uid());

-- Allow users to insert their own connections
CREATE POLICY "Users can insert own connections"
  ON cloud_storage_connections FOR INSERT
  TO authenticated
  WITH CHECK (advocate_id = auth.uid());

-- Allow users to update their own connections
CREATE POLICY "Users can update own connections"
  ON cloud_storage_connections FOR UPDATE
  TO authenticated
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());

-- Allow users to delete their own connections
CREATE POLICY "Users can delete own connections"
  ON cloud_storage_connections FOR DELETE
  TO authenticated
  USING (advocate_id = auth.uid());

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Ensure authenticated users have necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON firms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cloud_storage_connections TO authenticated;

-- Grant usage on sequences if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'firms_id_seq') THEN
    GRANT USAGE ON SEQUENCE firms_id_seq TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cloud_storage_connections_id_seq') THEN
    GRANT USAGE ON SEQUENCE cloud_storage_connections_id_seq TO authenticated;
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries after applying the above to verify everything works

-- Check firms table RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'firms'
ORDER BY policyname;

-- Check cloud_storage_connections table RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'cloud_storage_connections'
ORDER BY policyname;

-- Test firms access (should return count)
SELECT COUNT(*) as firms_count FROM firms;

-- Test cloud_storage_connections access (should return count)
SELECT COUNT(*) as connections_count FROM cloud_storage_connections;
