-- Add invitation token columns to firms table
-- This migration adds the necessary columns for attorney invitation workflow
-- Run this in your Supabase SQL Editor

-- Step 1: Add the columns to firms table
ALTER TABLE firms
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_token_used_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Step 2: Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_firms_invitation_token ON firms(invitation_token) 
WHERE invitation_token IS NOT NULL;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN firms.invitation_token IS 'Secure token for attorney invitation links (single-use)';
COMMENT ON COLUMN firms.invitation_token_expires_at IS 'Expiration timestamp for invitation token (default 7 days)';
COMMENT ON COLUMN firms.invitation_token_used_at IS 'Timestamp when token was used for registration';
COMMENT ON COLUMN firms.onboarded_at IS 'Timestamp when attorney completed registration and onboarding';

-- Step 4: Grant necessary permissions
GRANT SELECT, UPDATE ON firms TO authenticated;

-- Verification Queries (run these after the migration)
-- =====================================================

-- 1. Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'firms'
  AND column_name IN ('invitation_token', 'invitation_token_expires_at', 'invitation_token_used_at', 'onboarded_at')
ORDER BY column_name;

-- Expected result: 4 rows showing all four columns

-- 2. Verify index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'firms'
  AND indexname = 'idx_firms_invitation_token';

-- Expected result: 1 row showing the index

-- 3. Check current firms table structure
\d firms;

-- 4. Test that update permissions work (optional - replace with your firm_id)
-- UPDATE firms SET invitation_token = 'test' WHERE id = 'your-firm-id-here';
-- ROLLBACK; -- Don't commit the test
