-- ============================================================================
-- Fix logged_services RLS Policies
-- ============================================================================
-- Problem: 403 errors when fetching logged services by matter_id
-- Root Cause: RLS policies only check advocate_id directly, don't verify matter ownership
-- Solution: Update policies to check matter ownership through matters table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Advocates can view own logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can insert own logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can update own uninvoiced logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can delete own uninvoiced logged services" ON logged_services;

-- ============================================================================
-- SELECT Policy: Allow access if advocate owns the matter OR owns the service
-- ============================================================================
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

-- ============================================================================
-- INSERT Policy: Allow if advocate owns the matter
-- ============================================================================
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

-- ============================================================================
-- UPDATE Policy: Allow if advocate owns the matter AND service is not invoiced
-- ============================================================================
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

-- ============================================================================
-- DELETE Policy: Allow if advocate owns the matter AND service is not invoiced
-- ============================================================================
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
-- Verification Query
-- ============================================================================
-- Run this to verify policies are active:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'logged_services';

-- ============================================================================
-- Test Queries (run as authenticated user)
-- ============================================================================
-- Test 1: Fetch by matter_id (should work now)
-- SELECT * FROM logged_services WHERE matter_id = '<your-matter-id>' AND invoice_id IS NULL;

-- Test 2: Insert new service (should work if you own the matter)
-- INSERT INTO logged_services (matter_id, advocate_id, service_date, description, service_type, unit_rate, amount)
-- VALUES ('<your-matter-id>', auth.uid(), CURRENT_DATE, 'Test service', 'consultation', 1000, 1000);

-- Test 3: Update service (should work for uninvoiced services)
-- UPDATE logged_services SET description = 'Updated description' WHERE id = '<service-id>' AND invoice_id IS NULL;

-- Test 4: Delete service (should work for uninvoiced services)
-- DELETE FROM logged_services WHERE id = '<service-id>' AND invoice_id IS NULL;
