-- ============================================================================
-- APPLY ALL NEW MIGRATIONS
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Public Tokens for Attorney Portal
-- ============================================================================

-- Add public_token to proforma_requests table
ALTER TABLE proforma_requests 
ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid() UNIQUE;

CREATE INDEX IF NOT EXISTS idx_proforma_public_token 
ON proforma_requests(public_token);

-- Add public_token to engagement_agreements table
ALTER TABLE engagement_agreements 
ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid() UNIQUE;

CREATE INDEX IF NOT EXISTS idx_engagement_public_token 
ON engagement_agreements(public_token);

-- Add email tracking columns
ALTER TABLE proforma_requests
ADD COLUMN IF NOT EXISTS link_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS link_sent_to TEXT;

ALTER TABLE engagement_agreements
ADD COLUMN IF NOT EXISTS link_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS link_sent_to TEXT;

-- Function to regenerate public token (for security)
CREATE OR REPLACE FUNCTION regenerate_public_token(
  table_name TEXT,
  record_id UUID
) RETURNS UUID AS $$
DECLARE
  new_token UUID;
BEGIN
  new_token := gen_random_uuid();
  
  IF table_name = 'proforma_requests' THEN
    UPDATE proforma_requests 
    SET public_token = new_token 
    WHERE id = record_id;
  ELSIF table_name = 'engagement_agreements' THEN
    UPDATE engagement_agreements 
    SET public_token = new_token 
    WHERE id = record_id;
  ELSE
    RAISE EXCEPTION 'Invalid table name';
  END IF;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION regenerate_public_token TO authenticated;

COMMENT ON COLUMN proforma_requests.public_token IS 'Unique token for attorney portal access';
COMMENT ON COLUMN engagement_agreements.public_token IS 'Unique token for attorney signing portal access';

-- ============================================================================
-- MIGRATION 2: Partner Approval System
-- ============================================================================

-- Create partner_approvals table
CREATE TABLE IF NOT EXISTS partner_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  comments TEXT,
  checklist JSONB,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add billing_status to matters table
ALTER TABLE matters
ADD COLUMN IF NOT EXISTS billing_status TEXT CHECK (billing_status IN ('pending', 'approved', 'rejected', 'invoiced')) DEFAULT 'pending';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partner_approvals_matter_id ON partner_approvals(matter_id);
CREATE INDEX IF NOT EXISTS idx_partner_approvals_partner_id ON partner_approvals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_approvals_status ON partner_approvals(status);
CREATE INDEX IF NOT EXISTS idx_matters_billing_status ON matters(billing_status);

-- Enable RLS
ALTER TABLE partner_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_approvals (drop if exists first)
DROP POLICY IF EXISTS "Users can view partner approvals" ON partner_approvals;
CREATE POLICY "Users can view partner approvals"
  ON partner_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = partner_approvals.matter_id
      AND m.advocate_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create approvals" ON partner_approvals;
CREATE POLICY "Users can create approvals"
  ON partner_approvals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = partner_approvals.matter_id
      AND m.advocate_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their approvals" ON partner_approvals;
CREATE POLICY "Users can update their approvals"
  ON partner_approvals FOR UPDATE
  USING (partner_id = auth.uid())
  WITH CHECK (partner_id = auth.uid());

-- Function to update matter billing status
CREATE OR REPLACE FUNCTION update_matter_billing_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matters
  SET 
    billing_status = NEW.status,
    updated_at = NOW()
  WHERE id = NEW.matter_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update matter billing status
DROP TRIGGER IF EXISTS trigger_update_matter_billing_status ON partner_approvals;
CREATE TRIGGER trigger_update_matter_billing_status
  AFTER INSERT OR UPDATE OF status ON partner_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_matter_billing_status();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON partner_approvals TO authenticated;

COMMENT ON TABLE partner_approvals IS 'Partner approval records for billing readiness';
COMMENT ON COLUMN matters.billing_status IS 'Current billing approval status';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check public_token columns
SELECT 'Public Tokens Migration' as migration_check;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('proforma_requests', 'engagement_agreements') 
AND column_name IN ('public_token', 'link_sent_at', 'link_sent_to')
ORDER BY table_name, column_name;

-- Check partner_approvals table
SELECT 'Partner Approvals Migration' as migration_check;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'partner_approvals'
ORDER BY ordinal_position;

-- Check billing_status column
SELECT 'Billing Status Column' as migration_check;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matters' 
AND column_name = 'billing_status';

-- Success message
SELECT '✅ All migrations applied successfully!' as status;
