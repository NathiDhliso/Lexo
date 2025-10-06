ALTER TABLE pro_forma_requests 
ALTER COLUMN token DROP DEFAULT;

ALTER TABLE pro_forma_requests 
ALTER COLUMN token SET DEFAULT gen_random_uuid()::text;
