-- Migration to add fields needed for proper Matter and Pro Forma prepopulation
-- This adds the missing fields to the existing pro_forma_requests table

-- Add expires_at field for request expiry management
ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add matter_type and urgency_level fields (from ProFormaRequestPage FormData)
ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS matter_type TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS urgency_level TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- Add Pro Forma specific fields for prepopulation
ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS fee_narrative TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS valid_until DATE;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS quote_date DATE;

-- Add index for expires_at to efficiently query expired requests
CREATE INDEX IF NOT EXISTS idx_pro_forma_requests_expires_at 
ON pro_forma_requests(expires_at) 
WHERE expires_at IS NOT NULL;