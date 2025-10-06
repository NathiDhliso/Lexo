-- Consolidated Pro Forma Migration
-- Run this in Supabase SQL Editor to ensure all required fields exist
-- This migration is idempotent and can be run multiple times safely

BEGIN;

-- Ensure base table exists with all required fields
DO $$ 
BEGIN
    -- Create enum types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pro_forma_request_status') THEN
        CREATE TYPE pro_forma_request_status AS ENUM ('pending', 'submitted', 'processed', 'declined');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pro_forma_action_type') THEN
        CREATE TYPE pro_forma_action_type AS ENUM ('matter', 'pro_forma');
    END IF;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS pro_forma_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL DEFAULT extensions.uuid_generate_v4()::text,
    status pro_forma_request_status NOT NULL DEFAULT 'pending',
    requested_action pro_forma_action_type,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Add all required fields (idempotent)
DO $$ 
BEGIN
    -- Instructing Attorney fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'instructing_attorney_name') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN instructing_attorney_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'instructing_attorney_firm') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN instructing_attorney_firm TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'instructing_attorney_email') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN instructing_attorney_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'instructing_attorney_phone') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN instructing_attorney_phone TEXT;
    END IF;
    
    -- Client fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'client_name') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN client_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'client_email') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN client_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'client_phone') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN client_phone TEXT;
    END IF;
    
    -- Matter fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'matter_title') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN matter_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'matter_description') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN matter_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'matter_type') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN matter_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'urgency_level') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN urgency_level TEXT;
    END IF;
    
    -- Pro Forma specific fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'fee_narrative') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN fee_narrative TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'total_amount') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN total_amount DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'valid_until') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN valid_until DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'quote_date') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN quote_date DATE;
    END IF;
    
    -- Legacy fields for backward compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'description') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_forma_requests' AND column_name = 'urgency') THEN
        ALTER TABLE pro_forma_requests ADD COLUMN urgency TEXT;
    END IF;
END $$;

-- Create indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_pro_forma_requests_advocate_id_status 
    ON pro_forma_requests(advocate_id, status);

CREATE INDEX IF NOT EXISTS idx_pro_forma_requests_token 
    ON pro_forma_requests(token);

CREATE INDEX IF NOT EXISTS idx_pro_forma_requests_expires_at 
    ON pro_forma_requests(expires_at) 
    WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE pro_forma_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Advocates can manage their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Public can view a pending pro_forma_request form" ON pro_forma_requests;
DROP POLICY IF EXISTS "Public can submit a pending pro_forma_request" ON pro_forma_requests;

-- RLS Policies
CREATE POLICY "Advocates can manage their own pro_forma_requests"
ON pro_forma_requests FOR ALL
USING (auth.uid() = advocate_id);

CREATE POLICY "Public can view a pending pro_forma_request form"
ON pro_forma_requests FOR SELECT
USING (status = 'pending');

CREATE POLICY "Public can submit a pending pro_forma_request"
ON pro_forma_requests FOR UPDATE
USING (status = 'pending')
WITH CHECK (status IN ('pending', 'submitted'));

COMMIT;

-- Verify the schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pro_forma_requests' 
ORDER BY ordinal_position;
