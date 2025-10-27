-- ============================================================================
-- Add Billing Model Support - Minimal Migration
-- Only adds what's needed for billing model functionality
-- ============================================================================

-- Create billing model enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE billing_model AS ENUM ('brief-fee', 'time-based', 'quick-opinion');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create primary workflow enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE primary_workflow AS ENUM ('brief-fee', 'mixed', 'time-based');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add billing model columns to matters table if they don't exist
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS billing_model billing_model DEFAULT 'brief-fee' NOT NULL;

ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS agreed_fee DECIMAL(12,2);

ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- Create advocate_billing_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS advocate_billing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advocate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Billing preferences
  default_billing_model billing_model DEFAULT 'brief-fee' NOT NULL,
  primary_workflow primary_workflow DEFAULT 'brief-fee' NOT NULL,
  
  -- Dashboard widget preferences (JSONB array of widget IDs)
  dashboard_widgets JSONB DEFAULT '["active-matters", "pending-invoices", "recent-activity"]'::jsonb NOT NULL,
  
  -- Additional preferences
  show_time_tracking_by_default BOOLEAN DEFAULT false NOT NULL,
  auto_create_milestones BOOLEAN DEFAULT true NOT NULL,
  default_hourly_rate DECIMAL(10,2),
  default_fee_cap DECIMAL(10,2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one preference record per advocate
  CONSTRAINT unique_advocate_preferences UNIQUE (advocate_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_matters_billing_model 
  ON matters(billing_model);

CREATE INDEX IF NOT EXISTS idx_advocate_billing_preferences_advocate_id 
  ON advocate_billing_preferences(advocate_id);

CREATE INDEX IF NOT EXISTS idx_advocate_billing_preferences_workflow 
  ON advocate_billing_preferences(primary_workflow);

-- Add comments for documentation
COMMENT ON COLUMN matters.billing_model IS 'Billing model for this matter: brief-fee, time-based, or quick-opinion';
COMMENT ON COLUMN matters.agreed_fee IS 'Agreed fixed fee amount for brief-fee matters';
COMMENT ON COLUMN matters.hourly_rate IS 'Hourly rate for time-based matters (overrides advocate default)';

COMMENT ON TABLE advocate_billing_preferences IS 'Stores billing preferences for each advocate';
COMMENT ON COLUMN advocate_billing_preferences.default_billing_model IS 'Default billing model for new matters';
COMMENT ON COLUMN advocate_billing_preferences.primary_workflow IS 'Primary workflow preference: brief-fee, mixed, or time-based';

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_advocate_billing_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_advocate_billing_preferences_timestamp ON advocate_billing_preferences;
CREATE TRIGGER update_advocate_billing_preferences_timestamp
  BEFORE UPDATE ON advocate_billing_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_advocate_billing_preferences_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE advocate_billing_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS advocate_view_own_preferences ON advocate_billing_preferences;
DROP POLICY IF EXISTS advocate_update_own_preferences ON advocate_billing_preferences;
DROP POLICY IF EXISTS advocate_insert_own_preferences ON advocate_billing_preferences;
DROP POLICY IF EXISTS service_role_full_access ON advocate_billing_preferences;

-- Policy: Advocates can view their own preferences
CREATE POLICY advocate_view_own_preferences
  ON advocate_billing_preferences
  FOR SELECT
  USING (auth.uid() = advocate_id);

-- Policy: Advocates can update their own preferences
CREATE POLICY advocate_update_own_preferences
  ON advocate_billing_preferences
  FOR UPDATE
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

-- Policy: Advocates can insert their own preferences
CREATE POLICY advocate_insert_own_preferences
  ON advocate_billing_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = advocate_id);

-- Policy: Service role has full access
CREATE POLICY service_role_full_access
  ON advocate_billing_preferences
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON advocate_billing_preferences TO authenticated;
GRANT ALL ON advocate_billing_preferences TO service_role;

-- Grant usage on types
GRANT USAGE ON TYPE billing_model TO authenticated;
GRANT USAGE ON TYPE billing_model TO service_role;
GRANT USAGE ON TYPE primary_workflow TO authenticated;
GRANT USAGE ON TYPE primary_workflow TO service_role;

-- Update existing matters to have default billing model
UPDATE matters 
SET billing_model = 'time-based'
WHERE billing_model IS NULL;

-- Create default preferences for existing advocates
INSERT INTO advocate_billing_preferences (advocate_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT advocate_id FROM advocate_billing_preferences)
ON CONFLICT (advocate_id) DO NOTHING;