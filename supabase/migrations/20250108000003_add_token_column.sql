-- Add token column to proforma_requests table
-- This column is needed for generating shareable links for pro forma requests

ALTER TABLE proforma_requests 
ADD COLUMN token TEXT UNIQUE;

-- Create index for faster token lookups
CREATE INDEX idx_proforma_requests_token ON proforma_requests(token);

-- Grant permissions for the token column
GRANT SELECT, UPDATE ON proforma_requests TO authenticated;
GRANT SELECT, UPDATE ON proforma_requests TO service_role;