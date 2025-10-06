-- Add comprehensive South African advocate rate cards and pricing structures
-- Based on South African Bar Council guidelines and market rates
-- This enables advocates to configure standardized pricing for different types of legal work

-- Create rate cards table for standardized legal services
CREATE TABLE IF NOT EXISTS rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  -- Service details
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  service_category VARCHAR(100) NOT NULL, -- consultation, drafting, research, court_appearance, etc.
  matter_type VARCHAR(100), -- Optional: specific to certain matter types
  
  -- Pricing structure
  pricing_type VARCHAR(50) NOT NULL DEFAULT 'hourly', -- hourly, fixed, per_item, percentage
  hourly_rate DECIMAL(10,2), -- For hourly services
  fixed_fee DECIMAL(10,2), -- For fixed-fee services
  minimum_fee DECIMAL(10,2), -- Minimum charge
  maximum_fee DECIMAL(10,2), -- Maximum charge (for percentage-based)
  
  -- Time estimates
  estimated_hours_min DECIMAL(4,2), -- Minimum estimated hours
  estimated_hours_max DECIMAL(4,2), -- Maximum estimated hours
  
  -- Additional settings
  is_default BOOLEAN DEFAULT false, -- Default service for this category
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false, -- Requires client approval before proceeding
  
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
  matter_types VARCHAR(255)[], -- Array of applicable matter types
  
  -- Default pricing (advocates can override)
  default_hourly_rate DECIMAL(10,2),
  default_fixed_fee DECIMAL(10,2),
  estimated_hours DECIMAL(4,2),
  
  -- Template settings
  is_system_template BOOLEAN DEFAULT true,
  bar_association VARCHAR(50), -- johannesburg, cape_town, or null for all
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_rate_cards_advocate_id ON rate_cards(advocate_id);
CREATE INDEX idx_rate_cards_service_category ON rate_cards(service_category);
CREATE INDEX idx_rate_cards_matter_type ON rate_cards(matter_type);
CREATE INDEX idx_rate_cards_active ON rate_cards(is_active) WHERE is_active = true;
CREATE INDEX idx_standard_service_templates_category ON standard_service_templates(service_category);

-- Add RLS policies
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_service_templates ENABLE ROW LEVEL SECURITY;

-- Rate cards policies
CREATE POLICY "Advocates can view their own rate cards" ON rate_cards
  FOR SELECT USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can insert their own rate cards" ON rate_cards
  FOR INSERT WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own rate cards" ON rate_cards
  FOR UPDATE USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own rate cards" ON rate_cards
  FOR DELETE USING (advocate_id = auth.uid());

-- Standard service templates policies (read-only for advocates)
CREATE POLICY "Advocates can view standard service templates" ON standard_service_templates
  FOR SELECT USING (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rate_cards_updated_at BEFORE UPDATE ON rate_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standard_service_templates_updated_at BEFORE UPDATE ON standard_service_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE rate_cards IS 'Advocate-specific rate cards for different legal services';
COMMENT ON TABLE standard_service_templates IS 'System-wide templates for common legal services that advocates can use as starting points';
COMMENT ON COLUMN rate_cards.pricing_type IS 'Type of pricing: hourly, fixed, per_item, or percentage';
COMMENT ON COLUMN rate_cards.service_category IS 'Category of legal service for organization and filtering';
COMMENT ON COLUMN standard_service_templates.matter_types IS 'Array of matter types this template applies to';