-- Make attorney fields nullable in proforma_requests table
-- This supports the simplified workflow where advocates generate links
-- and attorneys fill out their details later via the public form

ALTER TABLE proforma_requests 
ALTER COLUMN instructing_attorney_name DROP NOT NULL;

-- Also make work_title nullable since it will be filled by the attorney
ALTER TABLE proforma_requests 
ALTER COLUMN work_title DROP NOT NULL;

-- Update the quote_number to be auto-generated if not provided
ALTER TABLE proforma_requests 
ALTER COLUMN quote_number DROP NOT NULL;

-- Add a default value for quote_number using a function
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('quote_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- Grant permissions on the sequence to authenticated users
GRANT USAGE, SELECT ON SEQUENCE quote_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE quote_number_seq TO service_role;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION generate_quote_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_quote_number() TO service_role;

-- Set default for quote_number
ALTER TABLE proforma_requests 
ALTER COLUMN quote_number SET DEFAULT generate_quote_number();