-- Fix RLS Policy for Matter Creation from Pro Forma Requests
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "matters_insert_policy" ON matters;

-- Create a permissive INSERT policy for authenticated users
CREATE POLICY "matters_insert_policy" 
ON matters 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM advocates WHERE id = advocate_id
  )
);

-- Ensure RLS is enabled
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'matters' AND policyname = 'matters_insert_policy';
