DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pro_forma_requests' 
        AND column_name = 'requested_action'
    ) THEN
        ALTER TABLE pro_forma_requests 
        ADD COLUMN requested_action pro_forma_action;
    END IF;
END $$;
