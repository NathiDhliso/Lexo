-- Add matter_type column to proforma_requests table
ALTER TABLE proforma_requests
ADD COLUMN IF NOT EXISTS matter_type TEXT;

-- Add comment
COMMENT ON COLUMN proforma_requests.matter_type IS 'Type of legal matter (civil_litigation, commercial_law, etc.)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_proforma_requests_matter_type ON proforma_requests(matter_type);
