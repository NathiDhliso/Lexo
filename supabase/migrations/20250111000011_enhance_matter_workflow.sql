-- ============================================================================
-- Enhanced Matter Workflow
-- Addresses workflow disconnect: Rigid "Pro Forma First" mandate
-- ============================================================================

-- Add urgency field to matters for quick brief tracking
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('routine', 'standard', 'urgent', 'emergency')) DEFAULT 'standard';

-- Add creation source to track how matter was created
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS creation_source TEXT CHECK (creation_source IN ('proforma', 'direct', 'brief_upload', 'quick_create')) DEFAULT 'direct';

-- Add quick_create flag for simplified workflow
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS is_quick_create BOOLEAN DEFAULT false;

-- Add parent_matter_id for linking related matters (same case, different briefs)
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS parent_matter_id UUID REFERENCES matters(id) ON DELETE SET NULL;

-- Make source_proforma_id truly optional (it already is, but this makes it explicit)
COMMENT ON COLUMN matters.source_proforma_id IS 'Optional: Links to pro forma if matter was created from one. NULL for direct creation.';
COMMENT ON COLUMN matters.creation_source IS 'Tracks how the matter was created: proforma, direct, brief_upload, or quick_create';
COMMENT ON COLUMN matters.urgency IS 'Matter urgency level for prioritization';
COMMENT ON COLUMN matters.is_quick_create IS 'True if created via quick create workflow (minimal fields)';
COMMENT ON COLUMN matters.parent_matter_id IS 'Optional: Links to parent matter for related cases/briefs';

-- Index for parent matter relationships
CREATE INDEX IF NOT EXISTS idx_matters_parent ON matters(parent_matter_id);
CREATE INDEX IF NOT EXISTS idx_matters_urgency ON matters(urgency);
CREATE INDEX IF NOT EXISTS idx_matters_creation_source ON matters(creation_source);

-- ============================================================================
-- Quick Create Function
-- Allows creating a matter with minimal required fields
-- ============================================================================

CREATE OR REPLACE FUNCTION quick_create_matter(
  p_title TEXT,
  p_client_name TEXT,
  p_instructing_attorney TEXT,
  p_urgency TEXT DEFAULT 'standard',
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_matter_id UUID;
  v_advocate_id UUID;
BEGIN
  v_advocate_id := auth.uid();
  
  IF v_advocate_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO matters (
    advocate_id,
    title,
    client_name,
    instructing_attorney,
    urgency,
    description,
    creation_source,
    is_quick_create,
    status
  ) VALUES (
    v_advocate_id,
    p_title,
    p_client_name,
    p_instructing_attorney,
    p_urgency,
    COALESCE(p_description, 'Quick create - details to be added'),
    'quick_create',
    true,
    'active'
  )
  RETURNING id INTO v_matter_id;
  
  RETURN v_matter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION quick_create_matter TO authenticated;

-- ============================================================================
-- Enhanced Pro Forma Conversion
-- Update to mark matters as proforma-sourced
-- ============================================================================

CREATE OR REPLACE FUNCTION link_converted_matter_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_proforma_id IS NOT NULL THEN
    UPDATE proforma_requests
    SET 
      status = 'converted',
      converted_matter_id = NEW.id
    WHERE id = NEW.source_proforma_id;
    
    UPDATE matters
    SET creation_source = 'proforma'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (drop if exists first)
DROP TRIGGER IF EXISTS link_converted_matter ON matters;
CREATE TRIGGER link_converted_matter
  AFTER INSERT ON matters
  FOR EACH ROW
  WHEN (NEW.source_proforma_id IS NOT NULL)
  EXECUTE FUNCTION link_converted_matter_trigger();

-- ============================================================================
-- Matter Templates for Common Scenarios
-- ============================================================================

CREATE TABLE IF NOT EXISTS matter_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  template_name TEXT NOT NULL,
  template_description TEXT,
  
  -- Template fields
  matter_type TEXT,
  fee_type fee_type DEFAULT 'hourly',
  default_fee DECIMAL(12,2),
  risk_level risk_level DEFAULT 'medium',
  urgency TEXT CHECK (urgency IN ('routine', 'standard', 'urgent', 'emergency')) DEFAULT 'standard',
  
  -- Template metadata
  use_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matter_templates_advocate ON matter_templates(advocate_id);
CREATE INDEX idx_matter_templates_active ON matter_templates(is_active);

ALTER TABLE matter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON matter_templates FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create templates"
  ON matter_templates FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON matter_templates FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON matter_templates FOR DELETE
  USING (advocate_id = auth.uid());

-- Trigger to update timestamp
CREATE TRIGGER update_matter_templates_updated_at
  BEFORE UPDATE ON matter_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE matter_templates IS 'Reusable templates for quick matter creation';
COMMENT ON COLUMN matter_templates.use_count IS 'Number of times this template has been used';

-- ============================================================================
-- Views for Better Matter Management
-- ============================================================================

-- View: Matters with brief count
CREATE OR REPLACE VIEW matters_with_brief_count AS
SELECT 
  m.*,
  COUNT(b.id) as brief_count,
  COUNT(CASE WHEN b.status = 'active' THEN 1 END) as active_brief_count
FROM matters m
LEFT JOIN briefs b ON b.matter_id = m.id AND b.deleted_at IS NULL
GROUP BY m.id;

COMMENT ON VIEW matters_with_brief_count IS 'Matters with count of associated briefs';

-- View: Quick create matters needing completion
CREATE OR REPLACE VIEW incomplete_quick_matters AS
SELECT 
  m.*,
  CASE 
    WHEN m.client_email IS NULL THEN true
    WHEN m.instructing_attorney_email IS NULL THEN true
    WHEN m.matter_type IS NULL THEN true
    WHEN m.fee_type IS NULL THEN true
    ELSE false
  END as needs_completion
FROM matters m
WHERE m.is_quick_create = true
  AND m.deleted_at IS NULL;

COMMENT ON VIEW incomplete_quick_matters IS 'Quick-created matters that need additional details';
