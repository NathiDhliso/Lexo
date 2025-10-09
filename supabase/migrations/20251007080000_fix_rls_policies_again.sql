-- Fix RLS policies for invoices and matters tables
-- This migration ensures all RLS policies are properly applied

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view their own matters" ON matters;
DROP POLICY IF EXISTS "Users can create matters" ON matters;
DROP POLICY IF EXISTS "Users can update their own matters" ON matters;

-- Ensure RLS is enabled
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

-- Recreate invoices policies
CREATE POLICY "Users can view their own invoices"
ON invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM matters 
    WHERE matters.id = invoices.matter_id 
    AND matters.advocate_id = auth.uid()
  )
);

CREATE POLICY "Users can create invoices"
ON invoices FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matters 
    WHERE matters.id = invoices.matter_id 
    AND matters.advocate_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own invoices"
ON invoices FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM matters 
    WHERE matters.id = invoices.matter_id 
    AND matters.advocate_id = auth.uid()
  )
);

-- Recreate matters policies
CREATE POLICY "Users can view their own matters"
ON matters FOR SELECT
USING (advocate_id = auth.uid());

CREATE POLICY "Users can create matters"
ON matters FOR INSERT
WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own matters"
ON matters FOR UPDATE
USING (advocate_id = auth.uid());