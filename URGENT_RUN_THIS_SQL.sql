-- ============================================
-- URGENT: Run this SQL in Supabase Dashboard
-- ============================================
-- This fixes the 403 Forbidden error when creating matters
-- 
-- HOW TO RUN:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New Query"
-- 5. Paste this entire file
-- 6. Click "Run"
-- ============================================

-- First, check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'matters';

-- Drop ALL existing policies on matters table
DROP POLICY IF EXISTS "matters_insert_policy" ON matters;
DROP POLICY IF EXISTS "matters_select_policy" ON matters;
DROP POLICY IF EXISTS "matters_update_policy" ON matters;
DROP POLICY IF EXISTS "matters_delete_policy" ON matters;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON matters;
DROP POLICY IF EXISTS "Enable read access for all users" ON matters;
DROP POLICY IF EXISTS "Users can insert their own matters" ON matters;
DROP POLICY IF EXISTS "Users can view their own matters" ON matters;
DROP POLICY IF EXISTS "Users can update their own matters" ON matters;
DROP POLICY IF EXISTS "Users can delete their own matters" ON matters;

-- Create new comprehensive policies

-- 1. INSERT Policy - Allow authenticated users to create matters for themselves
CREATE POLICY "matters_insert_policy" 
ON matters 
FOR INSERT 
TO authenticated 
WITH CHECK (advocate_id = auth.uid());

-- 2. SELECT Policy - Allow users to view their own matters
CREATE POLICY "matters_select_policy" 
ON matters 
FOR SELECT 
TO authenticated 
USING (advocate_id = auth.uid());

-- 3. UPDATE Policy - Allow users to update their own matters
CREATE POLICY "matters_update_policy" 
ON matters 
FOR UPDATE 
TO authenticated 
USING (advocate_id = auth.uid())
WITH CHECK (advocate_id = auth.uid());

-- 4. DELETE Policy - Allow users to delete their own matters
CREATE POLICY "matters_delete_policy" 
ON matters 
FOR DELETE 
TO authenticated 
USING (advocate_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

-- Verify policies were created successfully
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'INSERT' THEN 'Create matters'
    WHEN cmd = 'SELECT' THEN 'View matters'
    WHEN cmd = 'UPDATE' THEN 'Edit matters'
    WHEN cmd = 'DELETE' THEN 'Delete matters'
  END as description
FROM pg_policies 
WHERE tablename = 'matters'
ORDER BY cmd;

-- Show success message
SELECT 'RLS policies updated successfully! Try creating a pro forma now.' as message;
