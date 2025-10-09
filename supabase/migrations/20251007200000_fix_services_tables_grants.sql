-- ============================================================================
-- FIX SERVICES TABLES GRANTS
-- Migration to fix 403 Forbidden errors on services-related tables
-- The tables have RLS policies but are missing GRANT permissions
-- ============================================================================

-- Grant permissions to authenticated users for services tables
GRANT SELECT ON service_categories TO authenticated;
GRANT SELECT ON services TO authenticated;
GRANT SELECT, INSERT, DELETE ON matter_services TO authenticated;

-- ============================================================================
-- VERIFY RLS POLICIES ARE STILL ACTIVE
-- ============================================================================

-- Ensure RLS is enabled (should already be enabled from previous migration)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_services ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE service_categories IS 'Categories for legal services offered by advocates - READ access for all authenticated users';
COMMENT ON TABLE services IS 'Specific legal services that can be associated with matters - READ access for all authenticated users';
COMMENT ON TABLE matter_services IS 'Junction table linking matters to their associated services - Users can manage services for their own matters only';