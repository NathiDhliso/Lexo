-- ============================================================================
-- PIPELINE REFACTORING - PRODUCTION DATABASE MIGRATIONS
-- ============================================================================
-- Apply these migrations in your Supabase SQL Editor
-- Date: 2025-01-15
-- Description: Creates firms table, adds firm_id to matters, creates logged_services table
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Create firms table
-- ============================================================================

CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name TEXT NOT NULL,
  attorney_name TEXT NOT NULL,
  practice_number TEXT,
  phone_number TEXT,
  email TEXT NOT NULL UNIQUE,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_firms_email ON firms(email);
CREATE INDEX IF NOT EXISTS idx_firms_status ON firms(status);
CREATE INDEX IF NOT EXISTS idx_firms_firm_name ON firms(firm_name);

CREATE OR REPLACE FUNCTION update_firms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER firms_updated_at
  BEFORE UPDATE ON firms
  FOR EACH ROW
  EXECUTE FUNCTION update_firms_updated_at();

ALTER TABLE firms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view all firms"
  ON firms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert firms"
  ON firms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update firms"
  ON firms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete firms"
  ON firms FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE firms IS 'Stores instructing law firms that brief advocates for matters';

-- ============================================================================
-- MIGRATION 2: Add firm_id to matters table
-- ============================================================================

ALTER TABLE matters
ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES firms(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_matters_firm_id ON matters(firm_id);

COMMENT ON COLUMN matters.firm_id IS 'Foreign key to the instructing firm';

-- ============================================================================
-- MIGRATION 3: Create logged_services table
-- ============================================================================

CREATE TABLE IF NOT EXISTS logged_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  description TEXT NOT NULL CHECK (length(description) >= 5),
  service_type TEXT NOT NULL CHECK (service_type IN ('consultation', 'drafting', 'research', 'court_appearance', 'negotiation', 'review', 'other')),
  estimated_hours NUMERIC(10,2),
  rate_card_id UUID,
  unit_rate NUMERIC(10,2) NOT NULL CHECK (unit_rate > 0),
  quantity NUMERIC(10,2) DEFAULT 1 CHECK (quantity > 0),
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  is_estimate BOOLEAN DEFAULT false,
  pro_forma_id UUID,
  invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logged_services_matter ON logged_services(matter_id);
CREATE INDEX IF NOT EXISTS idx_logged_services_advocate ON logged_services(advocate_id);
CREATE INDEX IF NOT EXISTS idx_logged_services_pro_forma ON logged_services(pro_forma_id);
CREATE INDEX IF NOT EXISTS idx_logged_services_invoice ON logged_services(invoice_id);
CREATE INDEX IF NOT EXISTS idx_logged_services_date ON logged_services(service_date);
CREATE INDEX IF NOT EXISTS idx_logged_services_is_estimate ON logged_services(is_estimate);
CREATE INDEX IF NOT EXISTS idx_logged_services_service_type ON logged_services(service_type);

CREATE OR REPLACE FUNCTION update_logged_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER logged_services_updated_at
  BEFORE UPDATE ON logged_services
  FOR EACH ROW
  EXECUTE FUNCTION update_logged_services_updated_at();

CREATE OR REPLACE FUNCTION calculate_logged_service_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount = NEW.unit_rate * NEW.quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER logged_services_calculate_amount
  BEFORE INSERT OR UPDATE ON logged_services
  FOR EACH ROW
  EXECUTE FUNCTION calculate_logged_service_amount();

ALTER TABLE logged_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view own logged services"
  ON logged_services FOR SELECT TO authenticated
  USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can insert own logged services"
  ON logged_services FOR INSERT TO authenticated
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update own uninvoiced logged services"
  ON logged_services FOR UPDATE TO authenticated
  USING (advocate_id = auth.uid() AND invoice_id IS NULL)
  WITH CHECK (advocate_id = auth.uid() AND invoice_id IS NULL);

CREATE POLICY "Advocates can delete own uninvoiced logged services"
  ON logged_services FOR DELETE TO authenticated
  USING (advocate_id = auth.uid() AND invoice_id IS NULL);

COMMENT ON TABLE logged_services IS 'Stores service-based work items for both Pro Forma estimates and WIP actuals';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All 3 migrations applied successfully!
-- Next steps:
-- 1. Verify tables created: SELECT * FROM firms LIMIT 1;
-- 2. Verify column added: SELECT firm_id FROM matters LIMIT 1;
-- 3. Verify logged_services: SELECT * FROM logged_services LIMIT 1;
-- ============================================================================
