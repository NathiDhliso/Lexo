-- ARCHIVED: Second duplicate billing preferences migration
-- REASON: Consolidated into 20251027153935_create_advocate_billing_preferences_fix.sql
-- DATE ARCHIVED: 2025-01-27

-- Create advocate billing preferences table
-- This migration adds user billing preferences for the billing workflow modernization

-- Create primary workflow enum
CREATE TYPE primary_workflow AS ENUM (
  'brief-fee',
  'mixed',
  'time-based'
);

-- Create advocate billing preferences table
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

-- Create index on advocate_id for fast lookups
CREATE INDEX idx_advocate_billing_preferences_advocate_id 
  ON advocate_billing_preferences(advocate_id);

-- Create index on primary_workflow for analytics
CREATE INDEX idx_advocate_billing_preferences_workflow 
  ON advocate_billing_preferences(primary_workflow);

-- Add comments for documentation
COMMENT ON TABLE advocate_billing_preferences IS 'Stores billing preferences for each advocate';
COMMENT ON COLUMN advocate_billing_preferences.default_billing_model IS 'Default billing model for new matters';
COMMENT ON COLUMN advocate_billing_preferences.primary_workflow IS 'Primary workflow preference: brief-fee, mixed, or time-based';
COMMENT ON COLUMN advocate_billing_preferences.dashboard_widgets IS 'JSON array of dashboard widget IDs to display';
COMMENT ON COLUMN advocate_billing_preferences.show_time_tracking_by_default IS 'Whether to show time tracking widgets by default';
COMMENT ON COLUMN advocate_billing_preferences.auto_create_milestones IS 'Whether to automatically create fee milestones for brief-fee matters';
COMMENT ON COLUMN advocate_billing_preferences.default_hourly_rate IS 'Default hourly rate for time-based matters';
COMMENT ON COLUMN advocate_billing_preferences.default_fee_cap IS 'Default fee cap for time-based matters';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_advocate_billing_preferences_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_advocate_billing_preferences_timestamp
  BEFORE UPDATE ON advocate_billing_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_advocate_billing_preferences_updated_at();

-- Create function to initialize preferences for new advocates
CREATE OR REPLACE FUNCTION initialize_advocate_billing_preferences()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO advocate_billing_preferences (advocate_id)
  VALUES (NEW.id)
  ON CONFLICT (advocate_id) DO NOTHING;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger to initialize preferences when new user is created
-- Note: This assumes auth.users table exists and new advocates are created there
CREATE TRIGGER initialize_billing_preferences_on_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_advocate_billing_preferences();

-- Row Level Security (RLS) Policies
ALTER TABLE advocate_billing_preferences ENABLE ROW LEVEL SECURITY;

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
GRANT USAGE ON TYPE primary_workflow TO authenticated;
GRANT USAGE ON TYPE primary_workflow TO service_role;

-- Create default preferences for existing advocates
-- This will create preferences for any advocates that don't have them yet
INSERT INTO advocate_billing_preferences (advocate_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT advocate_id FROM advocate_billing_preferences)
ON CONFLICT (advocate_id) DO NOTHING;