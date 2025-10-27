-- ============================================================================
-- Fix RLS and Table Issues
-- ============================================================================
-- Fixes:
-- 1. logged_services RLS policies (403 errors)
-- 2. matter_services join issues (400 errors)
-- ============================================================================

-- ============================================================================
-- 1. Fix logged_services RLS Policies
-- ============================================================================

-- Drop ALL existing policies (including new ones that may have been created)
DROP POLICY IF EXISTS "Advocates can view own logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can insert own logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can update own uninvoiced logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can delete own uninvoiced logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can view logged services for their matters" ON logged_services;
DROP POLICY IF EXISTS "Advocates can insert logged services for their matters" ON logged_services;

-- SELECT Policy: Allow access if advocate owns the matter OR owns the service
CREATE POLICY "Advocates can view logged services for their matters"
  ON logged_services
  FOR SELECT
  TO authenticated
  USING (
    -- User owns the service directly
    advocate_id = auth.uid()
    OR
    -- User owns the matter the service is logged against
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- INSERT Policy: Allow if advocate owns the matter
CREATE POLICY "Advocates can insert logged services for their matters"
  ON logged_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must own the matter
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
    AND
    -- Advocate ID should match authenticated user
    advocate_id = auth.uid()
  );

-- UPDATE Policy: Allow if advocate owns the matter AND service is not invoiced
CREATE POLICY "Advocates can update own uninvoiced logged services"
  ON logged_services
  FOR UPDATE
  TO authenticated
  USING (
    -- User owns the matter
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
    AND
    -- Service is not invoiced yet
    invoice_id IS NULL
  )
  WITH CHECK (
    -- User owns the matter
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
    AND
    -- Service is not invoiced yet
    invoice_id IS NULL
    AND
    -- Advocate ID matches
    advocate_id = auth.uid()
  );

-- DELETE Policy: Allow if advocate owns the matter AND service is not invoiced
CREATE POLICY "Advocates can delete own uninvoiced logged services"
  ON logged_services
  FOR DELETE
  TO authenticated
  USING (
    -- User owns the matter
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
    AND
    -- Service is not invoiced yet
    invoice_id IS NULL
  );

-- ============================================================================
-- 2. Verify matter_services table structure
-- ============================================================================

-- Ensure matter_services has proper foreign key to services table
DO $$
BEGIN
  -- Check if the foreign key exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matter_services_service_id_fkey'
    AND table_name = 'matter_services'
  ) THEN
    -- Add foreign key if it doesn't exist
    ALTER TABLE matter_services
    ADD CONSTRAINT matter_services_service_id_fkey
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 3. Update matter_services RLS policies if needed
-- ============================================================================

-- Drop and recreate matter_services policies to ensure they work with joins
DROP POLICY IF EXISTS "Advocates can view own matter services" ON matter_services;
DROP POLICY IF EXISTS "Advocates can insert own matter services" ON matter_services;
DROP POLICY IF EXISTS "Advocates can update own matter services" ON matter_services;
DROP POLICY IF EXISTS "Advocates can delete own matter services" ON matter_services;

CREATE POLICY "Advocates can view matter services for their matters"
  ON matter_services
  FOR SELECT
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Advocates can insert matter services for their matters"
  ON matter_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Advocates can update matter services for their matters"
  ON matter_services
  FOR UPDATE
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  )
  WITH CHECK (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Advocates can delete matter services for their matters"
  ON matter_services
  FOR DELETE
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Ensure services table has proper RLS
-- ============================================================================

-- Enable RLS on services table if not already enabled
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Advocates can view all services" ON services;

-- Allow authenticated users to view all services (they're templates/catalog items)
CREATE POLICY "Authenticated users can view all services"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Run these to verify policies are active:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('logged_services', 'matter_services', 'services')
-- ORDER BY tablename, policyname;
