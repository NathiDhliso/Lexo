-- ============================================================================
-- RATE CARDS & PRICING MANAGEMENT
-- Supporting feature for Pro Forma → Matter → Invoice workflow
-- ============================================================================

-- Service Category Enum (matches TypeScript ServiceCategory type)
-- Note: Using rate_card_category to avoid conflict with existing service_categories table
CREATE TYPE rate_card_category AS ENUM (
  'consultation',
  'research',
  'drafting',
  'court_appearance',
  'negotiation',
  'document_review',
  'correspondence',
  'filing',
  'travel',
  'other'
);

-- Pricing Type Enum
CREATE TYPE pricing_type AS ENUM (
  'hourly',
  'fixed',
  'per_item',
  'percentage'
);

-- ============================================================================
-- RATE CARDS TABLE
-- ============================================================================

CREATE TABLE rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  service_name TEXT NOT NULL,
  service_description TEXT,
  service_category rate_card_category NOT NULL,
  matter_type TEXT,
  
  pricing_type pricing_type NOT NULL DEFAULT 'hourly',
  hourly_rate DECIMAL(10,2),
  fixed_fee DECIMAL(10,2),
  minimum_fee DECIMAL(10,2),
  maximum_fee DECIMAL(10,2),
  
  estimated_hours_min DECIMAL(5,2),
  estimated_hours_max DECIMAL(5,2),
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_pricing CHECK (
    (pricing_type = 'hourly' AND hourly_rate IS NOT NULL) OR
    (pricing_type = 'fixed' AND fixed_fee IS NOT NULL) OR
    (pricing_type IN ('per_item', 'percentage'))
  )
);

-- ============================================================================
-- STANDARD SERVICE TEMPLATES TABLE
-- ============================================================================

CREATE TABLE standard_service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  template_name TEXT NOT NULL,
  template_description TEXT,
  service_category rate_card_category NOT NULL,
  matter_types TEXT[],
  
  default_hourly_rate DECIMAL(10,2),
  default_fixed_fee DECIMAL(10,2),
  estimated_hours DECIMAL(5,2),
  
  is_system_template BOOLEAN DEFAULT true,
  bar_association bar_association,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_rate_cards_advocate ON rate_cards(advocate_id);
CREATE INDEX idx_rate_cards_category ON rate_cards(service_category);
CREATE INDEX idx_rate_cards_active ON rate_cards(is_active) WHERE is_active = true;
CREATE INDEX idx_rate_cards_default ON rate_cards(is_default) WHERE is_default = true;
CREATE INDEX idx_standard_templates_category ON standard_service_templates(service_category);
CREATE INDEX idx_standard_templates_bar ON standard_service_templates(bar_association);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate cards"
  ON rate_cards FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create their own rate cards"
  ON rate_cards FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own rate cards"
  ON rate_cards FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own rate cards"
  ON rate_cards FOR DELETE
  USING (advocate_id = auth.uid());

CREATE POLICY "Anyone can view standard service templates"
  ON standard_service_templates FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_rate_card_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_cards_updated_at
  BEFORE UPDATE ON rate_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_card_timestamp();

CREATE TRIGGER standard_templates_updated_at
  BEFORE UPDATE ON standard_service_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_card_timestamp();

-- ============================================================================
-- SAMPLE DATA - SOUTH AFRICAN LEGAL SERVICE TEMPLATES
-- ============================================================================

INSERT INTO standard_service_templates (
  template_name,
  template_description,
  service_category,
  matter_types,
  default_hourly_rate,
  default_fixed_fee,
  estimated_hours,
  is_system_template,
  bar_association
) VALUES
  -- Consultation Services
  (
    'Initial Consultation',
    'First meeting with instructing attorney to assess brief and provide preliminary advice',
    'consultation',
    ARRAY['civil', 'commercial', 'criminal', 'family', 'labour'],
    2500.00,
    NULL,
    1.5,
    true,
    NULL
  ),
  (
    'Follow-up Consultation',
    'Subsequent consultations for case strategy and updates',
    'consultation',
    ARRAY['civil', 'commercial', 'criminal', 'family', 'labour'],
    2500.00,
    NULL,
    1.0,
    true,
    NULL
  ),
  (
    'Opinion on Brief',
    'Written legal opinion on merits of case',
    'consultation',
    ARRAY['civil', 'commercial', 'criminal'],
    3000.00,
    15000.00,
    5.0,
    true,
    NULL
  ),
  
  -- Research Services
  (
    'Legal Research',
    'Research of relevant legislation, case law, and legal precedents',
    'research',
    ARRAY['civil', 'commercial', 'criminal', 'constitutional'],
    2200.00,
    NULL,
    4.0,
    true,
    NULL
  ),
  (
    'Case Law Analysis',
    'Detailed analysis of applicable case law and precedents',
    'research',
    ARRAY['civil', 'commercial', 'criminal', 'constitutional'],
    2500.00,
    NULL,
    3.0,
    true,
    NULL
  ),
  
  -- Drafting Services
  (
    'Heads of Argument',
    'Preparation of heads of argument for court proceedings',
    'drafting',
    ARRAY['civil', 'commercial', 'criminal', 'constitutional'],
    2800.00,
    NULL,
    8.0,
    true,
    NULL
  ),
  (
    'Notice of Motion',
    'Drafting of notice of motion and supporting affidavits',
    'drafting',
    ARRAY['civil', 'commercial', 'family'],
    2500.00,
    12000.00,
    5.0,
    true,
    NULL
  ),
  (
    'Plea and Particulars',
    'Drafting of plea and particulars to claim',
    'drafting',
    ARRAY['civil', 'commercial'],
    2500.00,
    10000.00,
    4.0,
    true,
    NULL
  ),
  (
    'Founding Affidavit',
    'Preparation of founding affidavit for motion proceedings',
    'drafting',
    ARRAY['civil', 'commercial', 'family', 'labour'],
    2500.00,
    NULL,
    6.0,
    true,
    NULL
  ),
  (
    'Answering Affidavit',
    'Preparation of answering affidavit in opposition',
    'drafting',
    ARRAY['civil', 'commercial', 'family', 'labour'],
    2500.00,
    NULL,
    6.0,
    true,
    NULL
  ),
  
  -- Court Appearance Services
  (
    'High Court Appearance - Full Day',
    'Appearance in High Court proceedings (full day)',
    'court_appearance',
    ARRAY['civil', 'commercial', 'criminal', 'constitutional'],
    NULL,
    25000.00,
    8.0,
    true,
    NULL
  ),
  (
    'High Court Appearance - Half Day',
    'Appearance in High Court proceedings (half day)',
    'court_appearance',
    ARRAY['civil', 'commercial', 'criminal', 'constitutional'],
    NULL,
    15000.00,
    4.0,
    true,
    NULL
  ),
  (
    'Magistrate Court Appearance',
    'Appearance in Magistrate Court proceedings',
    'court_appearance',
    ARRAY['civil', 'criminal', 'family'],
    NULL,
    8000.00,
    4.0,
    true,
    NULL
  ),
  (
    'Application Hearing',
    'Appearance for motion/application hearing',
    'court_appearance',
    ARRAY['civil', 'commercial', 'family', 'labour'],
    NULL,
    12000.00,
    3.0,
    true,
    NULL
  ),
  (
    'Trial Preparation',
    'Preparation for trial including witness preparation',
    'court_appearance',
    ARRAY['civil', 'commercial', 'criminal'],
    2500.00,
    NULL,
    10.0,
    true,
    NULL
  ),
  
  -- Document Review Services
  (
    'Contract Review',
    'Review and analysis of commercial contracts',
    'document_review',
    ARRAY['commercial'],
    2200.00,
    NULL,
    3.0,
    true,
    NULL
  ),
  (
    'Discovery Document Review',
    'Review of discovery documents and evidence',
    'document_review',
    ARRAY['civil', 'commercial', 'criminal'],
    2000.00,
    NULL,
    5.0,
    true,
    NULL
  ),
  
  -- Negotiation Services
  (
    'Settlement Negotiation',
    'Negotiation of settlement terms with opposing counsel',
    'negotiation',
    ARRAY['civil', 'commercial', 'family', 'labour'],
    2500.00,
    NULL,
    3.0,
    true,
    NULL
  ),
  (
    'Mediation Attendance',
    'Attendance at mediation proceedings',
    'negotiation',
    ARRAY['civil', 'commercial', 'family', 'labour'],
    NULL,
    10000.00,
    4.0,
    true,
    NULL
  ),
  
  -- Correspondence Services
  (
    'Legal Correspondence',
    'Preparation of legal correspondence and letters',
    'correspondence',
    ARRAY['civil', 'commercial', 'criminal', 'family', 'labour'],
    2000.00,
    NULL,
    0.5,
    true,
    NULL
  ),
  
  -- Filing Services
  (
    'Court Filing',
    'Filing of court documents and applications',
    'filing',
    ARRAY['civil', 'commercial', 'criminal', 'family', 'labour'],
    1500.00,
    2000.00,
    1.0,
    true,
    NULL
  ),
  
  -- Travel Services
  (
    'Travel Time',
    'Travel time to court or consultations',
    'travel',
    ARRAY['civil', 'commercial', 'criminal', 'family', 'labour'],
    1500.00,
    NULL,
    2.0,
    true,
    NULL
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE rate_cards IS 'Advocate-specific pricing templates for legal services';
COMMENT ON TABLE standard_service_templates IS 'Pre-configured legal service templates for South African advocates';
COMMENT ON COLUMN rate_cards.service_category IS 'Category of legal service (consultation, research, drafting, etc.)';
COMMENT ON COLUMN rate_cards.pricing_type IS 'Type of pricing: hourly, fixed fee, per item, or percentage';
COMMENT ON COLUMN rate_cards.is_default IS 'Whether this is the default rate card for this service category';
COMMENT ON COLUMN standard_service_templates.matter_types IS 'Array of matter types this template applies to';
COMMENT ON COLUMN standard_service_templates.bar_association IS 'Specific bar association if template is region-specific';
