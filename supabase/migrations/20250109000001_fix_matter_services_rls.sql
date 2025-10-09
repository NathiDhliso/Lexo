-- Fix matter_services RLS policies
-- This migration fixes the 403 Forbidden error when accessing matter_services

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view matter services for their own matters" ON matter_services;
DROP POLICY IF EXISTS "Users can add services to their own matters" ON matter_services;
DROP POLICY IF EXISTS "Users can remove services from their own matters" ON matter_services;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view matter services for their own matters"
  ON matter_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can add services to their own matters"
  ON matter_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove services from their own matters"
  ON matter_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE matter_services ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON matter_services TO authenticated;

-- Add comment
COMMENT ON TABLE matter_services IS 'Junction table linking matters to their associated services - Users can manage services for their own matters only (RLS enforced)';
