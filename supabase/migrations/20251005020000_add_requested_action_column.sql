ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS requested_action pro_forma_action;
