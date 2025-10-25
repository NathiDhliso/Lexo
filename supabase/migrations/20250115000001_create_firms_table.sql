-- Create firms table for attorney-first model
-- This table stores instructing law firms that brief advocates

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_firms_email ON firms(email);
CREATE INDEX IF NOT EXISTS idx_firms_status ON firms(status);
CREATE INDEX IF NOT EXISTS idx_firms_firm_name ON firms(firm_name);

-- Add updated_at trigger
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

-- Enable Row Level Security
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for firms
-- Advocates can view all firms (they need to select from them)
CREATE POLICY "Advocates can view all firms"
  ON firms
  FOR SELECT
  TO authenticated
  USING (true);

-- Only system admins can insert/update/delete firms
-- For now, allow authenticated users to manage firms
-- This can be restricted later to specific roles
CREATE POLICY "Authenticated users can insert firms"
  ON firms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update firms"
  ON firms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete firms"
  ON firms
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE firms IS 'Stores instructing law firms that brief advocates for matters';
COMMENT ON COLUMN firms.firm_name IS 'Name of the law firm';
COMMENT ON COLUMN firms.attorney_name IS 'Primary contact attorney at the firm';
COMMENT ON COLUMN firms.practice_number IS 'Attorney practice number';
COMMENT ON COLUMN firms.email IS 'Primary email for the firm (unique)';
COMMENT ON COLUMN firms.status IS 'Active or inactive status';
