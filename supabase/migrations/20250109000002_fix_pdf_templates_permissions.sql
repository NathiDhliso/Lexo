-- Fix pdf_templates table permissions
-- This migration fixes the 403 Forbidden error when accessing pdf_templates

-- Grant table-level permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON pdf_templates TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Advocates can view their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Advocates can create their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Advocates can update their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Advocates can delete their own templates" ON pdf_templates;

-- Recreate RLS Policies with proper permissions
CREATE POLICY "Advocates can view their own templates"
  ON pdf_templates FOR SELECT
  TO authenticated
  USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create their own templates"
  ON pdf_templates FOR INSERT
  TO authenticated
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own templates"
  ON pdf_templates FOR UPDATE
  TO authenticated
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own templates"
  ON pdf_templates FOR DELETE
  TO authenticated
  USING (advocate_id = auth.uid());

-- Add comment
COMMENT ON TABLE pdf_templates IS 'Stores custom PDF templates for invoices and pro forma documents - Users can manage their own templates only (RLS enforced)';
