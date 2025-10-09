-- Fix database issues: missing date_instructed column and RLS policies
-- This migration addresses 403 permission errors and missing schema elements

-- Add missing date_instructed column to matters table
ALTER TABLE matters ADD COLUMN IF NOT EXISTS date_instructed DATE DEFAULT CURRENT_DATE NOT NULL;

-- Create index for date queries
CREATE INDEX IF NOT EXISTS idx_matters_date_instructed ON matters(date_instructed);

-- Ensure all RLS policies are properly applied by dropping and recreating them

-- Drop existing policies for advocates table (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON advocates;
DROP POLICY IF EXISTS "Users can update their own profile" ON advocates;
DROP POLICY IF EXISTS "Users can create their own profile" ON advocates;

-- Drop existing policies for invoices table (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;

-- Ensure RLS is enabled on all tables
ALTER TABLE advocates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

-- Recreate advocates policies
CREATE POLICY "Users can view their own profile"
  ON advocates FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON advocates FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can create their own profile"
  ON advocates FOR INSERT
  WITH CHECK (id = auth.uid());

-- Recreate invoices policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (advocate_id = auth.uid());

-- Add comments for the new column
COMMENT ON COLUMN matters.date_instructed IS 'Date when the matter was instructed by the attorney';