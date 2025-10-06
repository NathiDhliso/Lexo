-- Create rate cards table for standardized legal services
CREATE TABLE IF NOT EXISTS rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  -- Service details
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  service_category VARCHAR(100) NOT NULL,
  matter_type VARCHAR(100),
  
  -- Pricing structure
  pricing_type VARCHAR(50) NOT NULL DEFAULT 'hourly',
  hourly_rate DECIMAL(10,2),
  fixed_fee DECIMAL(10,2),
  minimum_fee DECIMAL(10,2),
  maximum_fee DECIMAL(10,2),
  
  -- Time estimates
  estimated_hours_min DECIMAL(4,2),
  estimated_hours_max DECIMAL(4,2),
  
  -- Additional settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_pricing_type CHECK (pricing_type IN ('hourly', 'fixed', 'per_item', 'percentage')),
  CONSTRAINT valid_service_category CHECK (service_category IN (
    'consultation', 'research', 'drafting', 'court_appearance', 'negotiation',
    'document_review', 'correspondence', 'filing', 'travel', 'other'
  ))
);

-- Create standard service templates table
CREATE TABLE IF NOT EXISTS standard_service_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template details
  template_name VARCHAR(255) NOT NULL,
  template_description TEXT,
  service_category VARCHAR(100) NOT NULL,
  matter_type VARCHAR(100),
  
  -- Default pricing
  default_pricing_type VARCHAR(50) NOT NULL DEFAULT 'hourly',
  default_hourly_rate DECIMAL(10,2),
  default_fixed_fee DECIMAL(10,2),
  default_minimum_fee DECIMAL(10,2),
  default_maximum_fee DECIMAL(10,2),
  
  -- Time estimates
  default_hours_min DECIMAL(4,2),
  default_hours_max DECIMAL(4,2),
  
  -- Template settings
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_service_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rate_cards
CREATE POLICY "Advocates can view their own rate cards" ON rate_cards
  FOR SELECT USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can insert their own rate cards" ON rate_cards
  FOR INSERT WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own rate cards" ON rate_cards
  FOR UPDATE USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own rate cards" ON rate_cards
  FOR DELETE USING (advocate_id = auth.uid());

-- RLS Policies for standard_service_templates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view service templates" ON standard_service_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert some default South African legal service templates
INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_type,
  default_pricing_type, default_hourly_rate, default_fixed_fee, default_minimum_fee,
  default_hours_min, default_hours_max, sort_order
) VALUES
  ('Initial Consultation', 'Initial client consultation and case assessment', 'consultation', NULL, 'hourly', 1500.00, NULL, 500.00, 1.0, 2.0, 1),
  ('Legal Research', 'Comprehensive legal research and analysis', 'research', NULL, 'hourly', 1200.00, NULL, 300.00, 2.0, 8.0, 2),
  ('Contract Drafting', 'Drafting of legal contracts and agreements', 'drafting', 'commercial', 'fixed', NULL, 5000.00, 2000.00, 3.0, 6.0, 3),
  ('Court Appearance', 'Representation in court proceedings', 'court_appearance', NULL, 'hourly', 2500.00, NULL, 1000.00, 2.0, 8.0, 4),
  ('Document Review', 'Review and analysis of legal documents', 'document_review', NULL, 'hourly', 1000.00, NULL, 250.00, 1.0, 4.0, 5);