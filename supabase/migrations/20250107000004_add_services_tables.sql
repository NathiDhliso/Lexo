-- Add missing services-related tables
-- This migration addresses the 404 error for matter_services table

-- ============================================================================
-- SERVICES TABLES
-- ============================================================================

-- Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matter Services (Junction Table)
CREATE TABLE IF NOT EXISTS matter_services (
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (matter_id, service_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_matter_services_matter ON matter_services(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_services_service ON matter_services(service_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_services ENABLE ROW LEVEL SECURITY;

-- Service Categories: Public read access, admin write access
CREATE POLICY "Anyone can view service categories"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- Services: Public read access, admin write access  
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

-- Matter Services: Users can manage services for their own matters
CREATE POLICY "Users can view matter services for their own matters"
  ON matter_services FOR SELECT
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can add services to their own matters"
  ON matter_services FOR INSERT
  WITH CHECK (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove services from their own matters"
  ON matter_services FOR DELETE
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample service categories
INSERT INTO service_categories (name, description) VALUES
  ('Consultation', 'Client consultation and advice services'),
  ('Research', 'Legal research and case preparation'),
  ('Drafting', 'Document drafting and preparation'),
  ('Court Appearance', 'Court appearances and advocacy'),
  ('Document Review', 'Document review and analysis'),
  ('Negotiation', 'Settlement negotiations and mediation')
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (category_id, name, description) 
SELECT 
  sc.id,
  s.name,
  s.description
FROM service_categories sc
CROSS JOIN (VALUES
  ('Initial Consultation', 'First meeting with client to assess case'),
  ('Follow-up Consultation', 'Subsequent client meetings and updates'),
  ('Case Research', 'Legal research for case preparation'),
  ('Precedent Research', 'Research of relevant case law and precedents'),
  ('Pleadings Drafting', 'Preparation of court pleadings'),
  ('Contract Drafting', 'Preparation of legal contracts'),
  ('Court Appearance', 'Representation in court proceedings'),
  ('Settlement Negotiation', 'Negotiating settlements with opposing parties'),
  ('Document Review', 'Review of legal documents and contracts'),
  ('Due Diligence', 'Due diligence investigations')
) AS s(name, description)
WHERE 
  (sc.name = 'Consultation' AND s.name LIKE '%Consultation%') OR
  (sc.name = 'Research' AND s.name LIKE '%Research%') OR
  (sc.name = 'Drafting' AND s.name LIKE '%Drafting%') OR
  (sc.name = 'Court Appearance' AND s.name = 'Court Appearance') OR
  (sc.name = 'Document Review' AND s.name LIKE '%Review%' OR s.name = 'Due Diligence') OR
  (sc.name = 'Negotiation' AND s.name LIKE '%Negotiation%')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE service_categories IS 'Categories for legal services offered by advocates';
COMMENT ON TABLE services IS 'Specific legal services that can be associated with matters';
COMMENT ON TABLE matter_services IS 'Junction table linking matters to their associated services';