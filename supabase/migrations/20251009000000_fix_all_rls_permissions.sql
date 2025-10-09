-- Comprehensive RLS and Permissions Fix
-- Fixes 403, 406, and 400 errors for matter_services, pdf_templates, and matters

-- ============================================================================
-- 1. FIX MATTER_SERVICES TABLE
-- ============================================================================

-- Ensure table exists and has proper structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matter_services') THEN
    CREATE TABLE matter_services (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
      service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(matter_id, service_id)
    );
  END IF;
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view matter services for their own matters" ON matter_services;
DROP POLICY IF EXISTS "Users can add services to their own matters" ON matter_services;
DROP POLICY IF EXISTS "Users can remove services from their own matters" ON matter_services;
DROP POLICY IF EXISTS "Users can update matter services for their own matters" ON matter_services;

-- Enable RLS
ALTER TABLE matter_services ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON matter_services TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create comprehensive policies
CREATE POLICY "matter_services_select_policy"
  ON matter_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

CREATE POLICY "matter_services_insert_policy"
  ON matter_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

CREATE POLICY "matter_services_update_policy"
  ON matter_services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

CREATE POLICY "matter_services_delete_policy"
  ON matter_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matters 
      WHERE matters.id = matter_services.matter_id 
      AND matters.advocate_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. FIX SERVICES TABLE (needed for matter_services joins)
-- ============================================================================

-- Enable RLS on services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Services are viewable by authenticated users" ON services;
DROP POLICY IF EXISTS "Advocates can manage their own services" ON services;

-- Grant permissions
GRANT SELECT ON services TO authenticated;
GRANT INSERT, UPDATE, DELETE ON services TO authenticated;

-- Allow all authenticated users to view services
CREATE POLICY "services_select_policy"
  ON services FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to manage their own services
CREATE POLICY "services_insert_policy"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (advocate_id = auth.uid() OR advocate_id IS NULL);

CREATE POLICY "services_update_policy"
  ON services FOR UPDATE
  TO authenticated
  USING (advocate_id = auth.uid() OR advocate_id IS NULL)
  WITH CHECK (advocate_id = auth.uid() OR advocate_id IS NULL);

CREATE POLICY "services_delete_policy"
  ON services FOR DELETE
  TO authenticated
  USING (advocate_id = auth.uid() OR advocate_id IS NULL);

-- ============================================================================
-- 3. FIX SERVICE_CATEGORIES TABLE
-- ============================================================================

-- Enable RLS on service_categories
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service categories are viewable by all" ON service_categories;

-- Grant permissions
GRANT SELECT ON service_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON service_categories TO authenticated;

-- Allow all authenticated users to view categories
CREATE POLICY "service_categories_select_policy"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 4. FIX PDF_TEMPLATES TABLE
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Advocates can view their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Advocates can create their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Advocates can update their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Advocates can delete their own templates" ON pdf_templates;

-- Grant permissions
GRANT ALL ON pdf_templates TO authenticated;

-- Create policies
CREATE POLICY "pdf_templates_select_policy"
  ON pdf_templates FOR SELECT
  TO authenticated
  USING (advocate_id = auth.uid());

CREATE POLICY "pdf_templates_insert_policy"
  ON pdf_templates FOR INSERT
  TO authenticated
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "pdf_templates_update_policy"
  ON pdf_templates FOR UPDATE
  TO authenticated
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "pdf_templates_delete_policy"
  ON pdf_templates FOR DELETE
  TO authenticated
  USING (advocate_id = auth.uid());

-- ============================================================================
-- 5. FIX MATTERS TABLE (ensure proper select permissions)
-- ============================================================================

-- Drop and recreate matters select policy to ensure it works
DROP POLICY IF EXISTS "Advocates can view their own matters" ON matters;
DROP POLICY IF EXISTS "matters_select_policy" ON matters;

CREATE POLICY "matters_select_policy"
  ON matters FOR SELECT
  TO authenticated
  USING (advocate_id = auth.uid());

-- Ensure matters table has proper grants
GRANT SELECT, INSERT, UPDATE, DELETE ON matters TO authenticated;

-- ============================================================================
-- 6. VERIFY ALL GRANTS
-- ============================================================================

-- Ensure all necessary grants are in place
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (for debugging)
-- ============================================================================

-- Check RLS status
DO $$
BEGIN
  RAISE NOTICE 'RLS Status Check:';
  RAISE NOTICE 'matter_services RLS: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'matter_services');
  RAISE NOTICE 'services RLS: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'services');
  RAISE NOTICE 'service_categories RLS: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'service_categories');
  RAISE NOTICE 'pdf_templates RLS: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'pdf_templates');
  RAISE NOTICE 'matters RLS: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'matters');
END $$;
