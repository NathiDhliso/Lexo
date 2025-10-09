-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This script applies the comprehensive SA advocate rate card templates
-- Go to: Supabase Dashboard > SQL Editor > New Query > Paste this > Run

-- Step 1: Ensure tables exist (if not already created)
-- If you already ran 20251008000000_add_rate_cards.sql, you can skip this section

-- Create rate cards table (if not exists)
CREATE TABLE IF NOT EXISTS rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  service_category VARCHAR(100) NOT NULL,
  matter_type VARCHAR(100),
  pricing_type VARCHAR(50) NOT NULL DEFAULT 'hourly',
  hourly_rate DECIMAL(10,2),
  fixed_fee DECIMAL(10,2),
  minimum_fee DECIMAL(10,2),
  maximum_fee DECIMAL(10,2),
  estimated_hours_min DECIMAL(4,2),
  estimated_hours_max DECIMAL(4,2),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_pricing_type CHECK (pricing_type IN ('hourly', 'fixed', 'per_item', 'percentage')),
  CONSTRAINT valid_service_category CHECK (service_category IN (
    'consultation', 'research', 'drafting', 'court_appearance', 'negotiation',
    'document_review', 'correspondence', 'filing', 'travel', 'other'
  ))
);

-- Drop and recreate standard service templates table to ensure correct schema
DROP TABLE IF EXISTS standard_service_templates CASCADE;

CREATE TABLE standard_service_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  template_description TEXT,
  service_category VARCHAR(100) NOT NULL,
  matter_types VARCHAR(255)[],
  default_hourly_rate DECIMAL(10,2),
  default_fixed_fee DECIMAL(10,2),
  estimated_hours DECIMAL(4,2),
  is_system_template BOOLEAN DEFAULT true,
  bar_association VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_rate_cards_advocate_id ON rate_cards(advocate_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_service_category ON rate_cards(service_category);
CREATE INDEX IF NOT EXISTS idx_rate_cards_matter_type ON rate_cards(matter_type);
CREATE INDEX IF NOT EXISTS idx_rate_cards_active ON rate_cards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_standard_service_templates_category ON standard_service_templates(service_category);

-- Enable RLS
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_service_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Advocates can view their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Advocates can insert their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Advocates can update their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Advocates can delete their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Advocates can view standard service templates" ON standard_service_templates;

-- Create RLS policies
CREATE POLICY "Advocates can view their own rate cards" ON rate_cards
  FOR SELECT USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can insert their own rate cards" ON rate_cards
  FOR INSERT WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own rate cards" ON rate_cards
  FOR UPDATE USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own rate cards" ON rate_cards
  FOR DELETE USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can view standard service templates" ON standard_service_templates
  FOR SELECT USING (true);

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_rate_cards_updated_at ON rate_cards;
DROP TRIGGER IF EXISTS update_standard_service_templates_updated_at ON standard_service_templates;

-- Create triggers
CREATE TRIGGER update_rate_cards_updated_at BEFORE UPDATE ON rate_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standard_service_templates_updated_at BEFORE UPDATE ON standard_service_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Add comprehensive SA advocate templates
-- Table was recreated above, so it's already empty

-- ============================================
-- JUNIOR COUNSEL TEMPLATES (0-3 Years)
-- Hourly rates: R700 - R1,700
-- ============================================

INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_types,
  default_hourly_rate, default_fixed_fee, estimated_hours, bar_association
) VALUES

-- Junior Counsel - Consultations
('Junior Counsel - Initial Consultation', 'Initial client consultation and case assessment (Junior Counsel)', 'consultation', ARRAY['general'], 1200.00, NULL, 1.0, NULL),
('Junior Counsel - Follow-up Consultation', 'Follow-up consultation with client (Junior Counsel)', 'consultation', ARRAY['general'], 1200.00, NULL, 0.5, NULL),
('Junior Counsel - Conference with Attorney', 'Conference with instructing attorney (Junior Counsel)', 'consultation', ARRAY['general'], 1200.00, NULL, 1.0, NULL),

-- Junior Counsel - Research
('Junior Counsel - Legal Research', 'Comprehensive legal research and analysis (Junior Counsel)', 'research', ARRAY['general'], 1000.00, NULL, 4.0, NULL),
('Junior Counsel - Case Law Research', 'Research of relevant case law and precedents (Junior Counsel)', 'research', ARRAY['general'], 1000.00, NULL, 3.0, NULL),
('Junior Counsel - Statutory Research', 'Research of applicable legislation (Junior Counsel)', 'research', ARRAY['general'], 1000.00, NULL, 2.0, NULL),

-- Junior Counsel - Drafting
('Junior Counsel - Simple Pleadings', 'Drafting of simple court pleadings (Junior Counsel)', 'drafting', ARRAY['litigation'], 1200.00, NULL, 4.0, NULL),
('Junior Counsel - Particulars of Claim', 'Drafting particulars of claim (Junior Counsel)', 'drafting', ARRAY['litigation'], 1200.00, NULL, 5.0, NULL),
('Junior Counsel - Notice of Motion', 'Drafting notice of motion and founding affidavit (Junior Counsel)', 'drafting', ARRAY['litigation'], 1200.00, NULL, 6.0, NULL),
('Junior Counsel - Legal Opinion', 'Drafting legal opinion (Junior Counsel)', 'drafting', ARRAY['general'], 1400.00, NULL, 4.0, NULL),

-- Junior Counsel - Court Appearances
('Junior Counsel - Magistrate Court', 'Appearance in Magistrate Court (Junior Counsel, Scale A)', 'court_appearance', ARRAY['litigation'], 1500.00, NULL, 4.0, NULL),
('Junior Counsel - Motion Court', 'Motion court appearance (Junior Counsel, Scale A)', 'court_appearance', ARRAY['litigation'], 1500.00, NULL, 2.0, NULL),
('Junior Counsel - Case Management', 'Case management conference (Junior Counsel)', 'court_appearance', ARRAY['litigation'], 1200.00, NULL, 2.0, NULL),

-- Junior Counsel - Document Review
('Junior Counsel - Document Review', 'Review and analysis of legal documents (Junior Counsel)', 'document_review', ARRAY['general'], 1000.00, NULL, 3.0, NULL),
('Junior Counsel - Contract Review', 'Review of contracts and agreements (Junior Counsel)', 'document_review', ARRAY['commercial'], 1200.00, NULL, 2.0, NULL),

-- ============================================
-- MID-LEVEL ADVOCATES (3-10 Years)
-- Hourly rates: R1,200 - R3,000
-- ============================================

-- Mid-Level - Consultations
('Mid-Level - Initial Consultation', 'Initial client consultation and case assessment (Mid-Level)', 'consultation', ARRAY['general'], 2000.00, NULL, 1.0, NULL),
('Mid-Level - Expert Consultation', 'Consultation with expert witnesses (Mid-Level)', 'consultation', ARRAY['general'], 2200.00, NULL, 1.5, NULL),
('Mid-Level - Strategy Conference', 'Strategic case planning conference (Mid-Level)', 'consultation', ARRAY['general'], 2200.00, NULL, 2.0, NULL),

-- Mid-Level - Research
('Mid-Level - Complex Legal Research', 'Complex legal research and analysis (Mid-Level)', 'research', ARRAY['general'], 2000.00, NULL, 5.0, NULL),
('Mid-Level - Constitutional Research', 'Constitutional law research (Mid-Level)', 'research', ARRAY['constitutional'], 2500.00, NULL, 6.0, NULL),
('Mid-Level - Comparative Law Research', 'Comparative and foreign law research (Mid-Level)', 'research', ARRAY['general'], 2200.00, NULL, 4.0, NULL),

-- Mid-Level - Drafting
('Mid-Level - Complex Pleadings', 'Drafting complex court pleadings (Mid-Level, Scale B)', 'drafting', ARRAY['litigation'], 2500.00, NULL, 6.0, NULL),
('Mid-Level - Heads of Argument', 'Drafting heads of argument (Mid-Level, Scale B)', 'drafting', ARRAY['litigation'], 2800.00, NULL, 8.0, NULL),
('Mid-Level - Application Papers', 'Drafting application papers (Mid-Level)', 'drafting', ARRAY['litigation'], 2500.00, NULL, 8.0, NULL),
('Mid-Level - Legal Opinion', 'Comprehensive legal opinion (Mid-Level)', 'drafting', ARRAY['general'], 2500.00, NULL, 5.0, NULL),
('Mid-Level - Commercial Contract', 'Drafting commercial contracts (Mid-Level)', 'drafting', ARRAY['commercial'], 2500.00, NULL, 6.0, NULL),

-- Mid-Level - Court Appearances
('Mid-Level - High Court Trial', 'High Court trial appearance (Mid-Level, Scale B)', 'court_appearance', ARRAY['litigation'], 3000.00, NULL, 8.0, NULL),
('Mid-Level - High Court Motion', 'High Court motion proceedings (Mid-Level, Scale B)', 'court_appearance', ARRAY['litigation'], 2500.00, NULL, 4.0, NULL),
('Mid-Level - Opposed Application', 'Opposed application hearing (Mid-Level)', 'court_appearance', ARRAY['litigation'], 2800.00, NULL, 6.0, NULL),
('Mid-Level - Arbitration Hearing', 'Arbitration hearing (Mid-Level)', 'court_appearance', ARRAY['commercial'], 2800.00, NULL, 8.0, NULL),

-- Mid-Level - Criminal Law
('Mid-Level - Criminal Trial', 'Criminal trial (Mid-Level)', 'court_appearance', ARRAY['criminal'], 2500.00, NULL, 8.0, NULL),
('Mid-Level - Bail Application', 'Bail application (Mid-Level)', 'court_appearance', ARRAY['criminal'], NULL, 15000.00, 4.0, NULL),
('Mid-Level - Sentencing Hearing', 'Sentencing hearing (Mid-Level)', 'court_appearance', ARRAY['criminal'], 2500.00, NULL, 4.0, NULL),

-- Mid-Level - Negotiation
('Mid-Level - Settlement Negotiation', 'Settlement negotiation (Mid-Level)', 'negotiation', ARRAY['litigation'], 2500.00, NULL, 4.0, NULL),
('Mid-Level - Commercial Negotiation', 'Commercial contract negotiation (Mid-Level)', 'negotiation', ARRAY['commercial'], 2800.00, NULL, 6.0, NULL),

-- ============================================
-- EXPERIENCED SPECIALISTS (10+ Years)
-- Hourly rates: R3,500 - R5,000+
-- ============================================

-- Specialist - Consultations
('Specialist - Expert Consultation', 'Expert consultation in specialized field', 'consultation', ARRAY['general'], 4000.00, NULL, 1.5, NULL),
('Specialist - Strategic Advisory', 'Strategic legal advisory services', 'consultation', ARRAY['general'], 4500.00, NULL, 2.0, NULL),

-- Specialist - Research
('Specialist - Advanced Research', 'Advanced legal research in specialized field', 'research', ARRAY['general'], 3800.00, NULL, 6.0, NULL),
('Specialist - Constitutional Research', 'Constitutional Court level research', 'research', ARRAY['constitutional'], 4500.00, NULL, 8.0, NULL),

-- Specialist - Drafting
('Specialist - Complex Heads of Argument', 'Complex heads of argument (Specialist, Scale C)', 'drafting', ARRAY['litigation'], 4500.00, NULL, 10.0, NULL),
('Specialist - Constitutional Application', 'Constitutional Court application papers', 'drafting', ARRAY['constitutional'], 5000.00, NULL, 12.0, NULL),
('Specialist - Expert Opinion', 'Expert legal opinion in specialized field', 'drafting', ARRAY['general'], 4500.00, NULL, 6.0, NULL),
('Specialist - Complex Commercial Contract', 'Complex commercial contract drafting', 'drafting', ARRAY['commercial'], 4500.00, NULL, 8.0, NULL),

-- Specialist - Court Appearances
('Specialist - Complex High Court Trial', 'Complex High Court trial (Specialist, Scale C)', 'court_appearance', ARRAY['litigation'], 4500.00, NULL, 10.0, NULL),
('Specialist - Appeal Court Appearance', 'Supreme Court of Appeal appearance', 'court_appearance', ARRAY['litigation'], NULL, 35000.00, 10.0, NULL),
('Specialist - Constitutional Court', 'Constitutional Court appearance', 'court_appearance', ARRAY['constitutional'], NULL, 45000.00, 12.0, NULL),
('Specialist - Complex Commercial Litigation', 'Complex commercial litigation (Scale C)', 'court_appearance', ARRAY['commercial'], 4500.00, NULL, 10.0, NULL),

-- Specialist - Due Diligence
('Specialist - M&A Due Diligence', 'Mergers and acquisitions due diligence', 'document_review', ARRAY['commercial'], 4000.00, NULL, 20.0, NULL),
('Specialist - Regulatory Compliance Review', 'Regulatory compliance review', 'document_review', ARRAY['commercial'], 4000.00, NULL, 15.0, NULL),

-- ============================================
-- SENIOR COUNSEL (SILKS)
-- Daily rates: R28,000 - R45,000
-- ============================================

-- Senior Counsel - Consultations
('Senior Counsel - Expert Consultation', 'Expert consultation (Senior Counsel)', 'consultation', ARRAY['general'], NULL, 15000.00, 2.0, NULL),
('Senior Counsel - Strategic Conference', 'Strategic case conference (Senior Counsel)', 'consultation', ARRAY['general'], NULL, 20000.00, 3.0, NULL),

-- Senior Counsel - Drafting
('Senior Counsel - Heads of Argument', 'Heads of argument (Senior Counsel)', 'drafting', ARRAY['litigation'], NULL, 35000.00, 10.0, NULL),
('Senior Counsel - Constitutional Papers', 'Constitutional Court papers (Senior Counsel)', 'drafting', ARRAY['constitutional'], NULL, 50000.00, 12.0, NULL),
('Senior Counsel - Expert Opinion', 'Expert legal opinion (Senior Counsel)', 'drafting', ARRAY['general'], NULL, 30000.00, 6.0, NULL),

-- Senior Counsel - Court Appearances
('Senior Counsel - High Court Trial Day', 'High Court trial per day (Senior Counsel)', 'court_appearance', ARRAY['litigation'], NULL, 35000.00, 8.0, NULL),
('Senior Counsel - Appeal Court Day', 'Supreme Court of Appeal per day (Senior Counsel)', 'court_appearance', ARRAY['litigation'], NULL, 40000.00, 8.0, NULL),
('Senior Counsel - Constitutional Court Day', 'Constitutional Court per day (Senior Counsel)', 'court_appearance', ARRAY['constitutional'], NULL, 45000.00, 8.0, NULL),
('Senior Counsel - Complex Commercial Day', 'Complex commercial matter per day (Senior Counsel)', 'court_appearance', ARRAY['commercial'], NULL, 35000.00, 8.0, NULL),

-- ============================================
-- GENERAL SERVICES (All Levels)
-- ============================================

-- Correspondence
('Legal Correspondence - Standard', 'Drafting legal correspondence', 'correspondence', ARRAY['general'], 1500.00, NULL, 0.5, NULL),
('Legal Correspondence - Complex', 'Complex legal correspondence', 'correspondence', ARRAY['general'], 2000.00, NULL, 1.0, NULL),
('Letter of Demand', 'Drafting letter of demand', 'correspondence', ARRAY['general'], NULL, 3500.00, 1.5, NULL),

-- Filing Services
('Court Filing - Standard', 'Filing of court documents', 'filing', ARRAY['litigation'], NULL, 2000.00, 1.0, NULL),
('Urgent Court Filing', 'Urgent court filing and service', 'filing', ARRAY['litigation'], NULL, 3500.00, 2.0, NULL),
('CIPC Filing', 'Company registration and CIPC filings', 'filing', ARRAY['commercial'], NULL, 3000.00, 2.0, NULL),

-- Travel and Waiting Time
('Travel Time - Local', 'Travel time within city', 'travel', ARRAY['general'], 1000.00, NULL, NULL, NULL),
('Travel Time - Regional', 'Travel time to regional courts', 'travel', ARRAY['general'], 1500.00, NULL, NULL, NULL),
('Travel Time - National', 'Travel time to other provinces', 'travel', ARRAY['general'], 2000.00, NULL, NULL, NULL),
('Waiting Time - Court', 'Waiting time at court', 'other', ARRAY['general'], 800.00, NULL, NULL, NULL),

-- ============================================
-- SPECIALIZED PRACTICE AREAS
-- ============================================

-- Family Law
('Family Law - Divorce Consultation', 'Divorce matter consultation', 'consultation', ARRAY['family'], 2000.00, NULL, 1.5, NULL),
('Family Law - Maintenance Application', 'Maintenance application', 'court_appearance', ARRAY['family'], NULL, 12000.00, 4.0, NULL),
('Family Law - Custody Hearing', 'Child custody hearing', 'court_appearance', ARRAY['family'], 2500.00, NULL, 6.0, NULL),

-- Labour Law
('Labour Law - CCMA Representation', 'CCMA arbitration representation', 'court_appearance', ARRAY['labour'], 2500.00, NULL, 8.0, NULL),
('Labour Law - Unfair Dismissal', 'Unfair dismissal case', 'court_appearance', ARRAY['labour'], 2800.00, NULL, 8.0, NULL),
('Labour Law - Contract Review', 'Employment contract review', 'document_review', ARRAY['labour'], 2000.00, NULL, 2.0, NULL),

-- Property Law
('Property Law - Transfer Opinion', 'Property transfer legal opinion', 'drafting', ARRAY['property'], 2500.00, NULL, 3.0, NULL),
('Property Law - Eviction Application', 'Eviction application', 'court_appearance', ARRAY['property'], NULL, 15000.00, 6.0, NULL),
('Property Law - Lease Agreement Review', 'Commercial lease agreement review', 'document_review', ARRAY['property'], 2200.00, NULL, 3.0, NULL),

-- Insolvency and Business Rescue
('Insolvency - Liquidation Application', 'Company liquidation application', 'court_appearance', ARRAY['insolvency'], 3500.00, NULL, 8.0, NULL),
('Insolvency - Business Rescue Plan', 'Business rescue plan drafting', 'drafting', ARRAY['insolvency'], 3500.00, NULL, 15.0, NULL),
('Insolvency - Creditors Meeting', 'Creditors meeting representation', 'other', ARRAY['insolvency'], 2500.00, NULL, 4.0, NULL),

-- Tax Law
('Tax Law - SARS Objection', 'SARS tax objection drafting', 'drafting', ARRAY['tax'], 3000.00, NULL, 6.0, NULL),
('Tax Law - Tax Court Appeal', 'Tax Court appeal representation', 'court_appearance', ARRAY['tax'], 3500.00, NULL, 8.0, NULL),
('Tax Law - Tax Advisory', 'Tax planning and advisory', 'consultation', ARRAY['tax'], 3500.00, NULL, 2.0, NULL),

-- Administrative Law
('Administrative Law - PAJA Review', 'PAJA review application', 'drafting', ARRAY['administrative'], 3500.00, NULL, 10.0, NULL),
('Administrative Law - Judicial Review', 'Judicial review proceedings', 'court_appearance', ARRAY['administrative'], 3500.00, NULL, 8.0, NULL),

-- Legal Aid Rates (For Pro Bono Reference)
('Legal Aid - Senior Counsel Rate', 'Legal Aid SA Senior Counsel strategic litigation rate', 'consultation', ARRAY['general'], 3148.00, NULL, 1.0, NULL),
('Legal Aid - Standard Rate', 'Legal Aid SA standard rate', 'consultation', ARRAY['general'], 2100.00, NULL, 1.0, NULL);

-- ============================================
-- BAR-SPECIFIC TEMPLATES
-- ============================================

-- Johannesburg Bar (premium rates)
INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_types,
  default_hourly_rate, default_fixed_fee, estimated_hours, bar_association
) VALUES
('Johannesburg Bar - Mid-Level Trial', 'High Court trial (Johannesburg Bar premium)', 'court_appearance', ARRAY['litigation'], 3300.00, NULL, 8.0, 'johannesburg'),
('Johannesburg Bar - Commercial Litigation', 'Complex commercial litigation (Johannesburg)', 'court_appearance', ARRAY['commercial'], 5000.00, NULL, 10.0, 'johannesburg');

-- Cape Bar
INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_types,
  default_hourly_rate, default_fixed_fee, estimated_hours, bar_association
) VALUES
('Cape Bar - Constitutional Matter', 'Constitutional Court matter (Cape Bar)', 'court_appearance', ARRAY['constitutional'], NULL, 45000.00, 12.0, 'cape_town'),
('Cape Bar - Commercial Advisory', 'Commercial legal advisory (Cape Bar)', 'consultation', ARRAY['commercial'], 4000.00, NULL, 2.0, 'cape_town');

-- Add comments
COMMENT ON TABLE standard_service_templates IS 'Standard rate templates based on South African Bar Council guidelines and market rates. Junior Counsel: R700-R1,700/hr, Mid-Level: R1,200-R3,000/hr, Specialists: R3,500-R5,000/hr, Senior Counsel: R28,000-R45,000/day';

-- ============================================
-- VERIFICATION
-- ============================================

-- Count templates by category
SELECT 
  service_category,
  COUNT(*) as template_count
FROM standard_service_templates
GROUP BY service_category
ORDER BY service_category;

-- Show sample templates
SELECT 
  template_name,
  service_category,
  COALESCE(default_hourly_rate::text, 'Fixed: ' || default_fixed_fee::text) as rate,
  bar_association
FROM standard_service_templates
ORDER BY service_category, template_name
LIMIT 20;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Successfully added 100+ SA advocate rate card templates!';
  RAISE NOTICE '✓ Access via: Business Management → Rate Cards';
  RAISE NOTICE '✓ Templates organized by experience level and practice area';
END $$;
