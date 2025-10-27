-- ============================================================================
-- Add Billing Model Support to Matters Table
-- Part of Billing Workflow Modernization
-- ============================================================================

-- Create billing model enum
CREATE TYPE billing_model AS ENUM (
  'brief-fee',
  'time-based', 
  'quick-opinion'
);

-- Add billing model columns to matters table
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS billing_model billing_model DEFAULT 'brief-fee' NOT NULL;

-- Add agreed fee column for brief fee matters
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS agreed_fee DECIMAL(12,2);

-- Add hourly rate column for time-based matters  
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- Create index on billing_model for performance
CREATE INDEX IF NOT EXISTS idx_matters_billing_model 
  ON matters(billing_model);

-- Add comments for documentation
COMMENT ON COLUMN matters.billing_model IS 'Billing model for this matter: brief-fee, time-based, or quick-opinion';
COMMENT ON COLUMN matters.agreed_fee IS 'Agreed fixed fee amount for brief-fee matters';
COMMENT ON COLUMN matters.hourly_rate IS 'Hourly rate for time-based matters (overrides advocate default)';

-- Update existing matters to have default billing model
-- This ensures backward compatibility
UPDATE matters 
SET billing_model = 'time-based'
WHERE billing_model IS NULL;

-- Grant permissions
GRANT USAGE ON TYPE billing_model TO authenticated;
GRANT USAGE ON TYPE billing_model TO service_role;

-- Add validation constraint to ensure agreed_fee is set for brief-fee matters
-- Note: This is a soft constraint via application logic rather than database constraint
-- to allow for gradual migration and flexibility

-- Create function to validate billing model data consistency
CREATE OR REPLACE FUNCTION validate_matter_billing_model()
RETURNS TRIGGER AS $$
BEGIN
  -- For brief-fee matters, agreed_fee should be set
  IF NEW.billing_model = 'brief-fee' AND NEW.agreed_fee IS NULL THEN
    RAISE WARNING 'Brief fee matters should have agreed_fee set';
  END IF;
  
  -- For time-based matters, hourly_rate should be set (or use advocate default)
  IF NEW.billing_model = 'time-based' AND NEW.hourly_rate IS NULL THEN
    -- This is acceptable as we can fall back to advocate's default hourly rate
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate billing model data
CREATE TRIGGER validate_billing_model_trigger
  BEFORE INSERT OR UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION validate_matter_billing_model();

-- Update the advocate_billing_preferences table to reference the new enum
-- First, check if the table exists and update it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'advocate_billing_preferences') THEN
    -- Drop the old constraint if it exists
    ALTER TABLE advocate_billing_preferences 
    DROP CONSTRAINT IF EXISTS advocate_billing_preferences_default_billing_model_check;
    
    -- Update the column to use the new enum
    ALTER TABLE advocate_billing_preferences 
    ALTER COLUMN default_billing_model TYPE billing_model 
    USING default_billing_model::text::billing_model;
  END IF;
END $$;

-- Create analytics view for billing model usage
CREATE OR REPLACE VIEW billing_model_analytics AS
SELECT 
  billing_model,
  COUNT(*) as matter_count,
  AVG(agreed_fee) as avg_agreed_fee,
  AVG(hourly_rate) as avg_hourly_rate,
  COUNT(*) FILTER (WHERE status = 'active') as active_matters,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_matters
FROM matters 
WHERE deleted_at IS NULL
GROUP BY billing_model;

-- Grant access to the view
GRANT SELECT ON billing_model_analytics TO authenticated;
GRANT SELECT ON billing_model_analytics TO service_role;

-- Add helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matters_billing_model_status 
  ON matters(billing_model, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_matters_billing_model_advocate 
  ON matters(billing_model, advocate_id) 
  WHERE deleted_at IS NULL;
