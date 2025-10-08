-- Fix RLS policies for proforma_requests table
-- This migration ensures all necessary policies are properly applied

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can create proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can update their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can delete their own draft proforma requests" ON proforma_requests;

-- Ensure RLS is enabled
ALTER TABLE proforma_requests ENABLE ROW LEVEL SECURITY;

-- Recreate all policies for proforma_requests
CREATE POLICY "Users can view their own proforma requests"
  ON proforma_requests FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create proforma requests"
  ON proforma_requests FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own proforma requests"
  ON proforma_requests FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own draft proforma requests"
  ON proforma_requests FOR DELETE
  USING (advocate_id = auth.uid() AND status = 'draft');