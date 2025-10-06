ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_name TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_firm TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_email TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS instructing_attorney_phone TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS matter_title TEXT;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(15,2);

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';

ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS additional_notes TEXT;
