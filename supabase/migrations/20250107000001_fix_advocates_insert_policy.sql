-- Fix missing INSERT policy for advocates table
-- This allows users to create their own advocate profile during signup

CREATE POLICY "Users can create their own profile"
  ON advocates FOR INSERT
  WITH CHECK (id = auth.uid());